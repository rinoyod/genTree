# genTree
この `genTree` クラスは、階層型データ（ツリー）を描画し、ユーザー操作を処理するためのJavaScriptクラスです。主に以下の機能を提供しています。

### 主な機能

1. **階層型データの描画**  
   - `setData(json)` メソッドでデータを設定し、ツリー構造を描画します。
   - データは階層構造で、親ノードと子ノードを表現できます。

2. **インタラクション**
   - 行クリック、マウス移動、スクロールなどのユーザー操作に応じて動的に反応します。
   - クリック時にイベントハンドラーを設定可能。

3. **カスタマイズ**
   - `rowRender` オプションを利用して、1行の描画をカスタマイズ可能。
   - フォントサイズや1行の高さ、インデントなどを設定可能。

4. **レンダリングの最適化**
   - 表示範囲のみを描画し、スクロール時に非表示の要素を動的に管理することでパフォーマンスを向上。

### サポートするオプション

- **resizer**: ウィンドウリサイズ時に再描画をトリガー。
- **rowRender**: 行ごとのカスタム描画関数。
- **checkedType**: ノードの選択可能タイプ（`CHECKED_TYPE_ROOT` or `CHECKED_TYPE_NODE`）。


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

const demoTree = new genTree('demoTree'); //IDを指定
demoTree.setData(data); //json形式のデータをセット

```
リファレンスは[こちら](https://github.com/rinoyod/genTree/tree/master/js)を参照してください。

詳しい使い方は[デモサイト](https://rinoyod.netlify.app/gentree/demo/)を参照してください。
