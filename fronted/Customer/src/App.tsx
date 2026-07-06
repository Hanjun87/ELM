import { useState, useEffect } from 'react';
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
import { getState, subscribe, StoreState } from './store';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [currentRoute, setCurrentRoute] = useState<RouteType>('main');
  const [store, setStore] = useState<StoreState>(getState());
  const [storeId, setStoreId] = useState<string>('mcdonalds');

  useEffect(() => {
    return subscribe(() => setStore({ ...getState() }));
  }, []);

  const openStore = (id: string) => { setStoreId(id); setCurrentRoute('storeDetail'); };
  const back = () => setCurrentRoute('main');

  return (
    <div className="bg-[#F5F5F5] min-h-[100dvh] text-gray-900 font-sans w-full max-w-md mx-auto relative shadow-2xl overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      <Toast />
      {currentRoute === 'main' && (
        <>
          {activeTab === 'home' && <Home onStoreClick={openStore} onSearch={() => setCurrentRoute('search')} />}
          {activeTab === 'cart' && <Cart cart={store.cart} onCheckout={() => setCurrentRoute('checkout')} />}
          {activeTab === 'orders' && (
            <Orders orders={store.orders} onViewProgress={() => setCurrentRoute('orderProgress')}
              onReview={() => setCurrentRoute('orderReview')} onRefund={() => setCurrentRoute('refund')}
              onOrderAgain={(storeId) => { setStoreId(storeId); setCurrentRoute('storeDetail'); }} />
          )}
          {activeTab === 'profile' && <Profile onSettings={() => setCurrentRoute('settings')}
            onAddress={() => setCurrentRoute('address')} onCoupons={() => setCurrentRoute('coupons')}
            onService={() => setCurrentRoute('service')} onFavorites={() => setCurrentRoute('favorites')} />}
          <BottomNav activeTab={activeTab} onChange={setActiveTab} cartCount={store.cart.reduce((s, c) => s + c.quantity, 0)} />
        </>
      )}
      {currentRoute === 'storeDetail' && <StoreDetail storeId={storeId} onBack={back} onCheckout={() => setCurrentRoute('checkout')} />}
      {currentRoute === 'checkout' && <Checkout cart={store.cart} onBack={back} />}
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
