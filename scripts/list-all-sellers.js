const https = require('https');

const SHOP = 'seva-dev.myshopify.com';
const ACCESS_TOKEN = 'process.env.SHOPIFY_ACCESS_TOKEN';

function shopifyRequest(method, endpoint) {
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
        req.end();
    });
}

async function main() {
    // Get all products and their vendors
    const result = await shopifyRequest('GET', '/products.json?limit=250');
    const products = result.data.products || [];

    // Get unique vendors
    const vendors = {};
    for (const p of products) {
        const v = p.vendor || 'Unknown';
        if (!vendors[v]) {
            vendors[v] = [];
        }
        vendors[v].push(p.title);
    }

    console.log('=== ALL SELLERS/VENDORS IN SHOPIFY ===\n');
    const sortedVendors = Object.entries(vendors).sort((a, b) => a[0].localeCompare(b[0]));

    for (const [vendor, prods] of sortedVendors) {
        console.log(`${vendor} (${prods.length} products)`);
        for (const prod of prods) {
            console.log(`   - ${prod}`);
        }
        console.log('');
    }

    console.log(`\nTotal: ${sortedVendors.length} sellers`);
}

main().catch(console.error);
