/**
 * Simulator Pasteboard Tool
 *
 * Read from and write to the simulator's clipboard/pasteboard
 */
import { runCommand, runCommandWithInput } from "../../utils/command.js";
import { logger } from "../../utils/logger.js";
export const simulatorPasteboardDefinition = {
    name: "simulator_pasteboard",
    description: "Read from or write to the simulator's clipboard (pasteboard)",
    inputSchema: {
        type: "object",
        properties: {
            device_id: {
                type: "string",
                description: 'Device UDID or "booted" for active simulator',
            },
            action: {
                type: "string",
                enum: ["copy", "paste"],
                description: "'copy' - write text to simulator clipboard, 'paste' - read text from simulator clipboard",
            },
            text: {
                type: "string",
                description: "Text to copy to clipboard (required for 'copy' action)",
            },
        },
        required: ["action"],
    },
};
export async function simulatorPasteboard(params) {
    try {
        const deviceId = params.device_id || "booted";
        switch (params.action) {
            case "copy": {
                if (!params.text) {
                    return {
                        success: false,
                        error: "text is required for 'copy' action",
                        operation: "pasteboard",
                    };
                }
                logger.info(`Copying text to pasteboard on ${deviceId}`);
                // pbcopy reads from stdin, so we need to pipe the text
                const result = await runCommandWithInput("xcrun", ["simctl", "pbcopy", deviceId], params.text);
                if (result.code === 0) {
                    return {
                        success: true,
                        data: {
                            message: "Text copied to clipboard",
                            action: "copy",
                            text: params.text,
                            note: `${params.text.length} characters copied`,
                        },
                        summary: "Text copied to clipboard",
                    };
                }
                else {
                    return {
                        success: false,
                        error: "Failed to copy to clipboard",
                        details: result.stderr,
                    };
                }
            }
            case "paste": {
                logger.info(`Reading pasteboard from ${deviceId}`);
                const result = await runCommand("xcrun", [
                    "simctl",
                    "pbpaste",
                    deviceId,
                ]);
                if (result.code === 0) {
                    const text = result.stdout;
                    return {
                        success: true,
                        data: {
                            message: "Clipboard content retrieved",
                            action: "paste",
                            text,
                            note: text
                                ? `${text.length} characters`
                                : "Clipboard is empty",
                        },
                        summary: text ? "Clipboard content retrieved" : "Clipboard is empty",
                    };
                }
                else {
                    return {
                        success: false,
                        error: "Failed to read clipboard",
                        details: result.stderr,
                    };
                }
            }
            default:
                return {
                    success: false,
                    error: `Unknown action: ${params.action}`,
                    operation: "pasteboard",
                };
        }
    }
    catch (error) {
        logger.error("Pasteboard operation failed", error);
        return {
            success: false,
            error: String(error),
            operation: "pasteboard",
        };
    }
}
