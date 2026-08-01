import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { SiteSettingsProvider } from '@/context/SiteSettingsContext';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import CartDrawer from '@/components/store/CartDrawer';
import HomePage from '@/pages/store/HomePage';
import ShopPage from '@/pages/store/ShopPage';
import ProductDetailPage from '@/pages/store/ProductDetailPage';
import CheckoutPage from '@/pages/store/CheckoutPage';
import WishlistPage from '@/pages/store/WishlistPage';
import CustomerAuth from '@/pages/store/CustomerAuth';
import MyOrdersPage from '@/pages/store/MyOrdersPage';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminReviews from '@/pages/admin/AdminReviews';
import AdminSettings from '@/pages/admin/AdminSettings';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
  if (!session) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <SiteSettingsProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<StoreLayout><HomePage /></StoreLayout>} />
              <Route path="/shop" element={<StoreLayout><ShopPage /></StoreLayout>} />
              <Route path="/product/:id" element={<StoreLayout><ProductDetailPage /></StoreLayout>} />
              <Route path="/checkout" element={<StoreLayout><CheckoutPage /></StoreLayout>} />
              <Route path="/wishlist" element={<StoreLayout><WishlistPage /></StoreLayout>} />
              <Route path="/orders" element={<StoreLayout><MyOrdersPage /></StoreLayout>} />
              <Route path="/auth" element={<CustomerAuth />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
              <Route path="/admin/categories" element={<ProtectedRoute><AdminCategories /></ProtectedRoute>} />
              <Route path="/admin/reviews" element={<ProtectedRoute><AdminReviews /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          </SiteSettingsProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
