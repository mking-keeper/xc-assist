"use strict";
/**
 * IDB Tap Tool
 *
 * Tap at coordinates (use after describe to get coordinates)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.idbTapDefinition = void 0;
exports.idbTap = idbTap;
const command_js_1 = require("../../utils/command.js");
const logger_js_1 = require("../../utils/logger.js");
exports.idbTapDefinition = {
    name: 'idb_tap',
    description: 'Tap at UI coordinates',
    inputSchema: {
        type: 'object',
        properties: {
            target: {
                type: 'string',
                description: 'Target device (default: "booted")',
            },
            x: {
                type: 'number',
                description: 'X coordinate',
            },
            y: {
                type: 'number',
                description: 'Y coordinate',
            },
            duration: {
                type: 'number',
                description: 'Tap duration in seconds (default: 0.1)',
            },
        },
        required: ['x', 'y'],
    },
};
async function idbTap(params) {
    try {
        // Validation
        if (params.x === undefined || params.y === undefined) {
            return {
                success: false,
                error: 'x and y coordinates required',
                operation: 'tap',
            };
        }
        const target = params.target || 'booted';
        const duration = params.duration || 0.1;
        // Execute tap command
        logger_js_1.logger.info(`Tapping at (${params.x}, ${params.y})`);
        const result = await (0, command_js_1.runCommand)('idb', [
            'ui',
            'tap',
            String(Math.round(params.x)),
            String(Math.round(params.y)),
            '--target',
            target,
            '--duration',
            String(duration),
        ]);
        const data = {
            message: 'Tap executed successfully',
            coordinates: { x: params.x, y: params.y },
            note: 'UI interaction complete',
        };
        if (result.code === 0) {
            return {
                success: true,
                data,
                summary: `Tapped (${params.x}, ${params.y})`,
            };
        }
        else {
            return {
                success: false,
                error: 'Tap failed',
                details: result.stderr,
            };
        }
    }
    catch (error) {
        logger_js_1.logger.error('Tap failed', error);
        return {
            success: false,
            error: String(error),
            operation: 'tap',
        };
    }
}
