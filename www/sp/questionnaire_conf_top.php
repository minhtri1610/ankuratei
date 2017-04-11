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

$regtenpo = explode(",", $user['question9']);

$req= $_REQUEST;

$tenpocdlist=Array();

$tokyoCode = Array(
	'2021' => "歌舞伎町店",
	'2022' => "池袋北口店",
	'2080' => "渋谷道玄坂店",
	'2072' => "西早稲田店",
	'2063' => "赤羽東口店",
	'2029' => "尾久店"/*,
	'2073' => "杉並堀ノ内店",
	'2010' => "大泉店",
	'2014' => "平和台店",
	'2045' => "練馬関町店",
	'2076' => "上石神井店",
	'2078' => "国産牛カルビ本舗鷺宮店",
	'9031' => "練馬店",
	'2050' => "練馬小竹店",
	'2005' => "坂下店"*/
);

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

$postal="{$yubin1}{$yubin2}";

$sql = "select * from m_postal where code7 = ?";
$res= $con->query($sql,Array($postal));
if(DB::isError($res)){
	echo $sql;
	die($res->getMessage());
}

$adflg = 0;
$range = 10000;
if($res->numRows()>0 && strlen($postal)>0){
	$rows= $res->fetchRow(DB_FETCHMODE_ASSOC);
	$address = "{$rows['prefecture']}{$rows['city']}{$rows['town']}";
	$postal = $rows['code7'];
	$latbuf = $rows['lat'];
	$lonbuf = $rows['lon'];
}else{
	if(strlen($postal)>0){
		$sql = "select * from m_postal where code7 like ?";
		$res= $con->query($sql,Array("{$postal}%"));
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
		//$coordinates = getLatLng($address,$postal,$apikey,$con);
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
				$chkd = "";
				if(in_array($tenpo['tenpocd'],$regtenpo))$chkd = " checked";
				 $selectlist .= "<input type=\"checkbox\" name=\"favtenpo{$tenpo['tenpocd']}\" value=\"{$tenpo['tenpocd']}\" {$chkd}> {$tenpo['tenponm'] }<br>\n";
			}
		}else{
			//echo "郵便番号の住所のお近くに安楽亭の店舗が見つかりませんでした。<br>";
		}
	}
}else{
	//echo "郵便番号に該当する住所が特定できませんでした。<br>";
}
$tyoflg = 0;
$selectlist2 = "";
foreach($tokyoCode as $code=>$name){
	if(in_array($code,$tenpocdlist))continue;
	$tyoflg = 1;
	$chkd = "";
	if(in_array($code,$regtenpo))$chkd = " checked";
	$selectlist2 .= "<input type=\"checkbox\" name=\"favtenpo{$code}\" value=\"{$code}\"{$chkd}> {$name}<br>\n";
}
if($_REQUEST['ty'] == 1){//山手線沿線表示モード
	$selectlist = $selectlist2 . $selectlist;
	$tyoflg = 0;
}else{
	$tyolink = "questionnaire_conf_top.php?ty=1&{$_SERVER['QUERY_STRING']}";
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
		$sql = "update m_postal set lat=$lat ,  lon = $lng where code7=?";
		$res = $conn->query($sql,Array($postal));
		if(DB::isError($res)){
			die($res->getMessage());
		}
	}
	return $coordinates;
}

function getNearShop($conn,$lat,$lon,$distance=5000){
	$kaisyacd = KAISYACD;
	$gyotailist = Array(
		'0000',
		'0010',
		'2200',
		'2700',
		'2800',
		'2900',
		'3100'
	);

	$strictsql = implode("','",$gyotailist);

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
		m.kaisyacd = '$kaisyacd' and gyotaicd in ('$strictsql')
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
<form action="questionnaire_sub_top.php" method=post>
<?
if(sizeof($tenpolist)>0){
?>
チェックを入れて頂いた店舗の<br>
特別企画をお知らせする場合がございます。<br>
よく利用する店舗がございましたらお選び下さい。<br>
<?
if($tyoflg == 1){
?>
東京都新宿区、渋谷区、豊島区、北区の店舗をよくご利用になられる場合<br>
<a href="<?=$tyolink;?>">こちら</a>からお選びください。<br>
<?
}
?>
<?=$selectlist;?><br>
<?
}
?>
<hr size=1 noshade color="blue">
<br>
<font color='#ff0080'>新規会員登録の場合は</font>、ご登録のメールアドレスへ【黒毛和牛カルビ】などが当たる<font color='#ff0080'>【抽選URL】</font>が送られます。<br>
【注意】当選された「商品」の引換え期限は、<font color='#ff0080'>ご登録日から1週間</font>となります。<br>
<hr size=1 noshade color="blue">
※既に会員登録済みのアドレスには【抽選URL】は<font color='#ff0080'>送信されません。</font><br>
※以下の店舗ではご利用になれません。<br>
新浦安店、久喜吉羽店、ふじみ野店、館林北店、コスモス店、ぼたん店<br>
<div align=center><?= $msg2 ?><br></div>
<br>
<input type=hidden name="i" value="<?= $user['session_id'] ?>">
<input type="hidden" name="rt" value="<?=$req['rt'];?>">
<div align=center><input type=submit value="送信"> <br></div>
<font size=2><?= $msg3 ?></font><br>
<input type=hidden name="nenrei" value="<?= $req['nenrei'] ?>"><br>
<input type=hidden name="seibetsu" value="<?= $req['seibetsu'] ?>"><br>
<input type=hidden name="yubin1" value="<?= $yubin1 ?>"><br>
<input type=hidden name="yubin2" value="<?= $yubin2 ?>"><br>
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