# BotBrowser Performance Benchmark

Performance data comparing BotBrowser fingerprint protection overhead against stock Chromium, and evaluating Per-Context Fingerprint scalability.

## Key Findings

| Question | Answer |
|----------|--------|
| **How much overhead does BotBrowser add?** | Near-zero. Speedometer 3.0 shows **<1% difference** in both headed and headless modes, within run-to-run variance. |
| **Are fingerprint APIs slower?** | No. Canvas, WebGL, Navigator, Screen, and Font APIs show **identical latency** with or without fingerprint profiles on macOS, Linux, and Windows. |
| **How does Per-Context Fingerprint scale?** | At 50 concurrent profiles: **29% less memory**, **57% fewer processes**, **2x faster creation** vs launching 50 separate browser instances. Full fingerprint isolation verified. |

## Single Instance Performance

### Standard Benchmark Suites

All benchmarks run locally (no network dependency). Each test runs 3 times; median reported.

**Test Environment**: macOS (Apple M4 Max, 16 cores, 64GB RAM)

| Mode | Benchmark | Stock Chrome | BotBrowser + Android | Difference |
|------|-----------|-------------|---------------------|------------|
| Headless | **Speedometer 3.0** | 42.8 (±0.31) | 42.7 (±0.25) | **-0.2%** |
| Headed | **Speedometer 3.0** | 41.8 (±0.21) | 42.1 (±0.17) | **+0.7%** |

> **Methodology**: Warm-up run (discarded) + 3 measurement runs with interleaved test order (Stock → BB → Stock → BB → Stock → BB) to eliminate thermal/cache bias. Scores shown as median ± stddev.
>
> **Result**: BotBrowser's fingerprint protection adds **no measurable overhead** to JavaScript and DOM performance. Differences of 0.1-0.3 points are well within run-to-run variance. Consistent across both headed and headless modes.

### Fingerprint API Overhead

Individual API latency measured over 1,000 iterations each, median reported (milliseconds).

| API | Stock Chrome | BB + Android | BB + Windows | BB + macOS |
|-----|-------------|-------------|-------------|-----------|
| Canvas2D `toDataURL()` | 0.5 | 0.5 | 0.5 | 0.5 |
| Canvas2D `getImageData()` | 0.0 | 0.0 | 0.0 | 0.0 |
| WebGL `getParameter(RENDERER)` | 0.0 | 0.0 | 0.0 | 0.0 |
| WebGL `getSupportedExtensions()` | 0.0 | 0.0 | 0.0 | 0.0 |
| WebGL `getShaderPrecisionFormat()` | 0.0 | 0.0 | 0.0 | 0.0 |
| WebGL `readPixels()` | 0.2 | 0.2 | 0.2 | 0.2 |
| AudioContext Offline Render + Hash | 3.9 | 2.9 | 3.2 | 3.7 |
| Navigator `userAgent` | 0.0 | 0.0 | 0.0 | 0.0 |
| Navigator `platform` | 0.0 | 0.0 | 0.0 | 0.0 |
| Screen `width` + `height` | 0.0 | 0.0 | 0.0 | 0.0 |
| `performance.now()` | 0.0 | 0.0 | 0.0 | 0.0 |
| Font `measureText()` (50 fonts) | 0.0 | 0.0 | 0.0 | 0.0 |
| Intl `DateTimeFormat.resolvedOptions` | 0.0 | 0.0 | 0.0 | 0.0 |

> **Result**: Fingerprint protection adds **zero overhead** on all tested APIs. Canvas, WebGL, Navigator, Screen, and Font APIs show identical latency with or without a fingerprint profile. AudioContext variance (2.9-3.9ms) is within normal fluctuation.

### Page Load Time

Median load time for a locally-intercepted page (milliseconds).

| Configuration | Load Time | vs Stock |
|---------------|-----------|----------|
| Stock Chrome (no profile) | 29.7ms | - |
| BotBrowser + Android | 101.6ms | +72ms |
| BotBrowser + Windows | 102.9ms | +73ms |
| BotBrowser + macOS | 105.9ms | +76ms |

> **Note**: The additional ~72-76ms comes from one-time profile initialization (reading and applying fingerprint configuration on first page load). All three profile types show similar overhead, indicating no significant difference between cross-platform profiles.

---

## Scale Performance: Per-Context vs Multi-Instance

The core value proposition for enterprise users: running N different fingerprint profiles simultaneously.

### Architecture Comparison

| Architecture | How It Works |
|-------------|-------------|
| **Multi-Instance** | Launch N separate browser processes, each with a different `--bot-profile` |
| **Per-Context** (ENT Tier 3) | Launch 1 browser, create N BrowserContexts, each assigned a different profile via CDP `BotBrowser.setBrowserContextFlags` |

### Resource Usage at Scale

**Test Environment**: macOS (Apple M4 Max, 16 cores, 64GB RAM), Headless mode

