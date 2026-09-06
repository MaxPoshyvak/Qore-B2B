/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [new URL('https://res.cloudinary.com/dhgika05/**')],
    },
};

export default nextConfig;
