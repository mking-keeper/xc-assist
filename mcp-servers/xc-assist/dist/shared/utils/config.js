import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
const USER_CONFIG_DIR = path.join(os.homedir(), ".xcplugin");
const USER_CONFIG_FILE = path.join(USER_CONFIG_DIR, "config.json");
const PROJECT_CONFIG_FILE = ".xcplugin";
/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
    maxRecentHistory: 10,
    recentSimulators: [],
};
/**
 * Loads user-level configuration from ~/.xcplugin/config.json
 */
async function loadUserConfig() {
    try {
        const content = await fs.readFile(USER_CONFIG_FILE, "utf-8");
        return JSON.parse(content);
    }
    catch (error) {
        if (error.code === "ENOENT") {
            return {};
        }
        console.warn(`Failed to load user config: ${error.message}`);
        return {};
    }
}
/**
 * Loads project-level configuration from .xcplugin in project root
 */
async function loadProjectConfig(projectPath) {
    const configPath = path.join(projectPath || process.cwd(), PROJECT_CONFIG_FILE);
    try {
        const content = await fs.readFile(configPath, "utf-8");
        return JSON.parse(content);
    }
    catch (error) {
        if (error.code === "ENOENT") {
            return {};
        }
        console.warn(`Failed to load project config: ${error.message}`);
        return {};
    }
}
/**
 * Saves usage tracking for a simulator destination
 * Updates the most recently used simulator and increments usage count
 *
 * @param destination - Resolved destination string to track
 * @param projectPath - Optional project path for project-specific tracking
 */
export async function saveUsage(destination, projectPath) {
    try {
        // Load current config
        const userConfig = await loadUserConfig();
        const projectConfig = await loadProjectConfig(projectPath);
        const config = { ...DEFAULT_CONFIG, ...userConfig, ...projectConfig };
        const maxHistory = config.maxRecentHistory || DEFAULT_CONFIG.maxRecentHistory || 10;
        // Initialize or get existing recent simulators
        const recentSimulators = config.recentSimulators || [];
        // Find existing entry
        const existingIndex = recentSimulators.findIndex((entry) => entry.destination === destination);
        if (existingIndex >= 0) {
            // Update existing entry
            recentSimulators[existingIndex] = {
                destination,
                lastUsed: new Date().toISOString(),
                count: recentSimulators[existingIndex].count + 1,
            };
        }
        else {
            // Add new entry
            recentSimulators.push({
                destination,
                lastUsed: new Date().toISOString(),
                count: 1,
            });
        }
        // Sort by last used (most recent first)
        recentSimulators.sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime());
        // Trim to max history
        const trimmedRecentSimulators = recentSimulators.slice(0, maxHistory);
        // Save back to user config (we track usage globally, not per-project)
        const updatedConfig = {
            ...userConfig,
            recentSimulators: trimmedRecentSimulators,
        };
        // Ensure config directory exists
        await fs.mkdir(USER_CONFIG_DIR, { recursive: true });
        // Write updated config
        await fs.writeFile(USER_CONFIG_FILE, JSON.stringify(updatedConfig, null, 2), "utf-8");
    }
    catch (error) {
        console.warn(`Failed to save usage: ${error.message}`);
        // Don't throw - usage tracking is non-critical
    }
}
