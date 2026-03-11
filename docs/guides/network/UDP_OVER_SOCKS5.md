# UDP over SOCKS5

> Route UDP protocols like QUIC and STUN through SOCKS5 to prevent IP leaks and keep network identity consistent.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser ENT Tier3 license.**
- **A SOCKS5 proxy** that supports the UDP ASSOCIATE command.
- **BotBrowser binary** with a valid profile loaded via `--bot-profile`.

---

<a id="quick-start"></a>

## Quick Start

No additional flags are needed. When your SOCKS5 proxy supports UDP, BotBrowser automatically tunnels UDP traffic through the proxy:

```javascript
import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    `--bot-profile=${process.env.BOT_PROFILE_PATH}`,
    "--proxy-server=socks5://user:pass@proxy.example.com:1080",
  ],
});

const page = await browser.newPage();
await page.goto("https://example.com");
// QUIC and STUN traffic are automatically tunneled through the proxy
await browser.close();
```

---

<a id="how-it-works"></a>

## How It Works

### Why UDP Matters

Modern web traffic relies on two key UDP protocols:

**QUIC (HTTP/3).** Chrome uses QUIC for faster connections to supported servers (Google and many others). QUIC traffic uses UDP instead of TCP. Without UDP tunneling, QUIC connections go outside the proxy tunnel, revealing your real IP to the destination server.

**STUN (WebRTC).** STUN servers help browsers discover their public IP for peer-to-peer connections. STUN requests use UDP. Without UDP tunneling, STUN probes reveal your real IP even when HTTP traffic goes through the proxy.

### How BotBrowser Tunnels UDP

BotBrowser supports SOCKS5 UDP ASSOCIATE, tunneling QUIC and STUN traffic through the proxy when supported:

1. BotBrowser negotiates a UDP association with the proxy server.
2. QUIC and STUN traffic are tunneled through the proxy.
3. WebRTC ICE candidates reflect the proxy IP instead of the host IP.
4. The proxy server forwards UDP packets to the destination and relays responses back.

This happens transparently. No external proxy chains, no additional software, no configuration beyond specifying the SOCKS5 proxy.

### Relationship with WebRTC ICE Presets

When UDP-over-SOCKS5 is active, STUN responses already reflect the proxy's IP. This means `--bot-webrtc-ice` presets are often unnecessary, since ICE candidates are already consistent with your proxy identity. ICE presets are still useful when your proxy does not support UDP.

---

<a id="common-scenarios"></a>

## Common Scenarios

### Standard SOCKS5 with UDP support

If your proxy supports UDP, everything works automatically:

```bash
--proxy-server=socks5://user:pass@proxy.example.com:1080
```

QUIC and STUN traffic are tunneled through the proxy. TCP traffic is proxied as usual.

### When the proxy does not support UDP

If the proxy does not support UDP ASSOCIATE, BotBrowser falls back gracefully:

- QUIC connections fall back to HTTP/2 over TCP (which is proxied normally).
- STUN probes may reveal your real IP. Use `--bot-webrtc-ice=google` to control ICE endpoints.

```bash
# Proxy without UDP support - add ICE control for WebRTC protection
--proxy-server=socks5://user:pass@proxy.example.com:1080 --bot-webrtc-ice=google
```

### Combining with per-context proxy

Each BrowserContext can have its own SOCKS5 proxy. UDP tunneling is handled at the browser level, but each context's proxy endpoint is respected:

```javascript
// Puppeteer
const client = await browser.target().createCDPSession();

const ctx = await browser.createBrowserContext();
await client.send("BotBrowser.setBrowserContextFlags", {
  browserContextId: ctx._contextId,
  botbrowserFlags: [
    "--bot-profile=/path/to/profile.enc",
    "--proxy-server=socks5://user:pass@proxy.example.com:1080",
  ],
});

const page = await ctx.newPage();
// UDP traffic for this context goes through its own proxy
```

---

<a id="limitations"></a>

## Limitations

- **Proxy must support UDP ASSOCIATE.** Not all SOCKS5 proxies support UDP. Check with your provider. HTTP and HTTPS proxies do not support UDP tunneling.
- **Browser-level setting.** UDP proxy support applies at the browser level and cannot be configured per-context independently.
- **Performance.** UDP-over-SOCKS5 adds latency compared to direct UDP. For latency-sensitive WebRTC applications, this trade-off favors privacy over raw speed.

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| QUIC connections not going through proxy | Verify your SOCKS5 proxy supports UDP ASSOCIATE. Not all providers do. |
| WebRTC still shows real IP | Confirm UDP support. If unavailable, use `--bot-webrtc-ice=google` for ICE control. |
| Increased latency on some sites | UDP tunneling adds overhead. This is expected. For sites that support both QUIC and HTTP/2, performance should be comparable. |
| Feature not available | UDP-over-SOCKS5 requires an ENT Tier3 license. |

---

<a id="next-steps"></a>

## Next Steps

- [WebRTC Leak Prevention](WEBRTC_LEAK_PREVENTION.md). Additional WebRTC protection options.
- [Proxy Configuration](PROXY_CONFIGURATION.md). Supported protocols and credential formats.
- [DNS Leak Prevention](DNS_LEAK_PREVENTION.md). Prevent DNS queries from leaking.
- [Per-Context Proxy](PER_CONTEXT_PROXY.md). Assign different proxies to different contexts.
- [CLI Flags Reference](../../../CLI_FLAGS.md). Complete list of all available flags.

---

**Related documentation:** [Advanced Features: Network Fingerprint Control](../../../ADVANCED_FEATURES.md#network-fingerprint-control) | [CLI Flags: UDP over SOCKS5](../../../CLI_FLAGS.md#udp-over-socks5-ent-tier3)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
