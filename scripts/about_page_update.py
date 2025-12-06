import requests
import json

SHOP = 'cnqh0g-yq.myshopify.com'
TOKEN = 'os.environ.get('SHOPIFY_ACCESS_TOKEN')'

headers = {
    'X-Shopify-Access-Token': TOKEN,
    'Content-Type': 'application/json'
}

new_body = '''
<style>
  .clayleaf-about {
    max-width: 850px;
    margin: 0 auto;
    padding: 0 24px;
    font-family: "Inter", sans-serif;
    color: #333;
    line-height: 1.85;
  }

  .clayleaf-about-hero {
    text-align: center;
    padding: 3rem 1.5rem 2.5rem;
    margin-bottom: 2rem;
  }

  .clayleaf-about-hero h2 {
    font-family: "Lora", serif;
    font-size: 2.8rem;
    font-weight: 700;
    color: #1F3D36;
    margin: 0 0 1.2rem;
    letter-spacing: 0.01em;
  }

  .clayleaf-about-hero p {
    font-size: 1.35rem;
    color: #555;
    max-width: 650px;
    margin: 0 auto;
    line-height: 1.7;
  }

  .clayleaf-story {
    padding: 2rem 0;
  }

  .clayleaf-story-section {
    margin-bottom: 2.5rem;
    padding-bottom: 2.5rem;
    border-bottom: 1px solid #e8e4dc;
  }

  .clayleaf-story-section:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  .clayleaf-story-section h3 {
    font-family: "Lora", serif;
    font-size: 1.75rem;
    font-weight: 700;
    color: #1F3D36;
    margin: 0 0 1.2rem;
  }

  .clayleaf-story-section p {
    margin: 0 0 1.2rem;
    color: #444;
    font-size: 1.2rem;
  }

  .clayleaf-story-section p:last-child {
    margin-bottom: 0;
  }

  .clayleaf-values {
    display: flex;
    gap: 2rem;
    margin-top: 1.5rem;
    flex-wrap: wrap;
  }

  .clayleaf-value {
    flex: 1 1 200px;
    text-align: center;
  }

  .clayleaf-value-icon {
    font-size: 2.5rem;
    margin-bottom: 0.6rem;
  }

  .clayleaf-value h4 {
    font-family: "Lora", serif;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1F3D36;
    margin: 0 0 0.4rem;
  }

  .clayleaf-value p {
    font-size: 1.1rem;
    color: #666;
    margin: 0;
  }

  .clayleaf-highlight {
    background: linear-gradient(135deg, #F8F5EF 0%, #E8E2D6 100%);
    border-radius: 16px;
    padding: 2rem;
    margin: 1.5rem 0;
  }

  .clayleaf-highlight-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .clayleaf-highlight-list li {
    padding: 0.6rem 0;
    padding-left: 1.8rem;
    position: relative;
    color: #444;
    font-size: 1.2rem;
  }

  .clayleaf-highlight-list li::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 10px;
    height: 10px;
    background: #3B5C4E;
    border-radius: 50%;
  }

  .clayleaf-about-cta {
    text-align: center;
    padding: 3rem;
    background: #1F3D36;
    border-radius: 16px;
    margin-top: 2.5rem;
  }

  .clayleaf-about-cta h3 {
    font-family: "Lora", serif;
    font-size: 1.75rem;
    color: #fff;
    margin: 0 0 0.75rem;
  }

  .clayleaf-about-cta p {
    color: rgba(255,255,255,0.85);
    margin: 0 0 1.5rem;
    font-size: 1.2rem;
  }

  .clayleaf-about-cta a {
    display: inline-block;
    background: #9BBF8A;
    color: #1F3D36;
    padding: 1rem 2.5rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1.1rem;
    transition: background 0.2s;
  }

  .clayleaf-about-cta a:hover {
    background: #8AB079;
  }

  @media (max-width: 600px) {
    .clayleaf-about-hero h2 {
      font-size: 2rem;
    }
    .clayleaf-about-hero p {
      font-size: 1.15rem;
    }
    .clayleaf-story-section h3 {
      font-size: 1.5rem;
    }
    .clayleaf-story-section p {
      font-size: 1.1rem;
    }
    .clayleaf-highlight-list li {
      font-size: 1.1rem;
    }
    .clayleaf-values {
      flex-direction: column;
      gap: 1.5rem;
    }
  }
</style>

<div class="clayleaf-about">

  <!-- Hero Section -->
  <div class="clayleaf-about-hero">
    <h2>Crafted Naturally. Made Responsibly.</h2>
    <p>Clayleaf Studio brings earth-friendly home essentials to your doorstep - thoughtfully made from bamboo, rattan, hyacinth, and other natural fibres.</p>
  </div>

  <!-- Story Flow -->
  <div class="clayleaf-story">

    <div class="clayleaf-story-section">
      <h3>Our Story</h3>
      <p>Clayleaf Studio was born from a simple idea: everyday objects can be beautiful, functional, and kind to the planet.</p>
      <p>We believe homes should reflect the values we care about - warmth, simplicity, and conscious living. Our long-term vision is to make sustainable choices the easy choice for everyone.</p>
    </div>

    <div class="clayleaf-story-section">
      <h3>What We Create</h3>
      <p>We curate pieces for kitchen, dining, storage, and home rituals using natural and responsibly sourced materials like bamboo, rattan, hyacinth, and coir.</p>
      <p>Each piece is meant to be used and loved - not just displayed and forgotten.</p>
    </div>

    <div class="clayleaf-story-section">
      <h3>Craft &amp; Materials</h3>
      <p>We work with small makers and workshops that specialize in working with natural fibres and organic-waste-based materials.</p>
      <div class="clayleaf-highlight">
        <ul class="clayleaf-highlight-list">
          <li>Low-plastic, low-waste design</li>
          <li>Long-lasting construction over throwaway trends</li>
          <li>Finishes that feel good in the hand and age gracefully</li>
        </ul>
      </div>
    </div>

    <div class="clayleaf-story-section">
      <h3>Artisan Partners</h3>
      <p>Behind every product is a person - an artisan, a workshop, or a small family business.</p>
      <p>We aim to build long-term relationships with these partners, supporting gradually improving wages, stable orders, and fair working conditions. Over time, we will highlight more of their stories and the places where your pieces are made.</p>
    </div>

    <div class="clayleaf-story-section">
      <h3>Sustainability in Practice</h3>
      <p>We are far from perfect, but we are intentional. We prioritize:</p>
      <div class="clayleaf-highlight">
        <ul class="clayleaf-highlight-list">
          <li>Natural or recycled materials wherever possible</li>
          <li>Working toward reduced-plastic and eco-friendly packaging solutions</li>
          <li>Shipping and logistics choices that balance footprint and reliability</li>
        </ul>
      </div>
    </div>

    <div class="clayleaf-story-section">
      <h3>Our Values</h3>
      <div class="clayleaf-values">
        <div class="clayleaf-value">
          <div class="clayleaf-value-icon">&#x267B;&#xFE0F;</div>
          <h4>Circular Economy</h4>
          <p>Materials that return to the earth naturally</p>
        </div>
        <div class="clayleaf-value">
          <div class="clayleaf-value-icon">&#x1F33F;</div>
          <h4>Nature-Aligned</h4>
          <p>Renewable fibres grown, not manufactured</p>
        </div>
        <div class="clayleaf-value">
          <div class="clayleaf-value-icon">&#x1F450;</div>
          <h4>Handcrafted</h4>
          <p>Supporting artisan communities worldwide</p>
        </div>
      </div>
    </div>

    <div class="clayleaf-story-section">
      <h3>Where We Are Today</h3>
      <p>Clayleaf Studio is at the beginning of its journey. As we grow, we want to stay close to the reason we started: to make it easier for people to choose better - for their homes, for the makers, and for the planet.</p>
    </div>

  </div>

  <!-- CTA -->
  <div class="clayleaf-about-cta">
    <h3>Ready to explore?</h3>
    <p>Discover our collection of sustainable home essentials.</p>
    <a href="/pages/shop">Shop Collections</a>
  </div>

</div>
'''

# Update the page
url = f'https://{SHOP}/admin/api/2024-01/pages/702287118707.json'
data = {
    'page': {
        'id': 702287118707,
        'body_html': new_body
    }
}

response = requests.put(url, headers=headers, json=data)
if response.status_code == 200:
    print('About page updated with larger fonts!')
else:
    print(f'Error: {response.status_code}')
    print(response.text)
