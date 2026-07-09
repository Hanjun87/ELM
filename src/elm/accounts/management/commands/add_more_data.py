from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, datetime
from accounts.models import User, Role, UserRole
from merchants.models import Merchant
from riders.models import Rider
from products.models import Category, Product
from orders.models import Order
from addresses.models import Address
from promotions.models import Coupon, UserCoupon
from reviews.models import Review
import random


class Command(BaseCommand):
    help = '添加更多测试数据（30+ 商家、30+ 用户、15+ 骑手、大量历史订单）'

    def handle(self, *args, **kwargs):
        # Windows 控制台默认 GBK，无法输出 ✓/emoji，这里强制 stdout 用 UTF-8
        try:
            self.stdout._out.reconfigure(encoding='utf-8')
        except Exception:
            pass
        self.stdout.write('开始添加更多测试数据...')

        # 获取现有数据
        customer_role = Role.objects.get(name='customer')
        merchant_role = Role.objects.get(name='merchant')
        rider_role = Role.objects.get(name='rider')

        existing_customer = User.objects.get(phone='13800000001')
        existing_merchant_obj = Merchant.objects.first()

        # 1. 创建更多客户（30个额外客户）
        customers = [existing_customer]
        customer_names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑一', '陈二',
                         '刘明', '黄丽', '杨洋', '朱雯', '徐波', '孙悦', '马超', '许晴', '韩梅', '冯强',
                         '邓华', '曹敏', '彭涛', '蒋丹', '余凯', '潘婷', '贺军', '龚雪', '唐鹏', '汤莉']
        for i in range(30):
            phone = f'138000010{str(i+10).zfill(2)}'
            user, created = User.objects.get_or_create(
                phone=phone,
                defaults={'email': f'customer{i+10}@example.com'}
            )
            if created:
                user.set_password('customer')
                user.save()
                UserRole.objects.get_or_create(user=user, role=customer_role)
                if i < 10:
                    self.stdout.write(f'  创建客户: {customer_names[i]} ({phone})')
            customers.append(user)
        self.stdout.write(self.style.SUCCESS(f'✓ 共有 {len(customers)} 个客户'))

        # 2. 创建30+个商家
        merchants_data = [
            ('肯德基 (万象城店)', '快餐', '朝阳区建外大街1号', 20.0, 6.0, 4.7, 2980),
            ('喜茶 (三里屯店)', '饮品', '朝阳区三里屯路11号', 0, 8.0, 4.9, 4100),
            ('海底捞 (国贸店)', '火锅', '朝阳区建外大街1号国贸商城', 50.0, 0, 4.8, 3560),
            ('必胜客 (王府井店)', '西餐', '东城区王府井大街138号', 30.0, 5.0, 4.6, 2200),
            ('瑞幸咖啡 (望京店)', '咖啡', '朝阳区望京街10号', 0, 4.0, 4.5, 5200),
            ('麦当劳 (西单店)', '快餐', '西城区西单北大街', 18.0, 5.0, 4.6, 3850),
            ('星巴克 (金融街店)', '咖啡', '西城区金融大街35号', 0, 6.0, 4.7, 4400),
            ('和合谷 (中关村店)', '中式快餐', '海淀区中关村大街1号', 15.0, 4.0, 4.4, 1980),
            ('永和大王 (亦庄店)', '早餐', '大兴区亦庄经济开发区', 10.0, 3.0, 4.3, 1760),
            ('吉野家 (双井店)', '日料', '朝阳区双井桥西', 18.0, 4.0, 4.5, 2120),
            ('真功夫 (建国门店)', '中式快餐', '东城区建国门内大街', 15.0, 4.0, 4.4, 1890),
            ('汉堡王 (三里屯店)', '快餐', '朝阳区三里屯路19号', 25.0, 6.0, 4.5, 2050),
            ('必品阁 (大望路店)', '韩餐', '朝阳区大望路SOHO', 35.0, 5.0, 4.6, 1720),
            ('西贝莜面村 (朝阳大悦城)', '西北菜', '朝阳区朝阳北路青年路', 60.0, 0, 4.8, 2340),
            ('外婆家 (双井店)', '江浙菜', '朝阳区双井富力城', 40.0, 5.0, 4.7, 1980),
            ('南京大牌档 (西单)', '江苏菜', '西城区西单北大街', 45.0, 0, 4.8, 2120),
            ('云海肴 (国贸店)', '云南菜', '朝阳区国贸商城', 50.0, 0, 4.7, 1890),
            ('绿茶餐厅 (世贸天阶)', '杭帮菜', '朝阳区光华路9号', 40.0, 5.0, 4.6, 2050),
            ('小南国 (金融街)', '上海菜', '西城区金融街', 60.0, 0, 4.8, 1980),
            ('新白鹿餐厅 (望京)', '江浙菜', '朝阳区望京西路', 35.0, 5.0, 4.5, 1760),
            ('蜜雪冰城 (五道口店)', '饮品', '海淀区五道口', 0, 3.0, 4.4, 6200),
            ('华莱士 (上地店)', '快餐', '海淀区上地信息路', 15.0, 4.0, 4.3, 2650),
            ('德克士 (回龙观店)', '快餐', '昌平区回龙观', 20.0, 5.0, 4.4, 1980),
            ('老乡鸡 (宣武门店)', '中式快餐', '西城区宣武门', 18.0, 4.0, 4.5, 2340),
            ('沙县小吃 (东直门店)', '小吃', '东城区东直门', 10.0, 3.0, 4.2, 3120),
            ('兰州拉面 (三元桥店)', '面食', '朝阳区三元桥', 12.0, 3.0, 4.3, 2890),
            ('黄焖鸡米饭 (十里河店)', '盖饭', '朝阳区十里河', 15.0, 4.0, 4.4, 2560),
            ('沪上阿姨 (清河店)', '饮品', '海淀区清河', 0, 4.0, 4.6, 4780),
            ('茶百道 (五棵松店)', '饮品', '海淀区五棵松', 0, 4.0, 4.5, 4320),
            ('书亦烧仙草 (西二旗店)', '饮品', '海淀区西二旗', 0, 3.0, 4.4, 5100),
        ]

        merchants = [existing_merchant_obj]
        for i, (store_name, cuisine, address, min_order, delivery_fee, rating, monthly_sales) in enumerate(merchants_data, start=2):
            phone_num = f'138000020{str(i).zfill(2)}'
            user, created = User.objects.get_or_create(
                phone=phone_num,
                defaults={'email': f'merchant{i}@example.com'}
            )
            if created:
                user.set_password('merchant')
                user.save()
                UserRole.objects.get_or_create(user=user, role=merchant_role)

            merchant, created = Merchant.objects.get_or_create(
                user=user,
                defaults={
                    'store_name': store_name,
                    'logo': f'https://images.unsplash.com/photo-{random.randint(1500000000000, 1600000000000)}?auto=format&fit=crop&q=80&w=200',
                    'phone': phone_num,
                    'address': address,
                    'min_order': min_order,
                    'delivery_fee': delivery_fee,
                    'rating': rating,
                    'monthly_sales': monthly_sales,
                    'status': 'open'
                }
            )
            if created and i <= 5:
                self.stdout.write(f'  创建商家: {store_name}')
            merchants.append(merchant)

        self.stdout.write(self.style.SUCCESS(f'✓ 共有 {len(merchants)} 个商家'))

        # 3. 为每个商家创建4-8个商品
        categories = list(Category.objects.all())

        product_templates = [
            ('招牌套餐', '主食', lambda: round(random.uniform(25, 45), 1), lambda: 100, lambda: random.randint(800, 2500)),
            ('精选小食', '小食', lambda: round(random.uniform(8, 18), 1), lambda: 200, lambda: random.randint(500, 1800)),
            ('特色饮品', '饮品', lambda: round(random.uniform(10, 28), 1), lambda: 150, lambda: random.randint(600, 3000)),
            ('热销爆款', '主食', lambda: round(random.uniform(18, 38), 1), lambda: 80, lambda: random.randint(1000, 3200)),
            ('甜品点心', '甜点', lambda: round(random.uniform(6, 15), 1), lambda: 300, lambda: random.randint(400, 1200)),
            ('限时特惠', '小食', lambda: round(random.uniform(12, 22), 1), lambda: 120, lambda: random.randint(700, 1800)),
            ('经典美食', '主食', lambda: round(random.uniform(20, 35), 1), lambda: 90, lambda: random.randint(900, 2200)),
            ('人气推荐', '热销', lambda: round(random.uniform(15, 30), 1), lambda: 110, lambda: random.randint(1200, 2800)),
        ]

        total_products = 0
        for merchant in merchants:
            num_products = random.randint(4, 8)
            for j in range(num_products):
                tpl = random.choice(product_templates)
                name = f'{tpl[0]}{j+1}'
                cat_name = tpl[1]
                price = tpl[2]()
                stock = tpl[3]()
                sales = tpl[4]()

                category = next((c for c in categories if c.name == cat_name), None)
                orig_price = round(price * random.uniform(1.1, 1.3), 1) if random.random() > 0.5 else None

                Product.objects.get_or_create(
                    merchant=merchant,
                    name=name,
                    defaults={
                        'category': category,
                        'description': f'{merchant.store_name} {name}，精选食材制作',
                        'image': f'https://images.unsplash.com/photo-{random.randint(1500000000000, 1600000000000)}?auto=format&fit=crop&q=80&w=200',
                        'price': price,
                        'original_price': orig_price,
                        'stock': stock,
                        'status': 'on',
                        'sales_count': sales,
                        'rating': round(random.uniform(4.5, 5.0), 2),
                    }
                )
                total_products += 1

        self.stdout.write(self.style.SUCCESS(f'✓ 共有 {total_products} 个商品'))

        # 4. 创建15+个骑手
        riders_data = [
            ('李师傅', '13900001001', '中关村配送站', 456.8, 2240, 4.98),
            ('张师傅', '13900001002', '国贸配送站', 612.5, 2980, 4.97),
            ('刘师傅', '13900001003', '三里屯配送站', 398.3, 1920, 4.95),
            ('陈师傅', '13900001004', '望京配送站', 589.6, 2750, 4.99),
            ('王师傅', '13900001005', '西单配送站', 745.2, 3320, 4.96),
            ('赵师傅', '13900001006', '双井配送站', 478.9, 2290, 4.98),
            ('周师傅', '13900001007', '亦庄配送站', 389.4, 1880, 4.94),
            ('吴师傅', '13900001008', '金融街配送站', 621.7, 2910, 4.97),
            ('郑师傅', '13900001009', '大望路配送站', 567.3, 2640, 4.95),
            ('孙师傅', '13900001010', '朝阳大悦城配送站', 698.5, 3180, 4.96),
            ('林师傅', '13900001011', '五道口配送站', 512.3, 2450, 4.97),
            ('何师傅', '13900001012', '上地配送站', 434.7, 2120, 4.94),
            ('罗师傅', '13900001013', '回龙观配送站', 378.9, 1850, 4.93),
            ('梁师傅', '13900001014', '宣武门配送站', 556.4, 2680, 4.96),
            ('高师傅', '13900001015', '东直门配送站', 623.1, 2950, 4.98),
        ]

        riders = []
        for i, (name, phone, station, balance, orders, rating) in enumerate(riders_data, start=2):
            user_phone = f'138000030{str(i).zfill(2)}'
            user, created = User.objects.get_or_create(
                phone=user_phone,
                defaults={'email': f'rider{i}@example.com'}
            )
            if created:
                user.set_password('rider')
                user.save()
                UserRole.objects.get_or_create(user=user, role=rider_role)

            rider, created = Rider.objects.get_or_create(
                user=user,
                defaults={
                    'real_name': name,
                    'phone': phone,
                    'station': station,
                    'work_status': random.choice(['idle', 'busy', 'delivering']),
                    'balance': balance,
                    'total_orders': orders,
                    'rating': rating,
                }
            )
            if created and i <= 5:
                self.stdout.write(f'  创建骑手: {name} ({station})')
            riders.append(rider)

        riders_count = Rider.objects.count()
        self.stdout.write(self.style.SUCCESS(f'✓ 共有 {riders_count} 个骑手'))

        # 5. 创建大量历史订单（模拟真实运营数据）
        all_merchants = list(Merchant.objects.all())
        all_riders = list(Rider.objects.all())

        # 订单状态配置：(状态, 创建时间偏移天数, 支付偏移分钟, 接单偏移, 出餐偏移, 取餐偏移, 送达偏移)
        # 生成最近30天的历史订单
        statuses_config = [
            ('finished', 0, 0, 2, 8, 10, 25),      # 已完成订单
            ('delivered', 0, 0, 3, 10, 12, 0),     # 刚送达
            ('picked', 0, 0, 2, 8, 10, None),      # 配送中
            ('ready', 0, 0, 3, 10, None, None),    # 待取餐
            ('preparing', 0, 0, 2, None, None, None),  # 准备中
            ('accepted', 0, 0, 2, None, None, None),   # 已接单
            ('paid', 0, 0, None, None, None, None),     # 待接单
        ]

        order_counter = Order.objects.count() + 1
        created_orders = 0

        # 为前20个客户生成历史订单
        for customer in customers[:20]:
            # 每个客户生成5-15个历史订单
            num_orders = random.randint(5, 15)

            for _ in range(num_orders):
                # 随机选择最近30天内的某一天
                days_ago = random.randint(0, 30)
                hour = random.randint(8, 22)
                minute = random.randint(0, 59)

                # 根据天数决定订单状态权重（越早的订单越可能完成）
                if days_ago > 7:
                    # 7天前的订单，90%已完成
                    status_choice = random.choices(
                        ['finished', 'delivered'],
                        weights=[9, 1]
                    )[0]
                elif days_ago > 2:
                    # 2-7天前，80%已完成
                    status_choice = random.choices(
                        ['finished', 'delivered', 'picked'],
                        weights=[8, 1, 1]
                    )[0]
                elif days_ago > 0:
                    # 1-2天前，50%已完成
                    status_choice = random.choices(
                        ['finished', 'delivered', 'picked', 'ready'],
                        weights=[5, 2, 2, 1]
                    )[0]
                else:
                    # 今天的订单，各种状态都有
                    status_choice = random.choice(['finished', 'delivered', 'picked', 'ready', 'preparing', 'accepted', 'paid'])

                status_data = next(s for s in statuses_config if s[0] == status_choice)
                status, _, paid_min, accept_min, prepare_min, pick_min, deliver_min = status_data

                merchant = random.choice(all_merchants)
                rider = random.choice(all_riders) if status in ['picked', 'delivered', 'finished'] else None

                products = list(Product.objects.filter(merchant=merchant, status='on'))
                if not products:
                    continue

                selected_products = random.sample(products, min(random.randint(1, 3), len(products)))
                items_snapshot = [
                    {
                        'product_id': p.id,
                        'name': p.name,
                        'price': float(p.price),
                        'quantity': random.randint(1, 3)
                    }
                    for p in selected_products
                ]
                total = sum(item['price'] * item['quantity'] for item in items_snapshot)

                # 基准时间：days_ago天前的hour:minute
                base_time = timezone.now() - timedelta(days=days_ago, hours=(23-hour), minutes=(59-minute))

                order_no = f'OD{base_time.strftime("%Y%m%d%H%M%S")}{str(order_counter).zfill(4)}'
                order_counter += 1

                Order.objects.get_or_create(
                    order_no=order_no,
                    defaults={
                        'customer': customer,
                        'merchant': merchant,
                        'rider': rider,
                        'address_snapshot': {
                            'name': f'用户{customer.id}',
                            'phone': customer.phone,
                            'address': f'{merchant.address.split("区")[0]}区测试地址{random.randint(1, 100)}号'
                        },
                        'items_snapshot': items_snapshot,
                        'total_amount': total,
                        'delivery_fee': float(merchant.delivery_fee),
                        'paid_amount': total + float(merchant.delivery_fee),
                        'status': status,
                        'note': random.choice(['', '不要辣', '多点醋', '尽快送达', '到了打电话', '少盐', '不要香菜', '备用餐具']),
                        'created_at': base_time,
                        'paid_at': base_time + timedelta(minutes=paid_min) if paid_min is not None else None,
                        'accepted_at': base_time + timedelta(minutes=accept_min) if accept_min is not None else None,
                        'prepared_at': base_time + timedelta(minutes=prepare_min) if prepare_min is not None else None,
                        'picked_at': base_time + timedelta(minutes=pick_min) if pick_min is not None else None,
                        'delivered_at': base_time + timedelta(minutes=deliver_min) if deliver_min is not None else None,
                    }
                )
                created_orders += 1

        orders_count = Order.objects.count()
        self.stdout.write(self.style.SUCCESS(f'✓ 新增 {created_orders} 个订单，共有 {orders_count} 个订单'))

        # 6. 为已完成订单创建评价
        finished_orders = Order.objects.filter(status__in=['delivered', 'finished']).order_by('?')[:int(orders_count * 0.6)]
        comments = [
            '味道不错，配送很快！',
            '很好吃，下次还会再来',
            '包装很好，食物新鲜',
            '送餐速度超快，点赞',
            '老顾客了，一如既往的好',
            '性价比很高，推荐',
            '分量足，味道正宗',
            '骑手服务态度很好',
            '第一次点这家，味道很棒',
            '环境卫生，食材新鲜',
            '配送小哥很辛苦，赞一个',
            '非常满意，已加入收藏',
            '物超所值，强烈推荐',
            '菜品丰富，选择多',
            '下次还来，支持一下',
        ]

        reviews_created = 0
        for order in finished_orders:
            review, created = Review.objects.get_or_create(
                order=order,
                defaults={
                    'customer': order.customer,
                    'merchant': order.merchant,
                    'rating': random.randint(4, 5),
                    'content': random.choice(comments),
                }
            )
            if created:
                reviews_created += 1

        reviews_count = Review.objects.count()
        self.stdout.write(self.style.SUCCESS(f'✓ 新增 {reviews_created} 条评价，共有 {reviews_count} 条评价'))

        # 7. 创建优惠券
        coupons_data = [
            ('满50减10', 10.0, 50.0),
            ('满30减5', 5.0, 30.0),
            ('满100减20', 20.0, 100.0),
            ('新人专享立减8元', 8.0, 0),
            ('周末特惠满80减15', 15.0, 80.0),
            ('满60减12', 12.0, 60.0),
            ('满200减40', 40.0, 200.0),
            ('会员专享满40减8', 8.0, 40.0),
        ]

        for name, amount, min_spend in coupons_data:
            coupon, _ = Coupon.objects.get_or_create(
                name=name,
                defaults={
                    'merchant': random.choice(all_merchants) if random.random() > 0.5 else None,
                    'discount_amount': amount,
                    'min_spend': min_spend,
                    'valid_until': timezone.now() + timedelta(days=30),
                    'is_active': True,
                }
            )
            # 为部分客户发放优惠券
            for customer in random.sample(customers, min(8, len(customers))):
                UserCoupon.objects.get_or_create(
                    user=customer,
                    coupon=coupon,
                    defaults={'status': random.choice(['unused', 'unused', 'unused', 'used'])}
                )

        coupons_count = Coupon.objects.count()
        self.stdout.write(self.style.SUCCESS(f'✓ 共有 {coupons_count} 张优惠券'))

        # 最终统计
        self.stdout.write(self.style.SUCCESS('\n========================================'))
        self.stdout.write(self.style.SUCCESS('Mock 数据添加完成！'))
        self.stdout.write(self.style.SUCCESS('========================================'))
        self.stdout.write(f'\n📊 数据统计:')
        self.stdout.write(f'  👤 客户: {User.objects.filter(user_roles__role__name="customer").distinct().count()} 个')
        self.stdout.write(f'  🏪 商家: {Merchant.objects.count()} 个')
        self.stdout.write(f'  📦 商品: {Product.objects.count()} 个')
        self.stdout.write(f'  🛵 骑手: {Rider.objects.count()} 个')
        self.stdout.write(f'  📋 订单: {Order.objects.count()} 个')
        self.stdout.write(f'  ⭐ 评价: {Review.objects.count()} 条')
        self.stdout.write(f'  🎫 优惠券: {Coupon.objects.count()} 张')
        self.stdout.write('========================================\n')
