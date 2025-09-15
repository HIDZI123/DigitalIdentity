"use client";
import { useState } from "react";

interface TestResult {
  endpoint: string;
  status: number;
  response: any;
  error?: string;
}

export default function TestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const addResult = (result: TestResult) => {
    setResults((prev) => [result, ...prev]);
  };

  const testHealthEndpoint = async () => {
    setLoading("health");
    try {
      const response = await fetch("/api/health");
      const data = await response.json();
      addResult({
        endpoint: "GET /api/health",
        status: response.status,
        response: data,
      });
    } catch (error: any) {
      addResult({
        endpoint: "GET /api/health",
        status: 0,
        response: null,
        error: error.message,
      });
    }
    setLoading(null);
  };

  const testUploadDocument = async () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    setLoading("upload");
    try {
      const formData = new FormData();
      formData.append("document", selectedFile);

      const response = await fetch("/api/upload-document", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      addResult({
        endpoint: "POST /api/upload-document",
        status: response.status,
        response: data,
      });
    } catch (error: any) {
      addResult({
        endpoint: "POST /api/upload-document",
        status: 0,
        response: null,
        error: error.message,
      });
    }
    setLoading(null);
  };

  const testGetDocument = async () => {
    const docId = prompt("Enter document ID:");
    if (!docId) return;

    setLoading("get");
    try {
      const response = await fetch(`/api/get-document/${docId}`);
      const data = await response.json();
      addResult({
        endpoint: `GET /api/get-document/${docId}`,
        status: response.status,
        response: data,
      });
    } catch (error: any) {
      addResult({
        endpoint: `GET /api/get-document/${docId}`,
        status: 0,
        response: null,
        error: error.message,
      });
    }
    setLoading(null);
  };

  const testVerifyDocument = async () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    setLoading("verify");
    try {
      const formData = new FormData();
      formData.append("document", selectedFile);

      const response = await fetch("/api/verify-document", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      addResult({
        endpoint: "POST /api/verify-document",
        status: response.status,
        response: data,
      });
    } catch (error: any) {
      addResult({
        endpoint: "POST /api/verify-document",
        status: 0,
        response: null,
        error: error.message,
      });
    }
    setLoading(null);
  };

  const testListDocuments = async () => {
    setLoading("list");
    try {
      const response = await fetch("/api/list-documents");
      const data = await response.json();
      addResult({
        endpoint: "GET /api/list-documents",
        status: response.status,
        response: data,
      });
    } catch (error: any) {
      addResult({
        endpoint: "GET /api/list-documents",
        status: 0,
        response: null,
        error: error.message,
      });
    }
    setLoading(null);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">API Endpoints Testing</h1>

      {/* File Selection */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">File Selection</h2>
        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          className="mb-2 cursor-pointer"
        />
        {selectedFile && (
          <p className="text-sm text-gray-600">
            Selected: {selectedFile.name} (
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      {/* Test Buttons */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-3 gap-4">
        <button
          onClick={testHealthEndpoint}
          disabled={loading === "health"}
          className="bg-blue-500 text-white p-3 rounded disabled:opacity-50"
        >
          {loading === "health" ? "Testing..." : "Test Health"}
        </button>

        <button
          onClick={testUploadDocument}
          disabled={loading === "upload" || !selectedFile}
          className="bg-green-500 text-white p-3 rounded disabled:opacity-50"
        >
          {loading === "upload" ? "Uploading..." : "Test Upload"}
        </button>

        <button
          onClick={testGetDocument}
          disabled={loading === "get"}
          className="bg-yellow-500 text-white p-3 rounded disabled:opacity-50"
        >
          {loading === "get" ? "Getting..." : "Test Get Document"}
        </button>

        <button
          onClick={testVerifyDocument}
          disabled={loading === "verify" || !selectedFile}
          className="bg-purple-500 text-white p-3 rounded disabled:opacity-50"
        >
          {loading === "verify" ? "Verifying..." : "Test Verify"}
        </button>

        <button
          onClick={testListDocuments}
          disabled={loading === "list"}
          className="bg-indigo-500 text-white p-3 rounded disabled:opacity-50"
        >
          {loading === "list" ? "Listing..." : "Test List"}
        </button>

        <button
          onClick={clearResults}
          className="bg-red-500 text-white p-3 rounded"
        >
          Clear Results
        </button>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Test Results</h2>
        {results.length === 0 && (
          <p className="text-gray-900">
            No tests run yet. Click the buttons above to test your endpoints.
          </p>
        )}
        {results.map((result, index) => (
          <div key={index} className="border rounded p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{result.endpoint}</h3>
              <span
                className={`px-2 py-1 rounded text-sm ${
                  result.status >= 200 && result.status < 300
                    ? "bg-green-100 text-green-800"
                    : result.status >= 400
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                Status: {result.status}
              </span>
            </div>
            {result.error && (
              <div className="mb-2 p-2 bg-red-50 border-l-4 border-red-400">
                <p className="text-red-700">Error: {result.error}</p>
              </div>
            )}
            <pre className="bg-gray-900 p-3 rounded overflow-auto text-sm">
              {JSON.stringify(result.response, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
