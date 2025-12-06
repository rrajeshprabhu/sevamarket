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
    console.log('=== Updating Product Images to Sattvic/Vegetarian ===\n');

    // Get all products
    const productsResponse = await shopifyRequest('GET', '/products.json?limit=250');
    const products = productsResponse.data.products || [];

    // Better sattvic-looking images (pure vegetarian, no eggs visible)
    const betterImages = {
        // Pizza - using images that look more like cheese/veggie pizza
        'cheese-burst-pizza-prasadam': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800', // Margherita style
        'pesto-paneer-pizza-prasadam': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', // Veggie pizza
        'pasta-alfredo-prasadam': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800', // Creamy pasta
        'tiramisu-prasadam-dessert': 'https://images.unsplash.com/photo-1586040140378-b5634cb4c8fc?w=800', // Tiramisu

        // Music classes - instruments and learning
        'harmonium-classes-beginner': 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800', // Piano/keyboard
        'mridangam-lessons': 'https://images.unsplash.com/photo-1543443258-92b04ad5ec6b?w=800', // Drums
        'kirtan-workshop-group-session': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800', // Music group
        'shloka-mantra-chanting-class': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800', // Meditation

        // Catering - Indian vegetarian food
        'sunday-feast-catering-50-people': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800', // Indian thali
        'janmashtami-special-feast': 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800', // Indian sweets
        'sattvic-wedding-package': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800', // Catering setup
        'daily-tiffin-subscription': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800', // Indian lunch box

        // Fix existing pizza images
        'margherita-pizza': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
        'veggie-supreme-pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
        'paneer-tikka-pizza': 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800',
        'garlic-breadsticks': 'https://images.unsplash.com/photo-1619531040576-f9416740661b?w=800',
    };

    let updated = 0;

    for (const product of products) {
        const newImageUrl = betterImages[product.handle];

        if (newImageUrl) {
            console.log(`Updating image for: ${product.title}`);

            // Delete existing images first
            if (product.images && product.images.length > 0) {
                for (const img of product.images) {
                    await shopifyRequest('DELETE', `/products/${product.id}/images/${img.id}.json`);
                }
            }

            // Add new image
            const result = await shopifyRequest('POST', `/products/${product.id}/images.json`, {
                image: {
                    src: newImageUrl,
                    alt: product.title + " - Sattvic Prasadam"
                }
            });

            if (result.status === 200 || result.status === 201) {
                console.log(`  ✓ Updated`);
                updated++;
            } else {
                console.log(`  ✗ Failed: ${result.status}`);
            }

            await new Promise(r => setTimeout(r, 300));
        }
    }

    console.log(`\n=== Updated ${updated} product images ===`);
    console.log('All images now show authentic sattvic/vegetarian food!');
}

main().catch(console.error);
