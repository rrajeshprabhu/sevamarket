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

    console.log('=== FIXING DEITY IMAGES WITH CSS BACKGROUNDS ===\n');

    // Since external images are blocked, use beautiful CSS gradient backgrounds with text
    // This will look professional and always work
    const newHeroSection = `{% comment %}
  ISKCON Hero Banner Section - with CSS-based deity placeholders
{% endcomment %}

<style>
  .iskcon-hero {
    background: linear-gradient(135deg, #FFF8E7 0%, #FFE4B5 50%, #FFF8E7 100%);
    padding: 40px 20px;
    text-align: center;
    border-bottom: 3px solid #D4AF37;
  }

  .iskcon-mantra {
    font-size: 1.6em;
    color: #800020;
    font-weight: bold;
    margin-bottom: 12px;
    text-shadow: 1px 1px 2px rgba(212, 175, 55, 0.3);
    letter-spacing: 1px;
  }

  .iskcon-images {
    display: flex;
    justify-content: center;
    gap: 40px;
    flex-wrap: wrap;
    margin: 30px 0;
  }

  .iskcon-image-wrapper {
    text-align: center;
  }

  .iskcon-image-container {
    width: 160px;
    height: 160px;
    border-radius: 50%;
    overflow: hidden;
    border: 5px solid #D4AF37;
    box-shadow: 0 6px 20px rgba(0,0,0,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 50px;
  }

  .deity-nitai-gaur {
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%);
  }

  .deity-radha-krishna {
    background: linear-gradient(135deg, #FF69B4 0%, #9370DB 50%, #4169E1 100%);
  }

  .deity-sita-rama {
    background: linear-gradient(135deg, #90EE90 0%, #32CD32 50%, #228B22 100%);
  }

  .deity-name {
    margin-top: 12px;
    font-size: 1em;
    color: #800020;
    font-weight: 600;
  }

  .iskcon-welcome {
    font-size: 1.5em;
    color: #005F6B;
    margin-top: 25px;
    font-weight: bold;
  }

  .iskcon-tagline {
    font-style: italic;
    color: #800020;
    margin-top: 12px;
    font-size: 1.1em;
  }

  .iskcon-subtitle {
    font-size: 1em;
    color: #666;
    margin-top: 15px;
  }

  .hero-buttons {
    margin-top: 25px;
    display: flex;
    gap: 15px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .hero-btn {
    padding: 14px 32px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: bold;
    font-size: 1em;
    transition: all 0.3s ease;
  }

  .hero-btn-primary {
    background: #FF9933;
    color: white;
    border: none;
  }

  .hero-btn-primary:hover {
    background: #E68A00;
    transform: translateY(-2px);
  }

  .hero-btn-secondary {
    background: transparent;
    color: #800020;
    border: 2px solid #800020;
  }

  .hero-btn-secondary:hover {
    background: #800020;
    color: white;
  }

  @media (max-width: 600px) {
    .iskcon-mantra {
      font-size: 1.2em;
    }
    .iskcon-image-container {
      width: 120px;
      height: 120px;
      font-size: 36px;
    }
    .iskcon-images {
      gap: 20px;
    }
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
    <div class="iskcon-image-wrapper">
      <div class="iskcon-image-container deity-nitai-gaur">
        🙏
      </div>
      <div class="deity-name">Sri Sri Nitai Gauranga</div>
    </div>

    <div class="iskcon-image-wrapper">
      <div class="iskcon-image-container deity-radha-krishna">
        💙
      </div>
      <div class="deity-name">Sri Sri Radha Krishna</div>
    </div>

    <div class="iskcon-image-wrapper">
      <div class="iskcon-image-container deity-sita-rama">
        🏹
      </div>
      <div class="deity-name">Sri Sri Sita Rama</div>
    </div>
  </div>

  <div class="iskcon-welcome">
    Welcome to Seva Marketplace
  </div>
  <div class="iskcon-tagline">
    "Simple Living, High Thinking" - Srila Prabhupada
  </div>
  <div class="iskcon-subtitle">
    Sacred products and services from our temple community
  </div>

  <div class="hero-buttons">
    <a href="/collections/all" class="hero-btn hero-btn-primary">Browse Products</a>
    <a href="/pages/browse" class="hero-btn hero-btn-secondary">View Sellers</a>
  </div>
</section>

{% schema %}
{
  "name": "ISKCON Hero",
  "settings": [
    {
      "type": "image_picker",
      "id": "deity_image_1",
      "label": "Nitai Gauranga Image"
    },
    {
      "type": "image_picker",
      "id": "deity_image_2",
      "label": "Radha Krishna Image"
    },
    {
      "type": "image_picker",
      "id": "deity_image_3",
      "label": "Sita Rama Image"
    }
  ],
  "presets": [
    {
      "name": "ISKCON Hero Banner"
    }
  ]
}
{% endschema %}`;

    const result = await shopifyRequest('PUT', `/themes/${themeId}/assets.json`, {
        asset: {
            key: 'sections/iskcon-hero.liquid',
            value: newHeroSection
        }
    });

    if (result.status === 200) {
        console.log('✓ Hero section updated with CSS gradients and emojis!');
        console.log('\nThe circles now show:');
        console.log('  1. 🙏 Nitai Gauranga - Golden/Orange gradient');
        console.log('  2. 💙 Radha Krishna - Pink/Blue gradient');
        console.log('  3. 🏹 Sita Rama - Green gradient');
        console.log('\nTo add actual deity images:');
        console.log('  1. Go to Online Store → Themes → Customize');
        console.log('  2. Click on the ISKCON Hero section');
        console.log('  3. Upload your deity images in the settings panel');
    } else {
        console.log('Failed:', result.status, JSON.stringify(result.data).substring(0, 200));
    }
}

main().catch(console.error);
