import requests
import json

# Shopify API credentials
SHOP_URL = "cnqh0g-yq.myshopify.com"
ACCESS_TOKEN = "os.environ.get('SHOPIFY_ACCESS_TOKEN')"
PAGE_ID = 701983949171

# Modern Contact Us page HTML
html_content = '''
<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">

  <!-- Hero Section -->
  <div style="background: linear-gradient(135deg, #3B5C4E 0%, #5A8A6E 100%); color: white; padding: 60px 20px; text-align: center; border-radius: 20px; margin-bottom: 40px;">
    <h1 style="font-family: 'Lora', Georgia, serif; font-size: 2.8rem; margin: 0 0 15px; font-weight: 700;">Get In Touch</h1>
    <p style="font-size: 1.2rem; opacity: 0.95; max-width: 500px; margin: 0 auto; line-height: 1.6;">We'd love to hear from you. Whether you have a question, feedback, or just want to say hello!</p>
  </div>

  <!-- Contact Options Grid -->
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; margin-bottom: 50px;">

    <!-- Email Card -->
    <div style="background: #F8F5EF; border-radius: 16px; padding: 35px 30px; text-align: center; border: 1px solid #E4DDCF; transition: transform 0.2s ease;">
      <div style="width: 70px; height: 70px; background: linear-gradient(135deg, #3B5C4E, #5A8A6E); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
        <span style="font-size: 32px;">✉️</span>
      </div>
      <h3 style="font-family: 'Lora', Georgia, serif; color: #1F3D36; font-size: 1.4rem; margin: 0 0 10px;">Email Us</h3>
      <p style="color: #555; font-size: 1rem; margin: 0 0 15px; line-height: 1.5;">For inquiries, orders, or support</p>
      <a href="mailto:hello@clayleafstudio.com" style="color: #3B5C4E; font-weight: 600; text-decoration: none; font-size: 1.1rem;">hello@clayleafstudio.com</a>
    </div>

    <!-- Facebook Card -->
    <div style="background: #F8F5EF; border-radius: 16px; padding: 35px 30px; text-align: center; border: 1px solid #E4DDCF; transition: transform 0.2s ease;">
      <div style="width: 70px; height: 70px; background: linear-gradient(135deg, #1877F2, #4267B2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
        <span style="font-size: 32px; color: white;">f</span>
      </div>
      <h3 style="font-family: 'Lora', Georgia, serif; color: #1F3D36; font-size: 1.4rem; margin: 0 0 10px;">Facebook</h3>
      <p style="color: #555; font-size: 1rem; margin: 0 0 15px; line-height: 1.5;">Follow us for updates & inspiration</p>
      <a href="https://www.facebook.com/profile.php?id=61584591088192" target="_blank" rel="noopener" style="display: inline-block; background: #1877F2; color: white; padding: 12px 28px; border-radius: 30px; text-decoration: none; font-weight: 600; font-size: 1rem;">Visit Facebook</a>
    </div>

    <!-- Instagram Card -->
    <div style="background: #F8F5EF; border-radius: 16px; padding: 35px 30px; text-align: center; border: 1px solid #E4DDCF; transition: transform 0.2s ease;">
      <div style="width: 70px; height: 70px; background: linear-gradient(135deg, #F58529, #DD2A7B, #8134AF, #515BD4); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
        <span style="font-size: 32px;">📷</span>
      </div>
      <h3 style="font-family: 'Lora', Georgia, serif; color: #1F3D36; font-size: 1.4rem; margin: 0 0 10px;">Instagram</h3>
      <p style="color: #555; font-size: 1rem; margin: 0 0 15px; line-height: 1.5;">See our products in action</p>
      <a href="https://www.instagram.com/clayleaf.studio" target="_blank" rel="noopener" style="display: inline-block; background: linear-gradient(135deg, #F58529, #DD2A7B); color: white; padding: 12px 28px; border-radius: 30px; text-decoration: none; font-weight: 600; font-size: 1rem;">Follow @clayleaf.studio</a>
    </div>

  </div>

  <!-- Contact Form Section -->
  <div style="background: #FAFAF8; border-radius: 20px; padding: 50px 40px; border: 1px solid #E4DDCF; margin-bottom: 40px;">
    <div style="text-align: center; margin-bottom: 35px;">
      <h2 style="font-family: 'Lora', Georgia, serif; color: #1F3D36; font-size: 2rem; margin: 0 0 10px;">Send Us a Message</h2>
      <p style="color: #666; font-size: 1.05rem; max-width: 450px; margin: 0 auto;">Fill out the form below and we'll get back to you within 24-48 hours.</p>
    </div>

    <!-- Note: The actual form is rendered by Shopify's contact template -->
    <div style="background: white; border-radius: 16px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
      <p style="text-align: center; color: #3B5C4E; font-size: 1rem; margin: 0;">
        <strong>👇 Use the form below to reach us directly 👇</strong>
      </p>
    </div>
  </div>

  <!-- Business Hours / Info Section -->
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px; margin-bottom: 40px;">

    <div style="background: linear-gradient(135deg, #F8F5EF, #FFF); border-radius: 14px; padding: 25px; border: 1px solid #E4DDCF;">
      <h4 style="color: #1F3D36; font-size: 1.1rem; margin: 0 0 12px; font-family: 'Lora', Georgia, serif;">🕐 Response Time</h4>
      <p style="color: #555; font-size: 0.95rem; margin: 0; line-height: 1.6;">We typically respond within 24-48 hours during business days.</p>
    </div>

    <div style="background: linear-gradient(135deg, #F8F5EF, #FFF); border-radius: 14px; padding: 25px; border: 1px solid #E4DDCF;">
      <h4 style="color: #1F3D36; font-size: 1.1rem; margin: 0 0 12px; font-family: 'Lora', Georgia, serif;">🌱 Our Promise</h4>
      <p style="color: #555; font-size: 0.95rem; margin: 0; line-height: 1.6;">Every message matters to us. We're here to help with any questions.</p>
    </div>

    <div style="background: linear-gradient(135deg, #F8F5EF, #FFF); border-radius: 14px; padding: 25px; border: 1px solid #E4DDCF;">
      <h4 style="color: #1F3D36; font-size: 1.1rem; margin: 0 0 12px; font-family: 'Lora', Georgia, serif;">📦 Order Questions?</h4>
      <p style="color: #555; font-size: 0.95rem; margin: 0; line-height: 1.6;">Include your order number in your message for faster assistance.</p>
    </div>

  </div>

  <!-- Social Follow CTA -->
  <div style="background: linear-gradient(135deg, #1F3D36, #3B5C4E); border-radius: 18px; padding: 40px 30px; text-align: center; color: white;">
    <h3 style="font-family: 'Lora', Georgia, serif; font-size: 1.6rem; margin: 0 0 12px;">Stay Connected</h3>
    <p style="font-size: 1.05rem; opacity: 0.9; margin: 0 0 25px; max-width: 400px; margin-left: auto; margin-right: auto;">Follow us on social media for eco-friendly tips, new arrivals, and behind-the-scenes content.</p>
    <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
      <a href="https://www.facebook.com/profile.php?id=61584591088192" target="_blank" rel="noopener" style="display: inline-flex; align-items: center; gap: 8px; background: white; color: #1877F2; padding: 12px 24px; border-radius: 30px; text-decoration: none; font-weight: 600; font-size: 0.95rem;">
        <span style="font-size: 18px;">📘</span> Facebook
      </a>
      <a href="https://www.instagram.com/clayleaf.studio" target="_blank" rel="noopener" style="display: inline-flex; align-items: center; gap: 8px; background: white; color: #DD2A7B; padding: 12px 24px; border-radius: 30px; text-decoration: none; font-weight: 600; font-size: 0.95rem;">
        <span style="font-size: 18px;">📸</span> Instagram
      </a>
    </div>
  </div>

</div>
'''

# API endpoint
url = f"https://{SHOP_URL}/admin/api/2024-01/pages/{PAGE_ID}.json"

# Headers
headers = {
    "X-Shopify-Access-Token": ACCESS_TOKEN,
    "Content-Type": "application/json"
}

# Request body
data = {
    "page": {
        "id": PAGE_ID,
        "body_html": html_content,
        "title": "Contact Us"
    }
}

# Make the request
response = requests.put(url, headers=headers, json=data)

if response.status_code == 200:
    print("✅ Contact Us page updated successfully!")
    print(f"View at: https://clayleaf-studio.com/pages/contact-us")
else:
    print(f"❌ Error: {response.status_code}")
    print(response.text)
