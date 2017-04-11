
//mainVisual Banner
$(function(){
var active="active",interval=5000;
var index=0, timerId=null;
var tabs=$("#tabBtn > li"), content=$("#view > div");

$("#menu").load("/sp/menulist.php?idx=" + listidx);

tabs.each(function(){$(this).removeClass(active);});
content.hide();
tabs.eq(0).addClass(active);
content.eq(0).fadeIn("800");

tabs.click(function(){
if($(this).hasClass("active")) return;
if(timerId) clearInterval(timerId),timerId=null;
change(tabs.index(this));
setTimer();
});

setTimer();
function setTimer(){
timerId=setTimeout(timeProcess,interval);
}

function timeProcess(){
change((index +1)%tabs.length);
timerId=setTimeout(arguments.callee,interval);
}

function change(t_index){
tabs.eq(index).removeClass(active);
tabs.eq(t_index).addClass(active);
content.eq(index).stop(true, true).hide();
index=t_index;
content.eq(index).fadeIn("800");
}
});

