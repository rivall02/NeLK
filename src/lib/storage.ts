import { writeFile, unlink, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join, extname } from "path";
import { randomUUID, createHash } from "crypto";
import { env } from "./env";
import { logger } from "./logger";

export interface StoredFileMetadata {
  storageKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url?: string;
}

export interface StorageProvider {
  saveFile(buffer: Buffer, originalName: string, mimeType: string): Promise<StoredFileMetadata>;
  readFile(storageKey: string): Promise<Buffer>;
  deleteFile(storageKey: string): Promise<void>;
  fileExists(storageKey: string): Promise<boolean>;
}

// Allowed MIME types and corresponding valid extensions
const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "text/plain": [".txt", ".text"],
  "text/markdown": [".md", ".markdown"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/msword": [".doc"],
  // Image types for AI vision extraction
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/jpg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
  "image/bmp": [".bmp"],
  "image/tiff": [".tiff", ".tif"],
};

export class LocalSecureStorageProvider implements StorageProvider {
  private baseDir: string;

  constructor(baseDir?: string) {
    // Resolve statically scoped absolute path outside public/
    this.baseDir = baseDir
      ? join(process.cwd(), "storage", baseDir)
      : join(process.cwd(), "storage", "documents");
  }

  private async ensureDir() {
    if (!existsSync(this.baseDir)) {
      await mkdir(this.baseDir, { recursive: true });
    }
  }

  private sanitizeFilename(name: string): string {
    return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  }

  async saveFile(buffer: Buffer, originalName: string, mimeType: string): Promise<StoredFileMetadata> {
    await this.ensureDir();

    // 1. Check size limit
    if (buffer.byteLength > env.MAX_FILE_SIZE_BYTES) {
      throw new Error(
        `Ukuran file melebihi batas maksimum (${Math.round(env.MAX_FILE_SIZE_BYTES / (1024 * 1024))}MB).`
      );
    }

    // 2. Validate MIME type
    const normalizedMime = mimeType.toLowerCase();
    const allowedExts = ALLOWED_MIME_TYPES[normalizedMime];
    if (!allowedExts) {
      throw new Error(
        `Tipe file "${mimeType}" tidak didukung. Format yang didukung: PDF, TXT, MD, DOCX, PNG, JPG, WEBP.`
      );
    }

    // 3. Validate file extension matches MIME type
    const rawExt = extname(originalName).toLowerCase();
    if (!allowedExts.includes(rawExt)) {
      throw new Error(
        `Ekstensi file "${rawExt}" tidak sesuai dengan tipe file (${mimeType}).`
      );
    }

    // 4. Generate unpredictable cryptographic random key
    const randomKey = randomUUID();
    const contentHash = createHash("sha256").update(buffer).digest("hex").slice(0, 12);
    const storageKey = `${randomKey}-${contentHash}${rawExt}`;
    const destinationPath = join(this.baseDir, storageKey);

    await writeFile(destinationPath, buffer);

    logger.info("File securely stored", {
      storageKey,
      size: buffer.byteLength,
      mimeType: normalizedMime,
    });

    return {
      storageKey,
      originalName: this.sanitizeFilename(originalName),
      mimeType: normalizedMime,
      sizeBytes: buffer.byteLength,
    };
  }

  async readFile(storageKey: string): Promise<Buffer> {
    // Prevent directory traversal
    const safeKey = storageKey.replace(/(\.\.[\/\\])/g, "");
    const filePath = join(this.baseDir, safeKey);

    if (!existsSync(filePath)) {
      throw new Error("File tidak ditemukan di penyimpanan.");
    }

    return await readFile(filePath);
  }

  async deleteFile(storageKey: string): Promise<void> {
    try {
      const safeKey = storageKey.replace(/(\.\.[\/\\])/g, "");
      const filePath = join(this.baseDir, safeKey);
      if (existsSync(filePath)) {
        await unlink(filePath);
        logger.info("File deleted from storage", { storageKey: safeKey });
      }
    } catch (err) {
      logger.error("Failed to delete file from storage", err, { storageKey });
    }
  }

  async fileExists(storageKey: string): Promise<boolean> {
    const safeKey = storageKey.replace(/(\.\.[\/\\])/g, "");
    return existsSync(join(this.baseDir, safeKey));
  }
}

// Vercel Blob Storage Provider - for serverless deployment
export class VercelBlobStorageProvider implements StorageProvider {
  private blobToken: string;

  constructor() {
    this.blobToken = process.env.BLOB_READ_WRITE_TOKEN || "";
  }

