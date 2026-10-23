import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiRequest } from '../utils/api';
import { formatINR, formatGrams } from '../utils/currency';
import { compressImageFile } from '../utils/imageCompressor';
import {
  Diamond,
  Plus,
  Trash2,
  Edit3,
  Image as ImageIcon,
  Palette,
  ShoppingBag,
  Users,
  Layers,
  Check,
  X,
  RefreshCw,
  LogOut,
  Upload,
  Sliders,
  Sparkles
} from 'lucide-react';

export default function AdminPage({ onNavigate }) {
  const { currentAdmin, logout } = useAuth();
  const { settings, updateSettingsLive, refreshSettings } = useTheme();

  // Active Tab: 'jewels' | 'categories' | 'orders' | 'customers' | 'appearance'
  const [activeTab, setActiveTab] = useState('jewels');

  // Data States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // -------------------------------------------------------------
  // JEWEL FORM STATE
  // -------------------------------------------------------------
  const [editingProductId, setEditingProductId] = useState(null);
  const [jewelName, setJewelName] = useState('');
  const [jewelCategory, setJewelCategory] = useState('');
  const [jewelPrice, setJewelPrice] = useState('');
  const [jewelGrams, setJewelGrams] = useState('');
  const [jewelModel, setJewelModel] = useState('');
  const [jewelDetails, setJewelDetails] = useState('');
  const [jewelImage, setJewelImage] = useState('');
  const [imageCompressing, setImageCompressing] = useState(false);

  // -------------------------------------------------------------
  // CATEGORY FORM STATE
  // -------------------------------------------------------------
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState('');

  // -------------------------------------------------------------
  // APPEARANCE FORM STATE
  // -------------------------------------------------------------
  const [themeColor, setThemeColor] = useState(settings?.theme_color || '#220538');
  const [accentColor, setAccentColor] = useState(settings?.accent_color || '#D4AF37');
  const [siteName, setSiteName] = useState(settings?.site_name || 'SRI JAYAM JEWELLERS');
  const [bgImage, setBgImage] = useState(settings?.bg_image || '');
  const [bgOpacity, setBgOpacity] = useState(settings?.bg_opacity !== undefined ? settings.bg_opacity : 0.25);
  const [logoImage, setLogoImage] = useState(settings?.logo || '');

  // Synchronize appearance form with loaded settings
  useEffect(() => {
    if (settings) {
      setThemeColor(settings.theme_color || '#220538');
      setAccentColor(settings.accent_color || '#D4AF37');
      setSiteName(settings.site_name || 'SRI JAYAM JEWELLERS');
      setBgImage(settings.bg_image || '');
      setBgOpacity(settings.bg_opacity !== undefined ? settings.bg_opacity : 0.25);
      setLogoImage(settings.logo || '');
    }
  }, [settings]);

  // Load all admin data from MySQL
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, ordRes, custRes] = await Promise.all([
        apiRequest('/products'),
        apiRequest('/categories'),
        apiRequest('/orders'),
        apiRequest('/customers'),
      ]);

      if (prodRes.products) setProducts(prodRes.products);
      if (catRes.categories) {
        setCategories(catRes.categories);
        if (!jewelCategory && catRes.categories.length > 0) {
          setJewelCategory(catRes.categories[0].name);
        }
      }
      if (ordRes.orders) setOrders(ordRes.orders);
      if (custRes.customers) setCustomers(custRes.customers);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      showMessage('error', 'Failed to fetch data from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const showMessage = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
  };

  // -------------------------------------------------------------
  // JEWEL IMAGE FILE UPLOAD WITH CLIENT COMPRESSION
  // -------------------------------------------------------------
  const handleJewelImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageCompressing(true);
    try {
      const compressedDataUrl = await compressImageFile(file, 900, 900, 0.85);
      setJewelImage(compressedDataUrl);
      showMessage('success', 'Image compressed and prepared for MySQL upload');
    } catch (err) {
      console.error(err);
      showMessage('error', 'Failed to process image');
    } finally {
      setImageCompressing(false);
    }
  };

  // Save or Update Jewel
  const handleSaveJewel = async (e) => {
    e.preventDefault();
    if (!jewelName.trim() || !jewelModel.trim() || !jewelPrice || !jewelGrams) {
      showMessage('error', 'Please fill in Name, Model Number, Price, and Grams');
      return;
    }

    try {
      const payload = {
        name: jewelName.trim(),
        category_name: jewelCategory || (categories[0]?.name || 'Ring'),
        price: parseFloat(jewelPrice),
        grams: parseFloat(jewelGrams),
        model_number: jewelModel.trim().toUpperCase(),
        details: jewelDetails.trim(),
        image: jewelImage,
      };

      if (editingProductId) {
        await apiRequest(`/products/${editingProductId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        showMessage('success', 'Jewel updated successfully in MySQL');
      } else {
        await apiRequest('/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        showMessage('success', 'New jewel added to website live!');
      }

      // Reset form
      handleResetJewelForm();
      loadAdminData();
    } catch (err) {
      showMessage('error', err.message || 'Failed to save jewel');
    }
  };

  const handleEditJewel = (prod) => {
    setEditingProductId(prod.id);
    setJewelName(prod.name);
    setJewelCategory(prod.category_name);
    setJewelPrice(prod.price);
    setJewelGrams(prod.grams);
    setJewelModel(prod.model_number);
    setJewelDetails(prod.details);
    setJewelImage(prod.image);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteJewel = async (id) => {
    if (!window.confirm('Are you sure you want to delete this jewel?')) return;
    try {
      await apiRequest(`/products/${id}`, { method: 'DELETE' });
      showMessage('success', 'Jewel deleted');
      loadAdminData();
    } catch (err) {
      showMessage('error', err.message || 'Failed to delete');
    }
  };

  const handleResetJewelForm = () => {
    setEditingProductId(null);
    setJewelName('');
    setJewelPrice('');
    setJewelGrams('');
    setJewelModel('');
    setJewelDetails('');
    setJewelImage('');
  };

  // -------------------------------------------------------------
  // CATEGORY MANAGEMENT
  // -------------------------------------------------------------
  const handleCategoryImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file, 400, 400, 0.85);
      setCategoryImage(dataUrl);
    } catch (err) {
      showMessage('error', 'Failed to process category image');
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      showMessage('error', 'Category name is required');
      return;
    }

    try {
      if (editingCategoryId) {
        await apiRequest(`/categories/${editingCategoryId}`, {
          method: 'PUT',
          body: JSON.stringify({ name: categoryName.trim(), image: categoryImage }),
        });
        showMessage('success', 'Category updated');
      } else {
        await apiRequest('/categories', {
          method: 'POST',
          body: JSON.stringify({
            name: categoryName.trim(),
            image: categoryImage,
            display_order: categories.length + 1,
          }),
        });
        showMessage('success', 'New category added');
      }

      setEditingCategoryId(null);
      setCategoryName('');
      setCategoryImage('');
      loadAdminData();
    } catch (err) {
      showMessage('error', err.message || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await apiRequest(`/categories/${id}`, { method: 'DELETE' });
      showMessage('success', 'Category deleted');
      loadAdminData();
    } catch (err) {
      showMessage('error', err.message || 'Failed to delete');
    }
  };

  // -------------------------------------------------------------
  // ORDER STATUS UPDATE
  // -------------------------------------------------------------
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await apiRequest(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      showMessage('success', `Order status updated to ${newStatus}`);
      loadAdminData();
    } catch (err) {
      showMessage('error', err.message || 'Failed to update order status');
    }
  };

  // -------------------------------------------------------------
  // APPEARANCE SETTINGS
  // -------------------------------------------------------------
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file, 600, 200, 0.9);
      setLogoImage(dataUrl);
      showMessage('success', 'New logo uploaded');
    } catch (err) {
      showMessage('error', 'Failed to process logo');
    }
  };

  const handleBgImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file, 1600, 1000, 0.75);
      setBgImage(dataUrl);
      showMessage('success', 'New background image uploaded');
    } catch (err) {
      showMessage('error', 'Failed to process background image');
    }
  };

  const handleSaveAppearance = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        site_name: siteName.trim(),
        theme_color: themeColor,
        secondary_color: '#3b0d5c',
        accent_color: accentColor,
        bg_image: bgImage,
        bg_opacity: parseFloat(bgOpacity),
        logo: logoImage,
      };

      const res = await apiRequest('/settings', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (res.settings) {
        updateSettingsLive(res.settings);
        showMessage('success', 'Appearance updated live across full website!');
      }
    } catch (err) {
      showMessage('error', err.message || 'Failed to save appearance');
    }
  };

  const handleAdminLogout = () => {
    logout();
    onNavigate('auth');
  };

  // Preset Palettes
  const themePresets = [
    { name: 'Royal Purple', color: '#220538' },
    { name: 'Imperial Plum', color: '#350849' },
    { name: 'Midnight Sapphire', color: '#071330' },
    { name: 'Emerald Velvet', color: '#07261a' },
    { name: 'Ruby Splendor', color: '#360613' },
    { name: 'Obsidian Gold', color: '#141414' },
  ];

  const accentPresets = [
    { name: 'Royal Gold', color: '#D4AF37' },
    { name: 'Champagne Gold', color: '#F2C94C' },
    { name: 'Antique Gold', color: '#AA771C' },
    { name: 'Rose Gold', color: '#E0A899' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Top Admin Header */}
      <div className="glass-panel p-6 rounded-3xl border-[rgba(212,175,55,0.3)] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border border-[var(--accent-gold)] flex items-center justify-center bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]">
            <Diamond className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-brand text-xl sm:text-2xl font-bold tracking-wider gold-text uppercase">
              Admin Portal
            </h1>
            <p className="text-xs text-purple-300">
              Live Store Management & MySQL Synchronization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAdminData}
            disabled={loading}
            className="btn-outline-gold text-xs px-3.5 py-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>

          <button
            onClick={handleAdminLogout}
            className="btn-outline-gold text-xs px-3.5 py-2 text-red-300 border-red-500/50 hover:bg-red-950/40"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Global Status Message Banner */}
      {statusMessage.text && (
        <div
          className={`p-4 rounded-xl text-sm font-medium animate-fade-in flex items-center gap-2 shadow-lg ${
            statusMessage.type === 'error'
              ? 'bg-red-950/70 border border-red-500 text-red-200'
              : 'bg-emerald-950/70 border border-emerald-500 text-emerald-200'
          }`}
        >
          <span>{statusMessage.type === 'error' ? '⚠️' : '✅'}</span>
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Admin Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-[rgba(212,175,55,0.2)] pb-3">
        {[
          { id: 'jewels', label: 'Jewels Catalog', icon: Diamond, count: products.length },
          { id: 'categories', label: 'Categories', icon: Layers, count: categories.length },
          { id: 'orders', label: 'Customer Orders', icon: ShoppingBag, count: orders.length },
          { id: 'customers', label: 'Registered Customers', icon: Users, count: customers.length },
          { id: 'appearance', label: 'Appearance & Theme', icon: Palette },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-brand tracking-wider uppercase font-semibold transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-[#FBF0B9] via-[#D4AF37] to-[#9A7217] text-[#140321] shadow-lg'
                  : 'glass-panel border-[rgba(212,175,55,0.2)] text-purple-200 hover:border-[var(--accent-gold)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-[#140321] text-amber-200' : 'bg-purple-900 text-white'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: JEWELS CATALOG MANAGEMENT (UPLOAD, EDIT, DELETE) */}
      {/* ============================================================== */}
      {activeTab === 'jewels' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Add / Edit Jewel Form Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[rgba(212,175,55,0.35)] shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-[rgba(212,175,55,0.2)]">
              <div>
                <h3 className="font-brand text-lg font-bold text-white tracking-wider">
                  {editingProductId ? 'Edit Jewel Details' : 'Upload New Jewellery Piece'}
                </h3>
                <p className="text-xs text-purple-300">
                  Instantly saved in MySQL and displayed on the Customer Store
                </p>
              </div>

              {editingProductId && (
                <button
                  onClick={handleResetJewelForm}
                  className="btn-outline-gold text-xs px-3 py-1.5"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSaveJewel} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Column 1: Image Upload with Preview */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200">
                    Jewel Image (Saved in MySQL)
                  </label>
                  
                  <div className="relative aspect-square w-full rounded-2xl bg-purple-950/60 border-2 border-dashed border-[rgba(212,175,55,0.3)] flex flex-col items-center justify-center p-4 overflow-hidden group">
                    {jewelImage ? (
                      <>
                        <img
                          src={jewelImage}
                          alt="Jewel Preview"
                          className="w-full h-full object-contain rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => setJewelImage('')}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-red-900/80 text-white hover:bg-red-700"
                          title="Remove Image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center space-y-2">
                        <ImageIcon className="w-10 h-10 text-[var(--accent-gold)] mx-auto opacity-70" />
                        <span className="text-xs text-purple-300 block">
                          Upload high-res photo
                        </span>
                        <span className="text-[10px] text-purple-400 block">
                          Compressed automatically in browser
                        </span>
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleJewelImageUpload}
                    className="block w-full text-xs text-purple-300 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[rgba(212,175,55,0.2)] file:text-[var(--accent-gold)] hover:file:bg-[rgba(212,175,55,0.3)] cursor-pointer"
                  />
                  {imageCompressing && (
                    <p className="text-xs text-[var(--accent-gold)] animate-pulse">
                      Compressing image for database storage...
                    </p>
                  )}
                </div>

                {/* Column 2 & 3: Jewel Details */}
                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200 mb-1">
                        Jewel Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={jewelName}
                        onChange={(e) => setJewelName(e.target.value)}
                        placeholder="e.g. Royal Diamond Solitaire Ring"
                        className="lux-input"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200 mb-1">
                        Category <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={jewelCategory}
                        onChange={(e) => setJewelCategory(e.target.value)}
                        className="lux-input bg-purple-950 text-white"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200 mb-1">
                        Price in INR (₹) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={jewelPrice}
                        onChange={(e) => setJewelPrice(e.target.value)}
                        placeholder="e.g. 198000"
                        className="lux-input"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200 mb-1">
                        Net Weight (Grams) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={jewelGrams}
                        onChange={(e) => setJewelGrams(e.target.value)}
                        placeholder="e.g. 24.50"
                        className="lux-input"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200 mb-1">
                        Model Number <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={jewelModel}
                        onChange={(e) => setJewelModel(e.target.value)}
                        placeholder="e.g. SJJ-RNG-205"
                        className="lux-input font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200 mb-1">
                      Handcrafted Details & Specifications
                    </label>
                    <textarea
                      rows="3"
                      value={jewelDetails}
                      onChange={(e) => setJewelDetails(e.target.value)}
                      placeholder="e.g. 22KT 916 Hallmark pure gold, antique Nagas temple craftsmanship with Burmese rubies..."
                      className="lux-input resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button type="submit" className="btn-gold text-sm px-6 py-2.5">
                      <Plus className="w-4 h-4" />
                      <span>{editingProductId ? 'Update Jewel' : 'Save & Publish Jewel'}</span>
                    </button>
                  </div>
                </div>

              </div>
            </form>
          </div>

          {/* Existing Jewels Catalog Table */}
          <div className="glass-panel p-6 rounded-3xl border border-[rgba(212,175,55,0.25)] shadow-xl overflow-hidden">
            <h3 className="font-brand text-lg font-bold text-white tracking-wider mb-4">
              Current Catalog ({products.length} items in MySQL)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-[rgba(212,175,55,0.15)]">
                <thead>
                  <tr className="text-purple-300 uppercase font-brand tracking-wider bg-purple-950/50">
                    <th className="py-3 px-4">Jewel</th>
                    <th className="py-3 px-4">Model No</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price (INR)</th>
                    <th className="py-3 px-4">Grams</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(212,175,55,0.1)]">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-purple-900/20 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-10 h-10 rounded-lg object-contain bg-black/50 border border-[rgba(212,175,55,0.3)] flex-shrink-0"
                        />
                        <div className="max-w-xs">
                          <span className="font-bold text-white block truncate">{prod.name}</span>
                          <span className="text-[11px] text-purple-400 line-clamp-1">{prod.details}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[var(--accent-gold)] font-medium">
                        {prod.model_number}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-purple-950 border border-purple-800 text-[10px]">
                          {prod.category_name}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {formatINR(prod.price)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-purple-200">
                        {formatGrams(prod.grams)}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleEditJewel(prod)}
                          className="p-1.5 rounded-lg bg-purple-900/60 hover:bg-[var(--accent-gold)] hover:text-[#140321] transition-colors"
                          title="Edit Jewel"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteJewel(prod.id)}
                          className="p-1.5 rounded-lg bg-red-950/60 text-red-300 hover:bg-red-700 hover:text-white transition-colors"
                          title="Delete Jewel"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: CATEGORIES MANAGEMENT */}
      {/* ============================================================== */}
      {activeTab === 'categories' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Add / Edit Category Form */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[rgba(212,175,55,0.35)] shadow-xl">
            <h3 className="font-brand text-lg font-bold text-white tracking-wider mb-4">
              {editingCategoryId ? 'Edit Category' : 'Add New Category'}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200 mb-1">
                    Category Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="e.g. Platinum Bands"
                    className="lux-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200 mb-1">
                    Category Icon / Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCategoryImageUpload}
                    className="block w-full text-xs text-purple-300 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[rgba(212,175,55,0.2)] file:text-[var(--accent-gold)]"
                  />
                </div>
              </div>

              {categoryImage && (
                <div className="flex items-center gap-3">
                  <img
                    src={categoryImage}
                    alt="Category Preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-[var(--accent-gold)]"
                  />
                  <span className="text-xs text-purple-300">Category image preview</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                {editingCategoryId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategoryId(null);
                      setCategoryName('');
                      setCategoryImage('');
                    }}
                    className="btn-outline-gold text-xs"
                  >
                    Cancel
                  </button>
                )}
                <button type="submit" className="btn-gold text-sm px-6 py-2">
                  <Plus className="w-4 h-4" />
                  <span>{editingCategoryId ? 'Update Category' : 'Add Category'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Categories Grid List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-[rgba(212,175,55,0.25)]"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-12 h-12 rounded-full object-cover border border-[var(--accent-gold)]/60 bg-purple-950"
                  />
                  <div>
                    <h4 className="font-brand text-sm font-bold text-white">{cat.name}</h4>
                    <span className="text-[10px] text-purple-400 font-mono">slug: {cat.slug}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingCategoryId(cat.id);
                      setCategoryName(cat.name);
                      setCategoryImage(cat.image);
                    }}
                    className="p-1.5 rounded-lg bg-purple-900/60 hover:bg-[var(--accent-gold)] hover:text-[#140321]"
                    title="Edit Category"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1.5 rounded-lg bg-red-950/60 text-red-300 hover:bg-red-700 hover:text-white"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: CUSTOMER ORDERS */}
      {/* ============================================================== */}
      {activeTab === 'orders' && (
        <div className="glass-panel p-6 rounded-3xl border border-[rgba(212,175,55,0.3)] shadow-xl overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-brand text-lg font-bold text-white tracking-wider">
              All Orders ({orders.length})
            </h3>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12 text-purple-300">
              No customer orders received yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-[rgba(212,175,55,0.15)]">
                <thead>
                  <tr className="text-purple-300 uppercase font-brand tracking-wider bg-purple-950/50">
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Jewel Item</th>
                    <th className="py-3 px-4">Price (INR)</th>
                    <th className="py-3 px-4">Delivery Address</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(212,175,55,0.1)]">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-purple-900/20 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[var(--accent-gold)]">
                        {ord.order_number}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-white block">{ord.customer_name}</span>
                        <span className="font-mono text-purple-300 text-[11px]">{ord.customer_mobile}</span>
                      </td>
                      <td className="py-3 px-4 flex items-center gap-2">
                        <img
                          src={ord.product_image}
                          alt={ord.product_name}
                          className="w-8 h-8 rounded-md object-contain bg-black/40 border border-purple-800"
                        />
                        <div className="max-w-xs">
                          <span className="font-medium text-white block truncate">{ord.product_name}</span>
                          <span className="text-[10px] text-purple-400">
                            {ord.product_model} • {ord.product_grams}g
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {formatINR(ord.product_price)}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-purple-200" title={ord.customer_address}>
                        {ord.customer_address}
                      </td>
                      <td className="py-3 px-4 text-purple-300 text-[11px]">
                        {new Date(ord.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                          className={`text-xs px-2.5 py-1 rounded-md font-semibold font-brand tracking-wider bg-purple-950 border ${
                            ord.status === 'Delivered'
                              ? 'text-emerald-400 border-emerald-500'
                              : ord.status === 'Shipped'
                              ? 'text-cyan-400 border-cyan-500'
                              : ord.status === 'Confirmed'
                              ? 'text-amber-300 border-amber-500'
                              : ord.status === 'Cancelled'
                              ? 'text-red-400 border-red-500'
                              : 'text-purple-300 border-purple-600'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: REGISTERED CUSTOMERS */}
      {/* ============================================================== */}
      {activeTab === 'customers' && (
        <div className="glass-panel p-6 rounded-3xl border border-[rgba(212,175,55,0.3)] shadow-xl overflow-hidden animate-fade-in">
          <h3 className="font-brand text-lg font-bold text-white tracking-wider mb-4">
            Registered Customers ({customers.length})
          </h3>

          {customers.length === 0 ? (
            <div className="text-center py-12 text-purple-300">
              No customer registrations recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-[rgba(212,175,55,0.15)]">
                <thead>
                  <tr className="text-purple-300 uppercase font-brand tracking-wider bg-purple-950/50">
                    <th className="py-3 px-4">Customer ID</th>
                    <th className="py-3 px-4">Registered Mobile</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-4">Total Orders</th>
                    <th className="py-3 px-4">Total Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(212,175,55,0.1)]">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-purple-900/20">
                      <td className="py-3 px-4 font-mono text-[var(--accent-gold)]">
                        #{c.id}
                      </td>
                      <td className="py-3 px-4 font-bold text-white font-mono">
                        {c.mobile}
                      </td>
                      <td className="py-3 px-4 text-purple-300">
                        {new Date(c.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {c.total_orders || 0} orders
                      </td>
                      <td className="py-3 px-4 font-bold text-[var(--accent-gold)]">
                        {formatINR(c.total_spent || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: APPEARANCE & THEME SETTINGS (SAVED TO MYSQL & LIVE APPLIED) */}
      {/* ============================================================== */}
      {activeTab === 'appearance' && (
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-[rgba(212,175,55,0.35)] shadow-xl space-y-8 animate-fade-in">
          <div>
            <h3 className="font-brand text-xl font-bold text-white tracking-wider">
              Site-Wide Appearance & Luxury Branding
            </h3>
            <p className="text-xs text-purple-300 mt-1">
              All settings are saved directly in MySQL and immediately transform the entire website live.
            </p>
          </div>

          <form onSubmit={handleSaveAppearance} className="space-y-8">
            
            {/* Website Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200 mb-2">
                Brand & Website Name
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="SRI JAYAM JEWELLERS"
                className="lux-input max-w-md font-brand tracking-widest text-lg font-bold"
              />
            </div>

            {/* Theme Color Picker & Presets */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200">
                Primary Theme Colour (Applies to all pages & backgrounds)
              </label>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-purple-950/80 border border-[rgba(212,175,55,0.3)]">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-24 text-xs font-mono uppercase bg-transparent text-white px-2 focus:outline-none"
                  />
                </div>

                {/* Ready Color Presets */}
                <div className="flex flex-wrap gap-2">
                  {themePresets.map((p) => (
                    <button
                      key={p.color}
                      type="button"
                      onClick={() => setThemeColor(p.color)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-2 transition-all ${
                        themeColor.toLowerCase() === p.color.toLowerCase()
                          ? 'border-[var(--accent-gold)] ring-2 ring-[var(--accent-gold)]'
                          : 'border-purple-800 hover:border-purple-500'
                      }`}
                      style={{ backgroundColor: p.color }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
                      <span className="text-white text-[11px]">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Gold Accent Color */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200">
                Metallic Gold Accent Colour
              </label>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-purple-950/80 border border-[rgba(212,175,55,0.3)]">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-24 text-xs font-mono uppercase bg-transparent text-white px-2 focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {accentPresets.map((p) => (
                    <button
                      key={p.color}
                      type="button"
                      onClick={() => setAccentColor(p.color)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-2 transition-all ${
                        accentColor.toLowerCase() === p.color.toLowerCase()
                          ? 'border-white ring-2 ring-white'
                          : 'border-purple-800'
                      }`}
                      style={{ backgroundColor: p.color, color: '#140321' }}
                    >
                      <span className="font-bold text-[11px]">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Logo Image Upload */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200">
                Brand Logo (SVG or High-Res Image saved in MySQL)
              </label>
              <div className="flex flex-wrap items-center gap-4">
                {logoImage && (
                  <div className="p-3 rounded-xl bg-purple-950 border border-[var(--accent-gold)] max-w-xs">
                    <img src={logoImage} alt="Current Logo" className="h-12 w-auto object-contain" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="block text-xs text-purple-300 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[rgba(212,175,55,0.2)] file:text-[var(--accent-gold)]"
                />
                {logoImage && (
                  <button
                    type="button"
                    onClick={() => setLogoImage('')}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Reset to Default Logo
                  </button>
                )}
              </div>
            </div>

            {/* Background Image Upload & Opacity Slider */}
            <div className="p-5 rounded-2xl bg-purple-950/40 border border-[rgba(212,175,55,0.25)] space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200">
                Custom Website Background Image
              </label>
              
              <div className="flex flex-wrap items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBgImageUpload}
                  className="block text-xs text-purple-300 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[rgba(212,175,55,0.2)] file:text-[var(--accent-gold)]"
                />
                {bgImage && (
                  <button
                    type="button"
                    onClick={() => setBgImage('')}
                    className="btn-outline-gold text-xs py-1.5 px-3 text-red-300 border-red-500/50"
                  >
                    Remove Background Image
                  </button>
                )}
              </div>

              {bgImage && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs text-purple-200">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                      Background Image Opacity ({Math.round(bgOpacity * 100)}%)
                    </span>
                    <span className="text-[11px] text-purple-400">Softly blends with theme gradient</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={bgOpacity}
                    onChange={(e) => setBgOpacity(parseFloat(e.target.value))}
                    className="w-full accent-[var(--accent-gold)] cursor-pointer"
                  />
                  
                  <div className="h-16 rounded-xl border border-[var(--accent-gold)]/40 overflow-hidden relative mt-2">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${bgImage})`, opacity: bgOpacity }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-color)] to-transparent pointer-events-none" />
                    <div className="relative z-10 flex items-center h-full px-4 text-xs font-semibold text-white">
                      Live Background Blend Preview
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Save Appearance Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="btn-gold text-sm px-8 py-3.5 font-bold shadow-xl"
              >
                <Sparkles className="w-4 h-4" />
                <span>Save & Apply Appearance to Live Website</span>
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
