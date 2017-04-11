<?php

mb_language("ja") ;
mb_internal_encoding('UTF-8');

define ("DB_HOST" , "10.90.1.18");
define ("DB_NAME" , "coupon");
define ("DB_USER" , "postgres");
define ("DB_PASS" , "postgres");

// 返却値
$output = array('msg'=>"OK", 'valid_flg'=>1);

// DB接続
$conn = pg_connect("host=".DB_HOST." dbname=".DB_NAME." user=".DB_USER." password=".DB_PASS);
if($conn == false) {
	$output['msg'] = "DB接続エラー";
	exit;
}

// 要求パラメータ取得
$devID    = $_POST['devID'];	// 端末ID（UUID）
$preToken = $_POST['preToken'];	// 以前のトークン
$newToken = $_POST['newToken'];	// 新しいトークン
$os       = $_POST['os'];		// OS（Android／iOS）

if( $newToken == "" ) {
	$output['msg'] = "パラメータ異常";
	exit;
}

// 参照テーブル設定
if( $os === 'iOS' ) {
	// iOS
	$table = "devtokens_apn";
} else {
	// Android
	$table = "devtokens_gcm";
}

// デバイストークンの登録処理
if ( $preToken == "" ) {
	//----------
	// 新規登録
	//----------
	// 端末IDの登録済みチェック
	$sql = "SELECT * FROM $table WHERE device_id = $1";
	$result = pg_query_params($conn, $sql, array($devID));
	if (!$result) {
		$output['msg'] = "情報取得エラー\n$sql\n";
		exit;
	}
	$rows = pg_num_rows($result);
	// 登録済みの端末IDが存在する場合は、トークン情報を更新
	if ($rows > 0) {
		// トークン情報更新
		$sql = "UPDATE $table SET token = $1 WHERE device_id = $2";
		$result = pg_query_params($conn, $sql, array($newToken, $devID));
		if (!$result) {
			$output['msg'] = "更新失敗\n$sql\n";
			exit;
		}
	} else {
		// トークンの重複チェック
		$sql = "SELECT * FROM $table WHERE token = $1";
		$result = pg_query_params($conn, $sql, array($newToken));
		if (!$result) {
			$output['msg'] = "情報取得エラー\n$sql\n";
			exit;
		}
		$rows2 = pg_num_rows($result);
		// 登録済みのトークンが存在する場合は、端末IDを更新
		if ($rows2 > 0) {
			// 端末ID更新
			$sql = "UPDATE $table SET device_id = $1 WHERE token = $2";
			$result = pg_query_params($conn, $sql, array($devID, $newToken));
			if (!$result) {
				$output['msg'] = "更新失敗\n$sql\n";
				exit;
			}
		} else {
			// 新規登録
			$sql = "INSERT INTO $table(device_id, token, valid_flg) VALUES ($1, $2, 1)";
			$result = pg_query_params($conn, $sql, array($devID, $newToken));
			if (!$result) {
				$output['msg'] = "登録失敗\n$sql\n";
				exit;
			}
		}
	}
} else {
	//----------
	// 更新
	//----------
	// 更新処理
	$sql = "UPDATE $table SET device_id = $1, token = $2 WHERE token = $3";
	$result = pg_query_params($conn, $sql, array($devID, $newToken, $preToken));
	if (!$result) {
		$output['msg'] = "更新失敗\n$sql\n";
		exit;
	}
}

// 登録端末の通知設定情報を返す
$sql = "SELECT valid_flg FROM $table WHERE token = $1";
$result = pg_query_params($conn, $sql, array($newToken));
if (!$result) {
	$output['msg'] = "情報取得エラー\n$sql\n";
	exit;
}
// 実行結果を連想配列で取得
while($row = pg_fetch_assoc($result)){
	$data[] = $row;
}
//echo "<pre>"; print_r($data); echo "</pre>";

$output['valid_flg'] = $data[0]['valid_flg'];
//echo "<pre>"; print_r($output); echo "</pre>";

// JSON形式に変換
$outdat = json_encode($output);

header("Access-Control-Allow-Origin:*");
header('Content-type: application/json');
print $outdat;

?>