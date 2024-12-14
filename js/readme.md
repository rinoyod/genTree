# genTree リファレンス

## 概要
`genTree` は階層データを効率的に描画・操作できる軽量な JavaScript クラスです。以下はその主な特徴です:

- ツリー構造データの描画
- ユーザー操作（クリック、スクロール、リサイズ）への対応
- 高度なカスタマイズオプション
- レンダリングの最適化

---

## クラスの使用方法

### インスタンス生成

```javascript
const tree = new genTree("containerID", options);
```

- **`containerID`**: 描画先のHTML要素のID(Divエレメント)
- **`options`**: 初期化時のオプション（詳細は後述）

### データ設定

```javascript
tree.setData(jsonData);
```

- **`jsonData`**: ツリー構造データ（詳細は[データ構造](#データ構造)を参照）

---

## メソッド一覧

### 1. `setData(json)`
ツリー構造データを設定し、描画を行います。

- **引数**: 
  - `json`: 階層データ（配列形式）
- **例**:

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

### 2. `getData()`
現在設定されているデータを取得します。

- **戻り値**: 現在のツリーデータ（配列形式）
- **例**:

```javascript
const currentData = tree.getData();
console.log(currentData);
```

---

### 3. `setSelected(id)`
指定したノードを選択状態にします。

- **引数**: 
  - `id`: 選択したいノードのID
- **例**:

```javascript
tree.setSelected("1-1");
```

---

### 4. `eClick(callback)`
ノードがクリックされた際のイベントを設定します。

- **引数**: 
  - `callback`: コールバック関数 (引数はクリックされた要素とデータ)
- **例**:

```javascript
tree.eClick((element, data) => {
    console.log("クリックされました:", data);
    return true; // falseを返すと既定の処理を停止
});
```

---

### 5. `eClicked(callback)`
ノードのクリックイベント後に発火するイベントを設定します。

- **引数**: 
  - `callback`: コールバック関数 (引数はクリックされた要素とデータ)
- **例**:

```javascript
tree.eClicked((element, data) => {
    console.log("クリック完了:", data);
});
```

---

### 6. `static path(path)`
リソースのパスを設定します（画像やCSSの参照先）。

- **引数**:
  - `path`: リソースの基準パス
- **例**:

```javascript
genTree.path("/assets/");
```

---

### 7. `update()`
ツリーの表示を再描画します。  
現在のデータを再利用し、変更された部分を更新します。

- **引数**: なし
- **戻り値**: なし
- **例**:

```javascript
// データの一部を変更
const currentData = tree.getData();
currentData[0].name = "Updated Root Node";

// 再描画
tree.update();
```

**用途**:  
`getData()` で取得したデータを直接編集後、`update()` を呼び出すことで、ツリー表示を最新状態に反映させることができます。

---

## オプション

`genTree` のコンストラクタで渡すオプションです。

| オプション       | 型                 | 説明                                                                             |
|-------------------|--------------------|----------------------------------------------------------------------------------|
| `resizer`        | `boolean`          | ウィンドウリサイズ時に再描画するかを指定します。                                   |
| `rowRender`      | `function`         | 各行をカスタマイズ描画する関数を設定します。                                       |
| `checkedType`    | `number`           | チェック可能なノードのタイプを設定します。                                         |
| `fontSize`       | `number`           | ツリー描画のフォントサイズを指定します（デフォルトは 14px）。                     |
| `rowHeight`      | `number`           | 各行の高さ（ピクセル単位）を指定します（デフォルトは 20px）。                     |

- **例**:

```javascript
const tree = new genTree("container", {
    resizer: true,
    rowRender: (data) => {
        const div = document.createElement("div");
        div.textContent = `Custom Node: ${data.name}`;
        return div;
    },
    checkedType: genTree.CHECKED_TYPE_NODE,
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
                "date": "2022/03/02", // ライブラリが使わないプロパティ名は自由に使用できる
            }
        ]
    }
]
```

### プロパティ

| プロパティ名 | 必須 | 型       | 説明                          |
|--------------|------|----------|-------------------------------|
| `id`?         | Yes  | `string` | ノードの一意な識別子          |
| `name`        | Yes  | `string` | ツリーに表示される名前                      |
| `type`        | Yes  | `string` | ノードのタイプ 'root' or 'node' rootはサブツリーがある場合、ない場合はnodeを指定 |
| `open`        | No   | `boolean`| ノードを展開するかどうか。typeが'root'の場合必要。trueの場合はサブツリーが展開されて表示される      |
| `iconClass`   | No   | `string` | アイコンの部分に独自のクラス名を付与します（これを使い各ノードのアイコンを変更できます）|
| `child`       | No   | `array`  | 子ノードの配列                |
| `selected`(readOnly)    | No   |`boolean` |  ライブラリ側が付与。該当箇所が選択された場合追加される  |
| `level`(readOnly)      | No   | `number`  | 階層レベル（自動設定されます） |


 

他、上記のプロパティ名以外にユーザーが独自のプロパティ名でデータを組み込めます

---

## サンプルコード

html
```html
<!-- 幅、高さを指定したdivを用意-->
<div id="treeContainer" style="left:10px; width: 350px; height: 200px;  border-style: solid; border-width: 1px;"></div>
```
JavaScript
```javascript
genTree.path("/static/");

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

const tree = new genTree("treeContainer", {
    resizer: true,
    rowRender: (data) => {
        const div = document.createElement("div");
        div.textContent = data.name;
        return div;
    },
    checkedType: genTree.CHECKED_TYPE_NODE,
});

tree.setData(data);

tree.eClick((element, data) => {
    console.log("Node clicked:", data);
    return true;
});

tree.eClicked((element, data) => {
    console.log("After click:", data);
});
```
