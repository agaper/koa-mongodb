const Koa = require('koa');
//对传入的请求体进行解析

const app = new Koa();
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx);
});

const cors = require('koa2-cors');
// 允许跨域
app.use(cors());

const bodyParser = require("koa-bodyparser"); 
app.use(bodyParser({
  enableTypes: ['json', 'form', 'text']
}));

const registerRouter = require('./router/index')

app.use(registerRouter());

// 测试上传用
app.use(async (ctx, next) => {
  await next();
  if (ctx.path === '/ajax') { 
      ctx.status = 200;
      let data = ctx.request.body;
      console.log('---------------', data);
      ctx.body = {
        msg: 'ok',
        code: 200,
        data: data
      };
  }
});

app.listen(3000, () => {
  console.log('*********[Service] starting at port 3000 ***********');
})