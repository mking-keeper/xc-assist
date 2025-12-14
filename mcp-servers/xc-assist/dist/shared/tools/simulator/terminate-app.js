"use strict";
/**
 * Simulator Terminate App Tool
 *
 * Terminate a running app
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulatorTerminateAppDefinition = void 0;
exports.simulatorTerminateApp = simulatorTerminateApp;
const command_js_1 = require("../../utils/command.js");
const logger_js_1 = require("../../utils/logger.js");
exports.simulatorTerminateAppDefinition = {
    name: 'simulator_terminate_app',
    description: 'Terminate a running app on simulator',
    inputSchema: {
        type: 'object',
        properties: {
            device_id: {
                type: 'string',
                description: 'Device UDID or "booted" for active simulator',
            },
            app_identifier: {
                type: 'string',
                description: 'App bundle identifier (e.g. "com.example.MyApp")',
            },
        },
        required: ['app_identifier'],
    },
};
async function simulatorTerminateApp(params) {
    try {
        if (!params.app_identifier) {
            return {
                success: false,
                error: 'app_identifier required',
                operation: 'terminate-app',
            };
        }
        const deviceId = params.device_id || 'booted';
        logger_js_1.logger.info(`Terminating app ${params.app_identifier} on ${deviceId}`);
        const result = await (0, command_js_1.runCommand)('xcrun', ['simctl', 'terminate', deviceId, params.app_identifier]);
        const data = {
            message: 'App terminated successfully',
            app_identifier: params.app_identifier,
        };
        if (result.code === 0) {
            return {
                success: true,
                data,
                summary: 'App terminated',
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
        logger_js_1.logger.error('Terminate app failed', error);
        return {
            success: false,
            error: String(error),
            operation: 'terminate-app',
        };
    }
}
