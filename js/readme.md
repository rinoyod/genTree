# constractor
## new getTree(el: element, option?: object)
#### 引数

* el:element
document.getElementByidなどで取得したdivエレメント
<br>

* option:object
プロパティ
    * font:int フォントサイズ
    * 

---
<br>

# メソッド

## *path (path: string): void*
このコンポーネントのパスを指定します


```javascript
//例
genTree.path('/vender/genTree');
```
<br>
<br>

## setOpenIcon(el:element, position?:object):void
ツー表示の親の展開時の先頭に出力するアイコンを指定します

#### 引数
* el:element<br>
imageなどのエレメント

* posision?:object<br>
アイコンの位置の微調整に使うプロパティ
   * top:int 上位置
   * left:int 左
```javascript
//例
const tree = genTree(divElement);
const icon = document.createElement('img');
icon.src ='xxx.png';
tree.setOpenIcon(icon, {top:1, left:-5});
tree.update(); //再描画
```

<br>
<br>

## setCloseIcon(el:element, position?:object):void
ツー表示の親の縮小時の先頭に出力するアイコンを指定します

#### 引数
* el:element<br>
imageなどのエレメント

* posision?:object<br>
アイコンの位置の微調整に使うプロパティ
   * top:int 上位置
   * left:int 左
```javascript
//例
const tree = genTree(divElement);
const icon = document.createElement('img');
icon.src ='xxx.png';
tree.setCloseIcon(icon, {top:1, left:-5});
tree.update(); //再描画
```
