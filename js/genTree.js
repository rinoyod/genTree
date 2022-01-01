class genTree {

    static classPath = "";
    static path(path){
        genTree.classPath = path;
    }

    //イベントメソッド
    _eClickMethod = function(e,p){return true};  //クリック（処理前）
    _eClickedMethod = function(e,p){return true};//クリック（処理後）
    

    constructor(divElement,option ={}){

        this._parentDivElement = divElement;
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

        //クリックイベント
        this._layer.addEventListener('click', function(e){
            e.stopPropagation();
            e.preventDefault();

            const pos = this._getPointerEvetPosition(e);

            //今クリックした行数を求める
            const height = this._getRowHeight();
            const index = Math.floor(pos.y/height);
            console.log('topLayer click row[' + index + ']');

            if(this._arrayData.length -1 < index){
                return;
            }

            //ユーザー側のクリックイベントの実行
            const after = this._eClickMethod(e.currentTarget, this._arrayData[index]);

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
            const selectedEl = document.getElementById(this._uid + "_" + index);
            if(selectedEl){
                selectedEl.classList.add('selected');
            }

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
            console.log('scroll ' + e.currentTarget.scrollTop);
            this._scrollRender();
        }.bind(this));


        //jsonデータ
        this._json;

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


        //ユニークなID
        this._uid = this._getUniqueStr();

        
        //デフォルトアイコン（open)
        this._iconOpen = this._createOpenIcon();

        //デフォルトアイコン（close)
        this._iconClose = this._createCloseIcon();


        //配列データ
        this._arrayData = [];
        this._tmpArrayData = []; //作業用

        console.log('thisfile ='+ this._getCurrentScript());
    }

    //プロパティ
    set fontSize(val){
        this._defaultFontSize = val|0;
        if(this._json){
            this._actualHeigth = this._resetActualHeight();
            this.setData(this._json);
        }
    }

    setOpenIcon(element,position ={}){
        this._iconOpen = this._createOpenIcon(element,position);
    }

    setCloseIcon(element,position ={}){
        this._iconClose = this._createCloseIcon(element,position);
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
        return (this._actualHeigth + (this._defaultFontMargen*2));
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
        this._layer.style.width = width + 'px';
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
        newDiv.style.width = '100%';
        newDiv.style.top   = (rowId * height) + 'px';
        newDiv.style.whiteSpace = 'nowrap';
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
        indent.style.position = 'absolute';
        indent.style.left = this._leftPadding +　this._indent * (data.level +1) +"px";
        indent.style.top = "0px";
        newDiv.appendChild(indent);



        const textNode = document.createElement('span');
        textNode.style.fontSize = this._defaultFontSize + "px";
        textNode.textContent = data.name;
        indent.appendChild(textNode);

        //アイコン
        if(data.type === 'root'){
            if(('open' in data) && data.open){
                indent.appendChild(this._iconOpen.cloneNode(true));
            }else{
                indent.appendChild(this._iconClose.cloneNode(true));
            }

        }

        return newDiv;

    }

    _createIcon(type, element = null, position = {}){
        const div = document.createElement('div');
        div.style.position = "absolute";
        div.style.left = "-15px";
        div.style.top = "7px";

        const icon = document.createElement("i");

        if(element == null){
            const svg = document.createElement('img');
            
            const use = document.createElement('use');
            if(type === 'open'){
                svg.src = genTree.classPath + '/img/down.svg';
                //svg.innerHTML = '<use xlink:href="/'+ genTree.classPath + '/img/down.svg' +'"/>'
                svg.classList.add('openIcon');
            }else{
                svg.src = genTree.classPath + '/img/right.svg';
                //svg.innerHTML = '<use xlink:href="/'+ genTree.classPath + '/img/right.svg' +'"/>'
                svg.classList.add('closeIcon');
            }
            svg.width = "10";
            svg.height = "10";
            //svg.append(use);
            
            icon.appendChild(svg);
            div.appendChild(icon);
        }else{
            icon.appendChild(element);
            div.appendChild(icon);
        }

        if('left' in position){
            div.style.left = position.left;
        }

        if('top' in position){
            div.style.top = position.top;
        }


        return div;
    }

    /**
     * 展開時のアイコンを作成
     * @param {HTMLElement} element アイコン（画像）のエレメント
     * @param {{left:string,top:string}} position アイコン（画像）の位置
     * @returns 
     */
     _createOpenIcon(element = null, position={}){

        return this._createIcon('open',element,position);
    }

    /**
     * 収束時のアイコンを作成
     * @param {HTMLElement} element アイコン（画像）のエレメント
     * @param {{left:string,top:string}} position アイコン（画像）の位置
     * @returns 
     */
     _createCloseIcon(element = null, position={}){

        return this._createIcon('close',element,position);
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
				df.appendChild(newDiv);

			}
		}
        this._layer.appendChild(df);
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
    _beforeMouseMoveIdx = -1
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
   
    setData(json){
        this._json = json;
        this.update();
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
}