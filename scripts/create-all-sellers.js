const https = require('https');

// Shopify API Configuration
const SHOP = 'seva-dev.myshopify.com';
const ACCESS_TOKEN = 'process.env.SHOPIFY_ACCESS_TOKEN';

// Helper function to make API requests
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
                    const parsed = JSON.parse(body);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// Create a product helper
async function createProduct(productData, collectionId, sellerName) {
    const result = await shopifyRequest('POST', '/products.json', { product: productData });

    if (result.status === 201 || result.status === 200) {
        console.log(`  ✓ ${productData.title}`);
        console.log(`    URL: https://${SHOP}/products/${result.data.product.handle}`);

        // Add to collection
        if (collectionId) {
            await shopifyRequest('POST', '/collects.json', {
                collect: {
                    product_id: result.data.product.id,
                    collection_id: collectionId
                }
            });
        }

        // Add seller metafield
        await shopifyRequest('POST', `/products/${result.data.product.id}/metafields.json`, {
            metafield: {
                namespace: "marketplace",
                key: "seller_name",
                value: sellerName,
                type: "single_line_text_field"
            }
        });

        return result.data.product;
    } else {
        console.log(`  ✗ Error creating ${productData.title}:`, result.data?.errors || result.status);
        return null;
    }
}

// Get or create collection
async function getOrCreateCollection(title, description) {
    const collections = await shopifyRequest('GET', '/custom_collections.json');
    let collection = collections.data.custom_collections?.find(c =>
        c.title.toLowerCase() === title.toLowerCase()
    );

    if (!collection) {
        const result = await shopifyRequest('POST', '/custom_collections.json', {
            custom_collection: {
                title: title,
                body_html: description,
                published: true
            }
        });
        if (result.status === 201) {
            collection = result.data.custom_collection;
            console.log(`  ✓ Created collection: ${title}`);
        }
    } else {
        console.log(`  ✓ Collection exists: ${title}`);
    }
    return collection;
}

