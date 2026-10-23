import json
import urllib.request
import urllib.error

base = "http://127.0.0.1:5000/api"

def req(endpoint, method="GET", data=None):
    url = f"{base}{endpoint}"
    headers = {"Content-Type": "application/json"}
    body = json.dumps(data).encode("utf-8") if data else None
    request = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())

print("=== 1. TEST HEALTH ===")
s, r = req("/health")
print("Health status:", s, r.get("status"), r.get("database"), "Counts:", r.get("counts"))
assert s == 200 and r.get("status") == "healthy"

print("\n=== 2. TEST CUSTOMER REGISTER (DUPLICATE CHECK & SUCCESS) ===")
test_mobile = "9876543210"
s, r = req("/auth/register", "POST", {"mobile": test_mobile, "password": "password123", "confirm_password": "password123"})
print("Register new:", s, r.get("message"))
# If mobile was already registered in a previous run, s could be 400 with 'already registered'
if s == 400:
    print("Already registered (expected on rerun):", r.get("error"))
    assert "already registered" in r.get("error").lower()
else:
    assert s == 201

# Duplicate registration check
s2, r2 = req("/auth/register", "POST", {"mobile": test_mobile, "password": "password123", "confirm_password": "password123"})
print("Register duplicate:", s2, r2.get("error"))
assert s2 == 400 and "already registered" in r2.get("error").lower()

print("\n=== 3. TEST CUSTOMER LOGIN ===")
s, r = req("/auth/login", "POST", {"mobile": test_mobile, "password": "password123"})
print("Customer login:", s, r.get("message"), "Token:", r.get("token")[:10] + "...")
assert s == 200

print("\n=== 4. TEST ADMIN LOGIN (6369058169 / sijay2606) ===")
s, r = req("/auth/admin-login", "POST", {"mobile": "6369058169", "password": "sijay2606"})
print("Admin login:", s, r.get("message"), "Role:", r.get("admin", {}).get("role"))
assert s == 200

print("\n=== 5. TEST GET PRODUCTS & SEARCH ===")
s, prods = req("/products")
print("Total products in MySQL:", len(prods.get("products", [])))
assert len(prods.get("products", [])) >= 16

s, search_res = req("/products?search=Ring")
print("Search 'Ring':", len(search_res.get("products", [])), "items found")
assert len(search_res.get("products", [])) > 0

print("\n=== 6. TEST ORDER PLACEMENT (BUY NOW FORM VALIDATION & PERSISTENCE) ===")
first_prod = prods["products"][0]
# Empty fields validation test
s, r = req("/orders", "POST", {"name": "", "mobile": "", "address": "", "product_id": first_prod["id"]})
print("Empty order submission validation:", s, r.get("fieldErrors"))
assert s == 400 and "name" in r.get("fieldErrors") and "mobile" in r.get("fieldErrors")

# Valid order placement
order_payload = {
    "name": "Senthil Kumar",
    "mobile": "9876543210",
    "address": "42, Temple Cross Street, Mylapore, Chennai, Tamil Nadu - 600004",
    "product_id": first_prod["id"]
}
s, ord_res = req("/orders", "POST", order_payload)
print("Valid order placed:", s, ord_res.get("message"), "Order Number:", ord_res.get("order_number"))
assert s == 201 and ord_res.get("order_number")

print("\n=== 7. TEST ADMIN ORDERS & CUSTOMERS VIEW ===")
s, orders_list = req("/orders")
print("Total orders in MySQL:", len(orders_list.get("orders", [])))
assert len(orders_list.get("orders", [])) >= 1

s, customers_list = req("/customers")
print("Total customers in MySQL:", len(customers_list.get("customers", [])))
assert any(c["mobile"] == test_mobile for c in customers_list.get("customers", []))

print("\n=== 8. TEST APPEARANCE SETTINGS UPDATE ===")
s, curr_settings = req("/settings")
print("Current site theme:", curr_settings.get("settings", {}).get("site_name"), curr_settings.get("settings", {}).get("theme_color"))

update_payload = {
    "site_name": "SRI JAYAM JEWELLERS",
    "theme_color": "#220538",
    "secondary_color": "#3b0d5c",
    "accent_color": "#D4AF37",
    "bg_image": "",
    "bg_opacity": 0.25,
    "logo": curr_settings.get("settings", {}).get("logo")
}
s, upd_res = req("/settings", "PUT", update_payload)
print("Appearance updated:", s, upd_res.get("message"))
assert s == 200

print("\n>>> ALL INTEGRATION TESTS PASSED 100% SUCCESSFULLY! <<<")
