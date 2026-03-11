# Automation Consistency Practices

> Maintain browser fingerprint consistency and privacy protection when running BotBrowser with Playwright or Puppeteer.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser** installed and running. See [Installation Guide](../../../INSTALLATION.md).
- **A profile file** (`.enc` for production).
- **Playwright or Puppeteer** installed (if using a framework).

---

<a id="quick-start"></a>

## Quick Start

### Playwright

```javascript
import { chromium } from "playwright-core";

const browser = await chromium.launch({
    executablePath: process.env.BOTBROWSER_EXEC_PATH,
    headless: true,
    args: [
        "--disable-audio-output",
        `--bot-profile=${process.env.BOT_PROFILE_PATH}`,
        "--proxy-server=socks5://user:pass@proxy.example.com:1080",
    ],
});

const page = await browser.newPage();

// Remove Playwright-specific bindings from the page context
await page.addInitScript(() => {
    delete window.__playwright__binding__;
    delete window.__pwInitScripts;
});

await page.goto("https://example.com");
```

### Puppeteer

```javascript
import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
    executablePath: process.env.BOTBROWSER_EXEC_PATH,
    headless: true,
    defaultViewport: null,
    args: [
        "--disable-audio-output",
        `--bot-profile=${process.env.BOT_PROFILE_PATH}`,
        "--proxy-server=socks5://user:pass@proxy.example.com:1080",
    ],
});

const page = await browser.newPage();
await page.goto("https://example.com");
```

---

<a id="how-it-works"></a>

## How It Works

Automation frameworks can introduce browser-environment inconsistencies that undermine fingerprint protection. BotBrowser addresses these automatically:

1. **`navigator.webdriver` property.** BotBrowser controls this property automatically when a profile is loaded. No extra flags are needed.

2. **Automation signals.** BotBrowser suppresses automation-related signals automatically when a profile is active.

3. **Framework bindings.** Playwright injects `__playwright__binding__` and `__pwInitScripts` into the page context. The `addInitScript` call removes these before any page JavaScript executes.

4. **Chrome DevTools Protocol (CDP) artifacts.** BotBrowser's console suppression feature (`--bot-disable-console-message`) ensures consistent console API behavior when CDP is connected.

5. **`--bot-script` alternative.** For the smallest framework footprint, use `--bot-script` instead of an external framework. This runs JavaScript in a privileged isolated page context with `chrome.debugger` access. No external framework bindings or separate CDP client connections are needed.

---

<a id="common-scenarios"></a>

## Common Scenarios

### Playwright binding cleanup

The `addInitScript` runs before any page script, ensuring framework objects are removed:

```javascript
await page.addInitScript(() => {
    delete window.__playwright__binding__;
    delete window.__pwInitScripts;
});
```

This must be called after creating the page but before navigating.

### Puppeteer-specific considerations

Puppeteer does not inject the same bindings as Playwright. The primary concern is:

- **`defaultViewport: null`**: Always set this so Puppeteer does not override the profile's screen dimensions. A mismatched viewport is a consistency signal.

### Using --bot-script for framework-less automation

`--bot-script` provides the smallest framework footprint because it runs without any external framework:

```bash
chromium-browser \
    --headless \
    --bot-profile="/path/to/profile.enc" \
    --bot-script="/path/to/script.js" \
    --proxy-server=socks5://user:pass@proxy.example.com:1080
```

Example script using the `chrome.debugger` API:

```javascript
// script.js - runs in a privileged isolated page context
chrome.debugger.getTargets((targets) => {
    const pageTarget = targets.find(t => t.type === "page");
    if (pageTarget) {
        chrome.debugger.attach({ targetId: pageTarget.id }, "1.3", () => {
            chrome.debugger.sendCommand(
                { targetId: pageTarget.id },
                "Page.navigate",
                { url: "https://example.com" }
            );
        });
    }
});
```

> **Note:** When using `--bot-script`, the page title may display the extension name. Use `--bot-title` to override this.

### Console suppression for CDP consistency

Some runtime consistency checks can infer CDP connections by monitoring console behavior. BotBrowser's `--bot-disable-console-message` flag (ENT Tier1, enabled by default) prevents frameworks from activating these CDP domains, keeping runtime behavior consistent with non-instrumented sessions.

### Combining all protections

For maximum consistency with Playwright:

```javascript
const browser = await chromium.launch({
    executablePath: BOTBROWSER_EXEC_PATH,
    headless: true,
    args: [
        "--disable-audio-output",
        `--bot-profile=${BOT_PROFILE_PATH}`,
        "--proxy-server=socks5://user:pass@proxy.example.com:1080",
    ],
});

const page = await browser.newPage();

await page.addInitScript(() => {
    delete window.__playwright__binding__;
    delete window.__pwInitScripts;
});

await page.goto("https://example.com");
```

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| `navigator.webdriver` returns `true` | Ensure `--bot-profile` is loaded correctly. BotBrowser handles this automatically when a profile is active. |
| Framework bindings still visible | Confirm `addInitScript` is called before the first `page.goto()`. It must run before page JavaScript executes. |
| CDP consistency checks still show instrumentation state | Enable `--bot-disable-console-message` (enabled by default on ENT Tier1). |
| Page title shows extension name | Use `--bot-title` to set a custom title when using `--bot-script`. |
| Viewport size mismatch | Do not set `defaultViewport` in Puppeteer. Do not set viewport options in Playwright. Let the profile control dimensions. |
| Framework artifacts remain despite flags | Use `--bot-script` for the smallest framework footprint. Framework-based automation always carries some artifacts. |

---

<a id="next-steps"></a>

## Next Steps

- [Console Suppression](../fingerprint/CONSOLE_SUPPRESSION.md). Details on suppressing console messages for privacy.
- [Performance Optimization](../deployment/PERFORMANCE_OPTIMIZATION.md). Reduce overhead in production.
- [Playwright Guide](PLAYWRIGHT.md). Complete Playwright integration guide.
- [CLI Flags Reference](../../../CLI_FLAGS.md). Complete list of all available flags.

---

**Related documentation:** [Advanced Features](../../../ADVANCED_FEATURES.md) | [Bot Script Examples](../../../examples/bot-script/) | [Per-Context Fingerprint](../../../PER_CONTEXT_FINGERPRINT.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
