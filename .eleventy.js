// 加载环境变量
require('dotenv').config({ path: '.env.local' });

module.exports = function(eleventyConfig) {
  // 添加插件
  eleventyConfig.addPlugin(require("@11ty/eleventy-plugin-rss"));
  
  // 添加图片处理插件
  const Image = require("@11ty/eleventy-img");
  
  // 图片短代码
  eleventyConfig.addShortcode("image", async function(src, alt, sizes) {
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

  // 定义collections
  eleventyConfig.addCollection("xing_all", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/entries/xing/*.md")
      .filter(item => !item.data.isDraft);
  });

  eleventyConfig.addCollection("zhi-observation", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/entries/zhi-observation/*.md")
      .filter(item => !item.data.isDraft)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  });

  eleventyConfig.addCollection("writing", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/entries/zhi-writing/*.md")
      .filter(item => !item.data.isDraft)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  });

  eleventyConfig.addCollection("reading", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/entries/zhi-reading/*.md")
      .filter(item => !item.data.isDraft)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  });

  // 复制静态资源
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("public");

  // 设置输入和输出目录
  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "_includes"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    serverOptions: {
      port: 8080
    }
  };
};
