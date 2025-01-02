import express, { Request, Response } from "express";
import multer from "multer";
import crypto from "crypto";
import File from "../models/file";
import { imageMimeTypes } from "../consts";

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

const algorithm = "aes-256-cbc";

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
    type !== "text"
  ) {
    return res.status(400).json({ message: "Invalid type" });
  }

  if (type === "image") {
    mimeTypes = imageMimeTypes;
  }

  // TODO: Add support for other types

  File.find(
    { type: { $in: mimeTypes }, userId },
    { _id: 1, filename: 1, uploadedAt: 1, size: 1, type: 1, isFavorite: 1 }
  )
    .lean()
    .then((files) => {
      const filesWithoutContent = files.map((file) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { content, key, iv, _id, ...rest } = file;
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
      const file = await File.findOne({
        _id: req.params.id,
        userId: req.params.userId,
      });

      let encoding: BufferEncoding = "utf-8";

      if (req.params.type === "image") {
        encoding = "base64";
      }

      if (!file) {
        return res.status(404).send("File not found or not authorized.");
      }

      const key = Buffer.from(file.key, "hex");
      const iv = Buffer.from(file.iv, "hex");

      // Decrypt the file content
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(file.content);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      res.status(200).send({
        uploadedAt: file.uploadedAt,
        filename: file.filename,
        type: file.type,
        size: file.size,
        content: decrypted.toString(encoding), // or any other encoding you prefer
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

      const promises = files.map((file) => {
        const { originalname, mimetype, size, buffer } = file;

        // Encryption settings
        const key = crypto.randomBytes(32);
        const iv = crypto.randomBytes(16);

        // Encrypt the file content
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(buffer);
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        // Create a new file document
        const newFile = new File({
          userId: req.params.userId,
          filename: originalname,
          type: mimetype,
          size: size,
          content: encrypted,
          key: key.toString("hex"),
          iv: iv.toString("hex"),
          uploadedAt: Date.now(),
          isFavorite: false,
        });

        return newFile.save();
      });

      await Promise.all(promises);
      res.status(200).send("File(s) uploaded and encrypted successfully.");
    } catch (error) {
      res.status(500).send("Error uploading files.");
    }
  }
);

// Delete a file
router.delete("/delete/:id/:userId", async (req: Request, res: Response) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.params.userId,
    });
    if (!file) {
      return res
        .status(404)
        .send("File not found or not authorized to delete.");
    }
    await File.findByIdAndDelete(req.params.id);
    res.status(200).send("File deleted successfully.");
  } catch (error) {
    res.status(500).send("Error deleting file.");
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
          "key",
          "iv",
        ].includes(key)
      )
    ) {
      return res.status(400).send("Invalid property to be updated.");
    }
    if (isFavorite !== undefined && typeof isFavorite !== "boolean") {
      return res.status(400).send("isFavorite must be a boolean.");
    }
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.params.userId,
    });
    if (!file) {
      return res
        .status(404)
        .send("File not found or not authorized to update.");
    }
    const updatedFile = await File.findByIdAndUpdate(
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
    const stats = await File.aggregate([
      {
        $match: { userId: req.params.userId },
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
    const files = await File.find({ userId: req.params.userId });
    res.status(200).send(files);
  } catch (error) {
    res.status(500).send("Error getting files.");
  }
});

export default router;
