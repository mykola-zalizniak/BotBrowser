# Cookie Management

> Inject, persist, and restore cookies for pre-authenticated sessions and repeatable browser state.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser binary** installed. See [INSTALLATION.md](../../../INSTALLATION.md).
- **A profile file** (`.enc` or `.json`).
- **PRO license** for the `--bot-cookies` flag.

---

<a id="overview"></a>

## Overview

The `--bot-cookies` flag lets you inject cookies into BotBrowser sessions at launch time. Cookies are loaded before the first page navigation, so the browser starts with the desired session state. This is useful for restoring authenticated sessions, setting consent preferences, or pre-populating any cookie-dependent state.

You can provide cookies as inline JSON directly in the flag value, or load them from a JSON file.

---

<a id="quick-start"></a>

## Quick Start

### Inline JSON

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-cookies='[{"name":"session_id","value":"abc123","domain":".example.com"}]'
```

### From a file

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-cookies="@/path/to/cookies.json"
```

The file should contain a JSON array of cookie objects.

---

<a id="how-it-works"></a>

## How It Works

1. **Cookie parsing.** At launch, BotBrowser reads the `--bot-cookies` value. If it starts with `@`, the remainder is treated as a file path. Otherwise, the value is parsed as inline JSON.

2. **Cookie injection.** Cookies are injected into the browser's cookie store before any page navigation occurs. This means the first HTTP request already includes the injected cookies.

3. **Domain matching.** Each cookie must include a `domain` field. The browser only sends cookies to matching domains, following standard cookie rules.

### Cookie Format

Each cookie object supports these fields:

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Cookie name. |
| `value` | Yes | Cookie value. |
| `domain` | Yes | Domain the cookie belongs to. Prefix with `.` for subdomains (e.g., `.example.com`). |
| `path` | No | Cookie path. Defaults to `/`. |
| `secure` | No | Whether the cookie requires HTTPS. Defaults to `false`. |
| `httpOnly` | No | Whether the cookie is HTTP-only (not accessible via JavaScript). Defaults to `false`. |
| `sameSite` | No | SameSite attribute: `Strict`, `Lax`, or `None`. |
| `expires` | No | Expiration time as a Unix timestamp (seconds since epoch). |

---

<a id="common-scenarios"></a>

## Common Scenarios

### Pre-authenticated session

```javascript
import { chromium } from "playwright-core";

const cookies = JSON.stringify([
  {
    name: "session_id",
    value: "abc123def456",
    domain: ".example.com",
    path: "/",
    secure: true,
    httpOnly: true,
  },
  {
    name: "user_prefs",
    value: "theme=dark",
    domain: ".example.com",
    path: "/",
  },
]);

const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    "--bot-profile=/path/to/profile.enc",
    `--bot-cookies=${cookies}`,
  ],
});

const page = await browser.newPage();
await page.goto("https://example.com/dashboard"); // Loads as authenticated user
await browser.close();
```

### Cookie consent pre-set

```javascript
const consentCookies = JSON.stringify([
  {
    name: "cookie_consent",
    value: "accepted",
    domain: ".example.com",
    path: "/",
    expires: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
  },
]);

const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    "--bot-profile=/path/to/profile.enc",
    `--bot-cookies=${consentCookies}`,
  ],
});
```

### Loading cookies from a file

Create a `cookies.json` file:

```json
[
  {
    "name": "session_id",
    "value": "abc123",
    "domain": ".example.com",
    "path": "/",
    "secure": true,
    "httpOnly": true
  },
  {
    "name": "locale",
    "value": "en-US",
    "domain": ".example.com",
    "path": "/"
  }
]
```

Then launch with:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-cookies="@/path/to/cookies.json"
```

### JavaScript flag construction

When building the `--bot-cookies` flag in JavaScript, do not wrap the JSON value in extra quotes:

```javascript
// Correct
const cookies = [{ name: "sid", value: "abc", domain: ".example.com" }];
args.push("--bot-cookies=" + JSON.stringify(cookies));

// Wrong - extra quotes become part of the value
args.push(`--bot-cookies='${JSON.stringify(cookies)}'`);
```

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Cookies not sent with requests | Verify the `domain` field matches the target site. Use `.example.com` (with leading dot) to include subdomains. |
| "Invalid JSON" error | Check that the cookie value is a valid JSON array. Use a JSON validator if needed. |
| File not found | When using `@/path/to/file.json`, ensure the path is absolute. |
| Secure cookies not working | Set `secure: true` and access the site via HTTPS. |

---

<a id="next-steps"></a>

## Next Steps

- [Bookmark Seeding](BOOKMARK_SEEDING.md). Pre-populate bookmarks for session authenticity.
- [History Seeding](HISTORY_SEEDING.md). Add browsing history for privacy protection.
- [CLI Flags Reference](../../../CLI_FLAGS.md#--bot-cookies). Full flag documentation.
- [Playwright Guide](../getting-started/PLAYWRIGHT.md). Framework integration basics.

---

**Related documentation:** [CLI Flags Reference](../../../CLI_FLAGS.md) | [Profile Configuration](../../../profiles/PROFILE_CONFIGS.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
