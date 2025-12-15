# Code Style Guide

**xc-assist Development Guidelines**

## Philosophy

### Token Efficiency First

Every line of code should consider: **How will this appear to an AI agent reading the codebase?**

- **Minimize cognitive load** - Clear names, short functions, obvious structure
- **Self-documenting** - Code explains itself through structure and naming
- **Simplest solution** - Optimize for understanding, not cleverness

### Single Responsibility

**Functions:** 20-30 lines ideal, 60 lines max, one clear purpose
**Files:** One primary export, ~200-300 lines ideal, ~500 lines max

## TypeScript Guidelines

### Naming Conventions

```typescript
// camelCase for variables and functions
const deviceName = "iPhone 15";
function executeCommand(args: CommandArgs): Promise<Result> {}

// PascalCase for classes and interfaces
class XcodeDispatcher extends BaseDispatcher {}
interface ToolDefinition {}

// UPPER_SNAKE_CASE for constants
const DEFAULT_TIMEOUT = 120000;

// kebab-case for files
// simulator-tools.ts, response-cache.ts
```

### Type Annotations

**Always explicit for:** function parameters, return types, public properties, exports
**Can infer for:** local variables, private properties

### No `any` or `unknown`

Always define explicit types. Exception: third-party SDK types that use `any`.

## Code Organization

### File Structure

```typescript
/**
 * Brief file description
 */

// 1. External packages
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

// 2. Internal modules
import { logger } from "../utils/logger.js";

// 3. Type-only imports
import type { ToolDefinition } from "./types.js";

// Types and interfaces
export interface BuildParams {
  scheme: string;
}

// Constants
const DEFAULT_CONFIGURATION = "Debug";

// Main exports
export class XcodeDispatcher {}

// Helper functions (private to file)
function parseOutput(text: string): ParsedOutput {}
```

**Always use `.js` extension** in imports (required for ES modules).

### Function Structure

```typescript
async function executeOperation(
  params: OperationParams,
): Promise<OperationResult> {
  // 1. Validation and early returns
  if (!params.scheme) {
    return { success: false, error: "Scheme required" };
  }

  // 2. Main logic
  const result = await performOperation(params);

  // 3. Error handling
  if (!result.success) {
    logger.error("Operation failed", result.error);
    return formatError(result.error);
  }

  // 4. Success path
  return formatSuccess(result.data);
}
```

**More than 3 parameters?** Use an object.

## Comments

**Comment the WHY, not the WHAT.** Only comment for:

- Non-obvious design decisions
- Workarounds for bugs/limitations
- Complex algorithms

## Error Handling

```typescript
// Use structured error responses
return {
  success: false,
  error: "Build failed",
  details: 'Scheme "MyApp" not found',
  code: "SCHEME_NOT_FOUND",
};
```

## Logging

- **error:** Operation failures, exceptions
- **warn:** Unexpected but handled situations
- **info:** Important state changes, completions
- **debug:** Detailed execution flow

```typescript
logger.info("Build completed", { scheme: "MyApp", duration: "45.2s" });
```

## Async/Await

Prefer async/await over promise chains. Use `Promise.all` for parallel operations.

## Testing

```typescript
describe("XcodeDispatcher", () => {
  describe("execute", () => {
    // Pattern: should [expected behavior] when [condition]
    it("should build project successfully", async () => {
      // Arrange, Act, Assert
    });
  });
});
```

## Formatting

Enforced by Prettier: single quotes, semicolons, 2 space indent, trailing commas.

```bash
npm run format
```
