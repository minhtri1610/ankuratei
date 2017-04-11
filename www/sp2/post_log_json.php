<?php

mb_internal_encoding('UTF-8');

define ("DB_HOST" , "10.90.1.18");
define ("DB_NAME" , "coupon");
define ("DB_USER" , "postgres");
define ("DB_PASS" , "postgres");

// DB接続
$conn = pg_connect("host=".DB_HOST." dbname=".DB_NAME." user=".DB_USER." password=".DB_PASS);
if($conn == false){
	exit;
}

// 返却値
$output = array('msg'=>"OK");

header("Content-Type:text/html; charset=utf-8");
header("Access-Control-Allow-Origin:*");
header('Content-type: application/json');

// クエリパラメター値
$device_id = $_REQUEST['device_id'];
$op_type = $_REQUEST['op_type'];
$op_date = $_REQUEST['op_date'];
$lat = $_REQUEST['lat'];
$lon = $_REQUEST['lon'];
$info_id = $_REQUEST['info_id'];

// ログデータ挿入SQL
$sql = "INSERT INTO t_app_op_log(device_id, op_type, op_date, lat, lon, info_id) " .
       "VALUES " . "($1, $2, $3, $4, $5, $6)";

// SQL実行
$result = pg_query_params($conn, $sql, array($device_id, $op_type, $op_date, $lat, $lon, $info_id));

// 問い合わせ失敗したら、返却メッセージを設定
if (!$result) {
	$output['msg'] = "登録失敗\n$sql\n";
	exit;
}

// JSON形式に変換
$output = json_encode($output);

print $output;
?>
