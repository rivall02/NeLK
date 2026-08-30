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
        `Tipe file "${mimeType}" tidak didukung. Format yang didukung: PDF, TXT, MD, DOCX.`
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

// Export singleton instance
export const storageService = new LocalSecureStorageProvider();
