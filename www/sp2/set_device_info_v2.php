<?php
mb_language("ja") ;
mb_internal_encoding('UTF-8');

define ("DB_HOST" , "127.0.0.1");
define ("DB_NAME" , "new");
define ("DB_USER" , "postgres");
define ("DB_PASS" , "123");

// 返却値
$output = array('msg'=>"OK", 'valid_flg'=>1);

// DB接続
$conn = pg_connect("host=".DB_HOST." dbname=".DB_NAME." user=".DB_USER." password=".DB_PASS);
if($conn == false) {
	$output['msg'] = "DB接続エラー";
	exit;
}

// 要求パラメータ取得
$ID    = $_POST['uuid'];		// 端末ID（UUID）
$preID = $_POST['pre_uuid'];	// 端末ID（UUID）※前回までの値
$PF    = $_POST['platform'];	// プラットフォーム
$VER   = $_POST['version'];		// OSバージョン
$MODEL = $_POST['model'];		// モデル名

if ($ID == "" or $ID == NULL) {
	$output['msg'] = "パラメータ異常";
	var_dump($output);
	exit;
}

// 登録済みチェック
$sql = "SELECT * FROM device_info WHERE device_id = $1";
$result = pg_query_params($conn, $sql, array($preID));
if (!$result) {
	$output['msg'] = "情報取得エラー\n$sql\n";
	exit;
}
$rows = pg_num_rows($result);
// 登録済みの場合、デバイスIDとバージョン情報を更新
if ($rows > 0) {
	//----------
	// 更新処理
	//----------
	$sql = "UPDATE device_info SET device_id = $1, version = $2 WHERE device_id = $3";
	$result = pg_query_params($conn, $sql, array($ID, $VER, $preID));
	if (!$result) {
		$output['msg'] = "更新失敗\n$sql\n";
		exit;
	}
} else {
	//----------
	// 新規登録
	//----------
	$sql = "INSERT INTO device_info(device_id, platform, version, model) VALUES ($1, $2, $3, $4)";
	$result = pg_query_params($conn, $sql, array($ID, $PF, $VER, $MODEL));
	if (!$result) {
		$output['msg'] = "登録失敗\n$sql\n";
		exit;
	}
}

// 端末IDの変更チェック
if ($ID !== $preID) {
	//----------------------------------
	// ログ情報テーブルのデバイスID更新
	//----------------------------------
	$sql = "UPDATE t_app_op_log SET device_id = $1 WHERE device_id = $2";
	$result = pg_query_params($conn, $sql, array($ID, $preID));
	if (!$result) {
		$output['msg'] = "操作ログテーブルの更新失敗\n$sql\n";
		exit;
	}
	//------------------------------------------
	// デバイストークンテーブルのデバイスID更新
	//------------------------------------------
	// 参照テーブル設定
	if( $PF === 'iOS' ) {
		// iOS
		$table = "devtokens_apn";
	} else {
		// Android
		$table = "devtokens_gcm";
	}
	// 更新処理
	$sql = "UPDATE $table SET device_id = $1 WHERE device_id = $2";
	$result = pg_query_params($conn, $sql, array($ID, $preID));
	if (!$result) {
		$output['msg'] = "トークン情報テーブルの更新失敗\n$sql\n";
		exit;
	}
}

// JSON形式に変換
// $outdat = json_encode($output);

// header("Access-Control-Allow-Origin:*");
// header('Content-type: application/json');
// print $outdat;
var_dump($output);
?>