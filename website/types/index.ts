export interface DigitalIdentity {
  id: string;
  docHash: string;
  createdAt: number;
  firebaseUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadThingKey?: string; // Add this for UploadThing key
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface VerificationResult {
  isValid: boolean;
  documentId?: string;
  registeredAt?: number;
  hash: string;
}

export interface DocumentSummary {
  id: string;
  docHash: string;
  createdAt: number;
}

export interface HealthStatus {
  status: string;
  blockchain: boolean;
  firebase: boolean;
  timestamp: number;
  totalDocuments: number;
}
