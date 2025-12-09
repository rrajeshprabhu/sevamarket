const https = require('https');

const WEBKUL_ACCESS_TOKEN = 'ODk5OTlhYWI2ZWZjM2Y2MTQ2MjZjYjFiYmMxZjM3NGE0MDkzYzk0MTZkMjBiY2JlMmI1MTZmODhlY2ZkNGRmMQ';
const SHOP_NAME = 'seva-dev.myshopify.com';

function webkulRequest(method, endpoint) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'mvmapi.webkul.com',
            port: 443,
            path: endpoint,
            method: method,
            headers: {
                'Authorization': `Bearer ${WEBKUL_ACCESS_TOKEN}`,
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
        req.end();
    });
}

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  Webkul Multi-Vendor API Status Check                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log(`Shop: ${SHOP_NAME}\n`);

    // Check sellers endpoint
    console.log('1. Checking sellers endpoint...');
    const sellersResult = await webkulRequest('GET', '/api/v2/sellers.json');
    console.log(`   Status: ${sellersResult.status}`);

    if (sellersResult.status === 200 && sellersResult.data) {
        const sellers = sellersResult.data.sellers || sellersResult.data || [];
        console.log(`   ✓ API connection working`);
        console.log(`   Found ${Array.isArray(sellers) ? sellers.length : 0} sellers\n`);

        if (Array.isArray(sellers) && sellers.length > 0) {
            console.log('   Sample sellers:');
            sellers.slice(0, 3).forEach(s => {
                console.log(`   - ${s.storeName || s.name || s.sp_store_name} (ID: ${s.id})`);
            });
        }
    } else {
        console.log(`   ✗ API error: ${JSON.stringify(sellersResult.data)}`);
    }

    // Check products endpoint
    console.log('\n2. Checking products endpoint...');
    const productsResult = await webkulRequest('GET', '/api/v2/products.json');
    console.log(`   Status: ${productsResult.status}`);

    if (productsResult.status === 200) {
        console.log(`   ✓ Products endpoint accessible`);
    }

    // Check for any available endpoints that might reveal seller portal URL
    console.log('\n3. Checking shop info...');
    const shopResult = await webkulRequest('GET', '/api/v2/shop.json');
    console.log(`   Status: ${shopResult.status}`);
    if (shopResult.status === 200) {
        console.log(`   Data: ${JSON.stringify(shopResult.data, null, 2).substring(0, 300)}`);
    }

    console.log('\n═════════════════════════════════════════════════════════════');
    console.log('\nRECOMMENDATION:');
    console.log('Since the seller portal URL (seva-dev.sp-seller.webkul.com) redirects');
    console.log('to 404, you need to contact Webkul support to:');
    console.log('');
    console.log('1. Verify the seller portal is properly configured for your store');
    console.log('2. Get the correct seller signup URL');
    console.log('3. OR set up a custom seller subdomain (seller.sevasethu.com)');
    console.log('');
    console.log('Contact: support@webkul.com');
    console.log('Ticket: https://webkul.uvdesk.com/en/customer/create-ticket/');
}

main().catch(console.error);
