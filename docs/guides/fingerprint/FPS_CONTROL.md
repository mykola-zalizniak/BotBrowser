# FPS Control

> Frame rate is a trackable signal tied to display hardware. BotBrowser controls frame rate reporting through the `--bot-fps` flag.

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

Frame rate is a privacy-relevant signal tied to display hardware and system configuration. BotBrowser controls frame rate through the `--bot-fps` flag (ENT Tier2), ensuring consistent values that match the loaded profile.

---

<a id="botbrowser-solution"></a>

## How BotBrowser Controls FPS

The `--bot-fps` flag provides three modes:

### Profile Mode (Default)

Use the frame rate defined in the profile:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-fps=profile
```

The profile contains the target device's refresh rate, and BotBrowser matches `requestAnimationFrame` timing to that rate.

### Real Mode

Use the native frame rate of the host system:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-fps=real
```

Useful when the host hardware matches the profile target.

### Fixed FPS

Specify an exact frame rate as a number:

```bash
# Standard 60Hz display
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-fps=60

# High refresh rate display
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-fps=120
```

Frame timing and rendering intervals match the target FPS on any host hardware.

---

<a id="example"></a>

## Common Scenarios

### Reproducing a 60Hz profile on mixed hardware

Use `--bot-fps=60` when your deployment fleet includes high-refresh displays or headless hosts with inconsistent native timing.

### Matching high-refresh profiles

If the target profile is based on 120Hz/144Hz hardware, keep `--bot-fps=profile` (or set an explicit value) to maintain consistency with profile-declared display traits.

### Debugging host-driven frame jitter

Temporarily compare `--bot-fps=real` vs `--bot-fps=profile` to isolate whether instability comes from host rendering load or from profile settings.

## Playwright Example

```javascript
import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    `--bot-profile=${process.env.BOT_PROFILE_PATH}`,
    "--bot-fps=60",
  ],
});

const page = await browser.newPage();
await page.goto("https://example.com");

// ... use the page as needed ...

await browser.close();
```

To verify FPS control is active:

1. Launch BotBrowser with a profile and visit a fingerprint testing site such as [BrowserLeaks](https://browserleaks.com/) or [CreepJS](https://abrahamjuliot.github.io/creepjs/).
2. Confirm that the reported frame rate matches the `--bot-fps` value, not the host display's native refresh rate.
3. Compare results between `--bot-fps=60` and `--bot-fps=120` to confirm the flag takes effect.

---

<a id="related-docs"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---|---|
| Measured FPS drifts from configured value | Check CPU/GPU saturation on the host. Heavy rendering load can still introduce jitter around the target rate. |
| Profile says 120Hz but measured near 60Hz | Ensure `--bot-fps` is not pinned to `60` and confirm the active launch args in the running process. |
| Results differ between headless and headful | Validate both modes with the same profile and flags; headless composition path can differ under load. |

## Next Steps

- [CLI Flags Reference](../../../CLI_FLAGS.md). Complete list of all available flags, including `--bot-fps`.
- [Advanced Features](../../../ADVANCED_FEATURES.md). Precise FPS simulation architecture.

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
