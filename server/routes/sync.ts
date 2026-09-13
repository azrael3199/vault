import express, { Request, Response } from "express";
import crypto from "crypto";
import SecureFile from "../models/securefile";
import User from "../models/user";
import { getMasterKey } from "../lib/keyManager";

const router = express.Router();

/**
 * Returns lightweight metadata for all files (including soft-deleted)
 * for the client Diffing Engine to determine what needs to be synced.
 */
router.get("/metadata/:userId", async (req: Request, res: Response) => {
  try {
    const files = await SecureFile.find(
      { userId: req.params.userId },
      "_id filename uploadedAt type size isFavorite isDeleted updatedAt"
    ).lean();

    const metadataList = files.map((file) => ({
      id: file._id,
      filename: file.filename,
      uploadedAt: file.uploadedAt,
      type: file.type,
      size: file.size,
      isFavorite: file.isFavorite,
      isDeleted: file.isDeleted,
      updatedAt: file.updatedAt,
    }));

    res.status(200).json(metadataList);
  } catch (error) {
    console.error("Sync metadata error:", error);
    res.status(500).json({ message: "Error fetching sync metadata." });
  }
});

/**
 * PULL: Returns the encrypted file blob and the unwrapped DEK.
 */
router.get("/pull/:id/:userId", async (req: Request, res: Response) => {
  try {
    const file = await SecureFile.findOne({
      _id: req.params.id,
      userId: req.params.userId,
    });
    if (!file) return res.status(404).send("File not found");

    const user = await User.findOne({ username: req.params.userId });
    if (!user) return res.status(404).send("User not found.");

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

    res.status(200).json({
      id: file._id,
      filename: file.filename,
      uploadedAt: file.uploadedAt,
      type: file.type,
      size: file.size,
      isFavorite: file.isFavorite,
      isDeleted: file.isDeleted,
      updatedAt: file.updatedAt,
      contentHex: file.content.toString("hex"),
      fileIv: file.fileIv,
      fileAuthTag: file.fileAuthTag,
      rawDekHex: dek.toString("hex"), // Unwrapped DEK!
    });
  } catch (error) {
    console.error("Pull error:", error);
    res.status(500).send("Error pulling file.");
  }
});

/**
 * PUSH: Receives an encrypted file blob and raw DEK, encrypts the DEK, and saves it.
 */
router.post("/push/:userId", async (req: Request, res: Response) => {
  try {
    const {
      id,
      filename,
      uploadedAt,
      type,
      size,
      isFavorite,
      isDeleted,
      updatedAt,
      contentHex,
      fileIv,
      fileAuthTag,
      rawDekHex,
    } = req.body;

    const user = await User.findOne({ username: req.params.userId });
    if (!user) return res.status(404).send("User not found.");

    const masterKeyHex = getMasterKey();
    const hash = crypto.createHash("sha256");
    hash.update(masterKeyHex + user.hashedPassword);
    const kek = hash.digest();

    const dek = Buffer.from(rawDekHex, "hex");
    const keyIv = crypto.randomBytes(16);

    // Encrypt the DEK with the PC's KEK
    const keyCipher = crypto.createCipheriv("aes-256-gcm", kek, keyIv);
    let encryptedKeyBuffer = keyCipher.update(dek);
    encryptedKeyBuffer = Buffer.concat([encryptedKeyBuffer, keyCipher.final()]);
    const keyAuthTag = keyCipher.getAuthTag();

    const newFile = {
      userId: req.params.userId,
      filename,
      type,
      size,
      content: Buffer.from(contentHex, "hex"),
      encryptedKey: encryptedKeyBuffer.toString("hex"),
      keyIv: keyIv.toString("hex"),
      keyAuthTag: keyAuthTag.toString("hex"),
      fileIv,
      fileAuthTag,
      uploadedAt,
      isFavorite,
      isDeleted,
      updatedAt,
    };

    await SecureFile.findOneAndUpdate(
      { _id: id },
      { $set: newFile },
      { upsert: true, new: true, timestamps: false }
    );

    res.status(200).send("File pushed successfully.");
  } catch (error) {
    console.error("Push error:", error);
    res.status(500).send("Error pushing file.");
  }
});

export default router;
