const mongoose = require('mongoose');

// 连接数据库：[ip/域名]:[端口号(默认27017)]/[数据库(db)]
mongoose.connect('mongodb://127.0.0.1:27017/user', {
  useNewUrlParser: true
});



module.exports = mongoose;