# constractor
## new getTree(el: element, option?: object)
#### 引数

* el:element
document.getElementByidなどで取得したdivエレメント
<br>

* option:object
プロパティ
    * font:int フォントサイズ
   

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
const tree = new genTree(divElement);
const icon = document.createElement('img');
icon.src ='xxx.png';
tree.setCloseIcon(icon, {top:1, left:-5});
tree.update(); //再描画
```
<br>
<br>

## setData(json: [object]):void
ツリー表示に必要なデータをセットする

#### 引数
* json: [object]
配列の形でjson形式で設定します

 | プロパティ |型  | 説明 |
| --- | --- | --- |
| id? | int or string |ユニークなID  |
| name | string |ツリーに表示される名前  |
| type | string |'root' or 'node' rootはサブツリーがある場合、ない場合はnodeを指定  |
| child | [] |typeが'root'の場合、ここにサブツリー用のobjectを配列に追加する  |
| open| bool |typeが'root'の場合必要。trueの場合はサブツリーが展開されて表示される  |
| (readOnly)selected| bool |  ライブラリ側が付与。該当箇所が選択された場合追加される  |
| (readOnly)level| int |  ライブラリ側が付与。ツリーの階層の深さ  |

```javascript
//例
const tree = new genTree(divElement);
const data =[
    {
        id:1,
        type:'root',
        name:'ルート',
        date: '2022/03/02', //ライブラリが使わないプロパティ名は自由に使用できる
        open: true,
        child:[
            {
                id:2,
                type:'node',
                name:'子供１'
            },
            {
                id:3,
                type:'root',
                name:'親1-3',
                open: false,
                child:[
                    {
                        id:4,
                        type:'node',
                        name:'子供1-3-1'
                    },      
                ]
            },
            {
                id:5,
                type:'node',
                name:'子供1-2'
            },
            
        ]
    }
];

tree.setData(data);

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
const tree = new genTree(divElement);
const icon = document.createElement('img');
icon.src ='xxx.png';
tree.setOpenIcon(icon, {top:1, left:-5});
tree.update(); //再描画
```

<br>
<br>

## update():void
表示を更新します

<br>
<br>

# イベント
## eClick(callback(e,p)):bool?
行がクリックされた時、処理実行前に呼ばれます

#### 引数
* callback コールバック関数
   * e クリックイベント
   * p 該当するobjectデータ

#### 戻り値
falseにすると継続する処理を中断できます。

<br>
<br>

## eClicked(callback(e,p)):void
行がクリックされた時、処理実行後に呼ばれます

#### 引数
* callback コールバック関数
   * e クリックイベント
   * p 該当するobjectデータ



