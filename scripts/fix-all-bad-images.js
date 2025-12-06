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

async function deleteProductImages(productId) {
    const result = await shopifyRequest('GET', `/products/${productId}/images.json`);
    const images = result.data.images || [];
    for (const img of images) {
        await shopifyRequest('DELETE', `/products/${productId}/images/${img.id}.json`);
    }
}

async function addProductImage(productId, imageUrl, altText) {
    return await shopifyRequest('POST', `/products/${productId}/images.json`, {
        image: {
            src: imageUrl,
            alt: altText
        }
    });
}

async function main() {
    console.log('=== FIXING ALL PROBLEMATIC IMAGES ===\n');

    // Images to fix - carefully selected pure vegetarian/appropriate images
    const fixes = [
        // CATERING - Replace with pure vegetarian Indian feast images
        {
            id: 9276396470497,
            title: 'Birthday Party Catering',
            // Pure vegetarian Indian sweets and snacks spread
            newImage: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800',
            alt: 'Vegetarian Birthday Celebration Spread'
        },
        {
            id: 9276397191393,
            title: 'Wedding Catering Consultation',
            // Indian wedding feast - vegetarian
            newImage: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800',
            alt: 'Indian Wedding Feast'
        },
        {
            id: 9282238906593,
            title: 'Sunday Feast Catering',
            // Indian thali - pure vegetarian
            newImage: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800',
            alt: 'Vegetarian Indian Thali'
        },
        {
            id: 9276396110049,
            title: 'Temple Feast Catering',
            // Temple prasadam style
            newImage: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800',
            alt: 'Temple Prasadam Feast'
        },

        // BOOKS - Replace with proper spiritual book images
        {
            id: 9282274328801,
            title: 'Bhagavad Gita As It Is (Hardcover)',
            // Orange/saffron colored book or scripture
            newImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800',
            alt: 'Bhagavad Gita Scripture'
        },
        {
            id: 9282264498401,
            title: 'Bhagavad Gita As It Is - Hardcover',
            // Ancient scripture style
            newImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800',
            alt: 'Bhagavad Gita Sacred Text'
        },
        {
            id: 9282264531169,
            title: 'Srimad Bhagavatam - Complete Set',
            // Stack of spiritual books
            newImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
            alt: 'Srimad Bhagavatam Book Set'
        },

        // PIZZA - Replace with clearly vegetarian pizza (no visible onions)
        {
            id: 9276389621985,
            title: 'Paneer Tikka Pizza',
            // Cheese pizza without onions
            newImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
            alt: 'Paneer Tikka Pizza'
        },
        {
            id: 9282247033057,
            title: 'Paneer Tikka Pizza (duplicate)',
            newImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
            alt: 'Paneer Tikka Pizza'
        },
        {
            id: 9276389261537,
            title: 'Veggie Supreme Pizza',
            // Vegetable pizza - bell peppers, tomatoes, no onions visible
            newImage: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
            alt: 'Veggie Supreme Pizza'
        },
        {
            id: 9282247622881,
            title: 'Veggie Supreme Pizza (duplicate)',
            newImage: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
            alt: 'Veggie Supreme Pizza'
        },
        {
            id: 9276388573409,
            title: 'Margherita Pizza',
            // Classic margherita - tomato, basil, cheese only
            newImage: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800',
            alt: 'Margherita Pizza'
        },
        {
            id: 9282238578913,
            title: 'Cheese Burst Pizza',
            // Cheese pizza closeup
            newImage: 'https://images.unsplash.com/photo-1571066811602-716837d681de?w=800',
            alt: 'Cheese Burst Pizza'
        },
        {
            id: 9282238644449,
            title: 'Pesto Paneer Pizza',
            // Green pesto pizza
            newImage: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800',
            alt: 'Pesto Paneer Pizza'
        },

        // CHYAWANPRASH - fix image
        {
            id: 9282264924385,
            title: 'Chyawanprash Traditional Recipe',
            // Ayurvedic jar
            newImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800',
            alt: 'Chyawanprash Traditional Ayurvedic'
        }
    ];

    let fixed = 0;
    let failed = 0;

    for (const fix of fixes) {
        console.log(`\nFixing: ${fix.title} (ID: ${fix.id})`);

        try {
            // Delete existing images
            await deleteProductImages(fix.id);
            console.log('  - Deleted old images');

            // Add new image
            const result = await addProductImage(fix.id, fix.newImage, fix.alt);

            if (result.status === 200 || result.status === 201) {
                console.log('  ✓ New image added');
                fixed++;
            } else {
                console.log(`  ✗ Failed: ${result.status}`);
                failed++;
            }
        } catch (err) {
            console.log(`  ✗ Error: ${err.message}`);
            failed++;
        }

        // Rate limiting
        await new Promise(r => setTimeout(r, 500));
    }

    // Delete the test snowboard product
    console.log('\n=== Deleting Test Product ===\n');
    const deleteResult = await shopifyRequest('DELETE', '/products/9274761347297.json');
    if (deleteResult.status === 200) {
        console.log('✓ Deleted: The Inventory Not Tracked Snowboard');
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Fixed: ${fixed} products`);
    console.log(`Failed: ${failed} products`);
}

main().catch(console.error);
