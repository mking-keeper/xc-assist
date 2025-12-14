"use strict";
/**
 * IDB Find Element Tool
 *
 * Search UI elements by label/identifier (semantic search)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.idbFindElementDefinition = void 0;
exports.idbFindElement = idbFindElement;
const command_js_1 = require("../../utils/command.js");
const logger_js_1 = require("../../utils/logger.js");
exports.idbFindElementDefinition = {
    name: 'idb_find_element',
    description: 'Search UI elements by label or identifier (semantic search)',
    inputSchema: {
        type: 'object',
        properties: {
            target: {
                type: 'string',
                description: 'Target device (default: "booted")',
            },
            query: {
                type: 'string',
                description: 'Element label or identifier to search for',
            },
        },
        required: ['query'],
    },
};
async function idbFindElement(params) {
    try {
        // Validation
        if (!params.query) {
            return {
                success: false,
                error: 'query required',
                operation: 'find-element',
            };
        }
        const target = params.target || 'booted';
        // Execute find command
        logger_js_1.logger.info(`Finding element: ${params.query}`);
        const result = await (0, command_js_1.runCommand)('idb', [
            'ui',
            'describe-all',
            '--target',
            target,
            '--json',
        ]);
        // Parse and filter results
        const json = JSON.parse(result.stdout);
        const matches = [];
        if (Array.isArray(json)) {
            for (const elem of json) {
                // Match on label or value
                if (elem.label?.toLowerCase().includes(params.query.toLowerCase()) ||
                    elem.value?.toLowerCase().includes(params.query.toLowerCase())) {
                    matches.push({
                        label: elem.label,
                        value: elem.value,
                        type: elem.type,
                        centerX: elem.frame?.x + elem.frame?.width / 2,
                        centerY: elem.frame?.y + elem.frame?.height / 2,
                        frame: elem.frame,
                    });
                }
            }
        }
        const data = {
            message: `Found ${matches.length} matching elements`,
            matches,
            count: matches.length,
        };
        return {
            success: true,
            data,
            summary: `${matches.length} matches`,
        };
    }
    catch (error) {
        logger_js_1.logger.error('Find element failed', error);
        return {
            success: false,
            error: String(error),
            operation: 'find-element',
        };
    }
}
