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
    help = '添加更多测试数据'

    def handle(self, *args, **kwargs):
        self.stdout.write('开始添加更多测试数据...')

        # 获取现有数据
        customer_role = Role.objects.get(name='customer')
        merchant_role = Role.objects.get(name='merchant')
        rider_role = Role.objects.get(name='rider')
        
        existing_customer = User.objects.get(phone='13800000001')
        existing_merchant_obj = Merchant.objects.first()

        # 1. 创建更多客户
        customers = [existing_customer]
        for i in range(5, 10):
            phone = f'1380000000{i}'
            user, created = User.objects.get_or_create(
                phone=phone,
                defaults={'email': f'customer{i}@example.com'}
            )
            if created:
                user.set_password('customer')
                user.save()
                UserRole.objects.get_or_create(user=user, role=customer_role)
            customers.append(user)
        self.stdout.write(self.style.SUCCESS(f'✓ 创建了 {len(customers)} 个客户'))

        # 2. 创建更多商家
        merchants_data = [
            {
                'phone': '13800001001',
                'store_name': '肯德基 (万象城店)',
                'logo': 'https://images.unsplash.com/photo-1513639776629-7b1b76b9c43c?auto=format&fit=crop&q=80&w=200',
                'address': '朝阳区建外大街1号',
                'min_order': 20.0,
                'delivery_fee': 6.0,
                'rating': 4.7,
                'monthly_sales': 980,
            },
            {
                'phone': '13800001002',
                'store_name': '喜茶 (三里屯店)',
                'logo': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=200',
                'address': '朝阳区三里屯路11号',
                'min_order': 0,
                'delivery_fee': 8.0,
                'rating': 4.9,
                'monthly_sales': 2100,
            },
            {
                'phone': '13800001003',
                'store_name': '海底捞 (国贸店)',
                'logo': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=200',
                'address': '朝阳区建外大街1号国贸商城',
                'min_order': 50.0,
                'delivery_fee': 0,
                'rating': 4.8,
                'monthly_sales': 1560,
            },
            {
                'phone': '13800001004',
                'store_name': '必胜客 (王府井店)',
                'logo': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=200',
                'address': '东城区王府井大街138号',
                'min_order': 30.0,
                'delivery_fee': 5.0,
                'rating': 4.6,
                'monthly_sales': 1200,
            },
        ]

        merchants = [existing_merchant_obj]
        for i, data in enumerate(merchants_data, start=2):
            user, created = User.objects.get_or_create(
                phone=f'1380000200{i}',
                defaults={'email': f'merchant{i}@example.com'}
            )
            if created:
                user.set_password('merchant')
                user.save()
                UserRole.objects.get_or_create(user=user, role=merchant_role)
            
            merchant, _ = Merchant.objects.get_or_create(
                user=user,
                defaults={**data, 'status': 'open'}
            )
            merchants.append(merchant)
        
        self.stdout.write(self.style.SUCCESS(f'✓ 创建了 {len(merchants)} 个商家'))

        # 3. 为每个商家创建商品
        categories = Category.objects.all()
        
        products_templates = {
            '肯德基': [
                ('香辣鸡腿堡', '小食', 18.0, None, 200, 1500),
                ('原味鸡', '小食', 16.0, 20.0, 150, 1200),
                ('黄金鸡块', '小食', 12.0, None, 300, 800),
                ('蛋挞', '甜点', 6.0, None, 500, 2000),
            ],
            '喜茶': [
                ('多肉葡萄', '饮品', 28.0, None, 100, 1800),
                ('芝士莓莓', '饮品', 32.0, None, 80, 1500),
                ('纯绿妍茶', '饮品', 15.0, None, 150, 900),
                ('波波茶', '饮品', 18.0, None, 120, 700),
            ],
            '海底捞': [
                ('牛油锅底', '主食', 88.0, None, 50, 600),
                ('鸳鸯锅底', '主食', 98.0, None, 40, 550),
                ('毛肚', '小食', 48.0, None, 100, 800),
                ('虾滑', '小食', 38.0, None, 150, 900),
            ],
            '必胜客': [
                ('超级至尊披萨', '主食', 89.0, 109.0, 30, 400),
                ('海鲜披萨', '主食', 79.0, 99.0, 40, 350),
                ('意大利面', '主食', 38.0, None, 60, 500),
                ('烤翅', '小食', 29.0, None, 80, 600),
            ],
        }

        total_products = 0
        for merchant in merchants[1:]:  # 跳过第一个已创建的
            store_base_name = merchant.store_name.split('(')[0].strip()
            if store_base_name in products_templates:
                for name, cat_name, price, orig_price, stock, sales in products_templates[store_base_name]:
                    category = categories.filter(name=cat_name).first()
                    Product.objects.get_or_create(
                        merchant=merchant,
                        name=name,
                        defaults={
                            'category': category,
                            'description': f'{name}，精选食材',
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
        
        self.stdout.write(self.style.SUCCESS(f'✓ 创建了 {total_products} 个新商品'))

        # 4. 创建更多骑手
        riders_data = [
            ('李师傅', '13900001235', '中关村配送站', 256.8, 1240, 4.98),
            ('张师傅', '13900001236', '国贸配送站', 312.5, 1580, 4.97),
            ('刘师傅', '13900001237', '三里屯配送站', 198.3, 920, 4.95),
            ('陈师傅', '13900001238', '望京配送站', 289.6, 1350, 4.99),
        ]

        for i, (name, phone, station, balance, orders, rating) in enumerate(riders_data, start=2):
            user, created = User.objects.get_or_create(
                phone=f'1380000300{i}',
                defaults={'email': f'rider{i}@example.com'}
            )
            if created:
                user.set_password('rider')
                user.save()
                UserRole.objects.get_or_create(user=user, role=rider_role)
            
            Rider.objects.get_or_create(
                user=user,
                defaults={
                    'real_name': name,
                    'phone': phone,
                    'station': station,
                    'work_status': random.choice(['idle', 'busy']),
                    'balance': balance,
                    'total_orders': orders,
                    'rating': rating,
                }
            )
        
        self.stdout.write(self.style.SUCCESS(f'✓ 创建了 {len(riders_data) + 1} 个骑手'))

        # 5. 创建更多订单
        all_merchants = Merchant.objects.all()
        all_riders = Rider.objects.all()
        
        statuses = [
            ('pending', -30, None, None, None, None),
            ('paid', -25, None, None, None, None),
            ('accepted', -20, -18, None, None, None),
            ('preparing', -15, -13, None, None, None),
            ('ready', -10, -8, None, None, None),
            ('picked', -5, -3, -4, None, None),
            ('delivered', -2, -1, -1, 0, None),
            ('finished', -1, 0, 0, 0, 0),
        ]

        for i, customer in enumerate(customers[:5]):
            for j, (status, created_offset, paid_offset, accepted_offset, picked_offset, delivered_offset) in enumerate(statuses):
                merchant = random.choice(all_merchants)
                rider = random.choice(all_riders) if status in ['picked', 'delivered', 'finished'] else None
                
                products = Product.objects.filter(merchant=merchant, status='on')[:2]
                if not products:
                    continue
                
                total = sum(float(p.price) * random.randint(1, 3) for p in products)
                
                order, created = Order.objects.get_or_create(
                    order_no=f'OD202607{str(i).zfill(2)}{str(j).zfill(3)}',
                    defaults={
                        'customer': customer,
                        'merchant': merchant,
                        'rider': rider,
                        'address_snapshot': {
                            'contact_name': '测试用户',
                            'phone': '138****0000',
                            'address': f'测试地址 {i+1}'
                        },
                        'items_snapshot': [
                            {'name': p.name, 'price': float(p.price), 'quantity': random.randint(1, 3)}
                            for p in products
                        ],
                        'total_amount': total,
                        'delivery_fee': float(merchant.delivery_fee),
                        'paid_amount': total + float(merchant.delivery_fee),
                        'status': status,
                        'created_at': timezone.now() + timedelta(minutes=created_offset),
                        'paid_at': timezone.now() + timedelta(minutes=paid_offset) if paid_offset else None,
                        'accepted_at': timezone.now() + timedelta(minutes=accepted_offset) if accepted_offset else None,
                        'picked_at': timezone.now() + timedelta(minutes=picked_offset) if picked_offset else None,
                        'delivered_at': timezone.now() + timedelta(minutes=delivered_offset) if delivered_offset else None,
                    }
                )
        
        orders_count = Order.objects.count()
        self.stdout.write(self.style.SUCCESS(f'✓ 总订单数: {orders_count}'))

        # 6. 创建评价
        finished_orders = Order.objects.filter(status='finished')
        for order in finished_orders[:10]:
            Review.objects.get_or_create(
                order=order,
                defaults={
                    'customer': order.customer,
                    'merchant': order.merchant,
                    'rating': random.randint(4, 5),
                    'content': random.choice([
                        '味道不错，配送很快',
                        '很好吃，下次还会再来',
                        '包装很好，食物新鲜',
                        '送餐速度超快，点赞',
                        '老顾客了，一如既往的好',
                    ]),
                }
            )
        
        reviews_count = Review.objects.count()
        self.stdout.write(self.style.SUCCESS(f'✓ 创建了 {reviews_count} 条评价'))

        # 7. 创建更多优惠券
        coupons_data = [
            ('满50减10', 10.0, 50.0),
            ('满30减5', 5.0, 30.0),
            ('满100减20', 20.0, 100.0),
            ('新人专享8折', 0, 0),
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
            for customer in random.sample(customers, min(3, len(customers))):
                UserCoupon.objects.get_or_create(
                    user=customer,
                    coupon=coupon,
                    defaults={'status': 'unused'}
                )
        
        coupons_count = Coupon.objects.count()
        self.stdout.write(self.style.SUCCESS(f'✓ 创建了 {coupons_count} 张优惠券'))

        self.stdout.write(self.style.SUCCESS('\n========================================'))
        self.stdout.write(self.style.SUCCESS('更多测试数据添加完成！'))
        self.stdout.write(self.style.SUCCESS('========================================'))
        self.stdout.write(f'\n数据统计:')
        self.stdout.write(f'  客户: {User.objects.filter(user_roles__role__name="customer").count()} 个')
        self.stdout.write(f'  商家: {Merchant.objects.count()} 个')
        self.stdout.write(f'  商品: {Product.objects.count()} 个')
        self.stdout.write(f'  骑手: {Rider.objects.count()} 个')
        self.stdout.write(f'  订单: {Order.objects.count()} 个')
        self.stdout.write(f'  评价: {Review.objects.count()} 条')
        self.stdout.write(f'  优惠券: {Coupon.objects.count()} 张')
        self.stdout.write('========================================\n')
