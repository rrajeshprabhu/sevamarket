import requests

SHOP = "cnqh0g-yq.myshopify.com"
TOKEN = "os.environ.get('SHOPIFY_ACCESS_TOKEN')"

headers = {
    "X-Shopify-Access-Token": TOKEN,
    "Content-Type": "application/json"
}

# Get all collections
url = f"https://{SHOP}/admin/api/2024-01/custom_collections.json"
response = requests.get(url, headers=headers)

if response.status_code == 200:
    collections = response.json().get('custom_collections', [])
    print(f"Custom Collections ({len(collections)}):")
    for col in collections:
        print(f"  - {col['title']} (handle: {col['handle']}, id: {col['id']})")
        if col.get('image'):
            print(f"    Image: {col['image']['src']}")
else:
    print(f"Error: {response.status_code}")

# Also get smart collections
url2 = f"https://{SHOP}/admin/api/2024-01/smart_collections.json"
response2 = requests.get(url2, headers=headers)

if response2.status_code == 200:
    smart_cols = response2.json().get('smart_collections', [])
    print(f"\nSmart Collections ({len(smart_cols)}):")
    for col in smart_cols:
        print(f"  - {col['title']} (handle: {col['handle']}, id: {col['id']})")
        if col.get('image'):
            print(f"    Image: {col['image']['src']}")
