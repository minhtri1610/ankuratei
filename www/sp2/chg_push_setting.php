<?php

mb_language("ja") ;
mb_internal_encoding('UTF-8');

define ("DB_HOST" , "10.90.1.18");
define ("DB_NAME" , "coupon");
define ("DB_USER" , "postgres");
define ("DB_PASS" , "postgres");

// DB接続
$conn = pg_connect("host=".DB_HOST." dbname=".DB_NAME." user=".DB_USER." password=".DB_PASS);
if( $conn == false ) {
	echo "DB接続エラー";
	exit;
}

// 要求パラメータ取得
$regID   = $_GET['regID'];		// レジストレーションID
$setting = $_GET['setting'];	// 通知設定（0:OFF, 1:ON）
if( ($regID == "") || ($setting == "") ) {
	echo "パラメータ異常";
	exit;
}

// 通知設定変更（登録レジストレーションIDの有効／無効切換え）
$sql = "UPDATE devtokens_gcm SET valid_flg = $1 WHERE token = $2";
$result = pg_query_params($conn, $sql, array($setting, $regID));
if( !$result ) {
	echo "更新失敗\n$sql\n";
	exit;
}

echo "OK";
exit;

?>