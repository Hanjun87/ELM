# ELM 项目文档生成提示词

本文档汇总了 `docs/` 目录下各 Markdown 文件的生成提示词。将对应提示词交给 AI，即可复刻或更新相应文档。

---

## 1. 项目概述文档（docs/00-overview.md）

```text
你正在为 ELM 外卖平台撰写项目概述文档。项目是一个基于 Django + DRF 后端、Taro 微信小程序（客户/商家/骑手三端）+ React Web 管理后台的多角色外卖系统。

请按以下结构生成 Markdown 文档：
1. 项目简介：说明平台定位、四个角色、当前形态（3 小程序 + 1 Web 后台），并给出技术栈表格。
2. 系统架构：用 ASCII 或文本框图展示前端、后端、数据库的分层关系。
3. 客户端应用：分别说明 Customer/ Merchant/ Rider 三个小程序的目录、技术栈、tab 页、后端对接状态；说明 Manager Web 后台；并列出已废弃的 Web 前端。
4. 后端 Django Apps：以表格列出 accounts/merchants/products/orders/addresses/promotions/riders/reviews/admin_panel/uploads/payments/notifications/common 等 app 的状态和说明。
5. 订单状态流转：给出 pending → paid → accepted → preparing → ready → picked → delivered → finished 的简化状态图。
6. 测试账号与 Mock 数据：列出 4 个基础测试账号，并说明 init_data + add_more_data 后的大致数据规模。
7. 文档索引：列出项目内其他文档的链接和说明。

要求：使用中文，语言简洁，多用表格和代码块，不添加 emoji。
```

---

## 2. 需求说明书（docs/需求说明书.md）

```text
你正在为 ELM 外卖平台撰写需求说明书。平台包含四个角色：客户（customer）、商家（merchant）、骑手（rider）、管理员（admin）。

请按以下结构生成 Markdown 文档：
1. 项目背景：说明平台定位、前后端分离、四端界面。
2. 系统角色：给出角色表格，并为每个角色撰写详细能力描述（客户侧重浏览/下单/售后；商家侧重店铺/商品/订单/营销；骑手侧重接单/配送/异常/收入；管理员侧重用户/商家/订单/数据/内容管理）。
3. 功能需求：按模块列出带编号的功能表格，每个功能包含编号、功能名称、说明、实现状态。模块包括：
   - 3.1 账号模块（ACC-01 ~ ACC-04）
   - 3.2 客户端功能（商家浏览、购物下单、地址管理、评价、优惠券）
   - 3.3 商家端功能（店铺管理、商品管理、订单处理）
   - 3.4 骑手端功能（RID-01 ~ RID-07）
   - 3.5 管理员端功能（ADM-01 ~ ADM-05）
   - 3.6 文件上传（UPL-01）
4. 数据库模型设计：列出 10 张核心表（User、Role、UserRole、Merchant、Category、Product、Rider、Order、OrderItem、Address）的用途和核心字段。
5. 表结构关联说明：说明 User-Merchant/Rider、Merchant-Product、Order-Product、Order-Rider 的关系。
6. 非功能需求：安全（JWT、RBAC、数据隔离、并发安全、生产配置）、数据完整性（库存扣减/回滚、起送金额、价格校验、默认地址原子性）、性能（P95 < 500ms、并发扩展）。

要求：使用中文，实现状态统一用"已完成"文本，不添加 emoji，功能编号保持连续。
```

---

## 3. 设计说明书（docs/设计说明书.md）

```text
你正在为 ELM 外卖平台撰写设计说明书。项目基于 Django + DRF，包含客户、商家、骑手、管理员四个角色。

请按以下结构生成 Markdown 文档：
1. 用例图：使用 Mermaid graph LR 语法，分别绘制客户、商家、骑手、管理员的用例图，每个角色按功能子图组织。
2. 功能结构图：使用 Mermaid graph TD 语法，展示前端四端、后端模块、数据库的分层结构。
3. 数据库 E-R 图：使用 Mermaid erDiagram 语法，绘制 User、Role、UserRole、Merchant、Category、Product、Address、Order、Rider、Review、Upload、Coupon、UserCoupon 等实体，标注主键、外键和关系。
4. 数据库详细设计：为每张表提供字段表格（字段名、类型、约束、说明），并说明预置数据或状态枚举。
5. 核心业务流程：使用 Mermaid sequenceDiagram / stateDiagram-v2 分别绘制下单流程和订单履约流程。
6. 技术架构说明：给出后端分层目录和前端目录结构，说明各模块职责。

要求：使用中文，Mermaid 语法正确，不添加 emoji，字段设计需贴近实际 Django Models（如使用 JSON 快照、Decimal 金额、状态枚举等）。
```

