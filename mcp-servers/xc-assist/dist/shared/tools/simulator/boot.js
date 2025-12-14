"use strict";
/**
 * Simulator Boot Tool
 *
 * Boot a simulator device
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulatorBootDefinition = void 0;
exports.simulatorBoot = simulatorBoot;
const command_js_1 = require("../../utils/command.js");
const logger_js_1 = require("../../utils/logger.js");
exports.simulatorBootDefinition = {
    name: 'simulator_boot',
    description: 'Boot a simulator device',
    inputSchema: {
        type: 'object',
        properties: {
            device_id: {
                type: 'string',
                description: 'Device UDID or name (e.g. "iPhone 15" or full UDID)',
            },
        },
        required: ['device_id'],
    },
};
async function simulatorBoot(params) {
    try {
        // Validation
        if (!params.device_id) {
            return {
                success: false,
                error: 'device_id required',
                operation: 'boot',
            };
        }
        // Execute boot command
        logger_js_1.logger.info(`Booting simulator: ${params.device_id}`);
        const result = await (0, command_js_1.runCommand)('xcrun', ['simctl', 'boot', params.device_id]);
        const data = {
            message: `Device booted successfully`,
            device_id: params.device_id,
            note: 'Device is starting up',
        };
        if (result.code === 0) {
            return {
                success: true,
                data,
                summary: 'Device booted',
            };
        }
        else {
            return {
                success: false,
                error: 'Boot failed',
                details: result.stderr,
            };
        }
    }
    catch (error) {
        logger_js_1.logger.error('Boot failed', error);
        return {
            success: false,
            error: String(error),
            operation: 'boot',
        };
    }
}
