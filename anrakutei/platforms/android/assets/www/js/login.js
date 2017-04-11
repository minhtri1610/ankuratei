/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


loginctrl = function ($scope) {

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

    $scope.fblog = function() {
          FB.login(function(response) {
            if (response.status === 'connected') {
              console.log('Logged in.');
              // var data_auth = FB.getAuthResponse();
              FB.api('/me', {fields: 'name, cover, timezone, email, devices'}, function(response) {
                console.log(response);
              });

              $scope.outputInfo(response);
            }
          }); 

      };
    $scope.outputInfo = function(data) {
      // console.log(data);
    }

    // end login facebook
    
    // login google +
    // 
    
    $scope.googlelog = function(){
      gapi.load('auth2', function(){
      // Retrieve the singleton for the GoogleAuth library and set up the client.
      auth2 = gapi.auth2.init({
        client_id: '947920991069-vig9imvcb4vun571lcodv5qghsj7pc3q.apps.googleusercontent.com',
        cookiepolicy: 'http://localhost:8000',
        // Request scopes in addition to 'profile' and 'email'
        scope: 'email'
      });
      attachSignin(document.getElementById('btn-login-g'));
      });
        function attachSignin(element) {
          console.log(element.id);
          auth2.attachClickHandler(element, {},
              function(googleUser) {
                document.getElementById('name').innerText = "Signed in: " +
                    googleUser.getBasicProfile().getName();
              }, function(error) {
                alert(JSON.stringify(error, undefined, 2));
              });
        }
    } 
    
  };
  app.controller('loginctrl', ['$scope', loginctrl]);
 