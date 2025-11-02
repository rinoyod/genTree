# genTree リファレンス

## 概要
genTree は階層データを効率的に描画・操作できる軽量な JavaScript/TypeScript クラスです。  
主な特徴は以下の通りです:

- ツリー構造データの描画
- ユーザー操作（クリック、スクロール、リサイズ）への対応
- 高度なカスタマイズオプション
- レンダリングの最適化

---

## TypeScript 5.5 以降の対応について

TypeScript 5.5 以降では、`erasableSyntaxOnly` や `verbatimModuleSyntax: true` に対応しています。  
`tsconfig.json` で `verbatimModuleSyntax: true` を指定することで、ESM構文の厳密な扱いが可能です。  
これにより、`export`/`import` の構文がそのまま出力され、Node.jsやブラウザのESM環境とより高い互換性を持ちます。

```json
{
  "compilerOptions": {
    // ...他の設定...
    "verbatimModuleSyntax": true
  }
}
```

---

## クラスの使用方法

### インスタンス生成

```javascript
const containerID = document.getElementById("containerID");
const tree = new genTree(containerID, options);

```

- **containerID**: 描画先のHTMLElement
- **options**: 初期化時のオプション（詳細は後述）

### データ設定

```javascript
tree.setData(jsonData);
```

- **jsonData**: ツリー構造データ（詳細はデータ構造を参照）

---

## メソッド一覧

### 1. setData(json)
ツリー構造データを設定し、描画を行います。

- **引数**:  
  - json: 階層データ（配列形式）

**例:**
```javascript
const data = [
    {
        id: "1",
        name: "Parent Node",
        type: "root",
        open: true,
        child: [
            { id: "1-1", name: "Child Node 1", type: "node" },
            { id: "1-2", name: "Child Node 2", type: "node" },
        ]
    }
];
tree.setData(data);
```

---

### ~~2. getData()~~
現在設定されているデータを取得します。

- **戻り値**: 現在のツリーデータ（配列形式）

**例:**
```javascript
const currentData = tree.getData();
console.log(currentData);
```

---

### 3. setSelected(id)
指定したノードを選択状態にします。

- **引数**:  
  - id: 選択したいノードのID

**例:**
```javascript
tree.setSelected("1-1");
```

---

### 4. onClickEvent(callback)
ノードがクリックされた際のイベントを設定します（クリック前）。

- **引数**:  
  - callback: コールバック関数 (引数はクリックされた要素とデータ)

**例:**
```javascript
tree.onClickEvent((element, data) => {
    console.log("クリックされました:", data);
    return true; // falseを返すと既定の処理を停止
});
```

---

### 5. onClickedEvent(callback)
ノードのクリックイベント後に発火するイベントを設定します（クリック後）。

- **引数**:  
  - callback: コールバック関数 (引数はクリックされた要素とデータ)

**例:**
```javascript
tree.onClickedEvent((element, data) => {
    console.log("クリック完了:", data);
});
```

---

### ~~6. static path(path)~~
リソースのパスを設定します（画像やCSSの参照先）。

- **引数**:  
  - path: リソースの基準パス

**例:**
```javascript

```

---

### 7. update()
ツリーの表示を再描画します。  
現在のデータを再利用し、変更された部分を更新します。

- **引数**: なし
- **戻り値**: なし

**例:**
```javascript
// データの一部を変更
const currentData = tree.getData();
currentData[0].name = "Updated Root Node";
// 再描画
tree.update();
```

---
etData()
現在設定されているツリーデータ（配列形式）を取得します。
データの内容を確認したり、外部で加工したい場合に利用します。

戻り値:
現在のツリーデータ（配列形式）  

例:
```javascript
const currentData = tree.getData();
console.log(currentData);
```
### setDataRow
指定したノードIDのデータを部分更新します。更新後は必要な範囲のみ再描画されます。

- シグネチャ
  - setDataRow(id: string, patch: Partial<GenTreeNode>): boolean
- 引数
  - id: 更新対象ノードのID
  - patch: 上書きしたいプロパティのみを含む部分オブジェクト
- 戻り値
  - boolean: 更新に成功した場合は true、見つからない場合は false
- 備考
  - 大量更新時は複数回の呼び出しより、一括で setData を使う方が高速です

使用例:
```ts
const ok = tree.setDataRow('1-2', { name: '名称を更新', open: true });
if (!ok) console.warn('ノードが見つかりませんでした');
```

