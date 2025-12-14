"use strict";
/**
 * Xcode Build Tool
 *
 * Compile Xcode projects with configuration options
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.xcodeBuildDefinition = void 0;
exports.xcodeBuild = xcodeBuild;
const command_js_1 = require("../../utils/command.js");
const logger_js_1 = require("../../utils/logger.js");
const destination_js_1 = require("../../utils/destination.js");
exports.xcodeBuildDefinition = {
    name: "xcode_build",
    description: "Build Xcode project for iOS apps. Check project's CLAUDE.md for preferred simulator and SDK defaults when parameters are not explicitly provided.",
    inputSchema: {
        type: "object",
        properties: {
            project_path: {
                type: "string",
                description: "Path to .xcodeproj or .xcworkspace (auto-detected if omitted)",
            },
            scheme: {
                type: "string",
                description: "Scheme name (required)",
            },
            configuration: {
                type: "string",
                enum: ["Debug", "Release"],
                description: "Build configuration (default: Debug)",
            },
            destination: {
                type: "string",
                description: 'Simulator destination. Formats: "platform=iOS Simulator,name=iPhone 15" (auto-resolves OS) | "platform=iOS Simulator,name=iPhone 15,OS=18.0" | "id=UDID". If not specified, agents should check CLAUDE.md for project defaults.',
            },
        },
        required: ["scheme"],
    },
};
async function xcodeBuild(params) {
    try {
        // Validation
        if (!params.scheme) {
            return {
                success: false,
                error: "Scheme required",
                operation: "build",
            };
        }
        // Find project if not specified
        const projectPath = params.project_path || (await (0, command_js_1.findXcodeProject)());
        if (!projectPath) {
            return {
                success: false,
                error: "No Xcode project found in current directory",
                operation: "build",
            };
        }
        // Build command args
        const args = [
            "-scheme",
            params.scheme,
            "-configuration",
            params.configuration || "Debug",
        ];
        if (projectPath.endsWith(".xcworkspace")) {
            args.unshift("-workspace", projectPath);
        }
        else {
            args.unshift("-project", projectPath);
        }
        if (params.destination) {
            // Resolve destination (auto-complete OS version if needed)
            // Pass projectPath for potential project-specific config
            const resolution = await (0, destination_js_1.resolveDestination)(params.destination, projectPath);
            // Log resolution details
            if (resolution.wasResolved) {
                logger_js_1.logger.info(`Resolved destination: ${resolution.details}`);
            }
            if (resolution.warning) {
                logger_js_1.logger.warn(`Destination warning: ${resolution.warning}`);
            }
            args.push("-destination", resolution.destination);
        }
        args.push("build");
        // Execute build
        logger_js_1.logger.info(`Building project: ${params.scheme}`);
        const startTime = Date.now();
        const result = await (0, command_js_1.runCommand)("xcodebuild", args);
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        // Extract errors if build failed
        const errors = result.code !== 0
            ? (0, command_js_1.extractBuildErrors)(result.stdout + "\n" + result.stderr)
            : undefined;
        // Return result
        const data = {
            message: `Build ${result.code === 0 ? "succeeded" : "failed"} in ${duration}s`,
            duration,
            errors,
        };
        if (result.code === 0) {
            return {
                success: true,
                data,
                summary: "Build succeeded",
            };
        }
        else {
            return {
                success: false,
                error: `Build failed in ${duration}s`,
                details: errors?.join("\n"),
            };
        }
    }
    catch (error) {
        logger_js_1.logger.error("Build failed", error);
        return {
            success: false,
            error: String(error),
            operation: "build",
        };
    }
}
