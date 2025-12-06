import requests

SHOP = "cnqh0g-yq.myshopify.com"
TOKEN = "os.environ.get('SHOPIFY_ACCESS_TOKEN')"

headers = {
    "X-Shopify-Access-Token": TOKEN,
    "Content-Type": "application/json"
}

# Get all menus
url = f"https://{SHOP}/admin/api/2024-01/menus.json"
response = requests.get(url, headers=headers)

if response.status_code == 200:
    menus = response.json().get('menus', [])
    print(f"Found {len(menus)} menus:\n")
    for menu in menus:
        print(f"Menu: {menu['title']} (handle: {menu['handle']}, id: {menu['id']})")
        print(f"  Items count: {len(menu.get('items', []))}")
        for item in menu.get('items', []):
            print(f"    - {item['title']}: {item['url']}")
        print()
else:
    print(f"Error: {response.status_code}")
    print(response.text)
