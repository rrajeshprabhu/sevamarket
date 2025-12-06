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
    console.log('=== Creating Diverse ISKCON Marketplace Sellers & Products ===\n');

    // New diverse sellers with realistic ISKCON products
    const sellers = {
        "Vrindavan Garlands": {
            description: "Fresh flower garlands and malas for deity worship and occasions",
            products: [
                {
                    title: "Fresh Rose Garland - Deity Size",
                    type: "Garland",
                    price: "15.99",
                    description: `<h3>Beautiful Fresh Rose Garland</h3>
                        <p>Hand-crafted fresh rose garland perfect for deity worship and special occasions.</p>
                        <p><strong>Features:</strong></p>
                        <ul>
                            <li>Fresh roses - picked same day</li>
                            <li>Traditional stringing technique</li>
                            <li>Approximately 24 inches long</li>
                            <li>Available in red, pink, white, yellow</li>
                        </ul>
                        <p><strong>Made with devotion for Krishna Seva</strong></p>`,
                    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800",
                    tags: "garland, flowers, deity, puja, roses, fresh"
                },
                {
                    title: "Tulsi Mala - 108 Beads",
                    type: "Mala",
                    price: "12.99",
                    description: `<h3>Sacred Tulsi Japa Mala</h3>
                        <p>Authentic tulsi wood japa mala for chanting the Holy Names.</p>
                        <p><strong>Features:</strong></p>
                        <ul>
                            <li>108 tulsi beads + 1 Krishna bead</li>
                            <li>Hand-knotted with cotton thread</li>
                            <li>Includes japa bag</li>
                            <li>Blessed at ISKCON temple</li>
                        </ul>
                        <p><em>Hare Krishna Hare Krishna Krishna Krishna Hare Hare</em></p>`,
                    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800",
                    tags: "mala, tulsi, japa, chanting, beads, spiritual"
                },
                {
                    title: "Wedding Garland Set - Bride & Groom",
                    type: "Garland",
                    price: "89.99",
                    comparePrice: "120.00",
                    description: `<h3>Traditional Vedic Wedding Garland Set</h3>
                        <p>Complete garland set for Vaishnava wedding ceremony (Vivaha).</p>
                        <p><strong>Includes:</strong></p>
                        <ul>
                            <li>2 matching wedding garlands (varmala)</li>
                            <li>Fresh jasmine, roses, and marigolds</li>
                            <li>Decorative ribbon finish</li>
                            <li>Same-day delivery available</li>
                        </ul>
                        <p><strong>Pre-order 3 days in advance</strong></p>`,
                    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
                    tags: "wedding, garland, varmala, marriage, ceremony, flowers"
                },
                {
                    title: "Marigold Garland - 5 feet",
                    type: "Garland",
                    price: "8.99",
                    description: `<h3>Traditional Marigold Garland</h3>
                        <p>Bright orange marigold garland for festivals and decorations.</p>
                        <p><strong>Perfect for:</strong></p>
                        <ul>
                            <li>Temple decorations</li>
                            <li>Festival celebrations</li>
                            <li>Deity offerings</li>
                            <li>Home altar decoration</li>
                        </ul>`,
                    image: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800",
                    tags: "marigold, garland, decoration, festival, temple"
                }
            ]
        },
        "Govinda Books": {
            description: "Spiritual literature, Prabhupada's books, and devotional media",
            products: [
                {
                    title: "Bhagavad Gita As It Is - Hardcover",
                    type: "Book",
                    price: "19.99",
                    comparePrice: "24.99",
                    description: `<h3>Bhagavad Gita As It Is</h3>
                        <p>Complete edition with original Sanskrit, transliteration, translation, and Srila Prabhupada's purports.</p>
                        <p><strong>Features:</strong></p>
                        <ul>
                            <li>700+ pages hardcover edition</li>
                            <li>Full color plates</li>
                            <li>Complete word-by-word Sanskrit</li>
                            <li>Authorized BBT edition</li>
                        </ul>
                        <p><em>"This knowledge is the king of education" - Bg 9.2</em></p>`,
                    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800",
                    tags: "book, gita, prabhupada, scripture, spiritual, philosophy"
                },
                {
                    title: "Srimad Bhagavatam - Complete Set (18 Volumes)",
                    type: "Book Set",
                    price: "299.99",
                    comparePrice: "399.99",
                    description: `<h3>Complete Srimad Bhagavatam Set</h3>
                        <p>The cream of Vedic literature - complete 18 volume set by Srila Prabhupada.</p>
                        <p><strong>Includes:</strong></p>
                        <ul>
                            <li>All 12 Cantos in 18 volumes</li>
                            <li>Hardcover deluxe binding</li>
                            <li>Sanskrit, transliteration, translation, purports</li>
                            <li>Beautiful presentation box</li>
                        </ul>
                        <p><strong>The spotless Purana - essential for every devotee home</strong></p>`,
                    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800",
                    tags: "bhagavatam, book, set, prabhupada, scripture, purana"
                },
                {
                    title: "Kirtan Melodies CD Collection",
                    type: "Music",
                    price: "24.99",
                    description: `<h3>Traditional ISKCON Kirtan Collection</h3>
                        <p>5-CD set featuring beautiful kirtans from ISKCON temples worldwide.</p>
                        <p><strong>Includes:</strong></p>
                        <ul>
                            <li>Hare Krishna Mahamantra</li>
                            <li>Govinda Jaya Jaya</li>
                            <li>Radhe Radhe Govinda</li>
                            <li>Sri Krishna Chaitanya</li>
                            <li>And many more...</li>
                        </ul>`,
                    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800",
                    tags: "kirtan, music, cd, devotional, mantra, bhajan"
                }
            ]
        },
        "Deity Seva Store": {
            description: "Quality puja items, deity dresses, and temple supplies",
            products: [
                {
                    title: "Brass Aarti Lamp - 5 Wick",
                    type: "Puja Item",
                    price: "29.99",
                    description: `<h3>Traditional 5-Wick Aarti Lamp</h3>
                        <p>Premium brass aarti lamp for daily deity worship.</p>
                        <p><strong>Features:</strong></p>
                        <ul>
                            <li>Solid brass construction</li>
                            <li>5 ghee wick holders</li>
                            <li>Decorative handle with bell</li>
                            <li>7 inches height</li>
                        </ul>
                        <p><strong>Essential for mangal aarti and sandhya aarti</strong></p>`,
                    image: "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=800",
                    tags: "aarti, lamp, brass, puja, deity, worship"
                },
                {
                    title: "Deity Dress Set - Radha Krishna (6 inch)",
                    type: "Deity Dress",
                    price: "45.99",
                    description: `<h3>Beautiful Deity Outfit Set</h3>
                        <p>Elegant matching outfit set for Radha Krishna deities.</p>
                        <p><strong>Includes:</strong></p>
                        <ul>
                            <li>Krishna dhoti and uttariya</li>
                            <li>Radharani sari and blouse</li>
                            <li>Matching jewelry set</li>
                            <li>Flower accessories</li>
                        </ul>
                        <p><strong>For 6-inch deities - hand-stitched with love</strong></p>`,
                    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800",
                    tags: "deity, dress, radha, krishna, outfit, altar"
                },
                {
                    title: "Complete Puja Thali Set",
                    type: "Puja Set",
                    price: "39.99",
                    description: `<h3>All-in-One Puja Thali</h3>
                        <p>Everything you need for daily deity worship in one beautiful set.</p>
                        <p><strong>Includes:</strong></p>
                        <ul>
                            <li>Brass thali (plate)</li>
                            <li>Small bell</li>
                            <li>Incense holder</li>
                            <li>Water cup (achamana)</li>
                            <li>Flower bowl</li>
                            <li>Ghee lamp</li>
                        </ul>`,
                    image: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=800",
                    tags: "puja, thali, set, brass, worship, complete"
                },
                {
                    title: "Premium Incense - Vrindavan Collection (12 boxes)",
                    type: "Incense",
                    price: "18.99",
                    description: `<h3>Vrindavan Premium Incense</h3>
                        <p>Hand-rolled incense with traditional fragrances.</p>
                        <p><strong>Fragrances include:</strong></p>
                        <ul>
                            <li>Sandalwood</li>
                            <li>Rose</li>
                            <li>Jasmine</li>
                            <li>Tulsi</li>
                            <li>Nag Champa</li>
                            <li>And more...</li>
                        </ul>
                        <p><strong>Natural ingredients - no chemicals</strong></p>`,
                    image: "https://images.unsplash.com/photo-1602345397613-0934a8812d23?w=800",
                    tags: "incense, agarbatti, fragrance, puja, meditation"
                }
            ]
        },
        "Tulsi Nursery": {
            description: "Sacred plants, seeds, and garden supplies for devotees",
            products: [
                {
                    title: "Sacred Tulsi Plant - Krishna Tulsi",
                    type: "Plant",
                    price: "14.99",
                    description: `<h3>Krishna Tulsi - Sacred Basil Plant</h3>
                        <p>Live Krishna Tulsi plant for your home altar.</p>
                        <p><strong>Features:</strong></p>
                        <ul>
                            <li>Dark purple-stemmed variety</li>
                            <li>4-inch pot included</li>
                            <li>Care instructions provided</li>
                            <li>Blessed before shipping</li>
                        </ul>
                        <p><em>"Tulsi is very dear to Krishna" - Srila Prabhupada</em></p>`,
                    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
                    tags: "tulsi, plant, basil, sacred, krishna, garden"
                },
                {
                    title: "Tulsi Seeds - Organic Pack",
                    type: "Seeds",
                    price: "5.99",
                    description: `<h3>Organic Tulsi Seeds</h3>
                        <p>Grow your own sacred Tulsi from seeds.</p>
                        <p><strong>Pack contains:</strong></p>
                        <ul>
                            <li>100+ organic seeds</li>
                            <li>Mix of Rama and Krishna Tulsi</li>
                            <li>Planting guide included</li>
                            <li>High germination rate</li>
                        </ul>`,
                    image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800",
                    tags: "seeds, tulsi, organic, garden, growing"
                },
                {
                    title: "Decorative Tulsi Pot - Brass Vrindavan Style",
                    type: "Pot",
                    price: "49.99",
                    description: `<h3>Traditional Tulsi Vrindavan</h3>
                        <p>Beautiful brass pot for your Tulsi Maharani.</p>
                        <p><strong>Features:</strong></p>
                        <ul>
                            <li>Solid brass construction</li>
                            <li>Traditional temple design</li>
                            <li>Drainage holes included</li>
                            <li>12 inches height</li>
                        </ul>`,
                    image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800",
                    tags: "pot, brass, tulsi, vrindavan, traditional, garden"
                }
            ]
        },
        "Ayur Wellness": {
            description: "Authentic Ayurvedic products for health and wellbeing",
            products: [
                {
                    title: "Chyawanprash - Traditional Recipe (500g)",
                    type: "Health Food",
                    price: "16.99",
                    description: `<h3>Authentic Chyawanprash</h3>
                        <p>Traditional Ayurvedic immunity booster made with 40+ herbs.</p>
                        <p><strong>Benefits:</strong></p>
                        <ul>
                            <li>Boosts immunity</li>
                            <li>Rich in Vitamin C</li>
                            <li>Improves digestion</li>
                            <li>Natural energy booster</li>
                        </ul>
                        <p><strong>Take 1-2 spoons daily with warm milk</strong></p>`,
                    image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800",
                    tags: "ayurveda, chyawanprash, health, immunity, natural"
                },
                {
                    title: "Tulsi Green Tea - Organic (100 bags)",
                    type: "Tea",
                    price: "12.99",
                    description: `<h3>Organic Tulsi Green Tea</h3>
                        <p>Refreshing blend of green tea and sacred Tulsi.</p>
                        <p><strong>Benefits:</strong></p>
                        <ul>
                            <li>Stress relief</li>
                            <li>Antioxidant rich</li>
                            <li>Supports immunity</li>
                            <li>Caffeine balanced</li>
                        </ul>`,
                    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800",
                    tags: "tea, tulsi, green, organic, herbal, wellness"
                },
                {
                    title: "Brahmi Hair Oil - Traditional Formula",
                    type: "Hair Care",
                    price: "14.99",
                    description: `<h3>Brahmi Hair Oil</h3>
                        <p>Traditional Ayurvedic hair oil for healthy hair and calm mind.</p>
                        <p><strong>Ingredients:</strong></p>
                        <ul>
                            <li>Brahmi (Bacopa)</li>
                            <li>Amla</li>
                            <li>Coconut oil base</li>
                            <li>Bhringraj</li>
                        </ul>
                        <p><strong>Also promotes peaceful sleep and meditation</strong></p>`,
                    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800",
                    tags: "hair, oil, brahmi, ayurveda, natural, wellness"
                }
            ]
        }
    };

    let totalProducts = 0;

    for (const [vendor, vendorData] of Object.entries(sellers)) {
        console.log(`\n--- Creating products for: ${vendor} ---`);
        console.log(`Description: ${vendorData.description}\n`);

        for (const product of vendorData.products) {
            console.log(`  Creating: ${product.title}`);

            const productData = {
                product: {
                    title: product.title,
                    body_html: product.description,
                    vendor: vendor,
                    product_type: product.type,
                    tags: product.tags,
                    variants: [{
                        price: product.price,
                        compare_at_price: product.comparePrice || null,
                        inventory_management: null,
                        fulfillment_service: "manual"
                    }],
                    images: [{
                        src: product.image,
                        alt: product.title
                    }]
                }
            };

            const result = await shopifyRequest('POST', '/products.json', productData);

            if (result.status === 201) {
                console.log(`    ✓ Created successfully (ID: ${result.data.product.id})`);
                totalProducts++;
            } else {
                console.log(`    ✗ Failed: ${result.status}`);
                if (result.data.errors) {
                    console.log(`      ${JSON.stringify(result.data.errors)}`);
                }
            }

            await new Promise(r => setTimeout(r, 500));
        }
    }

    console.log(`\n=== Created ${totalProducts} products across ${Object.keys(sellers).length} sellers ===`);
    console.log('\nNew Sellers Created:');
    for (const vendor of Object.keys(sellers)) {
        console.log(`  - ${vendor}`);
    }
    console.log('\nNote: These products are created in Shopify.');
    console.log('To link them to Webkul sellers, create matching sellers in Webkul admin.');
}

main().catch(console.error);
