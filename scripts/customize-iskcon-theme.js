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
    console.log('=== Customizing Theme with ISKCON Branding ===\n');

    // Get theme
    const themes = await shopifyRequest('GET', '/themes.json');
    const mainTheme = themes.data.themes?.find(t => t.role === 'main');

    if (!mainTheme) {
        console.log('No main theme found!');
        return;
    }

    console.log('Main theme:', mainTheme.name, '(ID:', mainTheme.id + ')');

    // Step 1: Add custom CSS for ISKCON branding
    console.log('\n1. Adding custom ISKCON CSS...');

    const iskconCSS = `
/* ISKCON Temple Marketplace Custom Styles */

/* Color Variables - ISKCON Colors */
:root {
    --iskcon-saffron: #FF9933;
    --iskcon-red: #CC3333;
    --iskcon-gold: #D4AF37;
    --iskcon-cream: #FFF8E7;
    --iskcon-maroon: #800020;
    --iskcon-peacock-blue: #005F6B;
}

/* Header Styling */
.header {
    background: linear-gradient(135deg, var(--iskcon-saffron) 0%, var(--iskcon-gold) 100%) !important;
    border-bottom: 3px solid var(--iskcon-maroon) !important;
}

.header__heading-link {
    color: var(--iskcon-maroon) !important;
    font-weight: bold !important;
}

/* Announcement Bar - Hare Krishna Mantra */
.announcement-bar {
    background: var(--iskcon-maroon) !important;
    color: white !important;
}

/* Body Background */
body {
    background-color: var(--iskcon-cream) !important;
}

/* Product Cards */
.card {
    border: 2px solid var(--iskcon-gold) !important;
    border-radius: 8px !important;
    box-shadow: 0 4px 6px rgba(212, 175, 55, 0.2) !important;
}

.card:hover {
    box-shadow: 0 8px 15px rgba(212, 175, 55, 0.3) !important;
    transform: translateY(-2px);
}

/* Buttons */
.button, .shopify-payment-button button, button.product-form__submit {
    background: var(--iskcon-saffron) !important;
    color: var(--iskcon-maroon) !important;
    border: 2px solid var(--iskcon-gold) !important;
    font-weight: bold !important;
}

.button:hover, .shopify-payment-button button:hover {
    background: var(--iskcon-gold) !important;
    color: white !important;
}

/* Footer */
.footer {
    background: linear-gradient(135deg, var(--iskcon-maroon) 0%, #4a0010 100%) !important;
    color: white !important;
}

.footer a {
    color: var(--iskcon-gold) !important;
}

/* Section headings */
h1, h2, h3 {
    color: var(--iskcon-maroon) !important;
}

/* Collection header */
.collection-hero {
    background: linear-gradient(135deg, var(--iskcon-cream) 0%, #FFE4B5 100%) !important;
}

/* Product page */
.product__title {
    color: var(--iskcon-maroon) !important;
}

.product__vendor {
    color: var(--iskcon-saffron) !important;
    font-weight: bold !important;
}

/* Price styling */
.price-item {
    color: var(--iskcon-peacock-blue) !important;
    font-weight: bold !important;
}

/* Navigation links */
.header__menu-item {
    color: var(--iskcon-maroon) !important;
    font-weight: 500 !important;
}

/* Add decorative lotus border */
.section-header {
    border-bottom: 2px solid var(--iskcon-gold) !important;
    padding-bottom: 10px !important;
}

/* Om symbol decoration */
.header::before {
    content: "\\1F549"; /* Om symbol */
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 24px;
    color: var(--iskcon-maroon);
}
`;

    // Check if custom CSS file exists
    const cssAsset = await shopifyRequest('GET', `/themes/${mainTheme.id}/assets.json?asset[key]=assets/iskcon-custom.css`);

    // Create or update custom CSS
    const cssResult = await shopifyRequest('PUT', `/themes/${mainTheme.id}/assets.json`, {
        asset: {
            key: 'assets/iskcon-custom.css',
            value: iskconCSS
        }
    });

    if (cssResult.status === 200) {
        console.log('✓ Custom ISKCON CSS created');
    } else {
        console.log('CSS creation result:', cssResult.status);
    }

    // Step 2: Update theme.liquid to include custom CSS
    console.log('\n2. Adding CSS reference to theme...');

    const themeLiquid = await shopifyRequest('GET', `/themes/${mainTheme.id}/assets.json?asset[key]=layout/theme.liquid`);

    if (themeLiquid.data?.asset?.value) {
        let themeContent = themeLiquid.data.asset.value;

        // Check if our CSS is already included
        if (!themeContent.includes('iskcon-custom.css')) {
            // Add CSS link before </head>
            const cssLink = `\n  {{ 'iskcon-custom.css' | asset_url | stylesheet_tag }}\n`;
            themeContent = themeContent.replace('</head>', cssLink + '</head>');

            const updateTheme = await shopifyRequest('PUT', `/themes/${mainTheme.id}/assets.json`, {
                asset: {
                    key: 'layout/theme.liquid',
                    value: themeContent
                }
            });

            if (updateTheme.status === 200) {
                console.log('✓ CSS reference added to theme.liquid');
            }
        } else {
            console.log('✓ CSS already included in theme');
        }
    }

    // Step 3: Update announcement bar with Hare Krishna mantra
    console.log('\n3. Updating announcement bar...');

    const headerGroupAsset = await shopifyRequest('GET', `/themes/${mainTheme.id}/assets.json?asset[key]=sections/header-group.json`);

    if (headerGroupAsset.data?.asset?.value) {
        const headerGroup = JSON.parse(headerGroupAsset.data.asset.value);

        // Update announcement bar text
        if (headerGroup.sections?.['announcement-bar']) {
            headerGroup.sections['announcement-bar'].settings = headerGroup.sections['announcement-bar'].settings || {};
            headerGroup.sections['announcement-bar'].settings.text = "Hare Krishna Hare Krishna Krishna Krishna Hare Hare | Hare Rama Hare Rama Rama Rama Hare Hare | Welcome to ISKCON Seva Marketplace";
        }

        const updateHeaderGroup = await shopifyRequest('PUT', `/themes/${mainTheme.id}/assets.json`, {
            asset: {
                key: 'sections/header-group.json',
                value: JSON.stringify(headerGroup, null, 2)
            }
        });

        if (updateHeaderGroup.status === 200) {
            console.log('✓ Announcement bar updated with Hare Krishna mantra');
        }
    }

    // Step 4: Create a custom section for ISKCON banner with images
    console.log('\n4. Creating ISKCON hero section...');

    const iskconHeroSection = `{% comment %}
  ISKCON Hero Banner Section
{% endcomment %}

<style>
  .iskcon-hero {
    background: linear-gradient(135deg, #FFF8E7 0%, #FFE4B5 50%, #FFF8E7 100%);
    padding: 30px 20px;
    text-align: center;
    border-bottom: 3px solid #D4AF37;
  }

  .iskcon-mantra {
    font-size: 1.5em;
    color: #800020;
    font-weight: bold;
    margin-bottom: 15px;
    text-shadow: 1px 1px 2px rgba(212, 175, 55, 0.3);
  }

  .iskcon-subtitle {
    font-size: 1.1em;
    color: #CC3333;
    margin-bottom: 20px;
  }

  .iskcon-images {
    display: flex;
    justify-content: center;
    gap: 30px;
    flex-wrap: wrap;
    margin: 20px 0;
  }

  .iskcon-image-container {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    overflow: hidden;
    border: 4px solid #D4AF37;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  }

  .iskcon-image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .iskcon-welcome {
    font-size: 1.3em;
    color: #005F6B;
    margin-top: 20px;
  }

  .iskcon-tagline {
    font-style: italic;
    color: #800020;
    margin-top: 10px;
  }
</style>

<section class="iskcon-hero">
  <div class="iskcon-mantra">
    ॐ Hare Krishna Hare Krishna Krishna Krishna Hare Hare ॐ
  </div>
  <div class="iskcon-mantra">
    Hare Rama Hare Rama Rama Rama Hare Hare
  </div>

  <div class="iskcon-images">
    <div class="iskcon-image-container">
      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Krishna_in_Vrindavan.jpg/220px-Krishna_in_Vrindavan.jpg"
           alt="Lord Krishna"
           onerror="this.src='https://via.placeholder.com/150/D4AF37/800020?text=Krishna'">
    </div>
    <div class="iskcon-image-container">
      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/AC_Bhaktivedanta_Swami_Prabhupada.jpg/220px-AC_Bhaktivedanta_Swami_Prabhupada.jpg"
           alt="Srila Prabhupada"
           onerror="this.src='https://via.placeholder.com/150/800020/D4AF37?text=Prabhupada'">
    </div>
    <div class="iskcon-image-container">
      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Radha_Krishna.jpg/220px-Radha_Krishna.jpg"
           alt="Radha Krishna"
           onerror="this.src='https://via.placeholder.com/150/FF9933/800020?text=Radha+Krishna'">
    </div>
  </div>

  <div class="iskcon-welcome">
    Welcome to ISKCON Seva Marketplace
  </div>
  <div class="iskcon-tagline">
    "Simple Living, High Thinking" - Srila Prabhupada
  </div>
  <div class="iskcon-subtitle">
    Supporting devotee businesses and community services
  </div>
</section>

{% schema %}
{
  "name": "ISKCON Hero",
  "settings": [],
  "presets": [
    {
      "name": "ISKCON Hero Banner"
    }
  ]
}
{% endschema %}
`;

    const createSection = await shopifyRequest('PUT', `/themes/${mainTheme.id}/assets.json`, {
        asset: {
            key: 'sections/iskcon-hero.liquid',
            value: iskconHeroSection
        }
    });

    if (createSection.status === 200) {
        console.log('✓ ISKCON hero section created');
    }

    // Step 5: Add ISKCON hero to homepage
    console.log('\n5. Adding ISKCON hero to homepage...');

    const indexJson = await shopifyRequest('GET', `/themes/${mainTheme.id}/assets.json?asset[key]=templates/index.json`);

    if (indexJson.data?.asset?.value) {
        let indexTemplate = JSON.parse(indexJson.data.asset.value);

        // Add iskcon-hero section at the top
        if (!indexTemplate.sections['iskcon-hero']) {
            // Add section definition
            indexTemplate.sections['iskcon-hero'] = {
                type: 'iskcon-hero'
            };

            // Add to order at the beginning
            if (indexTemplate.order && !indexTemplate.order.includes('iskcon-hero')) {
                indexTemplate.order.unshift('iskcon-hero');
            }

            const updateIndex = await shopifyRequest('PUT', `/themes/${mainTheme.id}/assets.json`, {
                asset: {
                    key: 'templates/index.json',
                    value: JSON.stringify(indexTemplate, null, 2)
                }
            });

            if (updateIndex.status === 200) {
                console.log('✓ ISKCON hero added to homepage');
            }
        } else {
            console.log('✓ ISKCON hero already on homepage');
        }
    }

    // Step 6: Update store name/branding
    console.log('\n6. Updating store settings...');

    // Update settings_data.json for colors
    const settingsData = await shopifyRequest('GET', `/themes/${mainTheme.id}/assets.json?asset[key]=config/settings_data.json`);

    if (settingsData.data?.asset?.value) {
        let settings = JSON.parse(settingsData.data.asset.value);

        // Update color scheme
        if (settings.current) {
            let currentSettings = typeof settings.current === 'string' ?
                settings.presets?.[settings.current] : settings.current;

            if (currentSettings) {
                // Update color settings if they exist
                currentSettings.colors_solid_button_labels = currentSettings.colors_solid_button_labels || '#800020';
                currentSettings.colors_accent_1 = currentSettings.colors_accent_1 || '#FF9933';
                currentSettings.colors_accent_2 = currentSettings.colors_accent_2 || '#D4AF37';
            }
        }

        const updateSettings = await shopifyRequest('PUT', `/themes/${mainTheme.id}/assets.json`, {
            asset: {
                key: 'config/settings_data.json',
                value: JSON.stringify(settings, null, 2)
            }
        });

        if (updateSettings.status === 200) {
            console.log('✓ Theme color settings updated');
        }
    }

    console.log('\n=== ISKCON Theme Customization Complete ===');
    console.log('\nYour store now features:');
    console.log('- Saffron and gold ISKCON color scheme');
    console.log('- Hare Krishna mantra in announcement bar');
    console.log('- ISKCON hero banner with Krishna & Prabhupada images');
    console.log('- Devotional styling throughout');
    console.log('\nVisit: https://seva-dev.myshopify.com');
}

main().catch(console.error);
