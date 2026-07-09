# ELM 外卖骑手端 · 微信小程序版

用 **Taro 4 + React + TypeScript** 构建的骑手配送管理小程序。

## 功能清单

- `pages/login` 登录（含测试账号快速登录，rider 角色）
- `pages/available` 待接单（tabBar，搜索 + 抢单 + 开工状态切换）
- `pages/deliveries` 我的配送（tabBar，取餐/送达 + 异常上报 bottom-sheet）
- `pages/history` 历史配送（tabBar，已送达订单列表）
- `pages/profile` 我的（tabBar，骑手信息卡片 + 退出登录）

## 一、安装依赖

```bash
cd apps/rider
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
3. **目录**：选择本目录 `apps/rider`（不是 dist；工具会读 `project.config.json` 里的 `miniprogramRoot`）
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

登录页「骑手账号」按钮已内置 `13800000003 / rider`。
（其它角色账号见根目录 `docs/TEST_ACCOUNTS.md`，但本小程序只做骑手端，登录后按 rider 角色使用。）

## 已知限制

- 异常上报 bottom-sheet 为 toast-only（无后端接口）。
- 个人中心的「资质」「站点」「历史」「设置」菜单项为 toast-only（页面未实现）。
- tabBar 图标复用了 merchant 的 png 文件（非骑手专属图标）。
