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
const WEBKUL_ACCESS_TOKEN = 'ODk3OTlhYWI2ZWZjM2Y2MTQ2MjZjYjFiYmMxZjM3NGE0MDkzYzk0MTZkMjBiY2JlMmI1MTZmODhlY2ZkNGRmMQ';

function webkulRequest(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
        const postData = data ? JSON.stringify(data) : null;
        const options = {
            hostname: 'mvmapi.webkul.com',
            port: 443,
            path: endpoint,
            method: method,
            headers: {
                'Authorization': 'Bearer ' + WEBKUL_ACCESS_TOKEN,
                'Content-Type': 'application/json',
                'shop': SHOP
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
        if (postData) req.write(postData);
        req.end();
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// New Sellers
const sellers = [
    {
        // Seller info
        sp_store_name: 'College Prep by Ayan',
        seller_name: 'Ayan Gupta',
        email: 'ayan.gupta@sevasethu.com',
        password: 'Seva2024!',
        state: 'CA',
        country: 'US',
        country_code: '1',
        contact: '555-0301',
        send_welcome_email: '0',
        send_email_verification_link: '0',
        // Products
        productType: 'Education Services',
        products: [
            {
                name: '1-Week Mentoring Session (1 hour)',
                price: '75.00',
                sku: 'AG-1WEEK-001',
                desc: 'One-on-one college prep mentoring session. Perfect for students with specific questions about college applications, major selection, or career planning. Each session is 1 hour via Zoom.',
                tags: 'college-prep,mentoring,education',
                requireShipping: '0'
            },
            {
                name: '2-Week Mentoring Package (2 sessions)',
                price: '140.00',
                sku: 'AG-2WEEK-001',
                desc: 'Two 1-hour mentoring sessions over 2 weeks. Ideal for deeper guidance on college selection, application strategy, and interview preparation. Includes email support between sessions.',
                tags: 'college-prep,mentoring,education',
                requireShipping: '0'
            },
            {
                name: 'College Essay Review - Single Essay',
                price: '50.00',
                sku: 'AG-ESSAY-1',
                desc: 'Comprehensive review of your college application essay. Includes detailed feedback on structure, content, grammar, and impact. Turnaround within 3-5 business days. One round of revision included.',
                tags: 'college-prep,essay,review,education',
                requireShipping: '0'
            },
            {
                name: 'College Essay Review - 3 Essay Package',
                price: '120.00',
                sku: 'AG-ESSAY-3',
                desc: 'Review of 3 college application essays. Includes detailed feedback and one round of revisions for each essay. Great value for students applying to multiple schools.',
                tags: 'college-prep,essay,review,education',
                requireShipping: '0'
            },
            {
                name: 'Open Q&A Session (1 hour)',
                price: '60.00',
                sku: 'AG-QA-001',
                desc: 'Bring your questions! Open format 1-hour session for any college prep questions - applications, scholarships, SAT/ACT prep strategies, extracurriculars, or college life.',
                tags: 'college-prep,qa,education',
                requireShipping: '0'
            }
        ]
    },
    {
        // Seller info
        sp_store_name: 'Eco Party Supplies',
        seller_name: 'Vinay Prabhu',
        email: 'vinay.prabhu@sevasethu.com',
        password: 'Seva2024!',
        state: 'CA',
        country: 'US',
        country_code: '1',
        contact: '555-0302',
        send_welcome_email: '0',
        send_email_verification_link: '0',
        // Products
        productType: 'Party Supplies',
        products: [
            {
                name: 'Areca Palm Leaf Plates - Round 10 inch (25 pack)',
                price: '15.00',
                sku: 'VP-PLT10-25',
                desc: '25 plates. 100% natural and biodegradable plates made from fallen areca palm leaves. Sturdy, leak-proof, and microwave safe. Perfect for events and parties.',
                tags: 'eco-friendly,plates,disposable,events',
                requireShipping: '1'
            },
            {
                name: 'Areca Palm Leaf Plates - Round 10 inch (50 pack)',
                price: '28.00',
                sku: 'VP-PLT10-50',
                desc: '50 plates. 100% natural and biodegradable plates made from fallen areca palm leaves. Sturdy, leak-proof, and microwave safe. Perfect for events and parties.',
                tags: 'eco-friendly,plates,disposable,events',
                requireShipping: '1'
            },
            {
                name: 'Areca Palm Leaf Plates - Round 10 inch (100 pack)',
                price: '52.00',
                sku: 'VP-PLT10-100',
                desc: '100 plates. 100% natural and biodegradable plates made from fallen areca palm leaves. Sturdy, leak-proof, and microwave safe. Best value for large events!',
                tags: 'eco-friendly,plates,disposable,events',
                requireShipping: '1'
            },
            {
                name: 'Areca Palm Leaf Plates - Square 8 inch (50 pack)',
                price: '22.00',
                sku: 'VP-PLT8S-50',
                desc: '50 square plates. Elegant design made from fallen areca palm leaves. Great for appetizers and desserts. 100% compostable.',
                tags: 'eco-friendly,plates,disposable,events',
                requireShipping: '1'
            },
            {
                name: 'Sugarcane Bagasse Cups 12oz (50 pack)',
                price: '14.00',
                sku: 'VP-CUP12-50',
                desc: '50 cups. Sturdy cups made from sugarcane fiber. Hot and cold beverage safe. 100% compostable. Perfect for chai, coffee, or cold drinks.',
                tags: 'eco-friendly,cups,disposable,events',
                requireShipping: '1'
            },
            {
                name: 'Sugarcane Bagasse Cups 12oz (100 pack)',
                price: '25.00',
                sku: 'VP-CUP12-100',
                desc: '100 cups. Sturdy cups made from sugarcane fiber. Hot and cold beverage safe. 100% compostable. Great value pack!',
                tags: 'eco-friendly,cups,disposable,events',
                requireShipping: '1'
            },
            {
                name: 'Bamboo Cutlery Set - Fork, Spoon, Knife (50 sets)',
                price: '32.00',
                sku: 'VP-CUT-50',
                desc: '50 complete cutlery sets. Each set includes fork, spoon, and knife. Premium bamboo, strong and splinter-free. Fully biodegradable.',
                tags: 'eco-friendly,cutlery,disposable,events',
                requireShipping: '1'
            },
            {
                name: 'Event Bundle - 50 Guests Complete Pack',
                price: '99.00',
                sku: 'VP-BUNDLE-50',
                desc: 'Complete eco-friendly party pack for 50 guests! Includes: 50 round plates (10"), 50 square plates (8"), 50 cups, and 50 cutlery sets. Save 15% vs buying separately!',
                tags: 'eco-friendly,bundle,events,value-pack',
                requireShipping: '1'
            },
            {
                name: 'Event Bundle - 100 Guests Complete Pack',
                price: '175.00',
                sku: 'VP-BUNDLE-100',
                desc: 'Complete eco-friendly party pack for 100 guests! Includes: 100 round plates (10"), 100 square plates (8"), 100 cups, and 100 cutlery sets. Save 20% vs buying separately!',
                tags: 'eco-friendly,bundle,events,value-pack',
                requireShipping: '1'
            }
        ]
    }
];

async function createSeller(seller) {
    console.log('\nCreating seller: ' + seller.seller_name);

    const sellerData = {
        sp_store_name: seller.sp_store_name,
        seller_name: seller.seller_name,
        email: seller.email,
        password: seller.password,
        state: seller.state,
        country: seller.country,
        country_code: seller.country_code,
        contact: seller.contact,
        send_welcome_email: seller.send_welcome_email,
        send_email_verification_link: seller.send_email_verification_link
    };

    const result = await webkulRequest('POST', '/api/v2/sellers.json', sellerData);

    if (result.status === 200 || result.status === 201) {
        const sellerId = result.data.seller ? result.data.seller.id : result.data.id;
        console.log('  ✓ Seller created! ID: ' + sellerId);
        return sellerId;
    } else {
        console.log('  ✗ Failed: ' + result.status);
        console.log('    ' + JSON.stringify(result.data).substring(0, 300));
        return null;
    }
}

async function createProduct(sellerId, product, productType) {
    console.log('  Creating: ' + product.name);

    const productData = {
        seller_id: sellerId.toString(),
        type: '1',
        product_name: product.name,
        product_type: productType,
        product_tag: product.tags,
        product_description: product.desc,
        handle: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50),
        variants: [{
            sku: product.sku,
            price: product.price,
            quantity: product.requireShipping === '1' ? '100' : '999',
            track_inventory: product.requireShipping === '1' ? '1' : '0',
            require_shipping: product.requireShipping,
            taxable: product.requireShipping
        }],
        options: [{
            name: 'Title',
            values: 'Default'
        }]
    };

    const result = await webkulRequest('POST', '/api/v2/products.json', productData);

    if (result.status === 200 || result.status === 201) {
        console.log('    ✓ Created');
        return true;
    } else {
        console.log('    ✗ Failed: ' + result.status + ' - ' + JSON.stringify(result.data).substring(0, 100));
        return false;
    }
}

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  Creating Sellers: Ayan Gupta & Vinay Prabhu               ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    let totalProducts = 0;

    for (const seller of sellers) {
        console.log('\n' + '═'.repeat(60));

        const sellerId = await createSeller(seller);
        await sleep(1000);

        if (sellerId) {
            console.log('\n  Creating products for ' + seller.seller_name + '...');

            for (const product of seller.products) {
                await sleep(1000);
                const created = await createProduct(sellerId, product, seller.productType);
                if (created) totalProducts++;
            }
        }
    }

    // Sync sellers to theme
    console.log('\n' + '═'.repeat(60));
    console.log('Syncing sellers to theme...');
    console.log('═'.repeat(60));

    await sleep(1000);

    // Get updated seller list
    const sellersResult = await webkulRequest('GET', '/api/v2/sellers.json');
    if (sellersResult.status === 200) {
        const allSellers = sellersResult.data.sellers || [];
        console.log('\nAll sellers now:');
        allSellers.forEach(s => console.log('  - ' + s.sp_store_name + ' (ID: ' + s.id + ')'));
    }

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  COMPLETE!                                                  ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log('║  Sellers created: 2                                         ║');
    console.log('║  Products created: ' + totalProducts + '                                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\nRun this to sync sellers to theme:');
    console.log('  node scripts/sync-sellers-to-theme.js');
}

main().catch(console.error);
