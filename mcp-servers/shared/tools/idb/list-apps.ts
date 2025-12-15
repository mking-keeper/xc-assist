/**
 * IDB List Apps Tool
 *
 * List installed applications on a simulator
 */

import type { ToolDefinition, ToolResult } from "../../types/base.js";
import type { ListAppsParams, ListAppsResultData } from "../../types/idb.js";
import { runCommand } from "../../utils/command.js";
import { logger } from "../../utils/logger.js";

export const idbListAppsDefinition: ToolDefinition = {
  name: "idb_list_apps",
  description: "List installed applications on the simulator",
  inputSchema: {
    type: "object",
    properties: {
      target: {
        type: "string",
        description: 'Target device (default: "booted")',
      },
      fetch_process_state: {
        type: "boolean",
        description:
          "Include process state (running/not running) for each app. May be slower.",
      },
    },
  },
};

interface IDBApp {
  bundle_id: string;
  name: string;
  install_type: string;
  architectures: string[];
  process_state?: string;
  debuggable?: boolean;
}

export interface ListAppsExtendedParams extends ListAppsParams {
  fetch_process_state?: boolean;
}

export async function idbListApps(
  params: ListAppsExtendedParams,
): Promise<ToolResult<ListAppsResultData>> {
  try {
    const target = params.target || "booted";

    const args = ["list-apps", "--json"];

    if (params.fetch_process_state) {
      args.push("--fetch-process-state");
    }

    if (target !== "booted") {
      args.push("--udid", target);
    }

    logger.info(`Listing apps on ${target}`);
    const result = await runCommand("idb", args);

    if (result.code !== 0) {
      return {
        success: false as const,
        error: "Failed to list apps",
        details: result.stderr,
      };
    }

    // Parse JSON output - each line is a JSON object
    const apps: Array<{
      bundle_id: string;
      name?: string;
      install_type?: string;
      process_state?: string;
    }> = [];

    const lines = result.stdout.split("\n").filter((line) => line.trim());

    for (const line of lines) {
      try {
        const app: IDBApp = JSON.parse(line);
        apps.push({
          bundle_id: app.bundle_id,
          name: app.name,
          install_type: app.install_type,
          process_state: app.process_state,
        });
      } catch {
        // Skip malformed lines
      }
    }

    // Sort by install type (user apps first) then by name
    apps.sort((a, b) => {
      if (a.install_type === "user" && b.install_type !== "user") return -1;
      if (a.install_type !== "user" && b.install_type === "user") return 1;
      return (a.name || a.bundle_id).localeCompare(b.name || b.bundle_id);
    });

    const data: ListAppsResultData = {
      apps,
      count: apps.length,
      message: `Found ${apps.length} apps`,
    };

    return {
      success: true as const,
      data,
      summary: `${apps.length} apps installed`,
    };
  } catch (error) {
    logger.error("List apps failed", error as Error);
    return {
      success: false,
      error: String(error),
      operation: "list-apps",
    };
  }
}
