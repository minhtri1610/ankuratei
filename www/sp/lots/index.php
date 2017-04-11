<?
require_once("common.inc");

// Try COOKIEから過去の抽選結果を取得
$cookie = explode(",", $_COOKIE["coupon_term02"]);	// "クーポンコード,営業日"

// ◆登録があったら結果を表示
if(count($cookie)>1){
	$couponcd	= $cookie[0];
	$eigyobi	= $cookie[1];
	
	require_once("./result.php");
	exit;
}

// ◆COOKIEがなかったらトップページを表示
require_once("./top.php");
exit;
?>
