import { NextRequest, NextResponse } from "next/server";
import { readContract } from "thirdweb";
import { getContractInstance } from "@/lib/blockchain";
import { ApiResponse, DocumentSummary } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100); // Max 100 per page

    const contract = getContractInstance();
    const totalDocs = await readContract({
      contract,
      method: "function getTotalRegistered() view returns (uint256)",
      params: [],
    });

    const total = Number(totalDocs);
    const startIndex = (page - 1) * limit + 1;
    const endIndex = Math.min(startIndex + limit - 1, total);

    const documents: DocumentSummary[] = [];

    // Fetch documents with pagination
    for (let i = startIndex; i <= endIndex; i++) {
      try {
        const docDetails = await readContract({
          contract,
          method:
            "function getDoc(uint256 id) view returns (bytes32 docHash, uint256 createdAt, bool exists)",
          params: [BigInt(i)],
        });

        if (docDetails[2]) {
          // exists field
          documents.push({
            id: i.toString(),
            docHash: docDetails[0].replace("0x", ""),
            createdAt: Number(docDetails[1]) * 1000,
          });
        }
      } catch (error) {
        console.error(`Error fetching document ${i}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      data: documents,
      message: `Found ${documents.length} documents (page ${page}/${Math.ceil(
        total / limit
      )})`,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: endIndex < total,
        hasPrev: page > 1,
      },
    } as ApiResponse<DocumentSummary[]>);
  } catch (error: any) {
    console.error("List documents error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      } as ApiResponse,
      { status: 500 }
    );
  }
}
