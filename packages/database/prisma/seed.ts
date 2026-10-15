import { PrismaClient, SubscriptionPlan } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import { resolve } from 'node:path';

// Load environment variables
config({ path: resolve(__dirname, '../.env') });
config({ path: resolve(__dirname, '../../../.env') });

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/qore_db';
const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
});

async function main() {
    console.log('🌱 Starting database seed for Demo Restaurant...');

    // 1. Upsert Demo Owner User
    const demoUser = await prisma.user.upsert({
        where: { email: 'demo@useqore.app' },
        update: {
            name: 'Demo General Manager',
            isEmailVerified: true,
        },
        create: {
            email: 'demo@useqore.app',
            name: 'Demo General Manager',
            isEmailVerified: true,
        },
    });

    console.log(`👤 Demo User ready: ${demoUser.email} (${demoUser.id})`);

    // 2. Upsert Demo Tenant
    const demoTenant = await prisma.tenant.upsert({
        where: { slug: 'demo' },
        update: {
            name: 'Qore Bistro & Bar',
            subscriptionPlan: SubscriptionPlan.pro,
            ownerId: demoUser.id,
        },
        create: {
            name: 'Qore Bistro & Bar',
            slug: 'demo',
            subscriptionPlan: SubscriptionPlan.pro,
            ownerId: demoUser.id,
        },
    });

    console.log(`🏢 Demo Tenant ready: ${demoTenant.name} (slug: ${demoTenant.slug})`);

    // 3. Upsert Tenant Settings
    const workingHours = {
        monday: { open: '08:00', close: '23:00', isOpen: true },
        tuesday: { open: '08:00', close: '23:00', isOpen: true },
        wednesday: { open: '08:00', close: '23:00', isOpen: true },
        thursday: { open: '08:00', close: '23:00', isOpen: true },
        friday: { open: '08:00', close: '00:00', isOpen: true },
        saturday: { open: '09:00', close: '00:00', isOpen: true },
        sunday: { open: '09:00', close: '22:00', isOpen: true },
    };

    await prisma.tenantSettings.upsert({
        where: { tenantId: demoTenant.id },
        update: {
            description:
                'Modern European bistro & specialty coffee bar. Artisanal breakfast, prime cuts, natural wines & signature cocktails.',
            currency: 'USD',
            address: '742 Evergreen Terrace, Culinary District',
            phone: '+1 (555) 234-5678',
            logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80',
            coverUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&auto=format&fit=crop&q=80',
            wifiSsid: 'QoreBistro_Guest',
            wifiPassword: 'delicious2026',
            kdsToken: 'demo-kitchen-token',
            kdsPin: '1234',
            workingHours,
        },
        create: {
            tenantId: demoTenant.id,
            description:
                'Modern European bistro & specialty coffee bar. Artisanal breakfast, prime cuts, natural wines & signature cocktails.',
            currency: 'USD',
            address: '742 Evergreen Terrace, Culinary District',
            phone: '+1 (555) 234-5678',
            logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80',
            coverUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&auto=format&fit=crop&q=80',
            wifiSsid: 'QoreBistro_Guest',
            wifiPassword: 'delicious2026',
            kdsToken: 'demo-kitchen-token',
            kdsPin: '1234',
            workingHours,
        },
    });

    // 4. Tables setup (6 tables)
    const tablesData = [
        { name: '1', capacity: 2 },
        { name: '2', capacity: 4 },
        { name: '3', capacity: 4 },
        { name: '4', capacity: 6 },
        { name: '5', capacity: 2 },
        { name: 'Bar 1', capacity: 1 },
    ];

    for (const t of tablesData) {
        const existingTable = await prisma.table.findFirst({
            where: { tenantId: demoTenant.id, name: t.name },
        });

        if (!existingTable) {
            await prisma.table.create({
                data: {
                    tenantId: demoTenant.id,
                    name: t.name,
                    capacity: t.capacity,
                },
            });
        }
    }

    console.log('🪑 Demo Tables ready.');

    // 5. Clean and recreate Menu Categories & Items to guarantee pristine demo data
    const existingCategories = await prisma.menuCategory.findMany({
        where: { tenantId: demoTenant.id },
        select: { id: true },
    });

    if (existingCategories.length > 0) {
        await prisma.menuCategory.deleteMany({
            where: { tenantId: demoTenant.id },
        });
    }

    // Category 1: Breakfast & Bakery
    const catBreakfast = await prisma.menuCategory.create({
        data: {
            tenantId: demoTenant.id,
            name: 'Breakfast & Bakery',
            sortOrder: 1,
            icon: 'Croissant',
        },
    });

    // Category 2: Mains & Grill
    const catMains = await prisma.menuCategory.create({
        data: {
            tenantId: demoTenant.id,
            name: 'Mains & Grill',
            sortOrder: 2,
            icon: 'Utensils',
        },
    });

    // Category 3: Specialty Coffee & Drinks
    const catDrinks = await prisma.menuCategory.create({
        data: {
            tenantId: demoTenant.id,
            name: 'Specialty Drinks',
            sortOrder: 3,
            icon: 'Coffee',
        },
    });

    // Category 4: Desserts
    const catDesserts = await prisma.menuCategory.create({
        data: {
            tenantId: demoTenant.id,
            name: 'Desserts',
            sortOrder: 4,
            icon: 'Cake',
        },
    });

    console.log('📂 Menu Categories created.');

    // Items for Breakfast
    await prisma.menuItem.create({
        data: {
            tenantId: demoTenant.id,
            categoryId: catBreakfast.id,
            name: 'Avocado & Poached Egg Sourdough',
            description:
                'Toasted country sourdough, smashed Haas avocado, organic poached egg, Aleppo chili flakes, microgreens & lime oil.',
            price: 14.5,
            imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80',
            tags: ['vegetarian', 'popular'],
            sortOrder: 1,
        },
    });

    await prisma.menuItem.create({
        data: {
            tenantId: demoTenant.id,
            categoryId: catBreakfast.id,
            name: 'Truffle & Gruyère Scramble Croissant',
            description:
                'Warm artisanal French butter croissant stuffed with black truffle scramble, aged gruyère, and garden chives.',
            price: 12.0,
            imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80',
            tags: ['chef_choice'],
            sortOrder: 2,
        },
    });

    await prisma.menuItem.create({
        data: {
            tenantId: demoTenant.id,
            categoryId: catBreakfast.id,
            name: 'Wild Blueberry Acai Bowl',
            description:
                'Organic Amazonian acai, house buckwheat granola, organic blueberries, chia pudding, raw almond butter.',
            price: 13.0,
            imageUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=800&auto=format&fit=crop&q=80',
            tags: ['vegan'],
            sortOrder: 3,
        },
    });

    // Items for Mains & Grill (with modifier options!)
    const burger = await prisma.menuItem.create({
        data: {
            tenantId: demoTenant.id,
            categoryId: catMains.id,
            name: 'Signature Wagyu Smash Burger',
            description:
                'Double dry-aged Wagyu patties, caramelized shallot jam, smoked Irish cheddar, truffle aioli on toasted brioche. Served with rosemary fries.',
            price: 19.5,
            imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
            tags: ['popular'],
            sortOrder: 1,
        },
    });

    // Add modifier group for Burger
    await prisma.modifierGroup.create({
        data: {
            menuItemId: burger.id,
            name: 'Customize Burger',
            minSelections: 0,
            maxSelections: 3,
            options: {
                create: [
                    { name: 'Crispy Smoked Bacon', priceAdjustment: 2.5, sortOrder: 1 },
                    { name: 'Truffle Parmesan Fries Upgrade', priceAdjustment: 3.0, sortOrder: 2 },
                    { name: 'Extra Aged Cheddar Slice', priceAdjustment: 1.5, sortOrder: 3 },
                ],
            },
        },
    });

    await prisma.menuItem.create({
        data: {
            tenantId: demoTenant.id,
            categoryId: catMains.id,
            name: 'Crispy Atlantic Salmon Fillet',
            description:
                'Pan-crisped wild Atlantic salmon, braised saffron leeks, buttered asparagus, delicate champagne emulsion.',
            price: 26.0,
            imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&auto=format&fit=crop&q=80',
            tags: ['chef_choice'],
            sortOrder: 2,
        },
    });

    await prisma.menuItem.create({
        data: {
            tenantId: demoTenant.id,
            categoryId: catMains.id,
            name: 'Wild Forest Mushroom Tagliatelle',
            description:
                'Handmade egg pasta, roasted chanterelles & king oysters, white truffle emulsion, 24-month Parmigiano Reggiano.',
            price: 21.0,
            imageUrl: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=800&auto=format&fit=crop&q=80',
            tags: ['vegetarian'],
            sortOrder: 3,
        },
    });

    // Items for Specialty Coffee & Drinks
    const flatWhite = await prisma.menuItem.create({
        data: {
            tenantId: demoTenant.id,
            categoryId: catDrinks.id,
            name: 'Flat White (Single Origin Ethiopia)',
            description:
                'Double espresso of washed Yirgacheffe with floral jasmine and bergamot notes, velvety microfoamed milk.',
            price: 5.0,
            imageUrl: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=800&auto=format&fit=crop&q=80',
            tags: ['popular'],
            sortOrder: 1,
        },
    });

    // Add milk choice modifier
    await prisma.modifierGroup.create({
        data: {
            menuItemId: flatWhite.id,
            name: 'Milk Choice',
            minSelections: 1,
            maxSelections: 1,
            options: {
                create: [
                    { name: 'Organic Whole Milk', priceAdjustment: 0.0, sortOrder: 1 },
                    { name: 'Oatly Barista Oat Milk', priceAdjustment: 0.75, sortOrder: 2 },
                    { name: 'House Almond Milk', priceAdjustment: 0.75, sortOrder: 3 },
                ],
            },
        },
    });

    await prisma.menuItem.create({
        data: {
            tenantId: demoTenant.id,
            categoryId: catDrinks.id,
            name: 'Yuzu Citrus Sparkling Cold Brew',
            description:
                '18-hour slow-drip Colombian cold brew, Japanese yuzu citrus reduction, sparkling tonic water, rosemary sprig.',
            price: 6.5,
            imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&auto=format&fit=crop&q=80',
            tags: ['vegan'],
            sortOrder: 2,
        },
    });

    await prisma.menuItem.create({
        data: {
            tenantId: demoTenant.id,
            categoryId: catDrinks.id,
            name: 'Ceremonial Matcha Lavender Latte',
            description:
                'First-harvest Uji ceremonial green tea matcha, organic French lavender blossom syrup, steamed barista oat milk.',
            price: 6.5,
            imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=800&auto=format&fit=crop&q=80',
            tags: ['vegan'],
            sortOrder: 3,
        },
    });

    // Items for Desserts
    await prisma.menuItem.create({
        data: {
            tenantId: demoTenant.id,
            categoryId: catDesserts.id,
            name: 'San Sebastián Burnt Cheesecake',
            description:
                'Creamy caramelized Spanish cheesecake with molten center, accompanied by wild blackberry coulis.',
            price: 9.5,
            imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&auto=format&fit=crop&q=80',
            tags: ['popular'],
            sortOrder: 1,
        },
    });

    await prisma.menuItem.create({
        data: {
            tenantId: demoTenant.id,
            categoryId: catDesserts.id,
            name: 'Warm Valrhona Chocolate Fondant',
            description:
                '70% French dark chocolate molten cake, roasted Sicilian pistachio crumble, Tahitian vanilla bean gelato.',
            price: 11.0,
            imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80',
            tags: ['chef_choice'],
            sortOrder: 2,
        },
    });

    console.log('🍽️ All Menu Items and Modifiers seeded successfully!');

    console.log('✅ Demo Restaurant setup complete!');
    console.log('👉 Public URL: /demo/menu');
    console.log('👉 Kitchen Display URL: /kds/demo-kitchen-token (PIN: 1234)');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding demo restaurant:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
