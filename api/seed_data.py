"""
Curated luxury seed data for Sri Jayam Jewellers (CJJWEEL).
Provides category images, jewel products with images, specs, model numbers, grams, and prices in INR.
All images are self-contained high-fidelity SVG/data-URIs to guarantee zero external dependency failures.
"""

def get_luxury_logo_svg():
    return """data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" width="400" height="100">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23F3E5AB" />
      <stop offset="25%" stop-color="%23D4AF37" />
      <stop offset="50%" stop-color="%23FFF2B2" />
      <stop offset="75%" stop-color="%23AA771C" />
      <stop offset="100%" stop-color="%23E5C07B" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <g transform="translate(10, 8)">
    <circle cx="42" cy="42" r="38" fill="none" stroke="url(%23goldGrad)" stroke-width="2" opacity="0.8" />
    <circle cx="42" cy="42" r="33" fill="none" stroke="url(%23goldGrad)" stroke-width="1" stroke-dasharray="3 3" opacity="0.9" />
    <!-- Crown & Diamond emblem -->
    <path d="M42 20 L58 36 L50 62 L34 62 L26 36 Z" fill="none" stroke="url(%23goldGrad)" stroke-width="2.5" />
    <path d="M26 36 L42 42 L58 36" fill="none" stroke="url(%23goldGrad)" stroke-width="2" />
    <path d="M42 20 L42 62" fill="none" stroke="url(%23goldGrad)" stroke-width="1.8" />
    <circle cx="42" cy="42" r="3" fill="url(%23goldGrad)" />
    <!-- Sparkles -->
    <polygon points="42,12 44,17 49,19 44,21 42,26 40,21 35,19 40,17" fill="url(%23goldGrad)" />
  </g>
  <!-- Brand text -->
  <text x="105" y="44" font-family="'Cinzel', 'Playfair Display', serif" font-size="28" font-weight="700" letter-spacing="4" fill="url(%23goldGrad)" filter="url(%23glow)">SRI JAYAM</text>
  <text x="107" y="66" font-family="'Cormorant Garamond', serif" font-size="14" font-weight="600" letter-spacing="6" fill="%23E5C07B">LUXURY JEWELLERS • 916 HALLMARK</text>
</svg>"""

def get_category_image_svg(category_name):
    cat_colors = {
        "Ring": ("#FFDF73", "#996515", "M100 40 A35 35 0 1 0 100 110 A35 35 0 1 0 100 40 M100 25 L115 40 L85 40 Z"),
        "Aram": ("#FFE484", "#B8860B", "M50 40 Q100 130 150 40 Q100 110 50 40 M70 85 Q100 135 130 85 M90 115 L100 145 L110 115 Z"),
        "Bracelet": ("#F9D976", "#A67C1E", "M50 75 C50 45, 150 45, 150 75 C150 105, 50 105, 50 75 Z M60 75 C60 55, 140 55, 140 75 C140 95, 60 95, 60 75 Z"),
        "Chain": ("#F5D061", "#8C6239", "M60 30 Q100 140 140 30 M70 30 Q100 120 130 30 M100 125 L100 155"),
        "Bangles": ("#FFEAA7", "#D35400", "M75 75 A40 40 0 1 0 75 74.9 M125 75 A40 40 0 1 0 125 74.9"),
        "Earrings": ("#FFD700", "#B38728", "M80 40 L80 60 L65 100 Q80 120 95 100 L80 60 M120 40 L120 60 L105 100 Q120 120 135 100 L120 60")
    }
    c1, c2, path = cat_colors.get(category_name, ("#F3E5AB", "#AA771C", "M70 70 L130 70 L100 130 Z"))
    
    return f"""data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <radialGradient id="bgG" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="%233A0D5C" />
      <stop offset="60%" stop-color="%231E0533" />
      <stop offset="100%" stop-color="%230E021A" />
    </radialGradient>
    <linearGradient id="goldG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{c1.replace('#', '%23')}" />
      <stop offset="50%" stop-color="%23FFF6D1" />
      <stop offset="100%" stop-color="{c2.replace('#', '%23')}" />
    </linearGradient>
    <filter id="softGlow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="200" height="200" rx="30" fill="url(%23bgG)" />
  <circle cx="100" cy="95" r="70" fill="none" stroke="url(%23goldG)" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.4" />
  <circle cx="100" cy="95" r="62" fill="%2324053B" fill-opacity="0.6" stroke="url(%23goldG)" stroke-width="1" opacity="0.6" />
  
  <path d="{path}" fill="none" stroke="url(%23goldG)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" filter="url(%23softGlow)" />
  
  <text x="100" y="172" font-family="'Cinzel', serif" font-size="15" font-weight="700" letter-spacing="2" fill="url(%23goldG)" text-anchor="middle">{category_name.upper()}</text>
</svg>"""

