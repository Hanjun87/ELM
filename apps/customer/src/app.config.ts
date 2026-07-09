export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/orders/index',
    'pages/cart/index',
    'pages/profile/index',
    'pages/login/index',
    'pages/store/index',
    'pages/checkout/index',
    'pages/address/index',
    'pages/coupons/index',
    'pages/order-progress/index',
    'pages/favorites/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: 'ELM 外卖',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#0085FF',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
        iconPath: 'assets/tabbar/home.png',
        selectedIconPath: 'assets/tabbar/home-active.png'
      },
      {
        pagePath: 'pages/orders/index',
        text: '订单',
        iconPath: 'assets/tabbar/orders.png',
        selectedIconPath: 'assets/tabbar/orders-active.png'
      },
      {
        pagePath: 'pages/cart/index',
        text: '购物车',
        iconPath: 'assets/tabbar/cart.png',
        selectedIconPath: 'assets/tabbar/cart-active.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/tabbar/profile.png',
        selectedIconPath: 'assets/tabbar/profile-active.png'
      },
    ],
  },
});
