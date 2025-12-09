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

// Read header-group.json
const filePath = path.join(__dirname, '..', 'theme', 'sections', 'header-group.json');
const fileContent = fs.readFileSync(filePath, 'utf8');

// Get active theme and upload
async function main() {
    // Get active theme
    const themeId = await new Promise((resolve, reject) => {
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
                const active = data.themes.find(t => t.role === 'main');
                resolve(active.id);
            });
        });
        req.on('error', reject);
        req.end();
    });

    console.log('Theme ID:', themeId);

    // Upload file
    const data = JSON.stringify({
        asset: {
            key: 'sections/header-group.json',
            value: fileContent
        }
    });

    const result = await new Promise((resolve, reject) => {
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
                console.log('Status:', res.statusCode);
                resolve(JSON.parse(body));
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });

    if (result.asset) {
        console.log('Successfully updated announcement bar!');
    } else {
        console.log('Error:', result);
    }
}

main();
