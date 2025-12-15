/**
 * Tests for config.ts - Configuration and usage tracking utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as path from "path";

// Mock fs/promises and os BEFORE importing config.ts
vi.mock("fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
}));

vi.mock("os", () => ({
  homedir: vi.fn(() => "/Users/testuser"),
}));

// Now import after mocking
import * as fs from "fs/promises";
import * as os from "os";
import { saveUsage } from "../../shared/utils/config.js";

const mockFs = fs as unknown as {
  readFile: ReturnType<typeof vi.fn>;
  writeFile: ReturnType<typeof vi.fn>;
  mkdir: ReturnType<typeof vi.fn>;
};

const mockOs = os as unknown as {
  homedir: ReturnType<typeof vi.fn>;
};

describe("Config System", () => {
  const mockHomeDir = "/Users/testuser";
  const userConfigPath = path.join(mockHomeDir, ".xcplugin", "config.json");

  beforeEach(() => {
    // Use mockClear to completely reset all mock state
    vi.clearAllMocks();

    // Re-establish the base mocks
    mockOs.homedir.mockReturnValue(mockHomeDir);
    mockFs.readFile.mockRejectedValue({ code: "ENOENT" });
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("saveUsage", () => {
    const destination = "platform=iOS Simulator,name=iPhone 15,OS=18.0";

    it("should create new usage entry", async () => {
      mockFs.readFile.mockRejectedValue({ code: "ENOENT" });

      await saveUsage(destination);

      expect(mockFs.mkdir).toHaveBeenCalledWith(
        path.join(mockHomeDir, ".xcplugin"),
        { recursive: true },
      );

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        userConfigPath,
        expect.stringContaining(destination),
        "utf-8",
      );

      const writtenConfig = JSON.parse(
        mockFs.writeFile.mock.calls[0][1] as string,
      );
      expect(writtenConfig.recentSimulators).toHaveLength(1);
      expect(writtenConfig.recentSimulators[0].destination).toBe(destination);
      expect(writtenConfig.recentSimulators[0].count).toBe(1);
    });

    it("should update existing usage entry", async () => {
      const existingConfig = {
        recentSimulators: [
          {
            destination,
            lastUsed: "2025-01-01T00:00:00.000Z",
            count: 3,
          },
        ],
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(existingConfig));

      await saveUsage(destination);

      const writtenConfig = JSON.parse(
        mockFs.writeFile.mock.calls[0][1] as string,
      );
      expect(writtenConfig.recentSimulators).toHaveLength(1);
      expect(writtenConfig.recentSimulators[0].count).toBe(4);
      expect(
        new Date(writtenConfig.recentSimulators[0].lastUsed).getTime(),
      ).toBeGreaterThan(new Date("2025-01-01T00:00:00.000Z").getTime());
    });

    it("should sort by most recent first", async () => {
      const existingConfig = {
        recentSimulators: [
          {
            destination: "platform=iOS Simulator,name=iPhone 14,OS=17.5",
            lastUsed: "2025-01-02T00:00:00.000Z",
            count: 2,
          },
        ],
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(existingConfig));

      await saveUsage(destination);

      const writtenConfig = JSON.parse(
        mockFs.writeFile.mock.calls[0][1] as string,
      );
      expect(writtenConfig.recentSimulators[0].destination).toBe(destination);
      expect(writtenConfig.recentSimulators[1].destination).toBe(
        "platform=iOS Simulator,name=iPhone 14,OS=17.5",
      );
    });

    it("should limit history to maxRecentHistory", async () => {
      const existingConfig = {
        maxRecentHistory: 3,
        recentSimulators: [
          {
            destination: "platform=iOS Simulator,name=iPhone 14,OS=17.5",
            lastUsed: "2025-01-03T00:00:00.000Z",
            count: 1,
          },
          {
            destination: "platform=iOS Simulator,name=iPhone 13,OS=17.0",
            lastUsed: "2025-01-02T00:00:00.000Z",
            count: 1,
          },
          {
            destination: "platform=iOS Simulator,name=iPhone 12,OS=16.0",
            lastUsed: "2025-01-01T00:00:00.000Z",
            count: 1,
          },
        ],
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(existingConfig));

      await saveUsage(destination);

      const writtenConfig = JSON.parse(
        mockFs.writeFile.mock.calls[0][1] as string,
      );
      expect(writtenConfig.recentSimulators).toHaveLength(3);
      expect(writtenConfig.recentSimulators[0].destination).toBe(destination);
      // Oldest entry should be removed
      expect(
        writtenConfig.recentSimulators.find((s: { destination: string }) =>
          s.destination.includes("iPhone 12"),
        ),
      ).toBeUndefined();
    });

    it("should handle write failures gracefully", async () => {
      mockFs.writeFile.mockRejectedValue(new Error("Permission denied"));

      // Should not throw
      await expect(saveUsage(destination)).resolves.toBeUndefined();
    });

    it("should preserve other config properties", async () => {
      const existingConfig = {
        defaultSimulator: "platform=iOS Simulator,name=iPhone 15",
        maxRecentHistory: 15,
        recentSimulators: [],
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(existingConfig));

      await saveUsage(destination);

      const writtenConfig = JSON.parse(
        mockFs.writeFile.mock.calls[0][1] as string,
      );
      expect(writtenConfig.defaultSimulator).toBe(
        existingConfig.defaultSimulator,
      );
      expect(writtenConfig.maxRecentHistory).toBe(
        existingConfig.maxRecentHistory,
      );
    });
  });
});
