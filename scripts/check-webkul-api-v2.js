const https = require('https');

const WEBKUL_API_TOKEN = 'ODk3OTlhYWI2ZWZjM2Y2MTQ2MjZjYjFiYmMxZjM3NGE0MDkzYzk0MTZkMjBiY2JlMmI1MTZmODhlY2ZkNGRmMQ';

function makeRequest(hostname, path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: hostname,
            port: 443,
            path: path,
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + WEBKUL_API_TOKEN,
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
                    resolve({ status: res.statusCode, data: body.substring(0, 200) });
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function main() {
    console.log('Trying different Webkul API endpoints/hosts...\n');

    const tests = [
        { host: 'mvmapi.webkul.com', path: '/api/v1/sellers' },
        { host: 'mvmapi.webkul.com', path: '/api/sellers' },
        { host: 'mvmapi.webkul.com', path: '/v2/sellers' },
        { host: 'mvmapi.webkul.com', path: '/' },
        { host: 'mvmapi.webkul.com', path: '/api' },
    ];

    for (const test of tests) {
        console.log(test.host + test.path);
        try {
            const result = await makeRequest(test.host, test.path);
            console.log('  Status: ' + result.status);
            console.log('  Response: ' + JSON.stringify(result.data).substring(0, 150));
        } catch (e) {
            console.log('  Error: ' + e.message);
        }
        console.log('');
    }
}

main();
