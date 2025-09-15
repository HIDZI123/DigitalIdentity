import { NextRequest, NextResponse } from "next/server";
import { readContract } from "thirdweb";
import { getContractInstance } from "@/lib/blockchain";
import {
  generateDocumentHash,
  bufferToBytes32,
  validateFileType,
  validateFileSize,
} from "@/lib/utils";
import { ApiResponse, VerificationResult } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("document") as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "No file uploaded for verification",
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Validate file type and size
    if (!validateFileType(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type",
        } as ApiResponse,
        { status: 400 }
      );
    }

    if (!validateFileSize(file.size)) {
      return NextResponse.json(
        {
          success: false,
          error: "File size too large",
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Convert file to buffer and generate hash
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const documentHash = generateDocumentHash(fileBuffer);
    const bytes32Hash = bufferToBytes32(documentHash);

    // Check if document exists on blockchain
    const contract = getContractInstance();
    const documentId = await readContract({
      contract,
      method: "function getIdByHash(bytes32 docHash) view returns (uint256)",
      params: [bytes32Hash],
    });

    if (documentId.toString() === "0") {
      return NextResponse.json({
        success: true,
        data: {
          isValid: false,
          hash: documentHash,
        } as VerificationResult,
        message: "Document not found in registry",
      } as ApiResponse<VerificationResult>);
    }

    // Get document details
    const docDetails = await readContract({
      contract,
      method:
        "function getDoc(uint256 id) view returns (bytes32 docHash, uint256 createdAt, bool exists)",
      params: [documentId],
    });

    const response: VerificationResult = {
      isValid: true,
      documentId: documentId.toString(),
      registeredAt: Number(docDetails[1]) * 1000,
      hash: documentHash,
    };

    return NextResponse.json({
      success: true,
      data: response,
      message: "Document verified successfully",
    } as ApiResponse<VerificationResult>);
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      } as ApiResponse,
      { status: 500 }
    );
  }
}
