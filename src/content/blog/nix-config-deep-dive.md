---
title: 'How I Manage My Entire Dev Environment With Nix'
description: 'A deep dive into my nix-darwin and Home Manager configuration: flake architecture, registry-driven hosts, declarative macOS defaults, MCP servers, AI coding assistants, and the noughty module system that ties it all together.'
pubDate: '2026-03-20'
tags: ['nix', 'devtools', 'configuration', 'macos', 'home-manager']
---

I have around 20 machines. Desktops, laptops, servers, VMs, a Steam Deck, and a couple Macs. Every single one of them is configured from a single Git repository. When I set up a new machine, I run one command and walk away. When I come back, my shell, my editor, my fonts, my AI tools, my MCP servers, my macOS dock position, and even my key repeat speed are all exactly where I expect them to be.

This is my Nix configuration. I'm going to walk through how it works.

## Why Nix

If you haven't heard of Nix, the short version is this: it's a package manager and build system that treats your entire system configuration as code. Not "infrastructure as code" in the Terraform sense where you're describing cloud resources. More like "my laptop is a function that takes inputs and produces a deterministic environment."

The practical benefit is reproducibility. I don't install things manually. I don't tweak settings through GUIs. I don't have a README that says "then install these 47 things." I have a flake, and the flake is truth.

The tradeoff is complexity. Nix has a learning curve that looks less like a curve and more like a wall. The language is functional, the documentation is scattered across five different eras of Nix evolution, and the error messages read like someone translated compiler theory into ancient Greek. But once you get past that wall, there is nothing else like it.

## The Flake: Where It All Starts

Everything begins in `flake.nix`. This is the entry point that Nix reads when you build or switch your system. Mine declares about 30 inputs (dependencies) and wires them together.

```nix
{
  description = "Heisenbergs incredibly uncertain nix-darwin and Home Manager Configuration";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
    nixpkgs-unstable.url = "github:NixOS/nixpkgs/nixos-unstable";
    home-manager.url = "github:nix-community/home-manager/release-25.11";
    nix-darwin.url = "github:LnL7/nix-darwin/nix-darwin-25.11";
    catppuccin.url = "github:catppuccin/nix";
    sops-nix.url = "github:Mic92/sops-nix";
    llm-agents.url = "github:numtide/llm-agents.nix";
    # ... and about 20 more
  };
  # ...
}
```

A few things worth noting here. I pin two versions of nixpkgs: a stable channel (`nixos-25.11`) and unstable. Most packages come from stable, but some things, like Claude Code, I pull from unstable because I want the latest version. The `follows` directives you see throughout are deduplication. Without them, every input would bring its own copy of nixpkgs and you'd be downloading the universe twice.

The outputs section delegates everything to a custom builder system in `lib/`:

```nix
outputs = { self, nixpkgs, ... }@inputs:
let
  builder = import ./lib {
    inherit inputs outputs stateVersion darwinStateVersion users;
  };
in {
  darwinConfigurations = builder.mkAllDarwin systems;
  homeConfigurations = builder.mkAllHomes systems;
  # ...
};
```

This is where things get interesting.

## The Registry: One TOML File To Rule Them All

Instead of manually writing a configuration block for every machine, I use a registry. It's a TOML file (`lib/registry-systems.toml`) where every host is declared with its properties:

```toml
[mithrandir]
kind = "computer"
platform = "aarch64-darwin"
formFactor = "laptop"

[mithrandir.gpu]
vendors = ["apple"]

[mithrandir.gpu.compute]
vendor = "apple"
vram = 4
unified = true
```

That's it. That's the entire host definition for my personal MacBook. The builder system reads this registry, resolves defaults based on the `kind` and `platform` (darwin computers get the "aqua" desktop, linux computers get Hyprland), and generates the full NixOS, nix-darwin, or Home Manager configuration automatically.

Adding a new machine is literally adding a TOML block and running the build. No new `.nix` files needed unless the host has genuinely unique requirements.

The registry also handles edge cases cleanly. My Steam Deck has a non-standard username and desktop:

```toml
[steamdeck]
kind = "computer"
platform = "x86_64-linux"
formFactor = "handheld"
username = "deck"
desktop = "gamescope"
tags = ["steamdeck"]
```

And ISO images for fresh installs override the username automatically:

```toml
[nihilus]
kind = "computer"
platform = "x86_64-linux"
tags = ["iso"]
```

The `iso` tag triggers built-in defaults that set the username to "nixos" and strip the desktop. No special casing in the builder. Just data.

