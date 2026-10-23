import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiRequest } from '../utils/api';
import { formatINR, formatGrams } from '../utils/currency';
import {
  ArrowLeft,
  Phone,
  ShoppingBag,
  ShieldCheck,
  Award,
  Sparkles,
  Diamond,
  CheckCircle2,
  X,
  MapPin,
  User,
  Share2
} from 'lucide-react';

export default function ProductPage({ productId, onNavigate }) {
  const { currentUser } = useAuth();
  const { settings } = useTheme();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Buy Now Modal Form State
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [orderName, setOrderName] = useState('');
  const [orderMobile, setOrderMobile] = useState(currentUser?.mobile || '');
  const [orderAddress, setOrderAddress] = useState('');

  // Field validation error states (for red box and red messages)
  const [fieldErrors, setFieldErrors] = useState({});
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Load product from MySQL
  useEffect(() => {
    let isMounted = true;
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await apiRequest(`/products/${productId}`);
        if (isMounted) setProduct(res.product);
      } catch (err) {
        if (isMounted) setError(err.message || 'Product not found');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchProduct();
    return () => { isMounted = false; };
  }, [productId]);

  // Handle Enquiry button click -> WhatsApp chat with 6369058169
  const handleWhatsAppEnquiry = () => {
    if (!product) return;
    const currentUrl = window.location.href;
    const whatsappNumber = '916369058169';

    const message = 
      `✨ *Sri Jayam Jewellers Luxury Enquiry* ✨\n\n` +
      `I am interested in purchasing this exquisite jewellery piece:\n` +
      `👑 *Jewel Name:* ${product.name}\n` +
      `🏷️ *Model No:* ${product.model_number}\n` +
      `⚖️ *Weight:* ${formatGrams(product.grams)}\n` +
      `💰 *Price:* ${formatINR(product.price)} (INR)\n` +
      `🏛️ *Category:* ${product.category_name}\n\n` +
      `🔗 *Product Link:* ${currentUrl}\n` +
      `🖼️ *Image Link:* ${product.image.substring(0, 60)}...\n\n` +
      `Please provide more details on hallmark certification, customization and delivery.`;

    const encodedMsg = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMsg}`;
    window.open(whatsappUrl, '_blank');
  };

  // Open Buy Now Modal & reset validation errors
  const handleOpenBuyModal = () => {
    setFieldErrors({});
    setShowBuyModal(true);
  };

  // Submit Buy Now Order
  const handleBuyNowSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    const cleanName = orderName.trim();
    const cleanMobile = orderMobile.replace(/\D/g, '');
    const cleanAddress = orderAddress.trim();

    if (!cleanName) {
      errors.name = 'Please enter your full name';
    }

    if (!cleanMobile) {
      errors.mobile = 'Please enter your 10-digit mobile number';
    } else if (cleanMobile.length !== 10) {
      errors.mobile = 'Mobile number must be exactly 10 digits';
    }

    if (!cleanAddress) {
      errors.address = 'Please enter your full delivery address';
    } else if (cleanAddress.length < 10) {
      errors.address = 'Please provide detailed delivery address with pincode';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setOrderSubmitting(true);
    try {
      const res = await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify({
          name: cleanName,
          mobile: cleanMobile,
          address: cleanAddress,
          product_id: product.id,
        }),
      });

      // Show "Thanks for your order!"
      setOrderSuccess(res.order_number || 'SJJ-SUCCESS');

      // Clear all entered details
      setOrderName('');
      setOrderMobile('');
      setOrderAddress('');
      setFieldErrors({});

      // Automatically return to Home page after short confirmation
      setTimeout(() => {
        setShowBuyModal(false);
        setOrderSuccess(null);
        onNavigate('home');
      }, 2400);

    } catch (err) {
      setFieldErrors({ submit: err.message || 'Failed to place order. Please try again.' });
    } finally {
      setOrderSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center animate-fade-in">
        <Diamond className="w-12 h-12 text-[var(--accent-gold)] animate-pulse mx-auto mb-4" />
        <h3 className="font-heading text-xl text-white">Loading Jewel Masterpiece...</h3>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center glass-panel rounded-3xl animate-fade-in">
        <h3 className="font-heading text-2xl text-white mb-2">Jewel Not Found</h3>
        <p className="text-sm text-purple-300 mb-6">{error || 'This jewellery item may have been moved or removed.'}</p>
        <button onClick={() => onNavigate('home')} className="btn-gold text-xs">
          <ArrowLeft className="w-4 h-4" /> Return to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => onNavigate('home')}
          className="btn-outline-gold text-xs px-4 py-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Collections
        </button>
      </div>

      {/* Main Product Showcase Card */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border-[rgba(212,175,55,0.35)] shadow-[0_25px_60px_rgba(0,0,0,0.7)] grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Left: Large Jewel Image View */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-purple-950/70 p-6 flex items-center justify-center border border-[rgba(212,175,55,0.3)] shadow-[inset_0_0_40px_rgba(0,0,0,0.6)] group">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain rounded-xl transition-transform duration-700 group-hover:scale-105"
            />

            {/* Hallmark 916 Stamp */}
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[rgba(212,175,55,0.25)] border border-[var(--accent-gold)] backdrop-blur-md text-xs font-brand tracking-widest text-amber-200 font-bold shadow-lg">
              916 BIS HALLMARKED
            </div>

            {/* Model Number Tag */}
            <div className="absolute top-4 left-4 px-3 py-1 rounded-md bg-black/70 backdrop-blur-md border border-[var(--accent-gold)]/50 text-xs font-mono text-[var(--accent-gold)] font-semibold">
              {product.model_number}
            </div>
          </div>

          {/* Hallmark Trust Bar */}
          <div className="p-4 rounded-xl bg-purple-950/50 border border-[rgba(212,175,55,0.15)] flex items-center justify-between text-xs text-purple-200">
            <span className="flex items-center gap-1.5 font-semibold text-[var(--accent-gold)]">
              <ShieldCheck className="w-4 h-4" /> 100% Certified Gold
            </span>
            <span className="text-purple-400">•</span>
            <span>Laser Inscribed Hallmark</span>
            <span className="text-purple-400">•</span>
            <span>Tamper-Proof Box</span>
          </div>
        </div>

        {/* Right: Product Details and EXACTLY TWO BUTTONS */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-brand tracking-wider uppercase bg-purple-900/80 text-[var(--accent-gold)] border border-purple-700">
                {product.category_name}
              </span>
              <span className="text-xs text-purple-300 font-mono">
                Model: {product.model_number}
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-4xl font-bold text-white tracking-wide leading-snug">
              {product.name}
            </h1>

            {/* Price & Weight Box */}
            <div className="p-5 rounded-2xl bg-[rgba(28,7,44,0.7)] border border-[var(--accent-gold)]/40 flex flex-wrap items-center justify-between gap-4 shadow-inner">
              <div>
                <span className="text-xs uppercase font-brand tracking-wider text-purple-300 block mb-1">
                  PRICE (INR - INCLUSIVE OF ALL TAXES)
                </span>
                <span className="font-heading text-3xl sm:text-4xl font-extrabold gold-text">
                  {formatINR(product.price)}
                </span>
              </div>

              <div className="text-right sm:border-l sm:border-[rgba(212,175,55,0.25)] sm:pl-6">
                <span className="text-xs uppercase font-brand tracking-wider text-purple-300 block mb-1">
                  NET GOLD WEIGHT
                </span>
                <span className="font-accent text-2xl font-bold text-white">
                  {formatGrams(product.grams)}
                </span>
              </div>
            </div>

            {/* Full Product Details */}
            <div className="space-y-2">
              <h3 className="font-brand text-xs font-bold uppercase tracking-wider text-[var(--accent-gold)]">
                Handcrafted Description
              </h3>
              <p className="font-body text-sm text-purple-200/90 leading-relaxed">
                {product.details}
              </p>
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs pt-2">
              <div className="p-3 rounded-xl bg-purple-950/40 border border-[rgba(212,175,55,0.15)]">
                <span className="text-purple-400 block text-[10px] uppercase tracking-wider">Gold Purity</span>
                <span className="font-semibold text-white">22KT (916 Purity)</span>
              </div>
              <div className="p-3 rounded-xl bg-purple-950/40 border border-[rgba(212,175,55,0.15)]">
                <span className="text-purple-400 block text-[10px] uppercase tracking-wider">BIS Hallmark</span>
                <span className="font-semibold text-white">Certified with HUID</span>
              </div>
              <div className="p-3 rounded-xl bg-purple-950/40 border border-[rgba(212,175,55,0.15)]">
                <span className="text-purple-400 block text-[10px] uppercase tracking-wider">Craftsmanship</span>
                <span className="font-semibold text-white">Traditional South Indian</span>
              </div>
              <div className="p-3 rounded-xl bg-purple-950/40 border border-[rgba(212,175,55,0.15)]">
                <span className="text-purple-400 block text-[10px] uppercase tracking-wider">Buyback Policy</span>
                <span className="font-semibold text-white">100% Lifetime Guarantee</span>
              </div>
            </div>

          </div>

          {/* ============================================================== */}
          {/* EXACTLY TWO BUTTONS UNDER THE JEWEL: "Buy Now" and "Enquiry" */}
          {/* ============================================================== */}
          <div className="pt-6 border-t border-[rgba(212,175,55,0.25)] flex flex-col sm:flex-row items-center gap-4">
            
            {/* 1. "Buy Now" Button */}
            <button
              onClick={handleOpenBuyModal}
              className="btn-gold flex-1 w-full text-base py-3.5 shadow-[0_10px_30px_rgba(212,175,55,0.4)]"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Buy Now</span>
            </button>

            {/* 2. "Enquiry" Button -> Opens WhatsApp chat with 6369058169 */}
            <button
              onClick={handleWhatsAppEnquiry}
              className="btn-whatsapp flex-1 w-full text-base py-3.5"
              title="Chat with Sri Jayam Jewellers on WhatsApp"
            >
              <Phone className="w-5 h-5" />
              <span>Enquiry (WhatsApp)</span>
            </button>

          </div>

        </div>

      </div>

      {/* ============================================================== */}
      {/* BUY NOW ORDER MODAL (NAME, MOBILE, ADDRESS) */}
      {/* If any field is empty, highlights with RED BOX and error text */}
      {/* ============================================================== */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl border-2 border-[var(--accent-gold)] shadow-[0_25px_70px_rgba(0,0,0,0.9)] relative animate-modal">
            
            {/* Close Modal Button */}
            <button
              onClick={() => {
                setShowBuyModal(false);
                setFieldErrors({});
              }}
              className="absolute top-5 right-5 text-purple-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="mb-6">
              <h3 className="font-heading text-2xl font-bold text-white">
                Place Your Luxury Order
              </h3>
              <p className="font-accent text-xs tracking-wider text-[var(--accent-gold)] uppercase mt-0.5">
                Direct Dispatch from Sri Jayam Jewellers
              </p>
            </div>

            {/* Selected Jewel Summary Pill */}
            <div className="p-3 rounded-xl bg-purple-950/60 border border-[rgba(212,175,55,0.25)] flex items-center gap-3 mb-6">
              <img
                src={product.image}
                alt={product.name}
                className="w-12 h-12 rounded-lg object-contain bg-black/40 border border-[var(--accent-gold)]/40 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-heading text-white truncate font-semibold">
                  {product.name}
                </h4>
                <div className="flex items-center gap-3 text-xs">
                  <span className="gold-text font-bold">{formatINR(product.price)}</span>
                  <span className="text-purple-300">•</span>
                  <span className="text-purple-300">{formatGrams(product.grams)}</span>
                  <span className="text-purple-400 font-mono text-[10px]">[{product.model_number}]</span>
                </div>
              </div>
            </div>

            {/* Success message popup overlay if placed */}
            {orderSuccess ? (
              <div className="py-8 text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full mx-auto bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
                <h4 className="font-heading text-2xl font-bold text-white">
                  Thanks for your order!
                </h4>
                <p className="font-body text-sm text-purple-200">
                  Your order has been recorded successfully. <br />
                  <span className="font-mono text-[var(--accent-gold)] font-bold text-base">
                    Order ID: {orderSuccess}
                  </span>
                </p>
                <p className="text-xs text-purple-300/80">
                  Redirecting to Home page...
                </p>
              </div>
            ) : (
              /* Order Form asking name, mobile, address */
              <form onSubmit={handleBuyNowSubmit} autoComplete="off">
                <div className="space-y-4">
                  
                  {/* General Submit Error */}
                  {fieldErrors.submit && (
                    <div className="p-3 rounded-xl bg-red-950/70 border border-red-500 text-red-200 text-xs">
                      {fieldErrors.submit}
                    </div>
                  )}

                  {/* Customer Full Name */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200 mb-1">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--accent-gold)] opacity-75" />
                      <input
                        type="text"
                        value={orderName}
                        onChange={(e) => {
                          setOrderName(e.target.value);
                          setFieldErrors({ ...fieldErrors, name: null });
                        }}
                        placeholder="Enter your full name"
                        autoComplete="new-password"
                        className={`lux-input pl-10 ${fieldErrors.name ? 'input-error-box' : ''}`}
                      />
                    </div>
                    {fieldErrors.name && (
                      <p className="error-text-msg">⚠️ {fieldErrors.name}</p>
                    )}
                  </div>

                  {/* Customer Mobile Number */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200 mb-1">
                      Mobile Number <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--accent-gold)] opacity-75" />
                      <input
                        type="tel"
                        maxLength="10"
                        value={orderMobile}
                        onChange={(e) => {
                          setOrderMobile(e.target.value.replace(/\D/g, ''));
                          setFieldErrors({ ...fieldErrors, mobile: null });
                        }}
                        placeholder="10-digit mobile number for order delivery"
                        autoComplete="new-password"
                        className={`lux-input pl-10 ${fieldErrors.mobile ? 'input-error-box' : ''}`}
                      />
                    </div>
                    {fieldErrors.mobile && (
                      <p className="error-text-msg">⚠️ {fieldErrors.mobile}</p>
                    )}
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200 mb-1">
                      Complete Delivery Address <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-4 w-4 h-4 text-[var(--accent-gold)] opacity-75" />
                      <textarea
                        rows="3"
                        value={orderAddress}
                        onChange={(e) => {
                          setOrderAddress(e.target.value);
                          setFieldErrors({ ...fieldErrors, address: null });
                        }}
                        placeholder="House / Flat No., Street, Landmark, City, State and Pincode"
                        autoComplete="new-password"
                        className={`lux-input pl-10 resize-none ${fieldErrors.address ? 'input-error-box' : ''}`}
                      />
                    </div>
                    {fieldErrors.address && (
                      <p className="error-text-msg">⚠️ {fieldErrors.address}</p>
                    )}
                  </div>

                  {/* Submit Order Button */}
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowBuyModal(false)}
                      className="btn-outline-gold flex-1 py-3 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={orderSubmitting}
                      className="btn-gold flex-2 w-full py-3 text-sm font-bold shadow-lg"
                    >
                      {orderSubmitting ? 'Confirming Order...' : 'Confirm Order & Buy Now'}
                    </button>
                  </div>

                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
