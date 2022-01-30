# genTree
ツリー表示を行うライブラリです。

## 使い方
html
```html
<!-- 幅、高さを指定したdivを用意-->
<div id="demoTree" style="left:10px; width: 350px; height: 200px;  border-style: solid; border-width: 1px;"></div>
```
javascript
```javascript
var data = [
    {
        id:1,
        type:'root',
        name:'ルート',
        open: false, /* 展開させたい場合は trueにする*/
        child:[
            {
                id:2,
                type:'node',
                name:'子データ１'
            },
        ]
    }
];

const demoTree = new genTree(document.getElementById('div')); //エレメントを指定
demoTree.setData(data); //json形式のデータをセット

```
リファレンスは[こちら](https://github.com/rinoyod/genTree/tree/master/js)を参照してください。

詳しい使い方は[デモサイト](https://rinoyod.netlify.app/gentree/demo/)を参照してください。
