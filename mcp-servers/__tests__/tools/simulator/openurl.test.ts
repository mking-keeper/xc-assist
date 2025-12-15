/**
 * Tests for simulator open URL tool
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { simulatorOpenURL } from "../../../shared/tools/simulator/openurl.js";
import * as commandUtils from "../../../shared/utils/command.js";

vi.mock("../../../shared/utils/command", async () => {
  const actual = await vi.importActual("../../../shared/utils/command");
  return {
    ...actual,
    runCommand: vi.fn(),
  };
});

describe("simulatorOpenURL", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should open HTTP URL", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    const result = await simulatorOpenURL({ url: "https://example.com" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.message).toBe("URL opened successfully");
      expect(result.data.note).toContain("https://example.com");
    }
  });

  it("should open custom scheme URL (deep link)", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    const result = await simulatorOpenURL({ url: "myapp://screen/details" });

    expect(result.success).toBe(true);
    expect(mockRunCommand).toHaveBeenCalledWith(
      "xcrun",
      expect.arrayContaining(["openurl", "booted", "myapp://screen/details"]),
    );
  });

  it("should use booted device by default", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    await simulatorOpenURL({ url: "https://example.com" });

    expect(mockRunCommand).toHaveBeenCalledWith(
      "xcrun",
      expect.arrayContaining(["simctl", "openurl", "booted"]),
    );
  });

  it("should use custom device ID when specified", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    await simulatorOpenURL({
      url: "https://example.com",
      device_id: "DEVICE-ABC-123",
    });

    expect(mockRunCommand).toHaveBeenCalledWith(
      "xcrun",
      expect.arrayContaining(["openurl", "DEVICE-ABC-123"]),
    );
  });

  it("should validate url is required", async () => {
    const result = await simulatorOpenURL({} as any);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("url required");
    }
  });

  it("should handle command failures", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "Invalid URL",
      code: 1,
    });

    const result = await simulatorOpenURL({ url: "invalid-url" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Operation failed");
    }
  });

  it("should handle command execution errors", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockRejectedValue(new Error("Simulator not running"));

    const result = await simulatorOpenURL({ url: "https://example.com" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.operation).toBe("openurl");
    }
  });

  it("should return summary on success", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    const result = await simulatorOpenURL({ url: "https://example.com" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.summary).toBe("URL opened");
    }
  });

  it("should handle URLs with query parameters", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    const url = "https://example.com/page?foo=bar&baz=123";
    const result = await simulatorOpenURL({ url });

    expect(result.success).toBe(true);
    expect(mockRunCommand).toHaveBeenCalledWith(
      "xcrun",
      expect.arrayContaining([url]),
    );
  });
});
