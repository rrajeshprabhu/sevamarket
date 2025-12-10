const https = require('https');

const WEBKUL_API_TOKEN = 'ODk3OTlhYWI2ZWZjM2Y2MTQ2MjZjYjFiYmMxZjM3NGE0MDkzYzk0MTZkMjBiY2JlMmI1MTZmODhlY2ZkNGRmMQ';

function makeWebkulRequest(path, method = 'GET') {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'mvmapi.webkul.com',
            port: 443,
            path: path,
            method: method,
            headers: {
                'Authorization': `Bearer ${WEBKUL_API_TOKEN}`,
                'Content-Type': 'application/json'
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
    console.log('Checking Webkul API capabilities...\n');

    // Test various endpoints
    const endpoints = [
        '/api/v2/seller',
        '/api/v2/sellers',
        '/api/v2/product',
        '/api/v2/products',
        '/api/v2/order',
        '/api/v2/orders',
        '/api/v2/collection',
        '/api/v2/collections',
        '/api/v2/settings',
        '/api/v2/config'
    ];

    for (const endpoint of endpoints) {
        const result = await makeWebkulRequest(endpoint);
        console.log(`${endpoint}`);
        console.log(`  Status: ${result.status}`);
        if (result.data && result.data.message) {
            console.log(`  Message: ${result.data.message}`);
        } else if (result.data && result.data.data) {
            console.log(`  Data: Found!`);
        }
        console.log('');
    }
}

main();
