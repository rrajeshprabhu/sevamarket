const https = require('https');

const SHOP = 'seva-dev.myshopify.com';
const ACCESS_TOKEN = 'process.env.SHOPIFY_ACCESS_TOKEN';

function shopifyRequest(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SHOP,
            port: 443,
            path: `/admin/api/2024-01${endpoint}`,
            method: method,
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

// Missing collections (create without images to avoid upload errors)
const missingCollections = [
    { title: 'Education Services', type: 'product_type', match: 'Education Services' },
    { title: 'Puja Items', type: 'product_type', match: 'Puja Items' },
    { title: 'Vidya College Mentors', type: 'vendor', match: 'Vidya College Mentors' },
    { title: 'Deity Seva Store', type: 'vendor', match: 'Deity Seva Store' },
];

async function createSmartCollection(collection) {
    console.log(`Creating collection: ${collection.title}`);

    let rules = [];
    if (collection.type === 'product_type') {
        rules = [{
            column: 'type',
            relation: 'equals',
            condition: collection.match
        }];
    } else if (collection.type === 'vendor') {
        rules = [{
            column: 'vendor',
            relation: 'equals',
            condition: collection.match
        }];
    }

    const collectionData = {
        smart_collection: {
            title: collection.title,
            rules: rules,
            disjunctive: false,
            published: true
        }
    };

    const result = await shopifyRequest('POST', '/smart_collections.json', collectionData);

    if (result.status === 201 || result.status === 200) {
        console.log(`  ✓ Created: ${collection.title} (ID: ${result.data.smart_collection?.id})`);
        return result.data.smart_collection;
    } else {
        console.log(`  ✗ Failed: ${result.status} - ${JSON.stringify(result.data)}`);
        return null;
    }
}

async function main() {
    console.log('=== Creating Missing Collections ===\n');

    for (const collection of missingCollections) {
        await createSmartCollection(collection);
        await new Promise(r => setTimeout(r, 500));
    }

    // List all collections
    console.log('\n=== All Collections Now ===\n');
    const allCollections = await shopifyRequest('GET', '/smart_collections.json?limit=250');
    for (const col of (allCollections.data.smart_collections || [])) {
        console.log(`  - ${col.title}: /collections/${col.handle}`);
    }
}

main().catch(console.error);
