/**
 * Simulator Privacy Tool
 *
 * Grant, revoke, or reset privacy permissions for apps
 */
import { runCommand } from "../../utils/command.js";
import { logger } from "../../utils/logger.js";
export const simulatorPrivacyDefinition = {
    name: "simulator_privacy",
    description: "Grant, revoke, or reset privacy permissions for an app on the simulator",
    inputSchema: {
        type: "object",
        properties: {
            device_id: {
                type: "string",
                description: 'Device UDID or "booted" for active simulator',
            },
            action: {
                type: "string",
                enum: ["grant", "revoke", "reset"],
                description: "'grant' - allow without prompting, 'revoke' - deny access, 'reset' - prompt on next use",
            },
            service: {
                type: "string",
                enum: [
                    "all",
                    "calendar",
                    "contacts-limited",
                    "contacts",
                    "location",
                    "location-always",
                    "photos-add",
                    "photos",
                    "media-library",
                    "microphone",
                    "motion",
                    "reminders",
                    "siri",
                ],
                description: "Permission service to modify. 'all' applies to all services",
            },
            bundle_id: {
                type: "string",
                description: "Bundle identifier of the target app. Required for grant/revoke, optional for reset",
            },
        },
        required: ["action", "service"],
    },
};
export async function simulatorPrivacy(params) {
    try {
        const deviceId = params.device_id || "booted";
        // Validate bundle_id requirement
        if ((params.action === "grant" || params.action === "revoke") &&
            !params.bundle_id) {
            return {
                success: false,
                error: `bundle_id is required for '${params.action}' action`,
                operation: "privacy",
            };
        }
        const args = [
            "simctl",
            "privacy",
            deviceId,
            params.action,
            params.service,
        ];
        if (params.bundle_id) {
            args.push(params.bundle_id);
        }
        logger.info(`Privacy ${params.action} ${params.service} for ${params.bundle_id || "all apps"} on ${deviceId}`);
        const result = await runCommand("xcrun", args);
        if (result.code === 0) {
            const actionVerb = params.action === "grant"
                ? "granted"
                : params.action === "revoke"
                    ? "revoked"
                    : "reset";
            const data = {
                message: `Permission ${actionVerb} successfully`,
                action: params.action,
                service: params.service,
                bundle_id: params.bundle_id,
                note: params.action !== "reset"
                    ? "App may need restart for changes to take effect"
                    : undefined,
            };
            return {
                success: true,
                data,
                summary: `${params.service} ${actionVerb}`,
            };
        }
        else {
            return {
                success: false,
                error: `Failed to ${params.action} permission`,
                details: result.stderr,
            };
        }
    }
    catch (error) {
        logger.error("Privacy operation failed", error);
        return {
            success: false,
            error: String(error),
            operation: "privacy",
        };
    }
}
