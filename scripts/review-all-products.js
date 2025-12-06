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
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║  Reviewing All Products & Images                   ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    // Get all products
    const result = await shopifyRequest('GET', '/products.json?limit=250');
    const products = result.data.products || [];

    console.log(`Found ${products.length} total products\n`);

    // Categorize products for review
    const categories = {
        'Music/Lessons': [],
        'Food/Catering': [],
        'Books/Media': [],
        'Puja/Spiritual': [],
        'Health/Wellness': [],
        'Plants/Garden': [],
        'Financial': [],
        'Education': [],
        'Other': []
    };

    // Keywords to identify problematic content
    const musicKeywords = ['mridanga', 'harmonium', 'kirtan', 'music', 'lesson', 'instrument', 'drum', 'tabla'];
    const foodKeywords = ['food', 'catering', 'feast', 'tiffin', 'pizza', 'prasadam', 'lunch', 'dinner', 'meal', 'cooking'];
    const caffeineKeywords = ['coffee', 'tea', 'chai', 'caffeine'];

    for (const product of products) {
        const title = product.title.toLowerCase();
        const type = (product.product_type || '').toLowerCase();
        const imageUrl = product.images?.[0]?.src || 'NO IMAGE';

        let category = 'Other';

        if (musicKeywords.some(k => title.includes(k) || type.includes(k))) {
            category = 'Music/Lessons';
        } else if (foodKeywords.some(k => title.includes(k) || type.includes(k))) {
            category = 'Food/Catering';
        } else if (title.includes('book') || title.includes('gita') || title.includes('bhagavatam') || type.includes('book')) {
            category = 'Books/Media';
        } else if (title.includes('puja') || title.includes('deity') || title.includes('aarti') || title.includes('incense') || title.includes('garland') || title.includes('mala')) {
            category = 'Puja/Spiritual';
        } else if (title.includes('tulsi') || title.includes('plant') || title.includes('seed') || title.includes('garden')) {
            category = 'Plants/Garden';
        } else if (title.includes('ayur') || title.includes('wellness') || title.includes('oil') || title.includes('chyawan')) {
            category = 'Health/Wellness';
        } else if (title.includes('financial') || title.includes('planning') || title.includes('tax') || title.includes('wealth') || title.includes('retirement')) {
            category = 'Financial';
        } else if (title.includes('college') || title.includes('essay') || title.includes('sat') || title.includes('interview') || title.includes('mentor')) {
            category = 'Education';
        }

        categories[category].push({
            id: product.id,
            title: product.title,
            type: product.product_type,
            vendor: product.vendor,
            handle: product.handle,
            image: imageUrl,
            hasImage: product.images?.length > 0
        });
    }

    // Print categorized products
    for (const [cat, prods] of Object.entries(categories)) {
        if (prods.length > 0) {
            console.log(`\n=== ${cat} (${prods.length} products) ===`);
            for (const p of prods) {
                console.log(`  ${p.id}: ${p.title}`);
                console.log(`     Type: ${p.type || 'N/A'} | Vendor: ${p.vendor}`);
                console.log(`     Image: ${p.hasImage ? 'Yes' : 'NO IMAGE'}`);
                if (p.image !== 'NO IMAGE') {
                    // Show shortened URL
                    const shortUrl = p.image.substring(0, 80) + '...';
                    console.log(`     URL: ${shortUrl}`);
                }
            }
        }
    }

    // Identify products that need image fixes
    console.log('\n\n╔════════════════════════════════════════════════════╗');
    console.log('║  Products Needing Image Review                     ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    const needsReview = [];

    for (const product of products) {
        const title = product.title.toLowerCase();
        const imageUrl = product.images?.[0]?.src || '';

        // Check for music lessons with wrong images
        if (title.includes('mridanga') && !imageUrl.includes('mridanga')) {
            needsReview.push({ product, issue: 'Mridanga lesson needs mridanga/khol drum image' });
        }
        if (title.includes('harmonium') && (imageUrl.includes('piano') || !imageUrl.includes('harmonium'))) {
            needsReview.push({ product, issue: 'Harmonium lesson needs Indian harmonium image' });
        }
        if (title.includes('tabla') && !imageUrl.includes('tabla')) {
            needsReview.push({ product, issue: 'Tabla lesson needs tabla image' });
        }

        // Check for caffeine products
        if (title.includes('coffee') || title.includes('caffeine')) {
            needsReview.push({ product, issue: 'Contains caffeine - should be removed or renamed' });
        }
        if (title.includes('tea') && !title.includes('tulsi')) {
            // Regular tea might have caffeine
            needsReview.push({ product, issue: 'Tea product - verify it is herbal/caffeine-free' });
        }
    }

    for (const item of needsReview) {
        console.log(`- ${item.product.title} (ID: ${item.product.id})`);
        console.log(`  Issue: ${item.issue}`);
    }

    if (needsReview.length === 0) {
        console.log('No obvious issues found in product titles.');
    }

    console.log('\n=== Products by Vendor ===\n');
    const vendors = {};
    for (const p of products) {
        const v = p.vendor || 'Unknown';
        if (!vendors[v]) vendors[v] = [];
        vendors[v].push(p.title);
    }
    for (const [vendor, prods] of Object.entries(vendors)) {
        console.log(`${vendor}: ${prods.length} products`);
    }
}

main().catch(console.error);
