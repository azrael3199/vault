import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import os from "os";
import fs from "fs/promises";

const execFileAsync = promisify(execFile);

async function test() {
    const pythonExecutable = path.join(__dirname, "python_ai", "venv", "Scripts", "python.exe");
    const scriptPath = path.join(__dirname, "python_ai", "generate.py");
    const outputFileName = `cover_test.jpg`;
    const outputPath = path.join(os.tmpdir(), outputFileName);

    console.log("Running python script...", pythonExecutable);
    try {
        const { stdout, stderr } = await execFileAsync(pythonExecutable, [scriptPath, "A retro 16-bit vault cover", outputPath], { maxBuffer: 50 * 1024 * 1024 });
        console.log("STDOUT:", stdout);
        console.log("STDERR:", stderr);
        
        const stats = await fs.stat(outputPath);
        console.log("Image created! Size:", stats.size);
    } catch (e) {
        console.error("Test failed", e);
    }
}
test();
