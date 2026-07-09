import { defineConfig } from '@tarojs/cli';
import devConfig from './dev';
import prodConfig from './prod';

// weapp-tailwindcss vite 插件
import { UnifiedViteWeappTailwindcssPlugin as uvwt } from 'weapp-tailwindcss/vite';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// 强制 Vite 的 CSS 管线走 tailwind（Taro 会覆盖文件式 postcss.config.js，
// 所以这里通过一个内联插件把 postcss 插件注入回去）
const injectTailwind = {
  name: 'inject-tailwind-postcss',
  config: () => ({
    css: {
      postcss: {
        plugins: [tailwindcss(), autoprefixer()],
      },
    },
  }),
};

export default defineConfig(async (merge, { command, mode }) => {
  const baseConfig = {
    projectName: 'elm-rider',
    date: '2026-7-8',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2,
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: [],
    defineConstants: {},
    copy: {
      patterns: [],
      options: {},
    },
    framework: 'react',
    compiler: {
      type: 'vite',
      vitePlugins: [
        injectTailwind,
        uvwt({
          // rem 转 rpx
          rem2rpx: true,
        }),
      ],
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: false,
        },
      },
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      postcss: {
        autoprefixer: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: false,
        },
      },
    },
  };

  if (process.env.NODE_ENV === 'development') {
    return merge({}, baseConfig, devConfig);
  }
  return merge({}, baseConfig, prodConfig);
});
