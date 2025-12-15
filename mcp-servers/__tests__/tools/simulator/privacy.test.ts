/**
 * Tests for simulator privacy tool
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { simulatorPrivacy } from "../../../shared/tools/simulator/privacy.js";
import * as commandUtils from "../../../shared/utils/command.js";

vi.mock("../../../shared/utils/command", async () => {
  const actual = await vi.importActual("../../../shared/utils/command");
  return {
    ...actual,
    runCommand: vi.fn(),
  };
});

describe("simulatorPrivacy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("grant action", () => {
    it("should grant permission to an app", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue({
        stdout: "",
        stderr: "",
        code: 0,
      });

      const result = await simulatorPrivacy({
        action: "grant",
        service: "location",
        bundle_id: "com.example.app",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.action).toBe("grant");
        expect(result.data.service).toBe("location");
        expect(result.data.bundle_id).toBe("com.example.app");
        expect(result.data.message).toContain("granted");
      }
    });

    it("should require bundle_id for grant action", async () => {
      const result = await simulatorPrivacy({
        action: "grant",
        service: "location",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("bundle_id is required");
      }
    });

    it("should use booted device by default", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue({
        stdout: "",
        stderr: "",
        code: 0,
      });

      await simulatorPrivacy({
        action: "grant",
        service: "photos",
        bundle_id: "com.example.app",
      });

      expect(mockRunCommand).toHaveBeenCalledWith(
        "xcrun",
        expect.arrayContaining([
          "simctl",
          "privacy",
          "booted",
          "grant",
          "photos",
          "com.example.app",
        ]),
      );
    });

    it("should use custom device ID when specified", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue({
        stdout: "",
        stderr: "",
        code: 0,
      });

      await simulatorPrivacy({
        action: "grant",
        service: "photos",
        bundle_id: "com.example.app",
        device_id: "DEVICE-123",
      });

      expect(mockRunCommand).toHaveBeenCalledWith(
        "xcrun",
        expect.arrayContaining(["privacy", "DEVICE-123"]),
      );
    });

    it("should include note about app restart", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue({
        stdout: "",
        stderr: "",
        code: 0,
      });

      const result = await simulatorPrivacy({
        action: "grant",
        service: "microphone",
        bundle_id: "com.example.app",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.note).toContain("restart");
      }
    });
  });

  describe("revoke action", () => {
    it("should revoke permission from an app", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue({
        stdout: "",
        stderr: "",
        code: 0,
      });

      const result = await simulatorPrivacy({
        action: "revoke",
        service: "contacts",
        bundle_id: "com.example.app",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.action).toBe("revoke");
        expect(result.data.message).toContain("revoked");
      }
    });

    it("should require bundle_id for revoke action", async () => {
      const result = await simulatorPrivacy({
        action: "revoke",
        service: "contacts",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("bundle_id is required");
      }
    });
  });

  describe("reset action", () => {
    it("should reset permission for an app", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue({
        stdout: "",
        stderr: "",
        code: 0,
      });

      const result = await simulatorPrivacy({
        action: "reset",
        service: "calendar",
        bundle_id: "com.example.app",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.action).toBe("reset");
        expect(result.data.message).toContain("reset");
        expect(result.data.note).toBeUndefined();
      }
    });

    it("should allow reset without bundle_id", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue({
        stdout: "",
        stderr: "",
        code: 0,
      });

      const result = await simulatorPrivacy({
        action: "reset",
        service: "all",
      });

      expect(result.success).toBe(true);
    });

    it("should reset all permissions when service is 'all'", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue({
        stdout: "",
        stderr: "",
        code: 0,
      });

      await simulatorPrivacy({
        action: "reset",
        service: "all",
      });

      expect(mockRunCommand).toHaveBeenCalledWith(
        "xcrun",
        expect.arrayContaining(["reset", "all"]),
      );
    });
  });

  it("should handle command failures", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "Invalid service",
      code: 1,
    });

    const result = await simulatorPrivacy({
      action: "grant",
      service: "location",
      bundle_id: "com.example.app",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Failed to grant permission");
    }
  });

  it("should handle command execution errors", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockRejectedValue(new Error("Simulator crashed"));

    const result = await simulatorPrivacy({
      action: "grant",
      service: "location",
      bundle_id: "com.example.app",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.operation).toBe("privacy");
    }
  });

  it("should return summary on success", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    const result = await simulatorPrivacy({
      action: "grant",
      service: "camera",
      bundle_id: "com.example.app",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.summary).toBe("camera granted");
    }
  });
});
