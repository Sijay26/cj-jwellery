# 💎 Sri Jayam Jewellers (CJJWEEL)
### Pure 22KT 916 BIS Hallmarked Luxury Jewellery E-Commerce Platform

A production-grade, full-stack luxury jewellery e-commerce application crafted with **React (Vite)**, **Python (Flask)**, and **MySQL**.

---

## 🌟 Live Website URL
- **Live Vercel Production URL**: [https://fast-slate-62i1ny2.tmp.now](https://fast-slate-62i1ny2.tmp.now)
- **Local Development URL**: [http://127.0.0.1:5000](http://127.0.0.1:5000)

---

## 🎨 Luxury Design & Aesthetics
- **Theme**: Royal Deep Purple gradient (`#220538` & `#3b0d5c`) with metallic pure gold accents (`#D4AF37`) and glassmorphic translucent panels.
- **Typography**:
  - **Cinzel**: Royal Brand Name & Luxury Badges
  - **Playfair Display**: Regal Headings & Jewel Titles
  - **Cormorant Garamond**: Accents, Gold Grams & Hallmark Tags
  - **Poppins**: UI Labels, Buttons & Body Text
- **Currency**: Indian Rupees (**INR, ₹**) with Indian numbering formatting (e.g. `₹ 1,98,000`).
- **Zero-Storage Image System**: All jewel images, category emblems, logos, and custom background images are stored directly in **MySQL** (using client-side canvas compression) for full compatibility with Vercel's ephemeral serverless filesystem.

---

## 👑 Customer & Admin Flows

### 1. Customer Experience
- **Authentication**: Customer Login via 10-digit mobile number & password.
- **Registration**: 10-digit mobile number, password & confirm password validation. Duplicate mobile numbers are strictly prevented. On successful signup, an **OK confirmation popup** is displayed which transitions straight into the store upon clicking OK.
- **Clean Form Reset**: On logout or page transitions, all entered details are cleared and form states are reset to default with autofill disabled.
- **Home Page**:
  - Live **Jewel Search Bar**: Live dropdown suggestions displaying jewel thumbnail, name, price, and model number. Clicking opens the jewel product page.
  - **Category Pills with Images**: `Ring`, `Aram`, `Bracelet`, `Chain`, `Bangles`, `Earrings`. Clicking filters the collection.
  - **Jewel Cards**: Displays high-resolution jewel image, name, price in INR, grams (net gold weight), and model number.
  - **Dedicated Product Page Rule**: There is **no buying directly from the list**. Customers must first open and view the dedicated Product Page.
- **Product Page**:
  - Displays large image view, price in INR, grams, model number, full handcrafted details, and 916 BIS Hallmark credentials.
  - **Exactly Two Buttons Under the Jewel**:
    1. **Buy Now**: Opens an order modal asking for **Name**, **Mobile Number**, and **Delivery Address**. If any field is empty, it highlights the field with a **prominent red box and red error message**. Valid submission saves the order into MySQL, displays *"Thanks for your order!"*, and automatically redirects back to the Home page.
    2. **Enquiry (WhatsApp)**: Automatically opens a WhatsApp chat with **+91 6369058169**. The message is pre-filled with the exact jewel being viewed (Name, Model, Grams, Price in INR, product page link, and image link).

### 2. Admin Management
- **Admin Login Switch**: Switch between **Customer | Admin** in the top-right corner of the login screen.
- **Default Admin Credentials**:
  - **Mobile**: `6369058169`
  - **Password**: `sijay2606`
  *(Pre-seeded with secure password hash in MySQL `admins` table)*
- **Catalog Management**: Upload new jewels with image, price (INR), grams, model number, details, and category. Edit and delete jewels with instant live updates on the customer side.
- **Category Management**: Add new categories with image, rename existing categories, change images, and delete them.
- **Orders Dashboard**: View all customer orders with customer name, mobile, delivery address, jewel item, price, grams, date, and live status dropdown (`Pending`, `Confirmed`, `Shipped`, `Delivered`, `Cancelled`).
- **Registered Customers**: View all registered customers, registration dates, order counts, and total spend.
- **Appearance & Branding**:
  - **Theme Colour Picker**: Native color picker + luxury presets (*Royal Purple*, *Imperial Plum*, *Midnight Sapphire*, *Emerald Velvet*, *Ruby Splendor*, *Obsidian Gold*). The chosen color dynamically updates the entire website and background gradients.
  - **Gold Accent Picker**: Custom metallic gold choices (*Royal Gold*, *Champagne Gold*, *Antique Gold*, *Rose Gold*).
  - **Brand Logo & Website Name**: Upload custom logo image/SVG and change site title.
  - **Background Image & Opacity Slider**: Upload a custom background image with an opacity slider (0% to 100%) so the image blends softly with the purple gradient. Option to remove the background image.

---

## 🛠️ Technology Stack
- **Frontend**: React 18, Vite, Lucide React, Vanilla CSS Design System
- **Backend**: Python 3.12 / 3.11, Flask, Flask-CORS, PyMySQL, Cryptography, Werkzeug
- **Database**: MySQL (Compatible with local XAMPP and Cloud MySQL providers)
- **Deployment**: Monorepo deployed on **Vercel** (`api/index.py` Serverless Functions + React Static Build)

---

## 💻 Local Setup with XAMPP (Step-by-Step)

### Prerequisites
1. **XAMPP** installed on your computer ([Download XAMPP](https://www.apachefriends.org/)).
2. **Node.js** (v18+) and **Python** (v3.11+).

### Step 1: Start MySQL in XAMPP
1. Open the **XAMPP Control Panel**.
2. Click **Start** next to **MySQL** (and Apache if desired).
3. Verify MySQL status turns green on port `3306`.
   *(Default XAMPP credentials: Host `127.0.0.1`, User `root`, Password: empty)*.

### Step 2: Automatic Database Initialization
The application automatically creates the database `cjjweel_db`, all 6 tables, default admin credentials, categories, settings, and 16 initial luxury jewels on startup.
You do **NOT** need to manually import any `.sql` files.

### Step 3: Run the Application
You can run both backend and frontend together or separately:

#### Option A: Standalone Single-Port Mode (Recommended for testing)
Build the frontend once and let Flask serve both the API and frontend on port 5000:
```bash
# 1. Install frontend dependencies and build
npm install
npm run build

# 2. Run Flask server
python run.py
```
Open **`http://127.0.0.1:5000`** in your browser.

#### Option B: Full Development Mode with Hot Reload
In Terminal 1 (Backend):
```bash
python run.py
```
In Terminal 2 (Frontend with Vite Hot Reload):
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🚀 Vercel Deployment & Cloud MySQL Setup

### ⚠️ Why Cloud MySQL is Required for the Live Site
> **Important Note**:
> When your website is deployed on **Vercel**, it runs in the cloud (AWS Lambda serverless containers).
> Vercel servers on the internet **cannot connect to `127.0.0.1` or `localhost` on your home laptop** because your laptop is behind a private home router/firewall.
> Therefore, the live production site needs a **Free Cloud MySQL** database.

### Recommended 100% Free Cloud MySQL Providers:
1. **TiDB Cloud Serverless** ([https://tidbcloud.com](https://tidbcloud.com)): Free 5GB MySQL-compatible database forever with SSL support.
2. **Aiven for MySQL** ([https://aiven.io](https://aiven.io)): Free tier managed MySQL.
3. **Railway** ([https://railway.app](https://railway.app)): Free MySQL plugin instance.

---

### Step-by-Step Vercel Deployment Instructions

#### Method 1: Deploy via GitHub (Recommended)
1. Push your code to your GitHub repository:
   ```bash
   git add .
   git commit -m "Production luxury jewellery e-commerce"
   git push origin main
   ```
2. Log in to [Vercel](https://vercel.com).
3. Click **"Add New Project"** and select your GitHub repository `cjjweel`.
4. In the **Environment Variables** section, enter your Cloud MySQL credentials:
   - `DB_HOST`: Your cloud database host (e.g. `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`)
   - `DB_PORT`: `4000` (or `3306`)
   - `DB_USER`: Your cloud database username
   - `DB_PASSWORD`: Your cloud database password
   - `DB_NAME`: `cjjweel_db`
   - `DB_SSL`: `true`
   - `SECRET_KEY`: `your_random_secret_jwt_key`
5. Click **"Deploy"**.
6. Vercel will build the React frontend and deploy the Python API in **one unified project**.
7. Your live website URL will be ready at: `https://<your-project>.vercel.app`!

#### Method 2: Deploy via Vercel CLI
```bash
# 1. Login to Vercel
npx vercel login

# 2. Deploy to Production with environment variables
npx vercel --prod \
  -e DB_HOST="your-cloud-db-host" \
  -e DB_USER="your-db-user" \
  -e DB_PASSWORD="your-db-password" \
  -e DB_NAME="cjjweel_db" \
  -e DB_SSL="true"
```

---

## 🔒 Security & Quality Features
- **Password Hashing**: Industry-standard `werkzeug.security` scrypt / pbkdf2 hashing.
- **Input Sanitization**: Server-side and client-side phone number normalization, password matching, and mandatory address checks.
- **CORS Protection**: Secure API routing between React frontend and Flask server.
- **Client Image Compression**: HTML5 Canvas preprocessing downscales images before MySQL transport to maintain sub-second page loads.
