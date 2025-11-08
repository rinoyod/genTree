/**
 * https://github.com/rinoyod/genTree
 */
export type GenTreeNode = {
    id: string; // ノードの一意な識別子
    name: string; // ノードの名前
    type: string; // ノードの種類（例：root, nodeなど）
    child?: GenTreeNode[]; // 子ノードの配列
    iconClass?: string; //アイコンを個別に設定したい時等に使う（展開、閉じるアイコンのところに追加される）
    [key: string]: any; // ユーザーが追加するカスタムプロパティを許容
}

export type genTreeOption<T extends unknown[]> = {
    resizer?: boolean,
    rowRender?: ((data: GenTreeNode) => void),
    checkedType?: number,
    fontSize?: number,
    rowHeight?: number,
    indent?: number,
};


export class genTree<T extends unknown[]> {

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
    #dataJson: any;
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
    #arrayData: GenTreeNode[] = [];
    #tmpArrayData: GenTreeNode[] = []; //作業用
    #selectedObj: GenTreeNode | null;

    //#rowRender: ((...args: T) => any) | undefined = undefined;
    #rowRender: ((data: GenTreeNode) => any) | undefined = undefined;

    #onCLickEventMethod: ((element: HTMLElement, data: GenTreeNode) => Promise<boolean> | boolean) | undefined = undefined;
    #onCLickedEventMethod: ((element: HTMLElement, data: GenTreeNode) => Promise<boolean> | boolean) | undefined = undefined;

    #onRenderRowEventMethod: ((data: GenTreeNode) => any) | undefined = undefined;
    #onRenderEventMethod: ((datas: GenTreeNode[]) => any) | undefined = undefined;

    #beforeMouseMoveIdx = -1;

    #autoOpen = true; //自動で展開するかどうか

