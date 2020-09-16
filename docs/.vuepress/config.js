const { version } = require("../../package.json");

module.exports = {
  title: "Spark Torrent Backend",
  description: "The backend project for the Spark-torrent project",
  base: "/docs/",
  themeConfig: {
    version,
    sidebar: [
      "/",
      {
        title: "APIs",
        collapsable: false,
        children: [
          "/api/errors.md",
          "/api/torrent.md",
          "/api/subtitles.md",
          "/api/search.md",
          "/api/yts.md"
        ]
      }
    ],
    docsDir: "docs",
    editLinks: true,
    editLinkText: "Help us improve this page!",
    smoothScroll: true
  }
};
