/**
 * Tests for simulator push notification tool
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { simulatorPush } from "../../../shared/tools/simulator/push.js";
import * as commandUtils from "../../../shared/utils/command.js";
import * as fsPromises from "fs/promises";

vi.mock("../../../shared/utils/command", async () => {
  const actual = await vi.importActual("../../../shared/utils/command");
  return {
    ...actual,
    runCommand: vi.fn(),
  };
});

vi.mock("fs/promises", async () => {
  const actual = await vi.importActual("fs/promises");
  return {
    ...actual,
    writeFile: vi.fn().mockResolvedValue(undefined),
    unlink: vi.fn().mockResolvedValue(undefined),
  };
});

describe("simulatorPush", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should send push notification with string alert", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    const result = await simulatorPush({
      bundle_id: "com.example.app",
      payload: {
        aps: {
          alert: "Hello World",
        },
      },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.bundle_id).toBe("com.example.app");
      expect(result.data.note).toBe("Hello World");
    }
  });

  it("should send push notification with object alert", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    const result = await simulatorPush({
      bundle_id: "com.example.app",
      payload: {
        aps: {
          alert: {
            title: "Title",
            body: "Body message",
          },
        },
      },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.note).toBe("Body message");
    }
  });

  it("should require bundle_id", async () => {
    const result = await simulatorPush({
      bundle_id: "",
      payload: {
        aps: { alert: "test" },
      },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("bundle_id is required");
    }
  });

  it("should require payload with aps key", async () => {
    const result = await simulatorPush({
      bundle_id: "com.example.app",
      payload: {} as any,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("payload with aps key is required");
    }
  });

  it("should use booted device by default", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    await simulatorPush({
      bundle_id: "com.example.app",
      payload: { aps: { alert: "test" } },
    });

    expect(mockRunCommand).toHaveBeenCalledWith(
      "xcrun",
      expect.arrayContaining(["simctl", "push", "booted", "com.example.app"]),
    );
  });

  it("should use custom device ID when specified", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    await simulatorPush({
      bundle_id: "com.example.app",
      device_id: "DEVICE-123",
      payload: { aps: { alert: "test" } },
    });

    expect(mockRunCommand).toHaveBeenCalledWith(
      "xcrun",
      expect.arrayContaining(["push", "DEVICE-123"]),
    );
  });

  it("should write payload to temp file", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    const mockWriteFile = vi.mocked(fsPromises.writeFile);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    const payload = { aps: { alert: "test", badge: 5 } };
    await simulatorPush({
      bundle_id: "com.example.app",
      payload,
    });

    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining("push-"),
      JSON.stringify(payload, null, 2),
    );
  });

  it("should clean up temp file after success", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    const mockUnlink = vi.mocked(fsPromises.unlink);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    await simulatorPush({
      bundle_id: "com.example.app",
      payload: { aps: { alert: "test" } },
    });

    expect(mockUnlink).toHaveBeenCalled();
  });

  it("should clean up temp file after failure", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    const mockUnlink = vi.mocked(fsPromises.unlink);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "Failed",
      code: 1,
    });

    await simulatorPush({
      bundle_id: "com.example.app",
      payload: { aps: { alert: "test" } },
    });

    expect(mockUnlink).toHaveBeenCalled();
  });

  it("should handle command failures", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "App not installed",
      code: 1,
    });

    const result = await simulatorPush({
      bundle_id: "com.example.app",
      payload: { aps: { alert: "test" } },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Failed to send push notification");
    }
  });

  it("should handle command execution errors", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockRejectedValue(new Error("Simulator crashed"));

    const result = await simulatorPush({
      bundle_id: "com.example.app",
      payload: { aps: { alert: "test" } },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.operation).toBe("push");
    }
  });

  it("should return summary on success", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    const result = await simulatorPush({
      bundle_id: "com.example.app",
      payload: { aps: { alert: "test" } },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.summary).toBe("Push sent to com.example.app");
    }
  });

  it("should handle push with badge only", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    const result = await simulatorPush({
      bundle_id: "com.example.app",
      payload: { aps: { badge: 10 } },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.note).toBe("Notification sent");
    }
  });

  it("should handle push with sound", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    const result = await simulatorPush({
      bundle_id: "com.example.app",
      payload: {
        aps: {
          alert: "New message",
          sound: "default",
        },
      },
    });

    expect(result.success).toBe(true);
  });

  it("should handle content-available for background notifications", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    const result = await simulatorPush({
      bundle_id: "com.example.app",
      payload: {
        aps: {
          "content-available": 1,
        },
      },
    });

    expect(result.success).toBe(true);
  });
});
