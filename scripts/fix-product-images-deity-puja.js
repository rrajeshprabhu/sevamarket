const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim();
});

const SHOP = envVars.SHOPIFY_SHOP || 'seva-dev.myshopify.com';
const ACCESS_TOKEN = envVars.SHOPIFY_ACCESS_TOKEN;

// Better image URLs for products
const productImageUpdates = [
    {
        id: 9282274558177,
        title: 'Deity Dress Set (Radha Krishna)',
        // Beautiful Radha Krishna deity dress image
        newImageUrl: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800&q=80' // Krishna deity
    },
    {
        id: 9282264629473,
        title: 'Deity Dress Set - Radha Krishna (6 inch)',
        newImageUrl: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800&q=80'
    },
    {
        id: 9282274722017,
        title: 'Complete Puja Kit',
        // Puja thali/items image
        newImageUrl: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=800&q=80' // Puja items
    }
];

// Delete existing images and add new one
async function updateProductImage(productId, newImageUrl, title) {
    // First get current images
    const product = await new Promise((resolve, reject) => {
        const options = {
            hostname: SHOP,
            port: 443,
            path: `/admin/api/2024-01/products/${productId}.json`,
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': ACCESS_TOKEN,
                'Content-Type': 'application/json'
            }
        };
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(JSON.parse(body).product));
        });
        req.on('error', reject);
        req.end();
    });

    // Delete existing images
    for (const img of product.images || []) {
        await new Promise((resolve, reject) => {
            const options = {
                hostname: SHOP,
                port: 443,
                path: `/admin/api/2024-01/products/${productId}/images/${img.id}.json`,
                method: 'DELETE',
                headers: {
                    'X-Shopify-Access-Token': ACCESS_TOKEN,
                    'Content-Type': 'application/json'
                }
            };
            const req = https.request(options, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => resolve());
            });
            req.on('error', reject);
            req.end();
        });
        console.log(`  Deleted old image for ${title}`);
    }

    // Add new image
    const data = JSON.stringify({
        image: {
            src: newImageUrl
        }
    });

    const result = await new Promise((resolve, reject) => {
        const options = {
            hostname: SHOP,
            port: 443,
            path: `/admin/api/2024-01/products/${productId}/images.json`,
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': ACCESS_TOKEN,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, data: JSON.parse(body) });
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });

    return result;
}

async function main() {
    console.log('Fixing product images for Deity Dress and Puja Kit...\n');

    for (const product of productImageUpdates) {
        console.log(`Updating: ${product.title}`);
        try {
            const result = await updateProductImage(product.id, product.newImageUrl, product.title);
            if (result.status === 200 || result.status === 201) {
                console.log(`  ✓ Successfully updated image\n`);
            } else {
                console.log(`  ✗ Failed:`, result.data.errors || result.data);
            }
        } catch (err) {
            console.log(`  ✗ Error:`, err.message);
        }
    }

    console.log('Done!');
}

main();
