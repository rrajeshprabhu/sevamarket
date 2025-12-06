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

async function updateCollectionImage(collections, handle, imageUrl, altText) {
    const collection = collections.find(c => c.handle === handle);
    if (collection) {
        console.log(`Updating: ${collection.title} (${handle})`);

        const result = await shopifyRequest('PUT', `/smart_collections/${collection.id}.json`, {
            smart_collection: {
                id: collection.id,
                image: {
                    src: imageUrl,
                    alt: altText
                }
            }
        });

        if (result.status === 200) {
            console.log(`  ✓ Updated successfully`);
            return true;
        } else {
            console.log(`  ✗ Failed: ${result.status}`);
            return false;
        }
    } else {
        console.log(`  ✗ Collection not found: ${handle}`);
        return false;
    }
}

async function main() {
    console.log('=== FIXING COLLECTION IMAGES ===\n');

    // Get all smart collections
    const collectionsResult = await shopifyRequest('GET', '/smart_collections.json?limit=250');
    const collections = collectionsResult.data.smart_collections || [];

    console.log(`Found ${collections.length} collections\n`);

    // Fix Health & Wellness - Ayurvedic herbs/spices image
    await updateCollectionImage(
        collections,
        'health-wellness-1',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        'Ayurvedic Herbs and Wellness'
    );
    await new Promise(r => setTimeout(r, 500));

    // Fix Deity Seva Store - Puja items, diya, temple items
    await updateCollectionImage(
        collections,
        'deity-seva-store',
        'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=800',
        'Deity Seva Store - Puja Items'
    );
    await new Promise(r => setTimeout(r, 500));

    // Fix Govinda Books - Ancient books/scriptures
    await updateCollectionImage(
        collections,
        'govinda-books',
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
        'Govinda Books - Sacred Scriptures'
    );
    await new Promise(r => setTimeout(r, 500));

    // Also fix Garlands & Malas if it has rainbow roses
    await updateCollectionImage(
        collections,
        'garlands-malas',
        'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800',
        'Fresh Flower Garlands and Malas'
    );
    await new Promise(r => setTimeout(r, 500));

    // Fix Plants & Garden - should be Tulsi/green plants
    await updateCollectionImage(
        collections,
        'plants-garden',
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
        'Sacred Plants and Garden'
    );
    await new Promise(r => setTimeout(r, 500));

    // Fix Vrindavan Garlands
    await updateCollectionImage(
        collections,
        'vrindavan-garlands',
        'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800',
        'Vrindavan Garlands - Fresh Flowers'
    );
    await new Promise(r => setTimeout(r, 500));

    // Fix Prabhu Pizza - vegetarian pizza
    await updateCollectionImage(
        collections,
        'prabhu-pizza',
        'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
        'Prabhu Pizza - Sattvic Italian'
    );
    await new Promise(r => setTimeout(r, 500));

    // List all collections and their current images
    console.log('\n=== ALL COLLECTIONS ===\n');
    const updatedCollections = await shopifyRequest('GET', '/smart_collections.json?limit=250');
    for (const col of updatedCollections.data.smart_collections || []) {
        const hasImage = col.image ? 'Has image' : 'NO IMAGE';
        console.log(`${col.title} (${col.handle}): ${hasImage}`);
    }

    console.log('\n=== COMPLETE ===');
}

main().catch(console.error);
