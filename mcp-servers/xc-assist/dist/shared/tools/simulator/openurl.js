"use strict";
/**
 * Simulator Open URL Tool
 *
 * Open URL or deep link in simulator
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulatorOpenURLDefinition = void 0;
exports.simulatorOpenURL = simulatorOpenURL;
const command_js_1 = require("../../utils/command.js");
const logger_js_1 = require("../../utils/logger.js");
exports.simulatorOpenURLDefinition = {
    name: 'simulator_openurl',
    description: 'Open URL or deep link in simulator',
    inputSchema: {
        type: 'object',
        properties: {
            device_id: {
                type: 'string',
                description: 'Device UDID or "booted" for active simulator',
            },
            url: {
                type: 'string',
                description: 'URL to open (http://, https://, or custom scheme)',
            },
        },
        required: ['url'],
    },
};
async function simulatorOpenURL(params) {
    try {
        if (!params.url) {
            return {
                success: false,
                error: 'url required',
                operation: 'openurl',
            };
        }
        const deviceId = params.device_id || 'booted';
        logger_js_1.logger.info(`Opening URL on ${deviceId}: ${params.url}`);
        const result = await (0, command_js_1.runCommand)('xcrun', ['simctl', 'openurl', deviceId, params.url]);
        const data = {
            message: 'URL opened successfully',
            app_identifier: '', // Not applicable
            note: `Opened: ${params.url}`,
        };
        if (result.code === 0) {
            return {
                success: true,
                data,
                summary: 'URL opened',
            };
        }
        else {
            return {
                success: false,
                error: "Operation failed",
                details: result.stderr,
            };
        }
    }
    catch (error) {
        logger_js_1.logger.error('Open URL failed', error);
        return {
            success: false,
            error: String(error),
            operation: 'openurl',
        };
    }
}
