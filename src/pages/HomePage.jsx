import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { apiRequest } from '../utils/api';
import { formatINR, formatGrams } from '../utils/currency';
import { Sparkles, Diamond, ShieldCheck, Award, Eye, Filter, ArrowRight } from 'lucide-react';

export default function HomePage({ onNavigate }) {
  const { settings } = useTheme();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // Fetch categories and products from MySQL
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          apiRequest('/categories'),
          apiRequest('/products'),
        ]);

        if (isMounted) {
          if (catRes.categories) setCategories(catRes.categories);
          if (prodRes.products) setProducts(prodRes.products);
        }
      } catch (err) {
        console.error('Failed to load store data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Filter products by selected category
  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(
        (p) =>
          p.category_name?.toLowerCase() === selectedCategory.toLowerCase() ||
          p.category_id?.toString() === selectedCategory.toString()
      );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-fade-in">
      
      {/* ============================================================== */}
      {/* ROYAL HERO BANNER */}
      {/* ============================================================== */}
      <section className="relative rounded-3xl overflow-hidden glass-panel border-[rgba(212,175,55,0.4)] p-8 sm:p-12 text-center shadow-[0_20px_50px_rgba(0,0,0,0.65)]">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-[var(--accent-gold)]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full shimmer-badge text-xs font-brand tracking-widest text-[var(--accent-gold)] uppercase font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> 100% PURE 22KT 916 HALLMARKED GOLD
          </div>
          
          <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Crafted for <span className="gold-text">Royalty</span>, <br className="hidden sm:inline" />
            Designed for Eternity
          </h1>
          
          <p className="font-accent text-lg sm:text-xl text-purple-200/90 italic tracking-wide">
            Immerse yourself in divine South Indian temple artistry, uncut Polki diamonds, and timeless heritage gold.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-purple-300 font-body">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[var(--accent-gold)]" /> Government Certified Purity
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[var(--accent-gold)]" /> Lifetime Exchange Guarantee
            </span>
            <span className="flex items-center gap-1.5">
              <Diamond className="w-4 h-4 text-[var(--accent-gold)]" /> Certified Natural Gemstones
            </span>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* CATEGORIES SECTION (Ring, Aram, Bracelet, Chain, Bangles, Earrings) */}
      {/* ============================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[rgba(212,175,55,0.2)] pb-4">
          <div>
            <h2 className="font-brand text-xl sm:text-2xl font-bold tracking-wider gold-text uppercase">
              Curated Collections
            </h2>
            <p className="text-xs sm:text-sm text-purple-300 font-body">
              Explore our master jewel crafts categorized by signature styles
            </p>
          </div>

          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-1.5 rounded-full text-xs font-brand tracking-wider uppercase transition-all duration-300 ${
              selectedCategory === 'All'
                ? 'bg-gradient-to-r from-[#FBF0B9] via-[#D4AF37] to-[#9A7217] text-[#140321] font-bold shadow-md'
                : 'border border-[rgba(212,175,55,0.3)] text-purple-200 hover:border-[var(--accent-gold)]'
            }`}
          >
            All Jewels ({products.length})
          </button>
        </div>

        {/* Category Horizontal Scroll Cards with Images */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`group cursor-pointer rounded-2xl p-3 text-center transition-all duration-300 flex flex-col items-center border ${
                  isSelected
                    ? 'bg-[rgba(212,175,55,0.18)] border-[var(--accent-gold)] shadow-[0_10px_25px_rgba(212,175,55,0.35)] scale-105'
                    : 'glass-panel border-[rgba(212,175,55,0.2)] hover:border-[var(--accent-gold)] hover:scale-102'
                }`}
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden p-1 border-2 border-[var(--accent-gold)]/50 group-hover:border-[var(--accent-gold)] transition-colors mb-3 bg-purple-950/70 shadow-inner">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <h3 className="font-brand text-xs sm:text-sm font-semibold tracking-wider text-white group-hover:text-[var(--accent-gold)] transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-purple-300/80 uppercase tracking-widest mt-0.5">
                  Collection
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* PRODUCTS / JEWEL GRID */}
      {/* Customer must view product page before deciding to buy */}
      {/* ============================================================== */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-brand text-xl sm:text-2xl font-bold tracking-wider gold-text uppercase">
              {selectedCategory === 'All' ? 'Masterpiece Jewellery' : `${selectedCategory} Collection`}
            </h2>
            <p className="text-xs sm:text-sm text-purple-300">
              Showing {filteredProducts.length} certified gold treasures
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="glass-panel p-4 h-96 rounded-2xl animate-pulse flex flex-col justify-between">
                <div className="w-full h-48 bg-purple-900/40 rounded-xl" />
                <div className="space-y-2">
                  <div className="h-4 bg-purple-900/40 rounded w-3/4" />
                  <div className="h-4 bg-purple-900/40 rounded w-1/2" />
                </div>
                <div className="h-10 bg-purple-900/40 rounded" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-3xl border border-[rgba(212,175,55,0.2)]">
            <Diamond className="w-12 h-12 text-[var(--accent-gold)] mx-auto mb-3 opacity-60" />
            <h3 className="font-heading text-xl text-white">No Jewellery Found</h3>
            <p className="text-sm text-purple-300 mt-1">Try selecting another category or check back soon.</p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="btn-outline-gold mt-4 text-xs"
            >
              Reset to All Jewels
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((jewel) => (
              <div
                key={jewel.id}
                onClick={() => onNavigate('product', jewel.id)}
                className="group glass-panel glass-panel-hover rounded-2xl overflow-hidden cursor-pointer flex flex-col transition-all duration-300 border-[rgba(212,175,55,0.25)] hover:border-[var(--accent-gold)]"
              >
                {/* Image Container with Hallmark Tag */}
                <div className="relative aspect-square w-full overflow-hidden bg-purple-950/50 p-4 flex items-center justify-center">
                  <img
                    src={jewel.image}
                    alt={jewel.name}
                    className="w-full h-full object-contain rounded-xl transition-transform duration-500 group-hover:scale-108"
                    loading="lazy"
                  />
                  
                  {/* Model Number Badge */}
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-[var(--accent-gold)]/40 text-[10px] font-mono text-[var(--accent-gold)] font-medium">
                    {jewel.model_number}
                  </div>

                  {/* Hallmark 916 Tag */}
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[rgba(212,175,55,0.18)] backdrop-blur-md border border-[var(--accent-gold)] text-[10px] font-brand tracking-widest text-amber-200 font-semibold">
                    916 BIS
                  </div>

                  {/* Category overlay */}
                  <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full bg-purple-950/80 backdrop-blur-md text-[10px] font-brand tracking-wider text-purple-200 border border-purple-800">
                    {jewel.category_name}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-white group-hover:text-[var(--accent-gold)] transition-colors line-clamp-1">
                      {jewel.name}
                    </h3>
                    <p className="font-body text-xs text-purple-300/80 line-clamp-2 mt-1 leading-relaxed">
                      {jewel.details}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[rgba(212,175,55,0.15)] flex items-end justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-brand tracking-wider text-purple-300 block">
                        Net Weight
                      </span>
                      <span className="font-accent text-sm font-semibold text-white">
                        {formatGrams(jewel.grams)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-brand tracking-wider text-[var(--accent-gold)] block">
                        Price (INR)
                      </span>
                      <span className="font-heading text-xl font-bold gold-text">
                        {formatINR(jewel.price)}
                      </span>
                    </div>
                  </div>

                  {/* Explicit View Product Button */}
                  {/* Requirement: Customer must first SEE the product page and only then decide to buy. No buying directly from list! */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('product', jewel.id);
                    }}
                    className="btn-outline-gold w-full text-xs py-2.5 justify-center group-hover:bg-[var(--accent-gold)] group-hover:text-[#140321] transition-all duration-300 font-bold"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Product Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Hallmark Guarantee Footer Strip */}
      <section className="p-6 rounded-2xl glass-panel border border-[rgba(212,175,55,0.3)] flex flex-col md:flex-row items-center justify-around gap-4 text-center">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full border border-[var(--accent-gold)] flex items-center justify-center bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]">
            🏛️
          </span>
          <div className="text-left">
            <h4 className="font-brand text-xs font-bold text-white tracking-wider">100% 916 HALLMARKED</h4>
            <p className="text-[11px] text-purple-300">BIS Certified Purity on every jewel</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full border border-[var(--accent-gold)] flex items-center justify-center bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]">
            ⚖️
          </span>
          <div className="text-left">
            <h4 className="font-brand text-xs font-bold text-white tracking-wider">EXACT GOLD GRAMS</h4>
            <p className="text-[11px] text-purple-300">Precision calibrated electronic weighing</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full border border-[var(--accent-gold)] flex items-center justify-center bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]">
            🔒
          </span>
          <div className="text-left">
            <h4 className="font-brand text-xs font-bold text-white tracking-wider">INSURED TRANSIT</h4>
            <p className="text-[11px] text-purple-300">Tamper-evident sealed luxury delivery</p>
          </div>
        </div>
      </section>

    </div>
  );
}
