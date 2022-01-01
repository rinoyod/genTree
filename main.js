

//treeRenderTest
genTree.path('');
var treeRend = new genTree(document.getElementById('divTree'));
var testNode = [
    {
        id:1,
        type:'root',
        name:'ルート',
        open: true,
        child:[
            {
                id:2,
                type:'node',
                name:'子供１'
            },
            {
                id:2,
                type:'node',
                name:'子供２'
            },
            {
                id:4,
                type:'root',
                name:'親1-3',
                open: false,
                child:[
                    {
                        id:5,
                        type:'node',
                        name:'子供1-3-1'
                    },      
                ]
            },
            {
                id:3,
                type:'node',
                name:'子供1-2'
            },
            {
                id:2,
                type:'node',
                name:'子供２'
            },
            {
                id:2,
                type:'node',
                name:'子供２'
            },
            {
                id:2,
                type:'node',
                name:'子供２'
            },
            {
                id:2,
                type:'node',
                name:'子供２'
            },
            {
                id:2,
                type:'node',
                name:'子供２'
            },
            {
                id:2,
                type:'node',
                name:'子供２'
            },
            {
                id:2,
                type:'node',
                name:'子供２'
            },
            {
                id:2,
                type:'node',
                name:'子供２'
            },
            {
                id:2,
                type:'node',
                name:'子供２'
            },
            {
                id:2,
                type:'node',
                name:'子供２'
            },
            
        ]
    }
];
treeRend.setData(testNode);

treeRend.eClick(function(e,d){
    console.log(d);
    
})

document.getElementById('button_fontSize').addEventListener('click', function(e){

    treeRend.fontSize = document.getElementById('text_fontSize').value;


});

let iconTogle = true;
document.getElementById('button_iconChange').addEventListener('click', function(e){

    const svgClose = document.createElement('img');
    const svgOpen = document.createElement('img');
    if(iconTogle){
        svgOpen.src = 'test/open_folder.svg';
        svgClose.src = 'test/close_folder.svg';
    }else{
        svgOpen.src = 'img/down.svg';
        svgClose.src = 'img/right.svg';
    }

    svgClose.width = "10";
    svgClose.height = "10";

    svgOpen.width = "10";
    svgOpen.height = "10";

    treeRend.setCloseIcon(svgClose,{left:'-15px',top:'7px'});
    treeRend.setOpenIcon(svgOpen,{left:'-15px',top:'7px'});

    treeRend.update();


    iconTogle = !iconTogle;

});

