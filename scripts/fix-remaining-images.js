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

function shopifyRequest(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SHOP,
            port: 443,
            path: '/admin/api/2024-01' + endpoint,
            method: method,
            headers: {
                'X-Shopify-Access-Token': ACCESS_TOKEN,
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
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function main() {
    console.log('Fixing remaining images...\n');
    
    const productsResult = await shopifyRequest('GET', '/products.json?limit=250');
    const products = productsResult.data.products || [];
    
    for (const product of products) {
        if (!product.images || product.images.length === 0) {
            console.log('No image: ' + product.title + ' (handle: ' + product.handle + ')');
            
            let imageUrl = '';
            if (product.title.includes('Summer Camp')) {
                imageUrl = 'https://images.unsplash.com/photo-1472898965229-f9b06b9c9bbe?w=800';
            } else if (product.title.includes('Workshop')) {
                imageUrl = 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800';
            }
            
            if (imageUrl) {
                const result = await shopifyRequest('POST', '/products/' + product.id + '/images.json', {
                    image: { src: imageUrl, alt: product.title }
                });
                console.log('  Added image: ' + (result.status === 201 ? 'Success' : 'Failed'));
            }
        }
    }
    console.log('\nDone!');
}

main();