---

## 4. RBAC 权限设计（docs/03-rbac-design.md）

```text
你正在为 ELM 外卖平台撰写 RBAC 权限设计文档。系统包含 customer、merchant、rider、admin 四种角色。

请按以下结构生成 Markdown 文档：
1. 权限模型概述：说明 User / Role / Permission / Resource 概念，以及最小权限、职责分离、数据隔离、可扩展性原则。
2. 角色定义：为每个角色列出权限代码表格（含权限代码、描述、适用资源），并说明数据访问范围和状态约束。
3. 权限继承与组合：说明不支持继承、支持多角色并集、冲突角色检测（merchant + rider、admin + 其他）。
4. 权限检查机制：给出 Django 装饰器示例、对象级权限检查示例、QuerySet 过滤示例（按角色隔离订单数据）。
5. 权限表设计实现：给出 User/Role/UserRole 的 Model 代码示例，包含 has_role / has_permission 方法。
6. 初始权限数据：给出 ROLE_PERMISSIONS 字典和 init_roles 管理命令示例。
7. API 权限矩阵：以表格列出主要 API 端点与四个角色的访问关系。
8. 安全最佳实践：JWT 携带角色、防止权限提升攻击、敏感操作二次验证、审计日志。
9. 权限测试：给出 RBACTestCase 示例。
10. 权限演进路线：Phase 1 静态权限、Phase 2 动态配置、Phase 3 细粒度权限。
11. 相关文档：链接数据库设计、API 文档、订单生命周期文档。

要求：使用中文，代码示例使用 Python/Django/DRF 风格，不添加 emoji。
```

---

## 5. 订单生命周期设计（docs/04-order-lifecycle.md）

```text
你正在为 ELM 外卖平台撰写订单生命周期设计文档。订单状态包括 pending、paid、accepted、preparing、ready、picked、delivered、finished、cancelled、refunding、refunded。

请按以下结构生成 Markdown 文档：
1. 订单状态机：列出状态枚举，并用文本/ASCII 或 Mermaid 绘制状态流转图。
2. 状态流转规则：详细说明每个状态转换的触发条件、操作主体、前置条件、后置动作、失败回滚/超时处理。覆盖：
   pending→paid、paid→accepted、paid→cancelled（拒单）、accepted→preparing、preparing→ready、ready→picked、picked→delivered、delivered→finished、任意→refunding、refunding→refunded。
3. 骑手派单算法：说明派单时机，给出系统自动派单评分算法示例，以及骑手大厅抢单模式、派单失败处理。
4. 异常流程处理：覆盖商家缺货、客户联系不上、地址错误、支付超时、库存不足等异常流程。
5. 权限控制矩阵：以表格列出各操作与 Customer/Merchant/Rider/Admin 的关系。
6. 时间约束：列出各阶段超时阈值和后果。
7. 数据统计：订单维度、商家维度、骑手维度统计指标。
8. 状态变更日志：给出 OrderStatusLog 模型示例。
9. WebSocket 实时通知事件：列出事件类型、触发时机、接收方。
10. 前端状态展示：分别给出客户端、商家端、骑手端的状态映射和操作按钮。
11. 状态机实现示例：给出 OrderStateMachine 类 Python 代码示例。
12. 相关文档：链接数据库设计、API 文档、RBAC 文档。

要求：使用中文，状态流转描述清晰，代码示例使用 Django/Python，不添加 emoji。
```

---

## 6. Django 模块划分设计（docs/05-module-design.md）

