module.exports = {
  permalink: (data) => {
    const permalink = `/zhi/observation/${data.page.fileSlug}/`;
    console.log(`[DEBUG] Setting permalink for ${data.page.fileSlug}: ${permalink}`);
    return permalink;
  }
};

