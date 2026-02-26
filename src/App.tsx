/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  ChevronRight, 
  ArrowLeft, 
  Heart, 
  Clock, 
  Sparkles, 
  ShieldCheck,
  Package,
  ExternalLink,
  User,
  LogOut,
  Edit2,
  Save,
  X,
  Plus,
  Zap,
  MousePointer2,
  MessageCircle,
  Truck,
  Trash2,
  Loader2
} from 'lucide-react';

// --- Type Definitions ---
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
}

// --- Mock Initial Data ---
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: '日本原裝進口 膠原蛋白粉',
    category: 'health',
    price: 899,
    originalPrice: 1200,
    images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800'],
    description: '嚴選日本專利膠原蛋白，分子小好吸收。每天一匙，養顏美容，青春美麗！',
    features: ['日本專利技術', '無腥味好入口', '添加維生素C促進吸收'],
    status: 'available',
    variants: ['30天份袋裝', '60天份罐裝'],
    maxLimit: 5,
  },
  {
    id: '2',
    name: '北歐風純棉水洗涼被',
    category: 'daily',
    price: 1280,
    originalPrice: 1680,
    images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800'],
    description: '100%純棉材質，水洗工藝處理，柔軟親膚，透氣不悶熱，給您一夜好眠。',
    features: ['100%純棉', '可機洗好清理', '多種莫蘭迪色系可選'],
    status: 'available',
    variants: ['奶茶色', '霧霾藍', '灰綠色'],
  },
  {
    id: '3',
    name: '【限量】韓國頂級人蔘精華飲',
    category: 'limited',
    price: 2980,
    originalPrice: 3980,
    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800'],
    description: '韓國原裝進口，高濃度人蔘精華，補充元氣的最佳選擇。限量開團，售完不補！',
    features: ['6年根高麗蔘', '隨身包設計', '無添加防腐劑'],
    status: 'limited',
    variants: ['一盒(30入)', '三盒優惠組'],
    // Set target 48 hours from now for demonstration
    countdownTarget: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), 
  },
  {
    id: '4',
    name: '🎉 粉絲回饋抽獎活動',
    category: 'welfare',
    price: 0,
    images: ['https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80&w=800'],
    description: '感謝大家一直以來的支持！只要在本文下方留言並分享，就有機會獲得神秘好禮一份喔！',
    features: ['活動時間：即日起至月底', '獎品：神秘驚喜盲盒', '名額：抽出5位幸運兒'],
    status: 'available',
    variants: [],
    isAnnouncement: true,
  }
];

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
        console.error("讀取商品資料失敗:", error);
        setProducts(INITIAL_PRODUCTS); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activeCategory, setActiveCategory] = useState<'all' | 'health' | 'daily' | 'limited' | 'welfare'>('all');
  
  // Countdown State
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [showToast, setShowToast] = useState(false);

  const activeCountdownProduct = useMemo(() => {
    const limitedProducts = products
      .filter(p => p.category === 'limited' && p.countdownTarget)
      .sort((a, b) => new Date(a.countdownTarget!).getTime() - new Date(b.countdownTarget!).getTime());
    
    const now = new Date().getTime();
    return limitedProducts.find(p => new Date(p.countdownTarget!).getTime() > now);
  }, [products]);

  useEffect(() => {
    if (!activeCountdownProduct?.countdownTarget) {
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(activeCountdownProduct.countdownTarget!).getTime() - now;
      
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

  const scrollToLimited = () => {
    setActiveCategory('limited');
    const element = document.getElementById('product-grid');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Product | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Cart & Favorites State
  const [cart, setCart] = useState<{ product: Product; quantity: number; variant: string }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Selection State for Detail View
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);


  useEffect(() => {
    const savedAdmin = localStorage.getItem('isAdmin');
    if (savedAdmin === 'true') setIsAdmin(true);
    
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const toggleFavorite = (productId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newFavorites = favorites.includes(productId)
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const addToCart = (product: Product, variant: string, quantity: number) => {
    if (!variant && product.variants.length > 0) {
      alert('請選擇規格');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.variant === variant);
      if (existing) {
        const newQuantity = existing.quantity + quantity;
        if (product.maxLimit && newQuantity > product.maxLimit) {
          alert(`抱歉，此商品每人限購 ${product.maxLimit} 件`);
          return prev;
        }
        return prev.map(item => 
          (item.product.id === product.id && item.variant === variant)
            ? { ...item, quantity: newQuantity } 
            : item
        );
      }
      return [...prev, { product, quantity, variant }];
    });
    
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500);
  };

  const removeFromCart = (productId: string, variant: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.variant === variant)));
  };

  // 這是你熱騰騰拿到的 Google 表格專屬鑰匙
  const GAS_URL = "https://script.google.com/macros/s/AKfycbwIG-ICNYJMdtvbMtUtCIk1ClVF37vkKO0nbeRKJULGn037lDqbnP2AnrzzWhvCgjZq/exec";

  const handleCheckout = () => {
    if (cart.length === 0) return;

    // 🌟 新增功能：悄悄去 Google 表格幫購物車裡的每個商品增加銷量
    cart.forEach(item => {
      fetch(GAS_URL, {
        method: 'POST',
        // 為了避免瀏覽器擋信，我們用純文字格式包裝 JSON
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
        body: JSON.stringify({
          action: 'buy',
          id: item.product.id,
          quantity: item.quantity
        })
      }).catch(err => console.error("銷量更新失敗:", err)); // 就算失敗也不會影響顧客跳轉 LINE
    });
    
    const lineId = "@234csaak";
    let message = "🌟 葵葵開團好物區 - 訂單預約 🌟\n\n";
    message += "您好！我想訂購以下商品：\n";
    message += "--------------------------\n";
    
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name}\n`;
      if (item.variant) message += `   規格：${item.variant}\n`;
      message += `   數量：${item.quantity}\n`;
      message += `   小計：$${item.product.price * item.quantity}\n\n`;
    });
    
    const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    message += "--------------------------\n";
    message += `💰 總計金額：$${total}\n\n`;
    message += "請幫我確認訂單，謝謝！";

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://line.me/R/oaMessage/${lineId}/?${encodedMessage}`, '_blank');
  };

  const handleOrderNow = (product: Product) => {
    if (!selectedVariant && product.variants.length > 0) {
      alert('請選擇規格');
      return;
    }

    // 🌟 新增功能：單件商品結帳連動
    fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'buy',
        id: product.id,
        quantity: selectedQuantity
      })
    }).catch(err => console.error("銷量更新失敗:", err));
    
    let message = `🌟 葵葵開團好物區 - 立即詢問 🌟\n\n`;
    message += `我想詢問商品：${product.name}\n`;
    if (selectedVariant) message += `規格：${selectedVariant}\n`;
    message += `數量：${selectedQuantity}\n`;
    message += `\n請幫我確認是否有現貨，謝謝！`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://line.me/R/oaMessage/@234csaak/?${encodedMessage}`, '_blank');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === '0984481130' && loginForm.password === 'dadalala888') {
      setIsAdmin(true);
      setIsLoginModalOpen(false);
      localStorage.setItem('isAdmin', 'true');
      setLoginForm({ username: '', password: '' });
    } else {
      alert('登入失敗：帳號或密碼錯誤');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
    setIsEditing(false);
    setIsConfirmingDelete(false);
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;
    
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbwIG-ICNYJMdtvbMtUtCIk1ClVF37vkKO0nbeRKJULGn037lDqbnP2AnrzzWhvCgjZq/exec';
    const isNew = !editForm.id;
    const targetProduct = isNew ? { ...editForm, id: Date.now().toString() } : editForm;

    try {
      if (isNew) {
        setProducts(prev => [targetProduct, ...prev]);
      } else {
        setProducts(prev => prev.map(p => p.id === targetProduct.id ? targetProduct : p));
      }
      setSelectedProduct(targetProduct);
      setIsEditing(false);
      setIsConfirmingDelete(false);

      await fetch(scriptUrl, {
        method: 'POST',
        body: JSON.stringify(targetProduct),
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        }
      });
      
      alert('儲存成功並已同步至雲端倉庫！');
    } catch (error) {
      console.error("儲存到雲端失敗", error);
      alert('同步至雲端失敗，請檢查網路連線。');
    }
  };

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') {
      return products.filter(p => !p.isAnnouncement);
    }
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
      {/* Header */}
      <header className="sticky top-0 z-40 bg-orange-50/80 backdrop-blur-md border-b border-rose-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-rose-200 flex items-center justify-center text-rose-500">
              <Sparkles className="w-6 h-6 fill-current" />
            </div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">
              葵葵開團好物區
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    const newProduct: Product = {
                      id: '',
                      name: '新商品',
                      category: 'health',
                      price: 0,
                      images: [''],
                      description: '',
                      features: [''],
                      status: 'available',
                      variants: [],
                      isAnnouncement: false
                    };
                    setEditForm(newProduct);
                    setIsEditing(true);
                    setIsConfirmingDelete(false);
                    setSelectedProduct(newProduct);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-stone-700 bg-rose-200 px-3 py-1.5 rounded-full hover:bg-rose-200/70 transition-colors"
                >
                  <Plus className="w-3 h-3" /> 新增商品
                </button>
                <span className="text-xs font-bold text-rose-600 bg-rose-200 px-2 py-1 rounded">管理員模式</span>
                <button 
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-rose-200 transition-colors text-stone-700"
                  title="登出"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="p-2 rounded-full hover:bg-rose-200 transition-colors text-stone-700"
                title="管理員登入"
              >
                <User className="w-6 h-6" />
              </button>
            )}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="p-2 rounded-full hover:bg-rose-200 transition-colors relative"
            >
              <ShoppingBag className="w-6 h-6 text-stone-700" />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-orange-50">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 🌟 新增功能：載入中動畫 */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-12 h-12 text-rose-500 animate-spin" />
            <p className="text-stone-700 font-bold text-lg animate-pulse">葵葵好物載入中...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {!selectedProduct ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* Countdown Banner */}
                {activeCountdownProduct && (
                  <motion.div 
                    onClick={scrollToLimited}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 bg-stone-900 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 cursor-pointer hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-rose-500">
                        <Zap className="w-5 h-5 fill-current" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-base">即將截團：{activeCountdownProduct.name}</h3>
                        <p className="text-white/60 text-xs">精選商品下殺優惠，錯過不再！</p>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 flex items-center gap-3 border border-white/10">
                      <span className="text-white/60 text-xs font-bold">截團倒數</span>
                      <div className="flex items-center gap-2 font-mono text-xl font-bold text-rose-500">
                        <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                        <span className="animate-pulse">:</span>
                        <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                        <span className="animate-pulse">:</span>
                        <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Hero Section */}
                <section className="mb-12 text-center mt-6">
                  <h2 className="text-4xl md:text-5xl font-bold mb-4 text-stone-800">
                    美好生活，從這裡開始
                  </h2>
                  <p className="text-stone-700/70 max-w-lg mx-auto">
                    葵葵為您嚴選高品質的日常所需，從健康到居家，每一件都是我們的真心推薦。
                  </p>
                </section>

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2 mb-8 justify-center">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id as any)}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                        activeCategory === cat.id
                          ? 'bg-stone-700 text-orange-50 shadow-lg shadow-stone-700/20'
                          : 'bg-rose-200 text-stone-700 hover:bg-rose-200/70'
                      }`}
                    >
                      {cat.icon}
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Product Grid */}
                <div id="product-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-24">
                  {filteredProducts.map((product) => (
                    <motion.div
                      layoutId={`product-${product.id}`}
                      key={product.id}
                      onClick={() => {
                        setSelectedProduct(product);
                        setActiveImageIdx(0);
                        setSelectedVariant(product.variants[0] || '');
                        setSelectedQuantity(1);
                      }}
                      className={`group cursor-pointer bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-rose-200/50 ${
                        product.category === 'welfare' ? 'col-span-2 lg:col-span-4' : ''
                      }`}
                    >
                     <div className="relative w-full overflow-hidden bg-white">
    {/* 🌟 更新：統一滿版寬度，高度按圖片比例自然延伸 */}
    <img
      src={product.images[0]}
      alt={product.name}
      className="w-full h-auto block transition-transform duration-700 group-hover:scale-110"
      referrerPolicy="no-referrer"
    />
                        {product.status === 'limited' && (
                          <div className="absolute top-4 left-4 bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                            <Clock className="w-3 h-3" /> 限時開團
                          </div>
                        )}
                        {product.category === 'welfare' && (
                          <div className="absolute top-4 left-4 bg-stone-700 text-orange-50 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> 粉絲福利
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          {/* 🌟 修復 3：分類標籤顯示正確名稱 */}
                          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                            {product.category === 'health' ? '保健食品' : product.category === 'daily' ? '生活用品' : product.category === 'limited' ? '限時開團' : '葵粉福利區'}
                          </span>
                          <button 
                            onClick={(e) => toggleFavorite(product.id, e)}
                            className="p-1.5 rounded-full hover:bg-rose-200/50 transition-colors"
                          >
                            <Heart className={`w-4 h-4 transition-colors ${favorites.includes(product.id) ? 'text-rose-500 fill-rose-500' : 'text-rose-400'}`} />
                          </button>
                        </div>
                        <h3 className="text-lg font-bold text-stone-900 mb-2 line-clamp-1">
                          {product.name}
                        </h3>
                        {product.category !== 'welfare' && (
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-stone-700">
                              ${product.price}
                            </span>
                            {product.originalPrice && (
                              <span className="text-sm text-stone-700/40 line-through">
                                ${product.originalPrice}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="mt-4 flex items-center text-sm font-medium text-stone-700/60 group-hover:text-rose-500 transition-colors">
                          查看詳情 <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Simple Three Steps Section */}
                <section className="py-24 border-t border-rose-200">
                  <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">簡單三步驟，美好送到家</h2>
                    <div className="w-24 h-1 bg-rose-200 mx-auto rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { 
                        step: "1. 線上選購", 
                        desc: "瀏覽目錄，選擇您心儀的商品。", 
                        icon: MousePointer2,
                        color: "bg-rose-100 text-rose-500"
                      },
                      { 
                        step: "2. 私訊下單", 
                        desc: "點擊按鈕，直接透過 Line 告知我們。", 
                        icon: MessageCircle,
                        color: "bg-rose-100 text-rose-500"
                      },
                      { 
                        step: "3. 快速出貨", 
                        desc: "確認訂單後，我們將火速為您寄送。", 
                        icon: Truck,
                        color: "bg-rose-100 text-rose-500"
                      }
                    ].map((item, idx) => (
                      <motion.div 
                        key={idx}
                        whileHover={{ y: -10 }}
                        className="bg-white p-10 rounded-[40px] shadow-sm hover:shadow-xl transition-all text-center border border-rose-200/20"
                      >
                        <div className={`w-20 h-20 rounded-full ${item.color} flex items-center justify-center mx-auto mb-8`}>
                          <item.icon className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-stone-900 mb-4">{item.step}</h3>
                        <p className="text-stone-700/60 leading-relaxed">{item.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </section>
              </motion.div>
            ) : (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-[40px] overflow-hidden shadow-2xl border border-rose-200/30"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Product Image */}
                  <div className="md:w-1/2 relative flex flex-col">
                    {isEditing ? (
                      <div className="w-full h-full bg-rose-100 flex flex-col p-8 overflow-y-auto max-h-[600px]">
                        <div className="flex justify-between items-center mb-4">
                          <p className="text-stone-700 font-bold">編輯圖片網址 (最多10張)</p>
                          <span className="text-xs text-stone-700/60">{editForm?.images.length || 0} / 10</span>
                        </div>
                        <div className="space-y-3">
                          {editForm?.images.map((img, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input 
                                type="text"
                                value={img}
                                onChange={(e) => {
                                  const newImages = [...(editForm?.images || [])];
                                  newImages[idx] = e.target.value;
                                  setEditForm(prev => prev ? { ...prev, images: newImages } : null);
                                }}
                                className="flex-1 p-2 rounded-lg border border-rose-200 text-sm"
                                placeholder="https://..."
                              />
                              <button 
                                onClick={() => {
                                  const newImages = editForm?.images.filter((_, i) => i !== idx);
                                  setEditForm(prev => prev ? { ...prev, images: newImages } : null);
                                }}
                                className="p-2 text-rose-500 hover:bg-rose-200 rounded-lg"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          {(editForm?.images.length || 0) < 10 && (
                            <button 
                              onClick={() => setEditForm(prev => prev ? { ...prev, images: [...prev.images, ''] } : null)}
                              className="w-full py-2 border-2 border-dashed border-rose-200 rounded-xl text-stone-700 hover:bg-rose-200/30 flex items-center justify-center gap-2 text-sm font-bold"
                            >
                              <Plus className="w-4 h-4" /> 新增圖片
                            </button>
                          )}
                        </div>
                        <div className="mt-6 grid grid-cols-5 gap-2">
                          {editForm?.images.filter(url => url).map((url, idx) => (
                            <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-rose-200">
                              <img src={url} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col h-full">
                        <div className="relative w-full overflow-hidden touch-pan-y bg-white">
    <AnimatePresence mode="wait">
      <motion.img
        key={selectedProduct.images[activeImageIdx]}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        src={selectedProduct.images[activeImageIdx]}
        alt={selectedProduct.name}
        className="w-full h-auto block"
        referrerPolicy="no-referrer"
                              drag="x"
                              dragConstraints={{ left: 0, right: 0 }}
                              onDragEnd={(_, info) => {
                                if (info.offset.x > 100) {
                                  setActiveImageIdx(prev => (prev > 0 ? prev - 1 : selectedProduct.images.length - 1));
                                } else if (info.offset.x < -100) {
                                  setActiveImageIdx(prev => (prev < selectedProduct.images.length - 1 ? prev + 1 : 0));
                                }
                              }}
                            />
                          </AnimatePresence>
                          
                          {selectedProduct.images.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                              {selectedProduct.images.map((_, idx) => (
                                <div 
                                  key={idx}
                                  className={`w-1.5 h-1.5 rounded-full transition-all shadow-sm ${
                                    activeImageIdx === idx ? 'bg-rose-500 w-4' : 'bg-stone-300'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        {selectedProduct.images.length > 1 && (
                          <div className="p-4 bg-rose-50 flex gap-2 overflow-x-auto scrollbar-hide">
                            {selectedProduct.images.map((img, idx) => (
                              <div 
                                key={idx} 
                                onClick={() => setActiveImageIdx(idx)}
                                className={`w-16 h-16 flex-shrink-0 bg-white rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                                  activeImageIdx === idx ? 'border-rose-500 shadow-lg' : 'border-rose-200/30 hover:border-rose-500/50'
                                }`}
                              >
                                <img src={img} className="w-full h-full object-contain" referrerPolicy="no-referrer" alt="" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setSelectedProduct(null);
                        setIsEditing(false);
                        setIsConfirmingDelete(false);
                      }}
                      className="absolute top-6 left-6 w-12 h-12 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-stone-900 hover:bg-rose-500 hover:text-white transition-all duration-300"
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </button>
                    
                    {isAdmin && !isEditing && (
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setEditForm(selectedProduct);
                        }}
                        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-stone-700 text-white shadow-lg flex items-center justify-center hover:bg-stone-900 transition-all duration-300"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
                    {isEditing ? (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <h3 className="text-2xl font-bold text-stone-900">編輯商品資訊</h3>
                          <button onClick={() => { setIsEditing(false); setIsConfirmingDelete(false); }} className="p-2 text-stone-700 hover:text-rose-500">
                            <X className="w-6 h-6" />
                          </button>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-bold text-rose-500 uppercase tracking-widest mb-2">商品分類</label>
                          <select 
                            value={editForm?.category || 'health'}
                            onChange={(e) => setEditForm(prev => prev ? { ...prev, category: e.target.value as any } : null)}
                            className="w-full p-3 rounded-xl border-2 border-rose-200 focus:outline-none focus:border-rose-500 bg-white"
                          >
                            <option value="health">保健食品</option>
                            <option value="daily">生活用品</option>
                            <option value="limited">限時開團</option>
                            <option value="welfare">葵粉福利區</option>
                          </select>
                        </div>

                        {editForm?.category === 'welfare' ? (
                          <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-200">
                            <input 
                              type="checkbox"
                              id="isAnnouncement"
                              checked={editForm?.isAnnouncement || false}
                              onChange={(e) => setEditForm(prev => prev ? { ...prev, isAnnouncement: e.target.checked } : null)}
                              className="w-5 h-5 accent-rose-500"
                            />
                            <label htmlFor="isAnnouncement" className="text-sm font-bold text-stone-900 cursor-pointer">
                              設定為活動公告 (隱藏價格與規格)
                            </label>
                          </div>
                        ) : null}
                        
                        <div>
                          <label className="block text-xs font-bold text-rose-500 uppercase tracking-widest mb-2">商品名稱</label>
                          <input 
                            type="text"
                            value={editForm?.name || ''}
                            onChange={(e) => setEditForm(prev => prev ? { ...prev, name: e.target.value } : null)}
                            className="w-full p-3 rounded-xl border-2 border-rose-200 focus:outline-none focus:border-rose-500"
                          />
                        </div>

                        {(!editForm?.isAnnouncement || editForm?.category !== 'welfare') && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-rose-500 uppercase tracking-widest mb-2">價格</label>
                              <input 
                                type="number"
                                value={editForm?.price || 0}
                                onChange={(e) => setEditForm(prev => prev ? { ...prev, price: parseInt(e.target.value) } : null)}
                                className="w-full p-3 rounded-xl border-2 border-rose-200 focus:outline-none focus:border-rose-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-rose-500 uppercase tracking-widest mb-2">原價 (可選)</label>
                              <input 
                                type="number"
                                value={editForm?.originalPrice || ''}
                                onChange={(e) => setEditForm(prev => prev ? { ...prev, originalPrice: e.target.value ? parseInt(e.target.value) : undefined } : null)}
                                className="w-full p-3 rounded-xl border-2 border-rose-200 focus:outline-none focus:border-rose-500"
                              />
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-bold text-rose-500 uppercase tracking-widest mb-2">商品描述</label>
                          <textarea 
                            value={editForm?.description || ''}
                            onChange={(e) => setEditForm(prev => prev ? { ...prev, description: e.target.value } : null)}
                            className="w-full p-3 rounded-xl border-2 border-rose-200 focus:outline-none focus:border-rose-500 h-32"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-rose-500 uppercase tracking-widest mb-2">商品特色</label>
                          <div className="space-y-2">
                            {editForm?.features.map((feature, i) => (
                              <div key={i} className="flex gap-2">
                                <input 
                                  type="text"
                                  value={feature}
                                  onChange={(e) => {
                                    const newFeatures = [...(editForm?.features || [])];
                                    newFeatures[i] = e.target.value;
                                    setEditForm(prev => prev ? { ...prev, features: newFeatures } : null);
                                  }}
                                  className="flex-1 p-2 rounded-lg border border-rose-200"
                                />
                                <button 
                                  onClick={() => {
                                    const newFeatures = editForm?.features.filter((_, idx) => idx !== i);
                                    setEditForm(prev => prev ? { ...prev, features: newFeatures || [] } : null);
                                  }}
                                  className="p-2 text-rose-500 hover:bg-rose-200 rounded-lg"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            <button 
                              onClick={() => setEditForm(prev => prev ? { ...prev, features: [...prev.features, ''] } : null)}
                              className="flex items-center gap-2 text-sm font-bold text-stone-700 hover:text-rose-500"
                            >
                              <Plus className="w-4 h-4" /> 新增特色
                            </button>
                          </div>
                        </div>

                        {(!editForm?.isAnnouncement || editForm?.category !== 'welfare') && (
                          <>
                            <div>
                              <label className="block text-xs font-bold text-rose-500 uppercase tracking-widest mb-2">商品規格 (逗號分隔)</label>
                              <input 
                                type="text"
                                value={editForm?.variants.join(', ') || ''}
                                onChange={(e) => setEditForm(prev => prev ? { ...prev, variants: e.target.value.split(',').map(v => v.trim()).filter(v => v) } : null)}
                                className="w-full p-3 rounded-xl border-2 border-rose-200 focus:outline-none focus:border-rose-500"
                                placeholder="例如：原味, 辣味, 芥末"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-rose-500 uppercase tracking-widest mb-2">限購數量 (0 或留空表示不限)</label>
                              <input 
                                type="number"
                                value={editForm?.maxLimit || ''}
                                onChange={(e) => setEditForm(prev => prev ? { ...prev, maxLimit: e.target.value ? parseInt(e.target.value) : undefined } : null)}
                                className="w-full p-3 rounded-xl border-2 border-rose-200 focus:outline-none focus:border-rose-500"
                              />
                            </div>

                            {editForm?.category === 'limited' && (
                              <div>
                                <label className="block text-xs font-bold text-rose-500 uppercase tracking-widest mb-2">團購截止時間</label>
                                <input 
                                  type="datetime-local"
                                  value={editForm?.countdownTarget ? new Date(editForm.countdownTarget).toISOString().slice(0, 16) : ''}
                                  onChange={(e) => setEditForm(prev => prev ? { ...prev, countdownTarget: e.target.value ? new Date(e.target.value).toISOString() : undefined } : null)}
                                  className="w-full p-3 rounded-xl border-2 border-rose-200 focus:outline-none focus:border-rose-500"
                                />
                              </div>
                            )}
                          </>
                        )}

                        <div className="flex gap-4 pt-4">
                          {editForm?.id && (
                            isConfirmingDelete ? (
                              <div className="flex flex-1 gap-2">
                                <button 
                                  onClick={() => {
                                    setProducts(prev => prev.filter(p => p.id !== editForm.id));
                                    setIsEditing(false);
                                    setSelectedProduct(null);
                                    setIsConfirmingDelete(false);
                                  }}
                                  className="flex-1 bg-rose-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20"
                                >
                                  確定刪除
                                </button>
                                <button 
                                  onClick={() => setIsConfirmingDelete(false)}
                                  className="flex-1 bg-rose-100 text-rose-600 py-4 rounded-2xl font-bold flex items-center justify-center hover:bg-rose-200 transition-colors"
                                >
                                  取消
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => setIsConfirmingDelete(true)}
                                className="px-6 bg-rose-100 text-rose-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-200 transition-colors"
                              >
                                <Trash2 className="w-5 h-5" /> 刪除
                              </button>
                            )
                          )}
                          <button 
                            onClick={handleSaveEdit}
                            className="flex-1 bg-stone-700 text-orange-50 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-stone-900 transition-colors"
                          >
                            <Save className="w-5 h-5" /> 儲存變更
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mb-8">
                          <div className="flex items-center gap-2 mb-4">
                            {/* 🌟 修復 3：詳細頁的分類標籤 */}
                            <span className="px-3 py-1 rounded-full bg-rose-200 text-rose-600 text-xs font-bold tracking-widest uppercase">
                              {selectedProduct.category === 'health' ? '保健食品' : selectedProduct.category === 'daily' ? '生活用品' : selectedProduct.category === 'limited' ? '限時開團' : '葵粉福利區'}
                            </span>
                            {selectedProduct.status === 'limited' && (
                              <span className="px-3 py-1 rounded-full bg-rose-600/10 text-rose-500 text-xs font-bold tracking-widest uppercase flex items-center gap-1">
                                <Clock className="w-3 h-3" /> 限時優惠
                              </span>
                            )}
                          </div>
                          <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4 leading-tight">
                            {selectedProduct.name}
                          </h2>
                          {!selectedProduct.isAnnouncement && (
                            <div className="flex items-baseline gap-3 mb-6">
                              <span className="text-4xl font-bold text-stone-700">
                                ${selectedProduct.price}
                              </span>
                              {selectedProduct.originalPrice && (
                                <span className="text-lg text-stone-700/40 line-through">
                                  ${selectedProduct.originalPrice}
                                </span>
                              )}
                            </div>
                          )}
                          {/* 🌟 修復 2：商品描述加入 whitespace-pre-wrap 來支援換行 */}
                          <p className="text-stone-700/70 leading-relaxed mb-8 text-lg whitespace-pre-wrap">
                            {selectedProduct.description}
                          </p>

                          <div className="space-y-4 mb-8">
                            <h4 className="text-sm font-bold text-stone-900 uppercase tracking-widest">
                              商品特色
                            </h4>
                            <ul className="grid grid-cols-1 gap-3">
                              {selectedProduct.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-stone-700/80">
                                  <div className="w-5 h-5 rounded-full bg-rose-200 flex items-center justify-center">
                                    <ShieldCheck className="w-3 h-3 text-rose-500" />
                                  </div>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Variant & Quantity Selection */}
                          {!(selectedProduct.isAnnouncement || selectedProduct.category === 'welfare') && (
                            <div className="space-y-6 mb-8 p-6 bg-rose-50/50 rounded-3xl border border-rose-200/20">
                              {selectedProduct.variants.length > 0 && (
                                <div>
                                  <label className="block text-sm font-bold text-stone-900 mb-3">選擇規格</label>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedProduct.variants.map((variant) => (
                                      <button
                                        key={variant}
                                        onClick={() => setSelectedVariant(variant)}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                          selectedVariant === variant
                                            ? 'bg-stone-700 text-orange-50 shadow-md'
                                            : 'bg-white text-stone-700 border border-rose-200 hover:border-rose-500'
                                        }`}
                                      >
                                        {variant}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center justify-between">
                                <div>
                                  <label className="block text-sm font-bold text-stone-900 mb-1">購買數量</label>
                                  {selectedProduct.maxLimit && (
                                    <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">
                                      每人限購 {selectedProduct.maxLimit} 件
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 bg-white rounded-xl border border-rose-200 p-1">
                                  <button 
                                    onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-700 hover:bg-rose-200 transition-colors"
                                  >
                                    <X className="w-3 h-3 rotate-45" />
                                  </button>
                                  <span className="w-8 text-center font-bold text-stone-700">{selectedQuantity}</span>
                                  <button 
                                    onClick={() => {
                                      if (selectedProduct.maxLimit && selectedQuantity >= selectedProduct.maxLimit) {
                                        alert(`已達限購數量 ${selectedProduct.maxLimit} 件`);
                                        return;
                                      }
                                      setSelectedQuantity(selectedQuantity + 1);
                                    }}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-700 hover:bg-rose-200 transition-colors"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-auto space-y-4">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                              onClick={() => handleOrderNow(selectedProduct)}
                              className="flex-1 bg-stone-700 text-orange-50 py-4 rounded-2xl font-bold text-lg hover:bg-stone-900 transition-all duration-300 shadow-xl shadow-stone-700/20 flex items-center justify-center gap-2"
                            >
                              {(selectedProduct.isAnnouncement || selectedProduct.category === 'welfare') ? '立即詢問' : '立即下單'} <ExternalLink className="w-5 h-5" />
                            </button>
                            {!(selectedProduct.isAnnouncement || selectedProduct.category === 'welfare') && (
                              <button 
                                onClick={() => addToCart(selectedProduct, selectedVariant, selectedQuantity)}
                                className="flex-1 bg-rose-200 text-stone-700 py-4 rounded-2xl font-bold text-lg hover:bg-rose-200/70 transition-all duration-300 flex items-center justify-center gap-2"
                              >
                                加入購物籃 <ShoppingBag className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                          <button 
                            onClick={() => toggleFavorite(selectedProduct.id)}
                            className={`w-full py-4 rounded-2xl border-2 font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                              favorites.includes(selectedProduct.id) 
                                ? 'bg-rose-500 border-rose-500 text-white' 
                                : 'border-rose-200 text-stone-700 hover:bg-rose-200'
                            }`}
                          >
                            <Heart className={`w-5 h-5 ${favorites.includes(selectedProduct.id) ? 'fill-current' : ''}`} />
                            {favorites.includes(selectedProduct.id) ? '已收藏' : '加入收藏'}
                          </button>
                        </div>
                        
                        <p className="mt-6 text-center text-xs text-stone-700/40">
                          * 點擊立即下單將導向官方 LINE 客服進行訂購
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-stone-700/80 backdrop-blur-md text-orange-50 px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap"
          >
            <span>已加入購物車❤️請點擊右上圖示查看全部</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-rose-200"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-stone-900">管理員登入</h3>
                <button onClick={() => setIsLoginModalOpen(false)} className="text-stone-700 hover:text-rose-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">帳號</label>
                  <input 
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    className="w-full p-3 rounded-xl border-2 border-rose-200 focus:outline-none focus:border-rose-500"
                    placeholder="請輸入帳號"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">密碼</label>
                  <input 
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full p-3 rounded-xl border-2 border-rose-200 focus:outline-none focus:border-rose-500"
                    placeholder="請輸入密碼"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-stone-700 text-orange-50 py-4 rounded-xl font-bold hover:bg-stone-900 transition-all duration-300 mt-2"
                >
                  登入
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 h-full w-full max-w-md bg-orange-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-rose-200 flex justify-between items-center bg-orange-50/80 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-stone-700" />
                  <h3 className="text-xl font-bold text-stone-900">我的購物籃</h3>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-2 text-stone-700 hover:text-rose-500">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-stone-700/40">
                    <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-lg font-medium">購物籃還是空的喔</p>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="mt-4 text-rose-500 font-bold hover:underline"
                    >
                      去逛逛好物吧
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={`${item.product.id}-${item.variant}`} className="flex gap-4 bg-white p-4 rounded-2xl border border-rose-200/50 shadow-sm">
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={item.product.images[0]} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-stone-900 line-clamp-1">{item.product.name}</h4>
                        <p className="text-stone-700/60 text-xs mb-1">規格：{item.variant || '預設'}</p>
                        <p className="text-stone-700/60 text-sm mb-2">${item.product.price} x {item.quantity}</p>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-stone-700">${item.product.price * item.quantity}</span>
                          <button 
                            onClick={() => removeFromCart(item.product.id, item.variant)}
                            className="text-xs text-rose-500 font-bold hover:underline bg-rose-50 px-2 py-1 rounded"
                          >
                            移除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-white border-t border-rose-200">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-stone-700/60">總計金額</span>
                    <span className="text-2xl font-bold text-stone-700">
                      ${cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)}
                    </span>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-stone-700 text-orange-50 py-4 rounded-xl font-bold hover:bg-stone-900 transition-all duration-300 shadow-xl shadow-stone-700/20"
                  >
                    前往結帳
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-20 py-12 bg-rose-200/30 border-t border-rose-200">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-rose-200 flex items-center justify-center text-rose-500">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <span className="font-bold text-stone-900">葵葵開團好物區</span>
          </div>
          <p className="text-sm text-stone-700/60 mb-8 max-w-md mx-auto">
            我們致力於尋找生活中最美好的事物，讓您的每一天都充滿驚喜與健康。
          </p>
          <div className="flex justify-center gap-6 mb-8">
            <a href="https://lin.ee/3FkHbsvk" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-stone-700/60 hover:text-rose-500 transition-colors">
              <span className="font-bold">LINE: @234csaak</span>
            </a>
            <a href="https://www.facebook.com/people/%25E8%2591%25B5%25E8%2591%25B5%25E5%25AA%25BD%25E5%2592%25AA/61585810028195/?locale=zh_TW&checkpoint_src=any" target="_blank" rel="noreferrer" className="text-stone-700/40 hover:text-rose-500 transition-colors">Facebook</a>
            <a href="https://www.instagram.com/kewi.mommy/" target="_blank" rel="noreferrer" className="text-stone-700/40 hover:text-rose-500 transition-colors">Instagram</a>
          </div>
          <p className="text-[10px] text-stone-700/30 uppercase tracking-[0.2em]">
            © 2024 AOI GROUP BUY. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>
    </div>
  );
}
