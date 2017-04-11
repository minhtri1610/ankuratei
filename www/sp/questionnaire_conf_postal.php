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
	$nenrei= sjis("未回答");
	$req["nenrei"]= "";
}
else {
	$nenrei= sjis($_REQUEST['nenrei']. "歳");
}
// 性別
switch($_REQUEST['seibetsu']) {
	case 1:
		$seibetsu= sjis("男性"); break;
	case 2:
		$seibetsu= sjis("女性"); break;
	default:
		$seibetsu= sjis("未回答");
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
	$doukyo= sjis("未回答");
}
else {
	$doukyo= sjis($_REQUEST['doukyo']. "人");
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
	$magimg .= sjis("<img alt=\"安楽亭\" src=\"logo.jpg\" width=\"70\">");
}
if($_REQUEST['honpo']=="on"){
	$magimg .= sjis("<img alt=\"カルビ本舗\" src=\"honpo_logo.gif\" width=\"70\">");
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
				 $selectlist .= sjis("<input type=\"checkbox\" name=\"favtenpo{$tenpo['tenpocd']}\" value=\"{$tenpo['tenpocd']}\"> {$tenpo['tenponm'] }<br>\n");
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

switch($minfo['provider']) {
	case "au":
		include "page_ezweb/questionnaire_conf_postal.php";
		break;
	case "yahoo":
		include "page_softbank/questionnaire_conf_postal.php";
		break;
	default:	// docomoとその他
		include "page_imode/questionnaire_conf_postal.php";
}

?>
