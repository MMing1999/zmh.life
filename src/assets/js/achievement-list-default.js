// 人生成就清单默认数据
// TODO: 后期将从 Notion API 获取真实数据
// 数据格式说明：
// {
//   id: number,        // 唯一标识符
//   content: string    // 成就内容文本（只显示序号和文本，没有日期）
// }
const ACHIEVEMENT_LIST_DEFAULT_DATA = [
  {
    id: 1,
    content: "完成了第一个个人网站项目，学会了基础的 HTML、CSS 和 JavaScript，从此踏上了前端开发的道路"
  },
  {
    id: 2,
    content: "成功通过大学英语四级考试，提升了语言能力，为后续的学习和工作打下了基础"
  },
  {
    id: 3,
    content: "学会了使用 Git 进行版本控制，掌握了基本的协作开发流程，理解了代码管理的重要性"
  },
  {
    id: 4,
    content: "完成了第一个全栈项目，整合了前端和后端技术，体验了从设计到实现的完整流程"
  },
  {
    id: 5,
    content: "阅读了 50 本技术书籍，建立了系统的知识体系，形成了自己的学习方法论"
  },
  {
    id: 6,
    content: "学会了 React 框架，能够构建复杂的单页应用，理解了组件化开发的思想"
  },
  {
    id: 7,
    content: "参与开源项目贡献，获得了社区的认可，体会到了开源协作的乐趣"
  },
  {
    id: 8,
    content: "完成了马拉松比赛，突破了身体和心理的极限，证明了自己可以做到"
  },
  {
    id: 9,
    content: "学会了使用 TypeScript，提升了代码质量和开发效率，减少了运行时错误"
  },
  {
    id: 10,
    content: "建立了个人博客，开始记录和分享技术思考，养成了写作和总结的习惯"
  },
  {
    id: 11,
    content: "独立完成了第一个商业项目，从需求分析到上线部署，全程参与并负责"
  },
  {
    id: 12,
    content: "学会了使用设计工具 Figma，能够将设计稿转化为代码，提升了设计到开发的协作效率"
  },
  {
    id: 13,
    content: "参加了技术大会并做了主题分享，克服了公开演讲的恐惧，提升了表达能力"
  },
  {
    id: 14,
    content: "学会了使用 Docker 容器化技术，简化了开发环境的配置和部署流程"
  },
  {
    id: 15,
    content: "完成了第一个移动端应用开发，理解了响应式设计和移动端适配的重要性"
  },
  {
    id: 16,
    content: "建立了自己的作品集网站，展示了个人项目和技能，获得了更多工作机会"
  },
  {
    id: 17,
    content: "学会了使用 Node.js 开发后端服务，理解了前后端分离的架构设计"
  },
  {
    id: 18,
    content: "完成了第一个 AI 相关的项目，探索了人工智能在实际应用中的可能性"
  },
  {
    id: 19,
    content: "学会了使用 WebGL 和 Three.js，能够创建 3D 交互体验，拓展了技术边界"
  },
  {
    id: 20,
    content: "建立了自己的技术社区，聚集了一群志同道合的开发者，共同学习和成长"
  },
  {
    id: 21,
    content: "学会了使用 Vue.js 框架，掌握了另一种前端开发方式，丰富了技术栈"
  },
  {
    id: 22,
    content: "完成了第一个小程序开发项目，理解了移动端轻应用的开发模式"
  },
  {
    id: 23,
    content: "学会了使用 GraphQL，理解了现代 API 设计的新思路，提升了数据查询效率"
  },
  {
    id: 24,
    content: "完成了第一个微服务架构项目，理解了分布式系统的设计原则"
  },
  {
    id: 25,
    content: "学会了使用 Redis 缓存技术，提升了应用的性能和响应速度"
  },
  {
    id: 26,
    content: "完成了第一个区块链相关的项目，探索了去中心化技术的应用场景"
  },
  {
    id: 27,
    content: "学会了使用 MongoDB 数据库，掌握了 NoSQL 数据库的使用方法"
  },
  {
    id: 28,
    content: "完成了第一个 PWA 应用开发，理解了渐进式 Web 应用的优势"
  },
  {
    id: 29,
    content: "学会了使用 Webpack 和 Vite 构建工具，优化了项目的打包和开发体验"
  },
  {
    id: 30,
    content: "完成了第一个 Serverless 项目，体验了无服务器架构的便利性"
  },
  {
    id: 31,
    content: "学会了使用 Kubernetes 容器编排，掌握了云原生应用的部署方式"
  },
  {
    id: 32,
    content: "完成了第一个物联网项目，将硬件和软件结合起来，创造了新的交互方式"
  },
  {
    id: 33,
    content: "学会了使用 Elasticsearch 搜索引擎，提升了数据检索和分析能力"
  },
  {
    id: 34,
    content: "完成了第一个数据可视化项目，用图表和动画展示了复杂的数据关系"
  },
  {
    id: 35,
    content: "学会了使用 WebSocket 实时通信技术，实现了即时消息和实时协作功能"
  },
  {
    id: 36,
    content: "完成了第一个机器学习项目，使用 TensorFlow 训练了自己的模型"
  },
  {
    id: 37,
    content: "学会了使用 GraphQL 和 Apollo，构建了现代化的数据层架构"
  },
  {
    id: 38,
    content: "完成了第一个跨平台应用开发，使用 React Native 实现了 iOS 和 Android 应用"
  },
  {
    id: 39,
    content: "学会了使用 Jest 和 Cypress 进行测试，提升了代码质量和应用稳定性"
  },
  {
    id: 40,
    content: "完成了第一个 WebAssembly 项目，探索了高性能 Web 应用的可能性"
  },
  {
    id: 41,
    content: "学会了使用 Next.js 框架，掌握了服务端渲染和静态站点生成技术"
  },
  {
    id: 42,
    content: "完成了第一个音视频处理项目，实现了音频编辑和视频转码功能"
  },
  {
    id: 43,
    content: "学会了使用 WebRTC 技术，实现了浏览器间的实时音视频通信"
  },
  {
    id: 44,
    content: "完成了第一个游戏开发项目，使用 Phaser 创建了第一个 Web 游戏"
  },
  {
    id: 45,
    content: "学会了使用 D3.js 数据可视化库，创建了复杂的数据图表和交互"
  },
  {
    id: 46,
    content: "完成了第一个 AR/VR 项目，使用 A-Frame 创建了虚拟现实体验"
  },
  {
    id: 47,
    content: "学会了使用 Web Components，理解了组件化开发的标准方式"
  },
  {
    id: 48,
    content: "完成了第一个低代码平台开发，让非技术人员也能创建应用"
  },
  {
    id: 49,
    content: "学会了使用 Micro Frontends 架构，实现了大型前端应用的模块化"
  },
  {
    id: 50,
    content: "完成了第一个区块链 DApp 开发，探索了去中心化应用的未来"
  },
  {
    id: 51,
    content: "学会了使用 Rust 语言，理解了系统级编程和内存安全的重要性"
  },
  {
    id: 52,
    content: "完成了第一个边缘计算项目，将计算能力推向了网络边缘"
  },
  {
    id: 53,
    content: "学会了使用 WebAssembly，将 C++ 代码编译为 Web 应用，提升了性能"
  },
  {
    id: 54,
    content: "完成了第一个智能合约开发，使用 Solidity 创建了去中心化应用"
  },
  {
    id: 55,
    content: "学会了使用 Deno 运行时，体验了现代化的 JavaScript 运行时环境"
  },
  {
    id: 56,
    content: "完成了第一个量子计算模拟项目，探索了量子算法的应用"
  },
  {
    id: 57,
    content: "学会了使用 WebGPU，理解了下一代 Web 图形 API 的强大能力"
  },
  {
    id: 58,
    content: "完成了第一个联邦学习项目，实现了隐私保护的机器学习"
  },
  {
    id: 59,
    content: "学会了使用 WebAuthn，实现了无密码的身份认证方式"
  },
  {
    id: 60,
    content: "完成了第一个数字孪生项目，创建了物理世界的数字副本"
  },
  {
    id: 61,
    content: "学会了使用 WebXR，创建了沉浸式的 Web 虚拟现实体验"
  },
  {
    id: 62,
    content: "完成了第一个自然语言处理项目，实现了文本分析和情感识别"
  },
  {
    id: 63,
    content: "学会了使用 Web Workers，实现了多线程的 Web 应用开发"
  },
  {
    id: 64,
    content: "完成了第一个计算机视觉项目，使用 OpenCV 实现了图像识别"
  },
  {
    id: 65,
    content: "学会了使用 Web Audio API，创建了复杂的音频处理和合成应用"
  },
  {
    id: 66,
    content: "完成了第一个推荐系统项目，使用机器学习算法实现了个性化推荐"
  },
  {
    id: 67,
    content: "学会了使用 Web Share API，实现了原生的内容分享功能"
  },
  {
    id: 68,
    content: "完成了第一个知识图谱项目，构建了结构化的知识表示系统"
  },
  {
    id: 69,
    content: "学会了使用 IndexedDB，实现了客户端的大数据存储和查询"
  },
  {
    id: 70,
    content: "完成了第一个语音识别项目，实现了语音转文字的功能"
  },
  {
    id: 71,
    content: "学会了使用 WebAssembly SIMD，实现了高性能的向量计算"
  },
  {
    id: 72,
    content: "完成了第一个时间序列分析项目，预测了未来的趋势和模式"
  },
  {
    id: 73,
    content: "学会了使用 Web Locks API，实现了资源的并发控制"
  },
  {
    id: 74,
    content: "完成了第一个强化学习项目，训练了能够自主决策的智能体"
  },
  {
    id: 75,
    content: "学会了使用 Web Animations API，创建了流畅的动画效果"
  },
  {
    id: 76,
    content: "完成了第一个知识蒸馏项目，将大模型压缩为轻量级模型"
  },
  {
    id: 77,
    content: "学会了使用 Web Push API，实现了浏览器的推送通知功能"
  },
  {
    id: 78,
    content: "完成了第一个生成对抗网络项目，创建了能够生成图像的 AI 模型"
  },
  {
    id: 79,
    content: "学会了使用 Web Crypto API，实现了端到端的加密通信"
  },
  {
    id: 80,
    content: "完成了第一个迁移学习项目，将预训练模型应用到新领域"
  },
  {
    id: 81,
    content: "学会了使用 Web Bluetooth API，实现了浏览器与蓝牙设备的通信"
  },
  {
    id: 82,
    content: "完成了第一个元学习项目，训练了能够快速适应新任务的模型"
  },
  {
    id: 83,
    content: "学会了使用 Web NFC API，实现了近场通信的 Web 应用"
  },
  {
    id: 84,
    content: "完成了第一个神经架构搜索项目，自动找到了最优的神经网络结构"
  },
  {
    id: 85,
    content: "学会了使用 Web Serial API，实现了浏览器与串口设备的通信"
  },
  {
    id: 86,
    content: "完成了第一个多模态学习项目，融合了文本、图像和音频信息"
  },
  {
    id: 87,
    content: "学会了使用 Web USB API，实现了浏览器与 USB 设备的交互"
  },
  {
    id: 88,
    content: "完成了第一个自监督学习项目，从无标签数据中学习特征表示"
  },
  {
    id: 89,
    content: "学会了使用 Web HID API，实现了浏览器与 HID 设备的通信"
  },
  {
    id: 90,
    content: "完成了第一个对比学习项目，通过对比正负样本学习表示"
  },
  {
    id: 91,
    content: "学会了使用 Web File System API，实现了文件系统的浏览器访问"
  },
  {
    id: 92,
    content: "完成了第一个因果推理项目，理解了因果关系在机器学习中的重要性"
  },
  {
    id: 93,
    content: "学会了使用 Web Assembly Interface Types，实现了类型安全的跨语言调用"
  },
  {
    id: 94,
    content: "完成了第一个可解释 AI 项目，让机器学习模型的决策过程变得透明"
  },
  {
    id: 95,
    content: "学会了使用 Web Codecs API，实现了高效的音视频编解码"
  },
  {
    id: 96,
    content: "完成了第一个持续学习项目，让模型能够持续学习新知识而不遗忘"
  },
  {
    id: 97,
    content: "学会了使用 Web Assembly Threads，实现了多线程的 WebAssembly 应用"
  },
  {
    id: 98,
    content: "完成了第一个少样本学习项目，用少量数据训练出高性能模型"
  },
  {
    id: 99,
    content: "学会了使用 Web Assembly Exception Handling，实现了异常处理机制"
  },
  {
    id: 100,
    content: "完成了第一个多任务学习项目，让一个模型同时解决多个相关任务"
  }
];

