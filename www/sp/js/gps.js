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

	  function getGPS(){
		//alert(mobile);
	      if( mobile == "iPhone" ){
		//alert('iphone detected');
	          gps = navigator.geolocation;
	      }else if( mobile == "Android" ){
		//alert('android detected');
	          gps = google.gears.factory.create('beta.geolocation');
	      }
	      gps.getCurrentPosition(updatePosition, handleError);
		//lat = 35.905173;
		//lon=139.62023;
	  }

	  //緯度経度の表示
	  function updatePosition(position) {
		//alert('function updatePosition')
	      if( mobile == "iPhone" ){
	          var lat = position.coords.latitude;
	          var lon = position.coords.longitude;
		//alert("iphone lat:" + lat + " lon:" + lon);
	      }else if( mobile == "Android" ){
	          var lat = position.latitude;
	          var lon = position.longitude;
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
    alert('Attempt to get location failed: ' + positionError.message);
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
