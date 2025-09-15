import { NextRequest, NextResponse } from "next/server";
import { readContract } from "thirdweb";
import { getContractInstance } from "@/lib/blockchain";
import { ApiResponse, DigitalIdentity } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid document ID",
        } as ApiResponse,
        { status: 400 }
      );
    }

    const contract = getContractInstance();
    const result = await readContract({
      contract,
      method:
        "function getDoc(uint256 id) view returns (bytes32 docHash, uint256 createdAt, bool exists)",
      params: [BigInt(id)],
    });

    if (!result[2]) {
      // exists field
      return NextResponse.json(
        {
          success: false,
          error: "Document not found",
        } as ApiResponse,
        { status: 404 }
      );
    }

    const response: Partial<DigitalIdentity> = {
      id: id,
      docHash: result[0].replace("0x", ""),
      createdAt: Number(result[1]) * 1000, // Convert to milliseconds
    };

    return NextResponse.json({
      success: true,
      data: response,
    } as ApiResponse<Partial<DigitalIdentity>>);
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
