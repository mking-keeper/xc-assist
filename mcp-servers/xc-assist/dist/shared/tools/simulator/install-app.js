"use strict";
/**
 * Simulator Install App Tool
 *
 * Install an app on simulator
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulatorInstallAppDefinition = void 0;
exports.simulatorInstallApp = simulatorInstallApp;
const command_js_1 = require("../../utils/command.js");
const logger_js_1 = require("../../utils/logger.js");
exports.simulatorInstallAppDefinition = {
    name: "simulator_install_app",
    description: "Install app on simulator",
    inputSchema: {
        type: "object",
        properties: {
            device_id: {
                type: "string",
                description: 'Device UDID or "booted" for active simulator',
            },
            app_path: {
                type: "string",
                description: "Path to .app bundle",
            },
        },
        required: ["app_path"],
    },
};
/**
 * Install an app (.app bundle) on a simulator device.
 *
 * @param params - Installation parameters
 * @param params.app_path - Path to .app bundle (required)
 * @param params.device_id - Device UDID or "booted" for active simulator (optional, defaults to "booted")
 * @returns Promise resolving to installation result
 *
 * @example
 * ```typescript
 * const result = await simulatorInstallApp({
 *   app_path: '/path/to/MyApp.app',
 *   device_id: 'booted'
 * });
 * ```
 */
async function simulatorInstallApp(params) {
    try {
        // Validation
        if (!params.app_path) {
            return {
                success: false,
                error: "Install failed: app_path is required",
                operation: "install-app",
            };
        }
        const deviceId = params.device_id || "booted";
        // Execute install command
        logger_js_1.logger.info(`Installing app on ${deviceId}: ${params.app_path}`);
        const result = await (0, command_js_1.runCommand)("xcrun", [
            "simctl",
            "install",
            deviceId,
            params.app_path,
        ]);
        if (result.code === 0) {
            const data = {
                message: "App installed successfully",
                device_id: deviceId,
                app_path: params.app_path,
                note: `Installed on ${deviceId}`,
            };
            return {
                success: true,
                data,
                summary: "App installed",
            };
        }
        else {
            return {
                success: false,
                error: `Install failed: Unable to install app at ${params.app_path} on device ${deviceId}`,
                details: result.stderr,
            };
        }
    }
    catch (error) {
        logger_js_1.logger.error("Install app failed", error);
        return {
            success: false,
            error: `Install failed: ${String(error)}`,
            operation: "install-app",
        };
    }
}