    constructor(el: HTMLElement, option?: genTreeOption<T>) {
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

        this.#selectedObj = null;


        this.options = option ? option : {};

        //jsonデータ
        this.#dataJson = [];

        //実フォントの縦サイズを取得
        this.#actualHeigth = this.#resetActualHeight();

        //ユニークなID
        this.#uid = this.#getUniqueStr();


        //スクロールイベント
        this.#parentDivElement.addEventListener("scroll", (e) => {
            e.preventDefault();
            requestAnimationFrame(this.#scrollRender.bind(this));
        });

    }

    /**
     * 自動で展開するかどうかを設定します
     * @property {boolean}
     */
    set autoOpen(val: boolean) {
        this.#autoOpen = val;
    }

    get autoOpen() {
        return this.#autoOpen;
    }

    /**
     * オプションを設定します
     * @property {genTreeOption}
     */
    set options(option: genTreeOption<T>) {
        //rowrendareカスタムメソッド
        if (option && ("rowRender" in option)) {
            this.#rowRender = option.rowRender;
        }

        if (option && ("checkedType" in option)) {
            this.#checkedType = option.checkedType as number;
        }

        const resizerFn = (e: Event) => {
            e.preventDefault();
            this.#scrollRender();
        };

        if (option && ('resizer' in option)) {
            if( option.resizer === true) {
                window.addEventListener('resize', resizerFn);
            }else if( option.resizer === false) {
                window.removeEventListener('resize', resizerFn);
            }
        }

        //デフォルトフォントサイズ
        if (option && ("fontSize" in option)) {
            this.#defaultFontSize = option.fontSize as number;
        }

        //デフォルト1行の高さ
        if (option && ("rowHeight" in option)) {
            this.#defaultRowHeigt = option.rowHeight as number;
        }
    }


    /**
     * フォントサイズを指定します
     * @property {number}
     */
    set fontSize(val: number) {
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
    set rowHeight(val: number) {
        this.#defaultRowHeigt = val;
    }

    /**
     * インデントを設定します
     * @param val
     */
    set indent(val: number) {
        this.#indent = val;
        this.update();
    }

    /**
     * 
     * @param elementId 画面で表示されているリストのID
     * @param newData 
     * @returns 
     */
    setDataRow(elementId: string, newData: GenTreeNode) {

        const id = newData.id;
        const oldJsonDataNode = genTree.#findJsonDataNodeById(id, this.#dataJson);
        if (oldJsonDataNode) {
            // oldJsonDataNode の参照（アドレス）はそのまま、中身だけを newData で上書き
            Object.keys(oldJsonDataNode).forEach(key => {
                // 既存プロパティを削除
                delete (oldJsonDataNode as any)[key];
            });
            Object.keys(newData).forEach(key => {
                // newData の内容をコピー
                (oldJsonDataNode as any)[key] = newData[key];
            });
        }

        const index = this.#arrayData.findIndex(item => item.id === id);
        if (index !== -1) {
            const oldArrayData = this.#arrayData[index];
            // oldArrayData の参照（アドレス）はそのまま、中身だけを newData で上書き
            Object.keys(oldArrayData).forEach(key => {
                // 既存プロパティを削除
                delete (oldArrayData as any)[key];
            });
            Object.keys(newData).forEach(key => {
                // newData の内容をコピー
                (oldArrayData as any)[key] = newData[key];
            });

            // 再描画（その行だけ更新するように最適化も可能）
            const oldDiv = document.getElementById(elementId);
            if (oldDiv && oldDiv.parentNode) {

                //rowRenderが設定されている場合のみ更新処理を行う
                if(this.#rowRender === undefined) return;
                const newDiv = this.#rowRender(oldArrayData);
                oldDiv.parentNode.replaceChild(newDiv, oldDiv);
                
            }
        }


    }

    /**
     * #this.dataJsonからIDでノードを検索して返す(アドレス保持)
     * @param nodes 
     * @param id 
     * @returns 
     */
    static #findJsonDataNodeById(id: string, nodes: GenTreeNode[]): GenTreeNode | null {
        for (const node of nodes) {
            if (node.id === id) return node;
            if (node.child) {
                const found = this.#findJsonDataNodeById(id, node.child);
                if (found) return found;
            }
        }
        return null;
    }

    /**
     * IDでデータを検索して返す(コピーを返す)
     * @param id 
     * @returns 
     */
    findDataById(id: string): GenTreeNode | null {
        const refRowData = genTree.#findJsonDataNodeById(id, this.#dataJson);
        if (refRowData) {
                const copyRowData: GenTreeNode = { ...refRowData };
                return copyRowData;
                // // キーと値の両方を取得してループ
                // Object.entries(refRowData).forEach(([key, fileHandle]) => {
                // // key: キー
                // // fileHandle: 値            });
        }
        return null;
    }

    //前回セットした位置を覚えせてまた同じ位置だったら無駄な処理をさせない様にする
    //マウスが移動したときにその行に'hover'を追加する　
    #classAddHover(index: number) {

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
    #retrieveCharactersRects(elem: Element): { character: string, rect: DOMRect }[] {
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

        } else {

            const results = [];
            const childNodesLength = elem.childNodes.length;
            for (let i = 0; i < (childNodesLength | 0); i = (i + 1) | 0) {
                results.push(this.#retrieveCharactersRects(elem.childNodes[i | 0] as Element));
            }

            // 結果の配列をフラットにする
            return Array.prototype.concat.apply([], results);
        }
        //console.log("retrieveCharactersRects return null");

    }

    #getUniqueStr(myStrong?: number) {
        let strong = 1000;
        if (myStrong) strong = myStrong;
        return new Date().getTime().toString(16) + Math.floor(strong * Math.random()).toString(16);
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
    setSelected(id: string) {

        let index = -1;
        const length = this.#arrayData.length;
        for (let i = 0; i < (length | 0); i = (i + 1) | 0) {
            const data = this.#arrayData[i];
            if (data.id === id) {
                index = i;
                break;
            }

        }

        if (index == -1) return;

        let workChekedType = 0;
        if ((this.#arrayData[index].type == 'root')) {
            workChekedType = workChekedType + genTree.CHECKED_TYPE_ROOT;
        }
        if ((this.#arrayData[index].type == 'node')) {
            workChekedType = workChekedType + genTree.CHECKED_TYPE_NODE;
        }

        if ((workChekedType & this.#checkedType) != workChekedType) {
            return;
        }

        //selectedの処理
        if (this.#selectedObj != null) {
            this.#selectedObj['selected'] = false;
        }

        for (let i = 0; i < this.#layer.childElementCount; i = (i + 1) | 0) {
            const idx = (this.#layer.children[i].id.split('_')[1] as unknown) as number | 0;
            if ('selected' in this.#arrayData[idx]) {
                delete this.#arrayData[idx].selected;
                const deleteEl = document.getElementById(this.#uid + "_" + idx);
                if (deleteEl) {
                    deleteEl.classList.remove('selected');
                }
                break;
            }
        }

        this.#arrayData[index]['selected'] = true;
        this.#selectedObj = this.#arrayData[index];
        const selectedEl = document.getElementById(this.#uid + "_" + index);
        if (selectedEl) {
            selectedEl.classList.add('selected');
        }
    }

    /**
     * データを設定します
     * @param {{}} json 
     */
    setData(json: GenTreeNode[]) {
        this.#dataJson = json;
        this.update();
    }

    /**
     * 内部のノード配列を編集する
     * @param callback 
     */
    editNodeArray(callback: (json: GenTreeNode) => void) {
        for (let i = 0; i < this.#arrayData.length; i++) {
            const json = this.#arrayData[i];
            callback(json);

        }
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
    #toArrayData(json: GenTreeNode[], level = 0) {

        if (!json) return;

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
                this.#toArrayData(obj["child"] as GenTreeNode[], (level + 1) | 0);
            }
        }
    }

    #render() {

        //子要素を全て消す
        while (this.#layer.firstChild) this.#layer.removeChild(this.#layer.firstChild);

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
                const newDiv = this.#createRowDiv(i)
                viewArrayData.push(this.#arrayData[i]);
                if (this.#onRenderRowEventMethod) this.#onRenderRowEventMethod(this.#arrayData[i]);
                df.appendChild(newDiv);

            }
        }
        this.#layer.appendChild(df);

        if (this.#onRenderEventMethod) this.#onRenderEventMethod(viewArrayData);
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

        return {
            viewTopIdx: viewTopIdx,
            viewBottomIdx: viewBottomIdx,
            hideTopIdx: hideTopIdx,
            hideBottomIdx: hideBottomIdx
        };

    }

    #createRowDiv(rowId: number) {

        const height = this.#getRowHeight();

        const newDiv = document.createElement('div');
        newDiv.style.height = height + 'px';
        newDiv.style.top = (rowId * height) + 'px';
        newDiv.id = this.#uid + '_' + rowId;
        newDiv.classList.add('row');

        const data = this.#arrayData[rowId] as GenTreeNode;


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
        } else {
            rowContent.appendChild(this.#rowRender(data));
        }

        //アイコン
        if (data.type === 'root') {
            if (('open' in data) && data.open) {
                indent.classList.add('icon-open');
            } else {
                indent.classList.add('icon-close');
            }
        }

        if (('iconClass' in data) && data.iconClass) {
            const words = data.iconClass.split(" ");
            for (let i = 0; i < words.length; i++) {
                const word = words[i];
                indent.classList.add(word);
            }
        }

        newDiv.addEventListener('mousemove', (e) => {
            e.stopPropagation();   
            e.preventDefault();
            this.#classAddHover(rowId);
        });

        newDiv.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();


            //ユーザー側のクリックイベントの実行
            (this.#onCLickEventMethod) ? this.#onCLickEventMethod(e.currentTarget as HTMLElement, data) : true;

            this.setSelected(data.id);

            if (this.#autoOpen) {
                //子供を持ってるいる場合は展開・縮小を行う
                if (data.type === 'root') {
                    data.open = !(data.open);
                    this.setData(this.#dataJson);
                    this.#beforeMouseMoveIdx = -1;//絶対動作させるため値をリセットさせる
                    this.#classAddHover(rowId);//カーソルがおかれている行のハイライト
                }
            }

            if (this.#onCLickedEventMethod) this.#onCLickedEventMethod(e.currentTarget as HTMLElement, data);

        });


        return newDiv;

    }

    /**
     * 1行作成(表示）されるタイミングで呼ばれます
     * @param {function} callback 
     */
    onRenderRowEvent(callback: (data: GenTreeNode) => void) {
        this.#onRenderRowEventMethod = callback;
    }

    /**
     * 表示・表示更新タイミングで呼ばれます。
     * @param {function} callback 
     */
    onRenderEvent(callback: (data: GenTreeNode[]) => void) {
        this.#onRenderEventMethod = callback;
    }

    /**
     * ある行リックされた時、処理が実行前に呼ばれます
     * @param {function} callback 
     */
    onClickEvent(callback: (element: HTMLElement, data: GenTreeNode) => Promise<boolean> | boolean) {
        this.#onCLickEventMethod = callback;
    }

    /**
     * ある行リックされた時、処理が実行後に呼ばれます
     * @param {function} callback 
     */
    onClickedEvent(callback: (element: HTMLElement, data: GenTreeNode) => Promise<boolean> | boolean) {
        this.#onCLickedEventMethod = callback;
    }

}
