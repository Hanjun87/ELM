import Taro from '@tarojs/taro';

/**
 * 小程序版 toast，替代 Web 端 @shared 的 toast()。
 * 用微信原生 showToast，icon: none 以支持任意文案长度。
 */
export function toast(msg: string) {
  Taro.showToast({
    title: msg,
    icon: 'none',
    duration: 2000,
  });
}

/** 全屏 loading */
export function showLoading(msg = '加载中...') {
  Taro.showLoading({ title: msg, mask: true });
}

export function hideLoading() {
  Taro.hideLoading();
}
