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
    console.log('Fixing remaining images with Pexels...\n');
    
    const productsResult = await shopifyRequest('GET', '/products.json?limit=250');
    const products = productsResult.data.products || [];
    
    for (const product of products) {
        if (!product.images || product.images.length === 0) {
            console.log('No image: ' + product.title);
            
            let imageUrl = '';
            if (product.title.includes('Summer Camp')) {
                imageUrl = 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?w=800';
            } else if (product.title.includes('Workshop')) {
                imageUrl = 'https://images.pexels.com/photos/3662667/pexels-photo-3662667.jpeg?w=800';
            }
            
            if (imageUrl) {
                console.log('  Trying: ' + imageUrl);
                const result = await shopifyRequest('POST', '/products/' + product.id + '/images.json', {
                    image: { src: imageUrl, alt: product.title }
                });
                if (result.status === 201 || result.status === 200) {
                    console.log('  ✓ Success');
                } else {
                    console.log('  ✗ Failed: ' + result.status + ' - ' + JSON.stringify(result.data).substring(0,100));
                }
            }
        }
    }
    console.log('\nDone!');
}

main();
