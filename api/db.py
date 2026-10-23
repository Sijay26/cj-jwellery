import os
import pymysql
import pymysql.cursors
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash
from api.seed_data import (
    get_luxury_logo_svg,
    get_default_categories,
    get_default_products
)

# Load environment variables
load_dotenv()

DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = int(os.getenv("DB_PORT", 3306))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "cjjweel_db")
DB_SSL = os.getenv("DB_SSL", "false").lower() in ("true", "1", "yes", "required")

def get_connection_args(select_db=True):
    args = {
        "host": DB_HOST,
        "port": DB_PORT,
        "user": DB_USER,
        "password": DB_PASSWORD,
        "charset": "utf8mb4",
        "cursorclass": pymysql.cursors.DictCursor,
        "autocommit": True,
        "connect_timeout": 15
    }
    if select_db:
        args["database"] = DB_NAME
    
    if DB_SSL:
        # Standard SSL options for cloud MySQL (TiDB Cloud, Aiven, Railway, AWS RDS, PlanetScale)
        args["ssl"] = {"ssl_mode": "REQUIRED"}
    
    return args

def get_db(select_db=True):
    """Obtain a database connection with auto-reconnect and creation support"""
    try:
        return pymysql.connect(**get_connection_args(select_db=select_db))
    except pymysql.err.OperationalError as e:
        # Code 1049: Unknown database. Let's create it automatically!
        if select_db and e.args and e.args[0] == 1049:
            ensure_database_exists()
            return pymysql.connect(**get_connection_args(select_db=True))
        raise e

def ensure_database_exists():
    """Create the target database if not already present on MySQL server"""
    conn = pymysql.connect(**get_connection_args(select_db=False))
    try:
        with conn.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
    finally:
        conn.close()

def init_db():
    """Automatically create all tables, indexes, and initial luxury seed data"""
    ensure_database_exists()
    conn = get_db(select_db=True)
    try:
        with conn.cursor() as cursor:
            # 1. Settings Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS settings (
                id INT PRIMARY KEY AUTO_INCREMENT,
                site_name VARCHAR(150) NOT NULL DEFAULT 'SRI JAYAM JEWELLERS',
                theme_color VARCHAR(30) NOT NULL DEFAULT '#220538',
                secondary_color VARCHAR(30) NOT NULL DEFAULT '#3b0d5c',
                accent_color VARCHAR(30) NOT NULL DEFAULT '#D4AF37',
                bg_image LONGTEXT NULL,
                bg_opacity DECIMAL(3,2) NOT NULL DEFAULT 0.25,
                logo LONGTEXT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)

            # 2. Categories Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS categories (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL,
                slug VARCHAR(100) NOT NULL UNIQUE,
                image LONGTEXT NULL,
                display_order INT NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)

            # 3. Products / Jewels Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                category_id INT NULL,
                category_name VARCHAR(100) NOT NULL,
                price DECIMAL(12,2) NOT NULL,
                grams DECIMAL(8,2) NOT NULL,
                model_number VARCHAR(100) NOT NULL,
                details TEXT NOT NULL,
                image LONGTEXT NULL,
                is_featured TINYINT(1) NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_category (category_name),
                INDEX idx_model (model_number)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)

            # 4. Customers Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS customers (
                id INT PRIMARY KEY AUTO_INCREMENT,
                mobile VARCHAR(20) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_cust_mobile (mobile)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)

            # 5. Orders Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id INT PRIMARY KEY AUTO_INCREMENT,
                order_number VARCHAR(50) NOT NULL UNIQUE,
                customer_name VARCHAR(150) NOT NULL,
                customer_mobile VARCHAR(20) NOT NULL,
                customer_address TEXT NOT NULL,
                product_id INT NULL,
                product_name VARCHAR(255) NOT NULL,
                product_model VARCHAR(100) NOT NULL,
                product_grams DECIMAL(8,2) NOT NULL,
                product_price DECIMAL(12,2) NOT NULL,
                product_image LONGTEXT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_order_mobile (customer_mobile)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)

            # 6. Admin Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS admins (
                id INT PRIMARY KEY AUTO_INCREMENT,
                mobile VARCHAR(20) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)

            # ---------------------------------------------
            # SEED DEFAULT DATA IF NOT PRESENT
            # ---------------------------------------------
            # Admin user: 6369058169 / sijay2606
            cursor.execute("SELECT id FROM admins WHERE mobile = %s", ("6369058169",))
            admin_row = cursor.fetchone()
            if not admin_row:
                hashed_pw = generate_password_hash("sijay2606")
                cursor.execute(
                    "INSERT INTO admins (mobile, password_hash) VALUES (%s, %s)",
                    ("6369058169", hashed_pw)
                )

            # Default Settings
            cursor.execute("SELECT id FROM settings LIMIT 1")
            setting_row = cursor.fetchone()
            if not setting_row:
                cursor.execute("""
                INSERT INTO settings (site_name, theme_color, secondary_color, accent_color, bg_image, bg_opacity, logo)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (
                    "SRI JAYAM JEWELLERS",
                    "#220538",
                    "#3b0d5c",
                    "#D4AF37",
                    "",
                    0.25,
                    get_luxury_logo_svg()
                ))

            # Default Categories
            cursor.execute("SELECT COUNT(*) AS cnt FROM categories")
            cat_count = cursor.fetchone()["cnt"]
            if cat_count == 0:
                for cat in get_default_categories():
                    cursor.execute("""
                    INSERT INTO categories (name, slug, image, display_order)
                    VALUES (%s, %s, %s, %s)
                    """, (cat["name"], cat["slug"], cat["image"], cat["display_order"]))

            # Default Products
            cursor.execute("SELECT COUNT(*) AS cnt FROM products")
            prod_count = cursor.fetchone()["cnt"]
            if prod_count == 0:
                # Map category slugs to category ids
                cursor.execute("SELECT id, name FROM categories")
                cat_map = {c["name"]: c["id"] for c in cursor.fetchall()}

                for p in get_default_products():
                    cat_id = cat_map.get(p["category_name"])
                    cursor.execute("""
                    INSERT INTO products (name, category_id, category_name, price, grams, model_number, details, image, is_featured)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        p["name"],
                        cat_id,
                        p["category_name"],
                        p["price"],
                        p["grams"],
                        p["model_number"],
                        p["details"],
                        p["image"],
                        p["is_featured"]
                    ))

        return True
    finally:
        conn.close()

def query_all(sql, params=None):
    conn = get_db(select_db=True)
    try:
        with conn.cursor() as cursor:
            cursor.execute(sql, params or ())
            return cursor.fetchall()
    finally:
        conn.close()

def query_one(sql, params=None):
    conn = get_db(select_db=True)
    try:
        with conn.cursor() as cursor:
            cursor.execute(sql, params or ())
            return cursor.fetchone()
    finally:
        conn.close()

def execute(sql, params=None):
    conn = get_db(select_db=True)
    try:
        with conn.cursor() as cursor:
            cursor.execute(sql, params or ())
            return {"lastrowid": cursor.lastrowid, "rowcount": cursor.rowcount}
    finally:
        conn.close()
