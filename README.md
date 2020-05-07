# express-dirouter
 依据 controller/service 的目录结构自动生成 express-router 路由配置( restful风格 )以及可通过this.service[filename]调用的方法集合

# 安装
```
    npm i -S express-dirouter
```
## 1.目录结构
```
  ├─app.js
  ├─controller
  │     └─test.js
  └─service
        └─one.js
```
## 2.具体应用
app.js
```javascript
const express = require('express')
const app = express()
const port = 3000
const DiRouter = require('express-dirouter')
// 默认配置
app.use(new DiRouter())
/*
 自定义配置
 当controller/service目录在src目录下
 app.use(new DiRouter({
    controllerDir: 'src/controller'
    serviceDir: 'src/service'
 }))
*/
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
```

service/one.js

```javascript
// 例子导出了一个es6对象
module.exports = {
    async bb(){
        await 12;
        return 'bb'
    }
}
```

controller/test.js
```javascript
// 例子导出了一个es6对象
module.exports = {
    async get(req, res) {
        const result = await this.service.one.bb()
        // result 会得到service例子返回的值 ‘bb’
        res.send(result)
    },
    post(req, res) {
        res.send('post is ok')
    },
    put(req, res) {
        const { id } = req.params
        res.send( id )
    }
}
```

## 3.运行结果

 `npm i -S express` 安装 express

 `node app.js` 运行程序

| 请求方式 | 路由     | 返回结果     |
|----------|----------|--------------|
| GET      | /test    | 'bb'         |
| POST     | /test    | 'post is ok' |
| PUT      | /test/12 | 12           |

## 4. 关于 controller 导出对象的命名与restful请求对应值

| key   | method | router    |
|-------|--------|-----------|
| get   | GET    | /test     |
| post  | POST   | /test     |
| show  | GET    | /test/:id |
| put   | PUT    | /test/:id |
| patch | PATCH  | /test/:id |
| del   | DELETE | /test/:id |

