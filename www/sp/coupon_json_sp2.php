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
require_once("coupon_std.inc");
		// DB接続
		$objDb = DB::connect("pgsql://coupon:coupon@10.1.13.2/coupon");
		//$objDb = DB::connect("pgsql://postgres:postgres@10.1.10.42/coupon");
// DB接続

$cpnlist=getCoupons($objDb);

$json = new Services_JSON();

$outdat = $json->encode($cpnlist);

print $outdat;
function getCoupons($conn){
	$basedir = "/usr/local/www/sp/img/";

	// なぞポン抽選基本オッズ抽出
	$eigyobi = date("Y-m-d",mktime()- 3600 * 7);
	$sql=<<<END
select sum(nazopon_odds) as oddssum   
 from m_coupon
 where
  createtime<= now() and deletetime> now() and
  startdate<= '$eigyobi' and stopdate> '$eigyobi' and (nazopon_flg = 1 and nazopon_odds >0)
END;

$result = $conn->query($sql);
$rows = $result->fetchRow(DB_FETCHMODE_ASSOC);
$oddssum = $rows['oddssum'];//なぞポン対象オッズ総和


	// クーポン検索
	$sql=<<<END
select name as cpnname,coalesce(normal_price,0) as genka ,coupon_price as tokka,pictname_sp as imgname,case when nazopon_flg = 1 then 0 else c_sortkey end as sortkey ,
case when nazopon_flg = 1 then nazopon_rank else 0 end as nazoponrank,nazopon_odds ,nazopon_flg  
 from m_coupon
 where
  createtime<= now() and deletetime> now() and
  startdate<= '$eigyobi' and stopdate> '$eigyobi' and (nazopon_flg= 0 or (nazopon_flg = 1 and nazopon_odds >0))
order by 5,7
END;

//echo $sql;
		//$sql = mb_convert_encoding($sql, 'UTF-8', 'SJIS-win');
		$result = $conn->query($sql);
		$nazoponset = 0;
		$rnd= mt_rand(1, $oddssum);
		while($row =$result->fetchRow(DB_FETCHMODE_ASSOC)){
			// 距離取得
			//$row['dis'] = round(calc_distanceDeg($lon, $lat, $row['x'], $row['y']));
			if($row["nazoponrank"] >0 && $nazoponset == 0){
				if($rnd < $row["nazopon_odds"]){
					$nazoponset = 1;
				}else{
					$rnd -= $row["nazopon_odds"];
					continue;
				}
			}else if($row["nazoponrank"] >0 && $nazoponset == 1){
				continue;
			}
			$filepath = $basedir."{$row["imgname"]}";
			$md5str = "ng";
			if(file_exists($filepath))$md5str = md5_file($filepath);
			$row["cpnname"] = eregi_replace("<br>","\n",$row["cpnname"]);
			$cpnname = preg_replace("/<[^<]*>/","",$row["cpnname"]);
			$tenpo_list[] = Array(
				"sortkey" => $row['sortkey'],
				"nazoponrank" => $row['nazoponrank'],
				"cpnname" => $cpnname,
				"imgname" => $row["imgname"],
				"genka" => $row["genka"],
				"tokka" => $row["tokka"],
				"md5" => $md5str //,
				//"comment" => $row["commenttype"]
			);
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