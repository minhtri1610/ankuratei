<?php
require_once("/usr/local/www/coupon_next/db.inc");
require_once("/usr/local/www/coupon_next/date.inc");
require_once("/usr/local/www/coupon_next/error.inc");
require_once("/usr/local/www/coupon_next/coupon.inc");

// SJIS変換用関数
function sjis($text, $default_encode= "utf8") {
	return mb_convert_encoding($text, "sjis", $default_encode);
}

function ismobile() {
	if(strlen($_SERVER['HTTP_X_UP_SUBNO'])> 0)	return TRUE;
	
	return TRUE;
}
?>
