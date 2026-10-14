import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [new URL('https://res.cloudinary.com/dhgika05/**')],
    },
    async redirects() {
        return [
            {
                source: '/registration',
                destination: '/register',
                permanent: true,
            },
        ];
    },
};

export default withNextIntl(nextConfig);

