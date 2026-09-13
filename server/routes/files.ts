import express, { Request, Response } from "express";
import multer from "multer";
import crypto from "crypto";
import SecureFile from "../models/securefile";
import User from "../models/user";
import { getMasterKey } from "../lib/keyManager";
import { imageMimeTypes, audioMimeTypes } from "../consts";
import { Jimp, JimpMime, rgbaToInt } from "jimp";
import { spawn } from "child_process";
import path from "path";
import fs from "fs/promises";
import os from "os";

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Generate Cover Art using local text-to-image AI model (100% Offline)
router.get("/generate-cover", async (req: Request, res: Response) => {
  try {
    const { trackName } = req.query;
    if (!trackName || typeof trackName !== "string") {
      return res.status(400).send("trackName is required");
    }

    console.log(`Generating image for: ${trackName}`);
    const prompt = `16 bit retro pixel art cover for a song named ${trackName}, dark background, colorful symmetric design`;
    
    const trackHash = crypto.createHash('md5').update(trackName).digest('hex');
    const outputPath = path.join(__dirname, "..", "cache", `${trackHash}.jpg`);
    
    try {
       // Check if cached image exists
       await fs.access(outputPath);
       console.log(`Serving cached cover art for ${trackName}`);
       const buffer = await fs.readFile(outputPath);
       res.set("Cache-Control", "public, max-age=31536000");
       res.set("Content-Type", "image/jpeg");
       return res.send(buffer);
    } catch {
       // Not cached, generate it
    }

    // Generate image using local Python PyTorch scaffold
    const pythonExecutable = path.join(__dirname, "..", "python_ai", "venv", "Scripts", "python.exe");
    const scriptPath = path.join(__dirname, "..", "python_ai", "generate.py");

    try {
      console.log(`Executing python generation for ${trackName}...`);
      await new Promise<void>((resolve, reject) => {
         const pyProcess = spawn(pythonExecutable, [scriptPath, prompt, outputPath]);
         
         // Stream logs directly to terminal so user can see generation steps
         pyProcess.stdout.pipe(process.stdout);
         pyProcess.stderr.pipe(process.stderr);
         
         pyProcess.on('close', (code) => {
             if (code === 0) resolve();
             else reject(new Error(`Python process exited with code ${code}`));
         });
      });
      
      const buffer = await fs.readFile(outputPath);
      
      res.set("Cache-Control", "public, max-age=31536000");
      res.set("Content-Type", "image/jpeg");
      return res.send(buffer);
    } catch(err) {
       console.error("Python Model Error:", err);
       throw new Error("Python local model failed to generate image");
    }
  } catch (error) {
    console.error("Local Gen Error:", error);
    // Fallback to procedural SVG if AI fails or errors
    let hash = 0;
    const trackNameStr = (req.query.trackName as string) || "Unknown";
    for (let i = 0; i < trackNameStr.length; i++) {
      hash = trackNameStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const r = () => {
      hash = Math.sin(hash) * 10000;
      return hash - Math.floor(hash);
    };

    const hue1 = Math.floor(r() * 360);
    const hue2 = (hue1 + 180) % 360;
    const bg = `hsl(${hue1}, 20%, 15%)`;
    const fg1 = `hsl(${hue1}, 80%, 60%)`;
    const fg2 = `hsl(${hue2}, 80%, 60%)`;

    const size = 256;
    const grid = 8;
    const pixelSize = size / grid;

    let rects = "";
    for (let x = 0; x < grid / 2; x++) {
      for (let y = 0; y < grid; y++) {
        if (r() > 0.5) {
          const color = r() > 0.5 ? fg1 : fg2;
          rects += `<rect x="${x * pixelSize}" y="${y * pixelSize}" width="${pixelSize}" height="${pixelSize}" fill="${color}" />`;
          rects += `<rect x="${(grid - 1 - x) * pixelSize}" y="${y * pixelSize}" width="${pixelSize}" height="${pixelSize}" fill="${color}" />`;
        }
      }
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="${bg}" />${rects}</svg>`;

    res.set("Cache-Control", "public, max-age=31536000");
    res.set("Content-Type", "image/svg+xml");
    res.send(svg);
  }
});

// Get files by type, but not content
router.get("/get/:type/:userId", (req: Request, res: Response) => {
  const params = req.params;
  const type = params.type;
  const userId = params.userId;
  let mimeTypes;
  if (
    type !== "image" &&
    type !== "video" &&
    type !== "recording" &&
    type !== "audio" &&
    type !== "text"
  ) {
    return res.status(400).json({ message: "Invalid type" });
  }

  if (type === "image") {
    mimeTypes = imageMimeTypes;
  } else if (type === "audio") {
    mimeTypes = audioMimeTypes;
  }

  SecureFile.find(
    { type: { $in: mimeTypes }, userId, isDeleted: { $ne: true } },
    { _id: 1, filename: 1, uploadedAt: 1, size: 1, type: 1, isFavorite: 1, updatedAt: 1 }
  )
    .lean()
    .then((files) => {
      const filesWithoutContent = files.map((file) => {
        const { _id, ...rest } = file;
        const newFile = {
          id: _id,
          ...rest,
        };
        return newFile;
      });
      res.json(filesWithoutContent);
    })
    .catch((error) => {
      res.status(500).json({ message: (error as Error).message });
    });
});

router.get(
  "/download/:type/:id/:userId",
  async (req: Request, res: Response) => {
    try {
      const file = await SecureFile.findOne({
        _id: req.params.id,
        userId: req.params.userId,
        isDeleted: { $ne: true },
      });

      let encoding: BufferEncoding = "utf-8";

      if (req.params.type === "image" || req.params.type === "audio") {
        encoding = "base64";
      }

      if (!file) {
        return res.status(404).send("File not found or not authorized.");
      }

      const user = await User.findOne({ username: req.params.userId });
      if (!user) {
        return res.status(404).send("User not found.");
      }

      const masterKeyHex = getMasterKey();

      const hash = crypto.createHash("sha256");
      hash.update(masterKeyHex + user.hashedPassword);
      const kek = hash.digest();

      const encryptedKey = Buffer.from(file.encryptedKey, "hex");
      const keyIv = Buffer.from(file.keyIv, "hex");
      const keyAuthTag = Buffer.from(file.keyAuthTag, "hex");

      // Decrypt the DEK
      const keyDecipher = crypto.createDecipheriv("aes-256-gcm", kek, keyIv);
      keyDecipher.setAuthTag(keyAuthTag);
      let dek = keyDecipher.update(encryptedKey);
      dek = Buffer.concat([dek, keyDecipher.final()]);

      const fileIv = Buffer.from(file.fileIv, "hex");
      const fileAuthTag = Buffer.from(file.fileAuthTag, "hex");

      // Decrypt the file content
      const fileDecipher = crypto.createDecipheriv("aes-256-gcm", dek, fileIv);
      fileDecipher.setAuthTag(fileAuthTag);
      let decrypted = fileDecipher.update(file.content);
      decrypted = Buffer.concat([decrypted, fileDecipher.final()]);

      res.status(200).send({
        uploadedAt: file.uploadedAt,
        filename: file.filename,
        type: file.type,
        size: file.size,
        content: decrypted.toString(encoding),
      });
    } catch (error) {
      res.status(500).send("Error retrieving file.");
    }
  }
);

// Encrypt and save the file
router.post(
  "/upload/:userId",
  upload.array("files"),
  async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files) {
        res.status(400).send("No files were uploaded.");
        return;
      }

      const user = await User.findOne({ username: req.params.userId });
      if (!user) {
        return res.status(404).send("User not found.");
      }

      const masterKeyHex = getMasterKey();

      const hash = crypto.createHash("sha256");
      hash.update(masterKeyHex + user.hashedPassword);
      const kek = hash.digest();

      const promises = files.map((file) => {
        const { originalname, mimetype, size, buffer } = file;

        const fileKey = crypto.randomBytes(32); // DEK
        const fileIv = crypto.randomBytes(16);

        // Encrypt the file content
        const fileCipher = crypto.createCipheriv("aes-256-gcm", fileKey, fileIv);
        let encryptedContent = fileCipher.update(buffer);
        encryptedContent = Buffer.concat([encryptedContent, fileCipher.final()]);
        const fileAuthTag = fileCipher.getAuthTag();

        const keyIv = crypto.randomBytes(16);

        // Encrypt the DEK
        const keyCipher = crypto.createCipheriv("aes-256-gcm", kek, keyIv);
        let encryptedKeyBuffer = keyCipher.update(fileKey);
        encryptedKeyBuffer = Buffer.concat([encryptedKeyBuffer, keyCipher.final()]);
        const keyAuthTag = keyCipher.getAuthTag();

        // Create a new file document
        const newFile = new SecureFile({
          userId: req.params.userId,
          filename: originalname,
          type: mimetype,
          size: size,
          content: encryptedContent,
          encryptedKey: encryptedKeyBuffer.toString("hex"),
          keyIv: keyIv.toString("hex"),
          keyAuthTag: keyAuthTag.toString("hex"),
          fileIv: fileIv.toString("hex"),
          fileAuthTag: fileAuthTag.toString("hex"),
          uploadedAt: Date.now(),
          isFavorite: false,
        });

        return newFile.save();
      });

      await Promise.all(promises);
      res.status(200).send("File(s) uploaded and encrypted successfully.");
    } catch (error) {
      console.log(error);
      res.status(500).send("Error uploading files.");
    }
  }
);

// Delete a file (Hard Delete)
router.delete("/delete/:id/:userId", async (req: Request, res: Response) => {
  try {
    const file = await SecureFile.findOneAndDelete({
      _id: req.params.id,
      userId: req.params.userId,
    });
    if (!file) {
      return res
        .status(404)
        .send("File not found or not authorized to delete.");
    }
    res.status(200).send("File deleted successfully.");
  } catch (error) {
    res.status(500).send("Error deleting file.");
  }
});

// Bulk Delete files (Hard Delete)
router.post("/bulk-delete/:userId", async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).send("Invalid request format.");
    }
    await SecureFile.deleteMany({
      _id: { $in: ids },
      userId: req.params.userId,
    });
    res.status(200).send("Files deleted successfully.");
  } catch (error) {
    res.status(500).send("Error bulk deleting files.");
  }
});

// Update a file
router.put("/update/:id/:userId", async (req: Request, res: Response) => {
  try {
    const { isFavorite, ...rest } = req.body;
    if (
      Object.keys(rest).length > 0 &&
      !Object.keys(rest).every((key) =>
        [
          "size",
          "filename",
          "type",
          "uploadedAt",
          "content",
          "encryptedKey",
          "keyIv",
          "keyAuthTag",
          "fileIv",
          "fileAuthTag",
        ].includes(key)
      )
    ) {
      return res.status(400).send("Invalid property to be updated.");
    }
    if (isFavorite !== undefined && typeof isFavorite !== "boolean") {
      return res.status(400).send("isFavorite must be a boolean.");
    }
    const file = await SecureFile.findOne({
      _id: req.params.id,
      userId: req.params.userId,
      isDeleted: { $ne: true },
    });
    if (!file) {
      return res
        .status(404)
        .send("File not found or not authorized to update.");
    }
    const updatedFile = await SecureFile.findByIdAndUpdate(
      req.params.id,
      { ...rest, isFavorite },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedFile) {
      return res.status(404).send("File not found.");
    }
    res.status(200).send(updatedFile);
  } catch (error) {
    res.status(500).send("Error updating file.");
  }
});

router.get("/stats/:userId", async (req: Request, res: Response) => {
  try {
    const stats = await SecureFile.aggregate([
      {
        $match: { userId: req.params.userId, isDeleted: { $ne: true } },
      },
      {
        $group: {
          _id: null,
          totalFiles: { $sum: 1 },
          totalSize: { $sum: "$size" },
        },
      },
    ]);
    if (stats.length === 0) {
      return res
        .status(404)
        .send("File not found or not authorized to get file stats.");
    }
    res.status(200).send(stats[0]);
  } catch (error) {
    res.status(500).send("Error getting file stats.");
  }
});

// Get all files
router.get("/all/:userId", async (req: Request, res: Response) => {
  try {
    const files = await SecureFile.find(
      { userId: req.params.userId, isDeleted: { $ne: true } },
      "_id filename uploadedAt type size isFavorite updatedAt"
    );
    res.status(200).send(files);
  } catch (error) {
    res.status(500).send("Error getting files.");
  }
});

export default router;
