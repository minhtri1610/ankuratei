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
// DB接続

$cpnlist=getCoupons($objDb);

$json = new Services_JSON();

$outdat = $json->encode($cpnlist);

print $outdat;
function getCoupons($conn){
	// クーポン検索
	$eigyobi = date("Y-m-d",mktime()- 3600 * 7);
	$sql=<<<END
select name as cpnname,normal_price as genka ,coupon_price as tokka,pictname_sp as imgname from m_coupon
where
  createtime<= now() and deletetime> now() 
 and 
  startdate<= '$eigyobi' and stopdate> '$eigyobi'  and nazopon_flg =0

order by c_sortkey
END;


		//$sql = mb_convert_encoding($sql, 'UTF-8', 'SJIS-win');
		$result = $conn->query($sql);
	$tenpo_list[] = Array(
			"count"=>($result->numRows() +1)
	);
	return $tenpo_list;
}

?>