import crypto from "crypto";

export function generateDocumentHash(fileBuffer: Buffer): string {
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
}

export function bufferToBytes32(hash: string): `0x${string}` {
  return `0x${hash}` as `0x${string}`;
}

export function validateFileType(mimetype: string): boolean {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  return allowedTypes.includes(mimetype);
}

export function validateFileSize(size: number): boolean {
  const maxSize = parseInt(process.env.MAX_FILE_SIZE || "10485760"); // 10MB default
  return size <= maxSize;
}
