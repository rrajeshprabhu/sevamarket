const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
        envVars[match[1].trim()] = match[2].trim();
    }
});

const SHOP = envVars.SHOPIFY_SHOP || 'seva-dev.myshopify.com';
const ACCESS_TOKEN = envVars.SHOPIFY_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
    console.error('Error: SHOPIFY_ACCESS_TOKEN not found in .env file');
    process.exit(1);
}

// Get the active theme ID first
function getActiveTheme() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SHOP,
            port: 443,
            path: '/admin/api/2024-01/themes.json',
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': ACCESS_TOKEN,
                'Content-Type': 'application/json',
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    const activeTheme = data.themes.find(t => t.role === 'main');
                    if (activeTheme) {
                        resolve(activeTheme.id);
                    } else {
                        reject(new Error('No active theme found'));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

// Upload the asset
function uploadAsset(themeId, key, value) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            asset: {
                key: key,
                value: value
            }
        });

        const options = {
            hostname: SHOP,
            port: 443,
            path: `/admin/api/2024-01/themes/${themeId}/assets.json`,
            method: 'PUT',
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
                console.log(`Status: ${res.statusCode}`);
                try {
                    const parsed = JSON.parse(body);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function main() {
    try {
        console.log('Getting active theme...');
        const themeId = await getActiveTheme();
        console.log(`Active theme ID: ${themeId}`);

        // Upload category-carousels.liquid
        const categoryPath = path.join(__dirname, '..', 'theme', 'sections', 'category-carousels.liquid');
        const categoryContent = fs.readFileSync(categoryPath, 'utf8');
        console.log('\nUploading sections/category-carousels.liquid...');
        const result1 = await uploadAsset(themeId, 'sections/category-carousels.liquid', categoryContent);
        if (result1.status === 200) {
            console.log('Successfully uploaded category-carousels.liquid!');
        } else {
            console.log('Upload failed:', JSON.stringify(result1.data, null, 2));
        }

        // Upload seller-carousels.liquid
        const sellerPath = path.join(__dirname, '..', 'theme', 'sections', 'seller-carousels.liquid');
        const sellerContent = fs.readFileSync(sellerPath, 'utf8');
        console.log('\nUploading sections/seller-carousels.liquid...');
        const result2 = await uploadAsset(themeId, 'sections/seller-carousels.liquid', sellerContent);
        if (result2.status === 200) {
            console.log('Successfully uploaded seller-carousels.liquid!');
        } else {
            console.log('Upload failed:', JSON.stringify(result2.data, null, 2));
        }

        console.log('\nDone!');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
