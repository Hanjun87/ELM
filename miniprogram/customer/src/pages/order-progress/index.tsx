import { View, Text } from '@tarojs/components';

const STEPS = [
  { title: '已下单', desc: '商家将尽快接单' },
  { title: '商家接单', desc: '商家已确认订单' },
  { title: '制作中', desc: '商家正在准备餐品' },
  { title: '配送中', desc: '骑手正在赶来' },
  { title: '已送达', desc: '感谢您的惠顾' },
];

export default function OrderProgress() {
  // 静态时间线示意（当前进度到「配送中」）
  const currentStep = 3;

  return (
    <View className="w-full min-h-screen bg-[#F5F5F5] p-4">
      <View className="bg-white rounded-2xl p-5">
        <Text className="block font-bold text-lg mb-5">订单进度</Text>
        {STEPS.map((step, idx) => {
          const done = idx <= currentStep;
          return (
            <View key={step.title} className="flex gap-3 mb-1">
              <View className="flex flex-col items-center">
                <View
                  className={`w-4 h-4 rounded-full ${done ? 'bg-[#0085FF]' : 'bg-gray-200'}`}
                />
                {idx < STEPS.length - 1 && (
                  <View
                    className={`w-0.5 h-10 ${idx < currentStep ? 'bg-[#0085FF]' : 'bg-gray-200'}`}
                  />
                )}
              </View>
              <View className="flex-1 pb-4">
                <Text className={`block font-medium ${done ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.title}
                </Text>
                <Text className="block text-xs text-gray-400 mt-1">{step.desc}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
