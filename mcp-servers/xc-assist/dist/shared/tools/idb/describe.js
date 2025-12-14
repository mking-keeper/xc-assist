"use strict";
/**
 * IDB Describe Tool
 *
 * Query UI accessibility tree (accessibility-first approach)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.idbDescribeDefinition = void 0;
exports.idbDescribe = idbDescribe;
const command_js_1 = require("../../utils/command.js");
const logger_js_1 = require("../../utils/logger.js");
exports.idbDescribeDefinition = {
    name: "idb_describe",
    description: "Query UI accessibility tree",
    inputSchema: {
        type: "object",
        properties: {
            target: {
                type: "string",
                description: 'Target device (default: "booted")',
            },
            operation: {
                type: "string",
                enum: ["all", "point"],
                description: "Get all elements or query specific point",
            },
            x: {
                type: "number",
                description: "X coordinate (for point operation)",
            },
            y: {
                type: "number",
                description: "Y coordinate (for point operation)",
            },
        },
    },
};
async function idbDescribe(params) {
    try {
        const target = params.target || "booted";
        const operation = params.operation || "all";
        // Execute describe command
        logger_js_1.logger.info(`Querying accessibility tree: ${operation}`);
        let result;
        if (operation === "all") {
            result = await (0, command_js_1.runCommand)("idb", [
                "ui",
                "describe-all",
                "--target",
                target,
                "--json",
            ]);
        }
        else if (operation === "point" &&
            params.x !== undefined &&
            params.y !== undefined) {
            result = await (0, command_js_1.runCommand)("idb", [
                "ui",
                "describe-point",
                String(params.x),
                String(params.y),
                "--target",
                target,
                "--json",
            ]);
        }
        else {
            return {
                success: false,
                error: "Invalid operation or missing coordinates",
                operation: "describe",
            };
        }
        // Parse JSON output
        const json = JSON.parse(result.stdout);
        const elements = [];
        // Transform IDB output to our format
        if (Array.isArray(json)) {
            for (const elem of json) {
                elements.push({
                    label: elem.label,
                    value: elem.value,
                    type: elem.type,
                    centerX: elem.frame?.x + elem.frame?.width / 2,
                    centerY: elem.frame?.y + elem.frame?.height / 2,
                    frame: elem.frame,
                });
            }
        }
        const data = {
            message: `Found ${elements.length} UI elements`,
            elements: operation === "all" ? elements : undefined,
            element: operation === "point" ? elements[0] : undefined,
            note: "Use centerX/centerY for tap coordinates",
        };
        return {
            success: true,
            data,
            summary: `${elements.length} elements`,
        };
    }
    catch (error) {
        logger_js_1.logger.error("Describe failed", error);
        return {
            success: false,
            error: String(error),
            operation: "describe",
        };
    }
}
