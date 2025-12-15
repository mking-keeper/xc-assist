/**
 * Tests for IDB list apps tool
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { idbListApps } from "../../../shared/tools/idb/list-apps.js";
import * as commandUtils from "../../../shared/utils/command.js";

vi.mock("../../../shared/utils/command", async () => {
  const actual = await vi.importActual("../../../shared/utils/command");
  return {
    ...actual,
    runCommand: vi.fn(),
  };
});

describe("idbListApps", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should list installed apps", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: `{"bundle_id":"com.example.app","name":"Example App","install_type":"user","architectures":["arm64"]}
{"bundle_id":"com.apple.mobilesafari","name":"Safari","install_type":"system","architectures":["arm64"]}`,
      stderr: "",
      code: 0,
    });

    const result = await idbListApps({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.count).toBe(2);
      expect(result.data.apps[0].bundle_id).toBe("com.example.app");
    }
  });

  it("should sort user apps before system apps", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: `{"bundle_id":"com.apple.mobilesafari","name":"Safari","install_type":"system","architectures":["arm64"]}
{"bundle_id":"com.example.app","name":"Example","install_type":"user","architectures":["arm64"]}`,
      stderr: "",
      code: 0,
    });

    const result = await idbListApps({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.apps[0].install_type).toBe("user");
      expect(result.data.apps[1].install_type).toBe("system");
    }
  });

  it("should use booted target by default", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    await idbListApps({});

    expect(mockRunCommand).toHaveBeenCalledWith(
      "idb",
      expect.arrayContaining(["list-apps", "--json"]),
    );
    expect(mockRunCommand).not.toHaveBeenCalledWith(
      "idb",
      expect.arrayContaining(["--udid"]),
    );
  });

  it("should use custom target when specified", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    await idbListApps({ target: "DEVICE-123" });

    expect(mockRunCommand).toHaveBeenCalledWith(
      "idb",
      expect.arrayContaining(["--udid", "DEVICE-123"]),
    );
  });

  it("should include fetch_process_state when requested", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: `{"bundle_id":"com.example.app","name":"Example","install_type":"user","architectures":["arm64"],"process_state":"running"}`,
      stderr: "",
      code: 0,
    });

    await idbListApps({ fetch_process_state: true });

    expect(mockRunCommand).toHaveBeenCalledWith(
      "idb",
      expect.arrayContaining(["--fetch-process-state"]),
    );
  });

  it("should handle empty app list", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "",
      code: 0,
    });

    const result = await idbListApps({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.count).toBe(0);
      expect(result.data.apps).toEqual([]);
    }
  });

  it("should handle malformed JSON lines gracefully", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: `{"bundle_id":"com.example.app","name":"Example","install_type":"user","architectures":["arm64"]}
invalid json line
{"bundle_id":"com.example.app2","name":"Example2","install_type":"user","architectures":["arm64"]}`,
      stderr: "",
      code: 0,
    });

    const result = await idbListApps({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.count).toBe(2);
    }
  });

  it("should handle command failures", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: "",
      stderr: "IDB not available",
      code: 1,
    });

    const result = await idbListApps({});

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Failed to list apps");
    }
  });

  it("should handle command execution errors", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockRejectedValue(new Error("IDB crashed"));

    const result = await idbListApps({});

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.operation).toBe("list-apps");
    }
  });

  it("should return summary on success", async () => {
    const mockRunCommand = vi.mocked(commandUtils.runCommand);
    mockRunCommand.mockResolvedValue({
      stdout: `{"bundle_id":"com.example.app","name":"Example","install_type":"user","architectures":["arm64"]}`,
      stderr: "",
      code: 0,
    });

    const result = await idbListApps({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.summary).toBe("1 apps installed");
    }
  });
});
