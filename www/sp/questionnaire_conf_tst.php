<?php
define("NO_USERINFO", FALSE);
mb_internal_encoding('UTF-8');
	session_start();
		// ファイル読み込み
	    require_once("DB.php");
	    require_once("global.php");
		require_once("gmapapi_setup.php");
		require_once("map_icons.php");
require_once('../common.inc');
require_once('../lib/lib.php');
require_once("coupon_std.inc");
		// DB接続
		$objDb = DB::connect("$DB_TYPE://$DB_USER:$DB_PASS@$DB_HOST/$DB_NAME");
// DB接続
$conn = @pg_connect("host=".DB_HOST." dbname=".DB_NAME." user=".DB_USER." password=".DB_PASS);
if($conn == false){
	exit;
}


$req= $_REQUEST;

$shopsel = "";

$route = $req['rt'];
// 年齢
if(strlen($_REQUEST['nenrei'])== 0 || !is_numeric($_REQUEST['nenrei']) || intval($_REQUEST['nenrei'])> 110) {
	$nenrei= "未回答";
	$req["nenrei"]= "";
}
else {
	$nenrei= $_REQUEST['nenrei']. "歳";
}
// 性別
switch($_REQUEST['seibetsu']) {
	case 1:
		$seibetsu= "男性"; break;
	case 2:
		$seibetsu= "女性"; break;
	default:
		$seibetsu= "未回答";
		$req['seibetsu']= 1;
}
// 郵便番号
if(strlen($_REQUEST['yubin1'])== 0 || !is_numeric($_REQUEST['yubin1']) || strlen($_REQUEST['yubin1'])> 5) {
	$yubin1= "";
}
else	$yubin1= $_REQUEST['yubin1'];
if(strlen($_REQUEST['yubin2'])== 0 || !is_numeric($_REQUEST['yubin2']) || strlen($_REQUESST['yubin2'])> 5) {
	$yubin2= "";
}
else	$yubin2= $_REQUEST['yubin2'];
$req['yubin']= $yubin1. "-". $yubin2;
// 同居人数
if(strlen($_REQUEST['doukyo'])== 0 || !is_numeric($_REQUEST['doukyo']) || strlen($_REQUEST['doukyo'])> 100) {
	$doukyo= "未回答";
}
else {
	$doukyo= $_REQUEST['doukyo']. "人";
}
// ﾒｰﾙｱﾄﾞﾚｽ
if(strlen($_REQUEST['mailaddr'])== 0 || strlen($_REQUEST['mailaddr'])> 150) {
	$mailaddr= "未回答";
	$req['mailaddr']= "";
}
else {
	$mailaddr= htmlspecialchars($_REQUEST['mailaddr']);				// HTMLエスケープ
	$req['mailaddr']= pg_escape_string($_REQUEST['mailaddr']);		// Postgresqlエスケープ
}

$magimg = "";
//登録メルマガ種別
if($_REQUEST['anraku']=="on"){
	$magimg .= "<img alt=\"安楽亭\" src=\"logo.jpg\" width=\"70\">";
}
if($_REQUEST['honpo']=="on"){
	$magimg .= "<img alt=\"カルビ本舗\" src=\"honpo_logo.gif\" width=\"70\">";
}

$postal="{$_REQUEST['yubin1']}{$_REQUEST['yubin2']}";

$sql = "select * from m_postal where code7 = '$postal'";
$res= $con->query($sql);
if(DB::isError($res)){
	echo $sql;
	die($res->getMessage());
}

$adflg = 0;
$range = 5000;
if($res->numRows()>0){
	$rows= $res->fetchRow(DB_FETCHMODE_ASSOC);
	$address = "{$rows['prefecture']}{$rows['city']}{$rows['town']}";
	$postal = $rows['code7'];
	$latbuf = $rows['lat'];
	$lonbuf = $rows['lon'];
}else{
	if(strlen($_REQUEST['code3'])>0){
		$sql = "select * from m_postal where code7 like '{$_REQUEST['code3']}{$_REQUEST['code4']}%'";
		$res= $con->query($sql);
		if($res->numRows()>0){
			$rows= $res->fetchRow(DB_FETCHMODE_ASSOC);
			$address = "{$rows['prefecture']}{$rows['city']}{$rows['town']}";
			$postal = $rows['code7'];
			$latbuf = $rows['lat'];
			$lonbuf = $rows['lon'];
		}else{
			$adflg = 1;
		}
	}else{
		$adflg = 1;
	}
}
if($rows['prefecture'] == "静岡県")$range = 10000;
//if($rows['prefecture'] == "静岡県" || $rows['prefecture'] == "千葉県")$range = 10000;
//echo $range;
if($adflg == 0){
	//echo "local $latbuf : $lonbuf";
	if($latbuf == 0 || $lonbuf == 0){
		$coordinates = getLatLng($address,$postal,$apikey,$con);
	}else{
		$lat = $latbuf;
		$lng = $lonbuf;
		$coordinates = "{$lonbuf},{$latbuf}";
		//echo "cachehit";
	}
	if($coordinates){
		list($lng,$lat) = explode(',',$coordinates);
		$tenpolist = getNearShop($conn,$lat,$lng,$range);
		if(sizeof($tenpolist)>0){
			foreach($tenpolist as $tenpo){
				 $selectlist .= "<input type=\"checkbox\" name=\"favtenpo{$tenpo['tenpocd']}\" value=\"{$tenpo['tenpocd']}\"> {$tenpo['tenponm'] }<br>\n";
			}
		}else{
			//echo "郵便番号の住所のお近くに安楽亭の店舗が見つかりませんでした。<br>";
		}
	}
}else{
	//echo "郵便番号に該当する住所が特定できませんでした。<br>";
}



