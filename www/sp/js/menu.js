var state = 'none';
  //モバイル端末の判定
  var mobile = "";
  var agent = navigator.userAgent;
  //緯度経度取得
  var gps;
  var latit;
  var longit;
  if( agent.search(/iPhone/) != -1 ){
      mobile = "iPhone";
  }else if( agent.search(/Android/) != -1 ){
      mobile = "Android";
  }
//alert(mobile);

function showhide(layer_ref) {

	if (state == 'block') { 
		state = 'none'; 
	} 
	else { 
		state = 'block'; 
	} 
	if (document.getElementById &&!document.all) { 
	hza = document.getElementById(layer_ref); 
	hza.style.display = state; 
	} 
} 

options = {
	enableHighAccuracy: true
};


  function getGPS(){
	//alert(mobile);
      if( mobile == "iPhone" ){
	//alert('iphone detected');
          gps = navigator.geolocation;
      }else if( mobile == "Android" ){
          if(!navigator.geolocation){
			//alert('android1.6 detected');
			gps = google.gears.factory.create('beta.geolocation');
		}else{
			//alert('android2.x or later detected');
			gps = navigator.geolocation;
		}
      //alert('func1');
      }
      
      gps.getCurrentPosition(updatePosition, handleError,options);
			//alert('func2');
	//lat = 35.905173;
	//lon=139.62023;
  }

  //緯度経度の表示
  function updatePosition(position) {
	//alert('function updatePosition');
      if( mobile == "iPhone" ){
          var lat = position.coords.latitude;
          var lon = position.coords.longitude;
	//alert("iphone lat:" + lat + " lon:" + lon);
      }else if( mobile == "Android" ){
		//alert('function updatePosition');
		if(!navigator.geolocation){
          var lat = position.latitude;
          var lon = position.longitude;
        }else{
          var lat = position.coords.latitude;
          var lon = position.coords.longitude;
		}
	//alert("android " + lat + ":" + lon);
      }else{
	//alert('detect failed');
	}
	//lat = 35.905173;
	//lon=139.62023;
	document.positionget.lat.value = lat;
	document.positionget.lon.value = lon;
	document.positionget.submit();
  }

//エラー処理
function handleError(positionError) {
	alert('位置情報が利用できない状態となっています');
}

function sendPosition(){
	
	//alert("chk1");
	getGPS();
	//latit = 35.905173;
	//longit=139.62023;
	//alert("chk2");
	//var lat = document.positionget.lat.value;
	//var lon = document.positionget.lon.value;
	//alert('final lat:' + lat + ' lon:' + lon);
}

// menu
var menuWrap = document.getElementById('menu');
  menuWrap.setAttribute('selected', false);

var contentsWrap = document.getElementById('contentsWrap');
  contentsWrap.setAttribute('class', 'OffMenu');

function slideUpMenu () {
//  setTimeout(function () {
  menuWrap.style.webkitTransitionDuration = '0ms';
  menuWrap.style.webkitTransform = 'translateY(' + window.innerHeight + 'px)';
  menuWrap.style.webkitTransitionDuration = '';
  menuWrap.setAttribute('selected', true);
  menuWrap.addEventListener('webkitTransitionEnd', function (event) {
    contentsWrap.className = contentsWrap.className.replace(/OffMenu/g, 'OnMenu');
    menuWrap.removeEventListener('webkitTransitionEnd', arguments.callee, false);
  }, false);
  function startTransition () {
    menuWrap.style.webkitTransform = 'translateY(0%)';
  }
  setTimeout(startTransition, 300);
//  }, 100);
}

function slideDownMenu () {
  contentsWrap.className = contentsWrap.className.replace(/OnMenu/g, 'OffMenu');
  menuWrap.style.webktiTransitionDuration = '0ms';
//  menuWrap.style.webkitTransform = 'translateY(0%)';
  menuWrap.style.webkitTransitionDuration = '';
  menuWrap.addEventListener('webkitTransitionEnd', function (event) {
    menuWrap.setAttribute('selected', false);
    menuWrap.removeEventListener('webkitTransitionEnd', arguments.callee, false);
  }, false);
  function startTransition () {
    menuWrap.style.webkitTransform = 'translateY(' + ( window.innerHeight + ( window.scrollY || window.pageYOffset ) ) + 'px)';
  }
  setTimeout(startTransition, 300);
}
