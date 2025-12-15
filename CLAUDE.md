# CLAUDE.md

## Project Overview

**xc-assist** - iOS Simulator testing plugin for Claude Code.

## Structure

```
xc-assist/
├── .claude-plugin/
│   ├── plugin.json        # Plugin manifest
│   └── marketplace.json   # Marketplace config
├── mcp-servers/
│   ├── shared/            # Shared code
│   │   ├── tools/
│   │   │   ├── idb/       # IDB tools
│   │   │   └── simulator/ # Simulator tools
│   │   ├── types/         # Type definitions
│   │   └── utils/         # Utilities
│   └── xc-assist/
│       ├── src/
│       │   └── index.ts   # Server entry
│       ├── package.json
│       └── tsconfig.json
├── .mcp.json              # MCP config
└── README.md
```

## Tools (17)

### Simulator Lifecycle

- `simulator_list` - List simulators
- `simulator_launch_app` - Launch app
- `simulator_terminate_app` - Kill app

### UI Automation

- `idb_describe` - Query accessibility tree
- `idb_find_element` - Search by label
- `idb_check_quality` - Accessibility quality
- `idb_list_apps` - List installed apps
- `idb_tap` - Tap coordinates
- `idb_input` - Text/key input
- `idb_gesture` - Swipes, buttons

### Simulator Control

- `simulator_push` - Send push notifications
- `simulator_set_location` - Set GPS location
- `simulator_privacy` - Grant/revoke permissions
- `simulator_pasteboard` - Read/write clipboard

### Utilities

- `simulator_screenshot` - Capture screen
- `simulator_openurl` - Deep links
- `simulator_get_app_container` - App sandbox

## Development

```bash
npm install
npm run build
```

## Quality Checks

Run before committing:

```bash
npm run format:check  # Code formatting
npm run coverage      # Tests with 80% coverage threshold
npm run ts:check      # TypeScript type checking
npm run audit:check   # Security vulnerabilities
```

Fix formatting issues:

```bash
npx prettier --write .
```

## Repository

https://github.com/mking-keeper/xc-assist
