
<div align="center">
  <img src="src-tauri/icons/icon.png" alt="Doggy Logo" width="120" height="120">

  <h1>🐕 Doggy</h1>
  
  <p>
    <strong>A Cyberpunk Multi-LLM Toolkit & GUI for Claude Code</strong>
  </p>
  <p>
    <strong>Create custom agents, manage sessions, and use multiple AI models with intelligent routing.</strong>
  </p>
  
  <p>
    <a href="#features"><img src="https://img.shields.io/badge/Features-✨-00F5FF?style=for-the-badge" alt="Features"></a>
    <a href="#installation"><img src="https://img.shields.io/badge/Install-🚀-FF00E5?style=for-the-badge" alt="Installation"></a>
    <a href="#usage"><img src="https://img.shields.io/badge/Usage-📖-FFE500?style=for-the-badge" alt="Usage"></a>
    <a href="#development"><img src="https://img.shields.io/badge/Develop-🛠️-00F5FF?style=for-the-badge" alt="Development"></a>
  </p>
</div>

---

> [!NOTE]
> This project is not affiliated with, endorsed by, or sponsored by Anthropic. Claude is a trademark of Anthropic, PBC. This is an independent developer project using Claude.

## 🌟 Overview

**Doggy** is a cyberpunk-themed desktop application that transforms how you interact with Claude Code and other LLM providers. Built with Tauri 2, it provides a beautiful GUI for managing your Claude Code sessions, creating custom agents, tracking usage, and **supporting multiple LLM providers with intelligent routing**.

Think of Doggy as your command center for AI-assisted development - bridging the gap between command-line tools and a visual experience that makes working with various AI models more intuitive and productive.

### 🎨 Key Highlights

- 🐕 **Cyberpunk Aesthetic**: Beautiful neon-styled interface with cyan, magenta, and yellow accents
- 🌐 **Multi-LLM Support**: Use OpenAI, DeepSeek, Moonshot, Qwen, Zhipu, Groq, Ollama and more
- 🧠 **Intelligent Routing**: Auto-select optimal models based on task type
- 💰 **Cost Optimization**: Smart routing to reduce API costs
- 🔄 **Failover Protection**: Automatic switching when providers fail

## 📋 Table of Contents

