<?
mb_internal_encoding('UTF-8');

require_once('../common.inc');
require_once('../lib/lib.php');

$debugmode = 0;
//$debugmode = 1;

// 初期（位置情報取得）
if($_REQUEST['f']==='0'){
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<?php
// Google Analyticsのトラッキングコード PHP版
// <html>の直前に書くこと
  
  // Copyright 2009 Google Inc. All Rights Reserved.
  $GA_ACCOUNT = "MO-20022925-6";
  $GA_PIXEL = "/ga.php";

  function googleAnalyticsGetImageUrl() {
    global $GA_ACCOUNT, $GA_PIXEL;
    $url = "";
    $url .= $GA_PIXEL . "?";
    $url .= "utmac=" . $GA_ACCOUNT;
    $url .= "&utmn=" . rand(0, 0x7fffffff);
    $referer = $_SERVER["HTTP_REFERER"];
    $query = $_SERVER["QUERY_STRING"];
    $path = $_SERVER["REQUEST_URI"];
    if (empty($referer)) {
      $referer = "-";
    }
    $url .= "&utmr=" . urlencode($referer);
    if (!empty($path)) {
      $url .= "&utmp=" . urlencode($path);
    }
    $url .= "&guid=ON";
    return str_replace("&", "&amp;", $url);
  }
?>
<?
	$link = GPS_output_link( K_MOBILE_URL . "tenpo/search_gps.php","位置情報から店舗を探す");
	if($link=="NG"){
		echo "ご利用の端末は未対応です。";
	}
	else{
?>
あなたの位置情報から店舗を近い順に20件表示します。<br>
<br>
&nbsp;<?= $link ?><br>
<br>
<br>
<font size="-1">※測位の精度により表示距離には若干の誤差が生じます。また、表示は直線距離となります事をご了承下さい。</font><br>
<br>
<font size="-1">※屋内での測位は誤差が大きくなる可能性があります。</font><br>
<?
	}
?>
<?php
// Google Analyticsのトラッキングコード PHP版
// </body>の直前に書くこと
  $googleAnalyticsImageUrl = googleAnalyticsGetImageUrl();
  echo '<img src="' . $googleAnalyticsImageUrl . '" />';
?>
</body>
</html>
<?
// 位置情報取得後
}else{

// GPS取得情報 WGS84系に変換済
//$location = new GPS_param_get();
//$lon = $location -> lon_world;
//$lat = $location -> lat_world;
$lon = $_REQUEST['lon'];
$lat = $_REQUEST['lat'];

//echo $lon;
//echo $lat;

if($debugmode == 1){
	$lat = 35.905173;
	$lon = 139.62023;
	//$lat = 139.62023;
	//$lon = 35.905173;
}

if($lon!='' && $lat!=''){

// 店舗検索組織
$kaisyacd = KAISYACD;

// DB接続
$conn = @pg_connect("host=".DB_HOST." dbname=".DB_NAME." user=".DB_USER." password=".DB_PASS);
if($conn == false){
	exit;
}

// 全店検索
$sql=<<<END
select
	m2.*,
	-- 営業時間
	to_char(m2.egjknfrom,'HH24:MI')		as s_egjknfrom,
	to_char(m2.egjknto,'HH24:MI')		as s_egjknto,
	to_char(m2.egjknfrom2,'HH24:MI')	as s_egjknfrom2,
	to_char(m2.egjknto2,'HH24:MI')		as s_egjknto2,
	to_char(m2.idlefrom,'HH24:MI')		as s_idlefrom,
	to_char(m2.idleto,'HH24:MI')		as s_idleto,
	to_char(m2.idlefrom2,'HH24:MI')		as s_idlefrom2,
	to_char(m2.idleto2,'HH24:MI')		as s_idleto2
from
	f_get_m_syozoku() as m
	inner join
		f_get_m_tenpo() as m2
	on
		m2.tenpocd = m.tenpocd and
		m2.tenpokbn07 not in ('5', '9') and
		m2.heitenbi is null
where
	m.kaisyacd = '$kaisyacd'
END;
	//$sql = mb_convert_encoding($sql, 'UTF-8', 'SJIS-win');
	$result = pg_query($conn,$sql);
	while($row = pg_fetch_array($result)){
		// 距離取得
		$row['dis'] = round(calc_distanceDeg($lon, $lat, $row['x'], $row['y']));
		$tenpo_list[] = $row;
	}
	
	// 列方向の配列を得る
	foreach ($tenpo_list as $key => $row) {
		$dis[$key]  = $row['dis'];
	}
	// 距離順にソート
	array_multisort($dis, SORT_ASC, $tenpo_list);
}

?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<?php
// Google Analyticsのトラッキングコード PHP版
// <html>の直前に書くこと
  
  // Copyright 2009 Google Inc. All Rights Reserved.
  $GA_ACCOUNT = "MO-20022925-5";
  $GA_PIXEL = "/ga.php";

  function googleAnalyticsGetImageUrl() {
    global $GA_ACCOUNT, $GA_PIXEL;
    $url = "";
    $url .= $GA_PIXEL . "?";
    $url .= "utmac=" . $GA_ACCOUNT;
    $url .= "&utmn=" . rand(0, 0x7fffffff);
    $referer = $_SERVER["HTTP_REFERER"];
    $query = $_SERVER["QUERY_STRING"];
    $path = $_SERVER["REQUEST_URI"];
    if (empty($referer)) {
      $referer = "-";
    }
    $url .= "&utmr=" . urlencode($referer);
    if (!empty($path)) {
      $url .= "&utmp=" . urlencode($path);
    }
    $url .= "&guid=ON";
    return str_replace("&", "&amp;", $url);
  }
?>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<meta id="viewport" name="viewport" content="width=320; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;" />
	<title>店舗のご案内</title>
	<link rel="stylesheet" href="css/top.css" />
	<link rel="stylesheet" href="css/common.css" />
<script type="application/javascript">
<!--//
var listidx = 4;
//-->
</script>

	<script type="text/javascript" src="js/jquery-1.5.2.min.js"></script>
	<script type="text/javascript" src="js/common.js"></script>
	<script type="text/javascript" src="js/top.js"></script>
	<script language="javascript"> 
	<!--
	var state = 'none';

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
<body id='normal' style='background-color:#FFF;'>

<!-- contentsWrap -->
<div id="contentsWrap">


<!-- topPageHeader -->
<header id="topPageHeader" style='color:#FFF; background-color: rgb(255,255,255);'>
<h1><a href="index.html"><img src="images/logo.jpg" width="60" height="35"></a>店舗のご案内</h1>
<p class="menuBtn"><a href="javascript:void(0)" onClick="slideUpMenu();">メニュー一覧</a></p>
</header>
<section class="topics">
<?
/*
echo "取得座標<br>";
echo $lon . "<br>";
echo $lat . "<br><br>";
*/

$cnt = 1;

// 店舗リスト
// 店舗リスト
if(count($tenpo_list)>0){
	$tenpocnt = 0;
	$style = "style='display: none'";
	if(count($tenpo_list) == 1){
		$style = "";
	}
	$listct = 0;
	foreach($tenpo_list as $tenpo){
		$distance = sprintf("%2.1f",$dis[$listct]/1000);
		echo "<ul><li style=\"border-top: dotted 1px #666;\"><a href=\"javascript:void(0);\" onClick=\"showhide('tenpo{$tenpocnt}');\" class=\"arrow\">" . $tenpo['tenponm'] . "&nbsp;&nbsp;{$distance}km</a></li></ul>";
		$listct++;
		echo "<div id='tenpo{$tenpocnt}' $style>";
		// 住所
		$address = str_replace($lv2,'',str_replace($lv1,'',$tenpo['address1']));
		echo "&nbsp;&nbsp;<font size=\"2\">" . $address . "</font><br>";
		echo "&nbsp;<font size='2'><a href=\"./access.php?tenpo=" . urlencode(mb_convert_encoding($tenpo['tenponm'], 'SJIS-win', 'UTF-8')) . "\">[アクセス]</a></font><br>";
		if($tenpo['address2']!='') echo "<br>" . mb_convert_encoding($tenpo['address2'], 'SJIS-win', 'UTF-8') . "<br>";
		
		// 営業時間
			//  営業時間１(アイドルタイム１) \n
			//  区分 + 営業時間２(アイドルタイム２）
			$egjkn = $tenpo['s_egjknfrom'] . '～' . $tenpo['s_egjknto'];
			
			// アイドルタイム１
			if($tenpo['s_idlefrom'] != '')
				$egjkn .= ' （休憩:' . $tenpo['s_idlefrom'] . '～' . $tenpo['s_idleto'] . '）';
			
			// 営業時間２
			if( $tenpo['s_egjknfrom2'] != ''){
				
				$egjkn .= "\n";
				
				// 区分
				if($tenpo['egjkn2kbn'] == '1')
					$egjkn .= '土日・祝前日 ';
				if($tenpo['egjkn2kbn'] == '2')
					$egjkn .= '金土 ';
				if($tenpo['egjkn2kbn'] == '3')
					$egjkn .= '土日祝 ';
				
				$egjkn .= $tenpo['s_egjknfrom2'] . '～' . $tenpo['s_egjknto2'];
				
				// アイドルタイム２
				if($tenpo['s_idlefrom2'] != '')
					$egjkn .= ' （休憩:' . $tenpo['s_idlefrom2'] . '～' . $tenpo['s_idleto2'] . '）';
			}
		echo "&nbsp;&nbsp;<font size=\"2\">▼営業時間</font><br>";
		echo "&nbsp;&nbsp;<font size=\"2\">" . $egjkn . "</font><br>";
		// 駐車場台数
		if($tenpo['suryo02']>0){
			echo "&nbsp;&nbsp;<font size=\"2\">○駐車場:" . $tenpo['suryo02'] . "台</font><br>";
			if($tenpo['tenpocd']=='3005') echo "&nbsp;&nbsp;&nbsp;&nbsp;<font size=\"2\">※高さ制限&nbsp;1.8m</font><br>";
			if($tenpo['tenpocd']=='2510') echo "&nbsp;&nbsp;&nbsp;&nbsp;<font size=\"2\">※高さ制限&nbsp;1.7m</font><br>";
			if($tenpo['tenpocd']=='2072') echo "&nbsp;&nbsp;&nbsp;&nbsp;<font size=\"2\">※高さ制限&nbsp;1.8m</font><br>";
			if($tenpo['tenpocd']=='2512') echo "&nbsp;&nbsp;&nbsp;&nbsp;<font size=\"2\">※高さ制限&nbsp;2.3m</font><br>";
		}
		// TEL
		echo "&nbsp;&nbsp;<font size=\"2\">○TEL:<a href=\"tel:". str_replace('-','',$tenpo['tel1']) . "\">" . $tenpo['tel1'] . "</a></font><br>";
		echo "&nbsp;&nbsp;<font size=\"2\"><a href=\"".YOYAKU_URL."sp_yoyaku_info.php?tenpocd=".$tenpo['tenpocd']."\">[宴会ご予約]</a></font><br>";
		
		// オプション情報
		//if(substr($tenpo['tm19kbn'],0,1)=='1') echo "&nbsp;&nbsp;<font size=\"2\" color=\"orangered\">★お値打ち黒毛和牛</font><br>";
		//if(substr($tenpo['tm18kbn'],0,1)=='1') echo "&nbsp;&nbsp;<font size=\"2\" color=\"orangered\">★食べ放題</font><br>";
		
		echo "<table><tr>";
		if(substr($tenpo['tm19kbn'],0,1)=='1'){
			echo "<td colspan=\"2\"><font size=\"2\" color=\"orangered\">★お値打ち黒毛和牛</font></td></tr><tr>";
		}
		
		$i=0;
		if($tenpo['tenpokbn03']=='2'){
			echo "<td><font size=\"2\" color=\"green\">★炭火焼肉</font></td>";
			$i++;
		}
		if($tenpo['tenpokbn04']=='1'){
			echo "<td><font size=\"2\" color=\"green\">★ﾄﾞﾘﾝｸﾊﾞｰ</font></td>";
			$i++;
		}
		if($tenpo['tenpokbn06']=='1'){
			if($i>0 && $i%2==0) echo "<tr>";
			echo "<td><font size=\"2\" color=\"green\">★ｻﾗﾀﾞﾊﾞｰ</font></td>";
			$i++;
		}
		if($tenpo['tenpokbn08']=='1'){
			if($i>0 && $i%2==0) echo "<tr>";
			echo "<td><font size=\"2\" color=\"green\">★ｹｰｷﾊﾞｰ</font></td>";
			$i++;
		}
		if($tenpo['tenpokbn15']=='1'){
			if($i>0 && $i%2==0) echo "<tr>";
			echo "<td><font size=\"2\" color=\"green\">★ｼﾞｪﾗｰﾄﾊﾞｰ</font></td>";
			$i++;
		}
		if($tenpo['tenpokbn13']=='1'){
			if($i>0 && $i%2==0) echo "<tr>";
			echo "<td><font size=\"2\" color=\"green\">★ｷｯｽﾞﾙｰﾑ</font></td>";
			$i++;
		}
		if($i%2==1) echo "<td></td>";
		echo "</tr></table>";
		
		echo "<br></div>\r\n";
		$tenpocnt++;
		if($tenpocnt == 20)break;
	}
}
//elseif($lon!='undefined' && $lat!='undefined'){
//	echo "位置情報を取得できませんでした。GPSが位置を取得してから再度ご確認ください。";
elseif($lon!='' && $lat!=''){
	echo "お近くの店舗は見つかりませんでした。";
}
else{
	echo "位置情報を取得できませんでした。ご利用の端末がGPSに対応しているかご確認ください。";
}
?>
<?php
// Google Analyticsのトラッキングコード PHP版
// </body>の直前に書くこと
  $googleAnalyticsImageUrl = googleAnalyticsGetImageUrl();
  echo '<img src="' . $googleAnalyticsImageUrl . '" />';
?>
</div>
<!-- menu -->
<nav id="menu">
<header>
<h1>メニュー</h1>
<p class="menuClose"><a onClick="slideDownMenu();" href="javascript:void(0)">閉じる</a></p>
</header>
<ul>
<li class="icon01"><a href="index.html">トップページ</a></li>
<li class="icon01"><a href="coupon.php">お得なクーポン</a></li>
<li class="icon02"><a href="questionnaire.php">メールマガジン登録</a></li>
<li class="icon03"><span>店舗を探す</span></li> 
<li class="sublist"><a href="#3" class="arrow small" onClick="sendPosition();">GPSで近くの店舗を探す</a></li>
<li class="sublist"><a href="search_pref.html" class="arrow small">住所から探す</a></li>
<li class="sublist"><a href="search_kind.html" class="arrow small">業態から探す(安楽亭以外)</a></li>
<li class="icon04"><span>おすすめメニュー</span></li> 
<li class="sublist"><a href="menu1.html" class="arrow small">食べ放題コース</a></li>
<li class="sublist"><a href="menu2.html" class="arrow small">宴会コース</a></li>
<li class="sublist"><a href="menu3.html" class="arrow small">お値打ち黒毛和牛</a></li>
<li class="icon05"><span>安全、安心への確かな取り組み</span></li> 
<li class="sublist"><a href="1.html" class="arrow small">1.本物主義の調達</a></li>
<li class="sublist"><a href="2.html" class="arrow small">2.検査体制と情報開示</a></li>
<li class="sublist"><a href="3.html" class="arrow small">3.サプライチェーンの構築</a></li>
<li class="sublist"><a href="4.html" class="arrow small">4.手間をかけた伝統の味</a></li>
<li class="sublist"><a href="5.html" class="arrow small">5.教育と人材育成</a></li>
</ul>
</nav>
<script src="js/menu.js"></script>
	
	
</body>
</html>
<?
}
?>
