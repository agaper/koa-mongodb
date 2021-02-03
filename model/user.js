const mongoose = require('../db')

const User = mongoose.model('User', {
  username: {
    type: String,
    unique: true,
    required: true
  }
});

module.exports = User;