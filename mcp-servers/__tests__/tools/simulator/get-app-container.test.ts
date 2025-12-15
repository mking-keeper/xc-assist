/**
 * Tests for simulator get app container tool
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { simulatorGetAppContainer } from "../../../shared/tools/simulator/get-app-container.js";
import * as commandUtils from "../../../shared/utils/command.js";

vi.mock("../../../shared/utils/command", async () => {
  const actual = await vi.importActual("../../../shared/utils/command");
  return {
    ...actual,
    runCommand: vi.fn(),
  };
});

describe("simulatorGetAppContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should get app container path with app_identifier", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout:
        "/Users/test/Library/Developer/CoreSimulator/Devices/ABC-123/data/Containers/Data/Application/XYZ-789\n",
      stderr: "",
      code: 0,
    });

    const result = await simulatorGetAppContainer({
      app_identifier: "com.example.MyApp",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.output_path).toContain("CoreSimulator");
      expect(result.data.message).toBe("Container path retrieved");
    }
  });

  it("should use booted device by default", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "/path/to/container\n",
      stderr: "",
      code: 0,
    });

    await simulatorGetAppContainer({ app_identifier: "com.example.MyApp" });

    expect(mockRunCommand).toHaveBeenCalledWith(
      "xcrun",
      expect.arrayContaining(["simctl", "get_app_container", "booted"]),
    );
  });

  it("should use custom device ID when specified", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "/path/to/container\n",
      stderr: "",
      code: 0,
    });

    await simulatorGetAppContainer({
      app_identifier: "com.example.MyApp",
      device_id: "CUSTOM-DEVICE-123",
    });

    expect(mockRunCommand).toHaveBeenCalledWith(
      "xcrun",
      expect.arrayContaining(["get_app_container", "CUSTOM-DEVICE-123"]),
    );
  });

  it("should default to data container type", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "/path/to/container\n",
      stderr: "",
      code: 0,
    });

    await simulatorGetAppContainer({ app_identifier: "com.example.MyApp" });

    expect(mockRunCommand).toHaveBeenCalledWith(
      "xcrun",
      expect.arrayContaining(["data"]),
    );
  });

  it("should use bundle container type when specified", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "/path/to/bundle\n",
      stderr: "",
      code: 0,
    });

    await simulatorGetAppContainer({
      app_identifier: "com.example.MyApp",
      container_type: "bundle",
    });

    expect(mockRunCommand).toHaveBeenCalledWith(
      "xcrun",
      expect.arrayContaining(["bundle"]),
    );
  });

  it("should use group container type when specified", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "/path/to/group\n",
      stderr: "",
      code: 0,
    });

    await simulatorGetAppContainer({
      app_identifier: "com.example.MyApp",
      container_type: "group",
    });

    expect(mockRunCommand).toHaveBeenCalledWith(
      "xcrun",
      expect.arrayContaining(["group"]),
    );
  });

  it("should validate app_identifier is required", async () => {
    const result = await simulatorGetAppContainer({} as any);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("app_identifier required");
    }
  });

  it("should handle command failures", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "App not found",
      code: 1,
    });

    const result = await simulatorGetAppContainer({
      app_identifier: "com.nonexistent.App",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Failed to retrieve container path");
    }
  });

  it("should handle command execution errors", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockRejectedValue(new Error("Command not found"));

    const result = await simulatorGetAppContainer({
      app_identifier: "com.example.MyApp",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.operation).toBe("get-app-container");
    }
  });

  it("should trim whitespace from container path", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "  /path/to/container  \n",
      stderr: "",
      code: 0,
    });

    const result = await simulatorGetAppContainer({
      app_identifier: "com.example.MyApp",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.output_path).toBe("/path/to/container");
    }
  });
});