## Noughty: The Custom Module System

This is the part I'm most proud of and the part that took the most iteration. I built a custom NixOS/nix-darwin/Home Manager module called `noughty` that provides a unified interface for querying host and user properties anywhere in the configuration.

```nix
options.noughty = {
  host = {
    name = lib.mkOption { type = lib.types.str; };
    kind = lib.mkOption { 
      type = lib.types.enum ["computer" "server" "vm" "container"]; 
    };
    platform = lib.mkOption { type = lib.types.str; };
    desktop = lib.mkOption { type = lib.types.nullOr lib.types.str; };
    formFactor = lib.mkOption { ... };
    gpu = { vendors = ...; compute = { vendor, vram, unified, acceleration }; };
    displays = lib.mkOption { type = lib.types.listOf displaySubmodule; };
    # Derived booleans (read-only)
    is = { workstation, server, laptop, iso, vm, darwin, linux };
  };
  user = {
    name = lib.mkOption { type = lib.types.str; };
    tags = lib.mkOption { type = lib.types.listOf lib.types.str; };
  };
};
```

The power here is in the derived values. The module computes things like `config.noughty.host.is.darwin`, `config.noughty.host.gpu.hasCuda`, `config.noughty.host.display.primaryIsUltrawide`, and `config.noughty.host.display.isMultiMonitor` automatically from the raw data. So anywhere in my config, I can write:

```nix
config = lib.mkIf config.noughty.host.is.darwin {
  # macOS-specific stuff
};
```

Or conditionally enable GPU compute features:

```nix
config = lib.mkIf config.noughty.host.gpu.hasCuda {
  # CUDA-specific packages
};
```

The display submodule is particularly useful. Each host can declare its monitors with resolution, refresh rate, scale, position, and workspace assignments. The module then derives the primary display and exposes helpers like `primaryResolution`, `primaryIsPortrait`, and `primaryIsHighDpi`. This means my Hyprland config (or any window manager config) can reference these values directly without hardcoding per-host display settings.

## Declarative macOS: Yes, All Of It

One of the more satisfying parts of this setup is the macOS configuration. `nix-darwin` lets you declare system defaults that would normally require clicking through System Settings or running `defaults write` commands. My `darwin/default.nix` configures:

```nix
system.defaults = {
  dock = {
    orientation = "left";
    mru-spaces = false;
    show-recents = false;
    tilesize = 48;
    # Disable all hot corners
    wvous-bl-corner = 1;
    wvous-br-corner = 1;
    wvous-tl-corner = 1;
    wvous-tr-corner = 1;
  };

  NSGlobalDomain = {
    AppleInterfaceStyle = "Dark";
    AppleICUForce24HourTime = true;
    InitialKeyRepeat = 15;
    KeyRepeat = 2;
    NSAutomaticCapitalizationEnabled = false;
    NSAutomaticDashSubstitutionEnabled = false;
    NSWindowShouldDragOnGesture = true;
  };

  finder = {
    AppleShowAllFiles = true;
    ShowPathbar = true;
    QuitMenuItem = true;  # Yes, you can quit Finder
  };
};

# TouchID for sudo
security.pam.services.sudo_local.touchIdAuth = true;
```

Every setting, from preventing Photos from auto-opening when you plug in a camera to configuring Time Machine to stop pestering you about backup disks. Declared once, applied everywhere. If I ever need to nuke my Mac and start fresh, I lose nothing.

Homebrew is also managed declaratively through `nix-homebrew`. Nix handles the installation, auto-updates, and even cleanup of orphaned packages:

```nix
homebrew = {
  enable = true;
  onActivation = {
    autoUpdate = true;
    upgrade = true;
    cleanup = "zap";  # Remove anything not declared
  };
};
```

## AI Tooling: Nix-Managed Agents and MCP

This is where the configuration gets modern. I manage my AI coding assistants (Claude Code, OpenCode, Copilot, Gemini CLI) and their MCP server configurations entirely through Nix.

The MCP module (`home-manager/_mixins/development/mcp/default.nix`) defines a centralized `programs.mcp` option where I declare all my MCP servers once:

