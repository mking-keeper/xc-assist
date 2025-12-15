/**
 * Simulator Location Tool
 *
 * Control simulated GPS location
 */

import type { ToolDefinition, ToolResult } from "../../types/base.js";
import { runCommand } from "../../utils/command.js";
import { logger } from "../../utils/logger.js";

export interface LocationParams {
  device_id?: string;
  action: "set" | "clear" | "start" | "list";
  latitude?: number;
  longitude?: number;
  waypoints?: Array<{ latitude: number; longitude: number }>;
  speed?: number;
  scenario?: string;
}

export interface LocationResultData {
  message: string;
  action: string;
  coordinates?: { latitude: number; longitude: number };
  scenarios?: string[];
  note?: string;
}

export const simulatorSetLocationDefinition: ToolDefinition = {
  name: "simulator_set_location",
  description: "Control the simulated GPS location of a simulator",
  inputSchema: {
    type: "object",
    properties: {
      device_id: {
        type: "string",
        description: 'Device UDID or "booted" for active simulator',
      },
      action: {
        type: "string",
        enum: ["set", "clear", "start", "list"],
        description:
          "Action: 'set' for single location, 'clear' to reset, 'start' for waypoint route, 'list' for available scenarios",
      },
      latitude: {
        type: "number",
        description: "Latitude coordinate (required for 'set' action)",
      },
      longitude: {
        type: "number",
        description: "Longitude coordinate (required for 'set' action)",
      },
      waypoints: {
        type: "array",
        description:
          "Array of waypoints for 'start' action (simulates movement between points)",
        items: {
          type: "object",
          properties: {
            latitude: { type: "number" },
            longitude: { type: "number" },
          },
          required: ["latitude", "longitude"],
        },
      },
      speed: {
        type: "number",
        description: "Movement speed in meters/second for 'start' action (default: 20)",
      },
      scenario: {
        type: "string",
        description: "Predefined scenario name (use 'list' to see available)",
      },
    },
    required: ["action"],
  },
};

export async function simulatorSetLocation(
  params: LocationParams,
): Promise<ToolResult<LocationResultData>> {
  try {
    const deviceId = params.device_id || "booted";

    switch (params.action) {
      case "set": {
        if (params.latitude === undefined || params.longitude === undefined) {
          return {
            success: false,
            error: "latitude and longitude are required for 'set' action",
            operation: "location",
          };
        }

        logger.info(
          `Setting location on ${deviceId}: ${params.latitude},${params.longitude}`,
        );
        const result = await runCommand("xcrun", [
          "simctl",
          "location",
          deviceId,
          "set",
          `${params.latitude},${params.longitude}`,
        ]);

        if (result.code === 0) {
          return {
            success: true as const,
            data: {
              message: "Location set successfully",
              action: "set",
              coordinates: {
                latitude: params.latitude,
                longitude: params.longitude,
              },
            },
            summary: `Location set to ${params.latitude},${params.longitude}`,
          };
        } else {
          return {
            success: false as const,
            error: "Failed to set location",
            details: result.stderr,
          };
        }
      }

      case "clear": {
        logger.info(`Clearing location on ${deviceId}`);
        const result = await runCommand("xcrun", [
          "simctl",
          "location",
          deviceId,
          "clear",
        ]);

        if (result.code === 0) {
          return {
            success: true as const,
            data: {
              message: "Location cleared",
              action: "clear",
            },
            summary: "Location cleared",
          };
        } else {
          return {
            success: false as const,
            error: "Failed to clear location",
            details: result.stderr,
          };
        }
      }

      case "start": {
        if (!params.waypoints || params.waypoints.length < 2) {
          return {
            success: false,
            error: "At least 2 waypoints are required for 'start' action",
            operation: "location",
          };
        }

        const args = ["simctl", "location", deviceId, "start"];

        if (params.speed) {
          args.push(`--speed=${params.speed}`);
        }

        // Add waypoints
        for (const wp of params.waypoints) {
          args.push(`${wp.latitude},${wp.longitude}`);
        }

        logger.info(`Starting location route on ${deviceId} with ${params.waypoints.length} waypoints`);
        const result = await runCommand("xcrun", args);

        if (result.code === 0) {
          return {
            success: true as const,
            data: {
              message: "Location route started",
              action: "start",
              note: `Simulating movement through ${params.waypoints.length} waypoints`,
            },
            summary: `Route started with ${params.waypoints.length} waypoints`,
          };
        } else {
          return {
            success: false as const,
            error: "Failed to start location route",
            details: result.stderr,
          };
        }
      }

      case "list": {
        logger.info(`Listing location scenarios on ${deviceId}`);
        const result = await runCommand("xcrun", [
          "simctl",
          "location",
          deviceId,
          "list",
        ]);

        if (result.code === 0) {
          const scenarios = result.stdout
            .split("\n")
            .filter((line) => line.trim())
            .map((line) => line.trim());

          return {
            success: true as const,
            data: {
              message: "Available location scenarios",
              action: "list",
              scenarios,
            },
            summary: `${scenarios.length} scenarios available`,
          };
        } else {
          return {
            success: false as const,
            error: "Failed to list scenarios",
            details: result.stderr,
          };
        }
      }

      default:
        return {
          success: false,
          error: `Unknown action: ${params.action}`,
          operation: "location",
        };
    }
  } catch (error) {
    logger.error("Location operation failed", error as Error);
    return {
      success: false,
      error: String(error),
      operation: "location",
    };
  }
}
