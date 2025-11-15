/**
 * 文章点赞功能
 * 根据 PRD 2.0 设计实现
 * API: POST /api/likes, GET /api/likes/article/:articleId
 */

(function() {
  'use strict';

  // 配置
  // 根据当前域名判断API地址
  const isProduction = window.location.hostname === 'zmh.life' || window.location.hostname === 'www.zmh.life';
  const API_BASE_URL = isProduction 
    ? 'https://admin.zmh.life' 
    : 'http://localhost:3000'; // 后台管理API地址
  const STORAGE_KEY_PREFIX = 'article_liked_';

  /**
   * 初始化点赞按钮
   */
  function initLikeButton() {
    const likeBtn = document.querySelector('.article-like-btn');
    if (!likeBtn) return;

    const articleId = likeBtn.getAttribute('data-article-id');
    const articleUrl = likeBtn.getAttribute('data-article-url') || window.location.href;

    if (!articleId) {
      console.warn('文章ID未找到');
      return;
    }

    // 检查是否已点赞（本地存储）
    const hasLiked = localStorage.getItem(STORAGE_KEY_PREFIX + articleId) === 'true';
    if (hasLiked) {
      likeBtn.classList.add('liked');
      likeBtn.disabled = true;
    }

    // 加载点赞数
    loadLikeCount(articleId, likeBtn);

    // 绑定点击事件
    likeBtn.addEventListener('click', function() {
      handleLikeClick(articleId, articleUrl, likeBtn);
    });
  }

  /**
   * 处理点赞点击
   */
  async function handleLikeClick(articleId, articleUrl, likeBtn) {
    // 检查是否已点赞
    if (likeBtn.disabled || likeBtn.classList.contains('liked')) {
      return;
    }

    // 防止重复点击
    likeBtn.disabled = true;

    try {
      // 发送点赞请求
      const response = await fetch(`${API_BASE_URL}/api/likes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          article_id: articleId,
          article_url: articleUrl,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // 标记为已点赞
        likeBtn.classList.add('liked');
        localStorage.setItem(STORAGE_KEY_PREFIX + articleId, 'true');

        // 更新点赞数
        const countElement = likeBtn.querySelector('.like-count');
        if (countElement) {
          const currentCount = parseInt(countElement.textContent) || 0;
          countElement.textContent = currentCount + 1;
        }

        // 显示反馈（可选）
        showLikeFeedback(likeBtn);
      } else {
        // 如果失败，恢复按钮状态
        likeBtn.disabled = false;
        console.error('点赞失败:', data.error || '未知错误');
        
        // 如果是重复点赞，标记为已点赞
        if (data.error && data.error.includes('already')) {
          likeBtn.classList.add('liked');
          localStorage.setItem(STORAGE_KEY_PREFIX + articleId, 'true');
        }
      }
    } catch (error) {
      console.error('点赞请求失败:', error);
      likeBtn.disabled = false;
      
      // 网络错误时，仍然标记为已点赞（防止重复点击）
      // 但不在本地存储，以便下次重试
    }
  }

  /**
   * 加载点赞数
   */
  async function loadLikeCount(articleId, likeBtn) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/likes/article/${encodeURIComponent(articleId)}`);
      const data = await response.json();

      if (data.success && data.count !== undefined) {
        const countElement = likeBtn.querySelector('.like-count');
        if (countElement) {
          countElement.textContent = data.count || 0;
        }
      }
    } catch (error) {
      console.error('加载点赞数失败:', error);
      // 静默失败，不影响用户体验
    }
  }

  /**
   * 显示点赞反馈（可选动画效果）
   */
  function showLikeFeedback(likeBtn) {
    // 简单的动画效果
    likeBtn.style.transform = 'scale(1.1)';
    setTimeout(() => {
      likeBtn.style.transform = '';
    }, 200);
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLikeButton);
  } else {
    initLikeButton();
  }
})();

