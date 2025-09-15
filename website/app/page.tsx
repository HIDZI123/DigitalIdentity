"use client";
import { UploadButton } from "@/lib/uploadthing";

export default function Home() {
  return (
    <main
      className="p-4 flex flex-col w-full h-full justify-center items-center"
      style={{ padding: "2rem", fontFamily: "system-ui" }}
    >
      <h1>Digital Identity API</h1>
      <p>Your blockchain-based document verification system is running!</p>

      <div className="mt-8" style={{ marginTop: "2rem" }}>
        <h2>Available Endpoints:</h2>
        <ul>
          <li>
            <code>POST /api/upload-document</code> - Upload and register
            documents
          </li>
          <li>
            <code>GET /api/get-document/[id]</code> - Retrieve document by ID
          </li>
          <li>
            <code>POST /api/verify-document</code> - Verify document
            authenticity
          </li>
          <li>
            <code>GET /api/list-documents</code> - List all documents
          </li>
          <li>
            <code>GET /api/health</code> - System health check
          </li>
        </ul>
      </div>

      <div className="mt-8" style={{ marginTop: "2rem" }}>
        <h2 className="mb-4 p-4">Quick Test:</h2>
        <a
          href="/api/health"
          target="_blank"
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Check System Health
        </a>
      </div>

      <UploadButton
        className="mt-8"
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          // Do something with the response
          console.log("Files: ", res);
          alert("Upload Completed");
        }}
        onUploadError={(error: Error) => {
          // Do something with the error.
          alert(`ERROR! ${error.message}`);
        }}
      />
    </main>
  );
}
