

// hide URL bar
window.onload = function() {
	$("div").removeClass("hideimg");
	if(location.hash != '#cpn'){
 setTimeout(scrollTo, 100, 0, 1);
		//alert(location.hash);
	}
}

// inputTxt deleteValue
function deleteValue(obj){
if(obj.value==obj.defaultValue){
obj.value="";
obj.style.color="#666";
}
}