def get_jewel_image_svg(name, category, grams, model):
    """Generate dynamic high-luxury SVG jewel visuals"""
    c_map = {
        "Ring": ("#FFE082", "#B78103", "ring"),
        "Aram": ("#FFE484", "#996515", "aram"),
        "Bracelet": ("#F9D976", "#A67C1E", "bracelet"),
        "Chain": ("#F5D061", "#8C6239", "chain"),
        "Bangles": ("#FFEAA7", "#B8860B", "bangles"),
        "Earrings": ("#FFD700", "#9E7B15", "earrings")
    }
    gold1, gold2, shape = c_map.get(category, ("#F3E5AB", "#AA771C", "ring"))
    
    # Custom vector path illustrations for each luxury jewel type
    if shape == "ring":
        inner_artwork = """
        <!-- Diamond Ring Motif -->
        <ellipse cx="250" cy="260" rx="90" ry="85" fill="none" stroke="url(#goldL)" stroke-width="16" />
        <ellipse cx="250" cy="260" rx="80" ry="75" fill="none" stroke="#FFF5C2" stroke-width="3" opacity="0.7"/>
        <!-- Ring head & mount -->
        <path d="M220 180 L280 180 L290 145 L210 145 Z" fill="url(#goldL)" stroke="#FFDF73" stroke-width="2" />
        <!-- Solitaire Diamond with refraction facets -->
        <polygon points="250,90 285,130 250,170 215,130" fill="url(#gemGrad)" stroke="#FFFFFF" stroke-width="2" filter="url(#gemGlow)" />
        <line x1="215" y1="130" x2="285" y2="130" stroke="#FFFFFF" stroke-width="1.5" />
        <line x1="250" y1="90" x2="250" y2="170" stroke="#FFFFFF" stroke-width="1" />
        <polygon points="250,90 235,130 250,170 265,130" fill="#E8F4FD" fill-opacity="0.4" />
        <!-- Accent stones -->
        <circle cx="215" cy="180" r="5" fill="#FFFFFF" />
        <circle cx="285" cy="180" r="5" fill="#FFFFFF" />
        """
    elif shape == "aram":
        inner_artwork = """
        <!-- Royal Temple Haram Kasu Mala -->
        <path d="M140 100 Q250 300 360 100" fill="none" stroke="url(#goldL)" stroke-width="12" stroke-linecap="round" />
        <path d="M155 120 Q250 330 345 120" fill="none" stroke="url(#goldL)" stroke-width="8" stroke-dasharray="14 8" />
        <!-- Inner necklace string -->
        <path d="M175 140 Q250 360 325 140" fill="none" stroke="url(#goldL)" stroke-width="6" />
        <!-- Kasu coins & drops -->
        <circle cx="250" cy="360" r="14" fill="url(#goldL)" stroke="#FFE899" stroke-width="2"/>
        <circle cx="220" cy="345" r="12" fill="url(#goldL)" />
        <circle cx="280" cy="345" r="12" fill="url(#goldL)" />
        <circle cx="190" cy="315" r="11" fill="url(#goldL)" />
        <circle cx="310" cy="315" r="11" fill="url(#goldL)" />
        <circle cx="165" cy="275" r="10" fill="url(#goldL)" />
        <circle cx="335" cy="275" r="10" fill="url(#goldL)" />
        <!-- Grand Temple Locket Pendant -->
        <path d="M225 365 L275 365 L285 410 L250 435 L215 410 Z" fill="url(#goldL)" stroke="#FFEA88" stroke-width="3" filter="url(#gemGlow)"/>
        <!-- Ruby center in pendant -->
        <ellipse cx="250" cy="395" rx="14" ry="16" fill="url(#rubyGrad)" stroke="#FFD700" stroke-width="2" />
        <circle cx="250" cy="445" r="6" fill="#F0F8FF" stroke="#FFD700" stroke-width="1" />
        """
    elif shape == "bracelet":
        inner_artwork = """
        <!-- Royal Filigree Kada / Tennis Bracelet -->
        <ellipse cx="250" cy="250" rx="140" ry="110" fill="none" stroke="url(#goldL)" stroke-width="22" stroke-linecap="round" />
        <ellipse cx="250" cy="250" rx="140" ry="110" fill="none" stroke="#FFF7D6" stroke-width="3" stroke-dasharray="6 8" />
        <!-- Filigree carvings & gemstone studs -->
        <circle cx="250" cy="140" r="10" fill="url(#rubyGrad)" stroke="#FFF" stroke-width="2" />
        <circle cx="180" cy="165" r="7" fill="url(#gemGrad)" stroke="#FFF" stroke-width="1" />
        <circle cx="320" cy="165" r="7" fill="url(#gemGrad)" stroke="#FFF" stroke-width="1" />
        <circle cx="120" cy="230" r="8" fill="url(#rubyGrad)" stroke="#FFF" stroke-width="1.5" />
        <circle cx="380" cy="230" r="8" fill="url(#rubyGrad)" stroke="#FFF" stroke-width="1.5" />
        <circle cx="180" cy="335" r="7" fill="url(#gemGrad)" stroke="#FFF" stroke-width="1" />
        <circle cx="320" cy="335" r="7" fill="url(#gemGrad)" stroke="#FFF" stroke-width="1" />
        <circle cx="250" cy="360" r="10" fill="url(#rubyGrad)" stroke="#FFF" stroke-width="2" />
        """
    elif shape == "chain":
        inner_artwork = """
        <!-- Pure 22KT Gold Rope Chain -->
        <path d="M170 80 Q250 360 330 80" fill="none" stroke="url(#goldL)" stroke-width="16" stroke-linecap="round" />
        <path d="M170 80 Q250 360 330 80" fill="none" stroke="#FFEBAA" stroke-width="4" stroke-dasharray="8 6" />
        <path d="M190 80 Q250 320 310 80" fill="none" stroke="url(#goldL)" stroke-width="8" stroke-dasharray="10 4" />
        <!-- Luxury Gold Tassel / Pendant Mount -->
        <rect x="242" y="340" width="16" height="35" rx="5" fill="url(#goldL)" stroke="#FFF" stroke-width="1.5" />
        <circle cx="250" cy="390" r="16" fill="url(#goldL)" stroke="#FFDF73" stroke-width="2" />
        <circle cx="250" cy="390" r="8" fill="url(#rubyGrad)" />
        """
    elif shape == "bangles":
        inner_artwork = """
        <!-- Pair of Nagas Temple Bangles -->
        <ellipse cx="220" cy="240" rx="95" ry="90" fill="none" stroke="url(#goldL)" stroke-width="18" />
        <ellipse cx="220" cy="240" rx="95" ry="90" fill="none" stroke="#FFEFA8" stroke-width="3" stroke-dasharray="6 6" />
        <ellipse cx="280" cy="260" rx="95" ry="90" fill="none" stroke="url(#goldL)" stroke-width="18" opacity="0.95" />
        <ellipse cx="280" cy="260" rx="95" ry="90" fill="none" stroke="#FFEFA8" stroke-width="3" stroke-dasharray="6 6" />
        <!-- Rubies studded along the perimeter -->
        <circle cx="220" cy="150" r="6" fill="url(#rubyGrad)" />
        <circle cx="280" cy="170" r="6" fill="url(#rubyGrad)" />
        <circle cx="150" cy="200" r="6" fill="url(#rubyGrad)" />
        <circle cx="350" cy="220" r="6" fill="url(#rubyGrad)" />
        <circle cx="220" cy="330" r="6" fill="url(#rubyGrad)" />
        <circle cx="280" cy="350" r="6" fill="url(#rubyGrad)" />
        """
    else:  # earrings
        inner_artwork = """
        <!-- Royal Jhumka with South Sea Pearls -->
        <!-- Left Earring -->
        <circle cx="190" cy="150" r="14" fill="url(#rubyGrad)" stroke="url(#goldL)" stroke-width="3" />
        <path d="M190 164 L190 195" stroke="url(#goldL)" stroke-width="4" />
        <path d="M165 215 Q190 185 215 215 Z" fill="url(#goldL)" stroke="#FFE899" stroke-width="2" />
        <path d="M160 215 L220 215" stroke="url(#goldL)" stroke-width="5" />
        <circle cx="170" cy="228" r="4" fill="#F8F9FA" />
        <circle cx="190" cy="230" r="5" fill="#F8F9FA" />
        <circle cx="210" cy="228" r="4" fill="#F8F9FA" />
        <!-- Right Earring -->
        <circle cx="310" cy="150" r="14" fill="url(#rubyGrad)" stroke="url(#goldL)" stroke-width="3" />
        <path d="M310 164 L310 195" stroke="url(#goldL)" stroke-width="4" />
        <path d="M285 215 Q310 185 335 215 Z" fill="url(#goldL)" stroke="#FFE899" stroke-width="2" />
        <path d="M280 215 L340 215" stroke="url(#goldL)" stroke-width="5" />
        <circle cx="290" cy="228" r="4" fill="#F8F9FA" />
        <circle cx="310" cy="230" r="5" fill="#F8F9FA" />
        <circle cx="330" cy="228" r="4" fill="#F8F9FA" />
        """

    svg = f"""data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <radialGradient id="luxBg" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="%233A0D5C" />
      <stop offset="50%" stop-color="%23220538" />
      <stop offset="85%" stop-color="%2311021C" />
      <stop offset="100%" stop-color="%2309010F" />
    </radialGradient>
    <linearGradient id="goldL" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{gold1.replace('#', '%23')}" />
      <stop offset="35%" stop-color="%23FFF9D9" />
      <stop offset="70%" stop-color="{gold2.replace('#', '%23')}" />
      <stop offset="100%" stop-color="%237A5308" />
    </linearGradient>
    <linearGradient id="gemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23FFFFFF" />
      <stop offset="50%" stop-color="%23D6EAF8" />
      <stop offset="100%" stop-color="%2385C1E9" />
    </linearGradient>
    <radialGradient id="rubyGrad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="%23FF5376" />
      <stop offset="60%" stop-color="%23C2185B" />
      <stop offset="100%" stop-color="%23680826" />
    </radialGradient>
    <filter id="gemGlow">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <!-- Background -->
  <rect width="500" height="500" rx="36" fill="url(%23luxBg)" />
  <circle cx="250" cy="250" r="210" fill="none" stroke="url(%23goldL)" stroke-width="1.5" stroke-dasharray="3 4" opacity="0.4" />
  <circle cx="250" cy="250" r="195" fill="none" stroke="url(%23goldL)" stroke-width="0.8" opacity="0.3" />
  
  <!-- Corner Luxury Accents -->
  <path d="M 30 60 L 30 30 L 60 30" fill="none" stroke="url(%23goldL)" stroke-width="2" opacity="0.8" />
  <path d="M 470 60 L 470 30 L 440 30" fill="none" stroke="url(%23goldL)" stroke-width="2" opacity="0.8" />
  <path d="M 30 440 L 30 470 L 60 470" fill="none" stroke="url(%23goldL)" stroke-width="2" opacity="0.8" />
  <path d="M 470 440 L 470 470 L 440 470" fill="none" stroke="url(%23goldL)" stroke-width="2" opacity="0.8" />

  <!-- Hallmark Tag -->
  <g transform="translate(38, 42)">
    <rect width="84" height="26" rx="13" fill="%2324053B" stroke="url(%23goldL)" stroke-width="1" />
    <text x="42" y="17" font-family="'Poppins', sans-serif" font-size="10" font-weight="600" letter-spacing="1" fill="%23FFDF73" text-anchor="middle">916 BIS</text>
  </g>

  <!-- Model Badge -->
  <g transform="translate(355, 42)">
    <rect width="105" height="26" rx="13" fill="%2324053B" stroke="url(%23goldL)" stroke-width="1" />
    <text x="52" y="17" font-family="'Poppins', sans-serif" font-size="10" font-weight="500" fill="%23E5C07B" text-anchor="middle">{model}</text>
  </g>

  <!-- Jewel Graphic -->
  {inner_artwork}

  <!-- Weight Badge -->
  <g transform="translate(250, 460)">
    <text x="0" y="0" font-family="'Cormorant Garamond', serif" font-size="17" font-weight="700" letter-spacing="3" fill="url(%23goldL)" text-anchor="middle">{grams:.2f} GRAMS • PURE 22KT GOLD</text>
  </g>
</svg>"""
    return svg.replace("\n", " ").strip()


