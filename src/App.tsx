/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, ChevronRight, ArrowLeft, Heart, Clock, Sparkles, 
  ShieldCheck, Package, ExternalLink, User, LogOut, Edit2, Save, 
  X, Plus, Zap, MousePointer2, MessageCircle, Truck, Trash2, Loader2
} from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  category: 'health' | 'daily' | 'limited' | 'welfare';
  price: number;
  originalPrice?: number;
  images: string[];
  description: string;
  features: string[];
  status: 'available' | 'limited' | 'sold_out';
  variants: string[];
  maxLimit?: number;
  countdownTarget?: string;
  isAnnouncement?: boolean;
  isCarousel?: boolean; // 🌟 輪播判定
}

const INITIAL_PRODUCTS: Product[] = [];

// 🌟 規格價格解析器 (會自動抓取 奶茶色:1280 裡面的 1280)
const getVariantPrice = (basePrice: number, variantStr: string) => {
  if (!variantStr) return basePrice;
  const match = variantStr.match(/[:：]\s*(\d+)/);
  return match ? parseInt(match[1], 10) : basePrice;
};

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const scriptUrl = 'https://script.google.com/macros/s/AKfycbwIG-ICNYJMdtvbMtUtCIk1ClVF37vkKO0nbeRKJULGn037lDqbnP2AnrzzWhvCgjZq/exec';
        const response = await fetch(scriptUrl);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("讀取失敗:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activeCategory, setActiveCategory] = useState<'all' | 'health' | 'daily' | 'limited' | 'welfare'>('all');
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [showToast, setShowToast] = useState(false);

  // 🌟 找出需要輪播的商品
  const carouselItems = useMemo(() => {
    return products.filter(p => p.category === 'welfare' && p.isCarousel);
  }, [products]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (carouselItems.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carouselItems.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [carouselItems.length]);

  const activeCountdownProduct = useMemo(() => {
    const limitedProducts = products
      .filter(p => p.category === 'limited' && p.countdownTarget)
      .sort((a, b) => new Date(a.countdownTarget!).getTime() - new Date(b.countdownTarget!).getTime());
    const now = new Date().getTime();
    return limitedProducts.find(p => new Date(p.countdownTarget!).getTime() > now);
  }, [products]);

  useEffect(() => {
    if (!activeCountdownProduct?.countdownTarget) return;
    const timer = setInterval(() => {
      const distance = new Date(activeCountdownProduct.countdownTarget!).getTime() - new Date().getTime();
      if (distance < 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        return;
      }
      setTimeLeft({
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeCountdownProduct]);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Product | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [cart, setCart] = useState<{ product: Product; quantity: number; variant: string }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  useEffect(() => {
    if (localStorage.getItem('isAdmin') === 'true') setIsAdmin(true);
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => localStorage.setItem('cart', JSON.stringify(cart)), [cart]);

  const toggleFavorite = (productId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newFavorites = favorites.includes(productId) ? favorites.filter(id => id !== productId) : [...favorites, productId];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const addToCart = (product: Product, variant: string, quantity: number) => {
    if (!variant && product.variants.length > 0) return alert('請選擇規格');
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.variant === variant);
      if (existing) {
        const newQuantity = existing.quantity + quantity;
        if (product.maxLimit && newQuantity > product.maxLimit) {
          alert(`抱歉，此商品每人限購 ${product.maxLimit} 件`);
          return prev;
        }
        return prev.map(item => (item.product.id === product.id && item.variant === variant) ? { ...item, quantity: newQuantity } : item);
      }
      return [...prev, { product, quantity, variant }];
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500);
  };

  const removeFromCart = (productId: string, variant: string) => setCart(prev => prev.filter(item => !(item.product.id === productId && item.variant === variant)));

  const GAS_URL = "https://script.google.com/macros/s/AKfycbwIG-ICNYJMdtvbMtUtCIk1ClVF37vkKO0nbeRKJULGn037lDqbnP2AnrzzWhvCgjZq/exec";

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const total = cart.reduce((sum, item) => sum + getVariantPrice(item.product.price, item.variant) * item.quantity, 0);

    const checkoutData = {
      action: 'checkout',
      items: cart.map(item => ({ id: item.product.id, quantity: item.quantity }))
    };

    fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
      body: JSON.stringify(checkoutData)
    }).catch(err => console.error(err));

    let message = `🌟 葵葵開團好物區 - 訂單預約 🌟\n\n您好！我想訂購以下商品：\n--------------------------\n`;
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name}\n`;
      if (item.variant) message += `   規格：${item.variant}\n`;
      message += `   數量：${item.quantity}\n`;
      message += `   小計：$${getVariantPrice(item.product.price, item.variant) * item.quantity}\n\n`;
    });
    message += `--------------------------\n💰 總計金額：$${total}\n\n請幫我確認訂單，謝謝！`;
    window.open(`https://line.me/R/oaMessage/@234csaak/?${encodeURIComponent(message)}`, '_blank');
  };

  const handleOrderNow = (product: Product) => {
    if (!selectedVariant && product.variants.length > 0) return alert('請選擇規格');

    const orderData = {
      action: 'checkout',
      items: [{ id: product.id, quantity: selectedQuantity }]
    };

    fetch(GAS_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(orderData) });

    let message = `🌟 葵葵開團好物區 - 立即詢問 🌟\n\n我想詢問商品：${product.name}\n`;
    if (selectedVariant) message += `規格：${selectedVariant}\n`;
    message += `數量：${selectedQuantity}\n\n請幫我確認是否有現貨，謝謝！`;
    window.open(`https://line.me/R/oaMessage/@234csaak/?${encodeURIComponent(message)}`, '_blank');
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;
    const isNew = !editForm.id;
    const targetProduct = isNew ? { ...editForm, id: Date.now().toString() } : editForm;
    try {
      if (isNew) setProducts(prev => [targetProduct, ...prev]);
      else setProducts(prev => prev.map(p => p.id === targetProduct.id ? targetProduct : p));
      setSelectedProduct(targetProduct);
      setIsEditing(false); setIsConfirmingDelete(false);
      await fetch(GAS_URL, { method: 'POST', body: JSON.stringify(targetProduct), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
      alert('儲存成功並已同步至雲端倉庫！');
    } catch (error) {
      alert('同步失敗。');
    }
  };

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products.filter(p => !p.isAnnouncement);
    return products.filter(p => p.category === activeCategory);
  }, [activeCategory, products]);

  const categories = [
    { id: 'all', name: '全部商品', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'health', name: '保健食品', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'daily', name: '生活用品', icon: <Package className="w-4 h-4" /> },
    { id: 'limited', name: '限時開團', icon: <Clock className="w-4 h-4" /> },
    { id: 'welfare', name: '葵粉福利區', icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-orange-50/30 font-sans selection:bg-rose-500/30 text-stone-800">
      <header className="sticky top-0 z-40 bg-orange-50/80 backdrop-blur-md border-b border-rose-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-rose-200 flex items-center justify-center text-rose-500">
              <Sparkles className="w-6 h-6 fill-current" />
            </div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">葵葵開團好物區</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    const newProduct: Product = { id: '', name: '新商品', category: 'health', price: 0, images: [''], description: '', features: [''], status: 'available', variants: [], isAnnouncement: false, isCarousel: false };
                    setEditForm(newProduct); setIsEditing(true); setIsConfirmingDelete(false); setSelectedProduct(newProduct);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-stone-700 bg-rose-200 px-3 py-1.5 rounded-full hover:bg-rose-200/70"
                ><Plus className="w-3 h-3" /> 新增商品</button>
                <button onClick={() => { setIsAdmin(false); localStorage.removeItem('isAdmin'); setIsEditing(false); setIsConfirmingDelete(false); }} className="p-2 rounded-full hover:bg-rose-200 text-stone-700"><LogOut className="w-5 h-5" /></button>
              </div>
            ) : (
              <button onClick={() => setIsLoginModalOpen(true)} className="p-2 rounded-full hover:bg-rose-200 text-stone-700"><User className="w-6 h-6" /></button>
            )}
            <button onClick={() => setIsCartOpen(true)} className="p-2 rounded-full hover:bg-rose-200 relative">
              <ShoppingBag className="w-6 h-6 text-stone-700" />
              {cart.length > 0 && <span className="absolute top-0 right-0 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-orange-50">{cart.reduce((s, i) => s + i.quantity, 0)}</span>}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-12 h-12 text-rose-500 animate-spin" />
            <p className="text-stone-700 font-bold text-lg animate-pulse">葵葵好物載入中...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {!selectedProduct ? (
              <motion.div key="list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                
                {/* 🌟 首頁輪播區塊 */}
                {carouselItems.length > 0 && (
                  <div className="mb-8 w-full aspect-[21/9] md:aspect-[3/1] bg-stone-900 rounded-3xl overflow-hidden relative shadow-xl shadow-rose-200/50">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentSlide}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        src={carouselItems[currentSlide].images[0]}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => {
                          setSelectedProduct(carouselItems[currentSlide]);
                          setActiveImageIdx(0);
                          setSelectedVariant(carouselItems[currentSlide].variants[0] || '');
                          setSelectedQuantity(1);
                        }}
                      />
                    </AnimatePresence>
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                      {carouselItems.map((_, idx) => (
                        <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-rose-500 w-6' : 'bg-white/50'}`} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Countdown Banner */}
                {activeCountdownProduct && (
                  <motion.div onClick={() => { setActiveCategory('limited'); document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' }); }} className="mb-8 bg-stone-900 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 cursor-pointer shadow-lg shadow-stone-900/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-rose-500"><Zap className="w-5 h-5 fill-current" /></div>
                      <div><h3 className="text-white font-bold text-base">即將截團：{activeCountdownProduct.name}</h3></div>
                    </div>
                    <div className="bg-white/10 rounded-xl px-4 py-2 flex items-center gap-3"><span className="text-white/60 text-xs font-bold">截團倒數</span><div className="flex items-center gap-2 font-mono text-xl font-bold text-rose-500"><span>{String(timeLeft.hours).padStart(2, '0')}</span><span className="animate-pulse">:</span><span>{String(timeLeft.minutes).padStart(2, '0')}</span><span className="animate-pulse">:</span><span>{String(timeLeft.seconds).padStart(2, '0')}</span></div></div>
                  </motion.div>
                )}

                <div className="flex flex-wrap gap-2 mb-8 mt-6 justify-center">
                  {categories.map((cat) => (
                    <button key={cat.id} onClick={() => setActiveCategory(cat.id as any)} className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat.id ? 'bg-stone-700 text-orange-50 shadow-lg shadow-stone-700/20' : 'bg-rose-200 text-stone-700 hover:bg-rose-200/70'}`}>{cat.icon} {cat.name}</button>
                  ))}
                </div>

                <div id="product-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-24">
                  {filteredProducts.map((product) => (
                    <motion.div key={product.id} layoutId={`product-${product.id}`} onClick={() => { setSelectedProduct(product); setActiveImageIdx(0); setSelectedVariant(product.variants[0] || ''); setSelectedQuantity(1); }} className={`group cursor-pointer bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-rose-200/50 ${product.category === 'welfare' ? 'col-span-2 lg:col-span-4' : ''}`}>
                      <div className={`relative w-full overflow-hidden bg-white ${product.category === 'welfare' ? 'aspect-[21/9]' : 'aspect-[4/5]'}`}>
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                        {product.status === 'limited' && <div className="absolute top-4 left-4 bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase"><Clock className="w-3 h-3 inline mr-1" />限時開團</div>}
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold text-rose-500 uppercase">{product.category === 'health' ? '保健食品' : product.category === 'daily' ? '生活用品' : product.category === 'limited' ? '限時開團' : '葵粉福利區'}</span>
                          <button onClick={(e) => toggleFavorite(product.id, e)} className="p-1.5 rounded-full hover:bg-rose-200/50"><Heart className={`w-4 h-4 transition-colors ${favorites.includes(product.id) ? 'text-rose-500 fill-rose-500' : 'text-rose-400'}`} /></button>
                        </div>
                        <h3 className="text-lg font-bold text-stone-900 mb-2 line-clamp-1">{product.name}</h3>
                        {product.category !== 'welfare' && (
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-stone-700">${product.price}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-[40px] overflow-hidden shadow-2xl border border-rose-200/30">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/2 relative flex flex-col">
                    {isEditing ? (
                      <div className="w-full h-full bg-rose-100 flex flex-col p-8 overflow-y-auto max-h-[600px]">
                         <p className="text-stone-700 font-bold mb-4">編輯圖片 (第1張首頁封面, 其餘內頁長圖)</p>
                         <div className="space-y-3 mb-6">
                          {editForm?.images.map((img, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input type="text" value={img} onChange={(e) => { const n = [...(editForm?.images||[])]; n[idx]=e.target.value; setEditForm(p => p ? {...p, images: n} : null); }} className="flex-1 p-2 rounded-lg border border-rose-200 text-sm" />
                              <button onClick={() => { const n = editForm?.images.filter((_, i) => i !== idx); setEditForm(p => p ? {...p, images: n} : null); }} className="p-2 text-rose-500 hover:bg-rose-200 rounded-lg"><X className="w-4 h-4" /></button>
                            </div>
                          ))}
                          <button onClick={() => setEditForm(p => p ? {...p, images: [...p.images, '']} : null)} className="w-full py-2 border-2 border-dashed border-rose-200 rounded-xl text-stone-700 font-bold"><Plus className="w-4 h-4 inline" /> 新增圖片</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col h-full">
                        <div className="relative w-full overflow-hidden touch-pan-y bg-white">
                          <AnimatePresence mode="wait">
                            <motion.img key={selectedProduct.images[activeImageIdx]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} src={selectedProduct.images[activeImageIdx]} className="w-full h-auto block" referrerPolicy="no-referrer" />
                          </AnimatePresence>
                        </div>
                        {selectedProduct.images.length > 1 && (
                          <div className="p-4 bg-rose-50 flex gap-2 overflow-x-auto scrollbar-hide">
                            {selectedProduct.images.map((img, idx) => (
                              <div key={idx} onClick={() => setActiveImageIdx(idx)} className={`w-16 h-16 flex-shrink-0 bg-white rounded-xl overflow-hidden border-2 cursor-pointer ${activeImageIdx === idx ? 'border-rose-500' : 'border-rose-200/30'}`}><img src={img} className="w-full h-full object-cover" /></div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <button onClick={() => { setSelectedProduct(null); setIsEditing(false); setIsConfirmingDelete(false); }} className="absolute top-6 left-6 w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-rose-500 hover:text-white"><ArrowLeft className="w-6 h-6" /></button>
                    {isAdmin && !isEditing && <button onClick={() => { setIsEditing(true); setEditForm(selectedProduct); }} className="absolute top-6 right-6 w-12 h-12 rounded-full bg-stone-700 text-white shadow-lg flex items-center justify-center"><Edit2 className="w-5 h-5" /></button>}
                  </div>

                  <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center"><h3 className="text-2xl font-bold">編輯商品</h3><button onClick={() => setIsEditing(false)}><X className="w-6 h-6" /></button></div>
                        <select value={editForm?.category || 'health'} onChange={(e) => setEditForm(p => p ? {...p, category: e.target.value as any} : null)} className="w-full p-3 rounded-xl border-2 border-rose-200">
                          <option value="health">保健食品</option><option value="daily">生活用品</option><option value="limited">限時開團</option><option value="welfare">葵粉福利區</option>
                        </select>
                        {editForm?.category === 'welfare' && (
                          <div className="flex flex-col gap-2 p-4 bg-rose-50 rounded-2xl border border-rose-200">
                            <label className="flex items-center gap-3 font-bold cursor-pointer"><input type="checkbox" checked={editForm?.isAnnouncement || false} onChange={(e) => setEditForm(p => p ? {...p, isAnnouncement: e.target.checked} : null)} className="w-5 h-5 accent-rose-500"/>設定為純公告</label>
                            {/* 🌟 設定為首頁輪播 */}
                            <label className="flex items-center gap-3 font-bold cursor-pointer"><input type="checkbox" checked={editForm?.isCarousel || false} onChange={(e) => setEditForm(p => p ? {...p, isCarousel: e.target.checked} : null)} className="w-5 h-5 accent-rose-500"/>設為首頁動態輪播</label>
                          </div>
                        )}
                        <input type="text" value={editForm?.name || ''} onChange={(e) => setEditForm(p => p ? {...p, name: e.target.value} : null)} placeholder="商品名稱" className="w-full p-3 rounded-xl border-2 border-rose-200" />
                        {(!editForm?.isAnnouncement) && (
                          <div className="grid grid-cols-2 gap-4">
                            <input type="number" value={editForm?.price || 0} onChange={(e) => setEditForm(p => p ? {...p, price: parseInt(e.target.value)} : null)} placeholder="價格" className="w-full p-3 rounded-xl border-2 border-rose-200" />
                            <input type="text" value={editForm?.variants.join(', ') || ''} onChange={(e) => setEditForm(p => p ? {...p, variants: e.target.value.split(',').map(v=>v.trim()).filter(v=>v)} : null)} placeholder="規格 (如 奶茶:120, 黑:150)" className="w-full p-3 rounded-xl border-2 border-rose-200" />
                          </div>
                        )}
                        <textarea value={editForm?.description || ''} onChange={(e) => setEditForm(p => p ? {...p, description: e.target.value} : null)} placeholder="商品描述" className="w-full p-3 rounded-xl border-2 border-rose-200 h-24" />
                        <div className="flex gap-4 pt-4">
                          {editForm?.id && (isConfirmingDelete ? <div className="flex flex-1 gap-2"><button onClick={() => { setProducts(p => p.filter(x => x.id !== editForm.id)); setIsEditing(false); setSelectedProduct(null); setIsConfirmingDelete(false); }} className="flex-1 bg-rose-500 text-white py-3 rounded-xl font-bold">確定刪除</button><button onClick={() => setIsConfirmingDelete(false)} className="flex-1 bg-rose-100 text-rose-600 py-3 rounded-xl font-bold">取消</button></div> : <button onClick={() => setIsConfirmingDelete(true)} className="px-6 bg-rose-100 text-rose-600 rounded-xl font-bold"><Trash2 className="w-5 h-5" /></button>)}
                          <button onClick={handleSaveEdit} className="flex-1 bg-stone-700 text-white py-3 rounded-xl font-bold"><Save className="w-5 h-5 inline mr-2" />儲存</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-3xl font-bold mb-4">{selectedProduct.name}</h2>
                        {/* 🌟 根據選擇的規格動態顯示價格 */}
                        {!selectedProduct.isAnnouncement && (
                          <div className="flex items-baseline gap-3 mb-6">
                            <span className="text-4xl font-bold text-stone-700">${getVariantPrice(selectedProduct.price, selectedVariant)}</span>
                          </div>
                        )}
                        <p className="text-stone-700/70 leading-relaxed mb-8 whitespace-pre-wrap">{selectedProduct.description}</p>

                        {!(selectedProduct.isAnnouncement || selectedProduct.category === 'welfare') && (
                          <div className="space-y-6 mb-8 p-6 bg-rose-50/50 rounded-3xl border border-rose-200/20">
                            {selectedProduct.variants.length > 0 && (
                              <div>
                                <label className="block text-sm font-bold mb-3">選擇規格</label>
                                <div className="flex flex-wrap gap-2">
                                  {selectedProduct.variants.map((variant) => (
                                    <button key={variant} onClick={() => setSelectedVariant(variant)} className={`px-4 py-2 rounded-xl text-sm font-medium ${selectedVariant === variant ? 'bg-stone-700 text-white' : 'bg-white border border-rose-200'}`}>{variant}</button>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <label className="font-bold">數量</label>
                              <div className="flex items-center gap-4 bg-white rounded-xl border border-rose-200 p-1">
                                <button onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))} className="w-8 h-8 flex items-center justify-center hover:bg-rose-200 rounded-lg"><X className="w-3 h-3 rotate-45" /></button>
                                <span className="w-8 text-center font-bold">{selectedQuantity}</span>
                                <button onClick={() => setSelectedQuantity(selectedQuantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-rose-200 rounded-lg"><Plus className="w-3 h-3" /></button>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="mt-auto space-y-4">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={() => handleOrderNow(selectedProduct)} className="flex-1 bg-stone-700 text-orange-50 py-4 rounded-2xl font-bold hover:bg-stone-900 shadow-xl shadow-stone-700/20">立即下單 <ExternalLink className="w-4 h-4 inline" /></button>
                            {!(selectedProduct.isAnnouncement || selectedProduct.category === 'welfare') && (
                              <button onClick={() => addToCart(selectedProduct, selectedVariant, selectedQuantity)} className="flex-1 bg-rose-200 text-stone-700 py-4 rounded-2xl font-bold hover:bg-rose-300">加入購物籃 <ShoppingBag className="w-4 h-4 inline" /></button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="absolute top-0 right-0 h-full w-full max-w-md bg-orange-50 shadow-2xl flex flex-col">
              <div className="p-6 border-b border-rose-200 flex justify-between bg-orange-50/80"><h3 className="text-xl font-bold">我的購物籃</h3><button onClick={() => setIsCartOpen(false)}><X className="w-6 h-6" /></button></div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? <div className="text-center text-stone-400 mt-20">購物籃還是空的喔</div> : cart.map((item) => (
                  <div key={`${item.product.id}-${item.variant}`} className="flex gap-4 bg-white p-4 rounded-2xl border border-rose-200/50 shadow-sm">
                    <img src={item.product.images[0]} className="w-20 h-20 rounded-xl object-cover" />
                    <div className="flex-1">
                      <h4 className="font-bold line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs text-stone-500">規格：{item.variant || '預設'}</p>
                      <div className="flex justify-between items-center mt-2">
                        {/* 🌟 購物車內也套用規格自帶價格 */}
                        <span className="font-bold text-rose-500">${getVariantPrice(item.product.price, item.variant) * item.quantity}</span>
                        <button onClick={() => removeFromCart(item.product.id, item.variant)} className="text-xs text-rose-500 bg-rose-50 px-2 py-1 rounded">移除</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {cart.length > 0 && (
                <div className="p-6 bg-white border-t border-rose-200 space-y-4">
                  <div className="flex justify-between items-center"><span className="text-stone-500">總計</span><span className="text-2xl font-bold">${cart.reduce((s, i) => s + getVariantPrice(i.product.price, i.variant) * i.quantity, 0)}</span></div>
                  <button onClick={handleCheckout} className="w-full bg-stone-700 text-white py-4 rounded-xl font-bold">前往結帳</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>{isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLoginModalOpen(false)} className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white rounded-3xl p-8 w-full max-w-md">
            <h3 className="text-2xl font-bold mb-4">管理員登入</h3>
            <input type="text" value={loginForm.username} onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })} className="w-full p-3 mb-4 rounded-xl border-2" placeholder="帳號" />
            <input type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full p-3 mb-6 rounded-xl border-2" placeholder="密碼" />
            <button onClick={() => { if(loginForm.username==='0984481130'&&loginForm.password==='dadalala888'){setIsAdmin(true); setIsLoginModalOpen(false); localStorage.setItem('isAdmin', 'true');}else alert('失敗'); }} className="w-full bg-stone-700 text-white py-3 rounded-xl">登入</button>
          </motion.div>
        </div>
      )}</AnimatePresence>
    </div>
  );
}
