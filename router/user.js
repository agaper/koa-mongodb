const Router = require('koa-router');

// key-value存储系统, 存储用户名，验证每个用户名对应的验证码是否正确
const Redis = require('koa-redis');

const createToken = require('../token/createToken');
const checkToken = require('../token/checkToken');

const User = require('../model/user');

const router = new Router({
  prefix: '/api'
});

// 获取redis客户端
const RedisClient = new Redis().client;

router.get('/test', async ctx => {
  ctx.body = {
    code: 0,
    msg: '测试',
  }
})

/*
// 发送邮箱验证码的接口
router.post('/verify', async(ctx, next)=>{
  const username = ctx.request.body.username
  const saveExpire = await Store.hget(`nodemail:${username}`, 'expire') // 拿到过期时间

  console.log(ctx.request.body)
  console.log('当前时间:', new Date().getTime())
  console.log('过期时间：', saveExpire)

  // 检验已存在的验证码是否过期，以限制用户频繁发送验证码
  if (saveExpire && new Date().getTime() - saveExpire < 0) {
    ctx.body = {
      code: -1,
      msg: '发送过于频繁，请稍后再试'
    }
    return
  }

  // QQ邮箱smtp服务权限校验
  const transporter = nodeMailer.createTransport({
   
    // 端口465和587用于电子邮件客户端到电子邮件服务器通信 - 发送电子邮件。
    // 端口465用于smtps SSL加密在任何SMTP级别通信之前自动启动。
    // 端口587用于msa
   
    host: Email.smtp.host,
    port: 587,
    secure: false, // 为true时监听465端口，为false时监听其他端口
    auth: {
      user: Email.smtp.user,
      pass: Email.smtp.pass
    }
  })

  // 邮箱需要接收的信息
  const ko = {
    code: Email.smtp.code(),
    expire: Email.smtp.expire(),
    email: ctx.request.body.email,
    user: ctx.request.body.username
  }

  // 邮件中需要显示的内容
  const mailOptions = {
    from: `"认证邮件" <${Email.smtp.user}>`, // 邮件来自
    to: ko.email, // 邮件发往
    subject: '邀请码', // 邮件主题 标题
    html: `您正在注册****，您的邀请码是${ko.code}` // 邮件内容
  }

  // 执行发送邮件
  await transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      return console.log('error')
    } else {
      Store.hmset(`nodemail:${ko.user}`, 'code', ko.code, 'expire', ko.expire, 'email', ko.email)
    }
  })

  ctx.body = {
    code: 0,
    msg: '验证码已发送，请注意查收，可能会有延时，有效期5分钟'
  }
});
*/

router.post('/register', async (ctx) => {
  const { username, password, email, code } = ctx.request.body;

  if( code ){
    const saveCode = await RedisClient.hget(`nodemail:${username}`, 'code') 
    const saveExpire = await RedisClient.hget(`nodemail:${username}`, 'expire') 

    // 用户提交的验证码是否等于已存的验证码
    if (code === saveCode) {
      if (new Date().getTime() - saveExpire > 0) {
        ctx.body = {
          code: -1,
          msg: '验证码已过期，请重新申请'
        }
        return
      }
    } else {
      ctx.body = {
        code: -1,
        msg: '请填写正确的验证码'
      }
      return
    }
  }else{
    ctx.body = {
      code: -1,
      msg: '请填写验证码'
    }
    return
  }

  const user = await User.find({ username });
  if(user.length){
    ctx.body = {
      code: -1,
      msg: '该用户名已被注册'
    }
    return
  }
  const newUser = await User.create({
    username,
    password,
    email,
    token: createToken(this.username)
  });
  if(newUser){
    ctx.body = {
      code: 0,
      msg: '注册成功'
    }
  }else{
    ctx.body = {
      code: -1,
      msg: '注册失败'
    }
  }
});


router.post('/login', async(ctx, next) => {
  const { username, password } = ctx.request.body;
  let doc = await User.findOne({ username });
  if(!doc){
    ctx.body = {
      code: -1,
      msg: '用户名不存在'
    }
  }else if( doc.password != password ){
    ctx.body = {
      code: -1,
      msg: '密码错误'
    }
  }else if( doc.password === password ){
    let token = createToken(username)
    doc.token = token;
    try {
      await doc.save()
      ctx.body = {
        code: 0,
        msg: '登录成功',
        username,
        token
      }
    } catch (error) {
      ctx.body = {
        code: -1,
        msg: '登录失败，请重新登录',
      }
    }
  }
});

router.get('/alluser', checkToken, async(ctx, next) => {
  try {
    let res = []
    let doc = await User.find({})
    doc.map((item, idx) => {
      res.push({
        username: item.username,
        email: item.email
      });
    })
    ctx.body = {
      code: 0, 
      msg: 'ok',
      res
    }
  } catch (error) {
    ctx.body = {
      code: -1, 
      msg: 'fail',
      res: error
    }
  }
  
})

router.post('/deluser', checkToken, async(ctx, next) => {
  const { username } = ctx.request.body;
  try {
    await User.findOneAndRemove({
      username
    })
    ctx.body = {
      code: 0, 
      msg: '删除成功'
    }
  } catch (error) {
    ctx.body = {
      code: -1, 
      msg: '删除失败'
    }
  }
  
})

module.exports = router
