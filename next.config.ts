/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "dustsweepertool.com",
          },
        ],
        destination: "https://dustsweepertool.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.dustsweepertool.com",
          },
        ],
        destination: "https://dustsweepertool.com/:path*",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;