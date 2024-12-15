export class genTree {
    /**
     * タイプが'root'
     */
    static get CHECKED_TYPE_ROOT() {
        return 1;
    }
    /**
     * タイプが'node'
     */
    static get CHECKED_TYPE_NODE() {
        return 2;
    }
    #parentDivElement;
    #layer;
    #checkedType = 3;
    #dataJson;
    #defaultFontSize = 16;
    #defaultFontMargen = 2;
    #actualHeigth = 0;
    //デフォルトインデント
    #indent = 15;
    //デフォルトspacling
    #leftPadding = 10;
    //デフォルト1行の高さ
    #defaultRowHeigt = -1;
    //ユニークなID
    #uid = "";
    #arrayData = [];
    #tmpArrayData = []; //作業用
    //#rowRender: ((...args: T) => any) | undefined = undefined;
    #rowRender = undefined;
    #onCLickEventMethod = undefined;
    #onCLickedEventMethod = undefined;
    #onRenderRowEventMethod = undefined;
    #onRenderEventMethod = undefined;
    #beforeMouseMoveIdx = -1;
    constructor(el, option) {
        this.#parentDivElement = el;
        this.#parentDivElement.classList.add('genTree');
        this.#parentDivElement.classList.add('pl');
        //レイヤーの追加
        const layer = document.createElement('div');
        layer.style.position = 'absolute';
        layer.style.left = '0px';
        layer.style.top = '0px';
        layer.style.width = '100%';
        layer.style.height = '100%';
        layer.style.border = '0px';
        layer.style.padding = '0px';
        layer.style.margin = '0px';
        layer.style.backgroundColor = 'rgba(0, 0, 0, 0)';
        layer.classList.add('topLayer');
        this.#parentDivElement.appendChild(layer);
        this.#layer = layer;
        //rowrendareカスタムメソッド
        if (option && ("rowRender" in option)) {
            this.#rowRender = option.rowRender;
        }
        if (option && ("checkedType" in option)) {
            this.#checkedType = option.checkedType;
        }
        if (option && ('resizer' in option) && option.resizer == true) {
            window.addEventListener('resize', (e) => {
                e.preventDefault();
                this.#scrollRender();
            });
        }
        //jsonデータ
        this.#dataJson = [];
        //デフォルトフォントサイズ
        if (option && ("fontSize" in option)) {
            this.#defaultFontSize = option.fontSize;
        }
        //実フォントの縦サイズを取得
        this.#actualHeigth = this.#resetActualHeight();
        //ユニークなID
        this.#uid = this.#getUniqueStr();
        this.#layer.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            const pos = this.#getPointerEvetPosition(e);
            //今クリックした行数を求める
            const height = this.#getRowHeight();
            const index = Math.floor(pos.y / height);
            if (this.#arrayData.length - 1 < index)
                return;
            //ユーザー側のクリックイベントの実行
            let afrer = (this.#onCLickEventMethod) ? this.#onCLickEventMethod(e.currentTarget, this.#arrayData[index]) : true;
            if (!afrer)
                afrer = true;
            this.setSelected(this.#arrayData[index].id);
            if (afrer) {
                //子供を持ってるいる場合は展開・縮小を行う
                if (this.#arrayData[index].type === 'root') {
                    this.#arrayData[index].open = !(this.#arrayData[index].open);
                    this.setData(this.#dataJson);
                    this.#beforeMouseMoveIdx = -1; //絶対動作させるため値をリセットさせる
                    this.#classAddHover(index); //カーソルがおかれている行のハイライト
                }
            }
            if (this.#onCLickedEventMethod)
                this.#onCLickedEventMethod(e.currentTarget, this.#arrayData[index]);
        });
        //マウスオーバーイベント
        this.#layer.addEventListener("mousemove", (e) => {
            e.stopPropagation();
            e.preventDefault();
            const pos = this.#getPointerEvetPosition(e);
            //カーソルのある行数を求める
            const height = this.#getRowHeight();
            const index = Math.floor(pos.y / height);
            this.#classAddHover(index);
        });
        //スクロールイベント
        this.#parentDivElement.addEventListener("scroll", (e) => {
            e.preventDefault();
            this.#scrollRender();
        });
    }
    /**
     * フォントサイズを指定します
     * @property {number}
     */
    set fontSize(val) {
        this.#defaultFontSize = val | 0;
        if (this.#dataJson) {
            this.#actualHeigth = this.#resetActualHeight();
            this.setData(this.#dataJson);
        }
    }
    /**
     * 1行の高さを指定します
     * @param val
     */
    set rowHeight(val) {
        this.#defaultRowHeigt = val;
    }
    //前回セットした位置を覚えせてまた同じ位置だったら無駄な処理をさせない様にする
    //マウスが移動したときにその行に'hover'を追加する　
    #classAddHover(index) {
        if (this.#beforeMouseMoveIdx != index) {
            const beforeDiv = this.#layer.getElementsByClassName('hover');
            for (let i = 0; i < beforeDiv.length; i++) {
                const element = beforeDiv[i];
                element.classList.remove('hover');
            }
            const moveDiv = document.getElementById(this.#uid + "_" + index);
            if (moveDiv) {
                moveDiv.classList.add('hover');
            }
        }
        this.#beforeMouseMoveIdx = index;
    }
    /**
     * clickイベント時などのクリックした座標を求める
     * @param {PointerEvent} pointerEvent ポインターイベント
     * @returns {{x:number,y:number}}
     */
    #getPointerEvetPosition(pointerEvent) {
        const clickX = pointerEvent.pageX;
        const clickY = pointerEvent.pageY;
        let positionX = 0;
        let positionY = 0;
        if (pointerEvent.currentTarget) {
            const elemnt = pointerEvent.currentTarget;
            const clientRect = elemnt.getBoundingClientRect();
            positionX = clientRect.left + window.scrollX;
            positionY = clientRect.top + window.scrollY;
        }
        // 要素内におけるクリック位置を計算
        const x = clickX - positionX;
        const y = clickY - positionY;
        return { x: x, y: y };
    }
    #resetActualHeight() {
        const tesSpan = document.createElement('span');
        tesSpan.textContent = 'あ';
        tesSpan.style.fontSize = this.#defaultFontSize + "px";
        this.#parentDivElement.appendChild(tesSpan);
        const rect = this.#retrieveCharactersRects(tesSpan);
        this.#parentDivElement.removeChild(tesSpan);
        return rect[0].rect.height;
    }
    /**
     * JavaScriptで文字列の矩形領域を１文字ずつ取得する
     * @param {Element} elem Element
     * @returns {{character:string,rect:DOMRect}[]}
     */
    #retrieveCharactersRects(elem) {
        if (elem.nodeType == elem.TEXT_NODE) {
            const range = elem.ownerDocument.createRange();
            // selectNodeContentsを実行することでText NodeにRangeをフォーカスさせ，
            // 文字列のoffsetを取得する
            range.selectNodeContents(elem);
            let current_pos = 0;
            const end_pos = range.endOffset;
            const results = [];
            while (current_pos < end_pos) {
                range.setStart(elem, current_pos);
                range.setEnd(elem, (current_pos + 1) | 0);
                current_pos = (current_pos + 1) | 0;
                results.push({ character: range.toString(), rect: range.getBoundingClientRect() });
            }
            range.detach();
            return results;
        }
        else {
            const results = [];
            const childNodesLength = elem.childNodes.length;
            for (let i = 0; i < (childNodesLength | 0); i = (i + 1) | 0) {
                results.push(this.#retrieveCharactersRects(elem.childNodes[i | 0]));
            }
            // 結果の配列をフラットにする
            return Array.prototype.concat.apply([], results);
        }
        //console.log("retrieveCharactersRects return null");
    }
    #getUniqueStr(myStrong) {
        let strong = 1000;
        if (myStrong)
            strong = myStrong;
        return new Date().getTime().toString(16) + Math.floor(strong * Math.random()).toString(16);
    }
    /**
     * スタイルシート既存ルールを追加＆更新を行う
     * @param {string} keySelecter このセレクターがあるcssシートに更新を行う
     * @param {string} selector 更新を行うセレクター（なければ追加）
     * @param {string} updateRule ルール
     *
     * @example
     * #cssRuleUpdate(".another-dynamic-class",
     *      ".another-dynamic-class",
     *      "{ background-color: yellow; }"
     * )
     */
    #cssRuleUpdate(keySelecter, selector, updateRule) {
        const sheets = document.styleSheets;
        let rules = null;
        let sheet;
        for (let i = 0; i < sheets.length; i++) {
            // keySelecterが持つCSSシートを取得
            try {
                rules = sheets[i].cssRules;
                for (let j = 0; j < rules.length; j++) {
                    // セレクタが一致するか調べる
                    if (keySelecter === rules[j].selectorText) {
                        sheet = rules[j];
                        break;
                    }
                }
                if (sheet !== undefined)
                    break;
            }
            catch (e) {
            }
        }
        if (sheet !== undefined) {
            // 特定のルールを探して削除してから再挿入
            for (let i = 0; i < sheet.cssRules.length; i++) {
                const rules = sheet.cssRules[i];
                if (rules.selectorText === selector) {
                    sheet.deleteRule(i); // 削除
                    break;
                }
            }
            //ルール追加
            sheet.insertRule(selector + " " + updateRule, sheet.cssRules.length);
        }
    }
    /**
     * 一行の高さを求めます
     * @returns {number}
     */
    #getRowHeight() {
        if (this.#defaultRowHeigt === -1) {
            return (this.#actualHeigth + (this.#defaultFontMargen * 2));
        }
        return this.#defaultRowHeigt;
    }
    /**
     * 指定したものをselected状態にする
     * @param {string} id jsonDataのID
     */
    setSelected(id) {
        let index = -1;
        const length = this.#arrayData.length;
        for (let i = 0; i < (length | 0); i = (i + 1) | 0) {
            const data = this.#arrayData[i];
            if (data.id === id) {
                index = i;
                break;
            }
        }
    }
    /**
     * データを設定します
     * @param {{}} json
     */
    setData(json) {
        this.#dataJson = json;
        this.update();
    }
    /**
     * 表示を更新する
     */
    update() {
        this.#tmpArrayData = [];
        this.#toArrayData(this.#dataJson);
        this.#arrayData = this.#tmpArrayData;
        this.#render();
        this.#layerReSzie();
    }
    /**
     * レイヤーのリサイズをする
     */
    #layerReSzie() {
        //横幅取得
        const width = Number(this.#parentDivElement.style.width.replace('px', ''));
        //縦幅取得
        //縦幅は行数×1行の高さで求める
        const rowHeight = this.#getRowHeight();
        let height = (this.#arrayData.length * rowHeight) | 0;
        //高さは元のウィンドウより小さい場合は元ウインドウサイズに合わせる
        const orgHeight = Number(this.#parentDivElement.style.height.replace('px', ''));
        if (height < orgHeight) {
            height = orgHeight;
        }
        //値をセット
        // this._layer.style.width = width + 'px';
        this.#layer.style.height = height + 'px';
    }
    /**
     * josn形式から配列に変換する(全て上書き)
     * @param {*} json
     */
    #toArrayData(json, level = 0) {
        if (!json)
            return;
        //一番上は配列とする
        const len = json.length | 0;
        for (let i = 0; i < (len | 0); i = (i + 1) | 0) {
            const obj = json[i];
            const pushData = obj;
            pushData["level"] = level;
            this.#tmpArrayData.push(pushData);
            if ((obj.type === "root") &&
                (obj.open && ("open" in obj)) &&
                ("child" in obj)) {
                this.#toArrayData(obj["child"], (level + 1) | 0);
            }
        }
    }
    #render() {
        //子要素を全て消す
        while (this.#layer.firstChild)
            this.#layer.removeChild(this.#layer.firstChild);
        this.#scrollRender();
    }
    #scrollRender() {
        const renderInfo = this.#getViewRenderInfo();
        //削除処理
        const deleteElementList = [];
        //表示されたるリストに該当するデータ
        const viewArrayData = [];
        const layerCount = this.#layer.childElementCount;
        for (let i = 0; i < layerCount; i = (i + 1) | 0) {
            const idx = Number(this.#layer.children[i].id.split('_')[1]);
            if (!(idx >= renderInfo.hideTopIdx && idx < renderInfo.hideBottomIdx)) {
                deleteElementList.push(this.#layer.children[i | 0]);
            }
        }
        for (let i = 0; i < deleteElementList.length; i = (i + 1) | 0) {
            const deleteRow = deleteElementList[i];
            if (deleteRow.parentNode)
                deleteRow.parentNode.removeChild(deleteRow);
        }
        //追加処理
        const df = document.createDocumentFragment();
        const renderBottomIdx = renderInfo.hideBottomIdx;
        for (let i = renderInfo.hideTopIdx; i <= (renderBottomIdx | 0); i = (i + 1) | 0) {
            if (document.getElementById(this.#uid + "_" + i) == null) {
                const newDiv = this.#createRowDiv(i);
                viewArrayData.push(this.#arrayData[i]);
                if (this.#onRenderRowEventMethod)
                    this.#onRenderRowEventMethod(this.#arrayData[i]);
                df.appendChild(newDiv);
            }
        }
        this.#layer.appendChild(df);
        if (this.#onRenderEventMethod)
            this.#onRenderEventMethod(viewArrayData);
    }
    #getViewRenderInfo() {
        //表示されてる一番上の位置と、下の位置を取得(px)
        const viewTop = this.#parentDivElement.scrollTop | 0;
        const viewBottom = this.#parentDivElement.offsetHeight + viewTop;
        const rowHeight = this.#getRowHeight();
        //
        const viewTopIdx = Math.floor(viewTop / rowHeight);
        const viewBottomIdx = Math.floor(viewBottom / rowHeight);
        let hideTopIdx = (viewTopIdx - 3) | 0;
        let hideBottomIdx = (viewBottomIdx + 3) | 0;
        if (hideTopIdx < 0) {
            hideTopIdx = 0;
        }
        if (hideBottomIdx > (this.#arrayData.length - 1)) {
            hideBottomIdx = this.#arrayData.length - 1;
        }
        return { viewTopIdx: viewTopIdx,
            viewBottomIdx: viewBottomIdx,
            hideTopIdx: hideTopIdx,
            hideBottomIdx: hideBottomIdx };
    }
    #createRowDiv(rowId) {
        const height = this.#getRowHeight();
        const newDiv = document.createElement('div');
        newDiv.style.height = height + 'px';
        newDiv.style.top = (rowId * height) + 'px';
        newDiv.id = this.#uid + '_' + rowId;
        newDiv.classList.add('row');
        const data = this.#arrayData[rowId];
        if (!('level' in data)) {
            console.log('not level data=' + data);
        }
        if (('selected' in data) && data.selected === true) {
            newDiv.classList.add('selected');
        }
        //インデント
        const indent = document.createElement('div');
        indent.classList.add('indent');
        indent.style.width = this.#leftPadding + this.#indent * (data.level + 1) + "px";
        newDiv.appendChild(indent);
        const rowContent = document.createElement('div');
        rowContent.classList.add('row-content');
        newDiv.appendChild(rowContent);
        if (this.#rowRender == null) {
            const textNode = document.createElement('span');
            textNode.classList.add('rowtext');
            textNode.style.fontSize = this.#defaultFontSize + "px";
            textNode.style.lineHeight = height + 'px';
            textNode.textContent = data.name;
            rowContent.appendChild(textNode);
        }
        else {
            rowContent.appendChild(this.#rowRender(data));
        }
        //アイコン
        if (data.type === 'root') {
            if (('open' in data) && data.open) {
                indent.classList.add('icon-open');
            }
            else {
                indent.classList.add('icon-close');
            }
        }
        if (('iconClass' in data) && data.iconClass) {
            indent.classList.add(data.iconClass);
        }
        return newDiv;
    }
    /**
     * 1行作成(表示）されるタイミングで呼ばれます
     * @param {function} callback
     */
    onRenderRowEvent(callback) {
        this.#onRenderRowEventMethod = callback;
    }
    /**
     * 表示・表示更新タイミングで呼ばれます。
     * @param {function} callback
     */
    onRenderEvent(callback) {
        this.#onRenderEventMethod = callback;
    }
    /**
     * 表示・表示更新タイミングで呼ばれます。
     * @param {function} callback
     */
    onClickEvent(callback) {
        this.#onCLickEventMethod = callback;
    }
    /**
     * ある行リックされた時、処理が実行後に呼ばれます
     * @param {function} callback
     */
    onClickedEvent(callback) {
        this.#onCLickedEventMethod = callback;
    }
}
//# sourceMappingURL=genTree.js.map