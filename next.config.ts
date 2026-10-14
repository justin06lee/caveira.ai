import type { NextConfig } from 'next';

const config: NextConfig = {
  poweredByHeader: false,
  images: { qualities: [80] },
  // The downloads live with the releases that make them, in the caveira
  // repo: curl -fsSL https://caveira.ai/install.sh | sh for the terminal,
  // and the app's disk image, which the browser downloads straight away.
  redirects: async () => [
    {
      source: '/install.sh',
      destination: 'https://raw.githubusercontent.com/justin06lee/caveira/master/install.sh',
      permanent: false,
    },
    {
      source: '/download/macos',
      destination: 'https://github.com/justin06lee/caveira/releases/latest/download/caveira.dmg',
      permanent: false,
    },
  ],
};

export default config;
