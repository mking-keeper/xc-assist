"use strict";
/**
 * Simulator Get App Container Tool
 *
 * Get filesystem path to app container
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulatorGetAppContainerDefinition = void 0;
exports.simulatorGetAppContainer = simulatorGetAppContainer;
const command_js_1 = require("../../utils/command.js");
const logger_js_1 = require("../../utils/logger.js");
exports.simulatorGetAppContainerDefinition = {
    name: 'simulator_get_app_container',
    description: 'Get app container filesystem path',
    inputSchema: {
        type: 'object',
        properties: {
            device_id: {
                type: 'string',
                description: 'Device UDID or "booted" for active simulator',
            },
            app_identifier: {
                type: 'string',
                description: 'App bundle identifier',
            },
            container_type: {
                type: 'string',
                enum: ['data', 'bundle', 'group'],
                description: 'Container type (default: data)',
            },
        },
        required: ['app_identifier'],
    },
};
async function simulatorGetAppContainer(params) {
    try {
        if (!params.app_identifier) {
            return {
                success: false,
                error: 'app_identifier required',
                operation: 'get-app-container',
            };
        }
        const deviceId = params.device_id || 'booted';
        const containerType = params.container_type || 'data';
        logger_js_1.logger.info(`Getting ${containerType} container for ${params.app_identifier}`);
        const result = await (0, command_js_1.runCommand)('xcrun', [
            'simctl',
            'get_app_container',
            deviceId,
            params.app_identifier,
            containerType,
        ]);
        const containerPath = result.stdout.trim();
        const data = {
            message: 'Container path retrieved',
            output_path: containerPath,
            note: `${containerType} container: ${containerPath}`,
        };
        if (result.code === 0) {
            return {
                success: true,
                data,
                summary: 'Path retrieved',
            };
        }
        else {
            return {
                success: false,
                error: 'Failed to retrieve container path',
                details: result.stderr,
            };
        }
    }
    catch (error) {
        logger_js_1.logger.error('Get app container failed', error);
        return {
            success: false,
            error: String(error),
            operation: 'get-app-container',
        };
    }
}
