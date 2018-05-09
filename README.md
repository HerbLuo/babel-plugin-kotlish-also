### 使用方式
一：安装
```bash
npm install --save-dev babel-plugin-kotlish-also
```
二：在.babelrc添加如下plugin
```json
{
  "plugins": [
    "kotlish-also"
  ]
}
```

### 使用场景
来看下面这段代码
```javascript
const foo = (o) => o.a().b.c
```
如果我们调试时想要输出 `o` 或 `o.a()` 等，
通常情况下，我们不得不做出如下改变
```javascript
// if we want to print o or o.a etc
const foo = (o) => {
  console.log(o)
  const t = o.a()
  console.log(t)
  return t.b.c
}
```
当调试完毕，又要改回原有代码，
也算是相当麻烦，
当使用了 `kotlish-also` 后，可以写成这样
```javascript
const foo = (o) => 
  o.also(i => console.log(i))
    .a().also(i => console.log(i))
    .b.c
```
或者使用'it'省略匿名函数也可以
```javascript
const foo = (o) =>
  o.also(console.log(it))
    .a().also(console.log(it))
    .b.c
```
插件最终会将代码转换成如下形式
```javascript
const foo = (o) => {
  return function (_o) {
    (function (it) {
      return console.log(it);
    })(_o);

    return _o;
  }(function (_o) {
    (function (it) {
      return console.log(it);
    })(_o);

    return _o;
  }(o).a()).b.c;
}
```
甚至，插件为了方便输出，增加了alsoPrint方法
```javascript
const a = obj.alsoPrint().a.alsoPrint('变量a的值为%o')
```
等价于
```javascript
const a = obj.also(function (_o) {
  console.log(_o)
}).a.also(function (_o) {
  console.log('变量a的值为%o', _o)
})
```

除了also，
kotlish-also 同时提供的方法还有let,takeIf,takeUnless等，
它们都是仿照kotlin编写的，其具体语法可参考 [kotlin stdlib functions](http://kotlinlang.org/api/latest/jvm/stdlib/kotlin/index.html#functions)