async function main() {
    console.log('═'.repeat(60));
    console.log('  CREATING MULTIPLE SELLERS & PRODUCTS FOR SEVA MARKETPLACE');
    console.log('═'.repeat(60));
    console.log();

    // ═══════════════════════════════════════════════════════════════
    // SELLER 1: PRABHU PIZZA - Pizza Delivery
    // ═══════════════════════════════════════════════════════════════
    console.log('━'.repeat(60));
    console.log('SELLER 1: PRABHU PIZZA - Homemade Pizza Delivery');
    console.log('━'.repeat(60));

    const foodCollection = await getOrCreateCollection(
        "Food & Delivery",
        "<p>Delicious homemade food from our community sellers. Fresh, authentic, and made with love.</p>"
    );

    console.log('\n  Creating products:');

    await createProduct({
        title: "Margherita Pizza",
        body_html: `
            <h3>Classic Italian Margherita</h3>
            <p>Our signature pizza with San Marzano tomatoes, fresh mozzarella, basil, and extra virgin olive oil on a hand-tossed crust.</p>
            <p><strong>Made fresh to order. Delivery within 45 minutes.</strong></p>
            <ul>
                <li>100% vegetarian</li>
                <li>Hand-tossed artisan crust</li>
                <li>Fresh ingredients daily</li>
            </ul>
        `,
        vendor: "Prabhu Pizza",
        product_type: "Food",
        tags: ["pizza", "italian", "vegetarian", "delivery", "prabhu-pizza"],
        status: "active",
        variants: [
            { option1: "Small (8 inch)", price: "12.99", sku: "PP-MARG-S", requires_shipping: false },
            { option1: "Medium (12 inch)", price: "18.99", sku: "PP-MARG-M", requires_shipping: false },
            { option1: "Large (16 inch)", price: "24.99", sku: "PP-MARG-L", requires_shipping: false }
        ],
        options: [{ name: "Size" }]
    }, foodCollection?.id, "Prabhu Pizza");

    await createProduct({
        title: "Veggie Supreme Pizza",
        body_html: `
            <h3>Loaded Vegetable Delight</h3>
            <p>A colorful mix of bell peppers, mushrooms, olives, onions, tomatoes, and jalapeños with extra cheese.</p>
            <p><strong>Our most popular vegetarian option!</strong></p>
        `,
        vendor: "Prabhu Pizza",
        product_type: "Food",
        tags: ["pizza", "vegetarian", "delivery", "prabhu-pizza"],
        status: "active",
        variants: [
            { option1: "Small (8 inch)", price: "14.99", sku: "PP-VEG-S", requires_shipping: false },
            { option1: "Medium (12 inch)", price: "21.99", sku: "PP-VEG-M", requires_shipping: false },
            { option1: "Large (16 inch)", price: "28.99", sku: "PP-VEG-L", requires_shipping: false }
        ],
        options: [{ name: "Size" }]
    }, foodCollection?.id, "Prabhu Pizza");

    await createProduct({
        title: "Paneer Tikka Pizza",
        body_html: `
            <h3>Indian Fusion Pizza</h3>
            <p>Marinated paneer tikka, onions, bell peppers, and mint chutney drizzle on our signature crust. A perfect blend of Italian and Indian flavors!</p>
        `,
        vendor: "Prabhu Pizza",
        product_type: "Food",
        tags: ["pizza", "indian", "paneer", "fusion", "vegetarian", "prabhu-pizza"],
        status: "active",
        variants: [
            { option1: "Small (8 inch)", price: "15.99", sku: "PP-PAN-S", requires_shipping: false },
            { option1: "Medium (12 inch)", price: "23.99", sku: "PP-PAN-M", requires_shipping: false },
            { option1: "Large (16 inch)", price: "31.99", sku: "PP-PAN-L", requires_shipping: false }
        ],
        options: [{ name: "Size" }]
    }, foodCollection?.id, "Prabhu Pizza");

    await createProduct({
        title: "Garlic Breadsticks",
        body_html: `
            <h3>Freshly Baked Garlic Breadsticks</h3>
            <p>Warm, buttery breadsticks with roasted garlic and herbs. Served with marinara dipping sauce.</p>
            <p>Perfect side for any pizza order!</p>
        `,
        vendor: "Prabhu Pizza",
        product_type: "Food",
        tags: ["sides", "bread", "garlic", "vegetarian", "prabhu-pizza"],
        status: "active",
        variants: [
            { option1: "6 pieces", price: "5.99", sku: "PP-GB-6", requires_shipping: false },
            { option1: "12 pieces", price: "9.99", sku: "PP-GB-12", requires_shipping: false }
        ],
        options: [{ name: "Quantity" }]
    }, foodCollection?.id, "Prabhu Pizza");

    // ═══════════════════════════════════════════════════════════════
    // SELLER 2: RADHA SANGEET MUSIC ACADEMY - Music Classes
    // ═══════════════════════════════════════════════════════════════
    console.log('\n' + '━'.repeat(60));
    console.log('SELLER 2: RADHA SANGEET MUSIC ACADEMY - Music Classes');
    console.log('━'.repeat(60));

    const classesCollection = await getOrCreateCollection(
        "Classes & Workshops",
        "<p>Learn new skills from experienced teachers in our community. Music, art, cooking, and more!</p>"
    );

    console.log('\n  Creating products:');

    await createProduct({
        title: "Carnatic Vocal Classes - Beginner",
        body_html: `
            <h3>Learn Classical Carnatic Singing</h3>
            <p>Start your journey into the rich tradition of Carnatic music with our structured beginner program.</p>
            <h4>Curriculum:</h4>
            <ul>
                <li>Sarali Varisai - Basic exercises</li>
                <li>Janta Varisai - Double note patterns</li>
                <li>Alankarams - Melodic patterns</li>
                <li>Simple Geetams and Kritis</li>
            </ul>
            <p><em>Online classes via Zoom. Flexible scheduling available.</em></p>
        `,
        vendor: "Radha Sangeet Music Academy",
        product_type: "Service",
        tags: ["music", "carnatic", "singing", "classes", "beginner", "radha-sangeet"],
        status: "active",
        variants: [
            { option1: "Single Class (1 hr)", price: "35.00", sku: "RS-CARN-1", requires_shipping: false, taxable: false },
            { option1: "4-Class Package", price: "120.00", sku: "RS-CARN-4", requires_shipping: false, taxable: false },
            { option1: "Monthly (8 Classes)", price: "220.00", sku: "RS-CARN-8", requires_shipping: false, taxable: false }
        ],
        options: [{ name: "Package" }]
    }, classesCollection?.id, "Radha Sangeet Music Academy");

    await createProduct({
        title: "Devotional Bhajan Classes",
        body_html: `
            <h3>Learn Beautiful Devotional Bhajans</h3>
            <p>Immerse yourself in the spiritual experience of singing bhajans from various traditions.</p>
            <h4>What You'll Learn:</h4>
            <ul>
                <li>ISKCON/Vaishnava bhajans</li>
                <li>Traditional Hindi bhajans</li>
                <li>Sanskrit pronunciation</li>
                <li>Harmonium accompaniment basics</li>
            </ul>
            <p><em>Perfect for temple devotees and spiritual seekers.</em></p>
        `,
        vendor: "Radha Sangeet Music Academy",
        product_type: "Service",
        tags: ["music", "bhajan", "devotional", "spiritual", "classes", "radha-sangeet"],
        status: "active",
        variants: [
            { option1: "Single Class", price: "25.00", sku: "RS-BHAJ-1", requires_shipping: false, taxable: false },
            { option1: "4-Class Package", price: "90.00", sku: "RS-BHAJ-4", requires_shipping: false, taxable: false },
            { option1: "Monthly (8 Classes)", price: "160.00", sku: "RS-BHAJ-8", requires_shipping: false, taxable: false }
        ],
        options: [{ name: "Package" }]
    }, classesCollection?.id, "Radha Sangeet Music Academy");

    await createProduct({
        title: "Harmonium Lessons",
        body_html: `
            <h3>Learn to Play Harmonium</h3>
            <p>Master this essential instrument for kirtan and bhajan accompaniment.</p>
            <h4>Course Includes:</h4>
            <ul>
                <li>Bellows technique and posture</li>
                <li>Basic scales and notes</li>
                <li>Chord patterns for bhajans</li>
                <li>Popular bhajan accompaniments</li>
            </ul>
            <p><em>Harmonium rental available for students.</em></p>
        `,
        vendor: "Radha Sangeet Music Academy",
        product_type: "Service",
        tags: ["music", "harmonium", "instrument", "classes", "radha-sangeet"],
        status: "active",
        variants: [
            { option1: "Single Class", price: "40.00", sku: "RS-HARM-1", requires_shipping: false, taxable: false },
            { option1: "4-Class Package", price: "140.00", sku: "RS-HARM-4", requires_shipping: false, taxable: false },
            { option1: "Monthly (8 Classes)", price: "260.00", sku: "RS-HARM-8", requires_shipping: false, taxable: false }
        ],
        options: [{ name: "Package" }]
    }, classesCollection?.id, "Radha Sangeet Music Academy");

    await createProduct({
        title: "Kids Music Program (Ages 5-12)",
        body_html: `
            <h3>Fun Music Classes for Children!</h3>
            <p>Introduce your child to Indian classical music through games, stories, and interactive activities.</p>
            <h4>Program Highlights:</h4>
            <ul>
                <li>Learn through play and stories</li>
                <li>Simple bhajans and shlokas</li>
                <li>Rhythm games with tabla</li>
                <li>Group performances</li>
            </ul>
            <p><em>Small batch sizes (max 5 students). Weekend classes available.</em></p>
        `,
        vendor: "Radha Sangeet Music Academy",
        product_type: "Service",
        tags: ["music", "kids", "children", "classes", "radha-sangeet"],
        status: "active",
        variants: [
            { option1: "Single Class (45 min)", price: "20.00", sku: "RS-KIDS-1", requires_shipping: false, taxable: false },
            { option1: "4-Class Package", price: "70.00", sku: "RS-KIDS-4", requires_shipping: false, taxable: false },
            { option1: "Monthly (8 Classes)", price: "130.00", sku: "RS-KIDS-8", requires_shipping: false, taxable: false }
        ],
        options: [{ name: "Package" }]
    }, classesCollection?.id, "Radha Sangeet Music Academy");

    // ═══════════════════════════════════════════════════════════════
    // SELLER 3: KASAM REALTY - Real Estate Services
    // ═══════════════════════════════════════════════════════════════
    console.log('\n' + '━'.repeat(60));
    console.log('SELLER 3: KASAM REALTY - Real Estate Brokerage');
    console.log('━'.repeat(60));

    const realEstateCollection = await getOrCreateCollection(
        "Real Estate Services",
        "<p>Professional real estate services from trusted community brokers. Buy, sell, or rent with confidence.</p>"
    );

    console.log('\n  Creating products:');

    await createProduct({
        title: "Home Buying Consultation",
        body_html: `
            <h3>Expert Guidance for Home Buyers</h3>
            <p>Navigate the home buying process with confidence. Kasam Realty provides personalized consultation services.</p>
            <h4>Consultation Includes:</h4>
            <ul>
                <li>Market analysis and pricing guidance</li>
                <li>Neighborhood recommendations</li>
                <li>Mortgage pre-qualification assistance</li>
                <li>Property search strategy</li>
                <li>Negotiation tips</li>
            </ul>
            <p><strong>20+ years of Bay Area real estate experience</strong></p>
        `,
        vendor: "Kasam Realty",
        product_type: "Service",
        tags: ["real-estate", "home-buying", "consultation", "kasam-realty"],
        status: "active",
        variants: [
            { option1: "Initial Consultation (1 hr)", price: "0.00", sku: "KR-CONSULT-FREE", requires_shipping: false, taxable: false },
            { option1: "Detailed Market Analysis", price: "199.00", sku: "KR-CONSULT-ANALYSIS", requires_shipping: false, taxable: false },
            { option1: "Full Buyer Representation", price: "499.00", sku: "KR-CONSULT-FULL", requires_shipping: false, taxable: false }
        ],
        options: [{ name: "Service Level" }]
    }, realEstateCollection?.id, "Kasam Realty");

    await createProduct({
        title: "Home Selling Package",
        body_html: `
            <h3>Sell Your Home for Top Dollar</h3>
            <p>Comprehensive home selling services to maximize your property's value.</p>
            <h4>Package Includes:</h4>
            <ul>
                <li>Comparative Market Analysis (CMA)</li>
                <li>Professional photography</li>
                <li>Virtual tour creation</li>
                <li>MLS listing and marketing</li>
                <li>Open house coordination</li>
                <li>Negotiation and closing support</li>
            </ul>
            <p><strong>Average sale price 5% above asking!</strong></p>
        `,
        vendor: "Kasam Realty",
        product_type: "Service",
        tags: ["real-estate", "home-selling", "listing", "kasam-realty"],
        status: "active",
        variants: [
            { option1: "Basic Listing", price: "1999.00", sku: "KR-SELL-BASIC", requires_shipping: false, taxable: false },
            { option1: "Premium Package", price: "3999.00", sku: "KR-SELL-PREMIUM", requires_shipping: false, taxable: false },
            { option1: "Luxury Home Service", price: "5999.00", sku: "KR-SELL-LUXURY", requires_shipping: false, taxable: false }
        ],
        options: [{ name: "Package" }]
    }, realEstateCollection?.id, "Kasam Realty");

    await createProduct({
        title: "Rental Property Search",
        body_html: `
            <h3>Find Your Perfect Rental</h3>
            <p>Let us help you find the ideal rental property that fits your needs and budget.</p>
            <h4>Service Includes:</h4>
            <ul>
                <li>Personalized property matching</li>
                <li>Scheduled property tours</li>
                <li>Application assistance</li>
                <li>Lease review</li>
                <li>Move-in coordination</li>
            </ul>
        `,
        vendor: "Kasam Realty",
        product_type: "Service",
        tags: ["real-estate", "rental", "apartment", "kasam-realty"],
        status: "active",
        variants: [
            { option1: "Basic Search", price: "299.00", sku: "KR-RENT-BASIC", requires_shipping: false, taxable: false },
            { option1: "Full Service", price: "599.00", sku: "KR-RENT-FULL", requires_shipping: false, taxable: false }
        ],
        options: [{ name: "Service" }]
    }, realEstateCollection?.id, "Kasam Realty");

    await createProduct({
        title: "Property Investment Consultation",
        body_html: `
            <h3>Build Wealth Through Real Estate</h3>
            <p>Expert advice for real estate investors looking to build their portfolio.</p>
            <h4>Topics Covered:</h4>
            <ul>
                <li>Investment property analysis</li>
                <li>ROI calculations</li>
                <li>1031 exchange guidance</li>
                <li>Property management referrals</li>
                <li>Market timing strategies</li>
            </ul>
            <p><em>Perfect for first-time investors and experienced landlords alike.</em></p>
        `,
        vendor: "Kasam Realty",
        product_type: "Service",
        tags: ["real-estate", "investment", "property", "kasam-realty"],
        status: "active",
        variants: [
            { option1: "1-Hour Session", price: "150.00", sku: "KR-INVEST-1", requires_shipping: false, taxable: false },
            { option1: "Portfolio Review", price: "350.00", sku: "KR-INVEST-REVIEW", requires_shipping: false, taxable: false },
            { option1: "Ongoing Advisory (Monthly)", price: "500.00", sku: "KR-INVEST-MONTHLY", requires_shipping: false, taxable: false }
        ],
        options: [{ name: "Service" }]
    }, realEstateCollection?.id, "Kasam Realty");

    // ═══════════════════════════════════════════════════════════════
    // SELLER 4: SHANTI YOGA STUDIO - Yoga & Wellness
    // ═══════════════════════════════════════════════════════════════
    console.log('\n' + '━'.repeat(60));
    console.log('SELLER 4: SHANTI YOGA STUDIO - Yoga & Wellness');
    console.log('━'.repeat(60));

    const wellnessCollection = await getOrCreateCollection(
        "Wellness & Yoga",
        "<p>Mind, body, and spirit wellness services. Yoga, meditation, and holistic health from experienced practitioners.</p>"
    );

    console.log('\n  Creating products:');

    await createProduct({
        title: "Hatha Yoga Classes",
        body_html: `
            <h3>Traditional Hatha Yoga</h3>
            <p>Experience the foundational practice of yoga with emphasis on proper alignment, breathing, and relaxation.</p>
            <h4>Class Benefits:</h4>
            <ul>
                <li>Improved flexibility and strength</li>
                <li>Stress reduction</li>
                <li>Better posture</li>
                <li>Enhanced mind-body awareness</li>
            </ul>
            <p><em>Suitable for all levels. Mats provided.</em></p>
        `,
        vendor: "Shanti Yoga Studio",
        product_type: "Service",
        tags: ["yoga", "hatha", "wellness", "fitness", "shanti-yoga"],
        status: "active",
        variants: [
            { option1: "Drop-in Class", price: "18.00", sku: "SY-HATHA-1", requires_shipping: false, taxable: false },
            { option1: "5-Class Pack", price: "80.00", sku: "SY-HATHA-5", requires_shipping: false, taxable: false },
            { option1: "Monthly Unlimited", price: "120.00", sku: "SY-HATHA-UNLIM", requires_shipping: false, taxable: false }
        ],
        options: [{ name: "Package" }]
    }, wellnessCollection?.id, "Shanti Yoga Studio");

    await createProduct({
        title: "Meditation & Pranayama Workshop",
        body_html: `
            <h3>Calm Your Mind, Energize Your Spirit</h3>
            <p>Learn powerful meditation techniques and breathing exercises from the yogic tradition.</p>
            <h4>Workshop Covers:</h4>
            <ul>
                <li>Breath awareness (Pranayama)</li>
                <li>Guided meditation techniques</li>
                <li>Mantra meditation</li>
                <li>Creating a daily practice</li>
            </ul>
            <p><strong>Perfect for stress relief and mental clarity.</strong></p>
        `,
        vendor: "Shanti Yoga Studio",
        product_type: "Service",
        tags: ["meditation", "pranayama", "wellness", "mindfulness", "shanti-yoga"],
        status: "active",
        variants: [
            { option1: "Single Session", price: "25.00", sku: "SY-MED-1", requires_shipping: false, taxable: false },
            { option1: "4-Week Course", price: "90.00", sku: "SY-MED-4", requires_shipping: false, taxable: false },
            { option1: "Private Session", price: "75.00", sku: "SY-MED-PRIVATE", requires_shipping: false, taxable: false }
        ],
        options: [{ name: "Type" }]
    }, wellnessCollection?.id, "Shanti Yoga Studio");

    await createProduct({
        title: "Yoga Teacher Training (200 Hour)",
        body_html: `
            <h3>Become a Certified Yoga Instructor</h3>
            <p>Comprehensive 200-hour Yoga Alliance certified teacher training program.</p>
            <h4>Program Includes:</h4>
            <ul>
                <li>Asana technique and alignment</li>
                <li>Anatomy and physiology</li>
                <li>Yoga philosophy and history</li>
                <li>Teaching methodology</li>
                <li>Practicum experience</li>
            </ul>
            <p><em>Weekend intensive format. Scholarships available.</em></p>
        `,
        vendor: "Shanti Yoga Studio",
        product_type: "Service",
        tags: ["yoga", "teacher-training", "certification", "shanti-yoga"],
        status: "active",
        variants: [
            { option1: "Full Payment", price: "2800.00", sku: "SY-TT-FULL", requires_shipping: false, taxable: false },
            { option1: "Deposit (Payment Plan)", price: "500.00", sku: "SY-TT-DEPOSIT", requires_shipping: false, taxable: false }
        ],
        options: [{ name: "Payment Option" }]
    }, wellnessCollection?.id, "Shanti Yoga Studio");

    await createProduct({
        title: "Ayurvedic Wellness Consultation",
        body_html: `
            <h3>Personalized Ayurvedic Guidance</h3>
            <p>Discover your unique constitution (dosha) and receive customized lifestyle recommendations.</p>
            <h4>Consultation Includes:</h4>
            <ul>
                <li>Dosha assessment</li>
                <li>Dietary recommendations</li>
                <li>Daily routine (Dinacharya) guidance</li>
                <li>Herbal supplement suggestions</li>
                <li>Seasonal wellness tips</li>
            </ul>
        `,
        vendor: "Shanti Yoga Studio",
        product_type: "Service",
        tags: ["ayurveda", "wellness", "holistic", "health", "shanti-yoga"],
        status: "active",
        variants: [
            { option1: "Initial Consultation (90 min)", price: "125.00", sku: "SY-AYU-INIT", requires_shipping: false, taxable: false },
            { option1: "Follow-up (45 min)", price: "65.00", sku: "SY-AYU-FOLLOW", requires_shipping: false, taxable: false },
            { option1: "3-Month Program", price: "350.00", sku: "SY-AYU-PROGRAM", requires_shipping: false, taxable: false }
        ],
        options: [{ name: "Session Type" }]
    }, wellnessCollection?.id, "Shanti Yoga Studio");

    // ═══════════════════════════════════════════════════════════════
    // SELLER 5: GOVINDA'S CATERING - Indian Vegetarian Catering
    // ═══════════════════════════════════════════════════════════════
    console.log('\n' + '━'.repeat(60));
    console.log('SELLER 5: GOVINDA\'S CATERING - Vegetarian Catering');
    console.log('━'.repeat(60));

    const cateringCollection = await getOrCreateCollection(
        "Catering & Events",
        "<p>Professional catering services for your special occasions. Vegetarian, vegan, and sattvic options available.</p>"
    );

    console.log('\n  Creating products:');

    await createProduct({
        title: "Temple Feast Catering Package",
        body_html: `
            <h3>Authentic Sattvic Feast</h3>
            <p>Traditional temple-style vegetarian feast perfect for pujas, ceremonies, and spiritual gatherings.</p>
            <h4>Menu Includes:</h4>
            <ul>
                <li>Rice and Dal</li>
                <li>2 Vegetable preparations</li>
                <li>Paneer dish</li>
                <li>Chapati/Puri</li>
                <li>Raita and Pickle</li>
                <li>Sweet (Kheer/Halwa)</li>
            </ul>
            <p><em>Minimum 25 guests. Onion-garlic free options available.</em></p>
        `,
        vendor: "Govinda's Catering",
        product_type: "Service",
        tags: ["catering", "vegetarian", "sattvic", "temple", "govindas"],
        status: "active",
        variants: [
            { option1: "25-50 Guests (per person)", price: "25.00", sku: "GC-FEAST-SM", requires_shipping: false, taxable: false },
            { option1: "51-100 Guests (per person)", price: "22.00", sku: "GC-FEAST-MD", requires_shipping: false, taxable: false },
            { option1: "100+ Guests (per person)", price: "18.00", sku: "GC-FEAST-LG", requires_shipping: false, taxable: false }
        ],
        options: [{ name: "Group Size" }]
    }, cateringCollection?.id, "Govinda's Catering");

    await createProduct({
        title: "Birthday Party Catering",
        body_html: `
            <h3>Celebrate with Delicious Food!</h3>
            <p>Kid-friendly and adult-approved menu for birthday celebrations.</p>
            <h4>Package Options:</h4>
            <ul>
                <li>Finger foods and appetizers</li>
                <li>Main course options</li>
                <li>Birthday cake coordination</li>
                <li>Disposable plates and utensils included</li>
            </ul>
            <p><strong>We set up and clean up!</strong></p>
        `,
        vendor: "Govinda's Catering",
        product_type: "Service",
        tags: ["catering", "birthday", "party", "vegetarian", "govindas"],
        status: "active",
        variants: [
            { option1: "Basic (15-25 guests)", price: "399.00", sku: "GC-BDAY-BASIC", requires_shipping: false, taxable: false },
            { option1: "Standard (25-50 guests)", price: "699.00", sku: "GC-BDAY-STD", requires_shipping: false, taxable: false },
            { option1: "Premium (50-75 guests)", price: "999.00", sku: "GC-BDAY-PREM", requires_shipping: false, taxable: false }
        ],
        options: [{ name: "Package" }]
    }, cateringCollection?.id, "Govinda's Catering");

    await createProduct({
        title: "Weekly Tiffin Service",
        body_html: `
            <h3>Home-Cooked Meals Delivered</h3>
            <p>Fresh, healthy vegetarian meals delivered to your door. Perfect for busy families and professionals.</p>
            <h4>Each Meal Includes:</h4>
            <ul>
                <li>Rice or Roti</li>
                <li>Dal</li>
                <li>2 Vegetable dishes</li>
                <li>Salad/Raita</li>
            </ul>
            <p><em>Delivery Mon-Fri. Weekend pickup available.</em></p>
        `,
        vendor: "Govinda's Catering",
        product_type: "Food",
        tags: ["tiffin", "meal-delivery", "vegetarian", "healthy", "govindas"],
        status: "active",
        variants: [
            { option1: "5 Days (Lunch)", price: "75.00", sku: "GC-TIFFIN-5L", requires_shipping: false, taxable: false },
            { option1: "5 Days (Lunch + Dinner)", price: "140.00", sku: "GC-TIFFIN-5LD", requires_shipping: false, taxable: false },
            { option1: "Monthly (20 Lunches)", price: "280.00", sku: "GC-TIFFIN-20", requires_shipping: false, taxable: false }
        ],
        options: [{ name: "Plan" }]
    }, cateringCollection?.id, "Govinda's Catering");

    await createProduct({
        title: "Wedding Catering Consultation",
        body_html: `
            <h3>Make Your Special Day Delicious</h3>
            <p>Full-service wedding catering with customized menus for your perfect day.</p>
            <h4>Services Include:</h4>
            <ul>
                <li>Menu planning and tasting</li>
                <li>Venue coordination</li>
                <li>Professional serving staff</li>
                <li>Decorative food displays</li>
                <li>Multi-day event packages</li>
            </ul>
            <p><em>Specializing in traditional Indian weddings and fusion menus.</em></p>
        `,
        vendor: "Govinda's Catering",
        product_type: "Service",
        tags: ["catering", "wedding", "events", "govindas"],
        status: "active",
        variants: [
            { option1: "Consultation + Tasting", price: "150.00", sku: "GC-WED-CONSULT", requires_shipping: false, taxable: false },
            { option1: "Deposit (towards full package)", price: "1000.00", sku: "GC-WED-DEPOSIT", requires_shipping: false, taxable: false }
        ],
        options: [{ name: "Service" }]
    }, cateringCollection?.id, "Govinda's Catering");

    // ═══════════════════════════════════════════════════════════════
    // SUMMARY
    // ═══════════════════════════════════════════════════════════════
    console.log('\n' + '═'.repeat(60));
    console.log('  ALL SELLERS AND PRODUCTS CREATED SUCCESSFULLY!');
    console.log('═'.repeat(60));
    console.log(`
┌────────────────────────────────────────────────────────────┐
│  SELLERS CREATED                                           │
├────────────────────────────────────────────────────────────┤
│  1. Prabhu Pizza             - Pizza Delivery (4 products) │
│  2. Radha Sangeet Academy    - Music Classes (4 products)  │
│  3. Kasam Realty             - Real Estate (4 products)    │
│  4. Shanti Yoga Studio       - Yoga & Wellness (4 products)│
│  5. Govinda's Catering       - Catering (4 products)       │
├────────────────────────────────────────────────────────────┤
│  TOTAL: 5 Sellers, 20 Products                             │
└────────────────────────────────────────────────────────────┘

COLLECTIONS CREATED:
  • Food & Delivery
  • Classes & Workshops
  • Real Estate Services
  • Wellness & Yoga
  • Catering & Events

VIEW YOUR MARKETPLACE:
  https://${SHOP}/collections/all

TO COMPLETE WEBKUL SETUP:
  1. Go to Webkul Admin > Sellers > Add Seller
  2. Create each seller with matching email
  3. Assign products to respective sellers

    `);
}

main().catch(console.error);
