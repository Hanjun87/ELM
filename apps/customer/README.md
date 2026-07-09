# ELM 外卖客户端 · 微信小程序版

用 **Taro 4 + React + TypeScript** 把原 Web 客户端（`fronted/Customer/`）移植为微信小程序。
样式通过 `weapp-tailwindcss` 复用原有 Tailwind className，DOM 标签、请求层、存储、路由已全部改造为小程序原生方案。

## 与 Web 端的对应关系

| Web 端 (React DOM) | 小程序端 (Taro) |
|--------------------|-----------------|
| `axios` | `Taro.request` 封装（`src/api/config.ts`）|
| `localStorage` | `Taro.setStorageSync` / `getStorageSync` |
| `toast()` from `@shared` | `Taro.showToast`（`src/utils/toast.ts`）|
| 单页 `currentRoute` 状态切换 | 小程序多页 + tabBar 路由（`src/app.config.ts`）|
| `div/span/h1/p` | `View` / `Text` |
| `img` | `Image` |
| `input onChange` | `Input onInput` |
| `lucide-react` 图标 | emoji / 后续可换字体图标（小程序不支持该库）|

## 页面清单

- `pages/login` 登录（含测试账号快速登录）
- `pages/home` 首页 · 商家列表（tabBar，下拉刷新）
- `pages/orders` 订单列表（tabBar，去支付/取消/查看进度）
- `pages/cart` 购物车（tabBar，空态引导）
- `pages/profile` 我的（tabBar，退出登录）
- `pages/store` 商家详情 · 加购
- `pages/checkout` 确认订单 · 下单（读默认地址）
- `pages/address` 收货地址（列表/新增/设默认）
- `pages/coupons` 优惠券（后端 promotions 未接路由，降级空态）
- `pages/order-progress` 订单进度时间线（静态示意）

## 一、安装依赖

```bash
cd apps/customer
npm install
```

> 已锁定 Vite 4（Taro 4.0.9 的 React 插件 peer 要求 vite@^4）。若重装报 `ERESOLVE`，用 `npm install --legacy-peer-deps`。

## 二、构建产物

```bash
npm run dev:weapp     # 开发：监听源码变化，实时增量编译到 dist/
# 或
npm run build:weapp   # 生产：一次性编译到 dist/
```

编译产物在 `dist/`，这就是要导入微信开发者工具的目录（`project.config.json` 已配置 `miniprogramRoot: dist/`）。

## 三、在微信开发者工具中打开

1. 下载安装 **微信开发者工具**（稳定版）：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
2. 打开工具 → **导入项目**
3. **目录**：选择本目录 `apps/customer`（不是 dist；工具会读 `project.config.json` 里的 `miniprogramRoot`）
4. **AppID**：
   - 有小程序 AppID 就填自己的
   - 没有就点「**测试号**」（点 AppID 输入框旁的「测试号」链接即可，无需注册）
5. 导入后，若页面空白，确认 `dist/` 已生成（先跑过一次 `npm run build:weapp` 或让 `dev:weapp` 在监听）

## 四、连接后端（重要）

小程序默认只允许 https 且已在小程序后台备案的域名。本地开发连 `http://localhost:8000` 需要：

1. 先启动后端（见根目录 `CLAUDE.md`）：
   ```bash
   cd src/elm
   uv run python manage.py migrate
   uv run python manage.py init_data      # 播种测试账号
   uv run python manage.py runserver 0.0.0.0:8000
   ```
2. 微信开发者工具 → 右上角 **详情** → **本地设置** → 勾选
   **「不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书」**
3. 后端地址在 `src/api/config.ts` 的 `API_BASE_URL`，默认 `http://localhost:8000/api/v1`。
   真机预览时 `localhost` 不通，需改成电脑局域网 IP（如 `http://192.168.1.x:8000/api/v1`）并确保手机与电脑同网段。

## 五、测试账号

登录页「客户账号」按钮已内置 `13800000001 / customer`。
（其它角色账号见根目录 `docs/TEST_ACCOUNTS.md`，但本小程序只做客户端，登录后按 customer 角色使用。）

## 已知限制

- 只移植了 **Customer 客户端**；Merchant / Rider / Manager 仍是 Web 应用。
- 优惠券接口 `/user/coupons/` 依赖后端 `promotions` 应用，该应用**未接入 URL 路由**，页面会降级为空态。
- 订单进度页为静态时间线示意，未按真实订单状态动态渲染。
- tabBar 暂用纯文字（未配图标 PNG）；如需图标，在 `app.config.ts` 的 `tabBar.list` 补 `iconPath`/`selectedIconPath` 并放入图片资源。
- 图片来自后端返回的 URL；`Image` 加载外部域名图片同样受「合法域名」限制，本地调试需勾选上面第四步。
