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

async function createProduct(productData) {
    const result = await shopifyRequest('POST', '/products.json', { product: productData });
    if (result.status === 201 || result.status === 200) {
        console.log(`  ✓ Created: ${productData.title}`);
        return result.data.product;
    } else {
        console.log(`  ✗ Failed: ${productData.title}`, result.data?.errors || result.status);
        return null;
    }
}

async function main() {
    console.log('=== Adding Realistic Products for 3 Approved Sellers ===\n');
    console.log('All products follow ISKCON guidelines: No onion, no garlic, no eggs, sattvic only\n');

    // ============================================
    // SELLER 1: PRABHU PIZZA (Food & Delivery)
    // ============================================
    console.log('--- PRABHU PIZZA (Prasadam Pizza & Italian) ---\n');

    const prabhuPizzaProducts = [
        {
            title: "Cheese Burst Pizza (Prasadam)",
            body_html: `
                <h3>Extra Cheesy Sattvic Delight</h3>
                <p>Our most popular pizza loaded with mozzarella cheese that bursts with every bite!</p>
                <h4>Pure Ingredients:</h4>
                <ul>
                    <li>Triple cheese blend (mozzarella, cheddar, parmesan)</li>
                    <li>Sattvic tomato sauce with herbs (no onion, no garlic)</li>
                    <li>Hand-tossed fresh dough (no eggs)</li>
                    <li>Italian herbs and olive oil</li>
                </ul>
                <p><strong>100% Sattvic | No Onion | No Garlic | Offered to Krishna</strong></p>
                <p>🙏 <strong>Hare Krishna!</strong></p>
            `,
            vendor: "Prabhu Pizza",
            product_type: "Food",
            tags: "pizza, prasadam, sattvic, cheese, no-onion, no-garlic, vegetarian",
            status: "active",
            variants: [
                { option1: "Regular (10 inch)", price: "14.99", sku: "PP-CB-R", requires_shipping: false },
                { option1: "Large (14 inch)", price: "19.99", sku: "PP-CB-L", requires_shipping: false }
            ],
            options: [{ name: "Size" }],
            images: [{ src: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800", alt: "Cheese Burst Pizza" }]
        },
        {
            title: "Pesto Paneer Pizza (Prasadam)",
            body_html: `
                <h3>Italian-Indian Fusion</h3>
                <p>Creamy basil pesto with soft paneer cubes - a unique fusion creation!</p>
                <h4>Pure Ingredients:</h4>
                <ul>
                    <li>Fresh basil pesto (made without garlic)</li>
                    <li>Soft paneer cubes</li>
                    <li>Cherry tomatoes</li>
                    <li>Mozzarella cheese</li>
                    <li>Pine nuts and olive oil</li>
                </ul>
                <p><strong>100% Sattvic | No Onion | No Garlic | Offered to Krishna</strong></p>
            `,
            vendor: "Prabhu Pizza",
            product_type: "Food",
            tags: "pizza, prasadam, sattvic, paneer, pesto, fusion, no-onion, no-garlic",
            status: "active",
            variants: [
                { option1: "Regular (10 inch)", price: "16.99", sku: "PP-PESTO-R", requires_shipping: false },
                { option1: "Large (14 inch)", price: "22.99", sku: "PP-PESTO-L", requires_shipping: false }
            ],
            options: [{ name: "Size" }],
            images: [{ src: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=800", alt: "Pesto Pizza" }]
        },
        {
            title: "Pasta Alfredo (Prasadam)",
            body_html: `
                <h3>Creamy Italian Pasta</h3>
                <p>Rich and creamy Alfredo pasta made the sattvic way!</p>
                <h4>Pure Ingredients:</h4>
                <ul>
                    <li>Penne pasta</li>
                    <li>Fresh cream Alfredo sauce</li>
                    <li>Parmesan cheese</li>
                    <li>Fresh herbs (basil, parsley)</li>
                    <li>Butter and black pepper</li>
                </ul>
                <p><strong>No Onion | No Garlic | Sattvic</strong></p>
            `,
            vendor: "Prabhu Pizza",
            product_type: "Food",
            tags: "pasta, prasadam, sattvic, italian, alfredo, no-onion, no-garlic",
            status: "active",
            variants: [
                { option1: "Regular", price: "12.99", sku: "PP-PASTA-R", requires_shipping: false },
                { option1: "Large", price: "16.99", sku: "PP-PASTA-L", requires_shipping: false }
            ],
            options: [{ name: "Size" }],
            images: [{ src: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800", alt: "Pasta Alfredo" }]
        },
        {
            title: "Tiramisu (Prasadam Dessert)",
            body_html: `
                <h3>Classic Italian Dessert - Eggless</h3>
                <p>Authentic tiramisu made without eggs - pure sattvic indulgence!</p>
                <h4>Pure Ingredients:</h4>
                <ul>
                    <li>Mascarpone cream</li>
                    <li>Lady fingers (eggless)</li>
                    <li>Coffee (caffeine-free option available)</li>
                    <li>Cocoa powder</li>
                    <li>Vanilla essence</li>
                </ul>
                <p><strong>Eggless | No Onion | No Garlic | Sattvic Dessert</strong></p>
            `,
            vendor: "Prabhu Pizza",
            product_type: "Food",
            tags: "dessert, prasadam, sattvic, tiramisu, eggless, italian",
            status: "active",
            variants: [
                { option1: "Single Serving", price: "6.99", sku: "PP-TIRA-1", requires_shipping: false },
                { option1: "Family Size", price: "18.99", sku: "PP-TIRA-F", requires_shipping: false }
            ],
            options: [{ name: "Size" }],
            images: [{ src: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800", alt: "Tiramisu" }]
        }
    ];

    for (const product of prabhuPizzaProducts) {
        await createProduct(product);
        await new Promise(r => setTimeout(r, 500));
    }

    // ============================================
    // SELLER 2: RADHA SANGEET MUSIC ACADEMY (Classes)
    // ============================================
    console.log('\n--- RADHA SANGEET MUSIC ACADEMY (Music Classes) ---\n');

    const radhaSangeetProducts = [
        {
            title: "Harmonium Classes - Beginner",
            body_html: `
                <h3>Learn to Play Harmonium</h3>
                <p>Master the harmonium - the essential instrument for bhajan and kirtan accompaniment.</p>
                <h4>What You'll Learn:</h4>
                <ul>
                    <li>Basic notes and scales (Sa Re Ga Ma)</li>
                    <li>Hand positioning and bellows technique</li>
                    <li>Simple bhajan accompaniment</li>
                    <li>Rhythm patterns for kirtan</li>
                    <li>Popular ISKCON melodies</li>
                </ul>
                <h4>Class Details:</h4>
                <ul>
                    <li>Duration: 1 hour per session</li>
                    <li>Mode: Online (Zoom) or In-person</li>
                    <li>Instrument: Bring your own or rent from us</li>
                </ul>
                <p><em>Taught by Radha Sangeet with 15+ years experience</em></p>
            `,
            vendor: "Radha Sangeet Music Academy",
            product_type: "Service",
            tags: "music, harmonium, classes, beginner, kirtan, bhajan, iskcon",
            status: "active",
            variants: [
                { option1: "Single Class", price: "30.00", sku: "RS-HARM-1", requires_shipping: false, taxable: false },
                { option1: "4-Class Package", price: "100.00", sku: "RS-HARM-4", requires_shipping: false, taxable: false },
                { option1: "Monthly (8 Classes)", price: "180.00", sku: "RS-HARM-8", requires_shipping: false, taxable: false }
            ],
            options: [{ name: "Package" }],
            images: [{ src: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800", alt: "Harmonium" }]
        },
        {
            title: "Mridangam Lessons",
            body_html: `
                <h3>Traditional Mridangam Training</h3>
                <p>Learn the sacred drum used in Vedic ceremonies and kirtan.</p>
                <h4>What You'll Learn:</h4>
                <ul>
                    <li>Basic strokes and hand positions</li>
                    <li>Tala (rhythm cycles)</li>
                    <li>Kirtan accompaniment patterns</li>
                    <li>Traditional compositions</li>
                </ul>
                <p><em>Great for kirtan enthusiasts and aspiring temple musicians!</em></p>
            `,
            vendor: "Radha Sangeet Music Academy",
            product_type: "Service",
            tags: "music, mridangam, drums, classes, kirtan, traditional, iskcon",
            status: "active",
            variants: [
                { option1: "Single Class", price: "35.00", sku: "RS-MRID-1", requires_shipping: false, taxable: false },
                { option1: "4-Class Package", price: "120.00", sku: "RS-MRID-4", requires_shipping: false, taxable: false },
                { option1: "Monthly (8 Classes)", price: "200.00", sku: "RS-MRID-8", requires_shipping: false, taxable: false }
            ],
            options: [{ name: "Package" }],
            images: [{ src: "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800", alt: "Drums" }]
        },
        {
            title: "Kirtan Workshop - Group Session",
            body_html: `
                <h3>Learn the Art of Kirtan</h3>
                <p>Group workshop on leading and participating in kirtan - the congregational chanting of the Holy Names.</p>
                <h4>Workshop Includes:</h4>
                <ul>
                    <li>Popular ISKCON kirtan melodies</li>
                    <li>Call and response techniques</li>
                    <li>Building energy in kirtan</li>
                    <li>Harmonium and kartals basics</li>
                    <li>History and philosophy of kirtan</li>
                </ul>
                <h4>Details:</h4>
                <ul>
                    <li>Duration: 2.5 hours</li>
                    <li>Group size: 5-15 participants</li>
                    <li>All levels welcome</li>
                </ul>
                <p>🙏 <strong>Haribol!</strong></p>
            `,
            vendor: "Radha Sangeet Music Academy",
            product_type: "Service",
            tags: "kirtan, workshop, group, singing, iskcon, bhajan, spiritual",
            status: "active",
            variants: [
                { option1: "Single Person", price: "25.00", sku: "RS-KIRT-1", requires_shipping: false, taxable: false },
                { option1: "Couple", price: "40.00", sku: "RS-KIRT-2", requires_shipping: false, taxable: false },
                { option1: "Family (up to 4)", price: "60.00", sku: "RS-KIRT-F", requires_shipping: false, taxable: false }
            ],
            options: [{ name: "Participants" }],
            images: [{ src: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800", alt: "Kirtan" }]
        },
        {
            title: "Shloka & Mantra Chanting Class",
            body_html: `
                <h3>Learn Sacred Sanskrit Chanting</h3>
                <p>Master the pronunciation and meaning of important Vedic shlokas and mantras.</p>
                <h4>What You'll Learn:</h4>
                <ul>
                    <li>Hare Krishna Maha-mantra</li>
                    <li>Brahma Samhita prayers</li>
                    <li>Vishnu Sahasranama selections</li>
                    <li>Daily prayers and arati songs</li>
                    <li>Proper Sanskrit pronunciation</li>
                </ul>
                <p><em>Perfect for new devotees and those wanting to deepen their practice.</em></p>
            `,
            vendor: "Radha Sangeet Music Academy",
            product_type: "Service",
            tags: "shloka, mantra, chanting, sanskrit, spiritual, vedic, iskcon",
            status: "active",
            variants: [
                { option1: "Single Class", price: "20.00", sku: "RS-SHLOK-1", requires_shipping: false, taxable: false },
                { option1: "4-Class Package", price: "70.00", sku: "RS-SHLOK-4", requires_shipping: false, taxable: false },
                { option1: "Monthly (8 Classes)", price: "120.00", sku: "RS-SHLOK-8", requires_shipping: false, taxable: false }
            ],
            options: [{ name: "Package" }],
            images: [{ src: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800", alt: "Meditation and Chanting" }]
        }
    ];

    for (const product of radhaSangeetProducts) {
        await createProduct(product);
        await new Promise(r => setTimeout(r, 500));
    }

    // ============================================
    // SELLER 3: GOVINDA'S CATERING (Catering & Events)
    // ============================================
    console.log('\n--- GOVINDA\'S CATERING (Prasadam Catering) ---\n');

    const govindasProducts = [
        {
            title: "Sunday Feast Catering (50 people)",
            body_html: `
                <h3>Traditional ISKCON Sunday Feast</h3>
                <p>Authentic temple-style Sunday feast for your home or event!</p>
                <h4>Menu Includes:</h4>
                <ul>
                    <li><strong>Rice:</strong> Basmati rice with ghee</li>
                    <li><strong>Dal:</strong> Creamy toor dal (no masoor)</li>
                    <li><strong>Sabzi:</strong> 2 vegetable preparations</li>
                    <li><strong>Paneer:</strong> Paneer dish</li>
                    <li><strong>Bread:</strong> Fresh puris or chapatis</li>
                    <li><strong>Chutney:</strong> Tamarind and mint chutney</li>
                    <li><strong>Sweet:</strong> Kheer or Halwa</li>
                    <li><strong>Drink:</strong> Sweet lassi or nimbu pani</li>
                </ul>
                <p><strong>100% Sattvic | No Onion | No Garlic | Offered to Krishna</strong></p>
                <p>🙏 <strong>Prasadam ki Jai!</strong></p>
            `,
            vendor: "Govinda's Catering",
            product_type: "Catering",
            tags: "catering, sunday-feast, prasadam, sattvic, temple, iskcon, no-onion, no-garlic",
            status: "active",
            variants: [
                { option1: "50 people", price: "450.00", sku: "GC-SF-50", requires_shipping: false, taxable: false },
                { option1: "100 people", price: "800.00", sku: "GC-SF-100", requires_shipping: false, taxable: false },
                { option1: "200 people", price: "1400.00", sku: "GC-SF-200", requires_shipping: false, taxable: false }
            ],
            options: [{ name: "Guest Count" }],
            images: [{ src: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800", alt: "Indian Feast" }]
        },
        {
            title: "Janmashtami Special Feast",
            body_html: `
                <h3>Krishna Janmashtami Celebration Package</h3>
                <p>Complete catering for Janmashtami celebrations with 108 preparations theme!</p>
                <h4>Special Menu Includes:</h4>
                <ul>
                    <li><strong>Makhana Kheer</strong> - Krishna's favorite</li>
                    <li><strong>Gopala Bhog</strong> - Special butter rice</li>
                    <li><strong>Panjiri</strong> - Traditional prasadam sweet</li>
                    <li><strong>Panchamrit</strong> - Sacred drink</li>
                    <li><strong>Assorted Sweets</strong> - Peda, Barfi, Laddu</li>
                    <li>Plus full meal service</li>
                </ul>
                <p><strong>Perfect for temple programs and home celebrations!</strong></p>
            `,
            vendor: "Govinda's Catering",
            product_type: "Catering",
            tags: "catering, janmashtami, festival, prasadam, sattvic, krishna, iskcon, celebration",
            status: "active",
            variants: [
                { option1: "25 people", price: "350.00", sku: "GC-JAN-25", requires_shipping: false, taxable: false },
                { option1: "50 people", price: "600.00", sku: "GC-JAN-50", requires_shipping: false, taxable: false },
                { option1: "100 people", price: "1100.00", sku: "GC-JAN-100", requires_shipping: false, taxable: false }
            ],
            options: [{ name: "Guest Count" }],
            images: [{ src: "https://images.unsplash.com/photo-1605197161470-5d5c5c0a2c9e?w=800", alt: "Festival Food" }]
        },
        {
            title: "Sattvic Wedding Package",
            body_html: `
                <h3>Complete Vedic Wedding Catering</h3>
                <p>Make your special day blessed with pure sattvic prasadam for all guests.</p>
                <h4>Package Includes:</h4>
                <ul>
                    <li>Welcome drinks (lassi, sherbet)</li>
                    <li>Appetizers and chaats (sattvic style)</li>
                    <li>Full course meal (8+ items)</li>
                    <li>Live chaat counter</li>
                    <li>Dessert station</li>
                    <li>Dedicated service staff</li>
                </ul>
                <h4>Menu Customization:</h4>
                <ul>
                    <li>South Indian options available</li>
                    <li>North Indian thali style</li>
                    <li>Fusion menu available</li>
                </ul>
                <p><strong>All preparations: No onion, no garlic, no eggs</strong></p>
                <p><em>Free consultation included!</em></p>
            `,
            vendor: "Govinda's Catering",
            product_type: "Catering",
            tags: "catering, wedding, sattvic, prasadam, vedic, celebration, no-onion, no-garlic",
            status: "active",
            variants: [
                { option1: "100 guests", price: "2500.00", sku: "GC-WED-100", requires_shipping: false, taxable: false },
                { option1: "200 guests", price: "4500.00", sku: "GC-WED-200", requires_shipping: false, taxable: false },
                { option1: "300+ guests", price: "6500.00", sku: "GC-WED-300", requires_shipping: false, taxable: false }
            ],
            options: [{ name: "Guest Count" }],
            images: [{ src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800", alt: "Wedding Catering" }]
        },
        {
            title: "Daily Tiffin Subscription",
            body_html: `
                <h3>Fresh Prasadam Delivered Daily</h3>
                <p>Healthy, home-style sattvic meals delivered to your doorstep.</p>
                <h4>Daily Menu Includes:</h4>
                <ul>
                    <li>Rice or 3 Rotis</li>
                    <li>Dal (rotating - toor, moong, chana)</li>
                    <li>2 Sabzi preparations</li>
                    <li>Salad & Pickle</li>
                    <li>Sweet (3 days/week)</li>
                </ul>
                <h4>Our Promise:</h4>
                <ul>
                    <li>✓ Fresh cooked daily</li>
                    <li>✓ No onion, no garlic</li>
                    <li>✓ No eggs or egg products</li>
                    <li>✓ Offered to Krishna</li>
                </ul>
                <p><em>Delivery: Mon-Sat, 12 PM - 1 PM</em></p>
                <p>🙏 <strong>Simple living, high thinking!</strong></p>
            `,
            vendor: "Govinda's Catering",
            product_type: "Subscription",
            tags: "tiffin, subscription, daily, prasadam, sattvic, lunch, no-onion, no-garlic",
            status: "active",
            variants: [
                { option1: "Weekly (6 days)", price: "60.00", sku: "GC-TIF-W", requires_shipping: false, taxable: false },
                { option1: "Monthly (24 days)", price: "200.00", sku: "GC-TIF-M", requires_shipping: false, taxable: false },
                { option1: "3 Months", price: "550.00", sku: "GC-TIF-3M", requires_shipping: false, taxable: false }
            ],
            options: [{ name: "Duration" }],
            images: [{ src: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800", alt: "Tiffin Food" }]
        }
    ];

    for (const product of govindasProducts) {
        await createProduct(product);
        await new Promise(r => setTimeout(r, 500));
    }

    // Get collection IDs to add products
    console.log('\n--- Adding products to collections ---\n');

    const collections = await shopifyRequest('GET', '/custom_collections.json');
    const foodCollection = collections.data.custom_collections?.find(c => c.title.includes('Food'));
    const classesCollection = collections.data.custom_collections?.find(c => c.title.includes('Classes'));
    const cateringCollection = collections.data.custom_collections?.find(c => c.title.includes('Catering'));

    console.log('Collections found:');
    console.log('- Food:', foodCollection?.title || 'Not found');
    console.log('- Classes:', classesCollection?.title || 'Not found');
    console.log('- Catering:', cateringCollection?.title || 'Not found');

    console.log('\n=== SUMMARY ===');
    console.log('\nAdded products for 3 approved sellers:');
    console.log('\n1. PRABHU PIZZA (4 products):');
    console.log('   - Cheese Burst Pizza');
    console.log('   - Pesto Paneer Pizza');
    console.log('   - Pasta Alfredo');
    console.log('   - Tiramisu Dessert');
    console.log('\n2. RADHA SANGEET MUSIC ACADEMY (4 products):');
    console.log('   - Harmonium Classes');
    console.log('   - Mridangam Lessons');
    console.log('   - Kirtan Workshop');
    console.log('   - Shloka & Mantra Chanting');
    console.log('\n3. GOVINDA\'S CATERING (4 products):');
    console.log('   - Sunday Feast Catering');
    console.log('   - Janmashtami Special Feast');
    console.log('   - Sattvic Wedding Package');
    console.log('   - Daily Tiffin Subscription');
    console.log('\n🙏 Hare Krishna! All products are ISKCON-compliant (sattvic, no onion/garlic)');
}

main().catch(console.error);
