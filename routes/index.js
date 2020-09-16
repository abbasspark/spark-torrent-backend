const app = require("express")();

app.use("/torrent", require("./torrents"));
app.use("/search", require("./search"));
app.use("/subtitles", require("./subtitles"));
app.use("/yts", require("./yts"));
app.use("/popapi", require("./popcorn"));
module.exports = app;
