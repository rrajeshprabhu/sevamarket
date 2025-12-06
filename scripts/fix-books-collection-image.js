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
    console.log('=== FIXING BOOKS & MEDIA COLLECTION IMAGE ===\n');

    // Get all smart collections
    const collectionsResult = await shopifyRequest('GET', '/smart_collections.json?limit=250');
    const collections = collectionsResult.data.smart_collections || [];

    // Find Books & Media collection
    const booksCollection = collections.find(c => c.handle === 'books-media-1' || c.title.toLowerCase().includes('books'));

    if (booksCollection) {
        console.log(`Found: ${booksCollection.title} (ID: ${booksCollection.id})`);

        // Try different spiritual book images
        const spiritualBookImages = [
            // Ancient manuscript/scripture style
            'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
            // Library/books
            'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800',
            // Old books
            'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800'
        ];

        for (const imageUrl of spiritualBookImages) {
            console.log(`Trying image: ${imageUrl.substring(0, 60)}...`);

            const result = await shopifyRequest('PUT', `/smart_collections/${booksCollection.id}.json`, {
                smart_collection: {
                    id: booksCollection.id,
                    image: {
                        src: imageUrl,
                        alt: 'Spiritual Books & Sacred Literature'
                    }
                }
            });

            if (result.status === 200) {
                console.log('✓ Books & Media collection image updated!');
                break;
            } else {
                console.log(`  Failed: ${result.status}, trying next...`);
            }

            await new Promise(r => setTimeout(r, 500));
        }
    } else {
        console.log('Books & Media collection not found');
    }
}

main().catch(console.error);
