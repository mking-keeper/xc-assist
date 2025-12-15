import { describe, it, expect } from "vitest";
import { extractBuildErrors } from "../../shared/utils/command.js";

describe("extractBuildErrors", () => {
  it("extracts error and warning lines", () => {
    const output = [
      "CompileSwift normal arm64",
      "warning: something is odd",
      "error: something failed",
      "note: blah",
      "fatal error: boom",
    ].join("\n");

    expect(extractBuildErrors(output)).toEqual([
      "warning: something is odd",
      "error: something failed",
      "fatal error: boom",
    ]);
  });

  it("caps results by maxLines", () => {
    const output = ["error: one", "error: two", "error: three"].join("\n");
    expect(extractBuildErrors(output, 2)).toEqual(["error: one", "error: two"]);
  });
});
