/**
 * Simulator Push Notification Tool
 *
 * Send simulated push notifications to an app
 */
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { runCommand } from "../../utils/command.js";
import { logger } from "../../utils/logger.js";
export const simulatorPushDefinition = {
    name: "simulator_push",
    description: "Send a simulated push notification to an app on the simulator",
    inputSchema: {
        type: "object",
        properties: {
            device_id: {
                type: "string",
                description: 'Device UDID or "booted" for active simulator',
            },
            bundle_id: {
                type: "string",
                description: "Bundle identifier of the target app (e.g., com.example.app)",
            },
            payload: {
                type: "object",
                description: "Push notification payload. Must contain 'aps' key with Apple Push Notification values",
                properties: {
                    aps: {
                        type: "object",
                        description: "Apple Push Notification Service payload",
                        properties: {
                            alert: {
                                description: "Alert message - string or object with title/body/subtitle",
                            },
                            badge: {
                                type: "number",
                                description: "Badge number to display on app icon",
                            },
                            sound: {
                                type: "string",
                                description: 'Sound to play (e.g., "default")',
                            },
                            "content-available": {
                                type: "number",
                                description: "Set to 1 for background notifications",
                            },
                            category: {
                                type: "string",
                                description: "Notification category for actions",
                            },
                        },
                    },
                },
                required: ["aps"],
            },
        },
        required: ["bundle_id", "payload"],
    },
};
export async function simulatorPush(params) {
    try {
        if (!params.bundle_id) {
            return {
                success: false,
                error: "bundle_id is required",
                operation: "push",
            };
        }
        if (!params.payload?.aps) {
            return {
                success: false,
                error: "payload with aps key is required",
                operation: "push",
            };
        }
        const deviceId = params.device_id || "booted";
        // Write payload to temp file (simctl requires a file or stdin)
        const tempFile = path.join(os.tmpdir(), `push-${Date.now()}.json`);
        fs.writeFileSync(tempFile, JSON.stringify(params.payload, null, 2));
        try {
            logger.info(`Sending push to ${params.bundle_id} on ${deviceId}`);
            const result = await runCommand("xcrun", [
                "simctl",
                "push",
                deviceId,
                params.bundle_id,
                tempFile,
            ]);
            if (result.code === 0) {
                const data = {
                    message: "Push notification sent successfully",
                    bundle_id: params.bundle_id,
                    note: typeof params.payload.aps.alert === "string"
                        ? params.payload.aps.alert
                        : params.payload.aps.alert?.body || "Notification sent",
                };
                return {
                    success: true,
                    data,
                    summary: `Push sent to ${params.bundle_id}`,
                };
            }
            else {
                return {
                    success: false,
                    error: "Failed to send push notification",
                    details: result.stderr,
                };
            }
        }
        finally {
            // Clean up temp file
            try {
                fs.unlinkSync(tempFile);
            }
            catch {
                // Ignore cleanup errors
            }
        }
    }
    catch (error) {
        logger.error("Push notification failed", error);
        return {
            success: false,
            error: String(error),
            operation: "push",
        };
    }
}
