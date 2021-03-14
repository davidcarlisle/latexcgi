// runlatex-sk.js for TeXLive.net
// Copyright 2021 David Carlisle
// MIT Licence

var editors=[];

function llexamples() {
    var p = document.getElementsByTagName("pre");
    var editor;
    for(var i=0;i<p.length;i++) {
	p[i].setAttribute("id","pre" + i);
	// space
	    var s = document.createElement("div");
	    s.setAttribute("class",'ace-spacer');
	    p[i].parentNode.insertBefore(s, p[i].nextSibling);
	    // latexonline
	    var r = document.createElement("button");
	    r.innerText="TeXLive.net";
	    r.setAttribute("onclick",'latexcgi("pre' + i + '")');
	    r.setAttribute("id","lo-pre" + i);
	    p[i].parentNode.insertBefore(r, p[i].nextSibling);
	    var f2=document.createElement("span");
	    f2.innerHTML="<form style=\"display:none\" id=\"form2-pre" + i + "\" name=\"form2-pre" + i +"\" enctype=\"multipart/form-data\" action=\"https://texlive.net/cgi-bin/latexcgi\" method=\"post\" target=\"pre" + i + "ifr\"></form>";
	    p[i].parentNode.insertBefore(f2, p[i].nextSibling);
	    editor = ace.edit(p[i]);
	    ace.config.set('basePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12') ;
	    editor.setTheme("ace/theme/textmate");
	    editor.getSession().setMode("ace/mode/latex");
	    editor.setOption("minLines",2);
	    editor.setOption("maxLines",100);
	    editor.setShowPrintMargin(false);
	    editor.resize();
	    editors["pre" + i]=editor;
    }
}

const commentregex = / %.*/;
const engineregex = /% *!TEX.*[^a-zA-Z](((pdf|xe|lua|u?p)?latex(-dev)?)|context|make4ht) *\n/i;
const returnregex = /% *!TEX.*[^a-zA-Z](pdfjs|pdf|log) *\n/i;
const makeindexregex = /% *!TEX.*[^a-zA-Z]makeindex( [a-z0-9\.\- ]*)\n/ig;

// https://www.overleaf.com/devs
function addinput(f,n,v) {
    var inp=document.createElement("input");
    inp.setAttribute("type","text");
    inp.setAttribute("name",n);
    inp.value =encodeURIComponent(v);
    f.appendChild(inp);
}

function addinputnoenc(f,n,v) {
    var inp=document.createElement("input");
    inp.setAttribute("type","text");
    inp.setAttribute("name",n);
    inp.value =v;
    f.appendChild(inp);
}

function addtextarea(f,n,v) {
    var inp=document.createElement("textarea");
    inp.setAttribute("type","text");
    inp.setAttribute("name",n);
    inp.textContent=v;
    f.appendChild(inp);
}


function copytoclipboard(nd){
    var p = document.getElementById(nd);
    var nn=document.createElement("textarea");
    nn.value=p.innerText;
    document.body.appendChild(nn);
    nn.select();
    document.execCommand("copy");
    document.body.removeChild(nn);
}


function allowedit(nd){
    var p = document.getElementById(nd);
    p.contentEditable="true";
    p.setAttribute("spellcheck","false");
    p.innerHTML=p.innerText;
    p.style.border="solid thin green";
}

function deleteoutput(nd){
    var b = document.getElementById('del-' + nd);
    var ifr = document.getElementById(nd + 'ifr');
    b.parentNode.removeChild(b);
    ifr.parentNode.removeChild(ifr);
}

function latexcgi(nd) {
    var fm = document.getElementById('form2-' + nd);
    fm.innerHTML="";
    var p = document.getElementById(nd);
    var t = editors[nd].getValue();
    var engv="pdflatex";
    var eng=t.match(engineregex);
    if(t.indexOf("\\documentclass") == -1 && ( eng == null)) {
     editors[nd].navigateFileStart();
     editors[nd].insert(`
% Added snippet code
\\documentclass{article}
`);
	if(t.match(/\\includegraphics/)){
	    editors[nd].insert("\\usepackage{graphicx}\n");
	}
	if(t.match(/\\begin{equation|align|gather|flalign/)){
	    editors[nd].insert("\\usepackage{amsmath}\n");
	}
	if(t.match(/tikz/)){
	    editors[nd].insert("\\usepackage{tikz}\n");
	}
     editors[nd].insert(`
\\begin{document}
% End of snippet insert

`);
    editors[nd].navigateFileEnd();
    editors[nd].insert(`
% Added snippet code
\\end{document}
% End of snippet insert
`);
     t = editors[nd].getValue();
}
    addtextarea(fm,"filecontents[]",t);
    addinputnoenc(fm,"filename[]","document.tex");
    if(eng != null) {
	engv=eng[1].toLowerCase();
    } else if(t.indexOf("fontspec") !== -1) {
	engv="xelatex";
    }
    addinput(fm,"engine",engv);
    var rtn = t.match(returnregex);
    var rtnv = "";
    if(rtn == null) {
	// ES6 / IE
	if (typeof Symbol == "undefined") addinput(fm,"return","pdf");
    } else {
	rtnv=rtn[1].toLowerCase();
	addinput(fm,"return",rtnv);
    }
    var mki = makeindexregex.exec(t);
    while (mki != null) {
	addinputnoenc(fm,"makeindex[]",mki[1]);
	mki = makeindexregex.exec(t);
    }
    var b = document.getElementById('lo-' + nd);
    var ifr= document.getElementById(nd + "ifr");
    if(ifr == null) {
	ifr=document.createElement("iframe");
	ifr.setAttribute("width","100%");
	ifr.setAttribute("height","500em");
	ifr.setAttribute("id",nd + "ifr");
	ifr.setAttribute("name",nd + "ifr");
	p.parentNode.insertBefore(ifr, b.nextSibling);
	d=document.createElement("button");
	d.innerText="Delete Output";
	d.setAttribute("id","del-" + nd);
	d.setAttribute("onclick",'deleteoutput("' + nd + '")');
	p.parentNode.insertBefore(d, b.nextSibling);
    }
    var  loading=document.createElement("div");
    loading.id=nd+"load";
    loading.textContent="Compiling PDF . . .";
    p.parentNode.insertBefore(loading, ifr);
    // scroll only if really close to the bottom
    var rect = b.getBoundingClientRect();
    if(document.documentElement.clientHeight - rect.bottom < 50){
	window.scrollBy(0,150);
    }
    setTimeout(function () {
	p.parentNode.removeChild(document.getElementById(nd+"load"));
    }, 1000);
    fm.submit();
}

window.addEventListener('load', llexamples, false);