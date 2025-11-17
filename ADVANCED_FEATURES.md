# 🔧 BotBrowser Advanced Features

Robust capabilities for fingerprint‑consistency testing and automation research.

This document details BotBrowser’s advanced features for researchers, developers, and security professionals working in authorized testing environments. For overall usage terms, refer to the [Legal Disclaimer](DISCLAIMER.md) and [Responsible Use Guidelines](RESPONSIBLE_USE.md).

## 🎯 Overview

BotBrowser offers multi‑layer emulation and control to keep fingerprints consistent across platforms. These controls support research into web compatibility, automation detection, and cross‑environment consistency.

---

## 🧭 Capabilities Index

[navigator.webdriver removal](#chrome-behavior-emulation), [main‑world isolation](#playwright-puppeteer-integration), [JS hook stealth](#playwright-puppeteer-integration), [Canvas noise](#graphics-rendering-engine), [WebGL/WebGPU param control](#graphics-rendering-engine), [Skia anti‑alias](#cross-platform-font-engine), [HarfBuzz shaping](#cross-platform-font-engine), [MediaDevices spoofing](#complete-fingerprint-control), [font list spoofing](#cross-platform-font-engine), [UA congruence](#configuration-and-control), [per‑context proxy geo](#enhanced-proxy-system), [DNS‑through‑proxy](#enhanced-proxy-system), [active window emulation](#active-window-emulation), [HTTP headers/HTTP2/HTTP3](#chrome-behavior-emulation), [headless parity](#headless-incognito-compatibility), [WebRTC SDP/ICE control](#webrtc-leak-protection), [TLS fingerprint (JA3/JARM)](#network-fingerprint-control)

<a id="configuration-and-control"></a>
## 🔧 Configuration & Control

### Advanced CLI Configuration
**[28 `--bot-config-*` flags](CLI_FLAGS.md#⚙️-profile-configuration-override-flags)** override key fingerprint properties at startup—no profile edits required.

**Key Benefits:**
- **Highest Priority:** CLI flags override profile settings
- **Dynamic Configuration:** Ideal for scripts and CI/CD
- **Session Isolation:** Clean separation across instances

**Examples:**
```bash
# Override browser brand and WebGL settings
chrome.exe --no-sandbox --bot-profile="C:\\absolute\\path\\to\\profile.enc" \
           --bot-config-browser-brand="edge" \
           --bot-config-webgl="disabled" \
           --bot-config-noise-canvas=true

# Auto-detect location and language from proxy IP
chrome.exe --no-sandbox --bot-profile="C:\\absolute\\path\\to\\profile.enc" \
           --bot-config-timezone="auto" \
           --bot-config-languages="auto" \
           --bot-config-locale="auto"
```

### Session Management
Comprehensive tools for session control and identification.

**Custom Titles and Labels:**
- `--bot-title` - Custom window title and taskbar/dock icon label
- Appears in window title bar and shows on taskbar/dock icon
- Displays as label next to toolbar Refresh button
- Perfect for managing multiple browser instances

**Session Data Management:**
- `--bot-cookies` - JSON string containing cookie data for startup
- `--bot-bookmarks` - JSON string containing bookmark data for startup
- Maintains session state across restarts
- Adds authenticity to browser fingerprint

**Example:**
```bash
chrome.exe --no-sandbox --bot-profile="C:\\absolute\\path\\to\\profile.enc" \
           --bot-title="Research Session A" \
           --bot-cookies='[{"name":"session","value":"abc123","domain":".example.com"}]' \
           --bot-bookmarks='[{"name":"Research","url":"https://example.com","folder":"Work"}]'
```

<a id="enhanced-proxy-system"></a>
### Enhanced Proxy System
Rebuilt for stability, per‑context support, and DNS‑leak protection.

**Embedded Credentials:**
```bash
# HTTP/HTTPS proxy with credentials
--proxy-server="http://username:password@proxy.example.com:8080"
--proxy-server="https://username:password@proxy.example.com:8080"

# SOCKS5 proxy with credentials
--proxy-server="socks5://username:password@proxy.example.com:1080"
```


**Per‑Context Proxy Support:**
```javascript
// Playwright example with different proxies per context
const browser = await chromium.launch({
  executablePath: './chrome', // BotBrowser path
  args: ['--no-sandbox', '--bot-profile=/absolute/path/to/profile.enc']
});

// Context 1 with proxy A
const context1 = await browser.newContext({
  proxy: { server: 'http://user1:pass1@proxy1.com:8080' }
});

// Context 2 with proxy B
const context2 = await browser.newContext({
  proxy: { server: 'socks5://user2:pass2@proxy2.com:1080' }
});
```

**🌍 Automatic Geo‑Detection:** Each context derives timezone, locale, and languages from its proxy IP—no manual setup.

**💡 Performance Tip:** If all contexts share the same proxy IP, set `--proxy-ip` to skip repeated lookups.

**Performance Optimization:**
```bash
# Skip IP lookups for faster page loads
--proxy-server="http://user:pass@proxy.com:8080" --proxy-ip="203.0.113.1"
```

**🛡️ DNS‑Leak Protection:**
- SOCKS5 proxies now prevent local DNS resolution
- All domain lookups go through the proxy tunnel

**⚠️ Important:** Prefer BotBrowser’s proxy options over framework‑specific settings so geo‑detection remains accurate.

<a id="network-fingerprint-control"></a>
## 🌐 Network Fingerprint Control

**Scope:** Network‑layer traits that detection systems often score.

- **HTTP Headers & Protocol:** Chrome‑like request headers; authentic HTTP/2 and HTTP/3 behavior (see Chrome Behavior Emulation).
- **DNS Routing:** SOCKS5 avoids local DNS resolution; all lookups go through the proxy tunnel (see Enhanced Proxy System).
- **WebRTC:** SDP/ICE manipulation and candidate filtering to prevent local IP disclosure (see WebRTC Leak Protection).
- **TLS Fingerprints (JA3/JARM/ALPN):** Status: Roadmap — evaluation in progress; goals include cipher/extension ordering and ALPN tuning.

---

## 🎭 Automation Artifact Research

### Multi‑Layer Noise Injection
Sophisticated noise with consistency algorithms.

**Canvas Fingerprinting Protection:**
- Stabilized noise algorithms ensure consistent results across sessions
- Per-session consistency with cross-session variation
- Maintains realistic canvas behavior patterns

**WebGL Fingerprinting Protection:**
- GPU-specific noise injection patterns
- Preserves authentic WebGL performance characteristics
- Supports both WebGL 1.0 and WebGL 2.0 contexts

**Audio Context Protection:**
- AudioContext fingerprint noise injection
- Maintains realistic audio processing behavior
- Cross-worker consistency for complex applications
- Tuned noise distribution (Chromium 141) to harden probes without audible artifacts

**Text‑Metrics Manipulation:**
- TextMetrics and client rects noise injection
- Font measurement consistency across workers
- Realistic text rendering variations

<a id="active-window-emulation"></a>
### Active Window Emulation
Keep automation sessions foreground-consistent even when the host window is unfocused.

- `--bot-config-always-active` defaults to `true`, suppressing `blur`/`visibilitychange` events and pinning `document.hidden=false`.
- Works per window: disable explicitly when sites must observe genuine focus changes.
- Prevents detection heuristics that watch caret blinking, FocusManager events, or inactive viewport throttling.

<a id="headless-incognito-compatibility"></a>
### Headless & Incognito Compatibility
Consistent behavior across modes with comprehensive simulation.

**GPU Simulation in Headless Mode:**
- Full GPU context simulation without physical GPU
- WebGL and WebGPU rendering consistency
- Hardware-accelerated video decoding simulation

**Incognito‑Mode Enhancements:**
- Eliminates incognito-specific detection vectors
- Consistent fingerprint between normal and incognito modes
- Maintains privacy features while ensuring consistency

<a id="webrtc-leak-protection"></a>
### WebRTC Leak Protection
Complete WebRTC fingerprint control and IP protection.

**SDP Manipulation:**
- IPv4/IPv6 Session Description Protocol (SDP) spoofing
- ICE candidate manipulation and filtering
- STUN/TURN server response modification

**Real‑Time Communication Control:**
- MediaStream API consistency
- RTCPeerConnection behavior modification
- Network topology hiding
- ICE server presets and custom lists via `--bot-config-webrtc-ice` to prevent TURN-level IP disclosure

<a id="chrome-behavior-emulation"></a>
### Chrome Behavior Emulation
Authentic Google Chrome behaviors and API responses.

**Google‑Specific Headers:**
- `X-Browser-*` headers matching authentic Chrome requests
- Chrome-specific HTTP/2 and HTTP/3 behavior
- Authentic request timing and patterns

**Chrome‑Specific APIs:**
- Chrome extension API simulation
- Google services integration behavior
- Chrome-specific JavaScript API responses

**Widevine CDM Integration:**
> Note: BotBrowser does not distribute proprietary modules (e.g., Widevine). End users must obtain playback components via official channels.

---

## 📱 Device & Platform Emulation
Compact overview; expand for full details.

<details>
<summary><strong>Full details: Device & Platform Emulation</strong></summary>

### Cross‑Platform Font Engine
Advanced font rendering with consistent results across hosts.

**Built‑In Font Libraries:**
- Windows fonts (Segoe UI, Arial, Times New Roman, etc.)
- macOS fonts (San Francisco, Helvetica, Times, etc.)
- Android fonts (Roboto, Noto, etc.)
- Complete emoji sets for all platforms

**Accurate Font‑Fallback Chains:**
- Accurate CJK (Chinese, Japanese, Korean) font fallback
- Rare symbol and Unicode character support
- Cross-worker font consistency
- HarfBuzz text shaping integration

**Text‑Rendering Features:**
- Skia anti-aliasing integration
- Multi-language support (CJK/RTL/emoji)
- Platform-specific font metrics
- Consistent text measurement across workers

> **Implementation Detail:** Low‑level rendering paths in Skia (2D/Canvas) and HarfBuzz (text shaping) are tuned where needed to align metrics and glyph shaping across OS targets. We also apply targeted WebGL/WebGPU parameter controls to keep visual output stable across contexts.

### Cross‑Platform Consistency
Eliminates host‑specific rendering differences for accurate cross‑platform emulation.

**OS‑Emulation Capabilities:**
- Windows profile works perfectly on macOS/Linux hosts
- macOS profile runs authentically on Windows/Linux hosts
- Android profile fully emulated on any desktop OS
- Consistent behavior regardless of host operating system
- Android DevTools panes stay readable under emulation—the inspector now ignores page zoom/font scaling so toolbars and monospace panes match real devices

**Rendering Consistency:**
- Eliminates host OS rendering artifacts
- Platform-specific UI element simulation
- Consistent touch/mouse event patterns
- Authentic device behavior emulation

### Touch & Input Reliability
- Pointer/touch bridging fixes ensure `Input.dispatchMouseEvent` and synthesized taps land reliably, even in nested iframe trees
- Mobile flows keep consistent tap timing and coordinates when `mobileForceTouch` is enabled, avoiding accidental double dispatches

### Hardware Fingerprint Control
Comprehensive hardware emulation and fingerprint management.

**CPU‑Architecture Emulation:**
- x86/x64/ARM architecture simulation
- Authentic CPU core count and timing
- Realistic performance characteristics
- Hardware concurrency simulation
- JavaScript & WebAssembly parity across baseline, Turbo, and SIMD pipelines so architecture sniffing funnels into the same curated signature

**Screen and Display Control:**
- Device pixel ratio emulation
- Screen resolution and color depth control
- Multi-monitor configuration simulation
- Refresh rate and orientation control

**Device‑Behavior Simulation:**
- Authentic device memory reporting
- Battery status and charging simulation
- Network connection type emulation
- Sensor availability and behavior

---

## ⚡ Deep System Integration
</details>

Compact overview; expand for full details.

<details>
<summary><strong>Full details: Deep System Integration</strong></summary>

### Precise FPS Simulation
Advanced frame‑rate and performance emulation.

**Refresh‑Rate Control:**
- Emulate target refresh rates (60Hz, 120Hz, 144Hz, etc.)
- Simulate high-FPS macOS behavior on Ubuntu hosts
- Authentic vsync and frame timing patterns
- Input latency simulation matching target devices

**Performance Timing:**
- requestAnimationFrame delay matching target FPS
- Realistic frame drops and performance variations
- GPU rendering timing simulation
- Display synchronization behavior

### Performance Fingerprint Controls
Fine‑grained tuning for authentic device simulation.

**Memory‑Allocation Timing:**
- Realistic memory allocation patterns
- Garbage collection timing simulation
- Heap size and growth patterns
- Memory pressure response simulation

**Database‑Access Latency:**
- IndexedDB access timing control
- WebSQL performance characteristics (where supported)
- localStorage and sessionStorage timing
- Cache API response timing

**Computation Performance:**
- JavaScript execution timing control
- WebAssembly performance simulation
- Crypto API timing characteristics
- Web Worker performance patterns

### Extended Media Types & WebCodecs APIs
Comprehensive media‑format support and codec emulation.

**Broader MediaTypes Coverage:**
- Extended MIME type support beyond browser defaults
- Platform-specific codec availability simulation
- Authentic media format reporting
- Container format support detection
- Default profile configuration now uses `expand` to prioritize local decoders; switch back to `profile` for legacy canned lists

**WebCodecs API Support:**
- videoDecoderSupport authentic reporting
- audioDecoderSupport realistic availability
- Hardware-accelerated codec simulation
- Encoding capability emulation

**Media Capabilities:**
- Realistic mediaCapabilities.decodingInfo() responses
- Power efficiency reporting simulation
- Smooth playback prediction accuracy
- HDR and wide gamut support detection

### GPU Driver Micro‑Benchmarks
Sophisticated GPU‑behavior emulation with vendor‑specific patterns.

**Precision‑Timing Emulation:**
- GPU command execution timing
- Shader compilation performance
- Texture upload/download speeds
- Buffer allocation and transfer rates

**Vendor‑Specific Behavior:**
- NVIDIA, AMD, Intel driver behavior patterns
- OpenGL extension availability simulation
- Vulkan capability reporting
- DirectX feature level emulation

**Authentic Computation Curves:**
- Realistic performance scaling
- Memory bandwidth limitations
- Thermal throttling behavior
- Power management responses

### Dynamic Blink Features
Runtime OS‑based feature loading for authentic behavior.

**OS‑Specific Features:**
- Windows-specific Blink features
- macOS-exclusive capabilities
- Android mobile features
- Linux distribution variations

**Feature Detection:**
- Authentic feature availability reporting
- Runtime capability discovery
- Progressive enhancement support
- Fallback behavior simulation

---

## 📋 Complete Fingerprint Control
</details>

Compact overview; expand for full details.

<details>
<summary><strong>Full details: Complete Fingerprint Control</strong></summary>

### Browser & OS Fingerprinting
Comprehensive browser and OS emulation.

| Component | Capabilities |
|-----------|-------------|
| **User Agent** | Version control, userAgentData brands, full version override |
| **Platform Detection** | Windows/macOS/Android emulation with authentic APIs |
| **Browser Features** | Debugger disabling, CDP leak blocking, Chrome-specific behavior |
| **Font System** | Built-in cross-platform fonts, Blink features, authentic fallback chains |

### Location & Time Management
Precise geolocation and temporal controls.

| Component | Capabilities |
|-----------|-------------|
| **Timezone** | Automatic IP-based detection, manual override, DST handling |
| **Geolocation** | Coordinate spoofing, accuracy simulation, permission handling |
| **Time APIs** | Date/time consistency, performance.now() behavior, timezone transitions |

### Display & UI Control
Complete visual presentation and UI fingerprint controls.

| Component | Capabilities |
|-----------|-------------|
| **Screen Properties** | Resolution, color depth, orientation, pixel density |
| **Window Dimensions** | Size control, viewport management, responsive behavior |
| **Color Schemes** | matchMedia queries, prefers-color-scheme, system colors |
| **UI Elements** | System colors, scrollbar styling, form control appearance |

### Input & Navigation Systems
Comprehensive input and navigation behavior emulation.

| Component | Capabilities |
|-----------|-------------|
| **Keyboard** | Layout emulation, key timing, input method simulation |
| **Touch Interface** | Touch event simulation, gesture recognition, mobile patterns |
| **Mouse Patterns** | Movement algorithms, click timing, scroll behavior |
| **Languages** | Accept-Language headers, navigator.languages, speech recognition |
| **Permissions** | API permission simulation, notification handling, media access |
| **Navigation** | History manipulation, referrer control, navigation timing |

<a id="graphics-rendering-engine"></a>
### Graphics & Rendering Engine
Advanced graphics controls and rendering consistency.

| Component | Capabilities |
|-----------|-------------|
| **Canvas** | 2D context noise, consistent image data, cross-worker consistency |
| **WebGL** | Precision GPU micro-benchmarks, driver-specific behavior, extension simulation |
| **WebGPU** | Modern GPU API support, compute shader capabilities, buffer management |
| **Text Rendering** | HarfBuzz text shaping, cross-platform fonts, emoji rendering consistency |
| **Performance** | Precise FPS simulation, texture hash spoofing, render timing control |

### Network & Media Subsystems
Complete network behavior and media‑processing capabilities.

| Component | Capabilities |
|-----------|-------------|
| **Proxy** | Authentication embedding, credential management, geo-detection |
| **WebRTC** | SDP manipulation, ICE candidate control, media stream simulation |
| **HTTP Headers** | Google-specific headers, Chrome behavior patterns, request timing |
| **Media Devices** | AudioContext simulation, speech synthesis, device enumeration |
| **Codecs** | Extended media types, WebCodecs APIs, hardware acceleration simulation |

### Performance Characteristics
Fine‑grained performance fingerprint control and timing simulation.

| Component | Capabilities |
|-----------|-------------|
| **Memory** | Allocation timing, garbage collection patterns, heap behavior |
| **Storage** | IndexedDB latency, cache timing, quota management |
| **Animation** | requestAnimationFrame precision, frame timing, smooth scrolling |
| **Computation** | JavaScript execution timing, WebAssembly performance, crypto operations |

---

## 🔗 Integration with Automation Frameworks
</details>

### Framework‑Less Automation (`--bot-script`)
Execute JavaScript with privileged `chrome.debugger` access.

**Key Advantages:**
- **No framework dependencies** - Pure Chrome DevTools Protocol access
- **Earlier intervention** - Execute before page navigation
- **Privileged context** - Full `chrome.debugger` API access
- **Reduced detection surface** - No Playwright/Puppeteer artifacts

**Usage Example:**
```bash
chrome.exe --no-sandbox --bot-profile="C:\\absolute\\path\\to\\profile.enc" --bot-script="automation.js"
```

**Available APIs in Bot‑Script Context:**
- `chrome.debugger` - Full Chrome DevTools Protocol access
- `chrome.runtime` - Runtime APIs and event handling
- Standard browser APIs (console, setTimeout, etc.)

📖 **Documentation:** [Bot Script Automation Examples](examples/bot-script)

<a id="playwright-puppeteer-integration"></a>
### Playwright/Puppeteer Integration
Enhanced compatibility with popular automation frameworks.

**CDP‑Leak Protection:**
- Blocks automation detection via Chrome DevTools Protocol artifacts
- Maintains authentic browser behavior under automation
- Eliminates framework-specific fingerprint signatures

**Enhanced WebDriver Support:**
- ChromeDriver compatibility improvements
- Selenium Grid integration support
- Custom WebDriver extension APIs

---

## 🔬 Research Applications

### Academic Research Use Cases
BotBrowser’s capabilities support multiple research applications in authorized environments:

**Browser Compatibility Studies:**
- Cross-platform rendering consistency analysis
- Fingerprint stability across different environments
- Automation detection mechanism research

**Security Research:**
- Web application security testing
- Anti-bot system evaluation
- Fingerprinting technique analysis

**Performance Research:**
- Browser performance characteristic studies
- Media codec compatibility research
- Graphics rendering optimization analysis

### Ethical Research Guidelines

**Authorized Environments Only:**
- University and institutional research projects
- Controlled security testing environments
- Systems you own or have explicit permission to test

**Prohibited Uses:**
- Production testing against third-party services without permission
- Terms of service violations
- Unauthorized access attempts
- Commercial exploitation without proper licensing

---

## 🛠️ Technical Implementation Details

### Architecture Overview
BotBrowser implements advanced features across multiple layers:

**Chromium Base Modifications:**
- Core browser engine enhancements
- Platform abstraction layer improvements
- API behavior modification and extension

**Profile System Integration:**
- Encrypted profile format with comprehensive fingerprint data
- Runtime configuration override capabilities
- Cross-platform compatibility matrix

**Noise‑Generation Algorithms:**
- Cryptographically secure randomization
- Deterministic per-session consistency
- Realistic variation patterns

### Performance Optimization
Advanced features are engineered for minimal performance impact:

**Lazy Loading:**
- Features activated only when needed
- Memory-efficient fingerprint storage
- On-demand capability initialization

**Caching Systems:**
- Intelligent fingerprint data caching
- Optimized rendering pipeline
- Efficient cross-worker communication

---

## 📞 Advanced Feature Support

For technical questions about advanced features, implementation details, or custom requirements:

| Contact Method | Link |
|----------------|------|
| 📧 Email | [botbrowser@bk.ru](mailto:botbrowser@bk.ru) |
| 📱 Telegram | [@botbrowser_support](https://t.me/botbrowser_support) |

---

## 🔗 Related Documentation

- **[Main README](README.md)** - Project overview and quick start
- **[Installation Guide](INSTALLATION.md)** - Detailed setup instructions
- **[CLI Flags Reference](CLI_FLAGS.md)** - Complete command-line options
- **[Profile Configuration](profiles/PROFILE_CONFIGS.md)** - Advanced profile customization
- **[Validation Results](VALIDATION.md)** - Research and testing data
- **[BotCanvasLab](tools/botcanvas/)** - Canvas forensics and fingerprint analysis tool
- **[Examples](examples/)** - Automation code samples

---

**📋 [Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md)** • **[Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)** — BotBrowser is for authorized fingerprint-consistency testing and research only.
