"use strict";
/**
 * Simulator Screenshot Tool
 *
 * Capture simulator screenshot
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulatorScreenshotDefinition = void 0;
exports.simulatorScreenshot = simulatorScreenshot;
const command_js_1 = require("../../utils/command.js");
const logger_js_1 = require("../../utils/logger.js");
exports.simulatorScreenshotDefinition = {
    name: 'simulator_screenshot',
    description: 'Capture simulator screenshot',
    inputSchema: {
        type: 'object',
        properties: {
            device_id: {
                type: 'string',
                description: 'Device UDID or "booted" for active simulator',
            },
            output_path: {
                type: 'string',
                description: 'Output file path (default: auto-generated)',
            },
        },
    },
};
async function simulatorScreenshot(params) {
    try {
        const deviceId = params.device_id || 'booted';
        const outputPath = params.output_path || `/tmp/screenshot-${Date.now()}.png`;
        // Execute screenshot command
        logger_js_1.logger.info(`Capturing screenshot from ${deviceId}`);
        const result = await (0, command_js_1.runCommand)('xcrun', ['simctl', 'io', deviceId, 'screenshot', outputPath]);
        const data = {
            message: 'Screenshot captured successfully',
            output_path: outputPath,
            note: `Saved to ${outputPath}`,
        };
        if (result.code === 0) {
            return {
                success: true,
                data,
                summary: 'Screenshot captured',
            };
        }
        else {
            return {
                success: false,
                error: 'Screenshot capture failed',
                details: result.stderr,
            };
        }
    }
    catch (error) {
        logger_js_1.logger.error('Screenshot failed', error);
        return {
            success: false,
            error: String(error),
            operation: 'screenshot',
        };
    }
}