---

### findDataById
ツリー全体から指定IDのノードを検索して返します。

- シグネチャ
  - findDataById(id: string): GenTreeNode | null
- 引数
  - id: 検索対象ノードのID
- 戻り値
  - 該当ノード（見つからない場合は null）

使用例:
```ts
const node = tree.findDataById('1-2');
if (node) {
  console.log('見つかったノード:', node);
} else {
  console.log('該当IDは存在しません');
}
```
## オプション

genTree のコンストラクタで渡すオプションです。

| オプション    | 型        | 説明                                                                 |
|---------------|-----------|----------------------------------------------------------------------|
| resizer       | boolean   | ウィンドウリサイズ時に再描画するかを指定します。                      |
| rowRender     | function(data)  | 各行をカスタマイズ描画する関数を設定します。 <br>引数には１行分のオブジェクトデータが渡されます                         |
| checkedType   | number    | チェック可能なノードのタイプを設定します。                            |
| fontSize      | number    | ツリー描画のフォントサイズを指定します（デフォルトは 14px）。         |
| rowHeight     | number    | 各行の高さ（ピクセル単位）を指定します（デフォルトは 20px）。         |

**例:**
```javascript
const containerID = document.getElementById("containerID");
const tree = new genTree("containerID", {
    resizer: true,
    rowRender: (data) => {
        const div = document.createElement("div");
        div.textContent = `Custom Node: ${data.name}`;
        return div;
    },
    checkedType: genTree.CHECKED_TYPE_NODE,
    fontSize: 16,
});
```

---

## データ構造

### 基本形式

以下の形式でデータを渡します。

```json
[
    {
        "id": "1",
        "name": "Node Name",
        "type": "root",
        "open": true,
        "child": [
            {
                "id": "1-1",
                "name": "Child Node",
                "type": "node",
                "date": "2022/03/02" // ライブラリが使わないプロパティ名は自由に使用できる
            }
        ]
    }
]
```

### プロパティ

| プロパティ名         | 必須 | 型       | 説明                                               |
|----------------------|------|----------|----------------------------------------------------|
| id                   | Yes  | string   | ノードの一意な識別子                               |
| name                 | Yes  | string   | ツリーに表示される名前                             |
| type                 | Yes  | string   | ノードのタイプ 'root' or 'node'                    |
| open                 | No   | boolean  | ノードを展開するかどうか（typeが'root'の場合のみ）  |
| iconClass            | No   | string   | アイコン部分に独自のクラス名を付与                 |
| child                | No   | array    | 子ノードの配列                                     |
| selected (readOnly)  | No   | boolean  | ライブラリ側が付与。該当箇所が選択された場合追加   |
| level (readOnly)     | No   | number   | 階層レベル（自動設定されます）                     |

他、上記以外のプロパティも自由に追加可能です。

---

## サンプルコード

### html

```html
<link rel="stylesheet" href="css/genTree.css" />
 .
 .
 .
<!-- 幅、高さを指定したdivを用意-->
<div id="treeContainer" style="left:10px; width: 350px; height: 200px;  border-style: solid; border-width: 1px;"></div>
```

### JavaScript

```javascript


const data = [
    {
        id: "1",
        name: "Root Node",
        type: "root",
        open: true,
        child: [
            { id: "1-1", name: "Child 1", type: "node" },
            { id: "1-2", name: "Child 2", type: "node" },
        ]
    }
];

const treeContainer = document.getElementById('treeContainer');

const tree = new genTree(treeContainer, {
    resizer: true,
    rowRender: (data) => {
        const div = document.createElement("div");
        div.textContent = data.name;
        return div;
    },
    checkedType: genTree.CHECKED_TYPE_NODE,
    fontSize: 16,
});

tree.setData(data);

tree.onClickEvent((element, data) => {
    console.log("Node clicked:", data);
    return true;
});

tree.onClickedEvent((element, data) => {
    console.log("After click:", data);
});
```

---

## 注意

- TypeScript 5.5 以降では `erasableSyntaxOnly` や `verbatimModuleSyntax: true` に対応しています。
- コンストラクタの第1引数は「HTMLElement」を直接渡してください。
- イベント名やAPI名は `onClickEvent` などキャメルケースです（`eClick` ではありません）。
- `getData()` メソッドは現状未実装の場合があります。データ取得は内部状態を直接参照してください。
