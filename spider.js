const http = require('http');
const https = require('https');
const fs = require('fs');
const cheerio = require('cheerio');

const nodeUrl = 'http://hotel.qunar.com/?kwid=47392517&cooperate=baidu';

http.get(nodeUrl, (res) => {
  const { statusCode } = res;  
  const contentType = res.headers['content-type'];
  console.log(statusCode, contentType, res.headers);

  let err = null;
  if(statusCode != 200){
    err = new Error('请求状态码错误');
  }else if( !/^text\/html/.test(contentType) ){
    err = new Error('请求类型错误');
  }
  if(err){
    console.log(`当前请求 Error: ${err}`);
    // 清除缓存
    res.resume();
    return false;
  }

  let rawData = '';
  res.on('data', (chunk) => {
    rawData += chunk;
  });
  res.on('end', () => {
    let $ = cheerio.load(rawData);
    $('img').each((idx, item) => {
      let src = $(item).attr('src');
      if(!src.startsWith('https')){
        src = 'https:' + src;
      }
      https.get(src, (response) => {
        let imgData = '';
        response.setEncoding('binary');
        response.on('data', (chunk) => {
          imgData += chunk;
        });
        response.on('end', () => {
          fs.writeFile(`${__dirname}/images/item_${idx}.png`, imgData, 'binary', (err) => {
            if( err ){
              console.log(`download img file: ${err}`);
            }else{
              console.log("down success");
            }
          } );
        });
      });
    })
  });

}).on('error', (error) => {
  console.log('http.get ', error);
})