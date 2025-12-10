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

async function getCollections() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SHOP,
            port: 443,
            path: '/admin/api/2024-01/custom_collections.json',
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

async function getSmartCollections() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SHOP,
            port: 443,
            path: '/admin/api/2024-01/smart_collections.json',
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
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  Checking Product Collections for Seva Sethu               ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    try {
        const customCollections = await getCollections();
        const smartCollections = await getSmartCollections();

        console.log('Custom Collections:');
        console.log('─────────────────────');
        if (customCollections.custom_collections && customCollections.custom_collections.length > 0) {
            customCollections.custom_collections.forEach(c => {
                console.log(`  • ${c.title} (ID: ${c.id})`);
            });
        } else {
            console.log('  No custom collections found');
        }

        console.log('\nSmart Collections:');
        console.log('─────────────────────');
        if (smartCollections.smart_collections && smartCollections.smart_collections.length > 0) {
            smartCollections.smart_collections.forEach(c => {
                console.log(`  • ${c.title} (ID: ${c.id})`);
            });
        } else {
            console.log('  No smart collections found');
        }

        const total = (customCollections.custom_collections?.length || 0) +
                      (smartCollections.smart_collections?.length || 0);
        console.log(`\nTotal collections: ${total}`);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
