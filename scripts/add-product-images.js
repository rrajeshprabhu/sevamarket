const https = require('https');

// Shopify API Configuration
const SHOP = 'seva-dev.myshopify.com';
const ACCESS_TOKEN = 'process.env.SHOPIFY_ACCESS_TOKEN';

// Helper function to make API requests
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
                    const parsed = JSON.parse(body);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// Image URLs from Unsplash (free to use)
const productImages = {
    // Pizza products
    'margherita-pizza': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
    'veggie-supreme-pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    'paneer-tikka-pizza': 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800',
    'garlic-breadsticks': 'https://images.unsplash.com/photo-1619531040576-f9416740661b?w=800',

    // Music classes
    'carnatic-vocal-classes-beginner': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    'carnatic-singing-classes-beginner': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
    'devotional-bhajan-classes': 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800',
    'devotional-bhajan-singing-classes': 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800',
    'harmonium-lessons': 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800',
    'kids-music-program-ages-5-12': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
    'kids-singing-classes-ages-5-12': 'https://images.unsplash.com/photo-1485278537138-4e8e1e05b66a?w=800',

    // Real Estate
    'home-buying-consultation': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
    'home-selling-package': 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800',
    'rental-property-search': 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    'property-investment-consultation': 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800',

    // Yoga & Wellness
    'hatha-yoga-classes': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    'meditation-pranayama-workshop': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
    'yoga-teacher-training-200-hour': 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800',
    'ayurvedic-wellness-consultation': 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800',

    // Catering
    'temple-feast-catering-package': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
    'birthday-party-catering': 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
    'weekly-tiffin-service': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
    'wedding-catering-consultation': 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
};

async function main() {
    console.log('=== Adding Images to Products ===\n');

    // Get all products
    const productsResponse = await shopifyRequest('GET', '/products.json?limit=250');
    const products = productsResponse.data.products || [];

    console.log(`Found ${products.length} products\n`);

    let updated = 0;
    let skipped = 0;

    for (const product of products) {
        const handle = product.handle;
        const imageUrl = productImages[handle];

        if (imageUrl) {
            // Check if product already has an image
            if (product.images && product.images.length > 0) {
                console.log(`⏭ ${product.title} - already has image`);
                skipped++;
                continue;
            }

            console.log(`📷 Adding image to: ${product.title}`);

            const result = await shopifyRequest('POST', `/products/${product.id}/images.json`, {
                image: {
                    src: imageUrl,
                    alt: product.title
                }
            });

            if (result.status === 200 || result.status === 201) {
                console.log(`   ✓ Image added successfully`);
                updated++;
            } else {
                console.log(`   ✗ Failed: ${result.status}`);
            }

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    console.log('\n=== Summary ===');
    console.log(`Images added: ${updated}`);
    console.log(`Skipped (already had images): ${skipped}`);
    console.log(`Products without matching images: ${products.length - updated - skipped}`);
}

main().catch(console.error);
