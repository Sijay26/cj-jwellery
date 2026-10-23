import os
import re
import secrets
import time
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash
from api.db import init_db, query_all, query_one, execute

from api.seed_data import (
    get_luxury_logo_svg,
    get_default_categories,
    get_default_products
)

app = Flask(__name__)
# Enable CORS for all domains so both local Vite dev and Vercel cloud frontend can communicate
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Ensure database and tables exist on start
_initialized = False

def ensure_init():
    global _initialized
    if not _initialized:
        try:
            init_db()
            _initialized = True
        except Exception as e:
            # When running on Vercel without cloud DB configured yet, this will catch connection refusal
            print(f"Notice during DB init: {e}")

@app.before_request
def before_request_hook():
    ensure_init()

def get_db_help_message():
    return (
        "Cloud MySQL connection required for write operations on live Vercel deployment. "
        "Vercel cloud servers cannot connect to '127.0.0.1' XAMPP on your laptop. "
        "Please add DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, DB_SSL in your Vercel Project Environment Variables "
        "(free hosted MySQL available on TiDB Cloud, Aiven, or Railway)."
    )

# ==============================================================================
# HEALTH CHECK
# ==============================================================================
@app.route("/api/health", methods=["GET"])
def health():
    try:
        counts = {}
        for tbl in ["products", "categories", "orders", "customers", "settings", "admins"]:
            res = query_one(f"SELECT COUNT(*) AS c FROM `{tbl}`")
            counts[tbl] = res["c"] if res else 0
        return jsonify({
            "status": "healthy",
            "database": "connected",
            "server_time": datetime.utcnow().isoformat(),
            "counts": counts
        })
    except Exception as e:
        return jsonify({
            "status": "cloud_db_needed",
            "database": "disconnected",
            "error": str(e),
            "notice": get_db_help_message()
        }), 200

# ==============================================================================
# SETTINGS & APPEARANCE (SITE-WIDE LUXURY THEME)
# ==============================================================================
@app.route("/api/settings", methods=["GET"])
def get_settings():
    try:
        settings = query_one("SELECT * FROM settings ORDER BY id ASC LIMIT 1")
        if settings:
            return jsonify({"settings": settings})
    except Exception:
        pass
    
    # Graceful fallback to default luxury settings
    return jsonify({
        "settings": {
            "site_name": "SRI JAYAM JEWELLERS",
            "theme_color": "#220538",
            "secondary_color": "#3b0d5c",
            "accent_color": "#D4AF37",
            "bg_image": "",
            "bg_opacity": 0.25,
            "logo": get_luxury_logo_svg()
        }
    })

@app.route("/api/settings", methods=["PUT"])
def update_settings():
    try:
        data = request.get_json() or {}
        site_name = data.get("site_name", "SRI JAYAM JEWELLERS")
        theme_color = data.get("theme_color", "#220538")
        secondary_color = data.get("secondary_color", "#3b0d5c")
        accent_color = data.get("accent_color", "#D4AF37")
        bg_image = data.get("bg_image", "")
        bg_opacity = float(data.get("bg_opacity", 0.25))
        logo = data.get("logo", "")

        execute("""
        UPDATE settings 
        SET site_name = %s,
            theme_color = %s,
            secondary_color = %s,
            accent_color = %s,
            bg_image = %s,
            bg_opacity = %s,
            logo = %s
        WHERE id = (SELECT id FROM (SELECT id FROM settings ORDER BY id ASC LIMIT 1) as t)
        """, (site_name, theme_color, secondary_color, accent_color, bg_image, bg_opacity, logo))

        updated = query_one("SELECT * FROM settings ORDER BY id ASC LIMIT 1")
        return jsonify({"message": "Appearance settings updated successfully", "settings": updated})
    except Exception as e:
        return jsonify({"error": f"{str(e)}. {get_db_help_message()}"}), 500


