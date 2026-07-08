#!/usr/bin/env python
"""
测试运行脚本
运行所有测试: python runtests.py
运行特定模块: python runtests.py accounts
"""
import sys
import django
from django.conf import settings
from django.test.utils import get_runner

if __name__ == "__main__":
    # 配置 Django
    import os
    os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
    django.setup()
    
    # 运行测试
    TestRunner = get_runner(settings)
    test_runner = TestRunner(verbosity=2, interactive=True, keepdb=False)
    
    # 指定测试模块（如果提供）
    if len(sys.argv) > 1:
        test_labels = sys.argv[1:]
    else:
        test_labels = ['accounts', 'merchants', 'products', 'orders', 'addresses',
                        'riders', 'reviews', 'admin_panel', 'uploads']
    
    failures = test_runner.run_tests(test_labels)
    
    sys.exit(bool(failures))
