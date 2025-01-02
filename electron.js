import { app, BrowserWindow } from "electron/main";
import * as path from "path";
import { exec, spawn } from "child_process";
import isDev from "electron-is-dev";
import fs from "fs";
import psList from "ps-list";

// const psListBinPath = path.join(
//   process.resourcesPath,
//   "app.asar.unpacked",
//   "ps-list",
//   "vendor",
//   "fastlist-0.3.0-x64.exe"
// );

app.setName("Vault");

// Resolve the path to the unpacked mongod binary
const mongoDbBinPath = path.join(
  process.resourcesPath,
  "app/resources/mongodb/mongod.exe"
);

// MongoDB paths (change these based on where you place MongoDB binaries)
const mongoDbDataPath = path.join(
  process.resourcesPath,
  "app",
  "resources",
  "mongodb",
  "data"
);
const logPath = path.join(
  process.resourcesPath,
  "app",
  "resources",
  "mongodb",
  "logs",
  "mongod.log"
);

let mongod;
let serverProcess;
let frontendProcess;

// Function to check if MongoDB is already running
function isMongoRunning() {
  return new Promise((resolve, reject) => {
    psList().then((processes) => {
      const mongoProcess = processes.find((p) => p.name === "mongod.exe");
      resolve(!!mongoProcess);
    });
  });
}

// Function to start MongoDB
function startMongoDB() {
  return new Promise((resolve, reject) => {
    console.log("mongoDbBinPath", mongoDbBinPath);
    mongod = exec(
      `"${mongoDbBinPath}" --dbpath="${mongoDbDataPath}" --bind_ip=127.0.0.1 --port=27017 --logpath="${logPath}" --logappend`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error starting MongoDB: ${error.message}`);
          reject(error);
        }
        if (stderr) {
          console.error(`MongoDB stderr: ${stderr}`);
          reject(stderr);
        }
        console.log(`MongoDB stdout: ${stdout}`);
        resolve("MongoDB started successfully");
      }
    );

    const checkLogForStart = () => {
      fs.readFile(logPath, "utf8", (err, data) => {
        if (err) {
          clearInterval(logCheckInterval);
          return reject(new Error("Error reading MongoDB log file"));
        }

        // Look for a specific line that indicates MongoDB is ready
        if (data.includes("Waiting for connections")) {
          clearInterval(logCheckInterval); // Stop checking once MongoDB starts
          console.log("MongoDB started successfully");
          resolve("MongoDB started successfully");
        }
      });
    };

    const logCheckInterval = setInterval(checkLogForStart, 1000);

    mongod.on("close", (code) => {
      console.log(`MongoDB process exited with code ${code}`);
    });
  });
}

// Function to start the Node server (backend)
async function startNodeServer() {
  const module = await import("dotenv");
  module.config({
    path: path.join(process.resourcesPath, "app", "server", ".env"),
  });

  return new Promise((resolve, reject) => {
    serverProcess = spawn(
      path.join(process.resourcesPath, "app", "server", "server.exe")
    );

    serverProcess.stdout.on("data", (data) => {
      console.log(`Server: ${data}`);
      resolve("Server started successfully");
    });

    serverProcess.stderr.on("data", (data) => {
      console.error(`Server Error: ${data}`);
      reject(new Error(`Server exited with error: ${data}`));
    });

    serverProcess.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Server exited with code ${code}`));
      } else {
        resolve("Server started successfully");
      }
    });
  });
}

const startFrontend = async () => {
  return new Promise(async (resolve, reject) => {
    const module = await import("dotenv");
    module.config({ path: path.join(".env.production") });
    frontendProcess = spawn(
      path.join("node_modules", ".bin", "pnpm"),
      ["run", "dev"],
      {
        shell: true,
      }
    );

    frontendProcess.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Frontend exited with code ${code}`));
      } else {
        resolve("Frontend started successfully");
      }
    });

    frontendProcess.stdout.on("data", (data) => {
      console.log(`Frontend: ${data}`);
      resolve("Frontend started successfully");
    });

    frontendProcess.stderr.on("data", (data) => {
      console.error(`Frontend Error: ${data}`);
      reject(new Error(`Frontend exited with error: ${data}`));
    });
  });
};

let mainWindow;

// Create the main window
const createWindow = () => {
  console.log("Creating main window...");
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
    },
    title: app.getName(),
  });

  if (isDev) {
    console.log("isDev", isDev);
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join("dist", "index.html"));
  }
};

// Wait for MongoDB to start before creating the window
async function startApp() {
  try {
    // Check if MongoDB is already running
    const mongoRunning = await isMongoRunning();
    if (!mongoRunning) {
      console.log("Starting MongoDB...");
      await startMongoDB();
    } else {
      console.log("MongoDB is already running.");
    }

    // Start Node server
    console.log("Starting Node server...");
    await startNodeServer();

    // Start frontend
    if (isDev) {
      console.log("Starting frontend...");
      await startFrontend();
    }

    // Now, start the Electron app (frontend)
    createWindow();
  } catch (error) {
    console.error("Error starting MongoDB, Node server, or app:", error);
  }
}

app.whenReady().then(startApp);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

const handleExit = () => {
  console.log("Exiting application, cleaning up processes...");

  const taskkill = spawn("taskkill", [
    "/F",
    "/T",
    "/PID",
    `${mongod?.pid ? mongod.pid : ""},${
      frontendProcess?.pid ? frontendProcess.pid : ""
    },${serverProcess?.pid ? serverProcess.pid : ""}`,
  ]);
  taskkill.on("exit", () => {
    console.log("MongoDB process terminated.");
  });

  taskkill.on("error", (error) => {
    console.error("Error killing processes:", error);
  });

  taskkill.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  taskkill.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  taskkill.on("close", (code) => {
    console.log(`taskkill process exited with code ${code}`);
  });

  console.log("Processes cleaned up.");

  taskkill.kill();

  process.exit(0);
};

app.on("before-quit", handleExit);
