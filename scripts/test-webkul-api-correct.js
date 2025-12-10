const https = require('https');

const WEBKUL_ACCESS_TOKEN = 'ODk3OTlhYWI2ZWZjM2Y2MTQ2MjZjYjFiYmMxZjM3NGE0MDkzYzk0MTZkMjBiY2JlMmI1MTZmODhlY2ZkNGRmMQ';
const SHOP_NAME = 'seva-dev.myshopify.com';

function webkulRequest(method, endpoint) {
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
                    resolve({ status: res.statusCode, data: body.substring(0, 300) });
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function main() {
    console.log('Testing Webkul API with correct format...\n');
    console.log('Shop: ' + SHOP_NAME);
    console.log('Token: ' + WEBKUL_ACCESS_TOKEN.substring(0, 20) + '...\n');

    const endpoints = [
        '/api/v2/sellers.json',
        '/api/v2/seller.json',
        '/api/v2/products.json',
        '/api/v2/product.json',
        '/api/v2/locations.json',
        '/api/v2/collections.json'
    ];

    for (const endpoint of endpoints) {
        console.log('GET ' + endpoint);
        const result = await webkulRequest('GET', endpoint);
        console.log('  Status: ' + result.status);
        if (typeof result.data === 'object') {
            console.log('  Response: ' + JSON.stringify(result.data).substring(0, 150));
        } else {
            console.log('  Response: ' + result.data);
        }
        console.log('');
    }
}

main();
