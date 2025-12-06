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

    console.log('=== Updating Homepage ===\n');

    // New homepage template - clean and professional
    const newHomepage = {
        "sections": {
            "hero-banner": {
                "type": "image-banner",
                "blocks": {
                    "heading": {
                        "type": "heading",
                        "settings": {
                            "heading": "Seva Marketplace",
                            "heading_size": "h0"
                        }
                    },
                    "subheading": {
                        "type": "text",
                        "settings": {
                            "text": "Sacred products and services from our temple community",
                            "text_style": "subtitle"
                        }
                    },
                    "buttons": {
                        "type": "buttons",
                        "settings": {
                            "button_label_1": "Browse Products",
                            "button_link_1": "shopify://collections/all",
                            "button_style_secondary_1": false,
                            "button_label_2": "View Sellers",
                            "button_link_2": "/pages/browse",
                            "button_style_secondary_2": true
                        }
                    }
                },
                "block_order": ["heading", "subheading", "buttons"],
                "settings": {
                    "image_overlay_opacity": 40,
                    "image_height": "medium",
                    "desktop_content_position": "middle-center",
                    "show_text_box": false,
                    "desktop_content_alignment": "center",
                    "color_scheme": "background-1",
                    "image_behavior": "none",
                    "mobile_content_alignment": "center",
                    "stack_images_on_mobile": true,
                    "show_text_below": false
                }
            },
            "featured-categories": {
                "type": "collection-list",
                "blocks": {
                    "cat1": {
                        "type": "featured_collection",
                        "settings": {
                            "collection": "puja-items"
                        }
                    },
                    "cat2": {
                        "type": "featured_collection",
                        "settings": {
                            "collection": "books-media-1"
                        }
                    },
                    "cat3": {
                        "type": "featured_collection",
                        "settings": {
                            "collection": "garlands-malas"
                        }
                    },
                    "cat4": {
                        "type": "featured_collection",
                        "settings": {
                            "collection": "health-wellness-1"
                        }
                    }
                },
                "block_order": ["cat1", "cat2", "cat3", "cat4"],
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
                    "padding_bottom": 40
                }
            },
            "featured-products": {
                "type": "featured-collection",
                "settings": {
                    "title": "Featured Products",
                    "heading_size": "h1",
                    "description": "",
                    "show_description": false,
                    "description_style": "body",
                    "collection": "all",
                    "products_to_show": 8,
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
                    "padding_bottom": 40
                }
            },
            "featured-sellers": {
                "type": "collection-list",
                "blocks": {
                    "seller1": {
                        "type": "featured_collection",
                        "settings": {
                            "collection": "govinda-books"
                        }
                    },
                    "seller2": {
                        "type": "featured_collection",
                        "settings": {
                            "collection": "vrindavan-garlands"
                        }
                    },
                    "seller3": {
                        "type": "featured_collection",
                        "settings": {
                            "collection": "deity-seva-store"
                        }
                    },
                    "seller4": {
                        "type": "featured_collection",
                        "settings": {
                            "collection": "ayur-wellness"
                        }
                    }
                },
                "block_order": ["seller1", "seller2", "seller3", "seller4"],
                "settings": {
                    "title": "Featured Sellers",
                    "heading_size": "h1",
                    "image_ratio": "square",
                    "columns_desktop": 4,
                    "color_scheme": "background-1",
                    "show_view_all": true,
                    "columns_mobile": "2",
                    "swipe_on_mobile": true,
                    "padding_top": 40,
                    "padding_bottom": 40
                }
            }
        },
        "order": [
            "hero-banner",
            "featured-categories",
            "featured-products",
            "featured-sellers"
        ]
    };

    // Update the homepage template
    const result = await shopifyRequest('PUT', `/themes/${themeId}/assets.json`, {
        asset: {
            key: 'templates/index.json',
            value: JSON.stringify(newHomepage, null, 2)
        }
    });

    if (result.status === 200) {
        console.log('✓ Homepage updated successfully!');
        console.log('\nNew homepage sections:');
        console.log('  1. Hero Banner - Seva Marketplace welcome');
        console.log('  2. Shop by Category - 4 main categories');
        console.log('  3. Featured Products - Carousel slider with 8 products');
        console.log('  4. Featured Sellers - 4 top sellers');
        console.log('\nRemoved:');
        console.log('  - Stay Hydrated section');
        console.log('  - Old test data banner');
        console.log('  - Hydrogen collection reference');
        console.log('  - Empty circles');
    } else {
        console.log('Failed:', result.status, JSON.stringify(result.data));
    }

    // Now delete the Hydrogen collection
    console.log('\n=== Removing Hydrogen Collection ===\n');

    // Get all collections to find Hydrogen
    const collectionsResult = await shopifyRequest('GET', '/custom_collections.json');
    const customCollections = collectionsResult.data.custom_collections || [];

    const hydrogenCollection = customCollections.find(c => c.handle === 'hydrogen' || c.title.toLowerCase() === 'hydrogen');

    if (hydrogenCollection) {
        const deleteResult = await shopifyRequest('DELETE', `/custom_collections/${hydrogenCollection.id}.json`);
        if (deleteResult.status === 200) {
            console.log('✓ Hydrogen collection deleted');
        } else {
            console.log('Failed to delete Hydrogen:', deleteResult.status);
        }
    } else {
        // Try smart collections
        const smartResult = await shopifyRequest('GET', '/smart_collections.json');
        const smartCollections = smartResult.data.smart_collections || [];
        const hydrogenSmart = smartCollections.find(c => c.handle === 'hydrogen' || c.title.toLowerCase() === 'hydrogen');

        if (hydrogenSmart) {
            const deleteResult = await shopifyRequest('DELETE', `/smart_collections/${hydrogenSmart.id}.json`);
            if (deleteResult.status === 200) {
                console.log('✓ Hydrogen collection deleted');
            }
        } else {
            console.log('Hydrogen collection not found');
        }
    }

    console.log('\n=== Done! ===');
}

main().catch(console.error);
