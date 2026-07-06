# Design System

Shared across all four frontend apps.

## Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#0085FF` | Brand, active tabs, primary buttons, links |
| Promo | `#FF5000` | Prices, urgency, badges, pickup markers |
| Success | `#00B578` | Completion states, delivery green, positive trends |
| Error | `#DC2626` | Danger buttons, negative trends, alerts |
| Background | `#F5F5F5` | Page background |
| Card Inner | `#F8F9FA` | Inner card backgrounds, stat boxes |

## Typography

- **Primary**: PingFang SC / Microsoft YaHei / system-ui sans-serif
- **Numeric**: beVietnamPro (prices, stats)

## Components

| Component | Style |
|-----------|-------|
| Cards | `bg-white rounded-[16px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-50` |
| Headers | `bg-white/90 backdrop-blur-md shadow-sm h-14` with blue brand text |
| Bottom Nav | `rounded-t-[20px] shadow-[0_-8px_24px_rgba(0,0,0,0.04)] border-t border-gray-100` |
| Active Tab | `bg-blue-50 text-[#0085FF] scale-105` |
| Primary Button | `bg-[#0085FF] text-white font-bold rounded-[12px] py-2.5 active:scale-95 shadow-md` |
| Ghost Button | `border border-gray-200 text-gray-700 rounded-[12px]` |
| Input | `rounded-xl bg-gray-50 border border-gray-200 focus:border-[#0085FF]` |
| Toggle | `w-14 h-7 rounded-full` with white knob, blue when active, gray when off |

## Layout

- Max width: `max-w-md` (448px), centered with `mx-auto`
- Page margins: `px-4`
- Content padding below header: `mt-14`, below nav: `pb-28`
