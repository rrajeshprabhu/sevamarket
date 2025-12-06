import requests
import json

SHOP = "cnqh0g-yq.myshopify.com"
TOKEN = "os.environ.get('SHOPIFY_ACCESS_TOKEN')"

headers = {
    "X-Shopify-Access-Token": TOKEN,
    "Content-Type": "application/json"
}

graphql_url = f"https://{SHOP}/admin/api/2024-01/graphql.json"

# Create main-menu with Clayleaf navigation items
mutation = """
mutation menuCreate($title: String!, $handle: String!, $items: [MenuItemCreateInput!]!) {
  menuCreate(title: $title, handle: $handle, items: $items) {
    menu {
      id
      title
      handle
      items {
        id
        title
        url
      }
    }
    userErrors {
      field
      message
    }
  }
}
"""

variables = {
    "title": "Main menu",
    "handle": "main-menu",
    "items": [
        {
            "title": "Kitchen & Dining",
            "type": "HTTP",
            "url": "/collections/kitchenware"
        },
        {
            "title": "Bath & Cleaning",
            "type": "HTTP",
            "url": "/collections/bath-cleaning"
        },
        {
            "title": "Storage & Organization",
            "type": "HTTP",
            "url": "/collections/storage-organization"
        },
        {
            "title": "About Us",
            "type": "HTTP",
            "url": "/pages/about-us"
        },
        {
            "title": "Contact",
            "type": "HTTP",
            "url": "/pages/contact-us"
        }
    ]
}

response = requests.post(
    graphql_url,
    headers=headers,
    json={"query": mutation, "variables": variables}
)

print("Create main-menu result:")
print(json.dumps(response.json(), indent=2))