function getLatLng($address,$postal,$api_key,$conn){
	
	//$api_key = 'API KEY';
	$api_uri = 'http://maps.google.com/maps/geo?key=' . $api_key . '&output=xml&ie=UTF8&q=';
	
	//simpleXMLで読み込む
	$xml = simplexml_load_file($api_uri . urlencode($address));
	foreach($xml->Response as $res){
		$code = $res->Status->code;
		//正常に返された場合
		if($code == '200'){
			$coordinates = $res->Placemark->Point->coordinates;
		}else{
			$coordinates = FALSE;
		}
	}
	if($coordinates){
		list($lng,$lat) = explode(',',$coordinates);
		$sql = "update m_postal set lat=$lat ,  lon = $lng where code7='$postal'";
		echo $sql;
		$res = $conn->query($sql);
		if(DB::isError($res)){
			die($res->getMessage());
		}
	}
	return $coordinates;
}

function getNearShop($conn,$lat,$lon,$distance=5000){
	$kaisyacd = KAISYACD;
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
			if($row['dis'] <= $distance)$tenpo_list[] = $row;
		}
		if(sizeof($tenpo_list) == 0){
			return;
		}
		// 列方向の配列を得る
		foreach ($tenpo_list as $key => $row) {
			$dis[$key]  = $row['dis'];
		}
		// 距離順にソート
		array_multisort($dis, SORT_ASC, $tenpo_list);
	return $tenpo_list;
}

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<meta id="viewport" name="viewport" content="width=320; initial-scale=1.0; maximum-scale=2.0; user-scalable=1;" />
	<title>◆焼肉 安楽亭モバイルサイト</title>
	<link rel="stylesheet" href="css/top2011.css" />
	<link rel="stylesheet" href="css/common2011.css" />

	<script type="text/javascript" src="js/jquery-1.5.2.min.js"></script>
	<script type="text/javascript" src="js/gears_init.js"></script>
	<script type="text/javascript" src="js/common.js"></script>
	<script type="text/javascript" src="js/top.js"></script>
	<script language="javascript"> 
	<!--//
	var listidx = 3;
//-->
</script>
</head>

<body id='normal' style='background-color:#FFF;'>

<!-- contentsWrap -->
<div id="contentsWrap">


<!-- topPageHeader -->
<header id="topPageHeader" style='color:#666666; background-color: rgb(255,255,255);'>
<h1><a href="index.html"><img src="images/anrakulogo_head.jpg" alt="トップページへ" width="60" height="34"></a>会員登録</h1>
<p class="menuBtn"><a href="javascript:void(0)" onclick="slideUpMenu();">メニュー一覧</a></p>
</header>


<font color="blue"><?= $msg1 ?></font><br>
<hr size=1 noshade color="blue">
<br>
<font size=3>年齢： <?= $nenrei ?></font><br>
<font size=3>性別: <?= $seibetsu ?></font><br>
<font size=3>郵便番号: <?= $yubin1 ?>-<?= $yubin2 ?></font><br>
<font size=3>同居人数: <?= $doukyo ?></font><br>
<font size=3>ﾒｰﾙｱﾄﾞﾚｽ: <?= $mailaddr ?></font><br>
<font size=3>登録ﾒﾙﾏｶﾞ: <?= $magimg ?></font><br>
<form action="questionnaire_sub_tst.php" method=post>
<?
if(sizeof($tenpolist)>0){
?>
よくご利用になる店舗がございましたらお選びください。<br>
<?=$selectlist;?><br>
<?
}
?>
<hr size=1 noshade color="blue">
<br>
送信頂きますと、ご登録のメールアドレスへ【おいしい商品】が100％当たる<font color='#ff0080'>【抽選URL】</font>が送られます。<br>
【注意】当選された「商品」の引換え期限は、<font color='#ff0080'>ご登録日から1週間</font>となります。<br>
<hr size=1 noshade color="blue">
※以下の店舗では「おいしい特典」はご利用になれません。<br>
新浦安店、久喜吉羽店、ふじみ野店、館林北店、コスモス店、ぼたん店<br>
<div align=center><?= $msg2 ?><br></div>
<br>
<input type=hidden name="i" value="<?= $user['session_id'] ?>">
<input type="hidden" name="rt" value="<?=$req['rt'];?>">
<div align=center><input type=submit value="送信"> <br></div>
<font size=2><?= $msg3 ?></font><br>
<input type=hidden name="nenrei" value="<?= $req['nenrei'] ?>"><br>
<input type=hidden name="seibetsu" value="<?= $req['seibetsu'] ?>"><br>
<input type=hidden name="yubin" value="<?= $req['yubin1'] ?>-<?= $req['yubin2'] ?>"><br>
<input type=hidden name="doukyo" value="<?= $req['doukyo'] ?>"><br>
<input type=hidden name="mailaddr" value="<?= $req['mailaddr'] ?>"><br>
<input type=hidden name="mailaddr_hid" value="<?= $req['mailaddr_hid'] ?>"><br>
<input type=hidden name="anraku" value="<?= $req['anraku'] ?>"><br>
<input type=hidden name="honpo" value="<?= $req['honpo'] ?>"><br>
</form>


</div>
<!-- menu -->
<nav id="menu">
</nav>
<script src="js/menu.js"></script>

</body>
</html>