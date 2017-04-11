<?
mb_internal_encoding('UTF-8');

require_once('../common.inc');

// 店舗検索組織
$kaisyacd = KAISYACD;

$zoom = $_REQUEST['zoom']; // 拡大 (-2,-1, 0, 1, 2)
$tenponm = mb_convert_encoding(urldecode($_REQUEST['tenpo']), 'UTF-8', 'SJIS-win'); // 店舗名
if($tenponm =='' ) exit;

// DB接続
$conn = @pg_connect("host=".DB_HOST." dbname=".DB_NAME." user=".DB_USER." password=".DB_PASS);
if($conn == false){
	exit;
}

$sql=<<<END
select
	m2.*
from
	f_get_m_syozoku() as m
	inner join
		f_get_m_tenpo() as m2
	on
		m2.tenpocd = m.tenpocd and
		m2.tenpokbn07 not in ('5', '9') and
		m2.heitenbi is null and
		m2.tenponm = $1
where
	m.kaisyacd = $2
END;



$result = pg_query_params($conn,$sql,Array($tenponm,$kaisyacd));
if(!($row = pg_fetch_array($result))) exit;

?>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<meta id="viewport" name="viewport" content="width=320; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;" />
	<title>店舗アクセス</title>
	<link rel="stylesheet" href="css/top.css" />
	<link rel="stylesheet" href="css/common2011.css" />
<style type="text/css">
<!--
section.btn zoombtn.ul {
	display: table;
	width: 100%;
	margin: 8px auto 0 auto;
	text-align: left;
	}
section.btn ul.zoombtn li a {
	display: block;
	width: 96%;
	padding: 13px 1px 11px 1px;
	text-align: center;
	color: #000000;
	font-size: 17px;
	line-height: 1.1;
	font-weight: bold;
	text-decoration: none;
	-webkit-box-sizing: 2px 2px 2px #000;
	-moz-box-sizing: 2px 2px 2px #000;
	-moz-box-shadow: 2px 2px 2px #000;
	-webkit-box-shadow: 2px 2px 2px #000;
	box-shadow: 2px 2px 2px #000;
	-webkit-border-radius: 4px;
	-moz-border-radius: 4px;
	border-radius: 4px;
	background: #FFFFFF;

	/*background: url(../../common/images/arw02.png) no-repeat 240px center, -moz-linear-gradient(top, #FFF, #FFF 45%, #EDEDED 55%, #EDEDED);
	background: url(../../common/images/arw02.png) no-repeat 240px center, -webkit-gradient(linear, left top, left bottom, from(#FFF), color-stop(0.45, #FFF), color-stop(0.55, #EDEDED), to(#EDEDED));　
	background: url(../../common/images/arw02.png) no-repeat 240px center, linear-gradient(linear, left top, left bottom, from(#FFF), color-stop(0.45, #FFF), color-stop(0.55, #EDEDED), to(#EDEDED));　*/
}
-->
</style>

	<script type="text/javascript" src="js/jquery-1.5.2.min.js"></script>
	<script type="text/javascript" src="js/common.js"></script>
	<script type="text/javascript" src="js/top.js"></script>
	<script type="text/javascript" src="js/gears_init.js"></script>
	<script type="text/javascript" src="js/gps.js"></script>
	<script language="javascript"> 
	<!--
	var state = 'none';
	var listidx = 5;

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
	//--> 
	</script>

</head>
<body id='normal' style='background-color:#DDD;'>

<!-- contentsWrap -->
<div id="contentsWrap">


<!-- topPageHeader -->
<header id="topPageHeader" style='color:#000; background-color: rgb(255,255,255);'>
<h1><a href="index.html"><img src="images/logo.jpg" width="60" height="35"></a><?=$row['tenponm']?></h1>
<p class="menuBtn"><a href="javascript:void(0)" onclick="slideUpMenu();">メニュー</a></p>
</header>
<section class="topics">
<div align="center">
<?
	$val=15;
	if($zoom==-2)	$val=13;
	if($zoom==-1)	$val=14;
	if($zoom==1)	$val=16;
	if($zoom==2)	$val=17;
	//test:ABQIAAAACUtywH1CxrdWW0PKFBXCyhR9s7ZpR5qDbvT6g8Rm_POFuGgIOhTrFepC_EDoOCxHbzvfhZkk5n1REQ
	// ns1:ABQIAAAAg2ZIziHnEg8AKrxz0k0t8RRDy88TVIk__aeeyaBVoMApX3fQhRSwg_uN_PsaDQ2wnxgd47gTMiWQ
