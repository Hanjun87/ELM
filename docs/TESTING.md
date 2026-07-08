# ELM 测试文档

## 概况

| 项目 | 数值 |
|------|------|
| 测试用例总数 | 58 |
| 通过率 | 100% |
| 测试框架 | Django 内置 TestCase + DRF APIClient |
| 测试数据库 | 内存 SQLite（测试专用，不污染开发库） |

---

## 按模块统计

| 模块 | 测试用例数 | 覆盖内容 |
|------|-----------|---------|
| accounts | 7 | 注册/登录/角色白名单/JWT |
| merchants | 7 | 商家列表/详情/店铺管理/开关店 |
| products | 10 | 商品CRUD/分类/商家隔离性 |
| orders | 10 | 下单/库存/支付/取消/状态流转 |
| addresses | 5 | 地址CRUD/设默认 |
| riders | 5 | 骑手档案/工作状态 |
| reviews | 5 | 评价创建/回复/防重复 |
| admin_panel | 4 | 权限校验/用户封禁/商家状态 |
| uploads | 3 | 图片上传/类型校验 |
| **合计** | **58** | |

---

## 运行测试

```bash
cd src/elm

# 全部测试
uv run python manage.py test

# 指定模块
uv run python manage.py test accounts orders

# 详细输出
uv run python manage.py test --verbosity=2

# 保留测试数据库（加速重复运行）
uv run python manage.py test --keepdb

# 使用脚本方式（等价于上面，但有固定模块列表）
uv run python runtests.py
```

---

## 测试覆盖率

```bash
uv add coverage
uv run coverage run --source='.' manage.py test
uv run coverage report
uv run coverage html   # 生成 htmlcov/index.html
```

---

## 核心测试用例说明

### 订单模块（最复杂，10 个用例）

- **`test_create_order`**: 验证下单后价格由后端从商品表计算（不信任前端传入价格），库存正确扣减
- **`test_create_order_insufficient_stock`**: 库存不足返回 3004，不创建订单，不扣库存
- **`test_create_order_invalid_quantity`**: quantity <= 0 返回 9001
- **`test_cancel_order_restores_stock`**: 取消已支付订单后，商品库存恢复
- **`test_merchant_reject_restores_stock`**: 商家拒单后，商品库存恢复
- **`test_merchant_prepare_and_ready_order`**: 验证 accepted→preparing→ready 状态流转，`prepared_at` 正确写入

### 商品模块（含数据隔离验证）

- **`test_cannot_modify_other_merchants_product`**: 商家 A 无法通过 `PATCH /merchant/products/<other's_id>/` 修改商家 B 的商品（返回 404，而非 403，避免暴露商品存在性）

### 权限测试

- **`test_dashboard_requires_admin`**: 非管理员访问 `/admin/dashboard/` 返回 403

---

## 已知限制

| 限制 | 说明 |
|------|------|
| 并发测试 | SQLite 测试环境下 `select_for_update()` 行为与 PostgreSQL 生产环境不完全一致，抢单竞态需在生产库人工验证 |
| WebSocket | Channels 已配置但无 Consumer 实现，暂无相关测试 |
| 支付/通知 | `payments`/`notifications` app 无 HTTP 端点，无集成测试 |
| 前端测试 | 四个前端应用目前无自动化测试（仅 `tsc --noEmit` 类型检查），依赖手动验证 |

---

## 测试编写规范

```python
class XxxAPITestCase(TestCase):
    def setUp(self):
        """每个测试方法前独立执行，创建当前用例所需的最小数据"""
        self.client = APIClient()
        self.user = User.objects.create_user(phone='...', password='...')
        self.client.force_authenticate(user=self.user)

    def test_action_expected_result(self):
        """测试描述（中文）"""
        response = self.client.post('/api/v1/xxx/', {...}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['code'], 0)
```

每个 `setUp()` 独立创建数据，不依赖 `init_data` 种子数据或其他测试用例的执行顺序。