```text
你正在为 ELM 外卖平台撰写 Django 模块划分设计文档。项目使用 Django 6 + DRF，包含多个业务 App。

请按以下结构生成 Markdown 文档：
1. 项目结构：用树形目录展示 src/elm/ 下 config/accounts/merchants/products/orders/riders/payments/promotions/reviews/notifications/addresses/admin_panel/common/uploads 等目录及关键文件。
2. App 模块详解：为每个 App 说明职责、核心 Model、核心 API、关键逻辑代码示例。覆盖 accounts/merchants/products/orders/riders/payments/promotions/reviews/notifications/addresses/admin_panel/common/uploads。
3. 依赖关系图：用文本图展示 App 之间的依赖关系，说明单向依赖、低耦合、高内聚原则。
4. Celery 异步任务：给出 Celery 配置、定时任务调度示例，以及常见任务列表。
5. 数据库迁移策略：给出迁移顺序和初始化数据命令。
6. 测试策略：给出单元测试和集成测试示例。
7. 部署清单：列出环境变量示例和启动命令（Daphne、Celery Worker、Celery Beat）。
8. 相关文档：链接数据库设计、API 文档、RBAC、订单生命周期文档。

要求：使用中文，代码示例为 Python/Django/DRF/Celery，不添加 emoji。注意标注部分内容（Celery、派单算法、支付对接、WebSocket Consumer）可能尚未实现。
```

---

## 7. API 接口文档（docs/API.md）

```text
你正在为 ELM 外卖平台撰写 API 接口文档。Base URL 为 http://localhost:8000/api/v1，接口供 3 个微信小程序和 1 个 Web 管理后台调用。

请按以下结构生成 Markdown 文档：
1. 约定：说明统一响应格式 `{code, message, data}`、错误码范围、认证方式（Bearer Token）、IsAdmin 权限说明。
2. 账号模块 /api/v1/auth/：登录、注册、当前用户信息，包含请求/响应示例和错误码。
3. 商家模块：公开接口（商家列表、详情）、商家端接口（我的店铺、开关店）。
4. 商品模块：公开接口（商家商品列表、商品详情、分类列表）、商家端接口（商品 CRUD、上下架）。
5. 订单模块：订单对象字段说明、状态流转图；客户端接口（列表、详情、创建、支付、取消）；商家端接口（列表、接单、拒单、确认出餐、出餐完成）；骑手端接口（可接单列表、我的配送单、抢单、取餐、送达）。
6. 地址模块：地址 CRUD、设为默认地址。
7. 优惠券模块：优惠券列表、详情、领取、我的优惠券。
8. 骑手模块：我的骑手信息、更新工作状态。
9. 评价模块：商家评价列表、提交评价、商家回复评价。
10. 管理后台：数据看板、用户列表、封禁/解封、商家列表、更新商家状态（均需 IsAdmin）。
11. 文件上传：上传图片接口、约束、响应示例。
12. 未实现的接口：列出 payments/notifications/退款流程/商品审核/骑手收益统计/WebSocket 等无 HTTP 端点的功能。

要求：使用中文，每个接口包含请求方法/路径、认证要求、请求体、响应 data 示例、错误码，不添加 emoji。
```

---

## 8. 部署文档（docs/DEPLOY.md）

```text
你正在为 ELM 外卖平台撰写部署文档。项目包含 Django 后端、Taro 微信小程序三端、React Web 管理后台，支持 Docker 部署和手动部署。

请按以下结构生成 Markdown 文档：
1. 环境要求：列出 Python/Node/uv/数据库/Redis/Web Server/Docker 的版本或要求，说明当前形态（3 小程序 + 1 Web 后台）和已废弃的 Web 前端。
2. Docker 部署（推荐）：前置条件、配置环境变量、启动服务、常用 Docker 命令、开发模式（SQLite + 热重载）。
3. 手动部署（开发环境）：克隆仓库、后端初始化（uv sync / migrate / init_data / runserver）、前端初始化（Manager Web、三个微信小程序、已废弃 Web 前端注释说明）、启动脚本。
4. 生产环境部署（手动）：环境变量配置、PostgreSQL 配置、后端生产部署（settings_prod / migrate / collectstatic / check --deploy / Daphne 或 Gunicorn）、前端生产构建（Manager Web 和三小程序）、Nginx 配置、Systemd 服务。
5. 常用运维命令：查看日志、重启服务、数据库迁移、清除过期 Session。
6. 环境差异对照：开发 vs 生产在 settings/数据库/DEBUG/CORS/Channels/静态文件/媒体文件/限流/日志方面的差异。
7. 健康检查：curl 后端、Django check --deploy、数据库连接测试。

要求：使用中文，命令可直接复制执行，标注危险操作（如 docker-compose down -v），不添加 emoji。
```

