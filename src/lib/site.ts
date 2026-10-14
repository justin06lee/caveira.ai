// Links the pages share.
export const REPO = 'https://github.com/justin06lee/caveira';
// The app's disk image; next.config.ts redirects it to the latest release.
export const DOWNLOAD_MAC = '/download/macos';
// Served by a redirect in next.config.ts to install.sh in the caveira repo.
export const INSTALL = 'curl -fsSL https://caveira.ai/install.sh | sh';
export const EXTERNAL = { target: '_blank', rel: 'noreferrer' } as const;

export const COLUMN = 'mx-auto w-full max-w-[1080px] px-5 sm:px-8';
