# SevaMarket - Marketplace Admin Setup Guide

Complete guide for setting up and configuring the SevaMarket multi-vendor marketplace.

---

## Store Information

| Item | Value |
|------|-------|
| Store URL | `seva-dev.myshopify.com` |
| Admin URL | `seva-dev.myshopify.com/admin` |
| Seller Panel | `seva-dev.sp-seller.webkul.com` |
| Platform | Shopify + Webkul Multi Vendor Marketplace |

---

## Table of Contents

1. [Initial Setup Checklist](#initial-setup-checklist)
2. [Webkul App Configuration](#webkul-app-configuration)
3. [Commission Settings](#commission-settings)
4. [Vendor Approval Settings](#vendor-approval-settings)
5. [Payment Configuration](#payment-configuration)
6. [Email Notifications](#email-notifications)
7. [Google reCaptcha Setup](#google-recaptcha-setup)
8. [Theme Customization](#theme-customization)

---

## Initial Setup Checklist

### Completed
- [x] Shopify development store created
- [x] Webkul Multi Vendor Marketplace app installed
- [x] Business email configured
- [x] Seller URL configured

### Pending
- [ ] Configure commission rates
- [ ] Set up vendor approval workflow
- [ ] Configure payment processing
- [ ] Set up Google reCaptcha
- [ ] Customize email templates
- [ ] Add product categories
- [ ] Customize theme with branding

---

## Webkul App Configuration

### Accessing the App
1. Go to `seva-dev.myshopify.com/admin`
2. Click **Apps** in the left sidebar
3. Click **Multi Vendor Marketplace**

### General Configuration

Navigate to **Configuration** → **General Configuration**

| Setting | Recommended Value |
|---------|------------------|
| Marketplace Status | Enabled |
| Seller Registration | Enabled |
| Auto Approve Sellers | **Disabled** (manual approval) |
| Auto Approve Products | **Disabled** (manual approval) |
| Seller Can Add Product | Enabled |
| Allow Seller to Edit Product | Enabled |

---

## Commission Settings

Navigate to **Configuration** → **Commission Configuration**

### Recommended Commission Structure

| Seller Type | Commission Rate |
|-------------|-----------------|
| Default Rate | 10% |
| Premium Vendors | 8% |
| New Vendors (first 3 months) | 5% |

### Setting Up Commission

1. Go to **Commission Configuration**
2. Set **Default Commission Type**: Percentage
3. Set **Default Commission Rate**: 10
4. Enable **Category-wise Commission** if you want different rates per category

### Category-Based Commission (Optional)

| Category | Commission |
|----------|------------|
| Food & Prasadam | 8% |
| Books & Media | 10% |
| Clothing | 12% |
| Services | 10% |
| Art & Crafts | 10% |

---

## Vendor Approval Settings

Navigate to **Configuration** → **Seller Configuration**

### Approval Workflow

| Setting | Value | Reason |
|---------|-------|--------|
| Auto Approve Seller | No | Verify ISKCON connection |
| Auto Approve Products | No | Quality control |
| Seller Can Edit Products | Yes | Allow updates |
| Show Seller Info on Product | Yes | Transparency |

### Vendor Verification Process

1. Vendor submits registration
2. Admin receives notification
3. Admin reviews:
   - ISKCON temple affiliation
   - Business legitimacy
   - Product/service quality
4. Admin approves or requests more info
5. Vendor receives approval email

---

## Payment Configuration

### Shopify Payments Setup

1. Go to **Settings** → **Payments** in Shopify Admin
2. Set up **Shopify Payments** (recommended)
3. Or configure **PayPal** as alternative

### Vendor Payout Schedule

| Frequency | Description |
|-----------|-------------|
| Weekly | Pay vendors every Monday for previous week's sales |
| Bi-weekly | Pay vendors every 2 weeks |
| Monthly | Pay vendors on 1st of each month |

**Recommended**: Weekly payouts (builds trust with vendors)

### Payout Methods

1. **PayPal Mass Pay** - Easiest for multiple vendors
2. **Bank Transfer** - Manual but direct
3. **Stripe Connect** - Automated (if available)

---

## Email Notifications

Navigate to **Configuration** → **Email Configuration**

### Emails to Configure

| Email Type | Recipient | Purpose |
|------------|-----------|---------|
| New Seller Registration | Admin | Review new vendor |
| Seller Approved | Vendor | Welcome to marketplace |
| Seller Rejected | Vendor | Rejection reason |
| New Product Added | Admin | Review product |
| Product Approved | Vendor | Product is live |
| New Order | Vendor | Order notification |
| Payout Sent | Vendor | Payment confirmation |

### Email Templates

Customize emails with SevaMarket branding:
- Add logo
- Use brand colors (Saffron #FF9933, Maroon #800000)
- Include contact information
- Add spiritual/community message

---

## Google reCaptcha Setup

**Required** to enable vendor registration.

### Step 1: Get reCaptcha Keys

1. Go to [Google reCaptcha Admin](https://www.google.com/recaptcha/admin)
2. Sign in with Google account
3. Click **+ Create**
4. Fill in:
   - Label: `SevaMarket`
   - reCAPTCHA type: **reCAPTCHA v2** → "I'm not a robot" Checkbox
   - Domains:
     - `seva-dev.myshopify.com`
     - `sevamarket.com` (add when ready)
     - `sp-seller.webkul.com`
5. Accept Terms
6. Click **Submit**
7. Copy **Site Key** and **Secret Key**

### Step 2: Configure in Webkul

1. Go to Webkul App → **Configuration** → **reCaptcha Configuration**
2. Enter:
   - Site Key: `[paste site key]`
   - Secret Key: `[paste secret key]`
   - Language: English (US)
3. Click **Save**

---

## Theme Customization

### Brand Colors

```css
:root {
  --seva-saffron: #FF9933;
  --seva-maroon: #800000;
  --seva-cream: #FFF8E7;
  --seva-gold: #D4AF37;
  --seva-brown: #3D2314;
}
```

### Logo Requirements

| Type | Size | Format |
|------|------|--------|
| Main Logo | 250x100 px | PNG (transparent) |
| Favicon | 32x32 px | ICO/PNG |
| Email Logo | 200x80 px | PNG |

### Theme Settings (Shopify Admin)

1. Go to **Online Store** → **Themes**
2. Click **Customize**
3. Update:
   - Logo
   - Colors
   - Typography
   - Homepage sections

---

## Category Setup in Shopify

### Creating Collections

1. Go to **Products** → **Collections**
2. Create collections for each category:

| Collection Name | Description |
|-----------------|-------------|
| Food & Prasadam | Homemade foods, sweets, prasadam |
| Books & Media | Spiritual books, music, DVDs |
| Clothing & Accessories | Traditional wear, jewelry |
| Home & Puja | Deity items, incense, puja supplies |
| Art & Crafts | Paintings, handmade items |
| Health & Wellness | Ayurvedic, organic products |
| Services | All service offerings |

### Tagging System

Use consistent tags:
- `vendor:[vendor-name]`
- `category:[category-name]`
- `type:product` or `type:service`
- `temple:[temple-name]`

---

## Testing Checklist

### Before Launch

- [ ] Test vendor registration flow
- [ ] Test product addition by vendor
- [ ] Test product approval workflow
- [ ] Test checkout process
- [ ] Test order notification to vendor
- [ ] Test commission calculation
- [ ] Test payout process
- [ ] Test email notifications
- [ ] Mobile responsiveness check

### Test Accounts

Create test accounts:
1. **Test Vendor**: testvendor@example.com
2. **Test Buyer**: testbuyer@example.com

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Vendors can't register | Check reCaptcha configuration |
| Products not showing | Check if product is approved |
| Commission not calculating | Verify commission settings |
| Emails not sending | Check email configuration |

### Support

- **Webkul Support**: support@webkul.com
- **Shopify Help**: help.shopify.com
- **Documentation**: [Webkul Docs](https://webkul.com/blog/shopify-multi-vendor-marketplace/)

---

## Next Steps

1. [ ] Set up Google reCaptcha
2. [ ] Configure commission rates
3. [ ] Create product collections/categories
4. [ ] Customize email templates
5. [ ] Add branding to theme
6. [ ] Invite first test vendor
7. [ ] Complete end-to-end test

---

*Last updated: December 6, 2024*
