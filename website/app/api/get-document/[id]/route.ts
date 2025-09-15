import { NextRequest, NextResponse } from "next/server";
import { readContract, getContract } from "thirdweb";
import { client } from "@/lib/blockchain";
import { UTApi } from "uploadthing/server";
import { ApiResponse, DigitalIdentity } from "@/types";
import { sepolia } from "thirdweb/chains";

// Initialize UploadThing API
const utapi = new UTApi();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params in Next.js 15
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Document ID is required",
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Get contract instance
    const contract = getContract({
      client,
      chain: sepolia,
      address: process.env.CONTRACT_ADDRESS as string,
    });

    try {
      const response: DigitalIdentity = {
        id: id,
        docHash: "", // You'll need to retrieve this from your storage
        createdAt: Date.now(),
        firebaseUrl: "", // Retrieved from UploadThing
        fileName: "",
        fileSize: 0,
        mimeType: "",
        uploadThingKey: "",
      };

      return NextResponse.json(
        {
          success: true,
          data: response,
          message: "Document retrieved successfully",
        } as ApiResponse<DigitalIdentity>,
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Document not found",
        } as ApiResponse,
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error("Get document error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      } as ApiResponse,
      { status: 500 }
    );
  }
}
