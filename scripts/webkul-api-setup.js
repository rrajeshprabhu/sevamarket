const https = require('https');

// ============================================
// WEBKUL API CONFIGURATION
// ============================================
// After subscribing to the API add-on ($15/month), paste your credentials here:
const WEBKUL_ACCESS_TOKEN = 'ODk3OTlhYWI2ZWZjM2Y2MTQ2MjZjYjFiYmMxZjM3NGE0MDkzYzk0MTZkMjBiY2JlMmI1MTZmODhlY2ZkNGRmMQ';
const WEBKUL_REFRESH_TOKEN = 'ZGQ3N2JjM2ViMjc0ZTQzZmM3OTQ3YjQ4NmNhYjcwZGU2ZmE0YWUyY2YxM2Y4ZGQ4ODBlOWMyZGNmNzI4YjMyOA';
const SHOP_NAME = 'seva-dev.myshopify.com';

// Shopify API for product management
const SHOPIFY_ACCESS_TOKEN = 'process.env.SHOPIFY_ACCESS_TOKEN';

// ============================================
// API HELPER FUNCTIONS
// ============================================

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

function shopifyRequest(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'seva-dev.myshopify.com',
            port: 443,
            path: `/admin/api/2024-01${endpoint}`,
            method: method,
            headers: {
                'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
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

// ============================================
// SELLER DEFINITIONS - ISKCON Temple Community
// ============================================

const sellers = [
    {
        name: 'Vrindavan Garlands',
        email: 'vrindavan.garlands@sevamarket.com',
        password: 'Seva2024!',
        storeName: 'Vrindavan Garlands',
        description: 'Fresh flower garlands and tulsi malas for deity worship',
        phone: '555-0101',
        products: [
            { title: 'Fresh Rose Garland (Mala)', price: '25.00', handle: 'fresh-rose-garland-mala', image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800' },
            { title: 'Tulsi Mala (108 beads)', price: '15.00', handle: 'tulsi-mala-108-beads', image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800' },
            { title: 'Wedding Garland Set', price: '150.00', handle: 'wedding-garland-set', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800' },
            { title: 'Marigold Garland (5ft)', price: '18.00', handle: 'marigold-garland-5ft', image: 'https://images.unsplash.com/photo-1600428877878-1a0ff561e8e1?w=800' }
        ]
    },
    {
        name: 'Govinda Books',
        email: 'govinda.books@sevamarket.com',
        password: 'Seva2024!',
        storeName: 'Govinda Books',
        description: 'Authentic Vaishnava literature and spiritual books',
        phone: '555-0102',
        products: [
            { title: 'Bhagavad Gita As It Is (Hardcover)', price: '20.00', handle: 'bhagavad-gita-as-it-is-hardcover', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800' },
            { title: 'Srimad Bhagavatam Set (18 Volumes)', price: '250.00', handle: 'srimad-bhagavatam-set-18-volumes', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800' },
            { title: 'Kirtan Melodies CD Collection', price: '35.00', handle: 'kirtan-melodies-cd-collection', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800' }
        ]
    },
    {
        name: 'Deity Seva Store',
        email: 'deity.seva@sevamarket.com',
        password: 'Seva2024!',
        storeName: 'Deity Seva Store',
        description: 'Puja items, deity dresses, and worship accessories',
        phone: '555-0103',
        products: [
            { title: 'Brass Aarti Lamp (5 Wick)', price: '35.00', handle: 'brass-aarti-lamp-5-wick', image: 'https://images.unsplash.com/photo-1609941079978-f7f1eb8f6d29?w=800' },
            { title: 'Deity Dress Set (Radha Krishna)', price: '85.00', handle: 'deity-dress-set-radha-krishna', image: 'https://images.unsplash.com/photo-1596568635260-bd994a8a7a0a?w=800' },
            { title: 'Complete Puja Kit', price: '45.00', handle: 'complete-puja-kit', image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800' },
            { title: 'Premium Incense Collection', price: '22.00', handle: 'premium-incense-collection', image: 'https://images.unsplash.com/photo-1600618528240-fb9fc964b853?w=800' }
        ]
    },
    {
        name: 'Tulsi Nursery',
        email: 'tulsi.nursery@sevamarket.com',
        password: 'Seva2024!',
        storeName: 'Tulsi Nursery',
        description: 'Sacred tulsi plants and garden supplies',
        phone: '555-0104',
        products: [
            { title: 'Krishna Tulsi Plant (Potted)', price: '18.00', handle: 'krishna-tulsi-plant-potted', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800' },
            { title: 'Tulsi Seeds (Organic)', price: '8.00', handle: 'tulsi-seeds-organic', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800' },
            { title: 'Decorative Tulsi Pot (Brass)', price: '55.00', handle: 'decorative-tulsi-pot-brass', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800' }
        ]
    },
    {
        name: 'Ayur Wellness',
        email: 'ayur.wellness@sevamarket.com',
        password: 'Seva2024!',
        storeName: 'Ayur Wellness',
        description: 'Authentic Ayurvedic products and wellness items',
        phone: '555-0105',
        products: [
            { title: 'Chyawanprash (Organic)', price: '28.00', handle: 'chyawanprash-organic', image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800' },
            { title: 'Tulsi Green Tea (100 bags)', price: '15.00', handle: 'tulsi-green-tea-100-bags', image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800' },
            { title: 'Brahmi Oil (Hair & Mind)', price: '20.00', handle: 'brahmi-oil-hair-mind', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800' }
        ]
    }
];

// ============================================
// MAIN FUNCTIONS
// ============================================

async function testApiConnection() {
    console.log('=== Testing Webkul API Connection ===\n');

    if (WEBKUL_ACCESS_TOKEN === 'YOUR_ACCESS_TOKEN_HERE') {
        console.log('❌ ERROR: Please update the WEBKUL_ACCESS_TOKEN and WEBKUL_REFRESH_TOKEN');
        console.log('   at the top of this file with your actual API credentials.\n');
        console.log('To get credentials:');
        console.log('1. Go to Shopify Admin → Apps → Multi Vendor Marketplace');
        console.log('2. Find API/Add-ons section and subscribe ($15/month)');
        console.log('3. Copy the Access Token and Refresh Token');
        return false;
    }

    try {
        const result = await webkulRequest('GET', '/api/v2/sellers.json');
        if (result.status === 200) {
            console.log('✓ API connection successful!');
            console.log(`  Found ${result.data.length || 0} existing sellers`);
            return true;
        } else {
            console.log(`❌ API returned status ${result.status}`);
            console.log('   Response:', JSON.stringify(result.data, null, 2));
            return false;
        }
    } catch (error) {
        console.log('❌ Connection error:', error.message);
        return false;
    }
}

async function createSeller(seller) {
    console.log(`\nCreating seller: ${seller.name}`);

    // Correct API parameters per Webkul documentation
    const sellerData = {
        sp_store_name: seller.storeName,
        seller_name: seller.name,
        email: seller.email,
        password: seller.password,
        state: 'CA',  // California ISO code
        country: 'US',  // USA ISO code
        country_code: '1',  // USA phone prefix
        contact: seller.phone,
        send_welcome_email: '0',
        send_email_verification_link: '0'
    };

    const result = await webkulRequest('POST', '/api/v2/sellers.json', sellerData);

    if (result.status === 200 || result.status === 201) {
        console.log(`  ✓ Seller created successfully!`);
        return result.data;
    } else {
        console.log(`  ✗ Failed: ${result.status}`);
        console.log(`    ${JSON.stringify(result.data)}`);
        return null;
    }
}

async function createProductForSeller(sellerId, product) {
    console.log(`  Creating product: ${product.title}`);

    const productData = {
        title: product.title,
        price: product.price,
        vendor: sellerId,  // Link to seller
        status: 'active',
        images: [{ src: product.image, alt: product.title }],
        tags: ['sattvic', 'iskcon', 'temple']
    };

    const result = await webkulRequest('POST', '/api/v2/products.json', productData);

    if (result.status === 200 || result.status === 201) {
        console.log(`    ✓ Product created`);
        return result.data;
    } else {
        console.log(`    ✗ Failed: ${result.status}`);
        return null;
    }
}

async function getExistingSellers() {
    console.log('\n=== Getting Existing Sellers ===\n');

    const result = await webkulRequest('GET', '/api/v2/sellers.json');

    if (result.status === 200) {
        const sellers = result.data.sellers || result.data || [];
        console.log(`Found ${sellers.length} sellers:\n`);

        for (const seller of sellers) {
            console.log(`  - ${seller.storeName || seller.name} (ID: ${seller.id})`);
            console.log(`    Email: ${seller.email}`);
            console.log(`    Status: ${seller.status || 'unknown'}`);
            console.log('');
        }

        return sellers;
    } else {
        console.log('Failed to get sellers:', result.status);
        return [];
    }
}

async function linkExistingProductsToSeller(sellerId, vendor) {
    console.log(`\nLinking products with vendor "${vendor}" to seller ID ${sellerId}`);

    // Get products from Shopify with this vendor
    const productsResponse = await shopifyRequest('GET', `/products.json?vendor=${encodeURIComponent(vendor)}&limit=250`);
    const products = productsResponse.data.products || [];

    console.log(`  Found ${products.length} products with vendor "${vendor}"`);

    let linked = 0;
    for (const product of products) {
        // Use Webkul API to assign product to seller
        const result = await webkulRequest('PUT', `/api/v2/products/imports/assign-to-seller.json`, {
            shopifyProductId: product.id,
            sellerId: sellerId
        });

        if (result.status === 200 || result.status === 201) {
            console.log(`    ✓ Linked: ${product.title}`);
            linked++;
        }

        await new Promise(r => setTimeout(r, 300));
    }

    console.log(`  Linked ${linked}/${products.length} products`);
}

async function setupAllSellers() {
    console.log('=== Setting Up All Sellers via Webkul API ===\n');

    for (const seller of sellers) {
        const createdSeller = await createSeller(seller);

        if (createdSeller && createdSeller.id) {
            // Create products for this seller
            for (const product of seller.products) {
                await createProductForSeller(createdSeller.id, product);
                await new Promise(r => setTimeout(r, 500)); // Rate limiting
            }
        }

        await new Promise(r => setTimeout(r, 1000)); // Pause between sellers
    }

    console.log('\n=== Setup Complete ===');
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║  Webkul Multi-Vendor API Setup for ISKCON Seva    ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    // First test the connection
    const connected = await testApiConnection();

    if (!connected) {
        console.log('\n⚠️  Please update the API credentials and run again.');
        return;
    }

    // Show menu
    console.log('\n--- Available Actions ---');
    console.log('1. Get existing sellers: node webkul-api-setup.js sellers');
    console.log('2. Create all new sellers: node webkul-api-setup.js create');
    console.log('3. Link existing products: node webkul-api-setup.js link');
    console.log('');

    const action = process.argv[2];

    switch (action) {
        case 'sellers':
            await getExistingSellers();
            break;
        case 'create':
            await setupAllSellers();
            break;
        case 'link':
            // You would call this with specific seller IDs
            console.log('To link products, specify seller ID and vendor name');
            break;
        default:
            console.log('Run with: node webkul-api-setup.js [sellers|create|link]');
    }
}

main().catch(console.error);