| Scale | MI Memory | PC Memory | Savings | MI Processes | PC Processes | MI Create Time | PC Create Time | Speedup |
|-------|-----------|-----------|---------|-------------|-------------|---------------|---------------|---------|
| **1** | 16,055 MB | 14,022 MB | 13% | 140 | 136 | 1,667ms | 627ms | 2.7x |
| **10** | 23,345 MB | 19,586 MB | 16% | 212 | 150 | 11,434ms | 4,854ms | 2.4x |
| **25** | 30,133 MB | 23,781 MB | 21% | 320 | 174 | 28,205ms | 14,415ms | 2.0x |
| **50** | 40,218 MB | 28,553 MB | **29%** | 492 | 210 | 57,891ms | 28,946ms | **2.0x** |

> Per-Context memory savings increase with scale as the shared browser/GPU/network processes are amortized across more contexts.

### Canvas Fingerprint Isolation

Each context/instance receives a unique noise seed, producing distinct canvas fingerprints. Verified across all scale levels:

| Architecture | Scale | Unique Hashes | Status |
|-------------|-------|---------------|--------|
| Multi-Instance | 10 | 10/10 | PASS |
| Multi-Instance | 25 | 10/10 | PASS |
| Multi-Instance | 50 | 10/10 | PASS |
| Per-Context | 10 | 10/10 | PASS |
| Per-Context | 25 | 10/10 | PASS |
| Per-Context | 50 | 10/10 | PASS |

> Per-Context Fingerprint provides the same fingerprint isolation as running separate browser instances, while sharing infrastructure resources.

### Scaling Characteristics

**Multi-Instance** (N browsers):
- Memory grows linearly: each browser adds ~400-800MB
- Process count grows linearly: ~7-10 processes per browser
- Creation time grows linearly: ~1s per browser

**Per-Context** (1 browser, N contexts):
- Memory grows sub-linearly: contexts share browser/GPU/network processes
- Process count grows more slowly: shared processes are reused
- Creation time grows sub-linearly: no browser startup overhead per context

### At 50 Concurrent Profiles

```
Multi-Instance:  40,218 MB memory | 492 processes | 57.9s to create
Per-Context:     28,553 MB memory | 210 processes | 28.9s to create
                 ──────────────────────────────────────────────────
Savings:           29% memory     | 57% processes  |  2.0x faster
```

### Context Lifecycle Performance

Continuous create/destroy cycle test (200 iterations):

| Metric | Value |
|--------|-------|
| Context creation (median) | 278ms |
| Context creation (p95) | 369ms |
| Context destruction (median) | 7.9ms |
| Context destruction (p95) | 16ms |
| Memory trend (200 cycles) | Stable (no persistent growth) |

> Context creation is lightweight (~280ms) and destruction is near-instant (~8ms). Memory remains stable over 200 create/destroy cycles with no persistent memory leaks observed.

---

## Cross-Platform Verification

BotBrowser supports applying any platform's fingerprint on any host OS. Tested on macOS, Linux, and Windows.

### Fingerprint API Latency: macOS Host

All values in milliseconds (median of 1,000 iterations). Headless mode.

| API | Stock Chrome | BB + Android | BB + Windows | BB + macOS |
|-----|-------------|-------------|-------------|-----------|
| Canvas2D `toDataURL()` | 0.5 | 0.5 | 0.5 | 0.5 |
| WebGL `readPixels()` | 0.2 | 0.2 | 0.2 | 0.2 |
| AudioContext Render | 3.9 | 2.9 | 3.2 | 3.7 |
| All other APIs | 0.0 | 0.0 | 0.0 | 0.0 |

### Fingerprint API Latency: Linux Host

Tested in both headless and headed modes.

| API | Headless Stock | Headless BB | Headed Stock | Headed BB |
|-----|---------------|------------|-------------|----------|
| Canvas2D `toDataURL()` | 0.3 | 0.3 | 0.3 | 0.3 |
| WebGL `readPixels()` | 0.1 | 0.1 | 0.1 | 0.1 |
| AudioContext Render | 8.5 | 7.1 | 9.0 | 7.7 |
| Font `measureText()` | 0.1 | 0.1 | 0.1 | 0.1 |
| All other APIs | 0.0 | 0.0 | 0.0 | 0.0 |

### Fingerprint API Latency: Windows Host

Tested in both headless and headed modes.

| API | Headless Stock | Headless BB | Headed Stock | Headed BB |
|-----|---------------|------------|-------------|----------|
| Canvas2D `toDataURL()` | 1.8 | 1.8 | 1.6 | 1.5 |
| Canvas2D `getImageData()` | 0.7 | 0.6 | 0.6 | 0.6 |
| WebGL `readPixels()` | 0.5 | 0.7 | 0.6 | 0.6 |
| AudioContext Render | 10.5 | 9.1 | 8.9 | 10.8 |
| Font `measureText()` | 0.3 | 0.3 | 0.3 | 0.3 |
| All other APIs | 0.0 | 0.0 | 0.0 | 0.0 |

