const https = require('https');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim();
});

const SHOP = envVars.SHOPIFY_SHOP || 'seva-dev.myshopify.com';
const ACCESS_TOKEN = envVars.SHOPIFY_ACCESS_TOKEN;

function shopifyRequest(endpoint) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SHOP,
            port: 443,
            path: '/admin/api/2024-01' + endpoint,
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': ACCESS_TOKEN,
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
}

async function main() {
    console.log('Checking Wisdom Seedlings products...\n');
    
    const result = await shopifyRequest('/products.json?limit=250');
    const products = result.products || [];
    
    console.log('Product                               | Image | Collection');
    console.log('--------------------------------------|-------|------------');
    
    for (const p of products) {
        const hasImage = p.images && p.images.length > 0 ? '✓' : '✗';
        console.log(p.title.substring(0,37).padEnd(38) + '| ' + hasImage + '     | Check manually');
    }
}

main();
