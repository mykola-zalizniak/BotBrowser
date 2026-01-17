# BotBrowser Build Guide

Build BotBrowser from Chromium source on Ubuntu.

---

## Requirements

**System:**
- Ubuntu 22.04 LTS
- Fast machine with 32+ GB RAM
- 100+ GB free disk space

**Dependencies:**

```bash
apt install -y fonts-liberation devscripts equivs software-properties-common \
  libmpfr-dev libgmp3-dev libmpc-dev libstdc++-12-dev clang avahi-daemon \
  libavahi-client-dev libnss-mdns qtbase5-dev libqt5widgets5 libx11-xcb-dev
```

---

## Build Steps

### 1. Check System Requirements

See [Chromium System Requirements](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/build_instructions.md#system-requirements)

### 2. Install depot_tools

See [Install depot_tools](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/build_instructions.md#install)

**ARM builds:**

```bash
./build/linux/sysroot_scripts/install-sysroot.py --arch=arm
```

See [Linux Chromium ARM Recipes](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/chromium_arm.md#installing-the-toolchain)

### 3. Get the Code

See [Get the Code](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/build_instructions.md#get-the-code)

### 4. Run the Hooks

See [Run the Hooks](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/build_instructions.md#run-the-hooks)

### 5. Configure the Build

See [Setting up the Build](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/build_instructions.md#setting-up-the-build)

Then replace `src/out/Default/args.gn` with BotBrowser config:

```bash
cp build/debian/args.gn src/out/Default/args.gn
```

[args.gn](debian/args.gn) has BotBrowser build flags. Edit as needed. See [GN Build Configuration](https://www.chromium.org/developers/gn-build-configuration/) for details.

### 6. Build

See [Build Chromium](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/build_instructions.md#build-chromium)

Want faster builds? See [Faster Builds](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/build_instructions.md#faster-builds)

### 7. Find the Binary

Output binary: `src/out/Default/chrome`

---

## Links

- [Chromium Linux Build Instructions](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/build_instructions.md)
- [GN Build Configuration](https://www.chromium.org/developers/gn-build-configuration/)
- [Linux Chromium ARM Recipes](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/chromium_arm.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
