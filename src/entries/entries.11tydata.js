module.exports = {
  eleventyComputed: {
    layout: (data) => {
      // 如果文件已经指定了layout，则使用文件中的layout
      if (data.layout) return data.layout;
      
      const t = data.type;
      if (t === "work")        return "layouts/project.njk";
      if (t === "note")        return "layouts/project.njk";
      if (t === "observation") return "layouts/observation.njk";
      if (t === "reading")     return "layouts/reading.njk";
      if (t === "collection")  return "layouts/project.njk";
      return "layouts/base.njk";
    },
    permalink: (data) => {
      const slug    = data.page.fileSlug;
      const section = data.section || "misc";
      const type    = data.type || "note";
      if (section === "xing" && type === "work") return `/xing/projects/${slug}/index.html`;
      if (section === "zhi" && type === "note")        return `/zhi/writing/${slug}/index.html`;
      if (section === "zhi" && type === "observation") return `/zhi/observation/${slug}/index.html`;
      if (section === "zhi" && type === "reading")     return `/zhi/reading/${slug}/index.html`;
      if (section === "zhi" && type === "collection")  return `/zhi/collection/${slug}/index.html`;
      return `/${section}/${slug}/index.html`;
    },
  },
};
