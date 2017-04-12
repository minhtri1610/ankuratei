/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
// login facebook
    window.fbAsyncInit = function() {
      FB.init({
        appId      : '245894485817834',
        xfbml      : true,
        version    : 'v2.8'
      });
      FB.AppEvents.logPageView();
          
    };
    
    (function(d, s, id){
       var js, fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement(s); js.id = id;
       js.src = "//connect.facebook.net/en_US/sdk.js";
       fjs.parentNode.insertBefore(js, fjs);
     }(document, 'script', 'facebook-jssdk'));

loginctrl = function ($scope) {

    // close login page 
    $scope.back_home = function($window, $location){      
     
      myNavigator.pushPage('index.html', {animation: 'fade'});
    }   

    $scope.fblog = function() {
          FB.login(function(response) {
            if (response.status === 'connected') {
              console.log('Logged in.');
              // var data_auth = FB.getAuthResponse();
              FB.api('/me', {fields: 'name, email, devices,verified,picture'}, function(response) {
                console.log(response);
              });

              $scope.outputInfo(ressponse);
            }
          }, {scope: 'public_profile,email'});

      };
    $scope.outputInfo = function(data) {
      console.log(data);
    }

    // end login facebook
    
    // login google +
    
      gapi.load('auth2', function(){
      // Retrieve the singleton for the GoogleAuth library and set up the client.
      auth2 = gapi.auth2.init({
        client_id: '947920991069-vig9imvcb4vun571lcodv5qghsj7pc3q.apps.googleusercontent.com',
        cookiepolicy: 'single_host_origin',
        // Request scopes in addition to 'profile' and 'email'
        scope: 'email'
      });
      attachSignin(document.getElementById('actionBtn'));
      });
        function attachSignin(element) {

         
          auth2.attachClickHandler(element, {},
              function(googleUser) {

                    var dataUser = new Array();

                    dataUser.push(googleUser.getBasicProfile().getName());

                    dataUser.push(googleUser.getBasicProfile().getEmail());

                    dataUser.push(googleUser.getBasicProfile().getId());

                    dataUser.push(googleUser.getBasicProfile().getImageUrl());

                    console.log(dataUser);

              }, function(error) {

                alert(JSON.stringify(error, undefined, 2));
              });
        }
      //end login google+
    
  };
  app.controller('loginctrl', ['$scope', loginctrl]);
