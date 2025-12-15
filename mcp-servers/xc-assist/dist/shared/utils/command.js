/**
 * Safe command execution utilities
 */
import { spawn } from "child_process";
import { COMMAND_CONFIG } from "./constants.js";
/**
 * Execute a command with arguments using spawn (safer than shell execution).
 * This function does NOT invoke a shell, preventing command injection vulnerabilities.
 *
 * @param command - The command to execute (e.g., 'idb', 'xcrun')
 * @param args - Array of arguments (each element is safely passed as-is)
 * @param options - Execution options
 * @returns Command result with stdout, stderr, and exit code
 */
export async function runCommand(command, args, options = {}) {
    const defaultOptions = {
        timeout: COMMAND_CONFIG.DEFAULT_TIMEOUT_MS,
        maxBuffer: COMMAND_CONFIG.DEFAULT_MAX_BUFFER_BYTES,
        ...options,
    };
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd: defaultOptions.cwd,
            timeout: defaultOptions.timeout,
        });
        let stdout = "";
        let stderr = "";
        let killed = false;
        // Set up timeout
        const timeoutId = setTimeout(() => {
            killed = true;
            child.kill();
            reject(new Error(`Command timed out after ${defaultOptions.timeout}ms`));
        }, defaultOptions.timeout);
        // Collect stdout
        child.stdout?.on("data", (data) => {
            stdout += data.toString();
            if (stdout.length > defaultOptions.maxBuffer) {
                killed = true;
                child.kill();
                clearTimeout(timeoutId);
                reject(new Error(`Command output exceeded max buffer size`));
            }
        });
        // Collect stderr
        child.stderr?.on("data", (data) => {
            stderr += data.toString();
        });
        // Handle process exit
        child.on("close", (code) => {
            clearTimeout(timeoutId);
            if (!killed) {
                resolve({
                    stdout: stdout.trim(),
                    stderr: stderr.trim(),
                    code: code || 0,
                });
            }
        });
        // Handle process errors
        child.on("error", (error) => {
            clearTimeout(timeoutId);
            if (!killed) {
                reject(new Error(`Failed to execute command: ${error.message}`));
            }
        });
    });
}
