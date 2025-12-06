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

    console.log('=== Restoring Homepage with Original Banner ===\n');

    // Restore homepage with the iskcon-hero section and better layout
    const restoredHomepage = {
        "sections": {
            "iskcon-hero": {
                "type": "iskcon-hero",
                "settings": {}
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
                    },
                    "cat5": {
                        "type": "featured_collection",
                        "settings": {
                            "collection": "plants-garden"
                        }
                    },
                    "cat6": {
                        "type": "featured_collection",
                        "settings": {
                            "collection": "catering-food"
                        }
                    }
                },
                "block_order": ["cat1", "cat2", "cat3", "cat4", "cat5", "cat6"],
                "settings": {
                    "title": "Shop by Category",
                    "heading_size": "h1",
                    "image_ratio": "square",
                    "columns_desktop": 3,
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
                            "collection": "prabhu-pizza"
                        }
                    },
                    "seller5": {
                        "type": "featured_collection",
                        "settings": {
                            "collection": "govindas-catering"
                        }
                    },
                    "seller6": {
                        "type": "featured_collection",
                        "settings": {
                            "collection": "tulsi-nursery"
                        }
                    }
                },
                "block_order": ["seller1", "seller2", "seller3", "seller4", "seller5", "seller6"],
                "settings": {
                    "title": "Featured Sellers",
                    "heading_size": "h1",
                    "image_ratio": "square",
                    "columns_desktop": 3,
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
            "iskcon-hero",
            "featured-categories",
            "featured-products",
            "featured-sellers"
        ]
    };

    // Update homepage
    const homepageResult = await shopifyRequest('PUT', `/themes/${themeId}/assets.json`, {
        asset: {
            key: 'templates/index.json',
            value: JSON.stringify(restoredHomepage, null, 2)
        }
    });

    if (homepageResult.status === 200) {
        console.log('✓ Homepage restored with ISKCON Hero banner');
        console.log('  - Hare Krishna mantra');
        console.log('  - Srila Prabhupada quote');
        console.log('  - 6 categories displayed');
        console.log('  - 6 sellers displayed');
    } else {
        console.log('Homepage update failed:', homepageResult.status);
    }

    // Now restore the header with more menu items
    console.log('\n=== Restoring Header with Full Menu ===\n');

    const restoredHeader = {
        "name": "t:sections.header.name",
        "type": "header",
        "sections": {
            "announcement-bar": {
                "type": "announcement-bar",
                "blocks": {
                    "announcement-bar-0": {
                        "type": "announcement",
                        "settings": {
                            "text": "Hare Krishna! Welcome to Seva Marketplace",
                            "text_alignment": "center",
                            "color_scheme": "accent-1",
                            "link": ""
                        }
                    }
                },
                "block_order": ["announcement-bar-0"],
                "disabled": false,
                "settings": {}
            },
            "header": {
                "type": "header",
                "settings": {
                    "logo_position": "top-left",
                    "menu": "main-menu",
                    "menu_type_desktop": "mega",
                    "sticky_header_type": "always",
                    "show_line_separator": true,
                    "color_scheme": "background-1",
                    "enable_country_selector": false,
                    "enable_language_selector": false,
                    "mobile_logo_position": "center",
                    "margin_bottom": 0,
                    "padding_top": 12,
                    "padding_bottom": 12
                }
            }
        },
        "order": ["announcement-bar", "header"]
    };

    const headerResult = await shopifyRequest('PUT', `/themes/${themeId}/assets.json`, {
        asset: {
            key: 'sections/header-group.json',
            value: JSON.stringify(restoredHeader, null, 2)
        }
    });

    if (headerResult.status === 200) {
        console.log('✓ Header restored with mega menu style');
    }

    console.log('\n=== Menu Structure ===');
    console.log('The menu items need to be configured in Shopify Admin:');
    console.log('  Go to: Online Store → Navigation → Main menu');
    console.log('\nRecommended structure:');
    console.log('  Home → /');
    console.log('  Browse → /pages/browse');
    console.log('  Categories (dropdown):');
    console.log('    - Puja Items → /collections/puja-items');
    console.log('    - Books & Media → /collections/books-media-1');
    console.log('    - Garlands & Malas → /collections/garlands-malas');
    console.log('    - Health & Wellness → /collections/health-wellness-1');
    console.log('    - Plants & Garden → /collections/plants-garden');
    console.log('    - Catering & Food → /collections/catering-food');
    console.log('    - Financial Services → /collections/financial-services');
    console.log('    - Education → /collections/education-services');
    console.log('  Sellers (dropdown):');
    console.log('    - All sellers listed');
    console.log('  Become a Seller → /pages/become-a-seller');
}

main().catch(console.error);
