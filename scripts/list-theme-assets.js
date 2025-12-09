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
const THEME_ID = 157097328865;

async function listAssets() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SHOP,
            port: 443,
            path: `/admin/api/2024-01/themes/${THEME_ID}/assets.json`,
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
                resolve(JSON.parse(body));
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function main() {
    console.log('Listing theme assets related to Webkul/Marketplace/Seller...\n');

    const result = await listAssets();
    const assets = result.assets || [];

    // Filter for marketplace/seller/webkul related files
    const keywords = ['seller', 'webkul', 'wk-', 'mp_', 'marketplace', 'vendor', 'multi'];

    const relevantAssets = assets.filter(a =>
        keywords.some(k => a.key.toLowerCase().includes(k))
    );

    if (relevantAssets.length > 0) {
        console.log('Found Webkul/Marketplace related files:\n');
        relevantAssets.forEach(a => console.log(`  ${a.key}`));
    } else {
        console.log('No Webkul/Marketplace related files found in theme.');
    }

    // Also list all sections
    console.log('\n\nAll sections in theme:\n');
    const sections = assets.filter(a => a.key.startsWith('sections/'));
    sections.forEach(a => console.log(`  ${a.key}`));

    // List all templates
    console.log('\n\nAll templates in theme:\n');
    const templates = assets.filter(a => a.key.startsWith('templates/'));
    templates.forEach(a => console.log(`  ${a.key}`));
}

main().catch(console.error);
