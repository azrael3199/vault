import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

router.post("/", (req, res) => {
  try {
    const { message, context, timestamp } = req.body;
    const logsDir = path.join(process.cwd(), "android_logs");
    
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const dateStr = new Date().toISOString().split("T")[0];
    const logFile = path.join(logsDir, `mobile_errors_${dateStr}.log`);

    const logEntry = `[${timestamp || new Date().toISOString()}] [${context || "UNKNOWN"}]\n${message}\n\n`;
    
    fs.appendFileSync(logFile, logEntry, "utf8");
    
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Failed to write mobile log:", err);
    res.status(500).json({ success: false });
  }
});

export default router;
