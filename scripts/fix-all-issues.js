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
    const themeId = 157097328865;

    console.log('=== FIXING ALL ISSUES ===\n');

    // 1. Fix Homepage - Add ALL categories
    console.log('1. Updating Homepage with ALL categories...\n');

    const updatedHomepage = {
        "sections": {
            "iskcon-hero": {
                "type": "iskcon-hero",
                "settings": {}
            },
            "featured-categories": {
                "type": "collection-list",
                "blocks": {
                    "cat1": { "type": "featured_collection", "settings": { "collection": "puja-items" } },
                    "cat2": { "type": "featured_collection", "settings": { "collection": "books-media-1" } },
                    "cat3": { "type": "featured_collection", "settings": { "collection": "garlands-malas" } },
                    "cat4": { "type": "featured_collection", "settings": { "collection": "health-wellness-1" } },
                    "cat5": { "type": "featured_collection", "settings": { "collection": "plants-garden" } },
                    "cat6": { "type": "featured_collection", "settings": { "collection": "catering-food" } },
                    "cat7": { "type": "featured_collection", "settings": { "collection": "financial-services" } },
                    "cat8": { "type": "featured_collection", "settings": { "collection": "education-services" } },
                    "cat9": { "type": "featured_collection", "settings": { "collection": "music-lessons" } },
                    "cat10": { "type": "featured_collection", "settings": { "collection": "yoga-wellness" } },
                    "cat11": { "type": "featured_collection", "settings": { "collection": "real-estate-services" } }
                },
                "block_order": ["cat1", "cat2", "cat3", "cat4", "cat5", "cat6", "cat7", "cat8", "cat9", "cat10", "cat11"],
                "settings": {
                    "title": "Shop by Category",
                    "heading_size": "h1",
                    "image_ratio": "square",
                    "columns_desktop": 4,
                    "color_scheme": "background-1",
                    "show_view_all": true,
                    "columns_mobile": "2",
                    "swipe_on_mobile": true,
                    "padding_top": 40,
                    "padding_bottom": 52
                }
            },
            "featured-products": {
                "type": "featured-collection",
                "custom_css": [
                    ".slider-buttons {position: absolute; top: 50%; transform: translateY(-50%); width: 100%; display: flex; justify-content: space-between; padding: 0 10px; pointer-events: none;}",
                    ".slider-button {pointer-events: auto; background: rgba(255,255,255,0.9); border-radius: 50%; padding: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);}",
                    ".collection {padding: 0 20px; max-width: calc(100% - 40px); margin: 0 auto;}"
                ],
                "settings": {
                    "title": "Featured Products",
                    "heading_size": "h1",
                    "description": "",
                    "show_description": false,
                    "description_style": "body",
                    "collection": "all",
                    "products_to_show": 12,
                    "columns_desktop": 4,
                    "full_width": false,
                    "show_view_all": true,
                    "view_all_style": "solid",
                    "enable_desktop_slider": true,
                    "color_scheme": "background-2",
                    "image_ratio": "square",
                    "show_secondary_image": true,
                    "show_vendor": true,
                    "show_rating": false,
                    "enable_quick_add": true,
                    "columns_mobile": "2",
                    "swipe_on_mobile": true,
                    "padding_top": 40,
                    "padding_bottom": 52
                }
            },
            "featured-sellers": {
                "type": "collection-list",
                "blocks": {
                    "s1": { "type": "featured_collection", "settings": { "collection": "govinda-books" } },
                    "s2": { "type": "featured_collection", "settings": { "collection": "vrindavan-garlands" } },
                    "s3": { "type": "featured_collection", "settings": { "collection": "deity-seva-store" } },
                    "s4": { "type": "featured_collection", "settings": { "collection": "prabhu-pizza" } },
                    "s5": { "type": "featured_collection", "settings": { "collection": "govindas-catering" } },
                    "s6": { "type": "featured_collection", "settings": { "collection": "tulsi-nursery" } },
                    "s7": { "type": "featured_collection", "settings": { "collection": "ayur-wellness" } },
                    "s8": { "type": "featured_collection", "settings": { "collection": "artha-financial-wisdom" } },
                    "s9": { "type": "featured_collection", "settings": { "collection": "vidya-college-mentors" } },
                    "s10": { "type": "featured_collection", "settings": { "collection": "radha-sangeet-music-academy" } },
                    "s11": { "type": "featured_collection", "settings": { "collection": "shanti-yoga-studio" } },
                    "s12": { "type": "featured_collection", "settings": { "collection": "kasam-realty" } }
                },
                "block_order": ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10", "s11", "s12"],
                "settings": {
                    "title": "Our Sellers",
                    "heading_size": "h1",
                    "image_ratio": "square",
                    "columns_desktop": 4,
                    "color_scheme": "background-1",
                    "show_view_all": true,
                    "columns_mobile": "2",
                    "swipe_on_mobile": true,
                    "padding_top": 40,
                    "padding_bottom": 52
                }
            }
        },
        "order": [
            "iskcon-hero",
            "featured-categories",
            "featured-products",
            "featured-sellers"
        ]
    };

    const homepageResult = await shopifyRequest('PUT', `/themes/${themeId}/assets.json`, {
        asset: {
            key: 'templates/index.json',
            value: JSON.stringify(updatedHomepage, null, 2)
        }
    });

    if (homepageResult.status === 200) {
        console.log('✓ Homepage updated with 11 categories and 12 sellers');
    } else {
        console.log('✗ Homepage update failed:', homepageResult.status);
    }

    // 2. Fix list-collections template to show all collections
    console.log('\n2. Updating Collections List page...\n');

    const collectionsTemplate = {
        "sections": {
            "main": {
                "type": "main-list-collections",
                "settings": {
                    "title": "All Collections",
                    "sort": "alphabetical",
                    "image_ratio": "square",
                    "columns_desktop": 4,
                    "columns_mobile": "2"
                }
            }
        },
        "order": ["main"]
    };

    const collectionsResult = await shopifyRequest('PUT', `/themes/${themeId}/assets.json`, {
        asset: {
            key: 'templates/list-collections.json',
            value: JSON.stringify(collectionsTemplate, null, 2)
        }
    });

    if (collectionsResult.status === 200) {
        console.log('✓ Collections page updated to show ALL collections');
    }

    // 3. Fix Brahmi Hair Oil image
    console.log('\n3. Fixing Brahmi Hair Oil image...\n');

    // Delete existing images first
    const brahmiProducts = [9282264989921, 9282275016929];

    for (const productId of brahmiProducts) {
        // Get existing images
        const imagesResult = await shopifyRequest('GET', `/products/${productId}/images.json`);
        const images = imagesResult.data.images || [];

        // Delete old images
        for (const img of images) {
            await shopifyRequest('DELETE', `/products/${productId}/images/${img.id}.json`);
        }

        // Add new appropriate image - Ayurvedic oil bottle
        const addResult = await shopifyRequest('POST', `/products/${productId}/images.json`, {
            image: {
                src: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800',
                alt: 'Brahmi Ayurvedic Hair Oil'
            }
        });

        if (addResult.status === 200 || addResult.status === 201) {
            console.log(`✓ Fixed Brahmi Oil image for product ${productId}`);
        }

        await new Promise(r => setTimeout(r, 500));
    }

    // 4. Add custom CSS for carousel improvements
    console.log('\n4. Adding carousel styling improvements...\n');

    // Get current settings
    const settingsResult = await shopifyRequest('GET', `/themes/${themeId}/assets.json?asset[key]=config/settings_data.json`);
    let settings = JSON.parse(settingsResult.data.asset.value);

    // Update settings
    if (settings.current === "Default" && settings.presets && settings.presets.Default) {
        settings.presets.Default.page_width = 1400;
        settings.presets.Default.spacing_sections = 24;
    }

    const settingsUpdateResult = await shopifyRequest('PUT', `/themes/${themeId}/assets.json`, {
        asset: {
            key: 'config/settings_data.json',
            value: JSON.stringify(settings, null, 2)
        }
    });

    if (settingsUpdateResult.status === 200) {
        console.log('✓ Theme settings updated for better spacing');
    }

    // 5. List all collections to verify
    console.log('\n5. Listing all collections...\n');

    const allCollections = await shopifyRequest('GET', '/smart_collections.json?limit=250');
    const collections = allCollections.data.smart_collections || [];

    console.log(`Total smart collections: ${collections.length}`);
    for (const col of collections) {
        console.log(`  - ${col.title} (/collections/${col.handle})`);
    }

    // Also check custom collections
    const customCollections = await shopifyRequest('GET', '/custom_collections.json?limit=250');
    const customs = customCollections.data.custom_collections || [];

    if (customs.length > 0) {
        console.log(`\nCustom collections: ${customs.length}`);
        for (const col of customs) {
            console.log(`  - ${col.title} (/collections/${col.handle})`);
        }
    }

    console.log('\n=== ALL FIXES COMPLETE ===');
}

main().catch(console.error);
