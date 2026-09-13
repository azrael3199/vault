import express, { Express } from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Initialize environment variables (only needed for db connection string now)
dotenv.config();

import { initializeKeyManager } from "./lib/keyManager";
initializeKeyManager();

import userRoutes from "./routes/users";
import fileRoutes from "./routes/files";
import syncRoutes from "./routes/sync";
import logRoutes from "./routes/logs";

const app: Express = express();
const port = process.env.PORT || 5000;

const connectionString = process.env.DB_CONNECTION_STRING || "";
console.log("[connectionString]", connectionString);
mongoose.connect(connectionString);
const database = mongoose.connection;

database.on("error", (error) => {
  console.log(error);
});

database.once("connected", () => {
  console.log("Database Connected");
});

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cors());

// API Collection
app.use("/api/files", fileRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sync", syncRoutes);
app.use("/api/logs", logRoutes);

app.get("/api/ping", (req, res) => {
  res.status(200).json({ success: true, service: "vault-server" });
});

app.listen(port as number, "0.0.0.0", () => {
  console.log(`[server]: Server is running at http://0.0.0.0:${port}`);
});
