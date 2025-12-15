/**
 * Tests for simulator terminate app tool
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { simulatorTerminateApp } from "../../../shared/tools/simulator/terminate-app.js";
import * as commandUtils from "../../../shared/utils/command.js";

vi.mock("../../../shared/utils/command", async () => {
  const actual = await vi.importActual("../../../shared/utils/command");
  return {
    ...actual,
    runCommand: vi.fn(),
  };
});

describe("simulatorTerminateApp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should terminate app with app_identifier", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    const result = await simulatorTerminateApp({
      app_identifier: "com.example.MyApp",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.message).toBe("App terminated successfully");
      expect(result.data.app_identifier).toBe("com.example.MyApp");
    }
  });

  it("should use booted device by default", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    await simulatorTerminateApp({ app_identifier: "com.example.MyApp" });

    expect(mockRunCommand).toHaveBeenCalledWith(
      "xcrun",
      expect.arrayContaining(["simctl", "terminate", "booted"]),
    );
  });

  it("should use custom device ID when specified", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    await simulatorTerminateApp({
      app_identifier: "com.example.MyApp",
      device_id: "DEVICE-XYZ-789",
    });

    expect(mockRunCommand).toHaveBeenCalledWith(
      "xcrun",
      expect.arrayContaining(["terminate", "DEVICE-XYZ-789"]),
    );
  });

  it("should validate app_identifier is required", async () => {
    const result = await simulatorTerminateApp({} as any);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("app_identifier required");
    }
  });

  it("should handle termination failures", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "App not running",
      code: 1,
    });

    const result = await simulatorTerminateApp({
      app_identifier: "com.example.MyApp",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Operation failed");
    }
  });

  it("should handle command execution errors", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockRejectedValue(new Error("Simulator not running"));

    const result = await simulatorTerminateApp({
      app_identifier: "com.example.MyApp",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.operation).toBe("terminate-app");
    }
  });

  it("should return summary on success", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    const result = await simulatorTerminateApp({
      app_identifier: "com.example.MyApp",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.summary).toBe("App terminated");
    }
  });

  it("should include app_identifier in response data", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    const appId = "com.company.SpecificApp";
    const result = await simulatorTerminateApp({ app_identifier: appId });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.app_identifier).toBe(appId);
    }
  });

  it("should handle bundle identifiers with special characters", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    const appId = "com.example-company.My-App_123";
    const result = await simulatorTerminateApp({ app_identifier: appId });

    expect(result.success).toBe(true);
    expect(mockRunCommand).toHaveBeenCalledWith(
      "xcrun",
      expect.arrayContaining([appId]),
    );
  });
});
