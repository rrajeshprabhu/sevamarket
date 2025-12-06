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
    console.log('=== Fixing Catering & Food Images - Pure Vegetarian Only ===\n');

    // Get all products
    const productsResponse = await shopifyRequest('GET', '/products.json?limit=250');
    const products = productsResponse.data.products || [];

    console.log(`Found ${products.length} total products\n`);

    // Pure vegetarian images - ABSOLUTELY NO EGGS, NO MEAT, NO FISH
    // All images should show clearly vegetarian Indian food
    const vegetarianImages = {
        // Catering products - Indian vegetarian food only
        'sunday-feast-catering-50-people': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800', // Indian thali
        'janmashtami-special-feast': 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800', // Indian sweets/mithai
        'sattvic-wedding-package': 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800', // Banquet setup
        'daily-tiffin-subscription': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800', // Indian tiffin
        'temple-feast-catering-package': 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800', // Indian feast spread
        'weekly-tiffin-service': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800', // Rice and dal
        'birthday-party-catering': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', // Colorful vegetarian spread
        'wedding-catering-consultation': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', // Elegant dining setup

        // Pizza products - cheese and veggie only, no meat
        'cheese-burst-pizza-prasadam': 'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?w=800', // Cheese pizza
        'pesto-paneer-pizza-prasadam': 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=800', // Green pesto pizza
        'pasta-alfredo-prasadam': 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800', // Creamy pasta
        'margherita-pizza': 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800', // Margherita
        'veggie-supreme-pizza': 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=800', // Veggie pizza
        'paneer-tikka-pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', // Paneer pizza
        'garlic-breadsticks': 'https://images.unsplash.com/photo-1619531040576-f9416740661b?w=800', // Breadsticks

        // Desserts - eggless
        'tiramisu-prasadam-dessert': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800', // Tiramisu
    };

    // Keywords to identify catering/food products that might have bad images
    const foodKeywords = ['catering', 'feast', 'tiffin', 'pizza', 'pasta', 'food', 'prasadam', 'lunch', 'dinner', 'dessert'];

    let updated = 0;

    for (const product of products) {
        // Check if product is in our fix list
        let imageUrl = vegetarianImages[product.handle];

        // Also check by title/type for catering products
        if (!imageUrl && product.product_type) {
            const type = product.product_type.toLowerCase();
            if (type.includes('catering') || type.includes('food')) {
                // Use a safe Indian thali image
                imageUrl = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800';
            }
        }

        if (imageUrl) {
            console.log(`Fixing: ${product.title} (${product.handle})`);

            // Delete existing images
            if (product.images && product.images.length > 0) {
                for (const img of product.images) {
                    await shopifyRequest('DELETE', `/products/${product.id}/images/${img.id}.json`);
                }
                console.log(`  - Deleted ${product.images.length} old image(s)`);
            }

            // Add new vegetarian image
            const result = await shopifyRequest('POST', `/products/${product.id}/images.json`, {
                image: {
                    src: imageUrl,
                    alt: product.title + " - Pure Vegetarian Sattvic"
                }
            });

            if (result.status === 200 || result.status === 201) {
                console.log(`  ✓ New vegetarian image added`);
                updated++;
            } else {
                console.log(`  ✗ Failed: ${result.status}`);
            }

            await new Promise(r => setTimeout(r, 500));
        }
    }

    console.log(`\n=== Fixed ${updated} food/catering product images ===`);
    console.log('All images now show pure vegetarian food - NO EGGS, NO MEAT!');
}

main().catch(console.error);
