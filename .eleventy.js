// 加载环境变量
require('dotenv').config({ path: '.env.local' });

module.exports = function(eleventyConfig) {
  // 添加插件
  eleventyConfig.addPlugin(require("@11ty/eleventy-plugin-rss"));
  
  // 添加图片处理插件
  const Image = require("@11ty/eleventy-img");
  
  // 图片短代码（本地文件走 @11ty/eleventy-img；远程URL直接输出 <img>）
  eleventyConfig.addShortcode("image", async function(src, alt, sizes) {
    try {
      if (typeof src === "string" && /^https?:\/\//i.test(src)) {
        return `<img src="${src}" alt="${alt || ''}" loading="lazy" decoding="async" sizes="${sizes || ''}">`;
      }

    let metadata = await Image(src, {
      widths: [300, 400, 600, 800],
      formats: ["webp", "jpeg"],
      outputDir: "./dist/assets/images/",
      urlPath: "/assets/images/"
    });
    
    let imageAttributes = {
      alt,
      sizes,
      loading: "lazy",
      decoding: "async",
    };
    
    return Image.generateHTML(metadata, imageAttributes);
    } catch (e) {
      // 回退策略：出现异常时直接输出 <img>
      return `<img src="${src}" alt="${alt || ''}" loading="lazy" decoding="async" sizes="${sizes || ''}">`;
    }
  });
  
  // 添加过滤器
  eleventyConfig.addFilter("fmtDate", function(date) {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  // 添加标签翻译过滤器
  eleventyConfig.addFilter("translateCategory", function(category) {
    const translations = {
      'design': '设计',
      'art': '艺术',
      'dev': '开发',
      'product': '产品',
      'startup': '创业'
    };
    return translations[category] || category;
  });

  // 添加日期格式化过滤器
  eleventyConfig.addFilter("formatDate", function(date) {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return {
      year: year,
      month: month,
      day: day
    };
  });

  // 添加日期时间格式化过滤器
  eleventyConfig.addFilter("fmtDateTime", function(dateObj) {
    if (!dateObj) return "";
    const d = new Date(dateObj);
    if (isNaN(d)) return "";
    
    const year = d.getFullYear();
    const month = d.getMonth() + 1; // 不补零
    const day = d.getDate(); // 不补零
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  });
  
  // 添加短代码
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  // 设置 permalink 过滤器，用于新目录结构
  eleventyConfig.addFilter("setContentPermalink", function(inputPath, slug, section, type) {
    // content-xing -> /xing/
    if (inputPath.includes('content-xing')) {
      return `/xing/${slug}/index.html`;
    }
    // content-observation -> /zhi/observation/
    if (inputPath.includes('content-observation')) {
      return `/zhi/observation/${slug}/index.html`;
    }
    // content-reading -> /zhi/reading/
    if (inputPath.includes('content-reading')) {
      return `/zhi/reading/${slug}/index.html`;
    }
    // content-writing -> /zhi/writing/
    if (inputPath.includes('content-writing')) {
      return `/zhi/writing/${slug}/index.html`;
    }
    return null;
  });

  // 定义collections - 使用新的 *content 目录结构
  // 通过 src/content 符号链接访问 *content 目录
  eleventyConfig.addCollection("xing_all", function(collectionApi) {
    // 使用 fallback 方法，因为 glob 模式在处理符号链接时可能有问题
    let items = collectionApi.getFilteredByGlob("content/content-xing/*.md");
    if (items.length === 0) {
      // 如果 glob 找不到，从所有文件中过滤
      items = collectionApi.getAll().filter(item => {
        const inputPath = item.inputPath || '';
        return inputPath.includes('content-xing') && inputPath.endsWith('.md');
      });
    }
    return items
      .filter(item => !item.data.isDraft && !item.data.isHidden)
      .sort((a, b) => {
        // 按日期降序排列，如果没有日期则排到最后
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateB - dateA;
      });
  });

  eleventyConfig.addCollection("zhi-observation", function(collectionApi) {
    // 使用 fallback 方法，因为 glob 模式在处理符号链接时可能有问题
    let items = collectionApi.getFilteredByGlob("content/content-observation/*.md");
    if (items.length === 0) {
      // 如果 glob 找不到，从所有文件中过滤
      items = collectionApi.getAll().filter(item => {
        const inputPath = item.inputPath || '';
        return inputPath.includes('content-observation') && inputPath.endsWith('.md');
      });
    }
    return items
      .filter(item => !item.data.isDraft)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  });

  eleventyConfig.addCollection("writing", function(collectionApi) {
    let items = collectionApi.getFilteredByGlob("content/content-writing/*.md");
    if (items.length === 0) {
      items = collectionApi.getAll().filter(item => {
        const inputPath = item.inputPath || '';
        return inputPath.includes('content-writing') && inputPath.endsWith('.md');
      });
    }
    return items
      .filter(item => !item.data.isDraft)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  });

  eleventyConfig.addCollection("reading", function(collectionApi) {
    let items = collectionApi.getFilteredByGlob("content/content-reading/*.md");
    if (items.length === 0) {
      items = collectionApi.getAll().filter(item => {
        const inputPath = item.inputPath || '';
        return inputPath.includes('content-reading') && inputPath.endsWith('.md');
      });
    }
    return items
      .filter(item => !item.data.isDraft)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  });


  // 复制静态资源
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("public");
  // 复制 content-assets 到 dist 目录（通过符号链接）
  eleventyConfig.addPassthroughCopy("content/content-assets");
  
  // 添加 content 目录到监听列表，确保符号链接中的文件能被 Eleventy 识别
  eleventyConfig.addWatchTarget("content/");

  // 使用 eleventyComputed 来设置 permalink
  eleventyConfig.addGlobalData("eleventyComputed", {
    permalink: function(data) {
      // 如果文件已经指定了permalink，则使用文件中的permalink
      if (data.permalink) {
        return data.permalink;
      }
      
      // 跳过 entries 目录中的文件（使用旧目录结构）
      const inputPath = data.page?.inputPath || '';
      if (inputPath.includes('entries/')) {
        return false; // 让默认 permalink 生效
      }
      
      const section = data.section || "misc";
      const slug = data.page?.fileSlug || '';
      
      // 优先使用 section 字段
      if (section === "xing") {
        return `/xing/${slug}/index.html`;
      }
      
      return false; // 返回 false 让其他 permalink 逻辑生效
    }
  });

  // 设置输入和输出目录
  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "_includes/layouts",
      data: "_data"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    serverOptions: {
      port: 8080
    },
    // 性能优化设置
    watchIgnores: [
      "postEditor/**/*",
      "node_modules/**/*",
      "dist/**/*",
      ".git/**/*"
    ],
    // 减少文件监听
    watchJavaScriptDependencies: false
  };
};
