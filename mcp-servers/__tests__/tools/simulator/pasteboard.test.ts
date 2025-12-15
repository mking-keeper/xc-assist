/**
 * Tests for simulator pasteboard tool
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { simulatorPasteboard } from "../../../shared/tools/simulator/pasteboard.js";
import * as commandUtils from "../../../shared/utils/command.js";

vi.mock("../../../shared/utils/command", async () => {
  const actual = await vi.importActual("../../../shared/utils/command");
  return {
    ...actual,
    runCommand: vi.fn(),
    runCommandWithInput: vi.fn(),
  };
});

describe("simulatorPasteboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("copy action", () => {
    it("should copy text to clipboard", async () => {
      const mockRunCommandWithInput = vi.mocked(
        commandUtils.runCommandWithInput,
      );
      mockRunCommandWithInput.mockResolvedValue({
        stdout: "",
        stderr: "",
        code: 0,
      });

      const result = await simulatorPasteboard({
        action: "copy",
        text: "Hello World",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.action).toBe("copy");
        expect(result.data.text).toBe("Hello World");
        expect(result.data.note).toContain("11 characters");
      }
    });

    it("should require text for copy action", async () => {
      const result = await simulatorPasteboard({
        action: "copy",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("text is required");
      }
    });

    it("should use booted device by default", async () => {
      const mockRunCommandWithInput = vi.mocked(
        commandUtils.runCommandWithInput,
      );
      mockRunCommandWithInput.mockResolvedValue({
        stdout: "",
        stderr: "",
        code: 0,
      });

      await simulatorPasteboard({
        action: "copy",
        text: "test",
      });

      expect(mockRunCommandWithInput).toHaveBeenCalledWith(
        "xcrun",
        ["simctl", "pbcopy", "booted"],
        "test",
      );
    });

    it("should use custom device ID when specified", async () => {
      const mockRunCommandWithInput = vi.mocked(
        commandUtils.runCommandWithInput,
      );
      mockRunCommandWithInput.mockResolvedValue({
        stdout: "",
        stderr: "",
        code: 0,
      });

      await simulatorPasteboard({
        action: "copy",
        text: "test",
        device_id: "DEVICE-123",
      });

      expect(mockRunCommandWithInput).toHaveBeenCalledWith(
        "xcrun",
        ["simctl", "pbcopy", "DEVICE-123"],
        "test",
      );
    });

    it("should handle copy failures", async () => {
      const mockRunCommandWithInput = vi.mocked(
        commandUtils.runCommandWithInput,
      );
      mockRunCommandWithInput.mockResolvedValue({
        stdout: "",
        stderr: "Device not found",
        code: 1,
      });

      const result = await simulatorPasteboard({
        action: "copy",
        text: "test",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Failed to copy to clipboard");
      }
    });
  });

  describe("paste action", () => {
    it("should read text from clipboard", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue({
        stdout: "Clipboard content",
        stderr: "",
        code: 0,
      });

      const result = await simulatorPasteboard({ action: "paste" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.action).toBe("paste");
        expect(result.data.text).toBe("Clipboard content");
        expect(result.data.note).toContain("17 characters");
      }
    });

    it("should handle empty clipboard", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue({
        stdout: "",
        stderr: "",
        code: 0,
      });

      const result = await simulatorPasteboard({ action: "paste" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.text).toBe("");
        expect(result.data.note).toBe("Clipboard is empty");
        expect(result.summary).toBe("Clipboard is empty");
      }
    });

    it("should use booted device by default for paste", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue({
        stdout: "",
        stderr: "",
        code: 0,
      });

      await simulatorPasteboard({ action: "paste" });

      expect(mockRunCommand).toHaveBeenCalledWith("xcrun", [
        "simctl",
        "pbpaste",
        "booted",
      ]);
    });

    it("should handle paste failures", async () => {
      const mockRunCommand = vi.mocked(commandUtils.runCommand);
      mockRunCommand.mockResolvedValue({
        stdout: "",
        stderr: "Device not found",
        code: 1,
      });

      const result = await simulatorPasteboard({ action: "paste" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Failed to read clipboard");
      }
    });
  });

  it("should handle unknown action", async () => {
    const result = await simulatorPasteboard({
      action: "invalid" as any,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Unknown action");
    }
  });

  it("should handle command execution errors", async () => {
    const mockRunCommandWithInput = vi.mocked(commandUtils.runCommandWithInput);
    mockRunCommandWithInput.mockRejectedValue(new Error("Simulator crashed"));

    const result = await simulatorPasteboard({
      action: "copy",
      text: "test",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.operation).toBe("pasteboard");
    }
  });
});
