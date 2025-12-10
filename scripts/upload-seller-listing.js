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
const THEME_ID = '168aborede195038561';

async function getThemeId() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SHOP,
            port: 443,
            path: '/admin/api/2024-01/themes.json',
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': ACCESS_TOKEN,
                'Content-Type': 'application/json'
            }
        };
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                const data = JSON.parse(body);
                const mainTheme = data.themes.find(t => t.role === 'main');
                resolve(mainTheme ? mainTheme.id : null);
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function uploadAsset(themeId, key, value) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            asset: { key: key, value: value }
        });
        
        const options = {
            hostname: SHOP,
            port: 443,
            path: '/admin/api/2024-01/themes/' + themeId + '/assets.json',
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
            res.on('end', () => resolve({ status: res.statusCode, data: body }));
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function main() {
    console.log('Uploading updated seller listing...\n');
    
    const themeId = await getThemeId();
    console.log('Theme ID: ' + themeId);
    
    const filePath = path.join(__dirname, '..', 'theme', 'snippets', 'wk-seller-listing-variable.liquid');
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log('Uploading: snippets/wk-seller-listing-variable.liquid');
    const result = await uploadAsset(themeId, 'snippets/wk-seller-listing-variable.liquid', content);
    
    if (result.status === 200) {
        console.log('✓ Uploaded successfully!');
    } else {
        console.log('✗ Failed: ' + result.status);
        console.log(result.data);
    }
}

main().catch(console.error);
