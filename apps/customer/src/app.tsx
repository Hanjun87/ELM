import { PropsWithChildren } from 'react';
import { useLaunch } from '@tarojs/taro';
import { AuthProvider } from './contexts/AuthContext';
import './app.css';

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    console.log('ELM 客户端小程序启动');
  });

  // children 是将要会渲染的页面
  return <AuthProvider>{children}</AuthProvider>;
}

export default App;
