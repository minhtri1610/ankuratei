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

$regtenpo = explode(",", $user['question9']);

$req= $_REQUEST;

$tenpocdlist=getShopLocation($conn,$_REQUEST["lon"],$_REQUEST["lat"]);

$json = new Services_JSON();

$outdat = $json->encode($tenpocdlist);

print $outdat;

//print $_REQUEST["lon"];

function getShopLocation($conn,$lon,$lat){
	$kaisyacd = KAISYACD;
	$gyotailist = Array(
		'0000',
		'0010',
		'2200',
		'2700',
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
		m2.tel1 as tel,
		m2.address1 as address,
		to_char(m2.egjknfrom,'HH24:MI') as fromtime,
		to_char(m2.egjknto,'HH24:MI') as totime,
		m2.egjkn2kbn,
		to_char(m2.egjknfrom2,'HH24:MI') as fromtime2,
		to_char(m2.egjknto2,'HH24:MI') as totime2,
		m2.x,
		m2,y,
		m2.suryo01 * 1 as chair,
		m2.suryo02 * 1 as park,
		m2.tenpokbn03 as sumibiflg,
		m2.tenpokbn04 as dbar,
		m2.tenpokbn06 as sbar,
		m2.tenpokbn08 as cbar,
		m2.tenpokbn15 as gbar,
		m2.tenpokbn13 as kroom,
		m2.tm17kbn    as yukke,
		m2.tm18kbn    as tabeho,
		m2.tm16kbn    as tablet,
		m2.tm19kbn as kuroge,
		m3.comment
	from
		f_get_m_syozoku() as m
		inner join
			f_get_m_tenpo() as m2
		on
			m2.tenpocd = m.tenpocd and
			m2.tenpokbn07 not in ('5', '9') and
			m2.heitenbi is null
		left join (select a.店舗コード as tenpocd,店長コメント as comment from webmaintenance.更新情報＿店舗管理 as a inner join (select 店舗コード,max(適用日) as hiduke  from webmaintenance.更新情報＿店舗管理 group by 店舗コード) as b on a.店舗コード = b.店舗コード and a.適用日 = b.hiduke) as m3
		 on 
		 	m3.tenpocd = m.tenpocd
	where
		m.kaisyacd = '$kaisyacd' and gyotaicd in ('$strictsql')
END;
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
			$tenponame = preg_replace("/　/","\n",$row['tenponame']);
			
			if($tenponame == $row['tenponame']){
				$tenpotype = "安楽亭";
			}else{
				$parts = explode("\n",$tenponame);
				$tenpotype = $parts[0];
				$tenponame = $parts[1];
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
			$address = "";
			$addbuf = $row["address"];
			$addlen = mb_strlen($addbuf);
			$linechars = 14;
			if($addlen >$linechars){
				for($i = 0; $i <=$addlen;$i+=$linechars){
					if($i == 0){
						$address = mb_substr($addbuf,0,$linechars,"UTF-8");
					}else{
						$address .="\n　　　　　 " .  mb_substr($addbuf,$i,$linechars,"UTF-8");
					}
				}
			}else{
				$address = $addbuf;
			}
			$data .= " 住所　　：{$address}\n";
			if(strlen(trim($row['comment'])) >0){
				$comment = str_replace("<br>","",$row['comment']);
				//$comment = $row['comment'];
				//print $comment."\n";
				$data .= " 店長より：{$comment}\n";
			}
			$datAry = Array();
			$icnAry = Array();
			$icn2Ary = Array();
			$sflg = 0;
			if($row['tabeho']>0){
				$datAry[] = "食べ放題";
				$icnAry[] = "7";
				$i++;
			}
			if($row['tablet']>0){
				$datAry[] = "タブレット";
				$icnAry[] = "10";
				$i++;
			}
			if($row['kuroge']>0){
				$datAry[] = "お値打ち黒毛和牛";
				$icnAry[] = "8";
				$i++;
			}
			if($row['yukke']>0){
				$datAry[] = "国産牛ユッケ";
				$icnAry[] = "9";
				$i++;
			}
			if($row['sumibiflg']=='2'){
				$datAry[] ="炭火焼肉";
				$icnAry[] = "1";
				$sflg = 1;
				$i++;
			}
			if($row['dbar']=='1'){
				$datAry[] = "ﾄﾞﾘﾝｸﾊﾞｰ";
				$icnAry[] = "2";
				$i++;
			}
			if($row['sbar']=='1'){
				$datAry[] = "ｻﾗﾀﾞﾊﾞｰ";
				$icnAry[] = "3";
				$i++;
			}
			if($row['cbar']=='1'){
				$datAry[] = "ｹｰｷﾊﾞｰ";
				$icnAry[] = "4";
				$i++;
			}
			if($row['gbar']=='1'){
				$datAry[] = "ｼﾞｪﾗｰﾄﾊﾞｰ";
				$icnAry[] = "5";
				$i++;
			}
			if($row['kroom']=='1'){
				$datAry[] = "ｷｯｽﾞﾙｰﾑ";
				$icnAry[] = "6";
				$i++;
			}
			for($cn = 0;$cn <4;$cn++){
				if($icnAry[$cn] == "")$icnAry[$cn] = "0";
			}
			for($cn = 0;$cn <3;$cn++){
				if($icn2Ary[$cn] == "")$icn2Ary[$cn] = "0";
			}
			$tenpo_list[] = Array(
			"lat"=>$row["lat"],
			"lon"=>$row["lon"],
			"tenponame"=>"{$row["tenponame"]}",
			"tenpotype"=>"{$tenpotype}",
			"tenponame2"=>"{$tenponame}",
			"tenpocd"=>"{$row["tenpocd"]}",
			"tel"=>$row["tel"],
			"park"=>$row["park"],
			"dbar"=>$row['dbar'],
			"sbar"=>$row['sbar'],
			"cbar"=>$row['cbar'],
			"gbar"=>$row['gbar'],
			"sumibiflg"=>$row['sumibiflg'],
			"kroom"=>$row['kroom'],
			"yukke"=>$row['yukke'],
			"kuroge"=>$row['kuroge'],
			"tablet"=>$row['tablet'],
			"tabeho"=>$row['tabeho'],
			"fromtime"=>$row['fromtime'],
			"totime"=>$row['totime'],
			"tabeho"=>$row['tabeho'],
			"tabeho"=>$row['tabeho'],
			"opentime"=>$data
			);
		}
		if(sizeof($tenpo_list) == 0){
			return;
		}
	return $tenpo_list;
}

?>