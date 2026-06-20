/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'crests.football-data.org' },
      { protocol: 'https', hostname: '**.football-data.org' },
    ],
  },
};
export default nextConfig;
