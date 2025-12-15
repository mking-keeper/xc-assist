#!/usr/bin/env node
/**
 * XC-Assist MCP Server
 *
 * Comprehensive UI testing with gestures, deep links, and app lifecycle
 * Tools for building, UI inspection, interaction, and simulator control
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
// Import simulator tools
import { simulatorScreenshot, simulatorScreenshotDefinition, } from "../../shared/tools/simulator/screenshot.js";
import { simulatorOpenURL, simulatorOpenURLDefinition, } from "../../shared/tools/simulator/openurl.js";
import { simulatorTerminateApp, simulatorTerminateAppDefinition, } from "../../shared/tools/simulator/terminate-app.js";
import { simulatorList, simulatorListDefinition, } from "../../shared/tools/simulator/list.js";
import { simulatorLaunchApp, simulatorLaunchAppDefinition, } from "../../shared/tools/simulator/launch-app.js";
import { simulatorPush, simulatorPushDefinition, } from "../../shared/tools/simulator/push.js";
import { simulatorSetLocation, simulatorSetLocationDefinition, } from "../../shared/tools/simulator/location.js";
import { simulatorPrivacy, simulatorPrivacyDefinition, } from "../../shared/tools/simulator/privacy.js";
import { simulatorPasteboard, simulatorPasteboardDefinition, } from "../../shared/tools/simulator/pasteboard.js";
// Import IDB tools
import { idbDescribe, idbDescribeDefinition, } from "../../shared/tools/idb/describe.js";
import { idbTap, idbTapDefinition } from "../../shared/tools/idb/tap.js";
import { idbInput, idbInputDefinition } from "../../shared/tools/idb/input.js";
import { idbGesture, idbGestureDefinition, } from "../../shared/tools/idb/gesture.js";
import { idbFindElement, idbFindElementDefinition, } from "../../shared/tools/idb/find-element.js";
import { idbCheckQuality, idbCheckQualityDefinition, } from "../../shared/tools/idb/check-quality.js";
import { idbListApps, idbListAppsDefinition, } from "../../shared/tools/idb/list-apps.js";
class XCAssistServer {
    server;
    constructor() {
        this.server = new Server({
            name: "xc-assist",
            version: "1.0.0",
            title: "iOS Simulator Testing",
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.registerTools();
    }
    registerTools() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                // Simulator lifecycle
                simulatorListDefinition,
                simulatorLaunchAppDefinition,
                simulatorTerminateAppDefinition,
                // UI inspection
                idbDescribeDefinition,
                idbFindElementDefinition,
                idbCheckQualityDefinition,
                idbListAppsDefinition,
                // UI interaction
                idbTapDefinition,
                idbInputDefinition,
                idbGestureDefinition,
                // Simulator utilities
                simulatorScreenshotDefinition,
                simulatorOpenURLDefinition,
                // New tools
                simulatorPushDefinition,
                simulatorSetLocationDefinition,
                simulatorPrivacyDefinition,
                simulatorPasteboardDefinition,
            ],
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            switch (name) {
                // Simulator lifecycle
                case "simulator_list":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await simulatorList(args)),
                            },
                        ],
                    };
                case "simulator_launch_app":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await simulatorLaunchApp(args)),
                            },
                        ],
                    };
                case "simulator_terminate_app":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await simulatorTerminateApp(args)),
                            },
                        ],
                    };
                // UI inspection
                case "idb_describe":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await idbDescribe(args)),
                            },
                        ],
                    };
                case "idb_find_element":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await idbFindElement(args)),
                            },
                        ],
                    };
                case "idb_check_quality":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await idbCheckQuality(args)),
                            },
                        ],
                    };
                // UI interaction
                case "idb_tap":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await idbTap(args)),
                            },
                        ],
                    };
                case "idb_input":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await idbInput(args)),
                            },
                        ],
                    };
                case "idb_gesture":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await idbGesture(args)),
                            },
                        ],
                    };
                // Simulator utilities
                case "simulator_screenshot":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await simulatorScreenshot(args)),
                            },
                        ],
                    };
                case "simulator_openurl":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await simulatorOpenURL(args)),
                            },
                        ],
                    };
                // New tools
                case "simulator_push":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await simulatorPush(args)),
                            },
                        ],
                    };
                case "simulator_set_location":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await simulatorSetLocation(args)),
                            },
                        ],
                    };
                case "simulator_privacy":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await simulatorPrivacy(args)),
                            },
                        ],
                    };
                case "simulator_pasteboard":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await simulatorPasteboard(args)),
                            },
                        ],
                    };
                case "idb_list_apps":
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(await idbListApps(args)),
                            },
                        ],
                    };
                default:
                    throw new Error(`Unknown tool: ${name}`);
            }
        });
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("xc-assist MCP server running");
    }
}
const server = new XCAssistServer();
server.run().catch(console.error);
