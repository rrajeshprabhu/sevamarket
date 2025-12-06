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

    console.log('=== UPDATING ISKCON HERO WITH DEITY IMAGES ===\n');

    // Updated hero section with Nitai-Gaur, Radha-Krishna, Rama-Sita
    const newHeroSection = `{% comment %}
  ISKCON Hero Banner Section
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
    background: #fff;
  }

  .iskcon-image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .deity-name {
    margin-top: 10px;
    font-size: 0.95em;
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
      <div class="iskcon-image-container">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Lord_Chaitanya.jpg/220px-Lord_Chaitanya.jpg"
             alt="Sri Sri Nitai Gauranga"
             onerror="this.style.background='linear-gradient(135deg, #FFD700, #FFA500)'; this.alt='Nitai Gaur';">
      </div>
      <div class="deity-name">Sri Sri Nitai Gauranga</div>
    </div>

    <div class="iskcon-image-wrapper">
      <div class="iskcon-image-container">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Radha_Krishna.jpg/220px-Radha_Krishna.jpg"
             alt="Sri Sri Radha Krishna"
             onerror="this.style.background='linear-gradient(135deg, #FF69B4, #4169E1)'; this.alt='Radha Krishna';">
      </div>
      <div class="deity-name">Sri Sri Radha Krishna</div>
    </div>

    <div class="iskcon-image-wrapper">
      <div class="iskcon-image-container">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Rama_and_Sita.jpg/220px-Rama_and_Sita.jpg"
             alt="Sri Sri Sita Rama"
             onerror="this.style.background='linear-gradient(135deg, #90EE90, #FFD700)'; this.alt='Sita Rama';">
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
  "settings": [],
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
        console.log('✓ ISKCON Hero section updated!');
        console.log('\nNew deity images:');
        console.log('  1. Sri Sri Nitai Gauranga (Lord Chaitanya & Nityananda)');
        console.log('  2. Sri Sri Radha Krishna');
        console.log('  3. Sri Sri Sita Rama');
        console.log('\nAlso added:');
        console.log('  - Deity names below each image');
        console.log('  - Browse Products and View Sellers buttons');
        console.log('  - Improved styling');
    } else {
        console.log('Failed:', result.status, JSON.stringify(result.data));
    }
}

main().catch(console.error);
