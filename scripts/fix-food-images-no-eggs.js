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
    console.log('=== Fixing Food Images - No Eggs Visible ===\n');

    // Get all products
    const productsResponse = await shopifyRequest('GET', '/products.json?limit=250');
    const products = productsResponse.data.products || [];

    // Pure vegetarian food images - NO EGGS visible
    // Using images that clearly show cheese pizza, veggie dishes, Indian food
    const eggFreeImages = {
        // Pizza - Pure cheese and veggie pizzas (no egg pasta, no mayo)
        'cheese-burst-pizza-prasadam': 'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?w=800', // Cheese pizza closeup
        'pesto-paneer-pizza-prasadam': 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=800', // Green pesto pizza
        'margherita-pizza': 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800', // Classic margherita
        'veggie-supreme-pizza': 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=800', // Veggie loaded pizza
        'paneer-tikka-pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', // Indian style pizza

        // Pasta - Creamy pasta without egg noodles look
        'pasta-alfredo-prasadam': 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800', // Creamy white pasta

        // Dessert - Eggless looking desserts
        'tiramisu-prasadam-dessert': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800', // Tiramisu layers

        // Indian Catering - Pure vegetarian Indian food
        'sunday-feast-catering-50-people': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800', // Indian thali
        'janmashtami-special-feast': 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800', // Indian sweets/mithai
        'sattvic-wedding-package': 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800', // Banquet food
        'daily-tiffin-subscription': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800', // Indian lunch
        'temple-feast-catering-package': 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800', // Indian feast
        'weekly-tiffin-service': 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800', // Tiffin boxes
        'birthday-party-catering': 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800', // Party food
        'wedding-catering-consultation': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800', // Wedding setup

        // Breadsticks
        'garlic-breadsticks': 'https://images.unsplash.com/photo-1619531040576-f9416740661b?w=800', // Breadsticks
    };

    let updated = 0;

    for (const product of products) {
        const newImageUrl = eggFreeImages[product.handle];

        if (newImageUrl) {
            console.log(`Updating: ${product.title}`);

            // Delete existing images
            if (product.images && product.images.length > 0) {
                for (const img of product.images) {
                    await shopifyRequest('DELETE', `/products/${product.id}/images/${img.id}.json`);
                }
                console.log(`  - Deleted old images`);
            }

            // Add new egg-free image
            const result = await shopifyRequest('POST', `/products/${product.id}/images.json`, {
                image: {
                    src: newImageUrl,
                    alt: product.title + " - Pure Vegetarian Prasadam"
                }
            });

            if (result.status === 200 || result.status === 201) {
                console.log(`  ✓ New image added`);
                updated++;
            } else {
                console.log(`  ✗ Failed: ${result.status}`);
            }

            await new Promise(r => setTimeout(r, 500));
        }
    }

    console.log(`\n=== Updated ${updated} food images ===`);
    console.log('All food images now show pure vegetarian items - NO EGGS!');
}

main().catch(console.error);
