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

async function main() {
    console.log('=== FIXING HEALTH & WELLNESS COLLECTION IMAGE ===\n');

    // Get all smart collections
    const collectionsResult = await shopifyRequest('GET', '/smart_collections.json?limit=250');
    const collections = collectionsResult.data.smart_collections || [];

    // Find Health & Wellness collection
    const wellnessCollection = collections.find(c =>
        c.handle === 'health-wellness-1' ||
        c.title.toLowerCase().includes('health') ||
        c.title.toLowerCase().includes('wellness')
    );

    if (wellnessCollection) {
        console.log(`Found: ${wellnessCollection.title} (ID: ${wellnessCollection.id})`);

        // Ayurveda/traditional Indian wellness images
        const ayurvedaImages = [
            // Ayurvedic herbs and spices
            'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800',
            // Herbal medicine/mortar pestle
            'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800',
            // Natural herbs
            'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800',
            // Wellness herbs in bowls
            'https://images.unsplash.com/photo-1540845511934-7721dd7adec3?w=800'
        ];

        for (const imageUrl of ayurvedaImages) {
            console.log(`Trying image: ${imageUrl.substring(0, 60)}...`);

            const result = await shopifyRequest('PUT', `/smart_collections/${wellnessCollection.id}.json`, {
                smart_collection: {
                    id: wellnessCollection.id,
                    image: {
                        src: imageUrl,
                        alt: 'Ayurvedic Health & Wellness Products'
                    }
                }
            });

            if (result.status === 200) {
                console.log('✓ Health & Wellness collection image updated!');
                break;
            } else {
                console.log(`  Failed: ${result.status}, trying next...`);
            }

            await new Promise(r => setTimeout(r, 500));
        }
    } else {
        console.log('Health & Wellness collection not found');
    }
}

main().catch(console.error);
