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
        if (postData) {
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }
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

async function createSeller(sellerData) {
    console.log('\nCreating seller: ' + sellerData.store_name);

    const result = await webkulRequest('POST', '/api/v2/sellers.json', sellerData);

    if (result.status === 200 || result.status === 201) {
        console.log('  ✓ Seller created');
        if (result.data && result.data.seller) {
            console.log('    Seller ID: ' + result.data.seller.id);
            return result.data.seller.id;
        }
        return result.data;
    } else {
        console.log('  ✗ Failed: ' + result.status);
        console.log('    ' + JSON.stringify(result.data).substring(0, 300));
        return null;
    }
}

async function createProduct(sellerId, product) {
    console.log('  Creating product: ' + product.name);

    const productData = {
        seller_id: sellerId.toString(),
        type: '1',
        product_name: product.name,
        product_type: product.type,
        product_tag: product.tags,
        product_description: product.description,
        handle: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        variants: product.variants,
        options: product.options || [{ name: 'Title', values: 'Default' }]
    };

    const result = await webkulRequest('POST', '/api/v2/products.json', productData);

    if (result.status === 200 || result.status === 201) {
        console.log('    ✓ Created');
        return true;
    } else {
        console.log('    ✗ Failed: ' + result.status + ' - ' + JSON.stringify(result.data).substring(0, 150));
        return false;
    }
}

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  Creating New Sellers & Products                           ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    // ========================================
    // SELLER 1: Ayan Gupta - College Prep Mentoring
    // ========================================
    console.log('\n' + '═'.repeat(60));
    console.log('SELLER 1: Ayan Gupta - College Prep Mentoring');
    console.log('═'.repeat(60));

    const ayanSeller = await createSeller({
        store_name: 'College Prep by Ayan',
        email: 'ayan.gupta@example.com',
        password: 'TempPass123!',
        phone: '555-0101'
    });

    await sleep(1000);

    if (ayanSeller) {
        // Get the seller ID (might be returned differently)
        let ayanId = ayanSeller;
        if (typeof ayanSeller === 'object') {
            ayanId = ayanSeller.id || ayanSeller;
        }

        // Products for Ayan
        const ayanProducts = [
            {
                name: '1-Week Mentoring Session (1 hour)',
                type: 'Education',
                tags: 'college-prep,mentoring,education,ayan-gupta',
                description: 'One-on-one college prep mentoring session. Perfect for students with specific questions about college applications, major selection, or career planning. Each session is 1 hour via Zoom.',
                variants: [{
                    sku: 'AG-1WEEK-001',
                    price: '75.00',
                    quantity: '999',
                    track_inventory: '0',
                    require_shipping: '0',
                    taxable: '0'
                }],
                options: [{ name: 'Title', values: 'Default' }]
            },
            {
                name: '2-Week Mentoring Package (2 sessions)',
                type: 'Education',
                tags: 'college-prep,mentoring,education,ayan-gupta',
                description: 'Two 1-hour mentoring sessions over 2 weeks. Ideal for deeper guidance on college selection, application strategy, and interview preparation. Includes email support between sessions.',
                variants: [{
                    sku: 'AG-2WEEK-001',
                    price: '140.00',
                    quantity: '999',
                    track_inventory: '0',
                    require_shipping: '0',
                    taxable: '0'
                }],
                options: [{ name: 'Title', values: 'Default' }]
            },
            {
                name: 'College Essay Review',
                type: 'Education',
                tags: 'college-prep,essay,review,education,ayan-gupta',
                description: 'Comprehensive review of your college application essay. Includes detailed feedback on structure, content, grammar, and impact. Turnaround within 3-5 business days. One round of revision included.',
                variants: [
                    {
                        sku: 'AG-ESSAY-1',
                        price: '50.00',
                        option1: 'Single Essay',
                        quantity: '999',
                        track_inventory: '0',
                        require_shipping: '0',
                        taxable: '0'
                    },
                    {
                        sku: 'AG-ESSAY-3',
                        price: '120.00',
                        option1: '3 Essays Package',
                        quantity: '999',
                        track_inventory: '0',
                        require_shipping: '0',
                        taxable: '0'
                    },
                    {
                        sku: 'AG-ESSAY-5',
                        price: '180.00',
                        option1: '5 Essays Package',
                        quantity: '999',
                        track_inventory: '0',
                        require_shipping: '0',
                        taxable: '0'
                    }
                ],
                options: [{ name: 'Package', values: 'Single Essay,3 Essays Package,5 Essays Package' }]
            },
            {
                name: 'Open Q&A Session',
                type: 'Education',
                tags: 'college-prep,qa,education,ayan-gupta',
                description: 'Bring your questions! Open format 1-hour session for any college prep questions - applications, scholarships, SAT/ACT prep strategies, extracurriculars, or college life. Great for students just starting their journey.',
                variants: [{
                    sku: 'AG-QA-001',
                    price: '60.00',
                    quantity: '999',
                    track_inventory: '0',
                    require_shipping: '0',
                    taxable: '0'
                }],
                options: [{ name: 'Title', values: 'Default' }]
            }
        ];

        for (const product of ayanProducts) {
            await sleep(1000);
            await createProduct(ayanId, product);
        }
    }

    // ========================================
    // SELLER 2: Vinay Prabhu - Eco Party Supplies
    // ========================================
    console.log('\n' + '═'.repeat(60));
    console.log('SELLER 2: Vinay Prabhu - Eco Party Supplies');
    console.log('═'.repeat(60));

    const vinaySeller = await createSeller({
        store_name: 'Eco Party Supplies by Vinay',
        email: 'vinay.prabhu@example.com',
        password: 'TempPass123!',
        phone: '555-0102'
    });

    await sleep(1000);

    if (vinaySeller) {
        let vinayId = vinaySeller;
        if (typeof vinaySeller === 'object') {
            vinayId = vinaySeller.id || vinaySeller;
        }

        // Products for Vinay - Disposable plates/cups with quantity variants
        const vinayProducts = [
            {
                name: 'Areca Palm Leaf Plates - Round (10 inch)',
                type: 'Party Supplies',
                tags: 'eco-friendly,plates,disposable,events,vinay-prabhu',
                description: '100% natural and biodegradable plates made from fallen areca palm leaves. Sturdy, leak-proof, and microwave safe. Perfect for events, parties, and catering. No chemicals or additives.',
                variants: [
                    {
                        sku: 'VP-PLT10-25',
                        price: '15.00',
                        option1: '25 plates',
                        quantity: '100',
                        track_inventory: '1',
                        require_shipping: '1',
                        taxable: '1'
                    },
                    {
                        sku: 'VP-PLT10-50',
                        price: '28.00',
                        option1: '50 plates',
                        quantity: '100',
                        track_inventory: '1',
                        require_shipping: '1',
                        taxable: '1'
                    },
                    {
                        sku: 'VP-PLT10-100',
                        price: '52.00',
                        option1: '100 plates',
                        quantity: '100',
                        track_inventory: '1',
                        require_shipping: '1',
                        taxable: '1'
                    },
                    {
                        sku: 'VP-PLT10-200',
                        price: '95.00',
                        option1: '200 plates',
                        quantity: '50',
                        track_inventory: '1',
                        require_shipping: '1',
                        taxable: '1'
                    }
                ],
                options: [{ name: 'Quantity', values: '25 plates,50 plates,100 plates,200 plates' }]
            },
            {
                name: 'Areca Palm Leaf Plates - Square (8 inch)',
                type: 'Party Supplies',
                tags: 'eco-friendly,plates,disposable,events,vinay-prabhu',
                description: 'Elegant square plates made from fallen areca palm leaves. Great for appetizers and desserts. 100% compostable and chemical-free.',
                variants: [
                    {
                        sku: 'VP-PLT8S-25',
                        price: '12.00',
                        option1: '25 plates',
                        quantity: '100',
                        track_inventory: '1',
                        require_shipping: '1',
                        taxable: '1'
                    },
                    {
                        sku: 'VP-PLT8S-50',
                        price: '22.00',
                        option1: '50 plates',
                        quantity: '100',
                        track_inventory: '1',
                        require_shipping: '1',
                        taxable: '1'
                    },
                    {
                        sku: 'VP-PLT8S-100',
                        price: '40.00',
                        option1: '100 plates',
                        quantity: '100',
                        track_inventory: '1',
                        require_shipping: '1',
                        taxable: '1'
                    }
                ],
                options: [{ name: 'Quantity', values: '25 plates,50 plates,100 plates' }]
            },
            {
                name: 'Sugarcane Bagasse Cups (12 oz)',
                type: 'Party Supplies',
                tags: 'eco-friendly,cups,disposable,events,vinay-prabhu',
                description: 'Sturdy cups made from sugarcane fiber (bagasse). Hot and cold beverage safe. 100% compostable. Perfect for chai, coffee, or cold drinks at events.',
                variants: [
                    {
                        sku: 'VP-CUP12-50',
                        price: '14.00',
                        option1: '50 cups',
                        quantity: '100',
                        track_inventory: '1',
                        require_shipping: '1',
                        taxable: '1'
                    },
                    {
                        sku: 'VP-CUP12-100',
                        price: '25.00',
                        option1: '100 cups',
                        quantity: '100',
                        track_inventory: '1',
                        require_shipping: '1',
                        taxable: '1'
                    },
                    {
                        sku: 'VP-CUP12-200',
                        price: '45.00',
                        option1: '200 cups',
                        quantity: '50',
                        track_inventory: '1',
                        require_shipping: '1',
                        taxable: '1'
                    }
                ],
                options: [{ name: 'Quantity', values: '50 cups,100 cups,200 cups' }]
            },
            {
                name: 'Bamboo Cutlery Set (Fork, Spoon, Knife)',
                type: 'Party Supplies',
                tags: 'eco-friendly,cutlery,disposable,events,vinay-prabhu',
                description: 'Premium bamboo cutlery sets. Each set includes fork, spoon, and knife. Strong, splinter-free, and fully biodegradable. Individually wrapped option available.',
                variants: [
                    {
                        sku: 'VP-CUT-25',
                        price: '18.00',
                        option1: '25 sets',
                        quantity: '100',
                        track_inventory: '1',
                        require_shipping: '1',
                        taxable: '1'
                    },
                    {
                        sku: 'VP-CUT-50',
                        price: '32.00',
                        option1: '50 sets',
                        quantity: '100',
                        track_inventory: '1',
                        require_shipping: '1',
                        taxable: '1'
                    },
                    {
                        sku: 'VP-CUT-100',
                        price: '58.00',
                        option1: '100 sets',
                        quantity: '100',
                        track_inventory: '1',
                        require_shipping: '1',
                        taxable: '1'
                    }
                ],
                options: [{ name: 'Quantity', values: '25 sets,50 sets,100 sets' }]
            },
            {
                name: 'Event Bundle - 50 Guests',
                type: 'Party Supplies',
                tags: 'eco-friendly,bundle,events,vinay-prabhu',
                description: 'Complete eco-friendly party pack for 50 guests. Includes: 50 round plates (10"), 50 square plates (8"), 50 cups, and 50 cutlery sets. Save 15% vs buying separately!',
                variants: [{
                    sku: 'VP-BUNDLE-50',
                    price: '99.00',
                    quantity: '30',
                    track_inventory: '1',
                    require_shipping: '1',
                    taxable: '1'
                }],
                options: [{ name: 'Title', values: 'Default' }]
            },
            {
                name: 'Event Bundle - 100 Guests',
                type: 'Party Supplies',
                tags: 'eco-friendly,bundle,events,vinay-prabhu',
                description: 'Complete eco-friendly party pack for 100 guests. Includes: 100 round plates (10"), 100 square plates (8"), 100 cups, and 100 cutlery sets. Save 20% vs buying separately!',
                variants: [{
                    sku: 'VP-BUNDLE-100',
                    price: '175.00',
                    quantity: '20',
                    track_inventory: '1',
                    require_shipping: '1',
                    taxable: '1'
                }],
                options: [{ name: 'Title', values: 'Default' }]
            }
        ];

        for (const product of vinayProducts) {
            await sleep(1000);
            await createProduct(vinayId, product);
        }
    }

    // ========================================
    // SYNC SELLERS TO THEME
    // ========================================
    console.log('\n' + '═'.repeat(60));
    console.log('Syncing sellers to theme...');
    console.log('═'.repeat(60));

    // Run sync script
    require('./sync-sellers-to-theme.js');

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  ALL DONE!                                                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
}

main().catch(console.error);
