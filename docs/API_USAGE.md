# 🔌 API 使用指南

## 📡 Notion API 代理

### 端点信息
- **URL**: `/api/notion-proxy`
- **方法**: `GET`
- **认证**: 无需前端认证（服务端处理）

### 请求参数

| 参数 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `type` | string | 否 | `all` | 数据类型：`all`、`ideas`、`questions` |
| `page_size` | number | 否 | `10` | 返回数量，最大 50 |

### 响应格式

#### 成功响应 (200)
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "count": 5,
    "page_size": 5,
    "type": "ideas"
  }
}
```

#### 错误响应
```json
{
  "error": "Error type",
  "message": "Error description"
}
```

## 💻 使用示例

### JavaScript (浏览器)
```javascript
// 获取所有数据
async function getAllData() {
  try {
    const response = await fetch('/api/notion-proxy?type=all&page_size=10');
    const result = await response.json();
    
    if (result.success) {
      console.log('Ideas:', result.data.ideas);
      console.log('Questions:', result.data.questions);
    } else {
      console.error('API Error:', result.message);
    }
  } catch (error) {
    console.error('Network Error:', error);
  }
}

// 获取想法数据
async function getIdeas() {
  const response = await fetch('/api/notion-proxy?type=ideas&page_size=5');
  const data = await response.json();
  return data.success ? data.data : [];
}

// 获取问题数据
async function getQuestions() {
  const response = await fetch('/api/notion-proxy?type=questions&page_size=5');
  const data = await response.json();
  return data.success ? data.data : [];
}
```

### React 组件示例
```jsx
import { useState, useEffect } from 'react';

function NotionData() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/notion-proxy?type=ideas&page_size=10');
        const data = await response.json();
        
        if (data.success) {
          setIdeas(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch ideas:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Ideas ({ideas.length})</h2>
      {ideas.map((idea, index) => (
        <div key={idea.id || index}>
          <h3>{idea.properties?.Name?.title?.[0]?.plain_text || 'Untitled'}</h3>
          <p>{idea.properties?.Description?.rich_text?.[0]?.plain_text || ''}</p>
        </div>
      ))}
    </div>
  );
}
```

### cURL 测试
```bash
# 获取所有数据
curl "https://your-domain.vercel.app/api/notion-proxy?type=all&page_size=5"

# 获取想法数据
curl "https://your-domain.vercel.app/api/notion-proxy?type=ideas&page_size=10"

# 获取问题数据
curl "https://your-domain.vercel.app/api/notion-proxy?type=questions&page_size=10"
```

## 🔒 安全特性

### 防刷策略
- **User-Agent 检查**: 要求有效的 User-Agent 头
- **页面大小限制**: 最大返回 50 条记录
- **方法限制**: 仅支持 GET 请求

### 错误处理
- **环境变量验证**: 检查 API Token 是否配置
- **Notion API 错误透传**: 保持原始状态码和错误信息
- **详细日志记录**: 服务端记录错误信息便于调试

## 🚀 部署注意事项

### Vercel 环境变量
确保在 Vercel 中配置以下环境变量：
- `NOTION_API_TOKEN`: Notion API Token
- `IDEAS_DATABASE_ID`: 想法数据库 ID
- `QUESTIONS_DATABASE_ID`: 问题数据库 ID

### 测试部署
```bash
# 本地测试
npm run dev
curl "http://localhost:8080/api/notion-proxy?type=ideas&page_size=5"

# 生产环境测试
curl "https://your-domain.vercel.app/api/notion-proxy?type=ideas&page_size=5"
```

## 📊 性能优化

### 缓存策略
- 考虑在客户端实现数据缓存
- 使用适当的 `page_size` 避免过度请求
- 实现错误重试机制

### 示例缓存实现
```javascript
class NotionDataCache {
  constructor(ttl = 5 * 60 * 1000) { // 5分钟缓存
    this.cache = new Map();
    this.ttl = ttl;
  }

  async get(type, pageSize = 10) {
    const key = `${type}-${pageSize}`;
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data;
    }

    const response = await fetch(`/api/notion-proxy?type=${type}&page_size=${pageSize}`);
    const data = await response.json();
    
    if (data.success) {
      this.cache.set(key, {
        data: data.data,
        timestamp: Date.now()
      });
    }
    
    return data.success ? data.data : [];
  }
}

// 使用示例
const cache = new NotionDataCache();
const ideas = await cache.get('ideas', 10);
```
