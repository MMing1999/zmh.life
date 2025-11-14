// 人生成就清单功能核心逻辑
// 所有代码仅作用于 #section4，不影响其他section

(function() {
  'use strict';

  class AchievementList {
    constructor() {
      this.section = null;
      this.container = null;
      this.paginationContainer = null;
      this.prevBtn = null;
      this.nextBtn = null;
      this.paginationInfo = null;
      this.achievements = [];
      this.currentPage = 1;
      this.itemsPerPage = 100; // 每页显示100条
    }

    // 加载数据
    async loadData() {
      // ============================================
      // Notion API 接口预留位置
      // ============================================
      // TODO: 后期将从 Notion API 获取真实数据
      // 
      // 接口说明：
      // 1. API 端点：/api/notion/achievements
      // 2. 请求方法：GET
      // 3. 返回数据格式：
      //    [
      //      {
      //        id: number,        // 唯一标识符
      //        content: string    // 成就内容文本（只显示序号和文本，没有日期）
      //      },
      //      ...
      //    ]
      // 4. 错误处理：如果 API 调用失败，使用默认数据作为降级方案
      //
      // 示例代码（取消注释后使用）：
      // try {
      //   const response = await fetch('/api/notion/achievements');
      //   if (!response.ok) {
      //     throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      //   }
      //   const data = await response.json();
      //   // 确保数据格式正确
      //   if (Array.isArray(data) && data.length > 0) {
      //     return data;
      //   }
      //   // 如果返回空数组，使用默认数据
      //   console.warn('Notion API 返回空数据，使用默认数据');
      //   return ACHIEVEMENT_LIST_DEFAULT_DATA;
      // } catch (error) {
      //   console.error('加载 Notion 数据失败，使用默认数据:', error);
      //   return ACHIEVEMENT_LIST_DEFAULT_DATA;
      // }

      // 现在使用默认数据（开发阶段）
      if (typeof ACHIEVEMENT_LIST_DEFAULT_DATA !== 'undefined') {
        return ACHIEVEMENT_LIST_DEFAULT_DATA;
      }
      return [];
    }


    // 获取当前页的数据
    getCurrentPageData() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.achievements.slice(startIndex, endIndex);
    }

    // 计算总页数
    getTotalPages() {
      return Math.ceil(this.achievements.length / this.itemsPerPage);
    }

    // 更新分页控件
    updatePagination() {
      if (!this.paginationContainer || !this.prevBtn || !this.nextBtn || !this.paginationInfo) {
        return;
      }

      const totalPages = this.getTotalPages();

      // 如果只有一页或没有数据，隐藏分页控件
      if (totalPages <= 1 || this.achievements.length === 0) {
        this.paginationContainer.style.display = 'none';
        return;
      }

      // 显示分页控件
      this.paginationContainer.style.display = 'flex';

      // 更新按钮状态
      this.prevBtn.disabled = this.currentPage <= 1;
      this.nextBtn.disabled = this.currentPage >= totalPages;

      // 更新页码信息
      this.paginationInfo.textContent = `第 ${this.currentPage} 页 / 共 ${totalPages} 页`;
    }

    // 渲染成就列表
    render() {
      if (!this.container) return;

      // 清空容器
      this.container.innerHTML = '';

      if (!this.achievements || this.achievements.length === 0) {
        this.container.innerHTML = '<div class="achievement-empty">暂无成就记录</div>';
        this.updatePagination();
        return;
      }

      // 获取当前页的数据
      const currentPageData = this.getCurrentPageData();
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;

      // 渲染当前页的成就项
      currentPageData.forEach((achievement, index) => {
        const item = document.createElement('div');
        item.className = 'achievement-item';
        
        const number = document.createElement('div');
        number.className = 'achievement-number';
        // 序号是全局序号，不是当前页的序号
        number.textContent = String(startIndex + index + 1).padStart(2, '0');
        
        const content = document.createElement('div');
        content.className = 'achievement-text';
        content.textContent = achievement.content;
        
        item.appendChild(number);
        item.appendChild(content);
        this.container.appendChild(item);
      });

      // 更新分页控件
      this.updatePagination();
    }

    // 跳转到指定页
    goToPage(page) {
      const totalPages = this.getTotalPages();
      if (page < 1 || page > totalPages) {
        return;
      }
      this.currentPage = page;
      this.render();
      // 滚动到列表顶部
      if (this.container) {
        this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    // 初始化
    async init() {
      this.section = document.getElementById('section4');
      if (!this.section) {
        console.warn('未找到 #section4 元素');
        return;
      }

      this.container = this.section.querySelector('#achievementListContainer');
      if (!this.container) {
        console.warn('未找到 #achievementListContainer 元素');
        return;
      }

      // 获取分页控件元素
      this.paginationContainer = this.section.querySelector('#achievementPagination');
      this.prevBtn = this.section.querySelector('#achievementPrevPage');
      this.nextBtn = this.section.querySelector('#achievementNextPage');
      this.paginationInfo = this.section.querySelector('#achievementPaginationInfo');

      // 加载数据（显示数据库中的所有数据，不限制数量）
      this.achievements = await this.loadData();

      // 绑定分页按钮事件
      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', () => {
          if (this.currentPage > 1) {
            this.goToPage(this.currentPage - 1);
          }
        });
      }

      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', () => {
          const totalPages = this.getTotalPages();
          if (this.currentPage < totalPages) {
            this.goToPage(this.currentPage + 1);
          }
        });
      }
      
      // 渲染
      this.render();
    }
  }

  // 导出到全局
  window.AchievementList = AchievementList;
})();

