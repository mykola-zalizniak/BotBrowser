# Storage and Memory Consistency

> BotBrowser provides profile-consistent storage quota and memory values, preventing hardware-based tracking through these APIs.

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

Storage and memory APIs can expose hardware characteristics that vary per machine, creating a privacy risk. BotBrowser controls these values at the browser engine level, returning profile-consistent responses that match the target device rather than the host machine.

---

<a id="what-botbrowser-controls"></a>

## What BotBrowser Controls

### Storage Quota

Storage quota values are consistent with the profile's target hardware, not the actual host disk size.

### Heap Memory

Memory-related properties are controlled to return values appropriate for the profile's target device, with internally consistent relationships between reported values.

### Device Memory

Device memory reporting (approximate RAM in gigabytes) is also controlled by the profile, ensuring all memory-related signals are consistent with each other and with the declared hardware.

---

<a id="example"></a>

## Common Scenarios

- Capture a baseline result using the Quick Start setup.
- Change one relevant setting at a time and compare the new output.
- Keep your final launch command documented so future checks are reproducible.

## Example

```javascript
import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    `--bot-profile=${process.env.BOT_PROFILE_PATH}`,
  ],
});

const page = await browser.newPage();
await page.goto("https://example.com");

// ... use the page as needed ...

await browser.close();
```

To verify storage and memory protection is active:

1. Launch BotBrowser with a profile and visit a fingerprint testing site such as [BrowserLeaks](https://browserleaks.com/) or [CreepJS](https://abrahamjuliot.github.io/creepjs/).
2. Confirm that the reported storage quota and device memory values match the profile configuration, not the host machine.
3. Launch a second session with the same profile and confirm identical values are reported.

---

<a id="related-docs"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---|---|
| Observed value does not match the profile expectation | Verify profile path, active overrides, and any framework-injected settings. |
| Same setup behaves differently on another machine | Compare BotBrowser build, profile version, host OS target, and full launch args. |
| Test results fluctuate between runs | Keep proxy, locale/timezone, and runtime load stable during comparison tests. |

<a id="next-steps"></a>

## Next Steps

- [CLI Flags Reference](../../../CLI_FLAGS.md). Complete list of all available flags.
- [Advanced Features](../../../ADVANCED_FEATURES.md). Technical architecture and implementation details.

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