?>
<!--<img alt="<?=$row['tenponm']?>" src="http://maps.google.com/staticmap?center=<?=$row['y']?>,<?=$row['x']?>&amp;markers=<?=$row['y']?>,<?=$row['x']?>,white&amp;zoom=<?=$val?>&amp;size=250x250&amp;format=gif&amp;maptype=mobile&amp;key=ABQIAAAAg2ZIziHnEg8AKrxz0k0t8RRDy88TVIk__aeeyaBVoMApX3fQhRSwg_uN_PsaDQ2wnxg6kd47gTMiWQ"><br>-->
<img alt="<?=$row['tenponm']?>" src="http://maps.googleapis.com/maps/api/staticmap?center=<?=$row['y']?>,<?=$row['x']?>&amp;markers=<?=$row['y']?>,<?=$row['x']?>|color:white&amp;zoom=<?=$val?>&amp;size=250x250&amp;format=gif&amp;maptype=mobile&amp;key=ABQIAAAAg2ZIziHnEg8AKrxz0k0t8RRDy88TVIk__aeeyaBVoMApX3fQhRSwg_uN_PsaDQ2wnxg6kd47gTMiWQ"><br>
</div>
<section class="btn">
<div align='center'>
<ul class="zoombtn">
<?
	if($zoom==-2){
		echo "<li><a href=\"./access.php?tenpo=". urlencode($_REQUEST['tenpo']) ."&amp;zoom=-1\" >[＋]拡大</a></li>";
		echo "<li>&nbsp;</li>";
	}
	else if($zoom==-1){
		echo "<li><a href=\"./access.php?tenpo=". urlencode($_REQUEST['tenpo']) ."\">[＋]拡大</a></li>";
		echo "<li><a href=\"./access.php?tenpo=". urlencode($_REQUEST['tenpo']) ."&amp;zoom=-2\">[－]縮小</a></li>";
	}else if($zoom==''){
		echo "<li><a href=\"./access.php?tenpo=". urlencode($_REQUEST['tenpo']) ."&amp;zoom=1\">[＋]拡大</a></li>";
		echo "<li><a href=\"./access.php?tenpo=". urlencode($_REQUEST['tenpo']) ."&amp;zoom=-1\">[－]縮小</a></li>";
	}else if($zoom==1){
		echo "<li><a href=\"./access.php?tenpo=". urlencode($_REQUEST['tenpo']) ."&amp;zoom=2\">[＋]拡大</a></li>";
		echo "<li><a href=\"./access.php?tenpo=". urlencode($_REQUEST['tenpo']) ."\">[－]縮小</a></li>";
	}else if($zoom==2){
		echo "<li>&nbsp;</li>";
		echo "<li><a href=\"./access.php?tenpo=". urlencode($_REQUEST['tenpo']) ."&amp;zoom=1\">[－]縮小</a></li>";
	}
?>
</ul>
</div>
</section>
<br>
<?
	if($row['station']!=''){
		echo "<font color=\"#000066\">【最寄駅】</font>" . $row['station'] . "<br>";
		echo "&nbsp;<font size=\"2\">" . $row['train_root'] . "</font><br>\r\n";
	}
	echo "<br>\r\n";
	if($row['car_root']!=''){
		echo "<font color=\"#000066\">【お車で】</font>";
		if($row['suryo02']!='' && $row['suryo02']>0) echo "駐車場" . $row['suryo02'] . "台";
		echo "<br>";
		echo "&nbsp;<font size=\"2\">" . $row['car_root'] . "</font><br>\r\n";
	}
?>
</div>
<!-- menu -->
<nav id="menu">
</nav>
<script src="js/menu.js"></script>
</body>
</html>
