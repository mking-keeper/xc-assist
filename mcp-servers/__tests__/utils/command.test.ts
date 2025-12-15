/**
 * Tests for command execution utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { runCommand } from "../../shared/utils/command.js";
import * as child_process from "child_process";
import { EventEmitter } from "events";

vi.mock("child_process");

describe("runCommand", () => {
  let mockSpawn: ReturnType<typeof vi.fn>;
  let mockProcess: EventEmitter & {
    stdout: EventEmitter;
    stderr: EventEmitter;
    kill: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockProcess = Object.assign(new EventEmitter(), {
      stdout: new EventEmitter(),
      stderr: new EventEmitter(),
      kill: vi.fn(),
    });

    mockSpawn = vi.mocked(child_process.spawn);
    mockSpawn.mockReturnValue(mockProcess as never);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should execute command and return stdout", async () => {
    const resultPromise = runCommand("echo", ["hello"]);

    mockProcess.stdout.emit("data", "hello world");
    mockProcess.emit("close", 0);

    const result = await resultPromise;

    expect(result.stdout).toBe("hello world");
    expect(result.stderr).toBe("");
    expect(result.code).toBe(0);
  });

  it("should capture stderr", async () => {
    const resultPromise = runCommand("cmd", ["arg"]);

    mockProcess.stdout.emit("data", "output");
    mockProcess.stderr.emit("data", "error message");
    mockProcess.emit("close", 1);

    const result = await resultPromise;

    expect(result.stdout).toBe("output");
    expect(result.stderr).toBe("error message");
    expect(result.code).toBe(1);
  });

  it("should handle command timeout", async () => {
    const resultPromise = runCommand("slow", ["cmd"], { timeout: 1000 });

    vi.advanceTimersByTime(1001);

    await expect(resultPromise).rejects.toThrow(
      "Command timed out after 1000ms",
    );
    expect(mockProcess.kill).toHaveBeenCalled();
  });

  it("should handle command execution errors", async () => {
    const resultPromise = runCommand("nonexistent", ["cmd"]);

    mockProcess.emit("error", new Error("Command not found"));

    await expect(resultPromise).rejects.toThrow(
      "Failed to execute command: Command not found",
    );
  });

  it("should handle max buffer exceeded", async () => {
    const resultPromise = runCommand("cmd", ["arg"], { maxBuffer: 10 });

    mockProcess.stdout.emit("data", "x".repeat(20));

    await expect(resultPromise).rejects.toThrow(
      "Command output exceeded max buffer size",
    );
    expect(mockProcess.kill).toHaveBeenCalled();
  });

  it("should pass cwd option to spawn", async () => {
    const resultPromise = runCommand("cmd", ["arg"], { cwd: "/tmp" });

    mockProcess.emit("close", 0);
    await resultPromise;

    expect(mockSpawn).toHaveBeenCalledWith(
      "cmd",
      ["arg"],
      expect.objectContaining({ cwd: "/tmp" }),
    );
  });

  it("should handle null exit code", async () => {
    const resultPromise = runCommand("cmd", ["arg"]);

    mockProcess.emit("close", null);

    const result = await resultPromise;
    expect(result.code).toBe(0);
  });

  it("should trim stdout and stderr", async () => {
    const resultPromise = runCommand("cmd", ["arg"]);

    mockProcess.stdout.emit("data", "  output  \n");
    mockProcess.stderr.emit("data", "  error  \n");
    mockProcess.emit("close", 0);

    const result = await resultPromise;

    expect(result.stdout).toBe("output");
    expect(result.stderr).toBe("error");
  });
});
