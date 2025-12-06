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
        console.log(`Updating: ${collection.title}`);

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
            console.log(`  ✓ Updated`);
            return true;
        } else {
            console.log(`  ✗ Failed: ${result.status}`);
            return false;
        }
    }
    return false;
}

async function main() {
    console.log('=== ADDING MISSING SELLER COLLECTION IMAGES ===\n');

    const collectionsResult = await shopifyRequest('GET', '/smart_collections.json?limit=250');
    const collections = collectionsResult.data.smart_collections || [];

    // Govinda's Catering - Indian vegetarian food
    await updateCollectionImage(
        collections,
        'govindas-catering',
        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800',
        "Govinda's Catering - Vegetarian Feasts"
    );
    await new Promise(r => setTimeout(r, 500));

    // Kasam Realty - Real estate
    await updateCollectionImage(
        collections,
        'kasam-realty',
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
        'Kasam Realty - Real Estate Services'
    );
    await new Promise(r => setTimeout(r, 500));

    // Radha Sangeet Music Academy - Indian music
    await updateCollectionImage(
        collections,
        'radha-sangeet-music-academy',
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
        'Radha Sangeet Music Academy'
    );
    await new Promise(r => setTimeout(r, 500));

    // Real Estate Services category
    await updateCollectionImage(
        collections,
        'real-estate-services-1',
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
        'Real Estate Services'
    );
    await new Promise(r => setTimeout(r, 500));

    // Shanti Yoga Studio
    await updateCollectionImage(
        collections,
        'shanti-yoga-studio',
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
        'Shanti Yoga Studio'
    );
    await new Promise(r => setTimeout(r, 500));

    // Vidya College Mentors
    await updateCollectionImage(
        collections,
        'vidya-college-mentors',
        'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
        'Vidya College Mentors'
    );
    await new Promise(r => setTimeout(r, 500));

    console.log('\n=== COMPLETE ===');
}

main().catch(console.error);
