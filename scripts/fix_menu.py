import requests
import json

SHOP = "cnqh0g-yq.myshopify.com"
TOKEN = "os.environ.get('SHOPIFY_ACCESS_TOKEN')"

headers = {
    "X-Shopify-Access-Token": TOKEN,
    "Content-Type": "application/json"
}

graphql_url = f"https://{SHOP}/admin/api/2024-01/graphql.json"

# First, delete the existing main-menu-2
delete_mutation = """
mutation menuDelete($id: ID!) {
  menuDelete(id: $id) {
    deletedMenuId
    userErrors {
      field
      message
    }
  }
}
"""

# Delete main-menu-2 (ID from earlier: gid://shopify/Menu/305985552755)
delete_response = requests.post(
    graphql_url,
    headers=headers,
    json={
        "query": delete_mutation,
        "variables": {"id": "gid://shopify/Menu/305985552755"}
    }
)
print("Delete result:")
print(json.dumps(delete_response.json(), indent=2))

# Now create new menu with correct order: Kitchen, Storage, Bath, About, Contact
create_mutation = """
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
            "title": "Storage & Organization",
            "type": "HTTP",
            "url": "/collections/storage-organization"
        },
        {
            "title": "Bath & Cleaning",
            "type": "HTTP",
            "url": "/collections/bath-cleaning"
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

create_response = requests.post(
    graphql_url,
    headers=headers,
    json={"query": create_mutation, "variables": variables}
)

print("\nCreate new menu result:")
print(json.dumps(create_response.json(), indent=2))