---

## 9. 开发指南（docs/DEVELOPMENT.md）

```text
你正在为 ELM 外卖平台撰写开发指南。项目包含 Django 后端、Taro 微信小程序、React Web 管理后台。

请按以下结构生成 Markdown 文档：
1. 环境要求：Python/Node/uv/npm 版本。
2. 快速启动：说明一键启动脚本 start.sh，以及手动启动后端、三个微信小程序、Manager Web 后台的步骤。注意已废弃的三个 Web 前端。
3. 测试账号：列出 4 个基础测试账号（客户/商家/骑手/管理员）。
4. API 调试示例：给出登录和创建订单的 curl 示例。
5. 常用命令：后端（迁移、测试、覆盖率、shell、check）、前端（dev/build/lint）。
6. 项目规范：接口响应格式、错误码约定（0/1xxx/2xxx/3xxx/4xxx/5xxx/6xxx/9xxx）、Git 提交规范（feat/fix/docs/refactor/test/chore）。
7. 常见问题：端口占用、uv 安装、前端类型错误、数据库重置、小程序登录失败/请求无响应、小程序依赖冲突等。
8. 相关文档：链接 API 文档、部署文档、测试文档。

要求：使用中文，命令可直接复制执行，不添加 emoji。
```

---

## 10. 测试文档（docs/TESTING.md）

```text
你正在为 ELM 外卖平台撰写测试文档。项目使用 Django 内置 TestCase + DRF APIClient，共 58 个用例，通过率 100%。

请按以下结构生成 Markdown 文档：
1. 概况：测试用例总数、通过率、测试框架、测试数据库。
2. 按模块统计：accounts/merchants/products/orders/addresses/riders/reviews/admin_panel/uploads 等模块的用例数及覆盖内容。
3. 运行测试：全部测试、指定模块、详细输出、保留测试数据库、脚本方式等命令。
4. 测试覆盖率：coverage 安装和运行命令。
5. 核心测试用例说明：重点说明订单模块、商品模块、权限测试的关键用例及其验证点。
6. 已知限制：并发测试差异、WebSocket 无测试、支付/通知无集成测试、客户端无自动化测试。
7. 测试编写规范：给出 XxxAPITestCase 模板，说明 setUp 独立创建数据、不依赖种子数据或执行顺序。

要求：使用中文，命令可直接复制执行，不添加 emoji。
```

---

## 11. 测试账号与 Mock 数据说明（docs/TEST_ACCOUNTS.md）

```text
你正在为 ELM 外卖平台撰写测试账号与 Mock 数据说明文档。

请按以下结构生成 Markdown 文档：
1. 初始化数据命令：init_data 和 add_more_data 的作用、执行方式、Docker 环境执行方式。
2. 基础测试账号：4 个核心账号（客户/商家/骑手/管理员）的手机号、密码、说明、登录入口。
3. 扩充测试账号：
   - 10 个额外客户（用户名/手机号/密码/备注）
   - 20 个商家账号（店铺名/手机号/密码/分类/起送价/配送费）
   - 10 个骑手账号（姓名/手机号/密码/配送站/累计订单/评分）
4. Mock 数据概况：init_data + add_more_data 后的客户/商家/商品/骑手/订单/评价/优惠券数量，以及订单状态分布。
5. 快速体验场景：客户下单流程、商家接单流程、骑手配送流程、管理员后台四个场景的步骤说明。
6. 数据重置：手动部署和 Docker 环境下清空并重新初始化数据的命令。
7. 注意事项：密码统一规则、商家状态默认、订单时间戳、优惠券、评价等说明。

要求：使用中文，数据表格完整，命令可直接复制执行，不添加 emoji。
```
---
