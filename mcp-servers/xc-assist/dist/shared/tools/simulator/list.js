"use strict";
/**
 * Simulator List Tool
 *
 * Enumerate available simulators
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulatorListDefinition = void 0;
exports.simulatorList = simulatorList;
const command_js_1 = require("../../utils/command.js");
const logger_js_1 = require("../../utils/logger.js");
exports.simulatorListDefinition = {
    name: 'simulator_list',
    description: 'List available iOS simulators',
    inputSchema: {
        type: 'object',
        properties: {
            availability: {
                type: 'string',
                enum: ['available', 'unavailable', 'all'],
                description: 'Filter by availability (default: available)',
            },
            device_type: {
                type: 'string',
                description: 'Filter by device type (e.g. "iPhone")',
            },
            runtime: {
                type: 'string',
                description: 'Filter by runtime (e.g. "iOS 17")',
            },
        },
    },
};
async function simulatorList(params) {
    try {
        // Execute simctl list
        logger_js_1.logger.info('Listing simulators');
        const result = await (0, command_js_1.runCommand)('xcrun', ['simctl', 'list', 'devices', '-j']);
        // Parse JSON output
        const json = JSON.parse(result.stdout);
        const devices = [];
        // Flatten devices from all runtimes
        for (const [runtime, runtimeDevices] of Object.entries(json.devices)) {
            for (const device of runtimeDevices) {
                // Apply filters
                if (params.availability === 'available' && !device.isAvailable)
                    continue;
                if (params.availability === 'unavailable' && device.isAvailable)
                    continue;
                if (params.device_type && !device.name.includes(params.device_type))
                    continue;
                if (params.runtime && !runtime.includes(params.runtime))
                    continue;
                devices.push({
                    name: device.name,
                    udid: device.udid,
                    state: device.state,
                    runtime: runtime.replace('com.apple.CoreSimulator.SimRuntime.', '').replace(/-/g, ' '),
                    available: device.isAvailable,
                });
            }
        }
        const data = {
            devices,
            count: devices.length,
            message: `Found ${devices.length} simulators`,
        };
        return {
            success: true,
            data,
            summary: `${devices.length} simulators`,
        };
    }
    catch (error) {
        logger_js_1.logger.error('List simulators failed', error);
        return {
            success: false,
            error: String(error),
            operation: 'list',
        };
    }
}
