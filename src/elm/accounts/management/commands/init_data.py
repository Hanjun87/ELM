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
import json


class Command(BaseCommand):
    help = '初始化测试数据'

    def handle(self, *args, **kwargs):
        # Windows 控制台默认 GBK，无法输出 ✓/emoji，这里强制 stdout 用 UTF-8
        try:
            self.stdout._out.reconfigure(encoding='utf-8')
        except Exception:
            pass
        self.stdout.write('开始初始化数据...')

        # 1. 创建角色
        roles = {
            'customer': Role.objects.get_or_create(
                name='customer',
                defaults={'display_name': '客户', 'permissions': ['view_products', 'create_order']}
            )[0],
            'merchant': Role.objects.get_or_create(
                name='merchant',
                defaults={'display_name': '商家', 'permissions': ['manage_store', 'manage_products']}
            )[0],
            'rider': Role.objects.get_or_create(
                name='rider',
                defaults={'display_name': '骑手', 'permissions': ['view_orders', 'update_delivery_status']}
            )[0],
            'admin': Role.objects.get_or_create(
                name='admin',
                defaults={'display_name': '管理员', 'permissions': ['*']}
            )[0],
        }
        self.stdout.write(self.style.SUCCESS('✓ 角色创建完成'))

        # 2. 创建默认用户
        users = {}
        for role_name, password in [('customer', 'customer'), ('merchant', 'merchant'), 
                                      ('rider', 'rider'), ('manager', 'manager')]:
            phone = f'1380000{["customer", "merchant", "rider", "manager"].index(role_name) + 1:04d}'
            user, created = User.objects.get_or_create(
                phone=phone,
                defaults={'email': f'{role_name}@example.com'}
            )
            if created:
                user.set_password(password)
                user.save()
                # 分配角色 (manager 使用 admin 角色)
                role = roles['admin'] if role_name == 'manager' else roles[role_name]
                UserRole.objects.get_or_create(user=user, role=role)
            users[role_name] = user
            self.stdout.write(self.style.SUCCESS(f'✓ 用户创建: {phone}/{password}'))

        # 3. 创建商家
        merchant_user = users['merchant']
        merchant, created = Merchant.objects.get_or_create(
            user=merchant_user,
            defaults={
                'store_name': '麦当劳 (国贸商城店)',
                'logo': 'https://images.unsplash.com/photo-1626082895617-2c6bafdf6b29?auto=format&fit=crop&q=80&w=200',
                'phone': '021-12345678',
                'address': '浦东新区建国门外大街1号',
                'min_order': 15.0,
                'delivery_fee': 5.0,
                'status': 'open',
                'rating': 4.8,
                'monthly_sales': 1520
            }
        )
        self.stdout.write(self.style.SUCCESS('✓ 商家创建完成'))

        # 4. 创建分类
        categories_data = [
            ('主食', 'soup', 1),
            ('小食', 'utensils', 2),
            ('饮品', 'coffee', 3),
            ('甜点', 'icecream', 4),
            ('热销', 'flame', 0),
        ]
        categories = {}
        for name, icon, order in categories_data:
            cat, _ = Category.objects.get_or_create(
                name=name,
                defaults={'icon': icon, 'sort_order': order}
            )
            categories[name] = cat
        self.stdout.write(self.style.SUCCESS('✓ 分类创建完成'))

        # 5. 创建商品
        products_data = [
            {
                'name': '招牌红烧牛肉面',
                'category': '主食',
                'description': '精选牛肉，汤底浓郁',
                'image': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=200',
                'price': 28.0,
                'original_price': 32.0,
                'stock': 999,
                'status': 'on',
                'sales_count': 1200,
                'rating': 4.9,
            },
            {
                'name': '香酥大鸡排',
                'category': '小食',
                'description': '外酥里嫩，分量十足',
                'image': 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&q=80&w=200',
                'price': 15.0,
                'stock': 50,
                'status': 'on',
                'sales_count': 800,
                'rating': 4.7,
            },
            {
                'name': '冰镇手打柠檬茶',
                'category': '饮品',
                'description': '新鲜柠檬，清爽解暑',
                'image': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=200',
                'price': 12.0,
                'stock': 100,
                'status': 'on',
                'sales_count': 500,
                'rating': 4.8,
            },
            {
                'name': '经典和牛汉堡套餐',
                'category': '主食',
                'description': '和牛肉饼+薯条+可乐',
                'image': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=200',
                'price': 58.0,
                'original_price': 68.0,
                'stock': 30,
                'status': 'on',
                'sales_count': 350,
                'rating': 4.9,
            },
        ]
        
        for prod_data in products_data:
            category_name = prod_data.pop('category')
            Product.objects.get_or_create(
                merchant=merchant,
                name=prod_data['name'],
                defaults={**prod_data, 'category': categories.get(category_name)}
            )
        self.stdout.write(self.style.SUCCESS(f'✓ {len(products_data)} 个商品创建完成'))

        # 6. 创建骑手
        rider_user = users['rider']
        rider, created = Rider.objects.get_or_create(
            user=rider_user,
            defaults={
                'real_name': '王师傅',
                'phone': '13900001234',
                'station': '中关村配送站',
                'work_status': 'idle',
                'balance': 186.5,
                'total_orders': 820,
                'rating': 4.99,
            }
        )
        self.stdout.write(self.style.SUCCESS('✓ 骑手创建完成'))

        # 7. 创建地址
        customer_user = users['customer']
        addresses_data = [
            {'tag': '家', 'contact_name': '张三', 'contact_phone': '13800138000', 
             'address': '浦东新区 花园小区 3-201', 'is_default': True},
            {'tag': '公司', 'contact_name': '张三', 'contact_phone': '13800138000', 
             'address': '科技园区 A座 1501', 'is_default': False},
        ]
        for addr_data in addresses_data:
            Address.objects.get_or_create(
                user=customer_user,
                address=addr_data['address'],
                defaults=addr_data
            )
        self.stdout.write(self.style.SUCCESS('✓ 地址创建完成'))

        # 8. 创建订单
        products = Product.objects.filter(merchant=merchant)[:2]
        if products:
            order, created = Order.objects.get_or_create(
                order_no='OD20260706001',
                defaults={
                    'customer': customer_user,
                    'merchant': merchant,
                    'rider': rider,
                    'address_snapshot': {
                        'contact_name': '张三',
                        'phone': '13800138000',
                        'address': '浦东新区 花园小区 3-201'
                    },
                    'items_snapshot': [
                        {'name': products[0].name, 'price': float(products[0].price), 'quantity': 2},
                        {'name': products[1].name if len(products) > 1 else 'Item', 'price': float(products[1].price if len(products) > 1 else 15), 'quantity': 1},
                    ],
                    'total_amount': 71.0,
                    'delivery_fee': 5.0,
                    'paid_amount': 76.0,
                    'status': 'picked',
                    'paid_at': timezone.now() - timedelta(hours=1),
                    'accepted_at': timezone.now() - timedelta(minutes=50),
                    'picked_at': timezone.now() - timedelta(minutes=20),
                }
            )
            self.stdout.write(self.style.SUCCESS('✓ 订单创建完成'))

        # 9. 创建优惠券
        coupon, created = Coupon.objects.get_or_create(
            name='新人5元券',
            defaults={
                'merchant': merchant,
                'discount_amount': 5.0,
                'min_spend': 20.0,
                'valid_until': timezone.now() + timedelta(days=30),
                'is_active': True,
            }
        )
        UserCoupon.objects.get_or_create(
            user=customer_user,
            coupon=coupon,
            defaults={'status': 'unused'}
        )
        self.stdout.write(self.style.SUCCESS('✓ 优惠券创建完成'))

        self.stdout.write(self.style.SUCCESS('\n========================================'))
        self.stdout.write(self.style.SUCCESS('数据初始化完成！'))
        self.stdout.write(self.style.SUCCESS('========================================'))
        self.stdout.write('\n默认账号:')
        self.stdout.write('  客户端: 13800000001/customer')
        self.stdout.write('  商家端: 13800000002/merchant')
        self.stdout.write('  骑手端: 13800000003/rider')
        self.stdout.write('  管理端: 13800000004/manager')
        self.stdout.write('========================================\n')
