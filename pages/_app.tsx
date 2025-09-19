import type { AppProps } from 'next/app';
import '../src/index.css';

/**
 * Next.js应用的根组件
 * 用于全局配置和样式导入
 */
export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}