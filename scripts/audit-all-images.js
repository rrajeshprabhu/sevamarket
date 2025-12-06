const https = require('https');

const SHOP = 'seva-dev.myshopify.com';
const ACCESS_TOKEN = 'process.env.SHOPIFY_ACCESS_TOKEN';

function shopifyRequest(method, endpoint) {
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
        req.end();
    });
}

async function main() {
    console.log('=== FULL IMAGE AUDIT ===\n');

    const result = await shopifyRequest('GET', '/products.json?limit=250');
    const products = result.data.products || [];

    // Group by category for easier review
    const categories = {
        'FOOD & CATERING': [],
        'PIZZA': [],
        'BOOKS': [],
        'MUSIC LESSONS': [],
        'PUJA & DEITY': [],
        'GARLANDS': [],
        'PLANTS': [],
        'HEALTH & WELLNESS': [],
        'FINANCIAL': [],
        'EDUCATION': [],
        'YOGA': [],
        'REAL ESTATE': [],
        'OTHER': []
    };

    for (const p of products) {
        const title = p.title.toLowerCase();
        const type = (p.product_type || '').toLowerCase();
        const imageUrl = p.images?.[0]?.src || 'NO IMAGE';

        const item = {
            id: p.id,
            title: p.title,
            vendor: p.vendor,
            image: imageUrl,
            hasImage: p.images?.length > 0
        };

        if (title.includes('pizza') || title.includes('pasta') || title.includes('breadstick') || title.includes('tiramisu')) {
            categories['PIZZA'].push(item);
        } else if (title.includes('catering') || title.includes('feast') || title.includes('tiffin') || title.includes('wedding catering')) {
            categories['FOOD & CATERING'].push(item);
        } else if (title.includes('gita') || title.includes('bhagavatam') || title.includes('book') || title.includes('kirtan') && title.includes('cd')) {
            categories['BOOKS'].push(item);
        } else if (title.includes('lesson') || title.includes('class') || title.includes('harmonium') || title.includes('mridang') || title.includes('singing') || title.includes('music') || title.includes('kirtan workshop')) {
            categories['MUSIC LESSONS'].push(item);
        } else if (title.includes('puja') || title.includes('deity') || title.includes('aarti') || title.includes('incense') || title.includes('lamp')) {
            categories['PUJA & DEITY'].push(item);
        } else if (title.includes('garland') || title.includes('mala') || title.includes('marigold') || title.includes('rose') || title.includes('tulsi mala')) {
            categories['GARLANDS'].push(item);
        } else if (title.includes('tulsi') && (title.includes('plant') || title.includes('seed') || title.includes('pot'))) {
            categories['PLANTS'].push(item);
        } else if (title.includes('ayur') || title.includes('chyawan') || title.includes('oil') || title.includes('brahmi') || title.includes('tea')) {
            categories['HEALTH & WELLNESS'].push(item);
        } else if (title.includes('financial') || title.includes('tax') || title.includes('retirement') || title.includes('wealth')) {
            categories['FINANCIAL'].push(item);
        } else if (title.includes('college') || title.includes('sat') || title.includes('essay') || title.includes('interview prep')) {
            categories['EDUCATION'].push(item);
        } else if (title.includes('yoga') || title.includes('meditation') || title.includes('pranayama')) {
            categories['YOGA'].push(item);
        } else if (title.includes('home') || title.includes('property') || title.includes('rental') || title.includes('realty')) {
            categories['REAL ESTATE'].push(item);
        } else {
            categories['OTHER'].push(item);
        }
    }

    // Print all products with their images
    for (const [cat, items] of Object.entries(categories)) {
        if (items.length > 0) {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`${cat} (${items.length} products)`);
            console.log('='.repeat(60));

            for (const item of items) {
                console.log(`\nID: ${item.id}`);
                console.log(`Title: ${item.title}`);
                console.log(`Vendor: ${item.vendor}`);
                if (item.image !== 'NO IMAGE') {
                    // Extract key part of URL
                    const urlMatch = item.image.match(/photo-[^?]+/) || item.image.match(/\/([^\/]+)\?/);
                    console.log(`Image: ${urlMatch ? urlMatch[0] : item.image.substring(0, 80)}`);
                } else {
                    console.log('Image: NO IMAGE');
                }
            }
        }
    }
}

main().catch(console.error);
