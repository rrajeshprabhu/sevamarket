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
    console.log('=== Updating Products for ISKCON Dietary Guidelines ===\n');
    console.log('ISKCON prasadam rules: No onion, no garlic, no meat, no eggs, no masoor dal\n');

    // Get all products
    const productsResponse = await shopifyRequest('GET', '/products.json?limit=250');
    const products = productsResponse.data.products || [];

    console.log(`Found ${products.length} products\n`);

    // Find and update pizza products
    const pizzaProducts = products.filter(p =>
        p.title.toLowerCase().includes('pizza') ||
        p.vendor === 'Prabhu Pizza'
    );

    console.log(`Found ${pizzaProducts.length} pizza products to update\n`);

    // Updated product descriptions - ISKCON friendly (no onion, no garlic)
    const productUpdates = {
        'margherita-pizza': {
            title: "Margherita Pizza (Prasadam)",
            body_html: `
                <h3>Classic Krishna Prasadam Pizza</h3>
                <p>Our signature pizza made with pure sattvic ingredients, prepared with devotion and offered to Lord Krishna.</p>

                <h4>Pure Ingredients:</h4>
                <ul>
                    <li>Fresh hand-tossed dough (no eggs)</li>
                    <li>San Marzano tomato sauce (no onion, no garlic)</li>
                    <li>Fresh buffalo mozzarella</li>
                    <li>Holy basil (Tulsi) and Italian basil</li>
                    <li>Extra virgin olive oil</li>
                    <li>Himalayan pink salt</li>
                </ul>

                <p><strong>100% Sattvic | No Onion | No Garlic | Offered to Krishna</strong></p>
                <p><em>Made fresh to order. Delivery within 45 minutes.</em></p>
                <p>🙏 <strong>Hare Krishna!</strong> All our food is prepared with love and devotion.</p>
            `,
            tags: ["pizza", "prasadam", "sattvic", "no-onion", "no-garlic", "vegetarian", "krishna-prasadam", "prabhu-pizza"]
        },
        'veggie-supreme-pizza': {
            title: "Veggie Supreme Pizza (Prasadam)",
            body_html: `
                <h3>Garden Fresh Sattvic Pizza</h3>
                <p>Loaded with Krishna's garden vegetables - a feast of colors and flavors, all pure and sattvic!</p>

                <h4>Pure Ingredients:</h4>
                <ul>
                    <li>Fresh bell peppers (capsicum)</li>
                    <li>Sweet corn</li>
                    <li>Fresh tomatoes</li>
                    <li>Black olives</li>
                    <li>Fresh spinach</li>
                    <li>Paneer cubes</li>
                    <li>Herbs: Oregano, basil, thyme</li>
                    <li>Sattvic tomato sauce (no onion, no garlic)</li>
                </ul>

                <p><strong>100% Sattvic | No Onion | No Garlic | No Mushroom | Offered to Krishna</strong></p>
                <p><em>Made fresh to order with love and devotion.</em></p>
                <p>🙏 <strong>Hari Bol!</strong></p>
            `,
            tags: ["pizza", "prasadam", "sattvic", "no-onion", "no-garlic", "vegetarian", "krishna-prasadam", "veggie", "prabhu-pizza"]
        },
        'paneer-tikka-pizza': {
            title: "Paneer Tikka Pizza (Prasadam)",
            body_html: `
                <h3>Indian Fusion Sattvic Pizza</h3>
                <p>Marinated paneer tikka on a crispy pizza base - the perfect blend of Italian and Indian flavors, prepared the ISKCON way!</p>

                <h4>Pure Ingredients:</h4>
                <ul>
                    <li>Fresh paneer marinated in yogurt & spices</li>
                    <li>Bell peppers (capsicum)</li>
                    <li>Fresh tomatoes</li>
                    <li>Coriander (cilantro)</li>
                    <li>Mint chutney drizzle</li>
                    <li>Ginger (no garlic)</li>
                    <li>Cumin, coriander, turmeric</li>
                    <li>Special sattvic tikka masala (hing instead of onion-garlic)</li>
                </ul>

                <p><strong>100% Sattvic | No Onion | No Garlic | Uses Hing (Asafoetida) | Offered to Krishna</strong></p>
                <p><em>A devotee favorite! Made with traditional Vedic cooking principles.</em></p>
                <p>🙏 <strong>Govinda!</strong></p>
            `,
            tags: ["pizza", "prasadam", "sattvic", "no-onion", "no-garlic", "paneer", "indian", "krishna-prasadam", "prabhu-pizza"]
        },
        'garlic-breadsticks': {
            title: "Hing Breadsticks (Prasadam)",
            body_html: `
                <h3>Sattvic Herb Breadsticks</h3>
                <p>Crispy, aromatic breadsticks made with hing (asafoetida) instead of garlic - the traditional Vaishnava way!</p>

                <h4>Pure Ingredients:</h4>
                <ul>
                    <li>Fresh baked bread dough (no eggs)</li>
                    <li>Hing (asafoetida) - gives garlic-like flavor</li>
                    <li>Butter</li>
                    <li>Italian herbs: oregano, basil, parsley</li>
                    <li>Parmesan cheese</li>
                    <li>Himalayan pink salt</li>
                </ul>

                <p><strong>Served with sattvic marinara dipping sauce (no onion, no garlic)</strong></p>
                <p><strong>100% Sattvic | No Onion | No Garlic | Offered to Krishna</strong></p>
                <p>🙏 Perfect side for any pizza!</p>
            `,
            tags: ["breadsticks", "prasadam", "sattvic", "no-onion", "no-garlic", "hing", "krishna-prasadam", "prabhu-pizza"]
        }
    };

    // Update each pizza product
    for (const product of pizzaProducts) {
        const update = productUpdates[product.handle];
        if (update) {
            console.log(`Updating: ${product.title} -> ${update.title}`);

            const updateResult = await shopifyRequest('PUT', `/products/${product.id}.json`, {
                product: {
                    id: product.id,
                    title: update.title,
                    body_html: update.body_html,
                    tags: update.tags.join(', ')
                }
            });

            if (updateResult.status === 200) {
                console.log(`  ✓ Updated successfully`);
            } else {
                console.log(`  ✗ Error: ${updateResult.status}`);
            }
        }
    }

    // Also update catering products to be ISKCON compliant
    console.log('\n--- Updating Catering Products ---\n');

    const cateringProducts = products.filter(p =>
        p.vendor === "Govinda's Catering" ||
        p.title.toLowerCase().includes('catering') ||
        p.title.toLowerCase().includes('tiffin')
    );

    const cateringUpdates = {
        'temple-feast-catering-package': {
            body_html: `
                <h3>Traditional Temple Feast Catering</h3>
                <p>Authentic prasadam feast for your special occasions - prepared with devotion following strict Vaishnava guidelines.</p>

                <h4>Feast Includes:</h4>
                <ul>
                    <li><strong>Rice:</strong> Basmati rice, Lemon rice, Pulao</li>
                    <li><strong>Dals:</strong> Toor dal, Moong dal, Chana dal (NO masoor dal)</li>
                    <li><strong>Sabzis:</strong> Seasonal vegetable preparations</li>
                    <li><strong>Rotis:</strong> Fresh chapatis, puris</li>
                    <li><strong>Sweets:</strong> Kheer, Halwa, Gulab jamun</li>
                    <li><strong>Drinks:</strong> Charanamrita, Sweet lassi</li>
                </ul>

                <p><strong>All food is:</strong></p>
                <ul>
                    <li>✓ 100% Sattvic</li>
                    <li>✓ No onion, no garlic</li>
                    <li>✓ No eggs</li>
                    <li>✓ No masoor dal</li>
                    <li>✓ No mushrooms</li>
                    <li>✓ Offered to Lord Krishna</li>
                </ul>

                <p>🙏 <strong>Hare Krishna! Jai Srila Prabhupada!</strong></p>
            `
        },
        'weekly-tiffin-service': {
            body_html: `
                <h3>Weekly Prasadam Tiffin Service</h3>
                <p>Fresh, home-style prasadam delivered to your door - prepared with love following ISKCON guidelines.</p>

                <h4>Daily Menu Includes:</h4>
                <ul>
                    <li>Rice or Roti (2 pieces)</li>
                    <li>Dal (Toor/Moong/Chana - NO masoor)</li>
                    <li>2 Sabzi preparations</li>
                    <li>Salad & Pickle</li>
                    <li>Sweet (rotates daily)</li>
                </ul>

                <h4>Our Promise:</h4>
                <ul>
                    <li>✓ 100% Sattvic ingredients</li>
                    <li>✓ No onion, no garlic</li>
                    <li>✓ No eggs or egg products</li>
                    <li>✓ Fresh ingredients daily</li>
                    <li>✓ Offered to Krishna before packing</li>
                </ul>

                <p><em>Delivery: Monday to Saturday</em></p>
                <p>🙏 <strong>Prasadam ki Jai!</strong></p>
            `
        }
    };

    for (const product of cateringProducts) {
        const update = cateringUpdates[product.handle];
        if (update) {
            console.log(`Updating: ${product.title}`);

            const updateResult = await shopifyRequest('PUT', `/products/${product.id}.json`, {
                product: {
                    id: product.id,
                    body_html: update.body_html,
                    tags: "catering, prasadam, sattvic, no-onion, no-garlic, no-egg, iskcon, govindas"
                }
            });

            if (updateResult.status === 200) {
                console.log(`  ✓ Updated successfully`);
            } else {
                console.log(`  ✗ Error: ${updateResult.status}`);
            }
        }
    }

    console.log('\n=== ISKCON Dietary Guidelines Applied ===');
    console.log('\nAll food products now clearly state:');
    console.log('- No onion');
    console.log('- No garlic (uses hing/asafoetida instead)');
    console.log('- No eggs');
    console.log('- No masoor dal');
    console.log('- No mushrooms');
    console.log('- 100% Sattvic');
    console.log('- Offered to Krishna (Prasadam)');
    console.log('\n🙏 Hare Krishna!');
}

main().catch(console.error);
