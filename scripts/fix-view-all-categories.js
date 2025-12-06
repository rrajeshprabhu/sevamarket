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

    console.log('=== FIXING VIEW ALL CATEGORIES ===\n');

    // 1. Create "All Categories" page
    console.log('1. Creating All Categories page...\n');

    const categoriesPageContent = `
<div style="max-width: 1200px; margin: 0 auto; padding: 20px;">
  <p style="text-align: center; font-size: 18px; color: #666; margin-bottom: 40px;">
    Browse our marketplace by product category
  </p>

  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 25px;">

    <a href="/collections/puja-items" style="text-decoration: none;">
      <div style="background: #f8f8f8; padding: 25px; border-radius: 12px; text-align: center; border: 1px solid #eee; transition: transform 0.2s;">
        <h3 style="color: #8B4513; margin: 0 0 10px 0;">🪔 Puja Items</h3>
        <p style="color: #666; margin: 0; font-size: 14px;">Aarti lamps, incense, deity accessories & puja thalis</p>
      </div>
    </a>

    <a href="/collections/books-media-1" style="text-decoration: none;">
      <div style="background: #f8f8f8; padding: 25px; border-radius: 12px; text-align: center; border: 1px solid #eee; transition: transform 0.2s;">
        <h3 style="color: #8B4513; margin: 0 0 10px 0;">📚 Books & Media</h3>
        <p style="color: #666; margin: 0; font-size: 14px;">Sacred scriptures, devotional literature & kirtan CDs</p>
      </div>
    </a>

    <a href="/collections/garlands-malas" style="text-decoration: none;">
      <div style="background: #f8f8f8; padding: 25px; border-radius: 12px; text-align: center; border: 1px solid #eee; transition: transform 0.2s;">
        <h3 style="color: #8B4513; margin: 0 0 10px 0;">💐 Garlands & Malas</h3>
        <p style="color: #666; margin: 0; font-size: 14px;">Fresh flower garlands, tulsi malas & wedding varmalas</p>
      </div>
    </a>

    <a href="/collections/health-wellness-1" style="text-decoration: none;">
      <div style="background: #f8f8f8; padding: 25px; border-radius: 12px; text-align: center; border: 1px solid #eee; transition: transform 0.2s;">
        <h3 style="color: #8B4513; margin: 0 0 10px 0;">🧴 Health & Wellness</h3>
        <p style="color: #666; margin: 0; font-size: 14px;">Ayurvedic products, chyawanprash & herbal oils</p>
      </div>
    </a>

    <a href="/collections/plants-garden" style="text-decoration: none;">
      <div style="background: #f8f8f8; padding: 25px; border-radius: 12px; text-align: center; border: 1px solid #eee; transition: transform 0.2s;">
        <h3 style="color: #8B4513; margin: 0 0 10px 0;">🌱 Plants & Garden</h3>
        <p style="color: #666; margin: 0; font-size: 14px;">Sacred Tulsi plants, seeds & decorative pots</p>
      </div>
    </a>

    <a href="/collections/catering-food" style="text-decoration: none;">
      <div style="background: #f8f8f8; padding: 25px; border-radius: 12px; text-align: center; border: 1px solid #eee; transition: transform 0.2s;">
        <h3 style="color: #8B4513; margin: 0 0 10px 0;">🍛 Catering & Food</h3>
        <p style="color: #666; margin: 0; font-size: 14px;">Temple feasts, wedding catering & sattvic meals</p>
      </div>
    </a>

    <a href="/collections/financial-services" style="text-decoration: none;">
      <div style="background: #f8f8f8; padding: 25px; border-radius: 12px; text-align: center; border: 1px solid #eee; transition: transform 0.2s;">
        <h3 style="color: #8B4513; margin: 0 0 10px 0;">💼 Financial Services</h3>
        <p style="color: #666; margin: 0; font-size: 14px;">Financial planning, tax consulting & wealth management</p>
      </div>
    </a>

    <a href="/collections/education-services" style="text-decoration: none;">
      <div style="background: #f8f8f8; padding: 25px; border-radius: 12px; text-align: center; border: 1px solid #eee; transition: transform 0.2s;">
        <h3 style="color: #8B4513; margin: 0 0 10px 0;">🎓 Education Services</h3>
        <p style="color: #666; margin: 0; font-size: 14px;">College prep, SAT coaching & essay review</p>
      </div>
    </a>

    <a href="/collections/music-lessons" style="text-decoration: none;">
      <div style="background: #f8f8f8; padding: 25px; border-radius: 12px; text-align: center; border: 1px solid #eee; transition: transform 0.2s;">
        <h3 style="color: #8B4513; margin: 0 0 10px 0;">🎵 Music & Lessons</h3>
        <p style="color: #666; margin: 0; font-size: 14px;">Harmonium, mridanga, kirtan & vocal classes</p>
      </div>
    </a>

    <a href="/collections/yoga-wellness" style="text-decoration: none;">
      <div style="background: #f8f8f8; padding: 25px; border-radius: 12px; text-align: center; border: 1px solid #eee; transition: transform 0.2s;">
        <h3 style="color: #8B4513; margin: 0 0 10px 0;">🧘 Yoga & Wellness</h3>
        <p style="color: #666; margin: 0; font-size: 14px;">Hatha yoga, meditation & teacher training</p>
      </div>
    </a>

    <a href="/collections/real-estate-services-1" style="text-decoration: none;">
      <div style="background: #f8f8f8; padding: 25px; border-radius: 12px; text-align: center; border: 1px solid #eee; transition: transform 0.2s;">
        <h3 style="color: #8B4513; margin: 0 0 10px 0;">🏠 Real Estate</h3>
        <p style="color: #666; margin: 0; font-size: 14px;">Home buying, selling & property investment</p>
      </div>
    </a>

  </div>
</div>
`;

    // Check if page exists
    const pagesResult = await shopifyRequest('GET', '/pages.json');
    const pages = pagesResult.data.pages || [];
    const categoriesPage = pages.find(p => p.handle === 'categories');

    if (categoriesPage) {
        const updateResult = await shopifyRequest('PUT', `/pages/${categoriesPage.id}.json`, {
            page: {
                id: categoriesPage.id,
                title: 'All Categories',
                body_html: categoriesPageContent
            }
        });
        if (updateResult.status === 200) {
            console.log('✓ Updated existing Categories page');
        }
    } else {
        const createResult = await shopifyRequest('POST', '/pages.json', {
            page: {
                title: 'All Categories',
                handle: 'categories',
                body_html: categoriesPageContent,
                published: true
            }
        });
        if (createResult.status === 201 || createResult.status === 200) {
            console.log('✓ Created new Categories page at /pages/categories');
        }
    }

    // 2. Update homepage to link to /pages/categories instead of /collections
    console.log('\n2. Updating Homepage to link to Categories page...\n');

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
                    "cat10": { "type": "featured_collection", "settings": { "collection": "yoga-wellness" } }
                },
                "block_order": ["cat1", "cat2", "cat3", "cat4", "cat5", "cat6", "cat7", "cat8", "cat9", "cat10"],
                "settings": {
                    "title": "Shop by Category",
                    "heading_size": "h1",
                    "image_ratio": "square",
                    "columns_desktop": 5,
                    "color_scheme": "background-1",
                    "show_view_all": false,
                    "columns_mobile": "2",
                    "swipe_on_mobile": true,
                    "padding_top": 40,
                    "padding_bottom": 20
                }
            },
            "categories-cta": {
                "type": "rich-text",
                "blocks": {
                    "btn": {
                        "type": "button",
                        "settings": {
                            "button_label": "View All Categories",
                            "button_link": "/pages/categories",
                            "button_style_secondary": false
                        }
                    }
                },
                "block_order": ["btn"],
                "settings": {
                    "desktop_content_position": "center",
                    "content_alignment": "center",
                    "color_scheme": "background-1",
                    "full_width": false,
                    "padding_top": 0,
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
                    "products_to_show": 12,
                    "columns_desktop": 4,
                    "full_width": false,
                    "show_view_all": true,
                    "view_all_style": "solid",
                    "enable_desktop_slider": false,
                    "color_scheme": "background-2",
                    "image_ratio": "square",
                    "show_secondary_image": true,
                    "show_vendor": true,
                    "show_rating": false,
                    "enable_quick_add": true,
                    "columns_mobile": "2",
                    "swipe_on_mobile": false,
                    "padding_top": 40,
                    "padding_bottom": 40
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
                    "s8": { "type": "featured_collection", "settings": { "collection": "artha-financial-wisdom" } }
                },
                "block_order": ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"],
                "settings": {
                    "title": "Our Sellers",
                    "heading_size": "h1",
                    "image_ratio": "square",
                    "columns_desktop": 4,
                    "color_scheme": "background-1",
                    "show_view_all": false,
                    "columns_mobile": "2",
                    "swipe_on_mobile": false,
                    "padding_top": 40,
                    "padding_bottom": 20
                }
            },
            "sellers-cta": {
                "type": "rich-text",
                "blocks": {
                    "btn": {
                        "type": "button",
                        "settings": {
                            "button_label": "View All Sellers",
                            "button_link": "/pages/sellers",
                            "button_style_secondary": false
                        }
                    }
                },
                "block_order": ["btn"],
                "settings": {
                    "desktop_content_position": "center",
                    "content_alignment": "center",
                    "color_scheme": "background-1",
                    "full_width": false,
                    "padding_top": 0,
                    "padding_bottom": 52
                }
            }
        },
        "order": [
            "iskcon-hero",
            "featured-categories",
            "categories-cta",
            "featured-products",
            "featured-sellers",
            "sellers-cta"
        ]
    };

    const homepageResult = await shopifyRequest('PUT', `/themes/${themeId}/assets.json`, {
        asset: {
            key: 'templates/index.json',
            value: JSON.stringify(updatedHomepage, null, 2)
        }
    });

    if (homepageResult.status === 200) {
        console.log('✓ Homepage updated!');
        console.log('  - "View All Categories" now links to /pages/categories');
        console.log('  - "View All Sellers" links to /pages/sellers');
    } else {
        console.log('Homepage update failed:', homepageResult.status);
    }

    console.log('\n=== COMPLETE ===');
}

main().catch(console.error);
