import { google } from "googleapis";
import { prisma } from "./prisma";
import { env } from "./env";
import { logger } from "./logger";
import { Readable } from "stream";

// Helper to buffer to stream
function bufferToStream(buffer: Buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

/**
 * Initializes an authenticated Google Drive client for a specific user.
 * It retrieves the user's Google access token and refresh token from the database.
 */
async function getDriveClient(userId: string) {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: "google",
    },
  });

  if (!account || !account.access_token) {
    throw new Error("Akun Google belum terhubung atau akses Drive tidak diizinkan.");
  }

  const oAuth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET
  );

  oAuth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: account.expires_at ? account.expires_at * 1000 : null,
  });

  // Automatically handle token refresh & save back to DB if refreshed
  oAuth2Client.on("tokens", async (tokens) => {
    if (tokens.access_token) {
      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || account.refresh_token,
          expires_at: tokens.expiry_date ? Math.floor(tokens.expiry_date / 1000) : null,
        },
      });
      logger.info("Refreshed Google OAuth tokens for user", { userId });
    }
  });

  return google.drive({ version: "v3", auth: oAuth2Client });
}

/**
 * Finds or creates the "NeLK App Data" folder in the user's Google Drive.
 */
async function getOrCreateNelkFolder(drive: any): Promise<string> {
  const folderName = "NeLK App Data";
  
  // Search for the folder
  const res = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
    spaces: "drive",
    fields: "files(id, name)",
  });

  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id;
  }

  // Create folder if it doesn't exist
  const folderMetadata = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
  };

  const folder = await drive.files.create({
    requestBody: folderMetadata,
    fields: "id",
  });

  return folder.data.id;
}

/**
 * Uploads a file to the user's Google Drive inside "NeLK App Data" folder.
 */
export async function uploadToUserDrive(
  userId: string,
  buffer: Buffer,
  originalName: string,
  mimeType: string
) {
  try {
    const drive = await getDriveClient(userId);
    const folderId = await getOrCreateNelkFolder(drive);

    const fileMetadata = {
      name: originalName,
      parents: [folderId],
    };

    const media = {
      mimeType,
      body: bufferToStream(buffer),
    };

    const res = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, name, size",
    });

    logger.info("File uploaded to user GDrive", { userId, fileId: res.data.id });

    return {
      storageKey: `gdrive:${res.data.id}`,
      originalName: originalName,
      mimeType,
      sizeBytes: buffer.byteLength, // Google API might not return size for all uploads immediately
    };
  } catch (error: any) {
    logger.error("Failed to upload to GDrive", error);
    if (error.message?.includes("insufficient Permissions") || error.message?.includes("invalid_grant")) {
      throw new Error("Akses Google Drive ditolak. Silakan putuskan dan hubungkan ulang akun Google Anda di Pengaturan.");
    }
    throw new Error("Gagal mengunggah file ke Google Drive.");
  }
}

/**
 * Reads a file from the user's Google Drive and returns it as a Buffer.
 */
export async function downloadFromUserDrive(userId: string, fileId: string): Promise<Buffer> {
  try {
    const drive = await getDriveClient(userId);
    const res = await drive.files.get(
      { fileId: fileId, alt: "media" },
      { responseType: "arraybuffer" }
    );
    return Buffer.from(res.data as ArrayBuffer);
  } catch (error: any) {
    logger.error("Failed to download from GDrive", error);
    throw new Error("Gagal mengunduh file dari Google Drive.");
  }
}

/**
 * Deletes a file from the user's Google Drive.
 */
export async function deleteFromUserDrive(userId: string, fileId: string): Promise<void> {
  try {
    const drive = await getDriveClient(userId);
    await drive.files.delete({ fileId });
    logger.info("File deleted from user GDrive", { userId, fileId });
  } catch (error: any) {
    logger.error("Failed to delete from GDrive", error);
    // Even if it fails (e.g. user already deleted it manually), we don't block the app.
  }
}
