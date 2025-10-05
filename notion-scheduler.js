const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');

// 每6小时执行一次 Eleventy 构建
// 0 */6 * * * 表示每6小时的第0分钟执行
cron.schedule('0 */6 * * *', () => {
  console.log('🔄 开始定时更新 Notion 数据...');
  
  const eleventyPath = path.join(__dirname, 'node_modules/.bin/eleventy');
  
  exec(`${eleventyPath} --quiet`, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Eleventy 构建失败:', error);
      return;
    }
    
    if (stderr) {
      console.error('⚠️ Eleventy 警告:', stderr);
    }
    
    console.log('✅ Notion 数据更新完成');
    console.log('📅 下次更新时间:', new Date(Date.now() + 6 * 60 * 60 * 1000).toLocaleString('zh-CN'));
  });
}, {
  scheduled: true,
  timezone: "Asia/Shanghai"
});

console.log('🚀 Notion 定时更新服务已启动');
console.log('⏰ 更新频率: 每6小时');
console.log('🌏 时区: Asia/Shanghai');
console.log('📅 下次更新时间:', new Date(Date.now() + 6 * 60 * 60 * 1000).toLocaleString('zh-CN'));
