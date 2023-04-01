

const arrayAnalyNode = [{
			content: null,
			nodes: null
        }]
const nodeChangedArray = [{
    node:null,
    key: null,
    value: null,
    pos:-1
}]
const hideNodeArray = [{
    content: null,
	nodes: null,
    backgroundColor:null
}]

function test__addon(str) {
		console.log(str)
}


function removeHighlights(node) {
		let span;
		while ((span = node.querySelector('span.highlighted'))) {
		  span.outerHTML = span.innerHTML;
		}
		occurrences = 0;
}
function removeHideWords(node) {
    let span;
    while ((span = node.querySelector('span.chromane-blur_text-blur'))) {
      span.outerHTML = span.innerHTML;
    }
    occurrences = 0;
}

function updateHtmlPage(options){
    let keywords = options.keywords;
	//console.log('updateHtmlPage ',options.keywords)
   
    function highlight(node,pos,keyword,options,style){
        //console.log("highlight is called ---------------------------")
        let span = document.createElement('span');
        span.className = 'highlighted' + ' ' + (options.subtleHighlighting ? 'subtle ' : '') + 'style-' + style;
        //console.log("span.className",span.className)
        span.style.color = options.foreground;
        span.style.backgroundColor = options.background;
        let highlighted = node.splitText(pos);
        highlighted.splitText(keyword.length);
        let highlightedClone = highlighted.cloneNode(true);
        span.appendChild(highlightedClone);
        highlighted.parentNode.replaceChild(span, highlighted);
       
    }
    for(var i = 0;i<arrayAnalyNode.length;i++){
        let content = arrayAnalyNode[i].nodes.textContent.toLowerCase()
        for(let j = 0; j < keywords.length; j++){
            let keyword = keywords[j].toLowerCase();
            let pos = content.indexOf(keyword);
            if(0 <= pos){
                highlight(arrayAnalyNode[i].nodes, pos, keyword, options, String(i).slice(-1));  
            }
        }
    }   
}

function removeReplaceContent(){
    //console.log("nodeChangedArray length: ",nodeChangedArray.length)
    for(let i = 0;i<nodeChangedArray.length;i++){
        let contentOriginal = nodeChangedArray[i].node.textContent;
        pos = nodeChangedArray[i].pos;
        //console.log("content original: ",contentOriginal,"  emoji value",value.length)
        let key = nodeChangedArray[i].key;
        let value = nodeChangedArray[i].value;
        let contentPart1 = contentOriginal.substring(0,pos);
        let contentPart2 = contentOriginal.substring(pos + value.length,contentOriginal.length);
        let contentChanged = contentPart1 + key + contentPart2;
        nodeChangedArray[i].node.textContent = contentChanged;  
    }
    nodeChangedArray = [];
    //console.log("nodeChangedArray: ",nodeChangedArray.length)
}

function hideWords(options){
    let keywords = options.keywords;
    function hide(node){
        if (node.parentNode.childNodes.length === 1) {
            node.parentNode.classList.add("chromane-blur_text-blur");
        } else {
            let span = document.createElement("span");
            span.innerText = node.textContent;
            node.parentNode.insertBefore(span, node);
            node.parentNode.removeChild(node);
            span.classList.add("chromane-blur_text-blur");
        }
    }
    for(var i = 0;i<arrayAnalyNode.length;i++){
        let content = arrayAnalyNode[i].nodes.textContent.toLowerCase()
        for(let j = 0; j < keywords.length; j++){
            let keyword = keywords[j].toLowerCase();
            let pos = content.indexOf(keyword);
            if(0 <= pos){
                hide(arrayAnalyNode[i].nodes);  
            }
        }
    }   
}