  private getBlobUrl(): string {
    return `https://${process.env.BLOB_STORE_ID || "store"}.blob.vercel-storage.com`;
  }

  async saveFile(buffer: Buffer, originalName: string, mimeType: string): Promise<StoredFileMetadata> {
    if (!this.blobToken) {
      throw new Error("BLOB_READ_WRITE_TOKEN environment variable is not set.");
    }

    // 1. Check size limit
    if (buffer.byteLength > env.MAX_FILE_SIZE_BYTES) {
      throw new Error(
        `Ukuran file melebihi batas maksimum (${Math.round(env.MAX_FILE_SIZE_BYTES / (1024 * 1024))}MB).`
      );
    }

    // 2. Validate MIME type
    const normalizedMime = mimeType.toLowerCase();
    const allowedExts = ALLOWED_MIME_TYPES[normalizedMime];
    if (!allowedExts) {
      throw new Error(
        `Tipe file "${mimeType}" tidak didukung. Format yang didukung: PDF, TXT, MD, DOCX, PNG, JPG, WEBP.`
      );
    }

    // 3. Validate file extension
    const rawExt = extname(originalName).toLowerCase();
    if (!allowedExts.includes(rawExt)) {
      throw new Error(
        `Ekstensi file "${rawExt}" tidak sesuai dengan tipe file (${mimeType}).`
      );
    }

    // 4. Generate unique filename
    const randomKey = randomUUID();
    const contentHash = createHash("sha256").update(buffer).digest("hex").slice(0, 12);
    const safeName = originalName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const storageKey = `${randomKey}-${contentHash}-${safeName}`;

    // 5. Upload to Vercel Blob
    const uploadUrl = `${this.getBlobUrl()}/${storageKey}`;
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${this.blobToken}`,
        "Content-Type": mimeType,
        "x-content-type": mimeType,
      },
      body: new Uint8Array(buffer),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to upload to Vercel Blob: ${response.status} ${errorText}`);
    }

    const url = response.url || uploadUrl;

    logger.info("File stored in Vercel Blob", {
      storageKey,
      size: buffer.byteLength,
      mimeType: normalizedMime,
      url,
    });

    return {
      storageKey,
      originalName: originalName.replace(/[^a-zA-Z0-9.\-_]/g, "_"),
      mimeType: normalizedMime,
      sizeBytes: buffer.byteLength,
      url,
    };
  }

  async readFile(storageKey: string): Promise<Buffer> {
    if (!this.blobToken) {
      throw new Error("BLOB_READ_WRITE_TOKEN environment variable is not set.");
    }

    // If storageKey is a URL, extract the path
    let url = storageKey;
    if (storageKey.startsWith("http")) {
      url = storageKey;
    } else {
      url = `${this.getBlobUrl()}/${storageKey}`;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.blobToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to read from Vercel Blob: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async deleteFile(storageKey: string): Promise<void> {
    if (!this.blobToken) {
      throw new Error("BLOB_READ_WRITE_TOKEN environment variable is not set.");
    }

    try {
      let url = storageKey;
      if (!storageKey.startsWith("http")) {
        url = `${this.getBlobUrl()}/${storageKey}`;
      }

      await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.blobToken}`,
        },
      });

      logger.info("File deleted from Vercel Blob", { storageKey });
    } catch (err) {
      logger.error("Failed to delete from Vercel Blob", err, { storageKey });
    }
  }

  async fileExists(storageKey: string): Promise<boolean> {
    if (!this.blobToken) return false;

    try {
      let url = storageKey;
      if (!storageKey.startsWith("http")) {
        url = `${this.getBlobUrl()}/${storageKey}`;
      }

      const response = await fetch(url, {
        method: "HEAD",
        headers: {
          Authorization: `Bearer ${this.blobToken}`,
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}

// Export singleton instance - use Vercel Blob if token is set, otherwise local
function createStorageService(): StorageProvider {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    logger.info("Using Vercel Blob storage");
    return new VercelBlobStorageProvider();
  }

  // Check if running on Vercel (VERCEL=1) but no blob token
  if (process.env.VERCEL === "1" && !process.env.BLOB_READ_WRITE_TOKEN) {
    logger.warn(
      "Running on Vercel without BLOB_READ_WRITE_TOKEN. " +
      "Set BLOB_READ_WRITE_TOKEN environment variable to enable file uploads. " +
      "Falling back to local storage which may not work on serverless."
    );
  }

  return new LocalSecureStorageProvider();
}

export const storageService = createStorageService();
