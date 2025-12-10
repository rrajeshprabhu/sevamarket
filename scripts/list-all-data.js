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

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SHOP,
            port: 443,
            path: path,
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
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve({ error: body });
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  Listing All Data in Seva Sethu Store                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    try {
        // Get products
        console.log('PRODUCTS:');
        console.log('─────────────────────────────────────────');
        const products = await makeRequest('/admin/api/2024-01/products.json?limit=250');
        if (products.products) {
            console.log(`Total: ${products.products.length} products\n`);
            products.products.forEach(p => {
                console.log(`  • ${p.title} (ID: ${p.id})`);
                console.log(`    Vendor: ${p.vendor}`);
                console.log(`    Status: ${p.status}`);
                console.log('');
            });
        }

        // Get custom collections
        console.log('\nCUSTOM COLLECTIONS:');
        console.log('─────────────────────────────────────────');
        const customCollections = await makeRequest('/admin/api/2024-01/custom_collections.json?limit=250');
        if (customCollections.custom_collections) {
            console.log(`Total: ${customCollections.custom_collections.length} custom collections\n`);
            customCollections.custom_collections.forEach(c => {
                console.log(`  • ${c.title} (ID: ${c.id})`);
            });
        }

        // Get smart collections
        console.log('\nSMART COLLECTIONS:');
        console.log('─────────────────────────────────────────');
        const smartCollections = await makeRequest('/admin/api/2024-01/smart_collections.json?limit=250');
        if (smartCollections.smart_collections) {
            console.log(`Total: ${smartCollections.smart_collections.length} smart collections\n`);
            smartCollections.smart_collections.forEach(c => {
                console.log(`  • ${c.title} (ID: ${c.id})`);
            });
        }

        // Summary
        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('SUMMARY - TO BE DELETED:');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log(`  Products:          ${products.products?.length || 0}`);
        console.log(`  Custom Collections: ${customCollections.custom_collections?.length || 0}`);
        console.log(`  Smart Collections:  ${smartCollections.smart_collections?.length || 0}`);
        console.log('═══════════════════════════════════════════════════════════════');

    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
