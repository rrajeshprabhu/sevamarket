const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim();
});

const SHOP = envVars.SHOPIFY_SHOP || 'seva-dev.myshopify.com';
const WEBKUL_ACCESS_TOKEN = 'ODk3OTlhYWI2ZWZjM2Y2MTQ2MjZjYjFiYmMxZjM3NGE0MDkzYzk0MTZkMjBiY2JlMmI1MTZmODhlY2ZkNGRmMQ';
const LOCATION_ID = '431196';  // Primary location from Shopify

function webkulRequest(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
        const postData = data ? JSON.stringify(data) : null;
        const options = {
            hostname: 'mvmapi.webkul.com',
            port: 443,
            path: endpoint,
            method: method,
            headers: {
                'Authorization': 'Bearer ' + WEBKUL_ACCESS_TOKEN,
                'Content-Type': 'application/json',
                'shop': SHOP
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
        if (postData) req.write(postData);
        req.end();
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Vinay Prabhu's seller ID (created earlier)
const VINAY_SELLER_ID = '2766579';

// Products for Vinay - Physical goods with shipping
const products = [
    {
        name: 'Areca Palm Leaf Plates - Round 10 inch (25 pack)',
        price: '15.00',
        sku: 'VP-PLT10-25',
        desc: '25 plates. 100% natural and biodegradable plates made from fallen areca palm leaves. Sturdy, leak-proof, and microwave safe. Perfect for events and parties.',
        tags: 'eco-friendly,plates,disposable,events'
    },
    {
        name: 'Areca Palm Leaf Plates - Round 10 inch (50 pack)',
        price: '28.00',
        sku: 'VP-PLT10-50',
        desc: '50 plates. 100% natural and biodegradable plates made from fallen areca palm leaves. Sturdy, leak-proof, and microwave safe. Perfect for events and parties.',
        tags: 'eco-friendly,plates,disposable,events'
    },
    {
        name: 'Areca Palm Leaf Plates - Round 10 inch (100 pack)',
        price: '52.00',
        sku: 'VP-PLT10-100',
        desc: '100 plates. 100% natural and biodegradable plates made from fallen areca palm leaves. Sturdy, leak-proof, and microwave safe. Best value for large events!',
        tags: 'eco-friendly,plates,disposable,events'
    },
    {
        name: 'Areca Palm Leaf Plates - Square 8 inch (50 pack)',
        price: '22.00',
        sku: 'VP-PLT8S-50',
        desc: '50 square plates. Elegant design made from fallen areca palm leaves. Great for appetizers and desserts. 100% compostable.',
        tags: 'eco-friendly,plates,disposable,events'
    },
    {
        name: 'Sugarcane Bagasse Cups 12oz (50 pack)',
        price: '14.00',
        sku: 'VP-CUP12-50',
        desc: '50 cups. Sturdy cups made from sugarcane fiber. Hot and cold beverage safe. 100% compostable. Perfect for chai, coffee, or cold drinks.',
        tags: 'eco-friendly,cups,disposable,events'
    },
    {
        name: 'Sugarcane Bagasse Cups 12oz (100 pack)',
        price: '25.00',
        sku: 'VP-CUP12-100',
        desc: '100 cups. Sturdy cups made from sugarcane fiber. Hot and cold beverage safe. 100% compostable. Great value pack!',
        tags: 'eco-friendly,cups,disposable,events'
    },
    {
        name: 'Bamboo Cutlery Set - Fork, Spoon, Knife (50 sets)',
        price: '32.00',
        sku: 'VP-CUT-50',
        desc: '50 complete cutlery sets. Each set includes fork, spoon, and knife. Premium bamboo, strong and splinter-free. Fully biodegradable.',
        tags: 'eco-friendly,cutlery,disposable,events'
    },
    {
        name: 'Event Bundle - 50 Guests Complete Pack',
        price: '99.00',
        sku: 'VP-BUNDLE-50',
        desc: 'Complete eco-friendly party pack for 50 guests! Includes: 50 round plates (10"), 50 square plates (8"), 50 cups, and 50 cutlery sets. Save 15% vs buying separately!',
        tags: 'eco-friendly,bundle,events,value-pack'
    },
    {
        name: 'Event Bundle - 100 Guests Complete Pack',
        price: '175.00',
        sku: 'VP-BUNDLE-100',
        desc: 'Complete eco-friendly party pack for 100 guests! Includes: 100 round plates (10"), 100 square plates (8"), 100 cups, and 100 cutlery sets. Save 20% vs buying separately!',
        tags: 'eco-friendly,bundle,events,value-pack'
    }
];

async function createProduct(product) {
    console.log('  Creating: ' + product.name);

    const productData = {
        seller_id: VINAY_SELLER_ID,
        type: '1',
        product_name: product.name,
        product_type: 'Party Supplies',
        product_tag: product.tags,
        product_description: product.desc,
        handle: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50),
        variants: [{
            sku: product.sku,
            price: product.price,
            quantity: '100',
            track_inventory: '1',
            require_shipping: '1',
            taxable: '1',
            inventory_locations: [{
                location_id: LOCATION_ID,
                variant_quantity: '100'
            }]
        }],
        options: [{
            name: 'Title',
            values: 'Default'
        }]
    };

    const result = await webkulRequest('POST', '/api/v2/products.json', productData);

    if (result.status === 200 || result.status === 201) {
        console.log('    ✓ Created');
        return true;
    } else {
        console.log('    ✗ Failed: ' + result.status + ' - ' + JSON.stringify(result.data).substring(0, 150));
        return false;
    }
}

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  Creating Products for Vinay Prabhu (Eco Party Supplies)   ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\nSeller ID: ' + VINAY_SELLER_ID);

    let created = 0;

    for (const product of products) {
        await sleep(1000);
        const success = await createProduct(product);
        if (success) created++;
    }

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  COMPLETE!                                                  ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log('║  Products created: ' + created + ' / ' + products.length + '                                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
}

main().catch(console.error);
