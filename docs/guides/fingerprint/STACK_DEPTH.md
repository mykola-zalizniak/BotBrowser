# Stack Depth Protection

> JavaScript recursive stack depth is a privacy-relevant signal. BotBrowser controls stack depth values through the `--bot-stack-seed` flag.

---

## Prerequisites

- **BotBrowser** installed. See [Installation Guide](../../../INSTALLATION.md).
- **A profile file** (`.enc` for production).


<a id="overview"></a>

## Quick Start

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc"
```

Start with this launch to establish a clean baseline before adding extra overrides.

## Overview

JavaScript recursive call stack depth is a privacy-relevant signal that varies by platform and cannot be controlled through JavaScript injection. BotBrowser protects this surface through the `--bot-stack-seed` flag (ENT Tier2).

---

<a id="botbrowser-solution"></a>

## How BotBrowser Controls Stack Depth

The `--bot-stack-seed` flag provides three modes of stack depth control:

### Profile Mode

Use the exact stack depth values stored in the profile:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-stack-seed=profile
```

This ensures stack depth matches the reference device the profile was captured from.

### Real Mode

Use the native stack depth of the host system:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-stack-seed=real
```

Useful when running on the same platform as the profile target.

### Seed Mode

Use an integer seed (1 to UINT32_MAX) for per-session depth variation:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-stack-seed=12345
```

Each seed produces a different but stable stack depth value. The same seed always produces the same depth, providing reproducibility across sessions.

### Coverage Across Contexts

BotBrowser controls stack depth across all three execution contexts:

- **Main thread**: The primary JavaScript execution context
- **Web Workers**: Background thread contexts
- **WASM**: WebAssembly execution stack

The controlled values maintain realistic ratios between contexts, matching what the target platform would produce.

---

<a id="example"></a>

## Common Scenarios

### Keeping profile-consistent depth across hosts

Use `--bot-stack-seed=profile` when your profile should stay aligned across macOS/Linux/Windows deployment hosts.

### Controlled per-session variance

Use integer seed mode (`--bot-stack-seed=12345`) to keep runs reproducible per seed while avoiding one fixed depth for every session.

### Verifying multi-context behavior

Compare main-thread and Worker depth together when validating changes. A realistic ratio between contexts is often more important than one absolute number.

## Effect Verification

To verify protection is active:

1. Launch BotBrowser with a profile and visit a fingerprint testing site such as [BrowserLeaks](https://browserleaks.com/) or [CreepJS](https://abrahamjuliot.github.io/creepjs/).
2. Confirm that the reported stack depth values match the profile configuration, not the host machine.
3. To verify reproducibility, launch two sessions with the same `--bot-stack-seed` and confirm that the stack depth output is identical across main thread, Web Workers, and WASM contexts.

---

<a id="related-docs"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---|---|
| Stack depth is lower than expected on all contexts | Confirm `--bot-stack-seed` mode is what you intended (`profile`, `real`, or integer seed). |
| Main thread and Worker depths look inconsistent | Re-check that context setup and runtime flags are applied before page scripts execute. |
| Depth varies across sessions unexpectedly | Avoid mixing seed mode and real mode between runs. Keep a fixed seed for reproducible validation. |

## Next Steps

- [CLI Flags Reference](../../../CLI_FLAGS.md). Complete list of all available flags, including `--bot-stack-seed`.
- [Advanced Features](../../../ADVANCED_FEATURES.md). Stack depth control architecture.

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
