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
    console.log('=== Checking Webkul Configuration ===\n');

    // Try different endpoints to find config
    const endpoints = [
        '/api/v2/configuration.json',
        '/api/v2/settings.json',
        '/api/v2/config.json',
        '/api/v2/general-settings.json',
        '/api/v2/seller-settings.json',
        '/api/v2/registration-settings.json'
    ];

    for (const endpoint of endpoints) {
        console.log(`Trying: ${endpoint}`);
        const result = await webkulRequest('GET', endpoint);
        console.log(`  Status: ${result.status}`);
        if (result.status === 200) {
            console.log(`  Data:`, JSON.stringify(result.data, null, 2).substring(0, 500));
        }
        console.log('');
    }
}

main().catch(console.error);