function replaceContent(options){
    let index = 0;
    let contentMap = options.contentMap;
    for(var i = 0;i<arrayAnalyNode.length;i++){
       let content = arrayAnalyNode[i].nodes.textContent.toLowerCase();
        for (let [key, value] of contentMap) {
            let keyword = key.toLowerCase();
            let pos = content.indexOf(keyword);
            if(0 <= pos){
                let contentOriginal = arrayAnalyNode[i].nodes.textContent;
                let contentPart1 = contentOriginal.substring(0,pos);
                let contentPart2 = contentOriginal.substring(pos + keyword.length,contentOriginal.length);
                let contentChanged = contentPart1 + value + contentPart2;
                arrayAnalyNode[i].nodes.textContent = contentChanged;
                let nodeChanged = {
                    node:null,
                    key: null,
                    value: null,
                    pos:-1
                }
                nodeChangedArray.push(nodeChanged);
                nodeChangedArray[index].node = arrayAnalyNode[i].nodes;
                nodeChangedArray[index].key = key;
                nodeChangedArray[index].value = value;
                nodeChangedArray[index].pos = pos;
                index++;
                 
            }
        }   
    }   
}
function hideComment(){
 
    let elementsToHide = "[data-testid='post-container']~div, .icon-comment, .icon-comment~span";
    let style = document.createElement('style');
    style.title = "hide_comments_everywhere";
    // 把所有element 的 display 改为none
    let excluded_selectors = "code .comment, pre .comment, textarea.comments";
    style.textContent = elementsToHide ? `${elementsToHide} { display: none !important; visibility: hidden !important } ${excluded_selectors} { display: unset; visibility: unset }` : '';
    var header = document.querySelector('head');
    if (header) {
        header.appendChild(style);
    } else {
        document.documentElement.prepend(style);
    }
}
function showComment(){
    console.log("show comment is called...length is: ",document.styleSheets.length)
    for (let i = 0; i < document.styleSheets.length; i++) {
        let stylesheet = document.styleSheets.item(i);
        if (stylesheet.title === 'hide_comments_everywhere') {
            let rules = stylesheet.cssRules || stylesheet.rules;
            for (let j = 0; j < rules.length; j++) {
                let rule = rules.item(j);
                stylesheet.deleteRule(j);
            }
        }
    }
}
function removeHideContent(){
    Array.from(document.querySelectorAll(".chromane-blur_text-blur")).forEach((element) => {
        element.classList.remove("chromane-blur_text-blur");
      });
}

function analysisDomText(options,node){
	let index = 0 	
    let currentOpt = options
   //	console.log("analysisDomText options",currentOpt)
    
    function getContentText(node){
        
        if (node.nodeType === Node.TEXT_NODE) {
			
            if (node.parentNode == null && node.parentNode.nodeName === 'TEXTAREA') {
               return;
            }
            let content = node.textContent;
			var notNum = !(/^\d+(\.\d+)?$/.test(content))
			//console.log(notNum,content)
			var notAlt = content.slice(0,1) !== '@'
			//console.log(notAlt,content)
            if( content!==null && content.trim().length > 3 && notNum && notAlt ){ 
                try{   
                    //var clonedNode = node.cloneNode(true);
					arrayAnalyNode[index]
					
					const nodeInfo = {
						 content: null,
			             nodes:null,
						 highlighted:false
                    }
					node.parentElement.setAttribute('high_processed', 1)
					arrayAnalyNode.push(nodeInfo)
					arrayAnalyNode[index].content = content
					arrayAnalyNode[index].nodes=node
					index++

                }catch (error) {
                    console.log(error);
                }   
            }
        }else{
			if (1 === node.nodeType && !/(script|style|textarea)/i.test(node.tagName) && node.childNodes){
				for (let i = 0; i < node.childNodes.length; i++) {
					getContentText(node.childNodes[i]);
				}    
			}
        }
    }
   // console.log("currentOpt: ",currentOpt)
    if(currentOpt>0){
        // traverse all the node of DOM
        getContentText(node);
        /*
            Put the text content of each node into a list and send it to background, when we got the
            keyword list back from background.js, we can get the node by the maplist of {node,content}
            then we can change the UI or the content of the node

        */
		let arrayAnalyText = arrayAnalyNode.map(ptt => ptt.content)
		browser.runtime.sendMessage({ type: 'arrayAnalyText', data: arrayAnalyText }).then(function (response) {
            //console.log("response from arrayAnalyText background: ",response);
        });
    }else{
        if(removeTag){
            switch(previousOptions){
                case 2:  
                    removeTag = false;
                    removeHighlights(document.body);
                    highlightTag = false;
                    break;
                case 3:
                    removeTag = false;
                    removeReplaceContent();
                    break;
                case 4:
                    removeTag = false;
                    removeHideContent()
                    hideTag = false;
                    break;
                case 5:
                    showComment();
                    break;
            }  
           // removeTag = false;  
        }
        
	}		  
}
