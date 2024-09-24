import express, { Express } from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import usersRouter from "./routes/users";
import filesRouter from "./routes/files";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

const connectionString = process.env.DB_CONNECTION_STRING || "";
mongoose.connect(connectionString);
const database = mongoose.connection;

database.on("error", (error) => {
  console.log(error);
});

database.once("connected", () => {
  console.log("Database Connected");
});

app.use(express.json());

// enabling CORS for some specific origins only.
const corsOptions = {
  origin: ["http://localhost:3000", "http://192.168.0.118:3000"],
};
app.use(cors(corsOptions));

// API Collection
app.use("/api/users", usersRouter);
app.use("/api/files", filesRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
