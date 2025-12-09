const https = require('https');

const SHOP_NAME = 'seva-dev.myshopify.com';

// Two tokens found in the codebase
const tokens = [
    {
        name: 'Token from webkul-api-setup.js',
        token: 'ODk3OTlhYWI2ZWZjM2Y2MTQ2MjZjYjFiYmMxZjM3NGE0MDkzYzk0MTZkMjBiY2JlMmI1MTZmODhlY2ZkNGRmMQ'
    },
    {
        name: 'Token from check-webkul-config.js',
        token: 'ODk5OTlhYWI2ZWZjM2Y2MTQ2MjZjYjFiYmMxZjM3NGE0MDkzYzk0MTZkMjBiY2JlMmI1MTZmODhlY2ZkNGRmMQ'
    }
];

function webkulRequest(accessToken) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'mvmapi.webkul.com',
            port: 443,
            path: '/api/v2/sellers.json',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
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
    console.log('Testing Webkul API Tokens...\n');

    for (const t of tokens) {
        console.log(`Testing: ${t.name}`);
        console.log(`Token: ${t.token.substring(0, 20)}...`);

        const result = await webkulRequest(t.token);
        console.log(`Status: ${result.status}`);

        if (result.status === 200) {
            const sellers = result.data.sellers || result.data || [];
            console.log(`✓ WORKING! Found ${Array.isArray(sellers) ? sellers.length : 0} sellers`);
        } else {
            console.log(`✗ Failed: ${JSON.stringify(result.data)}`);
        }
        console.log('');
    }
}

main().catch(console.error);
