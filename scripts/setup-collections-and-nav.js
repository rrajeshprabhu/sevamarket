const https = require('https');

const SHOP = 'seva-dev.myshopify.com';
const ACCESS_TOKEN = 'process.env.SHOPIFY_ACCESS_TOKEN';

function shopifyRequest(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SHOP,
            port: 443,
            path: `/admin/api/2024-01${endpoint}`,
            method: method,
            headers: {
                'X-Shopify-Access-Token': ACCESS_TOKEN,
                'Content-Type': 'application/json',
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

// Collections to create - by Product Type and Seller
const collections = [
    // Product Type Collections
    { title: 'Financial Services', type: 'product_type', match: 'Financial Services', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800' },
    { title: 'Education Services', type: 'product_type', match: 'Education Services', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800' },
    { title: 'Garlands & Malas', type: 'product_type', match: 'Garlands & Malas', image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800' },
    { title: 'Books & Media', type: 'product_type', match: 'Books & Media', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800' },
    { title: 'Puja Items', type: 'product_type', match: 'Puja Items', image: 'https://images.unsplash.com/photo-1609941079978-f7f1eb8f6d29?w=800' },
    { title: 'Plants & Garden', type: 'product_type', match: 'Plants & Garden', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800' },
    { title: 'Health & Wellness', type: 'product_type', match: 'Health & Wellness', image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800' },
    { title: 'Catering & Food', type: 'product_type', match: 'Catering', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800' },

    // Seller/Vendor Collections
    { title: 'Artha Financial Wisdom', type: 'vendor', match: 'Artha Financial Wisdom', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800' },
    { title: 'Vidya College Mentors', type: 'vendor', match: 'Vidya College Mentors', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800' },
    { title: 'Vrindavan Garlands', type: 'vendor', match: 'Vrindavan Garlands', image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800' },
    { title: 'Govinda Books', type: 'vendor', match: 'Govinda Books', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800' },
    { title: 'Deity Seva Store', type: 'vendor', match: 'Deity Seva Store', image: 'https://images.unsplash.com/photo-1609941079978-f7f1eb8f6d29?w=800' },
    { title: 'Tulsi Nursery', type: 'vendor', match: 'Tulsi Nursery', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800' },
    { title: 'Ayur Wellness', type: 'vendor', match: 'Ayur Wellness', image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800' },
];

async function createSmartCollection(collection) {
    console.log(`Creating collection: ${collection.title}`);

    // Build the rules based on type
    let rules = [];
    if (collection.type === 'product_type') {
        rules = [{
            column: 'type',
            relation: 'equals',
            condition: collection.match
        }];
    } else if (collection.type === 'vendor') {
        rules = [{
            column: 'vendor',
            relation: 'equals',
            condition: collection.match
        }];
    }

    const collectionData = {
        smart_collection: {
            title: collection.title,
            rules: rules,
            disjunctive: false,
            published: true,
            image: {
                src: collection.image,
                alt: collection.title
            }
        }
    };

    const result = await shopifyRequest('POST', '/smart_collections.json', collectionData);

    if (result.status === 201 || result.status === 200) {
        console.log(`  ✓ Created: ${collection.title} (ID: ${result.data.smart_collection?.id})`);
        return result.data.smart_collection;
    } else if (result.status === 422 && result.data.errors?.title) {
        console.log(`  - Already exists: ${collection.title}`);
        return null;
    } else {
        console.log(`  ✗ Failed: ${result.status} - ${JSON.stringify(result.data).substring(0, 100)}`);
        return null;
    }
}

async function getMainMenu() {
    // Get all menus
    const result = await shopifyRequest('GET', '/menus.json');
    if (result.status === 200) {
        return result.data.menus || [];
    }
    return [];
}

async function main() {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║  Setting Up Collections & Navigation               ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    // First, get existing collections to avoid duplicates
    console.log('Checking existing collections...');
    const existingResult = await shopifyRequest('GET', '/smart_collections.json?limit=250');
    const existingCollections = existingResult.data.smart_collections || [];
    console.log(`Found ${existingCollections.length} existing smart collections\n`);

    const existingTitles = existingCollections.map(c => c.title.toLowerCase());

    // Create collections
    console.log('=== Creating Smart Collections ===\n');

    let created = 0;
    for (const collection of collections) {
        if (existingTitles.includes(collection.title.toLowerCase())) {
            console.log(`  - Skipping (exists): ${collection.title}`);
            continue;
        }

        const result = await createSmartCollection(collection);
        if (result) created++;
        await new Promise(r => setTimeout(r, 500));
    }

    console.log(`\n=== Created ${created} new collections ===\n`);

    // List all collections for reference
    console.log('=== All Smart Collections ===\n');
    const allCollections = await shopifyRequest('GET', '/smart_collections.json?limit=250');
    for (const col of (allCollections.data.smart_collections || [])) {
        console.log(`  - ${col.title}: /collections/${col.handle}`);
    }

    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║  Next Steps: Add to Navigation Menu                ║');
    console.log('╠════════════════════════════════════════════════════╣');
    console.log('║  1. Go to Shopify Admin → Online Store → Navigation║');
    console.log('║  2. Edit the Main Menu                             ║');
    console.log('║  3. Add menu items for:                            ║');
    console.log('║     - "Shop by Category" (dropdown with types)     ║');
    console.log('║     - "Shop by Seller" (dropdown with sellers)     ║');
    console.log('║     - "Sellers" → /apps/marketplace/sellerlist     ║');
    console.log('╚════════════════════════════════════════════════════╝');
}

main().catch(console.error);
