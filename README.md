# xc-assist

iOS Simulator testing plugin for Claude Code.

```
/plugin marketplace add mking-keeper/xc-assist
```

## Tools

### Build
- `xcode_build` - Build Xcode project

### Simulator Lifecycle
- `simulator_list` - List available simulators
- `simulator_boot` - Start a simulator
- `simulator_install_app` - Install .app bundle
- `simulator_launch_app` - Launch app by bundle ID
- `simulator_terminate_app` - Kill running app

### UI Automation (IDB)
- `idb_describe` - Query accessibility tree
- `idb_find_element` - Search elements by label
- `idb_check_quality` - Assess accessibility data quality
- `idb_tap` - Tap at coordinates
- `idb_input` - Type text or press keys
- `idb_gesture` - Swipes and hardware buttons

### Utilities
- `simulator_screenshot` - Capture screen
- `simulator_openurl` - Open deep links
- `simulator_get_app_container` - Access app sandbox

## Requirements

- macOS 13.0+
- Xcode 15.0+
- Node.js 18+
- IDB (Facebook iOS Development Bridge) for UI automation tools

## Installation

### 1. Install IDB (required for UI automation)

```bash
# Install idb-companion (runs on simulator)
brew tap facebook/fb
brew install idb-companion

# Install idb client (Python CLI)
pip install fb-idb
```

Verify installation:
```bash
idb list-targets
```

### 2. Install the plugin

1. Open Claude Code in your terminal
2. Run the plugin install command:

```
/plugin marketplace add mking-keeper/xc-assist
```

3. Restart Claude Code to load the plugin

## Usage

1. Open Claude Code in your iOS project directory
2. Ask Claude to help with simulator tasks:

```
"List available simulators"
"Boot iPhone 15 Pro"
"Build my app for the simulator"
"Install and launch the app"
"Tap the Login button"
"Type 'hello' into the text field"
"Take a screenshot"
"Check the accessibility tree"
```

### Example Workflow

```
> "Build my app and run it on iPhone 15"
> "Tap the Sign In button"
> "Enter test@example.com in the email field"
> "Take a screenshot of the current state"
```

## Development

### Setup

```bash
npm install
npm run build
```

### Husky (Git Hooks)

This project uses [Husky](https://typicode.github.io/husky/) for Git hooks. The pre-commit hook automatically rebuilds the MCP server when TypeScript files in `mcp-servers/xc-assist/src/` or `mcp-servers/shared/` are changed.

The hook is configured in `.husky/pre-commit`. Husky is set up automatically when you run `npm install` (via the `prepare` script).

### Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Build all MCP servers |
| `npm run clean` | Remove dist directories |
| `npm test` | Run tests |
| `npm run coverage` | Run tests with coverage report |
| `npm run ts:check` | TypeScript type checking |
| `npm run format:check` | Check code formatting with Prettier |
| `npm run audit:check` | Check for high severity vulnerabilities |

## Credits

Based on [xclaude-plugin](https://github.com/conorluddy/xclaude-plugin) by Conor Luddy.

## License

MIT
