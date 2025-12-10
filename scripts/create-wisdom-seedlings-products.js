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

const WEBKUL_ACCESS_TOKEN = 'ODk3OTlhYWI2ZWZjM2Y2MTQ2MjZjYjFiYmMxZjM3NGE0MDkzYzk0MTZkMjBiY2JlMmI1MTZmODhlY2ZkNGRmMQ';
const SHOP_NAME = 'seva-dev.myshopify.com';

function webkulRequest(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'mvmapi.webkul.com',
            port: 443,
            path: endpoint,
            method: method,
            headers: {
                'Authorization': 'Bearer ' + WEBKUL_ACCESS_TOKEN,
                'Content-Type': 'application/json',
                'shop': SHOP_NAME
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  Creating Products for Wisdom Seedlings                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // First, get the seller ID for Wisdom Seedlings
    console.log('Step 1: Getting seller info...');
    const sellersResult = await webkulRequest('GET', '/api/v2/sellers.json');

    if (sellersResult.status !== 200) {
        console.log('Failed to get sellers:', sellersResult);
        return;
    }

    console.log('Sellers found:');
    const sellers = sellersResult.data.sellers || [];
    sellers.forEach(s => {
        console.log('  - ' + s.sp_store_name + ' (ID: ' + s.id + ')');
    });

    // Find Wisdom Seedlings / Rajesh Prabhu seller
    const wisdomSeedlings = sellers.find(s =>
        s.sp_store_name.toLowerCase().includes('rajesh') ||
        s.sp_store_name.toLowerCase().includes('wisdom')
    );

    if (!wisdomSeedlings) {
        console.log('\nCould not find Wisdom Seedlings seller!');
        return;
    }

    const sellerId = wisdomSeedlings.id;
    console.log('\nUsing seller: ' + wisdomSeedlings.sp_store_name + ' (ID: ' + sellerId + ')');

    await sleep(600); // Rate limiting

    // Get location ID
    console.log('\nStep 2: Getting location ID...');
    const shopifyToken = envVars.SHOPIFY_ACCESS_TOKEN;

    const locationResult = await new Promise((resolve, reject) => {
        const options = {
            hostname: SHOP_NAME,
            port: 443,
            path: '/admin/api/2024-01/locations.json',
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': shopifyToken,
                'Content-Type': 'application/json'
            }
        };
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(JSON.parse(body)));
        });
        req.on('error', reject);
        req.end();
    });

    const locationId = locationResult.locations[0].id;
    console.log('Location ID: ' + locationId);

    // Products for Wisdom Seedlings school
    const products = [
        {
            name: 'Monthly School Enrollment',
            type: 'Education',
            description: 'Wisdom Seedlings monthly enrollment for children ages 3-6. Our curriculum blends Montessori methods with Vedic values, nurturing the whole child - mind, body, and spirit. Includes daily yoga, Sanskrit shlokas, and nature-based learning.',
            price: '200.00',
            sku: 'WS-MONTHLY-001'
        },
        {
            name: 'Annual School Enrollment',
            type: 'Education',
            description: 'Full year enrollment at Wisdom Seedlings (10 months). Save $400 compared to monthly payments! Includes all materials, field trips, and special events. Payment plan available.',
            price: '1600.00',
            sku: 'WS-ANNUAL-001'
        },
        {
            name: 'Summer Camp Program (4 weeks)',
            type: 'Education',
            description: 'Exciting summer camp for ages 4-8! Activities include outdoor adventures, arts & crafts, cooking classes, gardening, yoga, and spiritual storytelling. Full day program 9am-3pm.',
            price: '800.00',
            sku: 'WS-SUMMER-001'
        },
        {
            name: 'Trial Week',
            type: 'Education',
            description: 'Experience Wisdom Seedlings for one week! Perfect for families exploring our school. Your child will participate in all regular activities. Trial fee credited towards enrollment.',
            price: '75.00',
            sku: 'WS-TRIAL-001'
        },
        {
            name: 'Parent-Child Workshop (Weekend)',
            type: 'Education',
            description: 'Special weekend workshops for parents and children to learn together. Topics include: Sanskrit for families, Vedic storytelling, family yoga, and conscious parenting. Held monthly.',
            price: '45.00',
            sku: 'WS-WORKSHOP-001'
        }
    ];

    console.log('\nStep 3: Creating products...\n');

    let created = 0;
    for (const product of products) {
        console.log('Creating: ' + product.name);

        const productData = {
            seller_id: sellerId.toString(),
            type: '1',
            product_name: product.name,
            product_type: product.type,
            product_tag: 'education,school,children,vedic,wisdom-seedlings',
            product_description: product.description,
            handle: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            variants: [{
                sku: product.sku,
                price: product.price,
                quantity: '999',
                track_inventory: '0',
                require_shipping: '0',
                taxable: '0'
            }],
            options: [{
                name: 'Title',
                values: 'Default'
            }]
        };

        await sleep(1000); // Rate limiting - max 2 requests per second

        const result = await webkulRequest('POST', '/api/v2/products.json', productData);

        if (result.status === 200 || result.status === 201) {
            console.log('  ✓ Created successfully');
            if (result.data && result.data.product) {
                console.log('    Product ID: ' + result.data.product.id);
            }
            created++;
        } else {
            console.log('  ✗ Failed: ' + result.status);
            console.log('    ' + JSON.stringify(result.data).substring(0, 200));
        }
    }

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  COMPLETE!                                                  ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log('║  Products created: ' + created + '/' + products.length + '                                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\nProducts should now appear in:');
    console.log('  - Seller portal: https://seva-dev.sp-seller.webkul.com');
    console.log('  - Shopify admin: https://seva-dev.myshopify.com/admin/products');
    console.log('  - Store front: https://seva-dev.myshopify.com/collections/all');
}

main().catch(console.error);
