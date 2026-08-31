/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            new URL('https://images.immediate.co.uk/production/volatile/sites/30/2020/08/flat-white-3402c4f.jpg'),
        ],
    },
};

export default nextConfig;
