// Notion API 数据获取模块
// ⚠️  仅构建/服务端使用，禁止在前端直接引用密钥
// 此模块仅在 Eleventy 构建时运行，不会暴露到前端

const https = require('https');

// 从环境变量读取配置
const NOTION_API_TOKEN = process.env.NOTION_API_TOKEN;
const IDEAS_DATABASE_ID = process.env.IDEAS_DATABASE_ID;
const QUESTIONS_DATABASE_ID = process.env.QUESTIONS_DATABASE_ID;

// 验证必需的环境变量
if (!NOTION_API_TOKEN) {
  console.warn('⚠️  NOTION_API_TOKEN 环境变量未设置，将返回示例数据');
  console.warn('请设置环境变量 NOTION_API_TOKEN 或创建 .env.local 文件');
}

if (!IDEAS_DATABASE_ID || !QUESTIONS_DATABASE_ID) {
  console.warn('⚠️  数据库ID环境变量未设置，将返回示例数据');
  console.warn('请设置 IDEAS_DATABASE_ID 和 QUESTIONS_DATABASE_ID 环境变量');
}

// 使用Node.js https模块调用 Notion API
async function notionRequest(endpoint, options = {}) {
  if (!NOTION_API_TOKEN) {
    throw new Error('NOTION_API_TOKEN 环境变量未设置');
  }

  const url = `https://api.notion.com/v1${endpoint}`;
  
  return new Promise((resolve, reject) => {
    console.log(`🌐 正在请求: ${url}`);
    console.log(`🔑 使用API Token: ${NOTION_API_TOKEN.substring(0, 20)}...`);
    
    const postData = JSON.stringify(options.body || {});
    
    const requestOptions = {
      hostname: 'api.notion.com',
      port: 443,
      path: `/v1${endpoint}`,
      method: options.method || 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(requestOptions, (res) => {
      console.log(`📡 响应状态: ${res.statusCode} ${res.statusMessage}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const jsonData = JSON.parse(data);
            console.log(`✅ API调用成功，返回 ${jsonData.results?.length || 0} 条记录`);
            resolve(jsonData);
          } else {
            // 改进错误处理：包含状态码和响应文本
            const errorMessage = `Notion API error: ${res.statusCode} ${res.statusMessage}`;
            const errorDetails = data ? `Response: ${data}` : 'No response body';
            console.error(errorMessage);
            console.error(errorDetails);
            
            const error = new Error(errorMessage);
            error.status = res.statusCode;
            error.response = data;
            reject(error);
          }
        } catch (error) {
          console.error(`❌ JSON解析错误: ${error.message}`);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error(`❌ Network error calling Notion API: ${error.message}`);
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

// 格式化日期时间：2025.10.5 20:20:42
function formatDateTime(dateObj) {
  if (!dateObj) return "";
  const d = new Date(dateObj);
  if (isNaN(d)) return "";
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  
  return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
}

// 获取 Notion 数据库数据
async function fetchNotionData(databaseId, collectionName) {
  try {
    // 如果没有API Token，返回空数组
    if (!NOTION_API_TOKEN) {
      console.log(`跳过 ${collectionName} 数据获取（API Token未设置）`);
      return [];
    }
    
    if (!databaseId) {
      console.log(`跳过 ${collectionName} 数据获取（数据库ID未设置）`);
      return [];
    }
    
    console.log(`正在获取 ${collectionName} 数据...`);
    
    // 使用 notionRequest 函数调用 Notion API
    const response = await notionRequest(`/databases/${databaseId}/query`, {
      body: {
        sorts: [
          {
            property: 'createTime',
            direction: 'descending',
          },
        ],
      }
    });

    console.log(`${collectionName} 获取到 ${response.results.length} 条记录`);

    // 获取页面内容
    const pagesWithContent = await Promise.all(response.results.map(async (page) => {
      try {
        // 获取页面内容
        const pageContentData = await notionRequest(`/blocks/${page.id}/children`, {
          method: 'GET'
        });

        // 提取文本内容
        let content = '';
        if (pageContentData.results && pageContentData.results.length > 0) {
          content = pageContentData.results
            .filter(block => block.type === 'paragraph' && block.paragraph?.rich_text)
            .map(block => block.paragraph.rich_text.map(text => text.plain_text).join(''))
            .join('\n\n');
        }

        // 提取页面属性
        const properties = page.properties;
        
        // 获取标题
        let title = '';
        if (properties['name'] && properties['name'].title) {
          title = properties['name'].title.map(text => text.plain_text).join('');
        } else if (properties['Name'] && properties['Name'].title) {
          title = properties['Name'].title.map(text => text.plain_text).join('');
        } else if (properties['标题'] && properties['标题'].title) {
          title = properties['标题'].title.map(text => text.plain_text).join('');
        } else if (properties['Title'] && properties['Title'].title) {
          title = properties['Title'].title.map(text => text.plain_text).join('');
        }

        // 如果没有内容，使用标题作为内容
        if (!content && title) {
          content = title;
        }

        return {
          id: page.id,
          title: title || 'Untitled',
          content: content || 'No content',
          date: page.created_time,
          url: page.url,
          collection: collectionName
        };
      } catch (error) {
        console.error(`Error fetching page content for ${page.id}:`, error.message);
        return {
          id: page.id,
          title: 'Untitled',
          content: 'No content',
          date: page.created_time,
          url: page.url,
          collection: collectionName
        };
      }
    }));

    return pagesWithContent;
  } catch (error) {
    console.error(`Error fetching ${collectionName} data:`, error.message);
    return [];
  }
}

// 主函数：获取所有 Notion 数据
async function getNotionData() {
  try {
    console.log('开始获取 Notion 数据...');
    
    const [ideas, questions] = await Promise.all([
      fetchNotionData(IDEAS_DATABASE_ID, 'ideas'),
      fetchNotionData(QUESTIONS_DATABASE_ID, 'questions')
    ]);

    console.log(`获取完成: ideas=${ideas.length}, questions=${questions.length}`);

    // 如果获取的数据为空，返回示例数据
    if (ideas.length === 0 && questions.length === 0) {
      console.log('API返回空数据，使用示例数据');
      return getSampleData();
    }

    return {
      ideas: ideas,
      questions: questions
    };
  } catch (error) {
    console.error('Error fetching Notion data:', error);
    console.log('API调用失败，使用示例数据');
    return getSampleData();
  }
}

// 获取示例数据
function getSampleData() {
  return {
    ideas: [
      {
        id: 'sample-1',
        title: '示例想法',
        content: '这是一个示例想法，用于演示页面功能。请设置Notion API密钥以获取真实数据。',
        date: new Date().toISOString(),
        url: '#',
        collection: 'ideas'
      },
      {
        id: 'sample-2',
        title: '设计灵感',
        content: '今天看到一个很棒的设计作品，色彩搭配很有创意，值得学习借鉴。',
        date: new Date(Date.now() - 86400000).toISOString(),
        url: '#',
        collection: 'ideas'
      }
    ],
    questions: [
      {
        id: 'sample-3',
        title: '示例问题',
        content: '这是一个示例问题，用于演示页面功能。请设置Notion API密钥以获取真实数据。',
        date: new Date().toISOString(),
        url: '#',
        collection: 'questions'
      },
      {
        id: 'sample-4',
        title: '技术思考',
        content: '如何更好地组织前端代码结构？是否需要引入新的架构模式？',
        date: new Date(Date.now() - 172800000).toISOString(),
        url: '#',
        collection: 'questions'
      }
    ]
  };
}

// 导出数据
module.exports = async function() {
  return await getNotionData();
};
