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

function makeRequest(reqPath, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SHOP,
            port: 443,
            path: reqPath,
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('Updating Services category to Option B...\n');

    // Get all collections
    const result = await makeRequest('/admin/api/2024-01/custom_collections.json');
    const collections = result.data.custom_collections || [];

    // Find and rename "Services" to "Professional Services"
    const servicesCollection = collections.find(c => c.title === 'Services');
    
    if (servicesCollection) {
        console.log('1. Renaming "Services" to "Professional Services"...');
        const updateResult = await makeRequest(
            `/admin/api/2024-01/custom_collections/${servicesCollection.id}.json`,
            'PUT',
            {
                custom_collection: {
                    id: servicesCollection.id,
                    title: 'Professional Services',
                    body_html: 'Astrology, legal, immigration, tax preparation, and other professional services.'
                }
            }
        );
        
        if (updateResult.status === 200) {
            console.log('   ✓ Renamed to "Professional Services"\n');
        } else {
            console.log('   ✗ Failed:', updateResult.data);
        }
    }

    await sleep(200);

    // Create Financial Services
    console.log('2. Creating "Financial Services"...');
    const financialResult = await makeRequest('/admin/api/2024-01/custom_collections.json', 'POST', {
        custom_collection: {
            title: 'Financial Services',
            body_html: 'Financial planning, investment advice, tax services, and wealth management.',
            published: true
        }
    });
    
    if (financialResult.status === 201 || financialResult.status === 200) {
        console.log('   ✓ Created "Financial Services"\n');
    } else {
        console.log('   ✗ Failed:', financialResult.data);
    }

    await sleep(200);

    // Create Real Estate
    console.log('3. Creating "Real Estate"...');
    const realEstateResult = await makeRequest('/admin/api/2024-01/custom_collections.json', 'POST', {
        custom_collection: {
            title: 'Real Estate',
            body_html: 'Property services, home buying and selling, rentals, and real estate consulting.',
            published: true
        }
    });
    
    if (realEstateResult.status === 201 || realEstateResult.status === 200) {
        console.log('   ✓ Created "Real Estate"\n');
    } else {
        console.log('   ✗ Failed:', realEstateResult.data);
    }

    // List final categories
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('FINAL CATEGORY LIST:');
    console.log('═══════════════════════════════════════════════════════════════');
    
    const finalResult = await makeRequest('/admin/api/2024-01/custom_collections.json');
    const finalCollections = finalResult.data.custom_collections || [];
    
    finalCollections
        .filter(c => c.title !== 'Home page')
        .sort((a, b) => a.title.localeCompare(b.title))
        .forEach((c, i) => {
            console.log(`  ${i + 1}. ${c.title}`);
        });
    
    console.log(`\nTotal: ${finalCollections.filter(c => c.title !== 'Home page').length} categories`);
}

main();
