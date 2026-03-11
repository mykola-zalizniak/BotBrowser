# Navigator Properties Protection

> The `navigator` object is one of the most information-rich API surfaces in the browser. BotBrowser controls every property through its profile system to ensure internal consistency.

---

<a id="prerequisites"></a>

## Prerequisites

- Familiarity with [Browser Fingerprinting Explained](BROWSER_OVERVIEW.md).
- BotBrowser installed with a valid profile. See [Installation](../../../INSTALLATION.md).

---

<a id="overview"></a>

## Quick Start

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc"
```

Start with this launch to establish a clean baseline before adding extra overrides.

## Overview

The `navigator` object is one of the most information-rich API surfaces in the browser. BotBrowser controls every `navigator` property through its profile system, ensuring internal consistency across JavaScript values, HTTP headers, and Worker contexts.

---

<a id="configuration"></a>

## Configuration

### Identity and Locale

```bash
# Browser brand (ENT Tier2)
--bot-config-browser-brand=chrome

# User-Agent version (ENT Tier2)
--bot-config-ua-full-version=146.0.7644.60

# Languages (ENT Tier1)
--bot-config-languages=en-US,en,de

# Locale (ENT Tier1)
--bot-config-locale=en-US

# Timezone (ENT Tier1)
--bot-config-timezone=America/New_York
```

### Custom User-Agent (ENT Tier3)

Build a complete, internally consistent browser identity:

```bash
--user-agent="Mozilla/5.0 (Linux; Android {platform-version}; {model}) ..."
--bot-config-platform=Android
--bot-config-platform-version=13
--bot-config-model=SM-G991B
--bot-config-architecture=arm
--bot-config-bitness=64
--bot-config-mobile=true
```

BotBrowser auto-generates matching Client Hints values (brands, fullVersionList with proper GREASE) and all corresponding HTTP headers. Values stay consistent across the main thread, workers, and HTTP requests.

### Media Devices

```bash
# Use profile-defined synthetic devices (default)
--bot-config-media-devices=profile

# Use real system devices
--bot-config-media-devices=real
```

### Network Information

```bash
# Override network connection properties with profile values
--bot-network-info-override
```

---

<a id="how-botbrowser-controls"></a>

## How BotBrowser Provides Protection

BotBrowser controls all navigator properties at the browser engine level. Identity, hardware, locale, network, and media device information are all defined by the profile. JavaScript values, HTTP headers, and Worker contexts return identical, internally consistent values.

---

<a id="troubleshooting"></a>

## Common Scenarios

- Capture a baseline result using the Quick Start setup.
- Change one relevant setting at a time and compare the new output.
- Keep your final launch command documented so future checks are reproducible.

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| navigator.webdriver returns true | Verify BotBrowser profile is loaded correctly. BotBrowser handles this automatically when a profile is active. |
| Language doesn't match proxy location | Use `--proxy-server` (not framework proxy) for auto-detection, or set `--bot-config-languages` manually. |
| UA-CH headers don't match JavaScript values | This should not happen with BotBrowser. Verify profile is loaded and no external extensions modify headers. |
| hardwareConcurrency shows host value | Ensure profile defines the CPU core count and is loaded correctly. |

---

<a id="next-steps"></a>

## Next Steps

- [Screen and Window Protection](SCREEN_WINDOW.md). Display properties as privacy surfaces.
- [Performance Fingerprinting](PERFORMANCE.md). Timing and connection data control.
- [Speech Synthesis Protection](SPEECH_SYNTHESIS.md). Voice list consistency.
- [CLI Flags Reference](../../../CLI_FLAGS.md). All identity and locale configuration flags.

---

**Related documentation:** [Advanced Features: Browser & OS Fingerprinting](../../../ADVANCED_FEATURES.md#browser-os-fingerprinting) | [Advanced Features: Network Information Privacy](../../../ADVANCED_FEATURES.md#network-info-privacy)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
