const https = require('https');

// Webkul API Configuration
const WEBKUL_ACCESS_TOKEN = 'ODk3OTlhYWI2ZWZjM2Y2MTQ2MjZjYjFiYmMxZjM3NGE0MDkzYzk0MTZkMjBiY2JlMmI1MTZmODhlY2ZkNGRmMQ';
const SHOP_NAME = 'seva-dev.myshopify.com';
const LOCATION_ID = '431196';  // Primary location from API

function webkulRequest(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'mvmapi.webkul.com',
            port: 443,
            path: endpoint,
            method: method,
            headers: {
                'Authorization': `Bearer ${WEBKUL_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'shop': SHOP_NAME
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

// New Service Sellers
const serviceSellers = [
    {
        sp_store_name: 'Artha Financial Wisdom',
        seller_name: 'Artha Financial',
        email: 'artha.financial@sevamarket.com',
        password: 'Seva2024!',
        state: 'CA',
        country: 'US',
        country_code: '1',
        contact: '555-0201',
        description: 'Vedic-inspired financial planning and wealth management services',
        products: [
            { name: 'Personal Financial Planning Session (1 Hour)', price: '150.00', sku: 'AF-FP-001',
              image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
              desc: 'One-on-one financial planning consultation covering budgeting, savings, and investment strategies based on ethical and dharmic principles.' },
            { name: 'Retirement Planning Package', price: '500.00', sku: 'AF-RP-001',
              image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
              desc: 'Comprehensive retirement planning including asset allocation, tax-efficient strategies, and long-term wealth preservation.' },
            { name: 'Family Wealth Workshop (3 Sessions)', price: '350.00', sku: 'AF-WW-001',
              image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800',
              desc: 'Three-session workshop on building generational wealth, teaching children about money, and family financial harmony.' },
            { name: 'Tax Planning Consultation', price: '200.00', sku: 'AF-TP-001',
              image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800',
              desc: 'Strategic tax planning session to minimize tax burden while supporting charitable giving and community service.' }
        ]
    },
    {
        sp_store_name: 'Vidya College Mentors',
        seller_name: 'Vidya Mentors',
        email: 'vidya.mentors@sevamarket.com',
        password: 'Seva2024!',
        state: 'CA',
        country: 'US',
        country_code: '1',
        contact: '555-0202',
        description: 'Expert college admission mentoring and academic guidance services',
        products: [
            { name: 'College Application Strategy Session', price: '175.00', sku: 'VM-CA-001',
              image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
              desc: 'Personalized college application strategy including school selection, timeline planning, and positioning.' },
            { name: 'Essay Review & Coaching (5 Essays)', price: '400.00', sku: 'VM-ER-001',
              image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
              desc: 'In-depth review and coaching for up to 5 college application essays with unlimited revisions.' },
            { name: 'Complete College Prep Package', price: '1500.00', sku: 'VM-CP-001',
              image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
              desc: 'Full admission support including strategy, essay coaching, interview prep, and application review for up to 10 schools.' },
            { name: 'Interview Preparation Session', price: '125.00', sku: 'VM-IP-001',
              image: 'https://images.unsplash.com/photo-1560439514-4e9645039924?w=800',
              desc: 'Mock interview session with feedback and coaching on presentation, body language, and common questions.' },
            { name: 'SAT/ACT Strategy Consultation', price: '100.00', sku: 'VM-SAT-001',
              image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
              desc: 'Test strategy session covering preparation approach, timing, and score improvement techniques.' }
        ]
    }
];

async function createSeller(seller) {
    console.log(`\nCreating seller: ${seller.seller_name}`);

    const sellerData = {
        sp_store_name: seller.sp_store_name,
        seller_name: seller.seller_name,
        email: seller.email,
        password: seller.password,
        state: seller.state,
        country: seller.country,
        country_code: seller.country_code,
        contact: seller.contact,
        send_welcome_email: '0',
        send_email_verification_link: '0'
    };

    const result = await webkulRequest('POST', '/api/v2/sellers.json', sellerData);

    if (result.status === 200 || result.status === 201) {
        const sellerId = result.data.seller?.id || result.data.id;
        console.log(`  ✓ Seller created! ID: ${sellerId}`);
        return sellerId;
    } else {
        console.log(`  ✗ Failed: ${result.status} - ${JSON.stringify(result.data)}`);
        return null;
    }
}

async function createProduct(sellerId, product, productType) {
    console.log(`  Creating: ${product.name}`);

    const productData = {
        seller_id: sellerId.toString(),
        type: '1',
        product_name: product.name,
        product_type: productType,
        product_tag: 'service,iskcon,community',
        product_description: product.desc,
        handle: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50),
        variants: [{
            sku: product.sku,
            price: product.price,
            compare_at_price: (parseFloat(product.price) * 1.15).toFixed(2),
            quantity: '999',
            track_inventory: '0',  // Services don't need inventory tracking
            require_shipping: '0',  // Services don't need shipping
            inventory_locations: [{
                location_id: LOCATION_ID,
                variant_quantity: '999'
            }]
        }],
        options: [{
            name: 'Title',
            values: 'Default'
        }],
        images: [{
            image_url: product.image,
            image_alt: product.name,
            position: '0'
        }]
    };

    const result = await webkulRequest('POST', '/api/v2/products.json', productData);

    if (result.status === 200 || result.status === 201) {
        console.log(`    ✓ Created successfully`);
        return result.data;
    } else {
        console.log(`    ✗ Failed: ${result.status} - ${JSON.stringify(result.data).substring(0, 100)}`);
        return null;
    }
}

async function main() {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║  Adding Service Sellers - Financial & Education    ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    for (const seller of serviceSellers) {
        const sellerId = await createSeller(seller);

        if (sellerId) {
            console.log(`\n  Creating products for ${seller.seller_name}...`);
            const productType = seller.seller_name.includes('Financial') ? 'Financial Services' : 'Education Services';

            for (const product of seller.products) {
                await createProduct(sellerId, product, productType);
                await new Promise(r => setTimeout(r, 1000));
            }
        }

        await new Promise(r => setTimeout(r, 1000));
    }

    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║  Service Sellers Setup Complete!                   ║');
    console.log('╚════════════════════════════════════════════════════╝');
}

main().catch(console.error);
