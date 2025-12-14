# CLAUDE.md

## Project Overview

**xc-assist** - iOS Simulator testing plugin for Claude Code with 15 tools.

## Structure

```
xc-assist/
├── .claude-plugin/
│   ├── plugin.json        # Plugin manifest
│   └── marketplace.json   # Marketplace config
├── mcp-servers/
│   └── xc-assist/
│       ├── src/
│       │   ├── index.ts   # Server entry (15 tools)
│       │   ├── tools/     # Tool implementations
│       │   ├── types/     # Type definitions
│       │   └── utils/     # Utilities
│       ├── package.json
│       └── tsconfig.json
├── .mcp.json              # MCP config
└── README.md
```

## Tools (15)

### Build
- `xcode_build` - Build Xcode project

### Simulator Lifecycle
- `simulator_list` - List simulators
- `simulator_boot` - Start simulator
- `simulator_install_app` - Install .app
- `simulator_launch_app` - Launch app
- `simulator_terminate_app` - Kill app

### UI Automation
- `idb_describe` - Query accessibility tree
- `idb_find_element` - Search by label
- `idb_check_quality` - Accessibility quality
- `idb_tap` - Tap coordinates
- `idb_input` - Text/key input
- `idb_gesture` - Swipes, buttons

### Utilities
- `simulator_screenshot` - Capture screen
- `simulator_openurl` - Deep links
- `simulator_get_app_container` - App sandbox

## Development

```bash
npm install
npm run build
```

## Repository

https://github.com/mking-keeper/xc-assist
