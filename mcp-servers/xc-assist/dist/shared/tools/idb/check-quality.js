"use strict";
/**
 * IDB Check Accessibility Quality Tool
 *
 * Assess accessibility data quality (determines if screenshot needed)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.idbCheckQualityDefinition = void 0;
exports.idbCheckQuality = idbCheckQuality;
const command_js_1 = require("../../utils/command.js");
const logger_js_1 = require("../../utils/logger.js");
exports.idbCheckQualityDefinition = {
    name: 'idb_check_quality',
    description: 'Check accessibility data quality (use before deciding on screenshot)',
    inputSchema: {
        type: 'object',
        properties: {
            target: {
                type: 'string',
                description: 'Target device (default: "booted")',
            },
        },
    },
};
async function idbCheckQuality(params) {
    try {
        const target = params.target || 'booted';
        // Execute describe to get all elements
        logger_js_1.logger.info('Checking accessibility quality');
        const result = await (0, command_js_1.runCommand)('idb', ['ui', 'describe-all', '--target', target, '--json']);
        // Parse and analyze
        const json = JSON.parse(result.stdout);
        let totalElements = 0;
        let labeledElements = 0;
        let interactiveElements = 0;
        if (Array.isArray(json)) {
            totalElements = json.length;
            labeledElements = json.filter((e) => e.label && e.label.length > 0).length;
            interactiveElements = json.filter((e) => e.type?.includes('Button') || e.type?.includes('TextField')).length;
        }
        // Calculate quality score
        const labelRatio = totalElements > 0 ? labeledElements / totalElements : 0;
        const score = Math.round(labelRatio * 100);
        // Determine recommendation
        let recommendation = '';
        if (score >= 70) {
            recommendation = 'Accessibility data sufficient - use idb_describe';
        }
        else if (score >= 40) {
            recommendation = 'Moderate accessibility - try idb_describe first, screenshot if needed';
        }
        else {
            recommendation = 'Poor accessibility data - screenshot recommended';
        }
        const data = {
            score,
            labeled_elements: labeledElements,
            interactive_elements: interactiveElements,
            total_elements: totalElements,
            recommendation,
            message: `Accessibility score: ${score}%`,
        };
        return {
            success: true,
            data,
            summary: `Score: ${score}%`,
        };
    }
    catch (error) {
        logger_js_1.logger.error('Check quality failed', error);
        return {
            success: false,
            error: String(error),
            operation: 'check-quality',
        };
    }
}
