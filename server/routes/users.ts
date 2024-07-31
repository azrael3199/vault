import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import users from "../models/users";

const router = express.Router();

// Endpoints
router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const user = await users.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Salt Hash the req.body password and compare it to the hashed password in the database
    const salt = user.salt;
    const hashedPassword = await bcrypt.hash(password, salt);
    const isPasswordValid = hashedPassword === user.hashedPassword;
    if (isPasswordValid) {
      return res.json({ authenticated: true });
    } else {
      return res.json({ authenticated: false });
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.post("/register", (req: Request, res: Response) => {
  const { username, password } = req.body;
  console.log(req);

  // Check if the username already exists
  users
    .findOne({ username })
    .then((user) => {
      if (user) {
        return res.status(409).json({ message: "Username already exists" });
      } else {
        // Salt Hash the req.body password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        const newUser = new users({
          username,
          hashedPassword,
          salt,
        });
        newUser
          .save()
          .then(() => {
            res.status(201).json({ message: "User created successfully" });
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

export default router;
