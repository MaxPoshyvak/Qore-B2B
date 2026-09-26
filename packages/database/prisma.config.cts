// packages/database/prisma.config.cts
import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';
import { resolve } from 'node:path';

// Prisma 7 does not auto-load `.env` when a custom config file is present
// (legacy auto-loading only applies to the schema's `env()`). Load it here, and
// fall back to `process.env` directly so resolution never depends on import order.
config({ path: resolve(__dirname, '.env') });

const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

export default defineConfig({
    datasource: {
        url: directUrl,
    },
});
