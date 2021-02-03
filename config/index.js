const redis = {
  get_host(){
    return '127.0.0.1';
  },
  get_port(){
    return 6379;
  }
}

module.exports = {
  redis
}