# ==============================================================================
# AUTHENTICATION (CUSTOMER & ADMIN)
# ==============================================================================
@app.route("/api/auth/register", methods=["POST"])
def register_customer():
    try:
        data = request.get_json() or {}
        mobile = str(data.get("mobile", "")).strip()
        password = str(data.get("password", "")).strip()
        confirm_password = str(data.get("confirm_password", "")).strip()

        # Validation
        if not mobile:
            return jsonify({"error": "Mobile number is required"}), 400
        
        # Clean mobile: remove non-digits
        digits = re.sub(r"\D", "", mobile)
        if len(digits) != 10:
            return jsonify({"error": "Mobile number must be exactly 10 digits"}), 400

        if not password:
            return jsonify({"error": "Password is required"}), 400

        if password != confirm_password:
            return jsonify({"error": "Passwords do not match"}), 400

        # Check existing customer
        existing = query_one("SELECT id FROM customers WHERE mobile = %s", (digits,))
        if existing:
            return jsonify({"error": "This mobile number is already registered. Please login."}), 400

        # Hash and insert
        pw_hash = generate_password_hash(password)
        res = execute("INSERT INTO customers (mobile, password_hash) VALUES (%s, %s)", (digits, pw_hash))
        cust_id = res["lastrowid"]
        token = secrets.token_hex(24)

        return jsonify({
            "message": "Registration successful!",
            "token": token,
            "customer": {
                "id": cust_id,
                "mobile": digits
            }
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/auth/login", methods=["POST"])
def login_customer():
    try:
        data = request.get_json() or {}
        mobile = str(data.get("mobile", "")).strip()
        password = str(data.get("password", "")).strip()

        digits = re.sub(r"\D", "", mobile)
        if not digits:
            return jsonify({"error": "Please enter your 10-digit mobile number"}), 400
        if not password:
            return jsonify({"error": "Please enter your password"}), 400

        customer = query_one("SELECT * FROM customers WHERE mobile = %s", (digits,))
        if not customer:
            return jsonify({"error": "Mobile number not registered. Please sign up first."}), 401

        if not check_password_hash(customer["password_hash"], password):
            return jsonify({"error": "Incorrect password. Please try again."}), 401

        token = secrets.token_hex(24)
        return jsonify({
            "message": "Login successful!",
            "token": token,
            "customer": {
                "id": customer["id"],
                "mobile": customer["mobile"]
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/auth/admin-login", methods=["POST"])
def admin_login():
    try:
        data = request.get_json() or {}
        mobile = str(data.get("mobile", "")).strip()
        password = str(data.get("password", "")).strip()

        digits = re.sub(r"\D", "", mobile)
        if not digits or not password:
            return jsonify({"error": "Mobile number and password are required"}), 400

        admin = query_one("SELECT * FROM admins WHERE mobile = %s", (digits,))
        if not admin:
            # Fallback check for exact required credentials
            if digits == "6369058169" and password == "sijay2606":
                # Ensure it is seeded
                init_db()
                admin = query_one("SELECT * FROM admins WHERE mobile = %s", (digits,))
            
            if not admin:
                return jsonify({"error": "Invalid admin credentials"}), 401

        if not check_password_hash(admin["password_hash"], password):
            # Also allow fallback if freshly re-seeded
            if not (digits == "6369058169" and password == "sijay2606"):
                return jsonify({"error": "Invalid admin credentials"}), 401

        token = "adm_" + secrets.token_hex(32)
        return jsonify({
            "message": "Admin authorization successful!",
            "token": token,
            "admin": {
                "id": admin["id"],
                "mobile": admin["mobile"],
                "role": "admin"
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==============================================================================
# CATEGORIES MANAGEMENT
# ==============================================================================
@app.route("/api/categories", methods=["GET"])
def get_categories():
    try:
        categories = query_all("SELECT * FROM categories ORDER BY display_order ASC, id ASC")
        if categories:
            return jsonify({"categories": categories})
    except Exception:
        pass

    cats = get_default_categories()
    for idx, c in enumerate(cats):
        c["id"] = idx + 1
    return jsonify({"categories": cats})

@app.route("/api/categories", methods=["POST"])
def create_category():
    try:
        data = request.get_json() or {}
        name = str(data.get("name", "")).strip()
        image = data.get("image", "")
        display_order = int(data.get("display_order", 0))

        if not name:
            return jsonify({"error": "Category name is required"}), 400

        slug = re.sub(r"[^a-zA-Z0-9]+", "-", name.lower()).strip("-")
        # Ensure unique slug
        base_slug = slug
        count = 1
        while query_one("SELECT id FROM categories WHERE slug = %s", (slug,)):
            slug = f"{base_slug}-{count}"
            count += 1

        res = execute(
            "INSERT INTO categories (name, slug, image, display_order) VALUES (%s, %s, %s, %s)",
            (name, slug, image, display_order)
        )
        new_cat = query_one("SELECT * FROM categories WHERE id = %s", (res["lastrowid"],))
        return jsonify({"message": "Category added successfully", "category": new_cat}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/categories/<int:cat_id>", methods=["PUT"])
def update_category(cat_id):
    try:
        data = request.get_json() or {}
        name = str(data.get("name", "")).strip()
        image = data.get("image", None)

        if not name:
            return jsonify({"error": "Category name cannot be empty"}), 400

        slug = re.sub(r"[^a-zA-Z0-9]+", "-", name.lower()).strip("-")

        if image is not None:
            execute(
                "UPDATE categories SET name = %s, slug = %s, image = %s WHERE id = %s",
                (name, slug, image, cat_id)
            )
        else:
            execute(
                "UPDATE categories SET name = %s, slug = %s WHERE id = %s",
                (name, slug, cat_id)
            )

        updated = query_one("SELECT * FROM categories WHERE id = %s", (cat_id,))
        return jsonify({"message": "Category updated successfully", "category": updated})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/categories/<int:cat_id>", methods=["DELETE"])
def delete_category(cat_id):
    try:
        execute("DELETE FROM categories WHERE id = %s", (cat_id,))
        return jsonify({"message": "Category removed successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==============================================================================
# PRODUCTS / JEWELS CATALOG & LIVE SEARCH
# ==============================================================================
@app.route("/api/products", methods=["GET"])
def get_products():
    category = request.args.get("category", "").strip()
    search = request.args.get("search", "").strip()

    try:
        sql = "SELECT * FROM products WHERE 1=1"
        params = []

        if category and category.lower() != "all":
            sql += " AND (LOWER(category_name) = LOWER(%s) OR category_id = %s)"
            params.extend([category, category if category.isdigit() else -1])

        if search:
            sql += " AND (name LIKE %s OR model_number LIKE %s OR details LIKE %s OR category_name LIKE %s)"
            pattern = f"%{search}%"
            params.extend([pattern, pattern, pattern, pattern])

        sql += " ORDER BY id DESC"
        products = query_all(sql, params)
        if products is not None and len(products) > 0:
            return jsonify({"products": products})
    except Exception:
        pass

    all_prods = get_default_products()
    for idx, p in enumerate(all_prods):
        p["id"] = idx + 1
        p["category_id"] = idx + 1

    res = all_prods
    if category and category.lower() != "all":
        res = [p for p in res if p["category_name"].lower() == category.lower()]
    if search:
        s_lower = search.lower()
        res = [p for p in res if s_lower in p["name"].lower() or s_lower in p["model_number"].lower() or s_lower in p["details"].lower() or s_lower in p["category_name"].lower()]

    return jsonify({"products": res})

@app.route("/api/products/<int:prod_id>", methods=["GET"])
def get_product(prod_id):
    try:
        product = query_one("SELECT * FROM products WHERE id = %s", (prod_id,))
        if product:
            return jsonify({"product": product})
    except Exception:
        pass

    all_prods = get_default_products()
    for idx, p in enumerate(all_prods):
        if (idx + 1) == prod_id:
            p["id"] = prod_id
            return jsonify({"product": p})

    return jsonify({"error": "Jewel product not found"}), 404

@app.route("/api/products", methods=["POST"])
def create_product():
    try:
        data = request.get_json() or {}
        name = str(data.get("name", "")).strip()
        category_name = str(data.get("category_name", "Ring")).strip()
        category_id = data.get("category_id", None)
        price = float(data.get("price", 0))
        grams = float(data.get("grams", 0))
        model_number = str(data.get("model_number", "")).strip()
        details = str(data.get("details", "")).strip()
        image = data.get("image", "")

        if not name or not model_number or price <= 0 or grams <= 0:
            return jsonify({"error": "Please provide valid jewel name, model, price and grams"}), 400

        # Look up category_id if not supplied
        if not category_id:
            c = query_one("SELECT id FROM categories WHERE LOWER(name) = LOWER(%s)", (category_name,))
            if c:
                category_id = c["id"]

        res = execute("""
        INSERT INTO products (name, category_id, category_name, price, grams, model_number, details, image, is_featured)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 1)
        """, (name, category_id, category_name, price, grams, model_number, details, image))

        new_prod = query_one("SELECT * FROM products WHERE id = %s", (res["lastrowid"],))
        return jsonify({"message": "Jewel product uploaded successfully", "product": new_prod}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/products/<int:prod_id>", methods=["PUT"])
def update_product(prod_id):
    try:
        data = request.get_json() or {}
        name = str(data.get("name", "")).strip()
        category_name = str(data.get("category_name", "")).strip()
        price = float(data.get("price", 0))
        grams = float(data.get("grams", 0))
        model_number = str(data.get("model_number", "")).strip()
        details = str(data.get("details", "")).strip()
        image = data.get("image", None)

        if not name or not model_number or price <= 0:
            return jsonify({"error": "Invalid product data provided"}), 400

        c = query_one("SELECT id FROM categories WHERE LOWER(name) = LOWER(%s)", (category_name,))
        category_id = c["id"] if c else None

        if image:
            execute("""
            UPDATE products 
            SET name = %s, category_id = %s, category_name = %s, price = %s, grams = %s, model_number = %s, details = %s, image = %s
            WHERE id = %s
            """, (name, category_id, category_name, price, grams, model_number, details, image, prod_id))
        else:
            execute("""
            UPDATE products 
            SET name = %s, category_id = %s, category_name = %s, price = %s, grams = %s, model_number = %s, details = %s
            WHERE id = %s
            """, (name, category_id, category_name, price, grams, model_number, details, prod_id))

        updated = query_one("SELECT * FROM products WHERE id = %s", (prod_id,))
        return jsonify({"message": "Jewel updated successfully", "product": updated})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/products/<int:prod_id>", methods=["DELETE"])
def delete_product(prod_id):
    try:
        execute("DELETE FROM products WHERE id = %s", (prod_id,))
        return jsonify({"message": "Jewel deleted successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==============================================================================
# ORDERS
# ==============================================================================
@app.route("/api/orders", methods=["POST"])
def place_order():
    try:
        data = request.get_json() or {}
        name = str(data.get("name", "")).strip()
        mobile = str(data.get("mobile", "")).strip()
        address = str(data.get("address", "")).strip()
        product_id = data.get("product_id")

        errors = {}
        if not name:
            errors["name"] = "Full name is required"
        if not mobile:
            errors["mobile"] = "Mobile number is required"
        else:
            digits = re.sub(r"\D", "", mobile)
            if len(digits) != 10:
                errors["mobile"] = "Mobile number must be 10 digits"

        if not address:
            errors["address"] = "Delivery address is required"
        if not product_id:
            errors["product_id"] = "Product selection is missing"

        if errors:
            return jsonify({"error": "Validation failed", "fieldErrors": errors}), 400

        # Retrieve product
        prod = query_one("SELECT * FROM products WHERE id = %s", (product_id,))
        if not prod:
            return jsonify({"error": "Selected jewel does not exist"}), 404

        # Generate unique order number
        order_num = f"SJJ-{datetime.utcnow().strftime('%Y%m%d')}-{secrets.randbelow(8999)+1000}"

        res = execute("""
        INSERT INTO orders (
            order_number, customer_name, customer_mobile, customer_address, 
            product_id, product_name, product_model, product_grams, product_price, product_image, status
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'Pending')
        """, (
            order_num,
            name,
            re.sub(r"\D", "", mobile),
            address,
            prod["id"],
            prod["name"],
            prod["model_number"],
            prod["grams"],
            prod["price"],
            prod["image"]
        ))

        new_order = query_one("SELECT * FROM orders WHERE id = %s", (res["lastrowid"],))
        return jsonify({
            "message": "Thanks for your order!",
            "order_number": order_num,
            "order": new_order
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/orders", methods=["GET"])
def get_orders():
    try:
        orders = query_all("SELECT * FROM orders ORDER BY id DESC")
        return jsonify({"orders": orders})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/orders/<int:order_id>/status", methods=["PUT"])
def update_order_status(order_id):
    try:
        data = request.get_json() or {}
        status = str(data.get("status", "Pending")).strip()
        execute("UPDATE orders SET status = %s WHERE id = %s", (status, order_id))
        updated = query_one("SELECT * FROM orders WHERE id = %s", (order_id,))
        return jsonify({"message": f"Order marked as {status}", "order": updated})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==============================================================================
# REGISTERED CUSTOMERS LIST (ADMIN VIEW)
# ==============================================================================
@app.route("/api/customers", methods=["GET"])
def get_customers():
    try:
        sql = """
        SELECT 
            c.id, 
            c.mobile, 
            c.created_at,
            COUNT(o.id) as total_orders,
            COALESCE(SUM(o.product_price), 0) as total_spent
        FROM customers c
        LEFT JOIN orders o ON c.mobile = o.customer_mobile
        GROUP BY c.id, c.mobile, c.created_at
        ORDER BY c.id DESC
        """
        customers = query_all(sql)
        return jsonify({"customers": customers})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==============================================================
# SPA FRONTEND STATIC SERVING (FOR LOCAL STANDALONE TESTING)
# ==============================================================
dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dist"))

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_spa(path):
    from flask import send_from_directory
    if path.startswith("api"):
        return jsonify({"error": "API route not found"}), 404
    file_path = os.path.join(dist_dir, path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return send_from_directory(dist_dir, path)
    index_file = os.path.join(dist_dir, "index.html")
    if os.path.exists(index_file):
        return send_from_directory(dist_dir, "index.html")
    return jsonify({"message": "Sri Jayam Jewellers API Online. Please run 'npm run dev' or 'npm run build'."})

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="127.0.0.1", port=port, debug=True)

