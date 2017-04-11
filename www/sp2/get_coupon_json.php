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
//require_once("coupon_std.inc");

// DB接続
//$objDb = DB::connect("pgsql://coupon:coupon@10.1.13.2/coupon");
$objDb = DB::connect("pgsql://postgres:postgres@10.90.1.18/coupon");
// DB接続

$cpnlist=getCoupons($objDb,$_REQUEST['sd']);

$json = new Services_JSON();

$outdat = $json->encode($cpnlist);

header("Access-Control-Allow-Origin:*");
print $outdat;
function getCoupons($conn,$setid){
	$setid = $setid * 1;
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

//なぞポン抽選済みID送信時にはなぞポン固定
//ID存在チェック

$addsql = "";

if($setid > 0){
	$sql=<<<END
select name as cpnname,coalesce(normal_price,0) as genka ,coupon_price as tokka,pictname_sp as imgname,case when nazopon_flg = 1 then 0 else c_sortkey end as sortkey ,
case when nazopon_flg = 1 then nazopon_rank else 0 end as nazoponrank,nazopon_odds ,nazopon_flg,id  
 from m_coupon
 where
  createtime<= now() and deletetime> now() and
  startdate<= '$eigyobi' and stopdate> '$eigyobi' and nazopon_flg = 1 and nazopon_odds >0 and id=?
order by 5,7
END;

	$res = $conn->query($sql, array($setid));
	if($res->numRows()>0){
		$rows = $res->fetchRow(DB_FETCHMODE_ASSOC);
		$oddssum = $row["nazopon_odds"];
		$addsql = "and id={$rows["id"]}";
	}
}
	// クーポン検索
	$sql=<<<END
select name as cpnname,coalesce(normal_price,0) as genka ,coupon_price as tokka,pictname_sp as imgname,case when nazopon_flg = 1 then 0 else c_sortkey end as sortkey ,
case when nazopon_flg = 1 then nazopon_rank else 0 end as nazoponrank,nazopon_odds ,nazopon_flg,id  
 from m_coupon
 where
  createtime<= now() and deletetime> now() and
  startdate<= '$eigyobi' and stopdate> '$eigyobi' and (nazopon_flg= 0 or (nazopon_flg = 1 and nazopon_odds >0 $addsql))
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
			$imagename = $row["imgname"];
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
				//	$imagename="hoge.jpg";
			$filepath = $basedir."{$row["imgname"]}";
			$md5str = "ng";
			if(file_exists($filepath))$md5str = md5_file($filepath);
//			$row["cpnname"] = eregi_replace("<br>","\n",$row["cpnname"]);
			$row["cpnname"] = preg_replace("/<br>/i","\n",$row["cpnname"]);
			$cpnname = preg_replace("/<[^<]*>/","",$row["cpnname"]);
			$tenpo_list[] = Array(
				"sortkey" => $row['sortkey'],
				"nazoponrank" => $row['nazoponrank'],
				"cpnname" => $cpnname,
				"imgname" => $imagename,
				"genka" => $row["genka"],
				"tokka" => $row["tokka"],
				"id" => $row["id"],
				"md5" => $md5str //,
				//"comment" => $row["commenttype"]
			);
			/*
			$addAry =  Array(
				"sortkey" => $row['sortkey'],
				"nazoponrank" => $row['nazoponrank'],
				"cpnname" => $cpnname,
				"imgname" => $row["imgname"],
				"genka" => $row["genka"],
				"tokka" => $row["tokka"],
				"id" => $row["id"],
				"md5" => $md5str //,
				//"comment" => $row["commenttype"]
			);
		*/
			
		}
		if(sizeof($tenpo_list) == 0){
			return;
		}
		/*
		while(sizeof($tenpo_list)< 27){
			$tenpo_list[] = $addAry;
		}
		*/
		
		// 列方向の配列を得る
		foreach ($tenpo_list as $key => $row) {
			$dis[$key]  = $row['dis'];
		}
		// 距離順にソート
		array_multisort($dis, SORT_ASC, $tenpo_list);
	return $tenpo_list;
}

?>