- [🌟 Overview](#-overview)
- [✨ Features](#-features)
  - [🌐 LLM Gateway](#-llm-gateway-multi-model-proxy)
  - [🗂️ Project & Session Management](#️-project--session-management)
  - [🤖 CC Agents](#-cc-agents)
  - [📊 Usage Analytics Dashboard](#-usage-analytics-dashboard)
  - [🔌 MCP Server Management](#-mcp-server-management)
  - [⏰ Timeline & Checkpoints](#-timeline--checkpoints)
  - [📝 CLAUDE.md Management](#-claudemd-management)
- [📖 Usage](#-usage)
- [🚀 Installation](#-installation)
- [🔨 Build from Source](#-build-from-source)
- [🛠️ Development](#️-development)
- [🔒 Security](#-security)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)

## ✨ Features

### 🌐 **LLM Gateway (Multi-Model Proxy)**

The crown jewel of Doggy - bypass Claude Code's model restrictions and use any LLM provider!

| Provider | Models | Features |
|----------|--------|----------|
| **OpenAI** | GPT-4o, GPT-4-turbo, o1, o3-mini | Function calling, vision |
| **DeepSeek** | DeepSeek-V3, DeepSeek-R1 | Reasoning, coding |
| **Moonshot** | Moonshot-v1-8k/32k/128k | Long context |
| **Qwen** | Qwen-Max, Qwen-Plus, Qwen-Turbo | Chinese optimization |
| **Zhipu AI** | GLM-4, GLM-4V | Vision, tools |
| **Groq** | Llama-3, Mixtral | Ultra-fast inference |
| **Ollama** | Any local model | Privacy, offline |

**Key Features:**
- 🎯 **Intelligent Routing**: Automatically select the best model for coding, reasoning, or creative tasks
- 💰 **Cost Optimization**: Route to cheaper models when appropriate
- 🔄 **Automatic Failover**: Switch to backup providers when primary fails
- 🖥️ **Local Gateway Server**: Run a local proxy for seamless integration
- ⚙️ **Easy Configuration**: Visual UI for managing API keys and settings

### 🗂️ **Project & Session Management**
- **Visual Project Browser**: Navigate through all your Claude Code projects in `~/.claude/projects/`
- **Session History**: View and resume past coding sessions with full context
- **Smart Search**: Find projects and sessions quickly with built-in search
- **Session Insights**: See first messages, timestamps, and session metadata at a glance

### 🤖 **CC Agents**
- **Custom AI Agents**: Create specialized agents with custom system prompts and behaviors
- **Agent Library**: Build a collection of purpose-built agents for different tasks
- **Background Execution**: Run agents in separate processes for non-blocking operations
- **Execution History**: Track all agent runs with detailed logs and performance metrics

### 📊 **Usage Analytics Dashboard**
- **Cost Tracking**: Monitor your Claude API usage and costs in real-time
- **Token Analytics**: Detailed breakdown by model, project, and time period
- **Visual Charts**: Beautiful charts showing usage trends and patterns
- **Export Data**: Export usage data for accounting and analysis

### 🔌 **MCP Server Management**
- **Server Registry**: Manage Model Context Protocol servers from a central UI
- **Easy Configuration**: Add servers via UI or import from existing configs
- **Connection Testing**: Verify server connectivity before use
- **Claude Desktop Import**: Import server configurations from Claude Desktop

### ⏰ **Timeline & Checkpoints**
- **Session Versioning**: Create checkpoints at any point in your coding session
- **Visual Timeline**: Navigate through your session history with a branching timeline
- **Instant Restore**: Jump back to any checkpoint with one click
- **Fork Sessions**: Create new branches from existing checkpoints
- **Diff Viewer**: See exactly what changed between checkpoints

### 📝 **CLAUDE.md Management**
- **Built-in Editor**: Edit CLAUDE.md files directly within the app
- **Live Preview**: See your markdown rendered in real-time
- **Project Scanner**: Find all CLAUDE.md files in your projects
- **Syntax Highlighting**: Full markdown support with syntax highlighting

## 📖 Usage

### Getting Started

1. **Launch Doggy**: Open the application after installation
2. **Welcome Screen**: Choose between CC Agents or Projects
3. **First Time Setup**: Doggy will automatically detect your `~/.claude` directory

### Setting Up LLM Gateway

1. Go to **Settings** → **LLM Gateway** tab
2. Enable the gateway and set port (default: 8765)
3. Add your providers:
   - Click "Add Provider"
   - Enter API key and base URL
   - Select available models
   - Set priority for routing
4. Enable "Intelligent Routing" for automatic model selection
5. Click "Start Gateway" to begin

### Managing Projects

```
Projects → Select Project → View Sessions → Resume or Start New
```

- Click on any project to view its sessions
- Each session shows the first message and timestamp
- Resume sessions directly or start new ones

### Creating Agents

```
CC Agents → Create Agent → Configure → Execute
```

1. **Design Your Agent**: Set name, icon, and system prompt
2. **Configure Model**: Choose between available Claude models
3. **Set Permissions**: Configure file read/write and network access
4. **Execute Tasks**: Run your agent on any project

### Tracking Usage

```
Menu → Usage Dashboard → View Analytics
```

- Monitor costs by model, project, and date
- Export data for reports
- Set up usage alerts (coming soon)

### Working with MCP Servers

```
Menu → MCP Manager → Add Server → Configure
```

- Add servers manually or via JSON
- Import from Claude Desktop configuration
- Test connections before using

## 🚀 Installation

### Prerequisites

- **Claude Code CLI**: Install from [Claude's official site](https://claude.ai/code)

### Release Executables

Coming soon! Build from source for now.

## 🔨 Build from Source

### Prerequisites

Before building Doggy from source, ensure you have the following installed:

#### System Requirements

- **Operating System**: Windows 10/11, macOS 11+, or Linux (Ubuntu 20.04+)
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: At least 1GB free space

#### Required Tools

1. **Rust** (1.70.0 or later)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Bun** (latest version)
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

3. **Git**
   ```bash
   # Ubuntu/Debian: sudo apt install git
   # macOS: brew install git
   # Windows: Download from https://git-scm.com
   ```

4. **Claude Code CLI**
   - Download and install from [Claude's official site](https://claude.ai/code)
   - Ensure `claude` is available in your PATH

#### Platform-Specific Dependencies

**Linux (Ubuntu/Debian)**
```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  patchelf \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libxdo-dev \
  libsoup-3.0-dev \
  libjavascriptcoregtk-4.1-dev
```

**macOS**
```bash
xcode-select --install
brew install pkg-config
```

**Windows**
- Install [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- Install [WebView2](https://developer.microsoft.com/microsoft-edge/webview2/)

### Build Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/chenxingqiang/doggy.git
   cd doggy
   ```

2. **Install Frontend Dependencies**
   ```bash
   bun install
   ```

3. **Build the Application**
   
   **For Development (with hot reload)**
   ```bash
   bun run tauri dev
   ```
   
   **For Production Build**
   ```bash
   bun run tauri build
   ```

4. **Platform-Specific Build Options**
   
   **Universal Binary for macOS (Intel + Apple Silicon)**
   ```bash
   bun run tauri build --target universal-apple-darwin
   ```

### Verify Your Build

```bash
# Run the built executable
# Linux/macOS
./src-tauri/target/release/doggy

# Windows
./src-tauri/target/release/doggy.exe
```

## 🛠️ Development

### Tech Stack

- **Frontend**: React 18 + TypeScript + Vite 6
- **Backend**: Rust with Tauri 2
- **UI Framework**: Tailwind CSS v4 + shadcn/ui
- **Database**: SQLite (via rusqlite)
- **Package Manager**: Bun

### Project Structure

```
doggy/
├── src/                   # React frontend
│   ├── components/        # UI components
│   ├── lib/               # API client & utilities
│   └── assets/            # Static assets
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── commands/      # Tauri command handlers
│   │   ├── checkpoint/    # Timeline management
│   │   └── process/       # Process management
│   └── tests/             # Rust test suite
└── scripts/               # Build scripts
```

### Development Commands

```bash
# Start development server
bun run tauri dev

# Run frontend only
bun run dev

# Type checking
bunx tsc --noEmit

# Run Rust tests
cd src-tauri && cargo test

# Generate icons from SVG
node scripts/generate-icons.js
```

## 🔒 Security

Doggy prioritizes your privacy and security:

1. **Process Isolation**: Agents run in separate processes
2. **Permission Control**: Configure file and network access per agent
3. **Local Storage**: All data stays on your machine
4. **No Telemetry**: No data collection or tracking
5. **Open Source**: Full transparency through open source code
6. **API Key Security**: Keys stored locally, never transmitted to third parties

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Areas for Contribution

- 🐛 Bug fixes and improvements
- ✨ New features and enhancements
- 📚 Documentation improvements
- 🎨 UI/UX enhancements
- 🧪 Test coverage
- 🌐 Internationalization
- 🔌 New LLM provider integrations

## 📄 License

This project is licensed under the AGPL License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Tauri](https://tauri.app/) - The secure framework for building desktop apps
- [Claude](https://claude.ai) by Anthropic
- Original opcode project by [Asterisk](https://asterisk.so/)
- Inspired by [claude-code-open](https://github.com/chenxingqiang/claude-code-open)

---

<div align="center">
  <p>
    <strong>Made with 🐕 by <a href="https://github.com/chenxingqiang">Chen Xingqiang</a></strong>
  </p>
  <p>
    <a href="https://github.com/chenxingqiang/doggy/issues">Report Bug</a>
    ·
    <a href="https://github.com/chenxingqiang/doggy/issues">Request Feature</a>
  </p>
</div>

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=chenxingqiang/doggy&type=Date)](https://www.star-history.com/#chenxingqiang/doggy&Date)
