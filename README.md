# xc-assist

iOS Simulator testing plugin for Claude Code with 15 tools.

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

```bash
/plugin marketplace add mking-keeper/xc-assist
```

## Usage

```
"List available simulators"
"Boot iPhone 15 Pro"
"Build and install my app"
"Tap the Login button"
"Take a screenshot"
```

## License

MIT
