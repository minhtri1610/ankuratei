<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<meta id="viewport" name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;" />
	<title>モバイル抽選会</title>
<style type="text/css">
<!--
*{
	padding		: 0px;
	margin		: 0px;
}
-->
</style>
<script type="text/javascript" src="./js/jquery.min.js"></script>
<script type="text/javascript">
<!--
function fncInit(){

	var width_num;
	var height_num;

	if(window.devicePixelRatio > 0){
		width_num = screen.width * window.devicePixelRatio;
		height_num = screen.height * window.devicePixelRatio;
	}
	else{
		width_num = screen.width;
		height_num = screen.height;
    }

	if( height_num == 960 ){

		var strHTML =  '';
			strHTML += '<div id="content" style="position: relative;">';
			strHTML += '<img src="./img4/top.png" usemap="#map_box" width="100%" /><br clear=all />';
			strHTML += '<a href="box1.php"><div style="position:absolute;top:72%;left:9%;width:24%;height:24%;z-index:1000;"><br /></div></a>';
			strHTML += '<a href="box2.php"><div style="position:absolute;top:72%;left:38%;width:24%;height:24%;z-index:1000;"><br /></div></a>';
			strHTML += '<a href="box3.php"><div style="position:absolute;top:72%;left:67%;width:24%;height:24%;z-index:1000;"><br /></div></a>';
			strHTML += '</div>';
	}

	// iPhone5
	else{

		var strHTML =  '';
			strHTML += '<div id="content" style="position: relative;">';
			strHTML += '<img src="./img5/top.png" usemap="#map_box" width="100%" /><br clear=all />';
			strHTML += '<a href="box1.php"><div style="position:absolute;top:68%;left:6%;width:24%;height:23%;z-index:1000;"><br /></div></a>';
			strHTML += '<a href="box2.php"><div style="position:absolute;top:68%;left:38%;width:24%;height:23%;z-index:1000;"><br /></div></a>';
			strHTML += '<a href="box3.php"><div style="position:absolute;top:68%;left:70%;width:24%;height:23%;z-index:1000;"><br /></div></a>';
			strHTML += '</div>';
	}

	$( "body" ).html( strHTML );

}

//-->
</script>
<script type="text/javascript">

  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-20022925-6']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

</script>
<body id="ID_BODY" style='background-color: rgb(255,255,255);' onload="fncInit()">

</body>
</html>