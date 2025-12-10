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

function shopifyRequest(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SHOP,
            port: 443,
            path: '/admin/api/2024-01' + endpoint,
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

// Product images - education/school themed
const productImages = {
    'monthly-school-enrollment': {
        url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
        alt: 'Children learning in classroom'
    },
    'annual-school-enrollment': {
        url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800',
        alt: 'Happy children at school'
    },
    'summer-camp-program--4-weeks-': {
        url: 'https://images.unsplash.com/photo-1472898965229-f9b06b9c9bbe?w=800',
        alt: 'Children at summer camp outdoors'
    },
    'trial-week': {
        url: 'https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=800',
        alt: 'Child exploring and learning'
    },
    'parent-child-workshop--weekend-': {
        url: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800',
        alt: 'Parent and child learning together'
    }
};

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  Adding Images & Collections to Wisdom Seedlings Products  ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Step 1: Get all products
    console.log('Step 1: Getting products...');
    const productsResult = await shopifyRequest('GET', '/products.json?vendor=Wisdom+Seedlings');

    // If no products with that vendor, get all and filter
    let products = productsResult.data.products || [];

    if (products.length === 0) {
        const allProducts = await shopifyRequest('GET', '/products.json?limit=250');
        products = (allProducts.data.products || []).filter(p =>
            p.title.includes('Enrollment') ||
            p.title.includes('Summer Camp') ||
            p.title.includes('Trial Week') ||
            p.title.includes('Workshop')
        );
    }

    console.log('Found ' + products.length + ' Wisdom Seedlings products\n');

    // Step 2: Get Education & Courses collection
    console.log('Step 2: Finding Education & Courses collection...');
    const collectionsResult = await shopifyRequest('GET', '/custom_collections.json');
    const educationCollection = (collectionsResult.data.custom_collections || [])
        .find(c => c.title === 'Education & Courses');

    if (!educationCollection) {
        console.log('ERROR: Education & Courses collection not found!');
        return;
    }
    console.log('Found: ' + educationCollection.title + ' (ID: ' + educationCollection.id + ')\n');

    // Step 3: Add images and assign to collection
    console.log('Step 3: Adding images and assigning to collection...\n');

    for (const product of products) {
        console.log('Processing: ' + product.title);

        // Find matching image
        const handle = product.handle;
        const imageData = productImages[handle];

        // Add image if we have one and product doesn't have images
        if (imageData && (!product.images || product.images.length === 0)) {
            console.log('  Adding image...');
            const imageResult = await shopifyRequest('POST', '/products/' + product.id + '/images.json', {
                image: {
                    src: imageData.url,
                    alt: imageData.alt
                }
            });

            if (imageResult.status === 200 || imageResult.status === 201) {
                console.log('  ✓ Image added');
            } else {
                console.log('  ✗ Image failed: ' + imageResult.status);
            }
            await sleep(300);
        } else if (product.images && product.images.length > 0) {
            console.log('  ⏭ Already has image');
        }

        // Add to collection
        console.log('  Adding to Education & Courses...');
        const collectResult = await shopifyRequest('POST', '/collects.json', {
            collect: {
                product_id: product.id,
                collection_id: educationCollection.id
            }
        });

        if (collectResult.status === 200 || collectResult.status === 201) {
            console.log('  ✓ Added to collection');
        } else if (collectResult.status === 422) {
            console.log('  ⏭ Already in collection');
        } else {
            console.log('  ✗ Collection failed: ' + collectResult.status);
        }

        await sleep(300);
        console.log('');
    }

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  COMPLETE!                                                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\nView products at:');
    console.log('  https://' + SHOP + '/collections/education-courses');
}

main().catch(console.error);
