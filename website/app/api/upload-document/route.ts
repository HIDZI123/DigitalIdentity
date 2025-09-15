import { NextRequest, NextResponse } from "next/server";
import {
  readContract,
  sendTransaction,
  waitForReceipt,
  getContract,
  prepareContractCall,
} from "thirdweb";
import { UTApi } from "uploadthing/server";
import { account, client } from "@/lib/blockchain";
import {
  generateDocumentHash,
  bufferToBytes32,
  validateFileType,
  validateFileSize,
} from "@/lib/utils";
import { ApiResponse, DigitalIdentity } from "@/types";
import { sepolia } from "thirdweb/chains";

// Initialize UploadThing API
const utapi = new UTApi();

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function OPTIONS(request: NextRequest) {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return new NextResponse(null, { status: 204, headers });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("document") as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "No file uploaded",
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Validate file type and size
    if (!validateFileType(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid file type. Only PDF, images, and Word documents are allowed.",
        } as ApiResponse,
        { status: 400 }
      );
    }

    if (!validateFileSize(file.size)) {
      return NextResponse.json(
        {
          success: false,
          error: "File size too large. Maximum 10MB allowed.",
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Generate document hash
    const documentHash = generateDocumentHash(fileBuffer);
    const bytes32Hash = bufferToBytes32(documentHash);

    // Get contract instance
    const contract = getContract({
      client,
      chain: sepolia,
      address: process.env.CONTRACT_ADDRESS as string,
    });

    // Check if document already exists on blockchain
    const isRegistered = await readContract({
      contract,
      method: "function isDocRegistered(bytes32 docHash) view returns (bool)",
      params: [bytes32Hash],
    });

    if (isRegistered) {
      return NextResponse.json(
        {
          success: false,
          error: "Document already registered",
        } as ApiResponse,
        { status: 409 }
      );
    }

    // Upload to UploadThing
    const uploadResponse = await utapi.uploadFiles([file]);

    if (!uploadResponse[0] || uploadResponse[0].error) {
      return NextResponse.json(
        {
          success: false,
          error:
            uploadResponse[0]?.error?.message ||
            "Failed to upload file to UploadThing",
        } as ApiResponse,
        { status: 500 }
      );
    }

    const uploadedFile = uploadResponse[0].data;
    const uploadThingUrl = uploadedFile.ufsUrl;

    // Register on blockchain using Thirdweb v5
    const transaction = prepareContractCall({
      contract,
      method: "function registerDoc(bytes32 docHash)",
      params: [bytes32Hash],
    });

    const result = await sendTransaction({
      transaction,
      account,
    });

    // Wait for transaction receipt
    const receipt = await waitForReceipt({
      client,
      chain: sepolia,
      transactionHash: result.transactionHash,
    });

    // Parse logs to get the registered ID
    let registeredId: string | undefined;
    for (const log of receipt.logs) {
      try {
        // Decode the log using Thirdweb v5 method
        if (log.topics[0] === "0x...") {
          // Replace with actual event topic hash
          // Manual parsing or use a different approach
          // For now, we'll generate an ID based on transaction hash
          registeredId = receipt.transactionHash.slice(2, 10); // Use first 8 chars as ID
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!registeredId) {
      // Fallback: use transaction hash as ID
      registeredId = receipt.transactionHash.slice(2, 10);
    }

    const response: DigitalIdentity = {
      id: registeredId,
      docHash: documentHash,
      createdAt: Date.now(),
      firebaseUrl: uploadThingUrl, // Using UploadThing URL instead of Firebase
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadThingKey: uploadedFile.key, // Store UploadThing key for future operations
    };

    return NextResponse.json(
      {
        success: true,
        data: response,
        message: "Document uploaded and registered successfully",
      } as ApiResponse<DigitalIdentity>,
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      } as ApiResponse,
      { status: 500 }
    );
  }
}
