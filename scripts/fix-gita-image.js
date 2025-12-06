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
    console.log('=== FIXING BHAGAVAD GITA IMAGE ===\n');

    // Use the actual BBT/ISKCON Bhagavad Gita As It Is cover image from a public source
    // This is Srila Prabhupada's original book cover - orange with Krishna and Arjuna
    const gitaImageUrl = 'https://m.media-amazon.com/images/I/81P7kKJuoxL._AC_UF1000,1000_QL80_.jpg';

    const gitaProducts = [9282274328801, 9282264498401];

    for (const productId of gitaProducts) {
        console.log(`Fixing product ${productId}...`);

        // Delete existing images
        const imagesResult = await shopifyRequest('GET', `/products/${productId}/images.json`);
        const images = imagesResult.data.images || [];

        for (const img of images) {
            await shopifyRequest('DELETE', `/products/${productId}/images/${img.id}.json`);
        }
        console.log('  Deleted old images');

        // Add the correct Bhagavad Gita As It Is cover
        const addResult = await shopifyRequest('POST', `/products/${productId}/images.json`, {
            image: {
                src: gitaImageUrl,
                alt: 'Bhagavad Gita As It Is by Srila Prabhupada'
            }
        });

        if (addResult.status === 200 || addResult.status === 201) {
            console.log('  ✓ Added Srila Prabhupada\'s Bhagavad Gita cover');
        } else {
            console.log(`  ✗ Failed: ${addResult.status}`);
            // Try alternate source
            console.log('  Trying alternate image source...');

            const altResult = await shopifyRequest('POST', `/products/${productId}/images.json`, {
                image: {
                    src: 'https://images-na.ssl-images-amazon.com/images/I/91HH9VNY8eL.jpg',
                    alt: 'Bhagavad Gita As It Is by Srila Prabhupada'
                }
            });

            if (altResult.status === 200 || altResult.status === 201) {
                console.log('  ✓ Added alternate Bhagavad Gita cover');
            } else {
                console.log(`  ✗ Alternate also failed: ${altResult.status}`);
            }
        }

        await new Promise(r => setTimeout(r, 500));
    }

    // Also fix Srimad Bhagavatam with proper book set image
    console.log('\n=== FIXING SRIMAD BHAGAVATAM IMAGE ===\n');

    const bhagavatamProducts = [9282264531169, 9282274459873];

    for (const productId of bhagavatamProducts) {
        console.log(`Fixing product ${productId}...`);

        // Delete existing images
        const imagesResult = await shopifyRequest('GET', `/products/${productId}/images.json`);
        const images = imagesResult.data.images || [];

        for (const img of images) {
            await shopifyRequest('DELETE', `/products/${productId}/images/${img.id}.json`);
        }

        // Add Srimad Bhagavatam set image
        const addResult = await shopifyRequest('POST', `/products/${productId}/images.json`, {
            image: {
                src: 'https://m.media-amazon.com/images/I/51MKMWT0YML.jpg',
                alt: 'Srimad Bhagavatam Set by Srila Prabhupada'
            }
        });

        if (addResult.status === 200 || addResult.status === 201) {
            console.log('  ✓ Added Srimad Bhagavatam set image');
        } else {
            // Try generic spiritual book stack
            const altResult = await shopifyRequest('POST', `/products/${productId}/images.json`, {
                image: {
                    src: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
                    alt: 'Srimad Bhagavatam Complete Set'
                }
            });

            if (altResult.status === 200 || altResult.status === 201) {
                console.log('  ✓ Added book stack image');
            }
        }

        await new Promise(r => setTimeout(r, 500));
    }

    console.log('\n=== DONE ===');
    console.log('\nNote: If Amazon/external images fail to load, you may need to:');
    console.log('1. Download the actual book cover images');
    console.log('2. Upload them directly via Shopify Admin → Products → Edit Product → Add Image');
}

main().catch(console.error);
