import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import BottomNav from './components/BottomNav';
import Home from './components/Home';
import Cart from './components/Cart';
import Orders from './components/Orders';
import Profile from './components/Profile';
import StoreDetail from './components/StoreDetail';
import Checkout from './components/Checkout';
import OrderProgress from './components/OrderProgress';
import OrderReview from './components/OrderReview';
import Settings from './components/Settings';
import AddressPage from './components/AddressPage';
import CouponsPage from './components/CouponsPage';
import SearchPage from './components/SearchPage';
import RefundPage from './components/RefundPage';
import ServicePage from './components/ServicePage';
import FavoritesPage from './components/FavoritesPage';
import { TabType, RouteType } from './types';
import { Toast } from '@shared';

function MainApp() {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [currentRoute, setCurrentRoute] = useState<RouteType>('main');
  const [storeId, setStoreId] = useState<string>('1');
  const [cartCount, setCartCount] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onSuccess={() => window.location.reload()} />;
  }

  const back = () => setCurrentRoute('main');
  const openStore = (id: string) => {
    setStoreId(id);
    setCurrentRoute('storeDetail');
  };

  return (
    <div className="w-full max-w-[480px] mx-auto relative min-h-screen bg-[#F5F5F5]">
      <Toast />
      {currentRoute === 'main' && (
        <>
          {activeTab === 'home' && <Home onStoreClick={openStore} />}
          {activeTab === 'orders' && <Orders onViewProgress={() => setCurrentRoute('orderProgress')} onReview={() => setCurrentRoute('orderReview')} />}
          {activeTab === 'cart' && <Cart onCheckout={() => setCurrentRoute('checkout')} />}
          {activeTab === 'profile' && (
            <Profile
              onSettings={() => setCurrentRoute('settings')}
              onAddress={() => setCurrentRoute('address')}
              onCoupons={() => setCurrentRoute('coupons')}
              onService={() => setCurrentRoute('service')}
              onFavorites={() => setCurrentRoute('favorites')}
            />
          )}
          <BottomNav activeTab={activeTab} onChange={setActiveTab} cartCount={cartCount} />
        </>
      )}
      {currentRoute === 'storeDetail' && <StoreDetail storeId={storeId} onBack={back} onCheckout={() => setCurrentRoute('checkout')} onCartUpdate={(count) => setCartCount(count)} />}
      {currentRoute === 'checkout' && <Checkout onBack={back} />}
      {currentRoute === 'orderProgress' && <OrderProgress onBack={back} />}
      {currentRoute === 'orderReview' && <OrderReview onBack={back} />}
      {currentRoute === 'settings' && <Settings onBack={back} />}
      {currentRoute === 'address' && <AddressPage onBack={back} />}
      {currentRoute === 'coupons' && <CouponsPage onBack={back} />}
      {currentRoute === 'search' && <SearchPage onBack={back} onStoreClick={openStore} />}
      {currentRoute === 'refund' && <RefundPage onBack={back} />}
      {currentRoute === 'service' && <ServicePage onBack={back} />}
      {currentRoute === 'favorites' && <FavoritesPage onBack={back} onStoreClick={openStore} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
