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

async function main() {
    console.log('Updating "Music & Instruments" to "Music & Instrument Learning"...\n');

    // Get all collections
    const result = await makeRequest('/admin/api/2024-01/custom_collections.json');
    const collections = result.data.custom_collections || [];

    // Find Music & Instruments
    const musicCollection = collections.find(c => c.title === 'Music & Instruments');
    
    if (musicCollection) {
        const updateResult = await makeRequest(
            `/admin/api/2024-01/custom_collections/${musicCollection.id}.json`,
            'PUT',
            {
                custom_collection: {
                    id: musicCollection.id,
                    title: 'Music & Instrument Learning',
                    body_html: 'Musical instruments, music lessons, kirtan training, and vocal classes.'
                }
            }
        );
        
        if (updateResult.status === 200) {
            console.log('✓ Updated successfully!');
            console.log(`  Old: Music & Instruments`);
            console.log(`  New: Music & Instrument Learning`);
        } else {
            console.log('✗ Failed:', updateResult.data);
        }
    } else {
        console.log('Could not find "Music & Instruments" collection');
        console.log('Existing collections:');
        collections.forEach(c => console.log(`  - ${c.title}`));
    }
}

main();
