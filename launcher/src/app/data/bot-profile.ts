export type BotProfileBasicInfo = {
    version: string;
    userAgent: string;
    unmaskedVendor: string;
    unmaskedRenderer: string;
};

export function tryParseBotProfile(data: string): BotProfileBasicInfo | null {
    try {
        const info = JSON.parse(data);

        if (info.version && info.userAgent && info.unmaskedVendor && info.unmaskedRenderer) {
            return info;
        }

        return null;
    } catch {
        return null;
    }
}

export function extractMajorVersion(versionOrUserAgent: string): number | null {
    // Try to match Chrome/Chromium version pattern: Chrome/144.0.7559.97
    const chromeMatch = versionOrUserAgent.match(/Chrom(?:e|ium)\/(\d+)/);
    if (chromeMatch && chromeMatch[1]) {
        return parseInt(chromeMatch[1], 10);
    }

    // Try to match version string like "144.0.7559.97"
    const versionMatch = versionOrUserAgent.match(/^(\d+)\./);
    if (versionMatch && versionMatch[1]) {
        return parseInt(versionMatch[1], 10);
    }

    return null;
}
