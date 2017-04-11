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
		$objDb = DB::connect("pgsql://coupon:coupon@10.1.13.2/coupon");
		//$objDb = DB::connect("pgsql://postgres:postgres@10.1.10.42/coupon");
// DB接続

$cpnlist=getCoupons($objDb);

$json = new Services_JSON();

$outdat = $json->encode($cpnlist);

print $outdat;
function getCoupons($conn){
	// クーポン検索
	//$basedir = "/usr/local/www/sp/wallpaper/";
	$basedir = "/usr/local/www/sp/thumbnail/";
	$eigyobi = date("Y-m-d",mktime()- 3600 * 7);
	$sql=<<<END
select c_sortkey as sortkey,name as cpnname,pictname as imgname,pictname_sp as imgname_s from m_wallpaper
 where
  createtime<= now() and deletetime> now() and
  startdate<= '$eigyobi' and stopdate> '$eigyobi' 
order by c_sortkey
END;

		//$sql = mb_convert_encoding($sql, 'UTF-8', 'SJIS-win');
		$result = $conn->query($sql);
		if(DB::isError($result)){
			echo $result->getMessage();
		}
		while($row =$result->fetchRow(DB_FETCHMODE_ASSOC)){
			// 距離取得
			//$row['dis'] = round(calc_distanceDeg($lon, $lat, $row['x'], $row['y']));
			$row["cpnname"] = eregi_replace("<br>","\n",$row["cpnname"]);
			$cpnname = preg_replace("/<[^<]*>/","",$row["cpnname"]);			$filepath = $basedir."{$row["imgname"]}";
			$md5str = "ng";
			if(md5_file($filepath))$md5str = md5_file($filepath);
			$filepath = $basedir."{$row["imgname_s"]}";
			$md5str_s = "ng";
			if(md5_file($filepath))$md5str_s = md5_file($filepath);
			$tenpo_list[] = Array(
				"sortkey" => $row['sortkey'],
				"wpname" => $cpnname,
				"imgname" => $row["imgname"],
				"imgname_s" => $row["imgname_s"],
				"md5" => $md5str,
				"md5_s" => $md5str_s
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