#!/usr/bin/env node
/**
 * XC-Assist MCP Server
 *
 * Comprehensive UI testing with gestures, deep links, and app lifecycle
 * 15 tools for building, UI inspection, interaction, and simulator control
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Import Xcode tools
import { xcodeBuild, xcodeBuildDefinition } from '../../shared/tools/xcode/build.js';

// Import simulator tools
import { simulatorScreenshot, simulatorScreenshotDefinition } from '../../shared/tools/simulator/screenshot.js';
import { simulatorOpenURL, simulatorOpenURLDefinition } from '../../shared/tools/simulator/openurl.js';
import { simulatorTerminateApp, simulatorTerminateAppDefinition } from '../../shared/tools/simulator/terminate-app.js';
import { simulatorGetAppContainer, simulatorGetAppContainerDefinition } from '../../shared/tools/simulator/get-app-container.js';
import { simulatorList, simulatorListDefinition } from '../../shared/tools/simulator/list.js';
import { simulatorBoot, simulatorBootDefinition } from '../../shared/tools/simulator/boot.js';
import { simulatorInstallApp, simulatorInstallAppDefinition } from '../../shared/tools/simulator/install-app.js';
import { simulatorLaunchApp, simulatorLaunchAppDefinition } from '../../shared/tools/simulator/launch-app.js';

// Import IDB tools
import { idbDescribe, idbDescribeDefinition } from '../../shared/tools/idb/describe.js';
import { idbTap, idbTapDefinition } from '../../shared/tools/idb/tap.js';
import { idbInput, idbInputDefinition } from '../../shared/tools/idb/input.js';
import { idbGesture, idbGestureDefinition } from '../../shared/tools/idb/gesture.js';
import { idbFindElement, idbFindElementDefinition } from '../../shared/tools/idb/find-element.js';
import { idbCheckQuality, idbCheckQualityDefinition } from '../../shared/tools/idb/check-quality.js';

class XCAssistServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'xc-assist',
        version: '1.0.0',
        title: 'iOS Simulator Testing',
        description: 'UI testing with gestures, deep links, app lifecycle, and accessibility-first automation',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.registerTools();
  }

  private registerTools() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // Build
        xcodeBuildDefinition,
        // Simulator lifecycle
        simulatorListDefinition,
        simulatorBootDefinition,
        simulatorInstallAppDefinition,
        simulatorLaunchAppDefinition,
        simulatorTerminateAppDefinition,
        // UI inspection
        idbDescribeDefinition,
        idbFindElementDefinition,
        idbCheckQualityDefinition,
        // UI interaction
        idbTapDefinition,
        idbInputDefinition,
        idbGestureDefinition,
        // Simulator utilities
        simulatorScreenshotDefinition,
        simulatorOpenURLDefinition,
        simulatorGetAppContainerDefinition,
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        // Build
        case 'xcode_build':
          return { content: [{ type: 'text', text: JSON.stringify(await xcodeBuild(args as unknown as Parameters<typeof xcodeBuild>[0])) }] };

        // Simulator lifecycle
        case 'simulator_list':
          return { content: [{ type: 'text', text: JSON.stringify(await simulatorList(args as unknown as Parameters<typeof simulatorList>[0])) }] };

        case 'simulator_boot':
          return { content: [{ type: 'text', text: JSON.stringify(await simulatorBoot(args as unknown as Parameters<typeof simulatorBoot>[0])) }] };

        case 'simulator_install_app':
          return { content: [{ type: 'text', text: JSON.stringify(await simulatorInstallApp(args as unknown as Parameters<typeof simulatorInstallApp>[0])) }] };

        case 'simulator_launch_app':
          return { content: [{ type: 'text', text: JSON.stringify(await simulatorLaunchApp(args as unknown as Parameters<typeof simulatorLaunchApp>[0])) }] };

        case 'simulator_terminate_app':
          return { content: [{ type: 'text', text: JSON.stringify(await simulatorTerminateApp(args as unknown as Parameters<typeof simulatorTerminateApp>[0])) }] };

        // UI inspection
        case 'idb_describe':
          return { content: [{ type: 'text', text: JSON.stringify(await idbDescribe(args as unknown as Parameters<typeof idbDescribe>[0])) }] };

        case 'idb_find_element':
          return { content: [{ type: 'text', text: JSON.stringify(await idbFindElement(args as unknown as Parameters<typeof idbFindElement>[0])) }] };

        case 'idb_check_quality':
          return { content: [{ type: 'text', text: JSON.stringify(await idbCheckQuality(args as unknown as Parameters<typeof idbCheckQuality>[0])) }] };

        // UI interaction
        case 'idb_tap':
          return { content: [{ type: 'text', text: JSON.stringify(await idbTap(args as unknown as Parameters<typeof idbTap>[0])) }] };

        case 'idb_input':
          return { content: [{ type: 'text', text: JSON.stringify(await idbInput(args as unknown as Parameters<typeof idbInput>[0])) }] };

        case 'idb_gesture':
          return { content: [{ type: 'text', text: JSON.stringify(await idbGesture(args as unknown as Parameters<typeof idbGesture>[0])) }] };

        // Simulator utilities
        case 'simulator_screenshot':
          return { content: [{ type: 'text', text: JSON.stringify(await simulatorScreenshot(args as unknown as Parameters<typeof simulatorScreenshot>[0])) }] };

        case 'simulator_openurl':
          return { content: [{ type: 'text', text: JSON.stringify(await simulatorOpenURL(args as unknown as Parameters<typeof simulatorOpenURL>[0])) }] };

        case 'simulator_get_app_container':
          return { content: [{ type: 'text', text: JSON.stringify(await simulatorGetAppContainer(args as unknown as Parameters<typeof simulatorGetAppContainer>[0])) }] };

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('xc-assist MCP server running');
  }
}

const server = new XCAssistServer();
server.run().catch(console.error);