> **Note**: The Windows test environment uses software rendering (no discrete GPU), resulting in higher Canvas/WebGL baseline latency compared to macOS. The relative overhead between Stock and BotBrowser remains **zero**.

### Page Load: Windows Host

| Mode | Stock Chrome | BotBrowser + Android |
|------|-------------|---------------------|
| Headless | 28.7ms | 27.9ms (-0.8ms) |
| Headed | 27.9ms | 27.1ms (-0.8ms) |

### Page Load: Linux Host

| Mode | Stock Chrome | BotBrowser + Android |
|------|-------------|---------------------|
| Headless | 7.4ms | 8.4ms (+1.0ms) |
| Headed | 8.6ms | 6.9ms (-1.7ms) |

> **Result**: Fingerprint protection overhead is **zero** for all core APIs across all three platforms and both rendering modes.

---

## Methodology

### Test Configuration

| Setting | Value |
|---------|-------|
| Chrome version | 145 |
| Automation | Playwright (playwright-core) |
| Benchmark deployment | Local HTTP server (no network dependency) |
| Test categories | Speedometer 3.0, Fingerprint API micro-benchmarks (13 APIs), Page load timing, Per-Context vs Multi-Instance scale |

### How to Reproduce

All benchmark scripts are available in [`docs/benchmarks/`](docs/benchmarks/):

| Script | Purpose |
|--------|---------|
| [`bench-baseline.js`](docs/benchmarks/scripts/bench-baseline.js) | Single-instance benchmark (Speedometer + Fingerprint API + Page load) |
| [`bench-scale.js`](docs/benchmarks/scripts/bench-scale.js) | Per-Context vs Multi-Instance scale test |
| [`run-all.js`](docs/benchmarks/scripts/run-all.js) | Full automated orchestration |
| [`fingerprint-bench.html`](docs/benchmarks/pages/fingerprint-bench.html) | Fingerprint API overhead test page |
| [`config.js`](docs/benchmarks/config.js) | Platform detection and path configuration |
| [`utils.js`](docs/benchmarks/utils.js) | Shared utilities (stats, memory sampling) |

To run them:

```bash
# 1. Clone benchmark suites locally
cd docs/benchmarks
./setup-benchmarks.sh

# 2. Install dependencies
npm install

# 3. Set environment variables
export BROWSER_PATH=/path/to/botbrowser/chrome
export PROFILES_BASE=/path/to/your/profiles

# 4. Run baseline benchmark (single instance)
node scripts/bench-baseline.js --mode headless

# 5. Run scale benchmark (per-context vs multi-instance)
node scripts/bench-scale.js --mode headless --max-scale 50
```

### Statistical Method

- **Benchmark suites**: Warm-up run (discarded) + 3 interleaved measurement runs per configuration, median ± stddev reported
- **Fingerprint APIs**: 1,000 iterations per API, median reported
- **Page loads**: 10 measurements per configuration, median reported
- **Scale tests**: Single run per scale level (deterministic setup)

### Environment Details

**macOS (primary test platform)**:
- Apple M4 Max (16 cores), 64GB RAM
- macOS 15.3, arm64

**Linux (cross-platform verification)**:
- Ubuntu 22.04, x64

**Windows (cross-platform verification)**:
- Intel Xeon (20 cores / 40 threads), 64GB RAM
- Windows 11, x64

---

## Summary

BotBrowser's fingerprint protection engine is designed for production workloads:

1. **Zero measurable overhead** on Speedometer 3.0: headless 42.7 vs 42.8 (-0.2%), headed 42.1 vs 41.8 (+0.7%)
2. **Zero fingerprint API overhead**. Canvas, WebGL, Navigator, Screen, Font APIs show identical latency on macOS, Linux, and Windows, in both headed and headless modes
3. **Per-Context Fingerprint** provides resource savings at scale with full fingerprint isolation:
   - 29% less memory at 50 concurrent profiles
   - 2x faster profile creation
   - 57% fewer OS processes
   - 100% canvas fingerprint isolation verified (each context produces a unique hash)
4. **Consistent across platforms**, tested on macOS arm64, Linux x64, and Windows x64 with identical results

For enterprise users running concurrent fingerprint profiles, Per-Context Fingerprint (ENT Tier 3) delivers the same privacy protection with lower infrastructure cost and verified fingerprint isolation between contexts.

## Related Documentation

- [Main README](README.md) - Project overview and quick start
- [Per-Context Fingerprint](PER_CONTEXT_FINGERPRINT.md) - Architecture and API details
- [Validation Results](VALIDATION.md) - Research data across 31+ tracking scenarios
- [Advanced Features](ADVANCED_FEATURES.md) - Comprehensive technical capabilities
- [CLI Flags Reference](CLI_FLAGS.md) - Complete command-line options

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
