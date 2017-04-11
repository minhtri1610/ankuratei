  //���o�C���[���̔���
  var mobile = "";
  var agent = navigator.userAgent;
  if( agent.search(/iPhone/) != -1 ){
      mobile = "iPhone";
  }else if( agent.search(/Android/) != -1 ){
      mobile = "Android";
  }

  //�ܓx�o�x�擾
  var gps;
  var lat;
  var lon;
  function getGPS(){
      if( mobile == "iPhone" ){
          gps = navigator.geolocation;
      }else if( mobile == "Android" ){
          gps = google.gears.factory.create('beta.geolocation');
      }
      gps.getCurrentPosition(updatePosition, handleError);
  }

  //�ܓx�o�x�̕\��
  function updatePosition(position) {
      if( mobile == "iPhone" ){
          lat = position.coords.latitude;
          lon = position.coords.longitude;
      }else if( mobile == "Android" ){
          lat = position.latitude;
          lon = position.longitude;
      }
  }

  //�G���[����
  function handleError(positionError) {
    alert('Attempt to get location failed: ' + positionError.message);
  }
