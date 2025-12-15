---
name: xc-assist
description: iOS Simulator UI automation and testing guidance. Use when building iOS apps, automating UI interactions, running simulator tests, or debugging accessibility issues. Covers build operations, simulator lifecycle, UI automation via IDB, and deep link testing.
---

# XC-Assist Workflows

**Use the xc-assist MCP tools for all iOS simulator operations**

The xc-assist plugin provides 15 MCP tools for iOS development:

- Build, simulator lifecycle, UI automation, and utilities

## CRITICAL: Always Use MCP Tools First

**This is the most important rule:** When working with iOS builds and simulators, you MUST use xc-assist MCP tools.

- **DO**: Use `xcode_build` for all build operations
- **DO**: Use `simulator_*` tools for simulator management
- **DO**: Use `idb_*` tools for UI automation
- **NEVER**: Fall back to bash `xcodebuild` or `xcrun simctl` commands
- **NEVER**: Use `xcodebuild` directly in bash

**Why?** The MCP tools provide:

- Structured error handling
- Token efficiency
- Proper integration with Claude Code
- Consistent response formatting

## Quick Reference

| Task            | MCP Tool                | Key Parameters                 |
| --------------- | ----------------------- | ------------------------------ |
| Build app       | `xcode_build`           | scheme, configuration          |
| List simulators | `simulator_list`        | availability, device_type      |
| Boot simulator  | `simulator_boot`        | device_id                      |
| Install app     | `simulator_install_app` | app_path, device_id            |
| Launch app      | `simulator_launch_app`  | app_identifier                 |
| Query UI        | `idb_describe`          | operation, target              |
| Find element    | `idb_find_element`      | query                          |
| Tap element     | `idb_tap`               | x, y                           |
| Type text       | `idb_input`             | text                           |
| Swipe/gesture   | `idb_gesture`           | gesture_type, start/end coords |
| Screenshot      | `simulator_screenshot`  | device_id                      |
| Open URL        | `simulator_openurl`     | url                            |

## Standard Workflows

### 1. Build and Launch App

```
1. xcode_build (scheme: "MyApp", configuration: "Debug")
2. simulator_list (availability: "available")
3. simulator_boot (device_id: "iPhone 15")
4. simulator_install_app (app_path: "/path/to/MyApp.app")
5. simulator_launch_app (app_identifier: "com.example.MyApp")
```

### 2. UI Automation Flow

```
1. idb_check_quality → Assess accessibility data
2. idb_describe (operation: "all") → Get UI tree
3. idb_find_element (query: "Login") → Find button
4. idb_tap (x: 200, y: 400) → Tap coordinates
5. idb_input (text: "username") → Type text
6. simulator_screenshot → Verify result
```

### 3. Accessibility-First Testing

**Prefer `idb_describe` over `simulator_screenshot`**:

- `idb_describe`: ~120ms, structured data, searchable
- `simulator_screenshot`: ~2000ms, requires image analysis

```
1. idb_check_quality → Is accessibility data sufficient?
2. If good: Use idb_describe + idb_find_element
3. If poor: Fall back to simulator_screenshot
```

### 4. Deep Link Testing

```
1. simulator_launch_app (app_identifier: "com.example.MyApp")
2. simulator_openurl (url: "myapp://settings/profile")
3. idb_describe → Verify correct screen loaded
```

### 5. Gesture Testing

```
# Swipe down
idb_gesture (gesture_type: "swipe", start_x: 200, start_y: 100, end_x: 200, end_y: 500)

# Press home button
idb_gesture (gesture_type: "button", button_type: "HOME")
```

## Tool Categories

### Build (1 tool)

- `xcode_build` - Build with automatic error extraction

### Simulator Lifecycle (5 tools)

- `simulator_list` - Discover available devices
- `simulator_boot` - Start simulator
- `simulator_install_app` - Install .app bundle
- `simulator_launch_app` - Launch by bundle ID
- `simulator_terminate_app` - Kill running app

### UI Automation (6 tools)

- `idb_describe` - Query accessibility tree
- `idb_find_element` - Search by label
- `idb_check_quality` - Assess accessibility data
- `idb_tap` - Tap coordinates
- `idb_input` - Type text or keys
- `idb_gesture` - Swipes and hardware buttons

### Utilities (3 tools)

- `simulator_screenshot` - Capture screen
- `simulator_openurl` - Open URLs/deep links
- `simulator_get_app_container` - Get app sandbox path

## When to Use Bash (And When NOT to)

### NEVER Use Bash For These

| Task        | Wrong                        | Right                  |
| ----------- | ---------------------------- | ---------------------- |
| Build       | `xcodebuild -scheme...`      | `xcode_build`          |
| List sims   | `xcrun simctl list`          | `simulator_list`       |
| Boot sim    | `xcrun simctl boot`          | `simulator_boot`       |
| Screenshots | `xcrun simctl io screenshot` | `simulator_screenshot` |

### Bash is OK For

- File operations: `mkdir`, `cp`, `rm`, `ls`
- Git operations: `git status`, `git log`
- Environment checks: `which`, `xcode-select --version`
- Project exploration: `find . -name "*.swift"`

## Error Handling

If an MCP tool fails:

1. Read the error message carefully
2. Check parameters (scheme name, device ID, paths)
3. Verify prerequisites (simulator booted, app installed)
4. Retry with corrected parameters

**Never** fall back to bash commands - the issue is with parameters, not the MCP tool.
