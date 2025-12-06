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

// GraphQL request helper
function shopifyGraphQL(query, variables = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SHOP,
            port: 443,
            path: '/admin/api/2024-01/graphql.json',
            method: 'POST',
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
        req.write(JSON.stringify({ query, variables }));
        req.end();
    });
}

async function main() {
    console.log('=== Adding Test Product for Seller: Prabhu Pizza ===\n');

    // Step 1: Create a test product
    console.log('1. Creating test product...');

    const productData = {
        product: {
            title: "Margherita Pizza",
            body_html: "<p>Delicious homemade Margherita pizza with fresh mozzarella, tomatoes, and basil. Made with love by Prabhu Pizza.</p><p><strong>Ingredients:</strong> Fresh dough, San Marzano tomatoes, fresh mozzarella, fresh basil, extra virgin olive oil</p>",
            vendor: "Prabhu Pizza",
            product_type: "Food",
            tags: ["pizza", "italian", "vegetarian", "homemade", "prabhu-pizza"],
            status: "active",
            variants: [
                {
                    title: "Small (8 inch)",
                    price: "12.99",
                    sku: "PP-MARG-S",
                    inventory_management: "shopify",
                    inventory_quantity: 50
                },
                {
                    title: "Medium (12 inch)",
                    price: "18.99",
                    sku: "PP-MARG-M",
                    inventory_management: "shopify",
                    inventory_quantity: 50
                },
                {
                    title: "Large (16 inch)",
                    price: "24.99",
                    sku: "PP-MARG-L",
                    inventory_management: "shopify",
                    inventory_quantity: 50
                }
            ],
            options: [
                {
                    name: "Size",
                    values: ["Small (8 inch)", "Medium (12 inch)", "Large (16 inch)"]
                }
            ]
        }
    };

    const createProduct = await shopifyRequest('POST', '/products.json', productData);

    if (createProduct.status === 201 || createProduct.status === 200) {
        console.log('✓ Product created successfully!');
        console.log('  Product ID:', createProduct.data.product.id);
        console.log('  Title:', createProduct.data.product.title);
        console.log('  Vendor:', createProduct.data.product.vendor);
        console.log('  Handle:', createProduct.data.product.handle);
        console.log('  URL: https://' + SHOP + '/products/' + createProduct.data.product.handle);

        const productId = createProduct.data.product.id;

        // Step 2: Add product to a collection
        console.log('\n2. Adding product to collections...');

        // Get existing collections
        const collections = await shopifyRequest('GET', '/custom_collections.json');
        console.log('Found collections:', collections.data.custom_collections?.map(c => c.title) || 'None');

        // Create a "Food" collection if it doesn't exist
        let foodCollection = collections.data.custom_collections?.find(c =>
            c.title.toLowerCase().includes('food') || c.title.toLowerCase().includes('pizza')
        );

        if (!foodCollection) {
            console.log('Creating "Food & Snacks" collection...');
            const collectionResult = await shopifyRequest('POST', '/custom_collections.json', {
                custom_collection: {
                    title: "Food & Snacks",
                    body_html: "<p>Delicious homemade food items from our marketplace sellers.</p>",
                    published: true
                }
            });

            if (collectionResult.status === 201) {
                foodCollection = collectionResult.data.custom_collection;
                console.log('✓ Collection created:', foodCollection.title);
            }
        }

        if (foodCollection) {
            // Add product to collection
            const collectResult = await shopifyRequest('POST', '/collects.json', {
                collect: {
                    product_id: productId,
                    collection_id: foodCollection.id
                }
            });

            if (collectResult.status === 201) {
                console.log('✓ Product added to collection:', foodCollection.title);
            } else {
                console.log('Collection add result:', collectResult.status);
            }
        }

        // Step 3: Add metafield to associate with seller
        console.log('\n3. Adding seller metafield...');

        const metafieldData = {
            metafield: {
                namespace: "marketplace",
                key: "seller_name",
                value: "Prabhu Pizza",
                type: "single_line_text_field"
            }
        };

        const metafieldResult = await shopifyRequest('POST', `/products/${productId}/metafields.json`, metafieldData);

        if (metafieldResult.status === 201 || metafieldResult.status === 200) {
            console.log('✓ Seller metafield added');
        } else {
            console.log('Metafield result:', metafieldResult.status);
        }

        // Step 4: Create a second product
        console.log('\n4. Creating second test product...');

        const product2Data = {
            product: {
                title: "Veggie Supreme Pizza",
                body_html: "<p>Loaded vegetable pizza with bell peppers, mushrooms, olives, onions, and extra cheese. A vegetarian delight from Prabhu Pizza!</p>",
                vendor: "Prabhu Pizza",
                product_type: "Food",
                tags: ["pizza", "italian", "vegetarian", "homemade", "prabhu-pizza", "veggie"],
                status: "active",
                variants: [
                    {
                        title: "Small (8 inch)",
                        price: "14.99",
                        sku: "PP-VEG-S",
                        inventory_management: "shopify",
                        inventory_quantity: 30
                    },
                    {
                        title: "Medium (12 inch)",
                        price: "21.99",
                        sku: "PP-VEG-M",
                        inventory_management: "shopify",
                        inventory_quantity: 30
                    },
                    {
                        title: "Large (16 inch)",
                        price: "28.99",
                        sku: "PP-VEG-L",
                        inventory_management: "shopify",
                        inventory_quantity: 30
                    }
                ],
                options: [
                    {
                        name: "Size",
                        values: ["Small (8 inch)", "Medium (12 inch)", "Large (16 inch)"]
                    }
                ]
            }
        };

        const createProduct2 = await shopifyRequest('POST', '/products.json', product2Data);

        if (createProduct2.status === 201 || createProduct2.status === 200) {
            console.log('✓ Second product created!');
            console.log('  Product ID:', createProduct2.data.product.id);
            console.log('  Title:', createProduct2.data.product.title);
            console.log('  URL: https://' + SHOP + '/products/' + createProduct2.data.product.handle);

            // Add to collection
            if (foodCollection) {
                await shopifyRequest('POST', '/collects.json', {
                    collect: {
                        product_id: createProduct2.data.product.id,
                        collection_id: foodCollection.id
                    }
                });
                console.log('✓ Added to Food & Snacks collection');
            }

            // Add seller metafield
            await shopifyRequest('POST', `/products/${createProduct2.data.product.id}/metafields.json`, metafieldData);
            console.log('✓ Seller metafield added');
        }

        console.log('\n=== Summary ===');
        console.log('Created 2 products for seller "Prabhu Pizza":');
        console.log('1. Margherita Pizza - $12.99 to $24.99');
        console.log('2. Veggie Supreme Pizza - $14.99 to $28.99');
        console.log('\nView products at:');
        console.log('- https://' + SHOP + '/collections/all');
        console.log('- https://' + SHOP + '/products/margherita-pizza');
        console.log('- https://' + SHOP + '/products/veggie-supreme-pizza');

    } else {
        console.log('Error creating product:', JSON.stringify(createProduct, null, 2));
    }

    console.log('\n=== Done ===');
}

main().catch(console.error);
