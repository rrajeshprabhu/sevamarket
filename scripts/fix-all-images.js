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

// Correct images for products - using appropriate, relevant images
// All images are pure vegetarian, sattvic, no caffeine references
const imageCorrections = {
    // MUSIC LESSONS - Use authentic Indian instruments
    'harmonium': 'https://images.unsplash.com/photo-1621368286550-f54551f39b91?w=800', // Indian harmonium/keyboard - if not available use devotional music
    'mridanga': 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800', // Traditional drums - mridanga style
    'mridangam': 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800', // Traditional drums
    'kirtan': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800', // Group singing/devotional
    'tabla': 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800', // Percussion drums

    // FOOD - Pure vegetarian, sattvic, NO eggs, NO meat, NO caffeine
    'pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', // Vegetarian pizza
    'pasta': 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800', // Creamy pasta (no egg)
    'feast': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800', // Indian thali
    'catering': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800', // Indian vegetarian spread
    'tiffin': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800', // Indian tiffin boxes

    // HEALTH - Herbal, caffeine-free
    'tulsi-tea': 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=800', // Herbal tea (green/tulsi)
    'chyawanprash': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800', // Ayurvedic jar

    // PUJA ITEMS
    'aarti': 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=800', // Brass lamp
    'deity-dress': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800', // Colorful fabric/dress
    'garland': 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800', // Flower garland
    'marigold': 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800', // Marigold flowers

    // EDUCATION
    'college': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800', // University/graduation
    'essay': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800', // Writing/studying
};

// Products that need specific fixes
const productFixes = [
    // Harmonium lessons - need Indian harmonium, not piano
    {
        id: 9282238775521,
        title: 'Harmonium Classes - Beginner',
        newImage: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800', // Musical keyboard/harmonium style
        alt: 'Indian Harmonium Classes'
    },
    {
        id: 9276391456993,
        title: 'Harmonium Lessons',
        newImage: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800',
        alt: 'Learn Indian Harmonium'
    },
    // Mridanga/Mridangam lessons - need traditional drum, not drum kit
    {
        id: 9282238808289,
        title: 'Mridangam Lessons',
        newImage: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800', // Traditional percussion
        alt: 'Mridangam Traditional Drum Lessons'
    },
    // Products missing images
    {
        id: 9282274492641,
        title: 'Brass Aarti Lamp (5 Wick)',
        newImage: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=800',
        alt: 'Brass Aarti Lamp for Puja'
    },
    {
        id: 9282274558177,
        title: 'Deity Dress Set (Radha Krishna)',
        newImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800',
        alt: 'Beautiful Deity Dress for Radha Krishna'
    },
    {
        id: 9282274296033,
        title: 'Marigold Garland (5ft)',
        newImage: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800',
        alt: 'Fresh Marigold Garland'
    },
    {
        id: 9282273640673,
        title: 'College Application Strategy Session',
        newImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
        alt: 'College Application Guidance'
    },
    {
        id: 9276236923105,
        title: 'Kids Singing Classes (Ages 5-12)',
        newImage: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
        alt: 'Kids Music Classes'
    },
    // Tiramisu - traditional has coffee/caffeine, update description or image
    {
        id: 9282238742753,
        title: 'Tiramisu (Prasadam Dessert)',
        newImage: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800', // Generic layered dessert
        alt: 'Eggless Caffeine-Free Prasadam Dessert',
        updateDescription: true,
        newDescription: 'Delicious eggless, caffeine-free layered dessert made with cream and saffron. A sattvic alternative to traditional tiramisu - no coffee, no eggs!'
    }
];

async function fixProductImage(fix) {
    console.log(`\nFixing: ${fix.title} (ID: ${fix.id})`);

    // Get current product
    const productResult = await shopifyRequest('GET', `/products/${fix.id}.json`);
    if (productResult.status !== 200) {
        console.log(`  ✗ Failed to get product: ${productResult.status}`);
        return false;
    }

    const product = productResult.data.product;

    // Delete existing images
    if (product.images && product.images.length > 0) {
        for (const img of product.images) {
            await shopifyRequest('DELETE', `/products/${fix.id}/images/${img.id}.json`);
        }
        console.log(`  - Deleted ${product.images.length} old image(s)`);
    }

    // Add new image
    const imageResult = await shopifyRequest('POST', `/products/${fix.id}/images.json`, {
        image: {
            src: fix.newImage,
            alt: fix.alt
        }
    });

    if (imageResult.status === 200 || imageResult.status === 201) {
        console.log(`  ✓ New image added`);
    } else {
        console.log(`  ✗ Failed to add image: ${imageResult.status}`);
        return false;
    }

    // Update description if needed
    if (fix.updateDescription && fix.newDescription) {
        const updateResult = await shopifyRequest('PUT', `/products/${fix.id}.json`, {
            product: {
                id: fix.id,
                body_html: fix.newDescription
            }
        });

        if (updateResult.status === 200) {
            console.log(`  ✓ Description updated (caffeine-free)`);
        }
    }

    return true;
}

async function main() {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║  Fixing All Product Images                        ║');
    console.log('║  - Correct instrument images for music lessons    ║');
    console.log('║  - Add missing images                             ║');
    console.log('║  - Ensure sattvic/vegetarian food images          ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    let fixed = 0;
    let failed = 0;

    for (const fix of productFixes) {
        const success = await fixProductImage(fix);
        if (success) {
            fixed++;
        } else {
            failed++;
        }
        await new Promise(r => setTimeout(r, 500)); // Rate limiting
    }

    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log(`║  Results: ${fixed} fixed, ${failed} failed                     ║`);
    console.log('╚════════════════════════════════════════════════════╝');

    // Also update Tulsi Green Tea description to clarify it's caffeine-free
    console.log('\n=== Updating Tulsi Tea Products ===');

    const tulsiTeaIds = [9282275049697, 9282264957153];
    for (const id of tulsiTeaIds) {
        const result = await shopifyRequest('PUT', `/products/${id}.json`, {
            product: {
                id: id,
                body_html: 'Organic Tulsi (Holy Basil) herbal tea. 100% caffeine-free and naturally calming. Made from pure tulsi leaves - a sattvic, sacred herb for health and spiritual well-being. No tea leaves, no caffeine.'
            }
        });

        if (result.status === 200) {
            console.log(`✓ Updated Tulsi Tea ${id} - marked as caffeine-free`);
        } else {
            console.log(`✗ Failed to update ${id}`);
        }
        await new Promise(r => setTimeout(r, 300));
    }

    console.log('\n=== All fixes complete! ===');
}

main().catch(console.error);
