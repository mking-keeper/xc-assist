/**
 * Tests for simulator location tool
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { simulatorSetLocation } from "../../../shared/tools/simulator/location.js";
import * as commandUtils from "../../../shared/utils/command.js";

vi.mock("../../../shared/utils/command", async () => {
  const actual = await vi.importActual("../../../shared/utils/command");
  return {
    ...actual,
    runCommand: vi.fn(),
  };
});

describe("simulatorSetLocation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("set action", () => {
    it("should set location with coordinates", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue({
        stdout: "",
        stderr: "",
        code: 0,
      });

      const result = await simulatorSetLocation({
        action: "set",
        latitude: 37.7749,
        longitude: -122.4194,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.action).toBe("set");
        expect(result.data.coordinates?.latitude).toBe(37.7749);
        expect(result.data.coordinates?.longitude).toBe(-122.4194);
      }
    });

    it("should require latitude for set action", async () => {
      const result = await simulatorSetLocation({
        action: "set",
        longitude: -122.4194,
      } as any);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("latitude and longitude are required");
      }
    });

    it("should require longitude for set action", async () => {
      const result = await simulatorSetLocation({
        action: "set",
        latitude: 37.7749,
      } as any);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("latitude and longitude are required");
      }
    });

    it("should use booted device by default", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue({
        stdout: "",
        stderr: "",
        code: 0,
      });

      await simulatorSetLocation({
        action: "set",
        latitude: 37.7749,
        longitude: -122.4194,
      });

      expect(mockRunCommand).toHaveBeenCalledWith(
        "xcrun",
        expect.arrayContaining(["simctl", "location", "booted", "set"]),
      );
    });

    it("should use custom device ID when specified", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue({
        stdout: "",
        stderr: "",
        code: 0,
      });

      await simulatorSetLocation({
        action: "set",
        latitude: 37.7749,
        longitude: -122.4194,
        device_id: "DEVICE-123",
      });

      expect(mockRunCommand).toHaveBeenCalledWith(
        "xcrun",
        expect.arrayContaining(["location", "DEVICE-123"]),
      );
    });

    it("should handle set failures", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue({
        stdout: "",
        stderr: "Invalid coordinates",
        code: 1,
      });

      const result = await simulatorSetLocation({
        action: "set",
        latitude: 999,
        longitude: 999,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Failed to set location");
      }
    });
  });

  describe("clear action", () => {
    it("should clear location", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue({
        stdout: "",
        stderr: "",
        code: 0,
      });

      const result = await simulatorSetLocation({ action: "clear" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.action).toBe("clear");
        expect(result.summary).toBe("Location cleared");
      }
    });

    it("should handle clear failures", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue({
        stdout: "",
        stderr: "Device not found",
        code: 1,
      });

      const result = await simulatorSetLocation({ action: "clear" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Failed to clear location");
      }
    });
  });

  describe("start action", () => {
    it("should start location route with waypoints", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue({
        stdout: "",
        stderr: "",
        code: 0,
      });

      const result = await simulatorSetLocation({
        action: "start",
        waypoints: [
          { latitude: 37.7749, longitude: -122.4194 },
          { latitude: 37.8044, longitude: -122.2712 },
        ],
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.action).toBe("start");
        expect(result.data.note).toContain("2 waypoints");
      }
    });

    it("should require at least 2 waypoints", async () => {
      const result = await simulatorSetLocation({
        action: "start",
        waypoints: [{ latitude: 37.7749, longitude: -122.4194 }],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("At least 2 waypoints are required");
      }
    });

    it("should require waypoints for start action", async () => {
      const result = await simulatorSetLocation({
        action: "start",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("At least 2 waypoints are required");
      }
    });

    it("should include speed when specified", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue({
        stdout: "",
        stderr: "",
        code: 0,
      });

      await simulatorSetLocation({
        action: "start",
        waypoints: [
          { latitude: 37.7749, longitude: -122.4194 },
          { latitude: 37.8044, longitude: -122.2712 },
        ],
        speed: 50,
      });

      expect(mockRunCommand).toHaveBeenCalledWith(
        "xcrun",
        expect.arrayContaining(["--speed=50"]),
      );
    });

    it("should handle start failures", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue({
        stdout: "",
        stderr: "Route failed",
        code: 1,
      });

      const result = await simulatorSetLocation({
        action: "start",
        waypoints: [
          { latitude: 37.7749, longitude: -122.4194 },
          { latitude: 37.8044, longitude: -122.2712 },
        ],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Failed to start location route");
      }
    });
  });

  describe("list action", () => {
    it("should list available scenarios", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue({
        stdout: "City Run\nCity Bicycle Ride\nFreeway Drive",
        stderr: "",
        code: 0,
      });

      const result = await simulatorSetLocation({ action: "list" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.action).toBe("list");
        expect(result.data.scenarios).toContain("City Run");
        expect(result.data.scenarios?.length).toBe(3);
      }
    });

    it("should handle list failures", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue({
        stdout: "",
        stderr: "Failed",
        code: 1,
      });

      const result = await simulatorSetLocation({ action: "list" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Failed to list scenarios");
      }
    });
  });

  it("should handle unknown action", async () => {
    const result = await simulatorSetLocation({
      action: "invalid" as any,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Unknown action");
    }
  });

  it("should handle command execution errors", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockRejectedValue(new Error("Simulator crashed"));

    const result = await simulatorSetLocation({
      action: "set",
      latitude: 37.7749,
      longitude: -122.4194,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.operation).toBe("location");
    }
  });
});
