const jwt = require('jsonwebtoken');

module.exports = async (ctx, next) => {
  // 检查是否存在token
  // axios.js中设置了 authorization
  const authorization = ctx.get('Authorization');
  if('' == authorization){
    ctx.throw(401, 'no token detected in http header Authorization');
  }

  const token = authorization.split(' ')[1];
  // 检查token是否已过期
  try {
    await jwt.verify(token, 'cedric1990');
  } catch (error) {
    ctx.throw(401, 'invalid token')
  }

  await next();
}
