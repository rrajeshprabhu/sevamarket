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

async function main() {
    console.log('=== Adding Images to Webkul-Created Products ===\n');

    // First, get all products to find the Webkul-created ones
    const productsResponse = await shopifyRequest('GET', '/products.json?limit=250');
    const products = productsResponse.data.products || [];

    console.log(`Found ${products.length} total products\n`);

    // Pure vegetarian images - NO eggs, NO meat
    const productImages = {
        'veggie-supreme-pizza-prasadam': 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=800',
        'hing-breadsticks-prasadam': 'https://images.unsplash.com/photo-1619531040576-f9416740661b?w=800',
        'paneer-tikka-pizza-prasadam': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
        'margherita-pizza-prasadam': 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800'
    };

    // Also match by title keywords for Prabhu Pizza products
    const titleMatches = {
        'Veggie Supreme Pizza': 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=800',
        'Hing Breadsticks': 'https://images.unsplash.com/photo-1619531040576-f9416740661b?w=800',
        'Paneer Tikka Pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
        'Margherita Pizza': 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800'
    };

    let updated = 0;

    for (const product of products) {
        let imageUrl = productImages[product.handle];

        // If not found by handle, try title match
        if (!imageUrl) {
            for (const [titleKey, url] of Object.entries(titleMatches)) {
                if (product.title.includes(titleKey) && product.vendor === 'Prabhu Pizza') {
                    imageUrl = url;
                    break;
                }
            }
        }

        if (imageUrl) {
            console.log(`Adding image to: ${product.title} (ID: ${product.id}, Handle: ${product.handle})`);

            // Delete existing images if any
            if (product.images && product.images.length > 0) {
                for (const img of product.images) {
                    await shopifyRequest('DELETE', `/products/${product.id}/images/${img.id}.json`);
                }
                console.log(`  - Deleted ${product.images.length} old image(s)`);
            }

            // Add new image
            const result = await shopifyRequest('POST', `/products/${product.id}/images.json`, {
                image: {
                    src: imageUrl,
                    alt: product.title + " - Pure Vegetarian Prasadam"
                }
            });

            if (result.status === 200 || result.status === 201) {
                console.log(`  ✓ Image added successfully`);
                updated++;
            } else {
                console.log(`  ✗ Failed: ${result.status}`);
            }

            await new Promise(r => setTimeout(r, 500));
        }
    }

    console.log(`\n=== Added images to ${updated} products ===`);
}

main().catch(console.error);