```nix
programs.mcp = {
  enable = true;
  servers = {
    nixos = {
      command = "${pkgs.unstable.mcp-nixos}/bin/mcp-nixos";
    };
    cloudflare = {
      url = "https://docs.mcp.cloudflare.com/mcp";
    };
    playwright = {
      command = "${pkgs.nodejs}/bin/npx";
      args = ["-y" "@playwright/mcp@latest"];
    };
    github = {
      command = "${pkgs.nodejs}/bin/npx";
      args = ["-y" "@modelcontextprotocol/server-github"];
      env = {
        GITHUB_PERSONAL_ACCESS_TOKEN = "{env:GITHUB_PERSONAL_ACCESS_TOKEN}";
      };
    };
    # ... firecrawl, context7, jina, postgres, sequential-thinking, etc.
  };
};
```

The module then transforms these definitions into the different formats each tool expects. Zed gets `context_servers`, Copilot CLI gets its own `mcp.json`, OpenCode and Claude Code get their respective config formats. One declaration, multiple consumers.

Secrets are handled through `sops-nix`. API keys are encrypted in the repo using age encryption and decrypted at activation time. The zsh init script exports them as environment variables so agents can pick them up:

```nix
sops.secrets = {
  CONTEXT7_API_KEY = {};
  FIRECRAWL_API_KEY = {};
  GITHUB_PERSONAL_ACCESS_TOKEN = {};
  JINA_API_KEY = {};
};
```

No plaintext secrets in the repo. No manual `.env` file management.

## The Assistants Composition System

I also built a composition system for AI assistant instructions. Instead of maintaining separate instruction files for Claude Code and OpenCode, I write shared prompts with tool-specific headers:

```
agents/
  git-workflow/
    description.txt
    header.claude.yaml    # Claude-specific frontmatter
    header.opencode.yaml  # OpenCode-specific frontmatter
    prompt.md             # Shared prompt content
  nix-specialist/
    ...
commands/
  ready/
    ...
instructions/
  global.md               # Shared global instructions
  header.claude.yaml
  header.opencode.yaml
```

The `compose.nix` module reads these directories, merges the appropriate header with the shared prompt body, and writes the result to each tool's expected location. When I update a prompt, both tools get the change. When I add a new agent, I write one prompt and two small YAML headers.

## The Home Manager Layer

Home Manager handles everything in userspace. My `home-manager/default.nix` is where the shell, editor, fonts, and daily-driver tools live.

The shell setup uses zsh with starship prompt, catppuccin theming (mocha flavor, applied consistently across alacritty, ghostty, kitty, bat, fzf, yazi, and zsh syntax highlighting), and a set of modern CLI replacements:

- `eza` instead of `ls` (with git integration)
- `bat` instead of `cat` 
- `fd` instead of `find`
- `ripgrep` instead of `grep`
- `zoxide` instead of `cd` (aliased to `cd` so muscle memory works)
- `yazi` as a terminal file manager
- `lazygit` for git operations

Direnv with nix-direnv is enabled globally, so every project with a `flake.nix` or `.envrc` automatically gets its development environment loaded when I `cd` into it. No manual `nix develop` commands.

## Performance Tuning

A small but important detail: Nix builds can be resource-hungry. On macOS, I configure the Nix daemon to run at background priority so builds don't cause audio stutter or UI jank:

```nix
nix.daemonProcessType = "Background";
nix.daemonIOLowPriority = true;
```

I also crank up substitution parallelism for faster downloads:

```nix
determinateNix.customSettings = {
  max-substitution-jobs = 64;
  http-connections = 128;
  connect-timeout = 10;
  eval-cores = 0;  # Use all cores for parallel evaluation
};
```

## What I'd Do Differently

If I were starting over, I'd build the registry system from day one instead of migrating to it later. I'd also invest more time in the module system earlier. The first few months of my config were a mess of copy-pasted blocks. The noughty module eliminated most of that duplication, but the migration was painful.

I'd also be more disciplined about the stable/unstable boundary. Having two nixpkgs channels is powerful but it's easy to let unstable creep into places where it doesn't need to be.

## Is It Worth It

Yes. But I won't pretend it's for everyone.

If you manage one machine and it works fine, Nix is probably overkill. If you manage multiple machines across multiple platforms and you're tired of things drifting apart, Nix is the closest thing to a solution that actually works.

The initial investment is steep. The payoff is that every machine I touch is identical in the ways that matter and different only in the ways I've explicitly declared. When something breaks, I `git revert` and rebuild. When I get a new machine, I'm productive in minutes instead of days.

My entire development environment, from the color of my terminal cursor to the API keys my AI agents use, is version controlled, reproducible, and one command away.

The config is public if you want to explore it: [github.com/matthew-reed-holden/dotfiles](https://github.com/matthew-reed-holden/dotfiles)
