from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
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
    help = '添加更多测试数据（20+ 商家、10+ 用户、10+ 骑手）'

    def handle(self, *args, **kwargs):
        self.stdout.write('开始添加更多测试数据...')

        # 获取现有数据
        customer_role = Role.objects.get(name='customer')
        merchant_role = Role.objects.get(name='merchant')
        rider_role = Role.objects.get(name='rider')

        existing_customer = User.objects.get(phone='13800001000')
        existing_merchant_obj = Merchant.objects.first()

        # 1. 创建更多客户（10个额外客户）
        customers = [existing_customer]
        customer_names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑一', '陈二']
        for i in range(10):
            phone = f'138000010{str(i+10).zfill(2)}'
            user, created = User.objects.get_or_create(
                phone=phone,
                defaults={'email': f'customer{i+10}@example.com'}
            )
            if created:
                user.set_password('customer')
                user.save()
                UserRole.objects.get_or_create(user=user, role=customer_role)
                self.stdout.write(f'  创建客户: {customer_names[i]} ({phone})')
            customers.append(user)
        self.stdout.write(self.style.SUCCESS(f'✓ 共有 {len(customers)} 个客户'))

        # 2. 创建20+个商家
        merchants_data = [
            ('肯德基 (万象城店)', '快餐', '朝阳区建外大街1号', 20.0, 6.0, 4.7, 980),
            ('喜茶 (三里屯店)', '饮品', '朝阳区三里屯路11号', 0, 8.0, 4.9, 2100),
            ('海底捞 (国贸店)', '火锅', '朝阳区建外大街1号国贸商城', 50.0, 0, 4.8, 1560),
            ('必胜客 (王府井店)', '西餐', '东城区王府井大街138号', 30.0, 5.0, 4.6, 1200),
            ('瑞幸咖啡 (望京店)', '咖啡', '朝阳区望京街10号', 0, 4.0, 4.5, 3200),
            ('麦当劳 (西单店)', '快餐', '西城区西单北大街', 18.0, 5.0, 4.6, 1850),
            ('星巴克 (金融街店)', '咖啡', '西城区金融大街35号', 0, 6.0, 4.7, 2400),
            ('和合谷 (中关村店)', '中式快餐', '海淀区中关村大街1号', 15.0, 4.0, 4.4, 980),
            ('永和大王 (亦庄店)', '早餐', '大兴区亦庄经济开发区', 10.0, 3.0, 4.3, 760),
            ('吉野家 (双井店)', '日料', '朝阳区双井桥西', 18.0, 4.0, 4.5, 1120),
            ('真功夫 (建国门店)', '中式快餐', '东城区建国门内大街', 15.0, 4.0, 4.4, 890),
            ('汉堡王 (三里屯店)', '快餐', '朝阳区三里屯路19号', 25.0, 6.0, 4.5, 1050),
            ('必品阁 (大望路店)', '韩餐', '朝阳区大望路SOHO', 35.0, 5.0, 4.6, 720),
            ('西贝莜面村 (朝阳大悦城)', '西北菜', '朝阳区朝阳北路青年路', 60.0, 0, 4.8, 1340),
            ('外婆家 (双井店)', '江浙菜', '朝阳区双井富力城', 40.0, 5.0, 4.7, 980),
            ('南京大牌档 (西单)', '江苏菜', '西城区西单北大街', 45.0, 0, 4.8, 1120),
            ('云海肴 (国贸店)', '云南菜', '朝阳区国贸商城', 50.0, 0, 4.7, 890),
            ('绿茶餐厅 (世贸天阶)', '杭帮菜', '朝阳区光华路9号', 40.0, 5.0, 4.6, 1050),
            ('小南国 (金融街)', '上海菜', '西城区金融街', 60.0, 0, 4.8, 980),
            ('新白鹿餐厅 (望京)', '江浙菜', '朝阳区望京西路', 35.0, 5.0, 4.5, 760),
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
            if created:
                self.stdout.write(f'  创建商家: {store_name}')
            merchants.append(merchant)

        self.stdout.write(self.style.SUCCESS(f'✓ 共有 {len(merchants)} 个商家'))

        # 3. 为每个商家创建3-6个商品
        categories = list(Category.objects.all())

        product_templates = [
            ('招牌套餐', '主食', lambda: round(random.uniform(25, 45), 1), lambda: 100, lambda: random.randint(800, 1500)),
            ('精选小食', '小食', lambda: round(random.uniform(8, 18), 1), lambda: 200, lambda: random.randint(500, 1200)),
            ('特色饮品', '饮品', lambda: round(random.uniform(10, 28), 1), lambda: 150, lambda: random.randint(600, 1800)),
            ('热销爆款', '主食', lambda: round(random.uniform(18, 38), 1), lambda: 80, lambda: random.randint(1000, 2000)),
            ('甜品点心', '甜点', lambda: round(random.uniform(6, 15), 1), lambda: 300, lambda: random.randint(400, 900)),
            ('限时特惠', '小食', lambda: round(random.uniform(12, 22), 1), lambda: 120, lambda: random.randint(700, 1300)),
        ]

        total_products = 0
        for merchant in merchants:
            num_products = random.randint(3, 6)
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

        # 4. 创建10+个骑手
        riders_data = [
            ('李师傅', '13900001001', '中关村配送站', 256.8, 1240, 4.98),
            ('张师傅', '13900001002', '国贸配送站', 312.5, 1580, 4.97),
            ('刘师傅', '13900001003', '三里屯配送站', 198.3, 920, 4.95),
            ('陈师傅', '13900001004', '望京配送站', 289.6, 1350, 4.99),
            ('王师傅', '13900001005', '西单配送站', 345.2, 1620, 4.96),
            ('赵师傅', '13900001006', '双井配送站', 278.9, 1290, 4.98),
            ('周师傅', '13900001007', '亦庄配送站', 189.4, 880, 4.94),
            ('吴师傅', '13900001008', '金融街配送站', 321.7, 1510, 4.97),
            ('郑师傅', '13900001009', '大望路配送站', 267.3, 1240, 4.95),
            ('孙师傅', '13900001010', '朝阳大悦城配送站', 298.5, 1380, 4.96),
        ]

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
            if created:
                self.stdout.write(f'  创建骑手: {name} ({station})')

        riders_count = Rider.objects.count()
        self.stdout.write(self.style.SUCCESS(f'✓ 共有 {riders_count} 个骑手'))

        # 5. 创建更多订单（各状态均有）
        all_merchants = list(Merchant.objects.all())
        all_riders = list(Rider.objects.all())

        statuses_config = [
            ('pending', -30, None, None, None, None, None),
            ('paid', -25, -24, None, None, None, None),
            ('accepted', -20, -19, -18, None, None, None),
            ('preparing', -15, -14, -13, None, None, None),
            ('ready', -10, -9, -8, None, None, None),
            ('picked', -5, -4, -3, -3, None, None),
            ('delivered', -2, -1, -1, -1, 0, None),
            ('finished', -1, -1, -1, -1, 0, 0),
        ]

        order_counter = 1
        for customer in customers[:8]:  # 前8个客户有订单
            num_orders = random.randint(2, 5)
            for _ in range(num_orders):
                status_data = random.choice(statuses_config)
                status, created_offset, paid_offset, accepted_offset, prepared_offset, picked_offset, delivered_offset = status_data

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

                order_no = f'OD{timezone.now().strftime("%Y%m%d")}{str(order_counter).zfill(4)}'
                order_counter += 1

                Order.objects.get_or_create(
                    order_no=order_no,
                    defaults={
                        'customer': customer,
                        'merchant': merchant,
                        'rider': rider,
                        'address_snapshot': {
                            'name': f'测试用户{customer.id}',
                            'phone': customer.phone,
                            'address': f'{merchant.address.split("区")[0]}区测试地址{random.randint(1, 100)}号'
                        },
                        'items_snapshot': items_snapshot,
                        'total_amount': total,
                        'delivery_fee': float(merchant.delivery_fee),
                        'paid_amount': total + float(merchant.delivery_fee),
                        'status': status,
                        'note': random.choice(['', '不要辣', '多点醋', '尽快送达', '到了打电话']),
                        'created_at': timezone.now() + timedelta(minutes=created_offset),
                        'paid_at': timezone.now() + timedelta(minutes=paid_offset) if paid_offset else None,
                        'accepted_at': timezone.now() + timedelta(minutes=accepted_offset) if accepted_offset else None,
                        'prepared_at': timezone.now() + timedelta(minutes=prepared_offset) if prepared_offset else None,
                        'picked_at': timezone.now() + timedelta(minutes=picked_offset) if picked_offset else None,
                        'delivered_at': timezone.now() + timedelta(minutes=delivered_offset) if delivered_offset else None,
                    }
                )

        orders_count = Order.objects.count()
        self.stdout.write(self.style.SUCCESS(f'✓ 共有 {orders_count} 个订单'))

        # 6. 创建评价（对已完成订单）
        finished_orders = Order.objects.filter(status__in=['delivered', 'finished'])
        comments = [
            '味道不错，配送很快！',
            '很好吃，下次还会再来',
            '包装很好，食物新鲜',
            '送餐速度超快，点赞',
            '老顾客了，一如既往的好',
            '性价比很高，推荐',
            '分量足，味道正宗',
            '骑手服务态度很好',
        ]

        for order in finished_orders[:15]:
            Review.objects.get_or_create(
                order=order,
                defaults={
                    'customer': order.customer,
                    'merchant': order.merchant,
                    'rating': random.randint(4, 5),
                    'content': random.choice(comments),
                }
            )

        reviews_count = Review.objects.count()
        self.stdout.write(self.style.SUCCESS(f'✓ 共有 {reviews_count} 条评价'))

        # 7. 创建优惠券
        coupons_data = [
            ('满50减10', 10.0, 50.0),
            ('满30减5', 5.0, 30.0),
            ('满100减20', 20.0, 100.0),
            ('新人专享立减8元', 8.0, 0),
            ('周末特惠满80减15', 15.0, 80.0),
        ]

        for name, amount, min_spend in coupons_data:
            coupon, _ = Coupon.objects.get_or_create(
                name=name,
                defaults={
                    'merchant': random.choice(all_merchants) if random.random() > 0.6 else None,
                    'discount_amount': amount,
                    'min_spend': min_spend,
                    'valid_until': timezone.now() + timedelta(days=30),
                    'is_active': True,
                }
            )
            # 为部分客户发放优惠券
            for customer in random.sample(customers, min(5, len(customers))):
                UserCoupon.objects.get_or_create(
                    user=customer,
                    coupon=coupon,
                    defaults={'status': random.choice(['unused', 'unused', 'used'])}
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
