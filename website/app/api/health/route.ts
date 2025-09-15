import { NextRequest, NextResponse } from "next/server";
import { readContract } from "thirdweb";
import { getContractInstance } from "@/lib/blockchain";
import { UTApi } from "uploadthing/server";
import { ApiResponse, HealthStatus } from "@/types";

// Initialize UploadThing API
const utapi = new UTApi();

export async function GET(request: NextRequest) {
  try {
    // Test blockchain connection
    let blockchainStatus = false;
    let totalDocs = 0;

    try {
      const contract = getContractInstance();
      const total = await readContract({
        contract,
        method: "function getTotalRegistered() view returns (uint256)",
        params: [],
      });
      totalDocs = Number(total);
      blockchainStatus = true;
    } catch (error) {
      console.error("Blockchain health check failed:", error);
    }

    // Test UploadThing connection
    let uploadThingStatus = false;
    try {
      // Simple check - try to list files (with limit to avoid performance issues)
      await utapi.listFiles({ limit: 1 });
      uploadThingStatus = true;
    } catch (error) {
      console.error("UploadThing health check failed:", error);
    }

    const healthData: HealthStatus = {
      status: blockchainStatus && uploadThingStatus ? "healthy" : "degraded",
      blockchain: blockchainStatus,
      firebase: uploadThingStatus, // Keep the same property name for backward compatibility
      timestamp: Date.now(),
      totalDocuments: totalDocs,
    };

    const statusCode = healthData.status === "healthy" ? 200 : 503;

    return NextResponse.json(
      {
        success: true,
        data: healthData,
      } as ApiResponse<HealthStatus>,
      { status: statusCode }
    );
  } catch (error: any) {
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      } as ApiResponse,
      { status: 500 }
    );
  }
}
