const fs = require('fs');
const path = 'package.json';

function Demo(name){
  
  console.log(Object.keys(this));
}
Demo('zzz');

function testFileAction(){
  fs.readFile(path, (err, data) => {
    if (err) {
      return console.error(err);
    }
    console.log('\r\n --Macrotask Queue-- fs.readFile nesting none', err, data);
    setTimeout(() => {
      console.log('\r\n --Macrotask Queue-- setTimeout nesting in file.readFile');
    }, 0);
    setImmediate(() => {        // callback5
      console.log('\r\n --Macrotask Queue-- setImmediate nesting in file.readFile');
    })
  });
  /*
  const res = fs.readFileSync('app.js');
  console.log('\r\n --Macrotask Queue-- fs.readFileSync nesting none 111', res);
  */
}
// testFileAction();

console.log('\r\n --Global Queue-- start nesting none');

setImmediate(() => {        // callback5
  console.log('\r\n --Macrotask Queue-- setImmediate nesting none', 555);
  process.nextTick(() => {  // callback6
    console.log('\r\n --Microtask Queue-- process.nextTick nesting in setImmediate-555', 666);  
  })
  Promise.resolve().then(() => {
    console.log('\r\n --Microtask Queue-- Promise.resolve().then nesting in setImmediate-555', 222);
  });
})


setTimeout(() => {          // callback1
  console.log('\r\n --Macrotask Queue-- setTimeout nesting none', 111);
  setTimeout(() => {        // callback2
    console.log('\r\n --Macrotask Queue-- setTimeout nesting in setTimeout-111', 222);
  }, 0);
  setImmediate(() => {      // callback3
    console.log('\r\n --Macrotask Queue-- setImmediate nesting in setTimeout-111', 333);
  })
  process.nextTick(() => {  // callback4
    console.log('\r\n --Microtask Queue-- process.nextTick nesting in setTimeout-111', 444);  
  })
}, 0);

setTimeout(() => {          // callback7              
  console.log('\r\n --Macrotask Queue-- setTimeout nesting none', 777);
  setTimeout(() => {        // callback2
    console.log('\r\n --Macrotask Queue-- setTimeout nesting in setTimeout-777', 222);
  }, 0);
  setImmediate(() => {      // callback3
    console.log('\r\n --Macrotask Queue-- setImmediate nesting in setTimeout-777', 333);
  })
  process.nextTick(() => {  // callback8
    console.log('\r\n --Microtask Queue-- process.nextTick nesting in setTimeout-777', 888);   
  })
  Promise.resolve().then(() => {
    console.log('\r\n --Microtask Queue-- Promise.resolve().then nesting in setTimeout-777', 333);
  });
}, 0);

new Promise((resolve, reject) => {
  console.log('\r\n --Global Queue-- new Promise initialize nesting none', 111);
  resolve(2222);
}).then((res) => {
  console.log('\r\n --Microtask Queue-- new Promise then nesting none', res);
});

Promise.resolve().then(() => {
  console.log('\r\n --Microtask Queue-- Promise.resolve().then nesting none', 111);
});

process.nextTick(() => {    // callback9
  console.log('\r\n --Microtask Queue-- process.nextTick nesting none', 999);  
})

function Parent(){
  console.log('\r\n --Global Queue-- Parent function initialize nesting none', 111);
}

new Parent();

console.log('\r\n --Global Queue-- end nesting none');

/*
大体解释一下NodeJS的Event Loop过程：

1. 执行全局Script的同步代码
2. 执行microtask微任务，先执行所有Next Tick Queue中的所有任务，再执行Other Microtask Queue中的所有任务
开始执行macrotask宏任务，共6个阶段，从第1个阶段开始执行相应每一个阶段macrotask中的所有任务，注意，这里是所有每个阶段宏任务队列的所有任务，在浏览器的Event Loop中是只取宏队列的第一个任务出来执行，每一个阶段的macrotask任务执行完毕后，开始执行微任务，也就是步骤2
Timers Queue -> 步骤2 -> I/O Queue -> 步骤2 -> Check Queue -> 步骤2 -> Close Callback Queue -> 步骤2 -> Timers Queue ......
这就是Node的Event Loop
*/