module.exports = {
  eleventyComputed: {
    layout: (data) => {
      // 如果文件已经指定了layout，则使用文件中的layout（移除可能的 layouts/ 前缀）
      if (data.layout) {
        let layout = data.layout;
        // 移除 "layouts/" 前缀（如果存在）
        if (layout.startsWith("layouts/")) {
          layout = layout.replace("layouts/", "");
        }
<<<<<<< HEAD
        // 确保返回的是相对于 includes 目录的路径
=======
>>>>>>> dev
        return layout;
      }
      
      // 根据type自动设置layout
      const t = data.type;
      if (t === "work")        return "project.njk";
      if (t === "note")        return "project.njk";
      if (t === "observation") return "observation.njk";  // observation.njk 继承 base.njk
      if (t === "reading")     return "reading.njk";       // reading.njk 继承 base.njk
      if (t === "collection")  return "project.njk";
      return "base.njk";
    },
    pageName: (data) => {
      // 如果文件已经指定了pageName，则使用文件中的pageName
      if (data.pageName) return data.pageName;
      
      // 根据type自动设置pageName
      const t = data.type;
      if (t === "observation") return "observation";
      if (t === "reading")     return "reading";
      if (t === "note")        return "writing";
      if (t === "collection")  return "collection";
      return null;
    },
    pageCSS: (data) => {
      // 如果文件已经指定了pageCSS，则使用文件中的pageCSS
      if (data.pageCSS) return data.pageCSS;
      
      // 根据type自动设置pageCSS
      const t = data.type;
      if (t === "observation") return "/assets/Css/observation.css";
      if (t === "reading")     return "/assets/Css/reading.css";
      if (t === "work")        return "/assets/Css/project.css";
      if (t === "note")        return "/assets/Css/writing.css";
      return null;
    },
    permalink: (data) => {
<<<<<<< HEAD
      // 如果文件已经指定了permalink，则使用文件中的permalink
      if (data.permalink) {
        return data.permalink;
      }
      
      const slug    = data.page?.fileSlug || data.page?.filePathStem?.split('/').pop() || '';
      const section = data.section || "misc";
      const type    = data.type || "note";
      
      // 优先使用 section 字段（最可靠）
      if (section === "xing") {
        return `/xing/${slug}/index.html`;
      }
      
      // 根据目录结构设置正确的 permalink（备用方案）
      // 使用 inputPath 来检测目录（在 Eleventy 中，inputPath 是相对于 input 目录的路径）
      const inputPath = data.page?.inputPath || '';
      const filePathStem = data.page?.filePathStem || '';
      const pathToCheck = inputPath || filePathStem;
      
      // content-xing -> /xing/
      if (pathToCheck.includes('content-xing')) {
        return `/xing/${slug}/index.html`;
      }
      // content-observation -> /zhi/observation/
      if (pathToCheck.includes('content-observation')) {
        return `/zhi/observation/${slug}/index.html`;
      }
      // content-reading -> /zhi/reading/
      if (pathToCheck.includes('content-reading')) {
        return `/zhi/reading/${slug}/index.html`;
      }
      // content-writing -> /zhi/writing/
      if (pathToCheck.includes('content-writing')) {
=======
      const slug    = data.page.fileSlug;
      const section = data.section || "misc";
      const type    = data.type || "note";
      
      // 根据目录结构设置正确的 permalink
      // 使用 inputPath 来检测目录（在 Eleventy 中，inputPath 是相对于 input 目录的路径）
      const inputPath = data.page.inputPath || '';
      
      
      // content-xing -> /xing/
      if (inputPath.indexOf('content-xing') !== -1) {
        return `/xing/${slug}/index.html`;
      }
      // content-observation -> /zhi/observation/
      if (inputPath.indexOf('content-observation') !== -1) {
        return `/zhi/observation/${slug}/index.html`;
      }
      // content-reading -> /zhi/reading/
      if (inputPath.indexOf('content-reading') !== -1) {
        return `/zhi/reading/${slug}/index.html`;
      }
      // content-writing -> /zhi/writing/
      if (inputPath.indexOf('content-writing') !== -1) {
>>>>>>> dev
        return `/zhi/writing/${slug}/index.html`;
      }
      
      // 默认规则（根据 frontmatter）
<<<<<<< HEAD
=======
      if (section === "xing" && (type === "work" || !type)) return `/xing/${slug}/index.html`;
>>>>>>> dev
      if (section === "zhi" && type === "note")        return `/zhi/writing/${slug}/index.html`;
      if (section === "zhi" && type === "observation") return `/zhi/observation/${slug}/index.html`;
      if (section === "zhi" && type === "reading")     return `/zhi/reading/${slug}/index.html`;
      if (section === "zhi" && type === "collection")  return `/zhi/collection/${slug}/index.html`;
      return `/${section}/${slug}/index.html`;
    },
  },
};

