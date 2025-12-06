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

// Seller IDs from previous creation
const sellerProducts = {
    // Vrindavan Garlands - ID: 2766176
    '2766176': {
        name: 'Vrindavan Garlands',
        productType: 'Garlands & Malas',
        products: [
            { name: 'Fresh Rose Garland (Mala)', price: '25.00', sku: 'VG-ROSE-001', image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800', desc: 'Beautiful fresh rose garland for deity worship and special occasions.' },
            { name: 'Tulsi Mala (108 beads)', price: '15.00', sku: 'VG-TULSI-001', image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800', desc: 'Sacred tulsi beads mala with 108 beads for japa meditation.' },
            { name: 'Wedding Garland Set (Varmala)', price: '150.00', sku: 'VG-WED-001', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', desc: 'Complete wedding garland set with matching bride and groom varmalas.' },
            { name: 'Marigold Garland (5ft)', price: '18.00', sku: 'VG-MARI-001', image: 'https://images.unsplash.com/photo-1600428877878-1a0ff561e8e1?w=800', desc: 'Fresh marigold garland perfect for festivals and pujas.' }
        ]
    },
    // Govinda Books - ID: 2766177
    '2766177': {
        name: 'Govinda Books',
        productType: 'Books & Media',
        products: [
            { name: 'Bhagavad Gita As It Is (Hardcover)', price: '20.00', sku: 'GB-BG-001', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800', desc: 'Complete Bhagavad Gita with original Sanskrit, transliteration, and purports.' },
            { name: 'Srimad Bhagavatam Set (18 Volumes)', price: '250.00', sku: 'GB-SB-001', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800', desc: 'Complete 18-volume set of Srimad Bhagavatam with commentaries.' },
            { name: 'Kirtan Melodies CD Collection', price: '35.00', sku: 'GB-CD-001', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800', desc: 'Collection of traditional kirtan melodies and bhajans.' }
        ]
    },
    // Deity Seva Store - ID: 2766178
    '2766178': {
        name: 'Deity Seva Store',
        productType: 'Puja Items',
        products: [
            { name: 'Brass Aarti Lamp (5 Wick)', price: '35.00', sku: 'DS-AARTI-001', image: 'https://images.unsplash.com/photo-1609941079978-f7f1eb8f6d29?w=800', desc: 'Traditional brass aarti lamp with 5 wicks for deity worship.' },
            { name: 'Deity Dress Set (Radha Krishna)', price: '85.00', sku: 'DS-DRESS-001', image: 'https://images.unsplash.com/photo-1596568635260-bd994a8a7a0a?w=800', desc: 'Beautiful embroidered dress set for Radha Krishna deities.' },
            { name: 'Complete Puja Kit', price: '45.00', sku: 'DS-PUJA-001', image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800', desc: 'Everything you need for daily puja - incense, lamp, bell, and more.' },
            { name: 'Premium Incense Collection', price: '22.00', sku: 'DS-INC-001', image: 'https://images.unsplash.com/photo-1600618528240-fb9fc964b853?w=800', desc: 'Assorted premium incense sticks - sandalwood, rose, jasmine.' }
        ]
    },
    // Tulsi Nursery - ID: 2766179
    '2766179': {
        name: 'Tulsi Nursery',
        productType: 'Plants & Garden',
        products: [
            { name: 'Krishna Tulsi Plant (Potted)', price: '18.00', sku: 'TN-PLANT-001', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800', desc: 'Sacred Krishna Tulsi plant in decorative pot, ready to grow.' },
            { name: 'Tulsi Seeds (Organic)', price: '8.00', sku: 'TN-SEED-001', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800', desc: 'Organic tulsi seeds for growing your own sacred plant.' },
            { name: 'Decorative Tulsi Pot (Brass)', price: '55.00', sku: 'TN-POT-001', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800', desc: 'Traditional brass tulsi pot with intricate designs.' }
        ]
    },
    // Ayur Wellness - ID: 2766180
    '2766180': {
        name: 'Ayur Wellness',
        productType: 'Health & Wellness',
        products: [
            { name: 'Chyawanprash (Organic)', price: '28.00', sku: 'AW-CHY-001', image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800', desc: 'Traditional Ayurvedic immunity booster with 40+ herbs.' },
            { name: 'Tulsi Green Tea (100 bags)', price: '15.00', sku: 'AW-TEA-001', image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800', desc: 'Organic tulsi green tea for stress relief and wellness.' },
            { name: 'Brahmi Oil (Hair & Mind)', price: '20.00', sku: 'AW-OIL-001', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800', desc: 'Traditional brahmi oil for hair health and mental clarity.' }
        ]
    }
};

async function createProduct(sellerId, product, productType) {
    console.log(`  Creating: ${product.name}`);

    const productData = {
        seller_id: sellerId,
        type: '1',  // Normal product
        product_name: product.name,
        product_type: productType,
        product_tag: 'sattvic,iskcon,temple,prasadam',
        product_description: product.desc,
        handle: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        variants: [{
            sku: product.sku,
            price: product.price,
            compare_at_price: (parseFloat(product.price) * 1.2).toFixed(2),
            quantity: '100',
            track_inventory: '1',
            require_shipping: '1',
            inventory_locations: [{
                location_id: LOCATION_ID,
                variant_quantity: '100'
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
        console.log(`    ✗ Failed: ${result.status} - ${JSON.stringify(result.data)}`);
        return null;
    }
}

async function main() {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║  Creating Products for ISKCON Seva Marketplace     ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    let totalCreated = 0;

    for (const [sellerId, sellerData] of Object.entries(sellerProducts)) {
        console.log(`\n=== ${sellerData.name} (ID: ${sellerId}) ===`);
        console.log(`    Product Type: ${sellerData.productType}`);

        for (const product of sellerData.products) {
            const result = await createProduct(sellerId, product, sellerData.productType);
            if (result) totalCreated++;
            await new Promise(r => setTimeout(r, 1000)); // Rate limiting
        }
    }

    console.log(`\n╔════════════════════════════════════════════════════╗`);
    console.log(`║  Total Products Created: ${totalCreated.toString().padStart(3)}                       ║`);
    console.log(`╚════════════════════════════════════════════════════╝`);
}

main().catch(console.error);
