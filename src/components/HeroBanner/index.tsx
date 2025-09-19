import React from 'react';

/**
 * HeroBanner组件 - 主横幅区域
 * 包含3D AI立方体图标、标题文字和渐变背景
 */
interface HeroBannerProps {
  className?: string;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ className = '' }) => {
  return (
    <div className={`px-4 mb-6 ${className}`}>
      <div className="bg-gradient-to-r from-blue-100 via-blue-50 to-purple-100 rounded-2xl p-6 relative overflow-hidden shadow-lg">
        {/* 背景装饰元素 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-300/20 to-cyan-300/20 rounded-full translate-y-8 -translate-x-8"></div>
        
        <div className="flex items-center justify-between relative z-10">
          {/* 左侧文字内容 */}
          <div className="flex-1">
            <h2 className="text-blue-900 text-xl font-bold mb-2 leading-tight">
              人人可用的智能体工具
            </h2>
            <p className="text-blue-700 text-sm opacity-90">
              AI赋能未来
            </p>
          </div>
          
          {/* 右侧3D立方体图标 */}
          <div className="ml-4">
            <div className="relative w-20 h-20">
              {/* 3D立方体效果 */}
              <div className="absolute inset-0 transform perspective-1000">
                {/* 立方体主体 */}
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg transform rotate-12 hover:rotate-6 transition-transform duration-300">
                  {/* AI文字 */}
                  <div className="flex items-center justify-center h-full">
                    <span className="text-white text-lg font-bold tracking-wider">AI</span>
                  </div>
                  
                  {/* 立方体侧面效果 */}
                  <div className="absolute top-0 right-0 w-4 h-16 bg-gradient-to-b from-blue-400 to-blue-500 transform skew-y-12 origin-top-right rounded-r-lg opacity-80"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-4 bg-gradient-to-r from-blue-600 to-blue-700 transform skew-x-12 origin-bottom-left rounded-b-lg opacity-80"></div>
                </div>
                
                {/* 环绕光环效果 */}
                <div className="absolute inset-0 w-20 h-20 border-2 border-blue-300/40 rounded-full animate-spin" style={{animationDuration: '8s'}}></div>
                <div className="absolute inset-2 w-16 h-16 border border-blue-400/30 rounded-full animate-spin" style={{animationDuration: '6s', animationDirection: 'reverse'}}></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 底部指示器 */}
        <div className="flex justify-center mt-6 space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          <div className="w-2 h-2 bg-blue-300 rounded-full opacity-60"></div>
          <div className="w-2 h-2 bg-blue-300 rounded-full opacity-60"></div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;