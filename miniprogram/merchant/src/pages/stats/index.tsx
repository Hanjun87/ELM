import { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';

// 移植自 fronted/Merchant/src/components/DataTab.tsx
// TODO(扩展点): 后端暂无经营分析模型（analytics），此页数据为 Mock。
//               待后端提供 /merchant/stats/ 接口后替换 periodData / kpis / topProducts。

const periodData: Record<
  string,
  { revenue: string; orders: number; visitors: number; bars: number[]; orderBars: number[] }
> = {
  day: { revenue: '12,450.00', orders: 328, visitors: 1052, bars: [30, 45, 20, 60, 80, 50, 90], orderBars: [40, 55, 35, 70, 65, 45, 85] },
  week: { revenue: '86,420.00', orders: 2150, visitors: 7240, bars: [55, 68, 42, 80, 95, 72, 60], orderBars: [60, 72, 50, 85, 90, 65, 55] },
  month: { revenue: '352,800.00', orders: 8640, visitors: 28500, bars: [70, 85, 55, 90, 60, 40, 75], orderBars: [65, 80, 60, 95, 55, 50, 70] },
};

const PERIOD_LABELS: Record<string, string> = { day: '日', week: '周', month: '月' };

const kpis = [
  { label: '客单价', val: '¥38.5', ch: '-2.1%', up: false },
  { label: '下单转化率', val: '31.2%', ch: '+1.5%', up: true },
  { label: '复购率', val: '45.8%', ch: '+4.2%', up: true },
  { label: '曝光人数', val: '4,208', ch: '持平', up: true },
  { label: '进店转化率', val: '25.0%', ch: '-0.8%', up: false },
  { label: '退款率', val: '1.2%', ch: '-0.5%', up: true },
];

const topProducts = [
  { name: '招牌卤肉饭套餐', sales: 142, rev: '3,550' },
  { name: '香酥大鸡排', sales: 98, rev: '1,470' },
  { name: '冰镇手打柠檬茶', sales: 85, rev: '1,020' },
  { name: '经典台湾烤肠', sales: 64, rev: '320' },
  { name: '脆皮炸鲜奶', sales: 52, rev: '624' },
];

const HOURS = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

export default function Stats() {
  const [period, setPeriod] = useState('day');
  const [trend, setTrend] = useState('revenue');
  const d = periodData[period];
  const bars = trend === 'revenue' ? d.bars : d.orderBars;

  return (
    <ScrollView scrollY className="w-full min-h-screen bg-[#F5F5F5] p-4">
      {/* 周期切换 */}
      <View className="bg-white rounded-[16px] p-1 flex mb-4">
        {['day', 'week', 'month'].map((p) => (
          <View
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-2 rounded-xl ${period === p ? 'bg-blue-50' : ''}`}
          >
            <Text
              className={`block text-center text-[14px] font-bold ${
                period === p ? 'text-[#0085FF]' : 'text-gray-500'
              }`}
            >
              {PERIOD_LABELS[p]}
            </Text>
          </View>
        ))}
      </View>

      {/* 营业额卡片 */}
      <View className="bg-[#0085FF] rounded-[16px] p-5 mb-4">
        <Text className="block text-white/80 text-[13px] mb-1">营业额 (元)</Text>
        <Text className="block text-[36px] font-bold text-white mb-4">{d.revenue}</Text>
        <View className="flex gap-3">
          <View className="flex-1 bg-white/10 p-3 rounded-xl border border-white/20">
            <Text className="block text-white/80 text-[11px] mb-0.5">有效单量</Text>
            <Text className="text-[20px] font-bold text-white">{d.orders}</Text>
          </View>
          <View className="flex-1 bg-white/10 p-3 rounded-xl border border-white/20">
            <Text className="block text-white/80 text-[11px] mb-0.5">进店人数</Text>
            <Text className="text-[20px] font-bold text-white">{d.visitors}</Text>
          </View>
        </View>
      </View>

      {/* 趋势图 */}
      <View className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] mb-4">
        <View className="flex justify-between items-center mb-4">
          <Text className="font-bold text-[15px] text-gray-900">营业趋势</Text>
          <View className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
            {['revenue', 'orders'].map((t) => (
              <View
                key={t}
                onClick={() => setTrend(t)}
                className={`px-3 py-1 rounded-lg ${trend === t ? 'bg-white' : ''}`}
              >
                <Text
                  className={`text-[12px] font-bold ${
                    trend === t ? 'text-[#0085FF]' : 'text-gray-500'
                  }`}
                >
                  {t === 'revenue' ? '营业额' : '单量'}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <View className="flex items-end justify-between h-[100px] gap-1">
          {bars.map((h, i) => (
            <View
              key={i}
              className={`flex-1 rounded-t-sm ${
                i === bars.length - 1 ? 'bg-[#0085FF]' : 'bg-blue-100'
              }`}
              style={{ height: h + '%' }}
            />
          ))}
        </View>
        <View className="flex justify-between mt-2">
          {HOURS.map((t) => (
            <Text key={t} className="text-[10px] text-gray-400">
              {t}
            </Text>
          ))}
        </View>
      </View>

      {/* 经营指标 */}
      <View className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] mb-4">
        <Text className="block font-bold text-[15px] text-gray-900 mb-4">经营指标</Text>
        <View className="flex flex-wrap">
          {kpis.map((k, i) => (
            <View key={i} className="w-1/3 text-center mb-5">
              <Text className="block text-[11px] text-gray-500">{k.label}</Text>
              <Text className="block font-bold text-[16px] text-gray-900 mt-1">
                {k.val}
              </Text>
              <Text
                className={`block text-[10px] mt-0.5 ${
                  k.ch === '持平'
                    ? 'text-gray-400'
                    : k.up
                    ? 'text-[#00B578]'
                    : 'text-[#FF5000]'
                }`}
              >
                {k.ch}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 热门商品 TOP 5 */}
      <View className="bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] mb-4">
        <View className="flex justify-between items-center mb-3">
          <Text className="font-bold text-[15px] text-gray-900">热门商品 TOP 5</Text>
          <View onClick={() => Taro.switchTab({ url: '/pages/products/index' })}>
            <Text className="text-[13px] text-[#0085FF] font-medium">查看全部</Text>
          </View>
        </View>
        {topProducts.map((item, i) => (
          <View
            key={i}
            className="flex items-center justify-between py-2.5 border-b border-gray-100"
          >
            <View className="flex items-center gap-3">
              <View
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  i < 3 ? 'bg-[#0085FF]' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-[11px] font-bold ${
                    i < 3 ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {i + 1}
                </Text>
              </View>
              <Text className="text-[13px] font-medium text-gray-900">{item.name}</Text>
            </View>
            <Text className="text-[12px] text-gray-500">
              售{item.sales}份 · ¥{item.rev}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