def get_default_categories():
    return [
        {"name": "Ring", "slug": "ring", "display_order": 1, "image": get_category_image_svg("Ring")},
        {"name": "Aram", "slug": "aram", "display_order": 2, "image": get_category_image_svg("Aram")},
        {"name": "Bracelet", "slug": "bracelet", "display_order": 3, "image": get_category_image_svg("Bracelet")},
        {"name": "Chain", "slug": "chain", "display_order": 4, "image": get_category_image_svg("Chain")},
        {"name": "Bangles", "slug": "bangles", "display_order": 5, "image": get_category_image_svg("Bangles")},
        {"name": "Earrings", "slug": "earrings", "display_order": 6, "image": get_category_image_svg("Earrings")}
    ]


def get_default_products():
    items = [
        {
            "name": "Royal Solitaire Diamond & Gold Ring",
            "category_name": "Ring",
            "price": 68500.0,
            "grams": 8.25,
            "model_number": "SJJ-RNG-101",
            "details": "Exquisite 22KT yellow gold ring crowned with a certified brilliant-cut diamond solitaire. Intricate filigree shank handcrafted by master goldsmiths. Hallmarked 916 BIS purity guaranteed.",
            "is_featured": 1
        },
        {
            "name": "Peacock Antique Nakshi Gold Ring",
            "category_name": "Ring",
            "price": 92000.0,
            "grams": 11.50,
            "model_number": "SJJ-RNG-102",
            "details": "Heritage handcrafted antique gold ring featuring an ornate Mayil (Peacock) motif with ruby eyes. Pure 22KT gold with vintage matte antique finish.",
            "is_featured": 1
        },
        {
            "name": "Imperial Emerald Polki Cocktail Ring",
            "category_name": "Ring",
            "price": 135000.0,
            "grams": 14.80,
            "model_number": "SJJ-RNG-103",
            "details": "Statement cocktail ring embellished with a radiant Zambian emerald center surrounded by uncut uncut polki diamonds set in 22KT gold bezel.",
            "is_featured": 1
        },
        {
            "name": "Grand Temple Nakshi Kasu Haram (Aram)",
            "category_name": "Aram",
            "price": 685000.0,
            "grams": 88.00,
            "model_number": "SJJ-ARM-201",
            "details": "Magnificent South Indian bridal temple haram featuring goddess Lakshmi Kasu coins, divine nagas craftsmanship, and a breathtaking carved pendant adorned with natural Burmese rubies. 22KT 916 Hallmarked.",
            "is_featured": 1
        },
        {
            "name": "Traditional Antique Kasu Mala Long Haram",
            "category_name": "Aram",
            "price": 475000.0,
            "grams": 62.50,
            "model_number": "SJJ-ARM-202",
            "details": "Classic bridal Kasu Mala crafted with precision-embossed gold coins linked with delicate ruby florets. Heavy traditional lock with adjustable luxury dori.",
            "is_featured": 1
        },
        {
            "name": "Guttapusalu Pearl & Ruby Royal Haram",
            "category_name": "Aram",
            "price": 560000.0,
            "grams": 74.20,
            "model_number": "SJJ-ARM-203",
            "details": "Heritage Guttapusalu long necklace fringed with clusters of genuine Basra pearls and pigeon-blood rubies set in 22KT antique gold.",
            "is_featured": 1
        },
        {
            "name": "Royal Filigree Kada Gold Bracelet",
            "category_name": "Bracelet",
            "price": 185000.0,
            "grams": 24.00,
            "model_number": "SJJ-BRC-301",
            "details": "Contemporary luxury men and women unisex kada with intricate openwork filigree and secure double-screw clasp. Cast in 22 Karat solid gold.",
            "is_featured": 1
        },
        {
            "name": "Rose Gold & Diamond Tennis Bracelet",
            "category_name": "Bracelet",
            "price": 245000.0,
            "grams": 18.50,
            "model_number": "SJJ-BRC-302",
            "details": "Sophisticated 18KT rose gold tennis bracelet line-set with EF-VVS certified natural diamonds. Perfect for modern luxury cocktail evenings.",
            "is_featured": 1
        },
        {
            "name": "22KT Handcrafted Pure Gold Rope Chain",
            "category_name": "Chain",
            "price": 198000.0,
            "grams": 26.00,
            "model_number": "SJJ-CHN-401",
            "details": "Heavy solid 22 Karat pure gold rope link chain. High-polish finish with robust lobster lock. Suitable for daily wear or religious pendants.",
            "is_featured": 1
        },
        {
            "name": "Italian Mesh Dual-Tone Designer Chain",
            "category_name": "Chain",
            "price": 142000.0,
            "grams": 18.20,
            "model_number": "SJJ-CHN-402",
            "details": "Modern Italian diamond-cut mesh chain woven in yellow and white gold tones. Feather-light feel with heavyweight visual opulence.",
            "is_featured": 1
        },
        {
            "name": "Rudraksha Gold Cap Sacred Chain",
            "category_name": "Chain",
            "price": 178000.0,
            "grams": 23.50,
            "model_number": "SJJ-CHN-403",
            "details": "Authentic five-mukhi sacred Rudraksha beads encased in handcrafted 22KT gold flower caps and interlocking gold wire joints.",
            "is_featured": 1
        },
        {
            "name": "Antique Temple Lakshmi Nagas Bangles (Set of 2)",
            "category_name": "Bangles",
            "price": 395000.0,
            "grams": 52.00,
            "model_number": "SJJ-BNG-501",
            "details": "Pair of solid bridal temple bangles featuring embossed Ashta Lakshmi figures and intricate floral creepers. Screw-open mechanism for effortless fitting.",
            "is_featured": 1
        },
        {
            "name": "Royal Meenakari Handcrafted Gold Bangles",
            "category_name": "Bangles",
            "price": 285000.0,
            "grams": 38.50,
            "model_number": "SJJ-BNG-502",
            "details": "Vibrant royal enamel (Meenakari) artwork on 22KT gold bangles accented with cabochon ruby studs. Inspired by Jaipur royal court jewellery.",
            "is_featured": 1
        },
        {
            "name": "Royal Antique Jhumka with South Sea Pearls",
            "category_name": "Earrings",
            "price": 165000.0,
            "grams": 21.80,
            "model_number": "SJJ-ERN-601",
            "details": "Grand traditional Jhumkas with bell-shaped filigree drops, ruby tops, and delicate hanging South Sea pearls. Screw-back closure for comfort.",
            "is_featured": 1
        },
        {
            "name": "Chandbali Antique Polki & Emerald Earrings",
            "category_name": "Earrings",
            "price": 195000.0,
            "grams": 25.40,
            "model_number": "SJJ-ERN-602",
            "details": "Crescent moon shaped Chandbali earrings studded with uncut polki diamonds and cascading natural emerald drops. Handcrafted in 22KT hallmarked gold.",
            "is_featured": 1
        },
        {
            "name": "Diamond Cluster Luxury Stud Earrings",
            "category_name": "Earrings",
            "price": 115000.0,
            "grams": 9.60,
            "model_number": "SJJ-ERN-603",
            "details": "Floral diamond cluster earrings featuring brilliant round cut diamonds set in 18KT yellow gold. Everyday royal elegance with Bombay screw posts.",
            "is_featured": 1
        }
    ]

    for item in items:
        item["image"] = get_jewel_image_svg(item["name"], item["category_name"], item["grams"], item["model_number"])
    
    return items
