<?
// 正しいルートのみ通過（クーポンと営業日あり）
if($couponcd=="" || $eigyobi==""){ echo "access faild"; exit; }

require_once("./common.inc");

foreach($SYOHIN as $row){
	if($row[0]==$couponcd){
		$couponnm = $row[2];
		break;
	}
}

$buf = (substr($eigyobi,4,2)+0) . "月" . (substr($eigyobi,6,2)+0) . "日営業日限り";
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<meta id="viewport" name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;" />
	<title>モバイル抽選会結果</title>
<style type="text/css">
<!--
*{
	padding		: 0px;
	margin		: 0px;
}
-->
</style>
<script type="text/javascript" src="./js/jquery.min.js"></script>
<script type="text/javascript" src="./js/jquery.rwdImageMaps.min.js"></script>
<script type="text/javascript">

<!--
function AutoFsize(){
var wpx = $("div#content").width();
var fpar = (Math.floor((wpx)/(400/100)));// 横幅px ÷ (最少幅px/100)
$("#eday").css("font-size",fpar+"%");
}

window.onresize = AutoFsize;

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
			//strHTML += '<img src="./img4/4_0<?=$couponcd?>.png" usemap="#map_box" width="320" height="356"><br clear=all />';
			strHTML += '<img src="./img4/4_0<?=$couponcd?>.png" usemap="#map_box" width="100%"><br clear=all />';
			//strHTML += '<div style="position:absolute; top:177px; left:140px; width: 200px;">';
			strHTML += '<div style="position:absolute; top:49%; left:44%; width: 50%;">';
			strHTML += '<span id="eday" style="font-weight:bold;color:#ff0000;"><?=$buf?></span>';
			strHTML += '</div></div>';

	}

	// iPhone5
	else{

		var strHTML =  '';
			strHTML += '<div id="content" style="position: relative;width:100%">';
			//strHTML += '<img src="./img5/5_0<?=$couponcd?>.png" usemap="#map_box" width="320" height="444"><br clear=all />';
			strHTML += '<img src="./img5/5_0<?=$couponcd?>.png" usemap="#map_box" width="100%"><br clear=all />';
			//strHTML += '<div style="position:absolute; top:233px; left:140px; width: 200px;">';
			strHTML += '<div style="position:absolute; top:52.5%; left:44%; width: 50%;">';
			strHTML += '<span id="eday" style="font-weight:bold;color:#ff0000;"><?=$buf?></span>';
			strHTML += '</div></div>';

	}

	$( "body" ).html( strHTML );
	AutoFsize();

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