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
                console.log(`Status: ${res.statusCode}`);
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

async function main() {
    console.log('=== Creating Singing Classes Seller & Products ===\n');

    // Step 1: Create a customer account for the seller
    console.log('1. Creating customer account for singing teacher...');

    const customerData = {
        customer: {
            first_name: "Radha",
            last_name: "Sangeet",
            email: "radha.sangeet@example.com",
            verified_email: true,
            tags: ["seller", "services", "singing-teacher"],
            note: "Singing teacher offering Carnatic and Bhajan classes. Approved seller.",
            addresses: [
                {
                    address1: "123 Temple Road",
                    city: "San Francisco",
                    province: "California",
                    country: "United States",
                    zip: "94102",
                    first_name: "Radha",
                    last_name: "Sangeet",
                    default: true
                }
            ]
        }
    };

    const createCustomer = await shopifyRequest('POST', '/customers.json', customerData);

    if (createCustomer.status === 201 || createCustomer.status === 200) {
        console.log('✓ Customer account created!');
        console.log('  Customer ID:', createCustomer.data.customer.id);
        console.log('  Name:', createCustomer.data.customer.first_name, createCustomer.data.customer.last_name);
        console.log('  Email:', createCustomer.data.customer.email);
    } else if (createCustomer.data?.errors?.email) {
        console.log('Customer already exists, continuing with product creation...');
    } else {
        console.log('Customer creation result:', JSON.stringify(createCustomer, null, 2));
    }

    // Step 2: Create "Services" collection if it doesn't exist
    console.log('\n2. Setting up Services collection...');

    const collections = await shopifyRequest('GET', '/custom_collections.json');
    let servicesCollection = collections.data.custom_collections?.find(c =>
        c.title.toLowerCase().includes('service') || c.title.toLowerCase().includes('class')
    );

    if (!servicesCollection) {
        console.log('Creating "Classes & Services" collection...');
        const collectionResult = await shopifyRequest('POST', '/custom_collections.json', {
            custom_collection: {
                title: "Classes & Services",
                body_html: "<p>Book classes and services from our community teachers and service providers.</p>",
                published: true
            }
        });

        if (collectionResult.status === 201) {
            servicesCollection = collectionResult.data.custom_collection;
            console.log('✓ Collection created:', servicesCollection.title);
        }
    } else {
        console.log('✓ Services collection exists:', servicesCollection.title);
    }

    // Step 3: Create singing class products
    console.log('\n3. Creating singing class products...');

    const sellerMetafield = {
        metafield: {
            namespace: "marketplace",
            key: "seller_name",
            value: "Radha Sangeet Music Academy",
            type: "single_line_text_field"
        }
    };

    // Product 1: Carnatic Singing Classes
    const carnaticClassData = {
        product: {
            title: "Carnatic Singing Classes - Beginner",
            body_html: `
                <h3>Learn the Classical Art of Carnatic Music</h3>
                <p>Join our beginner-friendly Carnatic singing classes led by experienced teacher Radha Sangeet.
                Perfect for those new to Indian classical music or looking to strengthen their foundations.</p>

                <h4>What You'll Learn:</h4>
                <ul>
                    <li>Basic swaras (notes) and their positions</li>
                    <li>Sarali varisai (basic exercises)</li>
                    <li>Simple devotional songs (kritis)</li>
                    <li>Proper breathing techniques</li>
                    <li>Shruti (pitch) awareness</li>
                </ul>

                <h4>Class Details:</h4>
                <ul>
                    <li>Duration: 1 hour per session</li>
                    <li>Mode: Online (Zoom) or In-person</li>
                    <li>Materials provided: Practice recordings, notation sheets</li>
                </ul>

                <p><em>Taught by Radha Sangeet, trained under renowned gurus with 15+ years of teaching experience.</em></p>
            `,
            vendor: "Radha Sangeet Music Academy",
            product_type: "Service",
            tags: ["singing", "music", "carnatic", "classes", "beginner", "indian-classical", "radha-sangeet"],
            status: "active",
            variants: [
                {
                    option1: "Single Class",
                    price: "35.00",
                    sku: "RS-CARN-1",
                    requires_shipping: false,
                    taxable: false
                },
                {
                    option1: "4-Class Package",
                    price: "120.00",
                    sku: "RS-CARN-4",
                    requires_shipping: false,
                    taxable: false
                },
                {
                    option1: "Monthly (8 Classes)",
                    price: "220.00",
                    sku: "RS-CARN-8",
                    requires_shipping: false,
                    taxable: false
                }
            ],
            options: [
                {
                    name: "Package"
                }
            ]
        }
    };

    const carnaticProduct = await shopifyRequest('POST', '/products.json', carnaticClassData);

    if (carnaticProduct.status === 201 || carnaticProduct.status === 200) {
        console.log('✓ Carnatic Singing Classes created!');
        console.log('  Product ID:', carnaticProduct.data.product.id);
        console.log('  URL: https://' + SHOP + '/products/' + carnaticProduct.data.product.handle);

        // Add to collection
        if (servicesCollection) {
            await shopifyRequest('POST', '/collects.json', {
                collect: {
                    product_id: carnaticProduct.data.product.id,
                    collection_id: servicesCollection.id
                }
            });
            console.log('  ✓ Added to Classes & Services collection');
        }

        // Add seller metafield
        await shopifyRequest('POST', `/products/${carnaticProduct.data.product.id}/metafields.json`, sellerMetafield);
    } else {
        console.log('Error creating Carnatic product:', JSON.stringify(carnaticProduct.data, null, 2));
    }

    // Product 2: Bhajan Classes
    const bhajanClassData = {
        product: {
            title: "Devotional Bhajan Singing Classes",
            body_html: `
                <h3>Learn Beautiful Devotional Bhajans</h3>
                <p>Immerse yourself in the spiritual experience of singing devotional bhajans.
                Learn popular bhajans from various traditions including Krishna bhajans, Ram bhajans, and more.</p>

                <h4>What You'll Learn:</h4>
                <ul>
                    <li>Popular bhajans from ISKCON tradition</li>
                    <li>Traditional Vaishnava bhajans</li>
                    <li>Proper pronunciation of Sanskrit lyrics</li>
                    <li>Basic harmonium accompaniment</li>
                    <li>Group singing techniques</li>
                </ul>

                <h4>Class Details:</h4>
                <ul>
                    <li>Duration: 1 hour per session</li>
                    <li>Suitable for all levels</li>
                    <li>Group classes available</li>
                    <li>Mode: Online or In-person</li>
                </ul>

                <p><em>Perfect for temple devotees and spiritual seekers.</em></p>
            `,
            vendor: "Radha Sangeet Music Academy",
            product_type: "Service",
            tags: ["singing", "bhajan", "devotional", "classes", "spiritual", "krishna", "iskcon", "radha-sangeet"],
            status: "active",
            variants: [
                {
                    option1: "Single Class",
                    price: "25.00",
                    sku: "RS-BHAJ-1",
                    requires_shipping: false,
                    taxable: false
                },
                {
                    option1: "4-Class Package",
                    price: "90.00",
                    sku: "RS-BHAJ-4",
                    requires_shipping: false,
                    taxable: false
                },
                {
                    option1: "Monthly (8 Classes)",
                    price: "160.00",
                    sku: "RS-BHAJ-8",
                    requires_shipping: false,
                    taxable: false
                }
            ],
            options: [
                {
                    name: "Package"
                }
            ]
        }
    };

    const bhajanProduct = await shopifyRequest('POST', '/products.json', bhajanClassData);

    if (bhajanProduct.status === 201 || bhajanProduct.status === 200) {
        console.log('\n✓ Bhajan Singing Classes created!');
        console.log('  Product ID:', bhajanProduct.data.product.id);
        console.log('  URL: https://' + SHOP + '/products/' + bhajanProduct.data.product.handle);

        if (servicesCollection) {
            await shopifyRequest('POST', '/collects.json', {
                collect: {
                    product_id: bhajanProduct.data.product.id,
                    collection_id: servicesCollection.id
                }
            });
            console.log('  ✓ Added to Classes & Services collection');
        }

        await shopifyRequest('POST', `/products/${bhajanProduct.data.product.id}/metafields.json`, sellerMetafield);
    }

    // Product 3: Kids Singing Classes
    const kidsClassData = {
        product: {
            title: "Kids Singing Classes (Ages 5-12)",
            body_html: `
                <h3>Fun Singing Classes for Children!</h3>
                <p>Introduce your children to the joy of music with our specially designed kids' singing program.
                Fun, engaging, and educational!</p>

                <h4>What Your Child Will Learn:</h4>
                <ul>
                    <li>Basic musical concepts through games</li>
                    <li>Simple bhajans and shlokas</li>
                    <li>Rhythm and melody recognition</li>
                    <li>Confidence in singing</li>
                    <li>Fun music activities</li>
                </ul>

                <h4>Class Details:</h4>
                <ul>
                    <li>Duration: 45 minutes per session</li>
                    <li>Age group: 5-12 years</li>
                    <li>Small batch sizes (max 5 kids)</li>
                    <li>Weekend classes available</li>
                </ul>

                <p><em>Watch your child develop a love for music in a nurturing environment!</em></p>
            `,
            vendor: "Radha Sangeet Music Academy",
            product_type: "Service",
            tags: ["singing", "kids", "children", "classes", "music-education", "radha-sangeet"],
            status: "active",
            variants: [
                {
                    option1: "Single Class",
                    price: "20.00",
                    sku: "RS-KIDS-1",
                    requires_shipping: false,
                    taxable: false
                },
                {
                    option1: "4-Class Package",
                    price: "70.00",
                    sku: "RS-KIDS-4",
                    requires_shipping: false,
                    taxable: false
                },
                {
                    option1: "Monthly (8 Classes)",
                    price: "130.00",
                    sku: "RS-KIDS-8",
                    requires_shipping: false,
                    taxable: false
                }
            ],
            options: [
                {
                    name: "Package"
                }
            ]
        }
    };

    const kidsProduct = await shopifyRequest('POST', '/products.json', kidsClassData);

    if (kidsProduct.status === 201 || kidsProduct.status === 200) {
        console.log('\n✓ Kids Singing Classes created!');
        console.log('  Product ID:', kidsProduct.data.product.id);
        console.log('  URL: https://' + SHOP + '/products/' + kidsProduct.data.product.handle);

        if (servicesCollection) {
            await shopifyRequest('POST', '/collects.json', {
                collect: {
                    product_id: kidsProduct.data.product.id,
                    collection_id: servicesCollection.id
                }
            });
            console.log('  ✓ Added to Classes & Services collection');
        }

        await shopifyRequest('POST', `/products/${kidsProduct.data.product.id}/metafields.json`, sellerMetafield);
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('=== SELLER CREATED SUCCESSFULLY ===');
    console.log('='.repeat(50));
    console.log('\nSeller: Radha Sangeet Music Academy');
    console.log('Email: radha.sangeet@example.com');
    console.log('\nProducts Created:');
    console.log('1. Carnatic Singing Classes - Beginner ($35-$220)');
    console.log('2. Devotional Bhajan Singing Classes ($25-$160)');
    console.log('3. Kids Singing Classes Ages 5-12 ($20-$130)');
    console.log('\nView all products at:');
    console.log('https://' + SHOP + '/collections/classes-services');
    console.log('\n' + '='.repeat(50));
    console.log('\nNOTE: To complete seller setup in Webkul:');
    console.log('1. Go to Webkul Admin > Sellers > Add Seller');
    console.log('2. Create seller "Radha Sangeet Music Academy"');
    console.log('3. Assign email: radha.sangeet@example.com');
    console.log('4. Assign the products to this seller in Webkul');
    console.log('='.repeat(50));
}

main().catch(console.error);
