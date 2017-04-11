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
		//$objDb = DB::connect("pgsql://coupon:coupon@10.1.13.2/coupon");
		$objDb = DB::connect("pgsql://postgres:postgres@10.90.1.18/coupon");
// DB接続

$cpnlist = Array();
//$cpnlist=getCoupons($objDb);

$cpnlist[] = Array(
	"commentid" => "0",
	"commentbody" => "●クーポン券のご利用は、新聞折込クーポン類と併せて、1回のご来店でお１人様２枚までとなります。

●クーポン券１枚で表記のメニューが表記価格にて１品ご飲食できます。

●クーポン券は、ご注文の際にお出しください。

●生ビール、サワー・カクテル、ソフトドリンク割引券のみでのご飲食はご遠慮ください。

●生ビール割引券、サワー・カクテル割引券は２０歳以上のお客様に限らせていただきます。

●クーポン券は焼肉レストラン安楽亭の店舗で有効です。
但し、下北あんらく亭、福島エリア各店、国産牛カルビ本舗　浦和大谷口店ではご利用いただけません。

●店舗によってお取り扱いの無い商品がございます。詳しくはご利用の店舗に直接お問い合わせください。

●価格の「税込」は、消費税加算後の小数点以下を切り上げ表記しているため、お会計金額と誤差が生じる可能性があります。予めご了承ください。

●他の割引券、サービス券との併用はできません。

●有効期限の無いものは、無効とさせて頂きます。"
);

$json = new Services_JSON();

$outdat = $json->encode($cpnlist);

print $outdat;
function getCoupons($conn){
	// コメント検索
	$eigyobi = date("Y-m-d",mktime()- 3600 * 7);
	$sql=<<<END
select commentid,commentbody  from m_couponcomment
 where commentid in (select commenttype from m_coupon where 
  createtime<= now() and deletetime> now() and
  startdate<= '$eigyobi' and stopdate> '$eigyobi' )
order by commentid
END;


		//$sql = mb_convert_encoding($sql, 'UTF-8', 'SJIS-win');
		$result = $conn->query($sql);
		while($row =$result->fetchRow(DB_FETCHMODE_ASSOC)){
			// 距離取得
			//$row['dis'] = round(calc_distanceDeg($lon, $lat, $row['x'], $row['y']));
			$row["cpnname"] = eregi_replace("<br>","\n",$row["cpnname"]);
			$cpnname = preg_replace("/<[^<]*>/","",$row["cpnname"]);
			$tenpo_list[] = Array(
				"commentid" => $row["commentid"],
				"commentbody" => $row["commentbody"]
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