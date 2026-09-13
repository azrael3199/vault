import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/user";

const router = express.Router();

// Endpoints
router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Salt Hash the req.body password and compare it to the hashed password in the database
    const salt = user.salt;
    const hashedPassword = await bcrypt.hash(password, salt);
    const isPasswordValid = hashedPassword === user.hashedPassword;
    if (isPasswordValid) {
      return res.json({ authenticated: true, username: username });
    } else {
      return res.json({ authenticated: false });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: (error as Error).message });
  }
});

router.post("/register", (req: Request, res: Response) => {
  const { username, password } = req.body;
  console.log(req);

  // Check if the username already exists
  User.findOne({ username })
    .then((user) => {
      if (user) {
        return res.status(409).json({ message: "Username already exists" });
      } else {
        // Salt Hash the req.body password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        
        // Generate Recovery Key
        const rawRecoveryKey = crypto.randomBytes(16).toString("hex");
        const recoveryKey = rawRecoveryKey.match(/.{1,8}/g)?.join("-") || rawRecoveryKey;
        const recoveryHash = bcrypt.hashSync(recoveryKey, bcrypt.genSaltSync(10));

        const newUser = new User({
          username,
          hashedPassword,
          salt,
          recoveryHash,
        });
        newUser
          .save()
          .then(() => {
            res.status(201).json({
              message: "User created successfully",
              authenticated: true,
              username: username,
              recoveryKey: recoveryKey,
            });
          })
          .catch((error) => {
            res.status(500).json({ message: (error as Error).message });
          });
      }
    })
    .catch((error) => {
      res.status(500).json({ message: (error as Error).message });
    });
});

router.post("/recover", async (req: Request, res: Response) => {
  const { username, recoveryKey, newPassword } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isRecoveryValid = await bcrypt.compare(recoveryKey, user.recoveryHash);
    if (isRecoveryValid) {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(newPassword, salt);
      user.salt = salt;
      user.hashedPassword = hashedPassword;
      await user.save();
      return res.json({ success: true, message: "Password recovered successfully" });
    } else {
      return res.status(401).json({ success: false, message: "Invalid recovery key" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: (error as Error).message });
  }
});

router.post("/generate-recovery-key", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid passcode" });
    }

    // Generate Recovery Key
    const rawRecoveryKey = crypto.randomBytes(16).toString("hex");
    const recoveryKey = rawRecoveryKey.match(/.{1,8}/g)?.join("-") || rawRecoveryKey;
    const recoveryHash = bcrypt.hashSync(recoveryKey, bcrypt.genSaltSync(10));

    user.recoveryHash = recoveryHash;
    await user.save();

    return res.json({ success: true, recoveryKey });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: (error as Error).message });
  }
});

export default router;
