import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";
import multer from "multer";
import { Readable } from "stream";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Google Drive Setup
  const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
    key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: SCOPES
  });

  const drive = google.drive({ version: "v3", auth });

  // Multer for file uploads
  const upload = multer({ storage: multer.memoryStorage() });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Upload to Google Drive
  app.post("/api/drive/upload", upload.single("file"), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
      
      const fileMetadata = {
        name: req.file.originalname,
        parents: folderId ? [folderId] : [],
      };

      const media = {
        mimeType: req.file.mimetype,
        body: Readable.from(req.file.buffer),
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id, webContentLink, webViewLink, thumbnailLink",
      });

      // Make file public (optional, but needed for direct streaming/viewing)
      await drive.permissions.create({
        fileId: response.data.id!,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });

      res.json(response.data);
    } catch (error: any) {
      console.error("Drive upload error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get File Details
  app.get("/api/drive/files/:fileId", async (req, res) => {
    try {
      const response = await drive.files.get({
        fileId: req.params.fileId,
        fields: "id, name, mimeType, webContentLink, webViewLink, thumbnailLink",
      });
      res.json(response.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
