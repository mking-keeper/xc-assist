# XC-Assist MCP Server

iOS Simulator testing MCP for Claude Code.

## Architecture Overview

```
mcp-servers/
├── shared/                    # Single source of truth
│   ├── tools/                # 15 individual tools
│   ├── types/                # Shared type definitions
│   └── utils/                # Shared utilities
├── xc-assist/                # MCP Server (15 tools)
├── __tests__/                # Test files
├── vitest.config.ts          # Test configuration
└── package.json              # Root package
```

## Key Features

- **Modular Design**: Each tool is a standalone, testable function
- **Type-Safe**: Zero `any` usage, full TypeScript coverage
- **Accessibility-First**: IDB tools for fast UI automation (120ms vs 2000ms screenshots)
- **Comprehensive**: Build, lifecycle, UI automation, and utilities

## The 15 Tools

### Build (1 tool)
- `xcode_build` - Build Xcode project with automatic error extraction

### Simulator Lifecycle (5 tools)
- `simulator_list` - List available simulators
- `simulator_boot` - Boot simulator device
- `simulator_install_app` - Install .app bundle
- `simulator_launch_app` - Launch app by bundle ID
- `simulator_terminate_app` - Terminate running app

### UI Automation (6 tools)
- `idb_describe` - Query accessibility tree (fast)
- `idb_find_element` - Search by label (semantic)
- `idb_check_quality` - Assess accessibility data richness
- `idb_tap` - Tap UI coordinates
- `idb_input` - Type text or press keys
- `idb_gesture` - Swipes and hardware buttons

### Utilities (3 tools)
- `simulator_screenshot` - Capture screen (fallback for poor accessibility)
- `simulator_openurl` - Open URLs and deep links
- `simulator_get_app_container` - Get app sandbox filesystem path

## Quick Start

### Build

```bash
cd mcp-servers
npm run build
```

### Test

```bash
npm run test
```

### Use in Claude

The MCP auto-enables via the plugin. Test with:
- "List available iOS simulators"
- "Build my app"
- "Take a screenshot"

## Tool Library

### Xcode Tools
| Tool | Description |
|------|-------------|
| `xcode_build` | Build project with scheme, configuration, destination |

### Simulator Tools
| Tool | Description |
|------|-------------|
| `simulator_list` | List simulators with availability filter |
| `simulator_boot` | Boot by device ID or name |
| `simulator_install_app` | Install .app to simulator |
| `simulator_launch_app` | Launch by bundle identifier |
| `simulator_terminate_app` | Kill running app |
| `simulator_screenshot` | Capture PNG screenshot |
| `simulator_openurl` | Open URL/deep link |
| `simulator_get_app_container` | Get app data/bundle path |

### IDB Tools
| Tool | Description |
|------|-------------|
| `idb_describe` | Query full accessibility tree or point |
| `idb_find_element` | Search elements by label text |
| `idb_check_quality` | Assess if accessibility data is sufficient |
| `idb_tap` | Tap at x,y coordinates |
| `idb_input` | Type text or press key sequences |
| `idb_gesture` | Swipe gestures or hardware buttons |

## Development

### Adding a New Tool

1. Create tool file in `shared/tools/{category}/{tool-name}.ts`
2. Export `{toolName}Definition` and `{toolName}()` function
3. Import in `xc-assist/src/index.ts`
4. Add to tools list and switch statement
5. Add tests in `__tests__/`
6. Rebuild: `npm run build`

### Type Safety Rules

- **Zero `any` usage** (except MCP SDK constraints)
- All tool params and results typed
- Shared types in `shared/types/`

### Code Style

- Functions <60 lines per CODESTYLE.md
- Use spawn, never shell (security)
- Handle all errors explicitly
- Use logger, not console

## Accessibility-First Approach

**Prefer `idb_describe` over `simulator_screenshot`**:

| Method | Speed | Output |
|--------|-------|--------|
| `idb_describe` | ~120ms | Structured, searchable |
| `simulator_screenshot` | ~2000ms | Image, needs analysis |

Workflow:
1. `idb_check_quality` → Is accessibility data sufficient?
2. If good: Use `idb_describe` + `idb_find_element`
3. If poor: Fall back to `simulator_screenshot`

## Requirements

- macOS 13.0+
- Xcode 15.0+
- Node.js 18+
- IDB (optional, for UI automation)

## License

MIT
