const https = require('https');

const WEBKUL_ACCESS_TOKEN = 'ODk3OTlhYWI2ZWZjM2Y2MTQ2MjZjYjFiYmMxZjM3NGE0MDkzYzk0MTZkMjBiY2JlMmI1MTZmODhlY2ZkNGRmMQ';
const SHOP = 'seva-dev.myshopify.com';

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

async function main() {
    // Try to see what the API expects
    console.log('Testing seller creation endpoint...\n');
    
    // Try OPTIONS to see what methods are allowed
    const result = await webkulRequest('POST', '/api/v2/sellers.json', {
        seller: {
            name: 'Test Seller',
            email: 'test@example.com',
            shop_name: 'Test Shop'
        }
    });
    
    console.log('Status:', result.status);
    console.log('Response:', JSON.stringify(result.data, null, 2));
}

main();
