// 默认数据配置（硬编码，仅用于开发者自己的数据）
const LIFE_COUNTDOWN_DEFAULT_DATA = {
  birthDate: "1999-03-07",        // 出生日期（请根据实际情况修改）
  expectedLifespan: 80,           // 预期寿命（岁）
  deathMonth: 3,                 // 死亡日期（月）
  deathDay: 7,                   // 死亡日期（日）
  
  // 活动列表
  activities: [
    {
      id: 1,
      name: "阅读",
      frequency: { value: 1, unit: "day" }, // day/month/year
      duration: 2 // 小时
    }
  ],
  
  // 重大事件（用于生命阶段图）
  majorEvents: [
    {
      year: 1999,
      age: 0,
      events: ["诞生"]
    }
  ],
  
  // 想做的事情列表（编辑模式会从 Notion 获取，这里留空或使用示例数据）
  todoList: [],
  
  isDefault: true,
  lastModified: new Date().toISOString()
};




