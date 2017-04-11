<?php
define("NO_USERINFO", FALSE);
mb_internal_encoding('UTF-8');
	session_start();
		// ファイル読み込み
	    require_once("DB.php");
	    require_once("global.php");
		require_once("Services/JSON.php");
require_once('../common.inc');
require_once('../lib/lib.php');
		// DB接続
		$objDb = DB::connect("$DB_TYPE://$DB_USER:$DB_PASS@$DB_HOST/$DB_NAME");
// DB接続
$conn = @pg_connect("host=".DB_HOST." dbname=".DB_NAME." user=".DB_USER." password=".DB_PASS);
if($conn == false){
	exit;
}

//$regtenpo = explode(",", $user['question9']);

$req= $_REQUEST;

$tenpocdlist=getShopLocation($conn,addslashes($_REQUEST["search"]),addslashes($_REQUEST["lon"]),addslashes($_REQUEST["lat"]));

$json = new Services_JSON();

$outdat = $json->encode($tenpocdlist);

print $outdat;

//print $_REQUEST["lon"];


function getShopLocation($conn,$searchstr,$lon,$lat){
	//$searchstr = "大宮";
	$kaisyacd = KAISYACD;
	$gyotailist = Array(
		'0000',
		'0010',
		'2200',
		'2700',
		'3100',
		'2800',
		'2900'
	);

	$strictsql = implode("','",$gyotailist);

	// 全店検索
	$sql=<<<END
	select
		m2.tenponm as tenponame,
		m2.tenpocd as tenpocd,
		m2.x as lon,
		m2.y as lat,
		m2.address1 as address,
		m2.x,
		m2,y
	from
		f_get_m_syozoku() as m
		inner join
			f_get_m_tenpo() as m2
		on
			m2.tenpocd = m.tenpocd and
			m2.tenpokbn07 not in ('5', '9') and
			m2.heitenbi is null
	where
		m.kaisyacd = '$kaisyacd' and gyotaicd in ('$strictsql') and (m2.tenponm like '%{$searchstr}%' or m2.address1 like  '%{$searchstr}%') and m2.kaitenbi < current_timestamp + '+7 days'
END;

//echo $sql;
		//$sql = mb_convert_encoding($sql, 'UTF-8', 'SJIS-win');
		$result = pg_query($conn,$sql);
		/*
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

		*/
		while($row = pg_fetch_array($result)){
			// 距離取得
			$row['dis'] = round(calc_distanceDeg($lon, $lat, $row['x'], $row['y']));
			$tenponame = preg_replace("/　/","\n",$row['tenponame']);
			if($tenponame == $row['tenponame']){
				$tenponame = "安楽亭\n{$tenponame}\n\n\n";
			}else{
				$tenponame = "{$tenponame}\n\n\n";
			}
			$data = " 営業時間：{$row["fromtime"]}～{$row["totime"]}\n";
			switch($row['egjkn2kbn']){
				case 1:
				$data .= " 金土・祝前日：{$row["fromtime"]}～{$row["totime"]}\n";
				break;
				case 2:
				$data .= " 金土：{$row["fromtime"]}～{$row["totime"]}\n";
				break;
				case 3:
				$data .= " 土日祝：{$row["fromtime"]}～{$row["totime"]}\n";
				break;
				case 4:
				$data .= " 金土日祝・祝前日：{$row["fromtime"]}～{$row["totime"]}\n";
				break;
				default:
				break;
			}
			$data .= " 客席数　：{$row["chair"]}席\n";
			if($row["park"]>0){
				$data .= " 駐車場　：{$row["park"]}台\n";
			}else{
				$data .= " 駐車場　：なし\n";
			}
			$data .= " 電話番号：{$row["tel"]}\n";
			$data .= " 住所　　：{$row["address"]}\n";
			if(strlen(trim($row['comment'])) >0){
				$comment = str_replace("<br>","",$row['comment']);
				//$comment = $row['comment'];
				//print $comment."\n";
				$data .= " 店長より：{$comment}\n";
			}
			$datAry = Array();
			$icnAry = Array();
			$icn2Ary = Array();
			$tenpo_list[] = Array(
			"lat"=>$row["lat"],
			"lon"=>$row["lon"],
			"dis"=>$row["dis"],
			"tenponame"=>"{$row["tenponame"]}",
			"tenpocd"=>"{$row["tenpocd"]}",
			"address"=>"{$row["address"]}",
			"opentime"=>$data
			);
		}
		// 列方向の配列を得る
		foreach ($tenpo_list as $key => $row) {
			$dis[$key]  = $row['dis'];
		}
		// 距離順にソート
		array_multisort($dis, SORT_ASC, $tenpo_list);
//		array_multisort($dis, SORT_DESC, $tenpo_list);
		if(sizeof($tenpo_list) == 0){
			return;
		}
	return $tenpo_list;
}

?>