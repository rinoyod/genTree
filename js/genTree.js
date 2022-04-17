class genTree {

    static classPath = "";
    static path(path){
        genTree.classPath = path;
    }

    /**
     * タイプが'root'
     */
    static get CHECKED_TYPE_ROOT(){
        return 1;
    }

    /**
     * タイプが'node'
     */
    static get CHECKED_TYPE_NODE(){
        return 2;
    }

    //イベントメソッド
    _eClickMethod = function(e,p){return true};  //クリック（処理前）
    _eClickedMethod = function(e,p){return true};//クリック（処理後）
    _onRenderEventMethod = function(e){}; //表示直後
    _onRenderRowEventMethod = function(e){}; //１行生成
    

    /**
     * 
     * @param {stiring} id DivエレメントのID
     * @param {{resizer:boolean,rowRender:function,checkedType:number}} option 
     * @property option.resizer true windowリサイズした時にレンダリング処理させる
     * @property option.rowRender 1行の表示のカスタマイズ
     * @property option.checkedType クリックしたときに checkedクラスを付与するかどうか CHECKED_TYPE_ROOT,CHECKED_TYPE_NODEで指定
     */
    constructor(id, option ={}){

        this._parentDivElement = document.getElementById(id);
        this._parentDivElement.classList.add('genTree');
        this._parentDivElement.classList.add('pl');

        //レイヤーの追加
        const layer = document.createElement('div');
        layer.style.position = 'absolute';
        layer.style.left = '0px';
        layer.style.top  = '0px';
        layer.style.width = '100%';
        layer.style.height = '100%';
        layer.style.border = '0px';
        layer.style.padding = '0px';
        layer.style.margin = '0px';
        layer.style.backgroundColor = 'rgba(0, 0, 0, 0)';
        layer.classList.add('topLayer');
        this._parentDivElement.appendChild(layer);

        this._layer = layer;

        this._selectedObj = null;

        this._rowRender = null; //rowrendareカスタムメソッド
        if('rowRender' in option){
            this._rowRender = option.rowRender;
        }

        this._checkedType = 3; //両方チェックが機能する
        if('checkedType' in option){
            this._checkedType = option.checkedType;
        }

        //クリックイベント
        this._layer.addEventListener('click', function(e){
            e.stopPropagation();
            e.preventDefault();

            const pos = this._getPointerEvetPosition(e);

            //今クリックした行数を求める
            const height = this._getRowHeight();
            const index = Math.floor(pos.y/height);
            //console.log('topLayer click row[' + index + ']');

            if(this._arrayData.length -1 < index){
                return;
            }

            //ユーザー側のクリックイベントの実行
            const after = this._eClickMethod(e.currentTarget, this._arrayData[index]);


            //selectedの処理
            this.setSelected(this._arrayData[index].id);


            if(after == null || after == true){
                //子供を持ってるいる場合は展開・縮小を行う
                if(this._arrayData[index].type === 'root'){
                    this._arrayData[index].open = !(this._arrayData[index].open);
                    this.setData(this._json);
                    this._beforeMouseMoveIdx = -1;//絶対動作させるため値をリセットさせる
                    this._classAddHover(index);//カーソルがおかれている行のハイライト
                }
            }
            
            //ユーザー側のクリック後イベントの実行
            this._eClickedMethod(e.currentTarget, this._arrayData[index]);


        }.bind(this));
        
        //マウスオーバーイベント
        this._layer.addEventListener('mousemove', function(e){
            e.stopPropagation();
            e.preventDefault();

            const pos = this._getPointerEvetPosition(e);
            //カーソルのある行数を求める
            const height = this._getRowHeight();
            const index = Math.floor(pos.y/height);

            this._classAddHover(index);

            
        }.bind(this));

        //スクロールイベント
        this._parentDivElement.addEventListener('scroll', function(e){
            e.preventDefault();
            //console.log('scroll ' + e.currentTarget.scrollTop);
            this._scrollRender();
        }.bind(this));


        if(('resizer' in option) && option.resizer == true){
            window.addEventListener('resize', function(e){
                e.preventDefault();
                this._scrollRender();
            }.bind(this));
        }

        //jsonデータ
        this._json = [];

        //デフォルトフォントサイズ
        this._defaultFontSize = 16;
        if('fontSize' in option){
            this._defaultFontSize = option.fontSize;
        }

        //デフォルトフォントマージン（縦）
        this._defaultFontMargen = 2;

        //実フォントの縦サイズを取得
        this._actualHeigth = this._resetActualHeight();


        //デフォルトインデント
        this._indent = 15;

        //デフォルトspacling
        this._leftPadding = 10;

        //デフォルト1行の高さ
        this._defaultRowHeigt = -1;


        //ユニークなID
        this._uid = this._getUniqueStr();

        
        //デフォルトアイコン（open)
        const iconOpenRules = this._getRuleBySelector('.genTree .icon-open');
        iconOpenRules.style.backgroundImage = `url(${genTree.classPath}/img/down.svg)`;


        //デフォルトアイコン（close)
        const iconCloseRules = this._getRuleBySelector('.genTree .icon-close');
        iconCloseRules.style.backgroundImage = 'url(' +genTree.classPath + '/img/right.svg)';


        //配列データ
        this._arrayData = [];
        this._tmpArrayData = []; //作業用

        //console.log('thisfile ='+ this._getCurrentScript());
    }

    /**
     * フォントサイズを指定します
     * @property {number}
     */
    set fontSize(val){
        this._defaultFontSize = val|0;
        if(this._json){
            this._actualHeigth = this._resetActualHeight();
            this.setData(this._json);
        }
    }

    /**
     * 1行の高さを指定します
     * @param val
     */
    set rowHeight(val){
        this._defaultRowHeigt = val;
    }

    /**
     * 指定したものをselected状態にする
     * @param {string} id jsonDataのID
     */
    setSelected(id){


        let index = -1;
        for (let i = 0; i < this._arrayData.length; i++) {
            const data = this._arrayData[i];
            if(data.id == id){
                index = i;
                break;
            }
            
        }

        let workChekedType = 0;
        if((this._arrayData[index].type == 'root')){
            workChekedType = workChekedType  + genTree.CHECKED_TYPE_ROOT;
        }
        if((this._arrayData[index].type == 'node')){
            workChekedType = workChekedType  + genTree.CHECKED_TYPE_NODE;
        }

        if((workChekedType & this._checkedType) != workChekedType){
            return;
        }


        //selectedの処理
        if(this._selectedObj != null){
            this._selectedObj['selected'] = false;
        }

        for (let i = 0; i < this._layer.childElementCount; i=(i+1)|0) {
            const idx = this._layer.children[i].id.split('_')[1]|0;
            if('selected' in this._arrayData[idx]){
                delete this._arrayData[idx].selected;
                const deleteEl = document.getElementById(this._uid + "_" + idx);
                if(deleteEl){
                    deleteEl.classList.remove('selected');
                }
                break;
            }
        }

        this._arrayData[index]['selected'] = true;
        this._selectedObj = this._arrayData[index];
        const selectedEl = document.getElementById(this._uid + "_" + index);
        if(selectedEl){
            selectedEl.classList.add('selected');
        }
    }

    getSelectedData(){

        for (let i = 0; i < this._arrayData.length; i++) {
            const data = this._arrayData[i];
            if('selected' in data){
                return data;
            }
            
        }
        return null;
    }

    /**
     * 表示を更新する
     */
    update(){
        this._tmpArrayData = []
        this._toArrayData(this._json);
        this._arrayData = this._tmpArrayData;
        this._render();
        this._layerReSzie();
    }

    _resetActualHeight(){
        const tesSpan = document.createElement('span');
        tesSpan.textContent = 'あ';
        tesSpan.style.fontSize = this._defaultFontSize + "px";
        this._parentDivElement.appendChild(tesSpan);
        const rect = this._retrieveCharactersRects(tesSpan);
        this._parentDivElement.removeChild(tesSpan);

        return rect[0].rect.height;
    }

    /**
     * clickイベント時などのクリックした座標を求める
     * @param {PointerEvent} pointerEvent ポインターイベント
     * @returns {{x:number,y:number}}
     */
    _getPointerEvetPosition(pointerEvent){
        const clickX = pointerEvent.pageX;
        const clickY = pointerEvent.pageY;

        const clientRect = pointerEvent.currentTarget.getBoundingClientRect();
        const positionX  = clientRect.left + window.pageXOffset;
        const positionY  = clientRect.top  + window.pageYOffset;

        // 要素内におけるクリック位置を計算
        const x = clickX - positionX;
        const y = clickY - positionY;

        return {x:x,y:y}
    }

    _getCurrentScript() {
        if (document.currentScript) {
            return document.currentScript.src;
        } else {
            var scripts = document.getElementsByTagName('script'),
            script = scripts[scripts.length-1];
            if (script.src) {
                return script.src;
            }
        }
    }



    _getRowHeight(){
        if(this._defaultRowHeigt === -1){
            return (this._actualHeigth + (this._defaultFontMargen*2));
        }

        return this._defaultRowHeigt;
    }

    /**
     * レイヤーのリサイズをする
     */
    _layerReSzie(){

        //横幅取得
        const width = this._parentDivElement.style.width.replace('px','')|0;

        //縦幅取得
        //縦幅は行数×1行の高さで求める
        const rowHeight = this._getRowHeight();
        let height = (this._arrayData.length * rowHeight)|0;

        //高さは元のウィンドウより小さい場合は元ウインドウサイズに合わせる
        const orgHeight = this._parentDivElement.style.height.replace('px','')|0;
        if(height < orgHeight){
            height = orgHeight;
        }

        //値をセット
       // this._layer.style.width = width + 'px';
        this._layer.style.height = height + 'px';
    }

    /**
     * josn形式から配列に変換する(全て上書き)
     * @param {*} json 
     */
    _toArrayData(json, level =0){

        if(!json) return;
        
        //一番上は配列とする
        

        const len = json.length|0;
        for(let i=0; i<len|0; i=(i+1)|0){
            const obj = json[i];

            const pushData = obj;
            pushData['level'] = level;

            this._tmpArrayData.push(pushData);

            if(obj.type === 'root'){
                if(('open' in obj) && obj.open){
                    if('child' in obj){
                        this._toArrayData(obj.child, (level+1)|0);
                    }
                }
            }
        }

    }

    _createRowDiv(rowId){

        if(rowId ==1){
            const t = 1;
        }

        const height = this._getRowHeight();

        const newDiv = document.createElement('div');
        newDiv.style.height = height + 'px';
        newDiv.style.top   = (rowId * height) + 'px';
        newDiv.id = this._uid + '_' + rowId;
        newDiv.classList.add('row');

        const data = this._arrayData[rowId];


        if(!('level' in data)){
            console.log('not level data=' + data);
        }

        if(('selected' in data) && data.selected === true){
            newDiv.classList.add('selected');
        }


        //インデント
        const indent = document.createElement('div');
        indent.classList.add('indent');
        indent.style.width = this._leftPadding + this._indent * (data.level +1) +"px";
        newDiv.appendChild(indent);

        const rowContent = document.createElement('div');
        rowContent.classList.add('row-content');
        newDiv.appendChild(rowContent);

        
        if(this._rowRender == null){

            const textNode = document.createElement('span');
        
            textNode.classList.add('rowtext');
            textNode.style.fontSize = this._defaultFontSize + "px";
            textNode.style.lineHeight = height + 'px';
            textNode.textContent = data.name;
            rowContent.appendChild(textNode);
        }else {
            rowContent.appendChild(this._rowRender(data));
        }

        //アイコン
        if(data.type === 'root'){
            if(('open' in data) && data.open){
                indent.classList.add('icon-open');
            }else{
                indent.classList.add('icon-close');
            }

        }

        return newDiv;

    }

    _render(){

        //子要素を全て消す
        while (this._layer.firstChild) this._layer.removeChild(this._layer.firstChild);

        this._scrollRender();
    }

    _getViewRenderInfo() {
        //表示されてる一番上の位置と、下の位置を取得(px)
        const viewTop = this._parentDivElement.scrollTop|0;
        const viewBottom = this._parentDivElement.offsetHeight + viewTop;

        const rowHeight = this._getRowHeight();
        //
        const viewTopIdx    = Math.floor(viewTop / rowHeight);
        const viewBottomIdx = Math.floor(viewBottom / rowHeight);

        let hideTopIdx = (viewTopIdx -3)|0;
        let hideBottomIdx = (viewBottomIdx +3)|0;

        if(hideTopIdx < 0){
            hideTopIdx = 0;
        }

        if(hideBottomIdx > (this._arrayData.length -1)){
            hideBottomIdx = this._arrayData.length -1;
        }

        return {viewTopIdx: viewTopIdx,
                viewBottomIdx: viewBottomIdx,
                hideTopIdx: hideTopIdx,
                hideBottomIdx: hideBottomIdx};

    }

    _scrollRender(){

        const renderInfo = this._getViewRenderInfo();

        //削除処理
        const deleteElementList = [];

        //表示されたるリストに該当するデータ
        const viewArrayData = [];


        for (let i = 0; i < this._layer.childElementCount; i=(i+1)|0) {
            const idx = this._layer.children[i].id.split('_')[1];
            if( !(idx >= renderInfo.hideTopIdx && idx < renderInfo.hideBottomIdx)){
                deleteElementList.push(this._layer.children[i|0]);
            }
            
        }

        for(let i = 0; i< deleteElementList.length; i= (i+1)|0){
			const deleteRow = deleteElementList[i];
			deleteRow.parentNode.removeChild(deleteRow);
		}

        //追加処理
        const df = document.createDocumentFragment();
        for(let i = renderInfo.hideTopIdx; i <= renderInfo.hideBottomIdx|0; i=(i+1)|0){
			if(document.getElementById(this._uid + "_" + i) == null){
				const newDiv = this._createRowDiv(i)
                viewArrayData.push(this._arrayData[i]);
                this._onRenderRowEventMethod(this._arrayData[i]);
				df.appendChild(newDiv);

			}
		}
        this._layer.appendChild(df);

        this._onRenderEventMethod(viewArrayData);
    }

    /**
     * 表示・表示更新タイミングで呼ばれます。
     * @param {function} callback 
     */
    onRenderEvent(callback){
        this._onRenderEventMethod = callback;
    }

    /**
     * 1行作成(表示）されるタイミングで呼ばれます
     * @param {function} callback 
     */
    onRenderRowEvent(callback){
        this._onRenderRowEventMethod = callback;
    }


    _getUniqueStr(myStrong){
        let strong = 1000;
        if (myStrong) strong = myStrong;
        return new Date().getTime().toString(16)  + Math.floor(strong*Math.random()).toString(16);
    }

    /**
     * JavaScriptで文字列の矩形領域を１文字ずつ取得する
     * @param {Element} elem Element
     * @returns {[rect]}
     */
    _retrieveCharactersRects(elem) {
        if(elem.nodeType == elem.TEXT_NODE) {

            const range = elem.ownerDocument.createRange();

            // selectNodeContentsを実行することでText NodeにRangeをフォーカスさせ，
            // 文字列のoffsetを取得する
            range.selectNodeContents(elem);

            let current_pos = 0;
            const end_pos = range.endOffset;

            const results = [];

            while(current_pos  < end_pos) {
                range.setStart(elem, current_pos);
                range.setEnd(elem, (current_pos + 1)|0);
                current_pos = (current_pos+1)|0;

                results.push({character: range.toString(), rect: range.getBoundingClientRect()});
            }

            range.detach();

            return results;

        } else {

            const results = [];
            for(let i = 0; i < (elem.childNodes.length)|0; i=(i+1)|0) {
                results.push(this._retrieveCharactersRects(elem.childNodes[i|0]));
            }

            // 結果の配列をフラットにする
            return Array.prototype.concat.apply([], results);
        }
        //console.log("retrieveCharactersRects return null");
        return null;
    }

    //前回セットした位置を覚えせてまた同じ位置だったら無駄な処理をさせない様にする
    _beforeMouseMoveIdx = -1;
    //マウスが移動したときにその行に'hover'を追加する　
    _classAddHover(index){

        if(this._beforeMouseMoveIdx != index){
            const beforeDiv = this._layer.getElementsByClassName('hover');
            for (let i = 0; i < beforeDiv.length; i++) {
                const element = beforeDiv[i];
                element.classList.remove('hover');
            }

             const moveDiv = document.getElementById(this._uid + "_" + index);
             if(moveDiv){
                 moveDiv.classList.add('hover');
             }
        }

        this._beforeMouseMoveIdx = index;
    }
   
    /**
     * cssルールの取得
     * @param {strintg} sele cssクラス名
     * @returns 
     */
    _getRuleBySelector(sele){
        let rule = null;
    
        // stylesheetのリストを取得
        const sheets = document.styleSheets;
        for(let i=0; i<sheets.length; i++){
            // そのstylesheetが持つCSSルールのリストを取得
            const rules = sheets[i].cssRules;
            for(let j=0; j<rules.length; j++){
                // セレクタが一致するか調べる
                if(sele === rules[j].selectorText){
                    rule = rules[j];
                    break;
                }
            }
        }
        return rule;
    }

    /**
     * データを設定します
     * @param {{}} json 
     */
    setData(json){
        this._json = json;
        this.update();
    }
    
    /**
     * データを取得します
     * @returns 
     */
    getData(){
        return this._json;
    }

    /**
     * ある行リックされた時、処理が実行前に呼ばれます
     * falseを返すと後続の処理を行いません
     * @param {object} callback 処理
     */
    eClick(callback){
        this._eClickMethod = callback;
    }

    /**
     * ある行リックされた時、処理が実行後に呼ばれます
     * @param {object} callback 処理
     */
    eClicked(callback){
        this._eClickedMethod = callback;
    }

    /**
     * 指定したRowのエレメントIDからしていた行のデータを取得します
     */
    getDataFromElementId(elementId){

        return this._arrayData[elementId.replace(this._uid + "_", "")];
    }

    /**
     * 
     * @param {*} id 
     * @returns 
     */
    getDataById(id){

        for (let i = 0; i < this._arrayData.length; i++) {
            const data = this._arrayData[i];
            if(data.id == id){
                return data;
            }
            
        }
        return null;
    }
}