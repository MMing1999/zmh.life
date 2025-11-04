// Notion API 代理服务
// 用于前端安全地获取 Notion 数据，避免在浏览器暴露 API Token

export default async function handler(req, res) {
  // 仅支持 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are supported'
    });
  }

  // 基础防刷策略：检查 User-Agent
  const userAgent = req.headers['user-agent'];
  if (!userAgent || userAgent.length < 10) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'User-Agent header is required'
    });
  }

  try {
    // 从环境变量读取配置
    const NOTION_API_TOKEN = process.env.NOTION_API_TOKEN;
    const IDEAS_DATABASE_ID = process.env.IDEAS_DATABASE_ID;
    const QUESTIONS_DATABASE_ID = process.env.QUESTIONS_DATABASE_ID;

    // 验证必需的环境变量
    if (!NOTION_API_TOKEN) {
      console.error('NOTION_API_TOKEN environment variable is not set');
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'API token not configured'
      });
    }

    // 获取查询参数
    const { type = 'all', page_size = 10 } = req.query;
    
    // 限制 page_size 最大值，防止滥用
    const maxPageSize = 50;
    const limitPageSize = Math.min(parseInt(page_size) || 10, maxPageSize);

    // 根据类型选择数据库
    let databaseId;
    switch (type) {
      case 'ideas':
        databaseId = IDEAS_DATABASE_ID;
        break;
      case 'questions':
        databaseId = QUESTIONS_DATABASE_ID;
        break;
      case 'all':
        // 获取所有数据
        break;
      default:
        return res.status(400).json({
          error: 'Invalid type parameter',
          message: 'Type must be "ideas", "questions", or "all"'
        });
    }

    // 构建 Notion API 请求
    const notionUrl = databaseId 
      ? `https://api.notion.com/v1/databases/${databaseId}/query`
      : null;

    if (type === 'all') {
      // 并行获取所有数据
      const [ideasResponse, questionsResponse] = await Promise.all([
        fetch(`https://api.notion.com/v1/databases/${IDEAS_DATABASE_ID}/query`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${NOTION_API_TOKEN}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28'
          },
          body: JSON.stringify({
            page_size: limitPageSize,
            sorts: [
              {
                property: 'createTime',
                direction: 'descending'
              }
            ]
          })
        }),
        fetch(`https://api.notion.com/v1/databases/${QUESTIONS_DATABASE_ID}/query`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${NOTION_API_TOKEN}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28'
          },
          body: JSON.stringify({
            page_size: limitPageSize,
            sorts: [
              {
                property: 'createTime',
                direction: 'descending'
              }
            ]
          })
        })
      ]);

      // 检查响应状态
      if (!ideasResponse.ok || !questionsResponse.ok) {
        const ideasError = !ideasResponse.ok ? await ideasResponse.text() : null;
        const questionsError = !questionsResponse.ok ? await questionsResponse.text() : null;
        
        console.error('Notion API error:', { ideasError, questionsError });
        return res.status(ideasResponse.status || questionsResponse.status).json({
          error: 'Notion API error',
          message: ideasError || questionsError || 'Failed to fetch data'
        });
      }

      // 解析响应
      const ideasData = await ideasResponse.json();
      const questionsData = await questionsResponse.json();

      return res.status(200).json({
        success: true,
        data: {
          ideas: ideasData.results || [],
          questions: questionsData.results || []
        },
        meta: {
          ideas_count: ideasData.results?.length || 0,
          questions_count: questionsData.results?.length || 0,
          page_size: limitPageSize
        }
      });
    } else {
      // 获取单个类型的数据
      const response = await fetch(notionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NOTION_API_TOKEN}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify({
          page_size: limitPageSize,
          sorts: [
            {
              property: 'createTime',
              direction: 'descending'
            }
          ]
        })
      });

      // 检查响应状态
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Notion API error:', response.status, errorText);
        return res.status(response.status).json({
          error: 'Notion API error',
          message: errorText || 'Failed to fetch data'
        });
      }

      // 解析响应
      const data = await response.json();

      return res.status(200).json({
        success: true,
        data: data.results || [],
        meta: {
          count: data.results?.length || 0,
          page_size: limitPageSize,
          type: type
        }
      });
    }

  } catch (error) {
    console.error('API proxy error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred'
    });
  }
}
