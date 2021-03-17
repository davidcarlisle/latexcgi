// runlatex-sk.js for TeXLive.net
// Copyright 2020 2021 David Carlisle
// MIT Licence

// set here but local versions can be redefined after
// loading this file

var lltexts ={
    "TeXLive.net":      "TeXLive.net", // or "run latex" or whatever
    "Delete Output":    "Delete Output",
    "Compiling PDF":    "Compiling PDF",
    "Added Code":       "Added snippet code",
    "End Added Code":   "End snippet code",
    "Top Caption":      ""
}

var latexcgihost="https://texlive.net/cgi-bin/latexcgi";

var editors=[];

const noeditregex = /^\s*[/%#\*]+ *!TEX.*[^a-zA-Z]noedit *(\n|$)/i;
const norunregex = /^\s*([/%#\*]+ *!TEX.*[^a-zA-Z]none *|[^% \t\\][^\\]*)(\n|$)/i;
const commentregex = / %.*/;
const engineregex = /% *!TEX.*[^a-zA-Z](((pdf|xe|lua|u?p)?latex(-dev)?)|context|(pdf|xe|lua|u?p)tex) *\n/i;
const returnregex = /% *!TEX.*[^a-zA-Z](pdfjs|pdf|log) *\n/i;
const makeindexregex = /% *!TEX.*[^a-zA-Z]makeindex( [a-z0-9\.\- ]*)\n/ig;

function llexamples() {
    var p = document.getElementsByTagName("pre");
    var editor;
    var acemode;
    for(var i=0;i<p.length;i++) {
	acemode="ace/mode/latex";
	p[i].setAttribute("id","pre" + i);
	var pretext=p[i].innerText;
	if(!pretext.match(noeditregex)) {
	    if(pretext.match(norunregex)) {
		acemode="ace/mode/text";
	    } else {
		// caption
		if(lltexts["Top Caption"]) {
		    var cpt = document.createElement("div");
		    cpt.setAttribute("class",'lltopcaption');
		    cpt.innerHTML=lltexts["Top Caption"];
		    p[i].parentNode.insertBefore(cpt, p[i]);
		}
		// space
		var s = document.createElement("div");
		s.setAttribute("class",'ace-spacer');
		p[i].parentNode.insertBefore(s, p[i].nextSibling);
		// latexonline
		var r = document.createElement("button");
		r.innerText=lltexts["TeXLive.net"];
		r.setAttribute("class","llbutton");
		r.setAttribute("onclick",'latexcgi("pre' + i + '")');
		r.setAttribute("id","lo-pre" + i);
		p[i].parentNode.insertBefore(r, p[i].nextSibling);
		var f2=document.createElement("span");
		f2.innerHTML="<form style=\"display:none\" id=\"form2-pre" + i +
		    "\" name=\"form2-pre" + i +
		    "\" enctype=\"multipart/form-data\" action=\"" +
		    latexcgihost +
		    "\" method=\"post\" target=\"pre" + i +
		    "ifr\"></form>";
		p[i].parentNode.insertBefore(f2, p[i].nextSibling);
	    }
	    p[i].textContent=p[i].innerText;
	    editor = ace.edit(p[i]);
	    ace.config.set('basePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12') ;
	    editor.setTheme("ace/theme/textmate");
	    editor.getSession().setMode(acemode);
	    editor.setOption("minLines",2);
	    editor.setOption("maxLines",40);
	    editor.setShowPrintMargin(false);
	    editor.resize();
	    editors["pre" + i]=editor;
	}
    }
}


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
	if(t.match(/koma|KOMA|addsec|\\scr|scrheadings/)){
            editors[nd].insert("\n% " + lltexts["Added Code"] + "\n\\documentclass{scrartcl}\n");
	} else {
	    editors[nd].insert("\n% " + lltexts["Added Code"] + "\n\\documentclass{article}\n");
	}
	if(t.match(/\\includegraphics/)){
	    editors[nd].insert("\\usepackage[demo]{graphicx}\n");
	}
	if(t.match(/\\begin{equation|align|gather|flalign/)){
	    editors[nd].insert("\\usepackage{amsmath}\n");
	}
	if(t.match(/tikz|pgf/)){
	    editors[nd].insert("\\usepackage{tikz}\n");
	}
        if(t.match(/fancy/)){
            editors[nd].insert("\\usepackage{fancyhdr}\n");
        }
        if(t.match(/addplot|axis/)){
            editors[nd].insert("\\usepackage{pgfplots}\n");
        }
        if(t.match(/hyper|href|bookmark|\\url/)){
            editors[nd].insert("\\usepackage{hyperref}\n");
        }
        if(t.match(/\\newcolumntype/)){
            editors[nd].insert("\\usepackage{array}\n");
        }
        if(t.match(/listing/)){
            editors[nd].insert("\\usepackage{listings}\n");
        }
        if(t.match(/\\blind/)){
            editors[nd].insert("\\usepackage{blindtext}\n");
        }
        if(t.match(/\\lipsum/)){
            editors[nd].insert("\\usepackage{lipsum}\n");
        }
        if(t.match(/color/)){
            editors[nd].insert("\\usepackage{xcolor}\n");
        }
        if(t.match(/pspicture/)){
            editors[nd].insert("\\usepackage{pstricks}\n");
        }


        editors[nd].insert("\n\\begin{document}\n% "  + lltexts["End Added Code"] + "\n\n");
        editors[nd].navigateFileEnd();
        editors[nd].insert("\n\n% " +
			   lltexts["Added Code"] +
			   "\n\\end{document}\n% "  +
			   lltexts["End Added Code"] +
			   "\n");
	
	t = editors[nd].getValue();
    }
    addtextarea(fm,"filecontents[]",t);
    addinputnoenc(fm,"filename[]","document.tex");
    if(eng != null) {
	engv=eng[1].toLowerCase();
    } else if ((t.indexOf("\\usepackage{lua") !== -1) || (t.indexOf("\\directlua") !== -1) ){
	engv="lualatex";
    } else if (t.indexOf("fontspec") !== -1) {
	engv="xelatex";
    } else if (t.indexOf("pstricks") !==-1) {
	engv="latex";
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
	d.innerText=lltexts["Delete Output"];
        d.setAttribute("class","llbutton");
	d.setAttribute("id","del-" + nd);
	d.setAttribute("onclick",'deleteoutput("' + nd + '")');
	p.parentNode.insertBefore(d, b.nextSibling);
    }
    var  loading=document.createElement("div");
    loading.id=nd+"load";
    loading.textContent=lltexts["Compiling PDF"] + " . . .";
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
