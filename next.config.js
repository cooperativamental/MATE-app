module.exports = {
  reactStrictMode: true,
  experimental: { nftTracing: true },
  images: {
    domains: ['images.unsplash.com'],
    formats: ["image/webp"],
},
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      loader: '@svgr/webpack',
      options: {
        prettier: false,
        svgoConfig: {
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: { removeViewBox: false },
              },
            },
          ],
        },
        titleProp: true,
      },
    });

    return config;
  }
}
