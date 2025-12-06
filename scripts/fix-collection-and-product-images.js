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
    console.log('=== FIXING COLLECTION AND PRODUCT IMAGES ===\n');

    // 1. First, let's get all collections and fix their images
    console.log('1. Fixing Collection Images...\n');

    const smartCollections = await shopifyRequest('GET', '/smart_collections.json?limit=250');
    const collections = smartCollections.data.smart_collections || [];

    // Collection image fixes - appropriate images for each
    const collectionImageFixes = {
        'books-media-1': {
            // Ancient scriptures/sacred texts
            image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800',
            alt: 'Sacred Scriptures and Books'
        },
        'puja-items': {
            // Puja thali with diya and flowers
            image: 'https://images.unsplash.com/photo-1609941079978-f7f1eb8f6d29?w=800',
            alt: 'Puja Items and Accessories'
        },
        'garlands-malas': {
            // Fresh flower garlands - marigold
            image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800',
            alt: 'Fresh Flower Garlands'
        },
        'health-wellness-1': {
            // Ayurvedic herbs and wellness
            image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800',
            alt: 'Ayurvedic Health Products'
        },
        'plants-garden': {
            // Tulsi/basil plant
            image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
            alt: 'Sacred Plants and Garden'
        },
        'catering-food': {
            // Indian vegetarian food thali
            image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800',
            alt: 'Vegetarian Catering'
        },
        'financial-services': {
            // Financial planning
            image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
            alt: 'Financial Services'
        },
        'education-services': {
            // Education/graduation
            image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
            alt: 'Education Services'
        },
        'music-lessons': {
            // Indian classical music/instruments
            image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
            alt: 'Music Lessons'
        },
        'yoga-wellness': {
            // Yoga meditation
            image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
            alt: 'Yoga and Wellness'
        }
    };

    for (const collection of collections) {
        const fix = collectionImageFixes[collection.handle];
        if (fix) {
            console.log(`Updating collection: ${collection.title}`);

            const result = await shopifyRequest('PUT', `/smart_collections/${collection.id}.json`, {
                smart_collection: {
                    id: collection.id,
                    image: {
                        src: fix.image,
                        alt: fix.alt
                    }
                }
            });

            if (result.status === 200) {
                console.log(`  ✓ Fixed: ${collection.title}`);
            } else {
                console.log(`  ✗ Failed: ${result.status}`);
            }

            await new Promise(r => setTimeout(r, 500));
        }
    }

    // 2. Fix Bhagavad Gita product images
    console.log('\n2. Fixing Bhagavad Gita Product Images...\n');

    const gitaProducts = [9282274328801, 9282264498401];

    for (const productId of gitaProducts) {
        // Delete existing images
        const imagesResult = await shopifyRequest('GET', `/products/${productId}/images.json`);
        const images = imagesResult.data.images || [];

        for (const img of images) {
            await shopifyRequest('DELETE', `/products/${productId}/images/${img.id}.json`);
        }
        console.log(`  Deleted old images for product ${productId}`);

        // Add proper Bhagavad Gita image - use a more specific spiritual/Hindu scripture image
        const addResult = await shopifyRequest('POST', `/products/${productId}/images.json`, {
            image: {
                // Sanskrit text / ancient scripture style
                src: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
                alt: 'Bhagavad Gita As It Is'
            }
        });

        if (addResult.status === 200 || addResult.status === 201) {
            console.log(`  ✓ Fixed Bhagavad Gita image for product ${productId}`);
        } else {
            console.log(`  ✗ Failed: ${addResult.status}`);
        }

        await new Promise(r => setTimeout(r, 500));
    }

    // 3. Check for and remove duplicate products
    console.log('\n3. Checking for Duplicate Products...\n');

    const allProducts = await shopifyRequest('GET', '/products.json?limit=250');
    const products = allProducts.data.products || [];

    // Find duplicates by title
    const titleCount = {};
    const duplicates = [];

    for (const p of products) {
        const title = p.title.toLowerCase().trim();
        if (titleCount[title]) {
            titleCount[title].push(p);
        } else {
            titleCount[title] = [p];
        }
    }

    for (const [title, prods] of Object.entries(titleCount)) {
        if (prods.length > 1) {
            console.log(`Duplicate: "${prods[0].title}" (${prods.length} copies)`);
            // Keep the first one, mark others for review
            for (let i = 1; i < prods.length; i++) {
                duplicates.push(prods[i]);
            }
        }
    }

    if (duplicates.length > 0) {
        console.log(`\nFound ${duplicates.length} duplicate products.`);
        console.log('Duplicate product IDs (can be deleted):');
        for (const dup of duplicates) {
            console.log(`  - ${dup.id}: ${dup.title} (Vendor: ${dup.vendor})`);
        }
    } else {
        console.log('No duplicates found.');
    }

    console.log('\n=== ALL FIXES COMPLETE ===');
}

main().catch(console.error);
