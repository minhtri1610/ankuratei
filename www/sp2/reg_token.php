<?php

mb_language("ja") ;
mb_internal_encoding('UTF-8');

define ("DB_HOST" , "10.90.1.18");
define ("DB_NAME" , "coupon");
define ("DB_USER" , "coupon");
define ("DB_PASS" , "coupon");

// 返却値
$output = array('msg'=>"OK", 'valid_flg'=>1);

// DB接続
$conn = pg_connect("host=".DB_HOST." dbname=".DB_NAME." user=".DB_USER." password=".DB_PASS);
if($conn == false) {
	$output['msg'] = "DB接続エラー";
	exit;
}

// 要求パラメータ取得
$devID = $_POST['devID'];	// 端末ID（UUID）
$preID = $_POST['preID'];	// 以前のレジストレーションID
$newID = $_POST['newID'];	// 新しいレジストレーションID
if ($newID == "") {
	$output['msg'] = "パラメータ異常";
	exit;
}

// レジストレーションIDの登録処理
if ( $preID == "" ) {
	//----------
	// 新規登録
	//----------
	// 登録済みチェック
	$sql = "SELECT * FROM devtokens_gcm WHERE device_id = $1";
	$result = pg_query_params($conn, $sql, array($devID));
	if (!$result) {
		$output['msg'] = "情報取得エラー\n$sql\n";
		exit;
	}
	$rows = pg_num_rows($result);
	// 登録済みの場合は、新しいレジストレーションIDに更新
	if ($rows > 0) {
		// 更新処理
		$sql = "UPDATE devtokens_gcm SET token = $1 WHERE device_id = $2";
		$result = pg_query_params($conn, $sql, array($newID, $devID));
		if (!$result) {
			$output['msg'] = "更新失敗\n$sql\n";
			exit;
		}
	} else {
		// 登録処理
		$sql = "INSERT INTO devtokens_gcm(device_id, token, valid_flg) VALUES ($1, $2, 1)";
		$result = pg_query_params($conn, $sql, array($devID, $newID));
		if (!$result) {
			$output['msg'] = "登録失敗\n$sql\n";
			exit;
		}
	}
} else {
	//----------
	// 更新
	//----------
	// 更新処理
	$sql = "UPDATE devtokens_gcm SET token = $1 WHERE device_id = $2";
	$result = pg_query_params($conn, $sql, array($newID, $devID));
	if (!$result) {
		$output['msg'] = "更新失敗\n$sql\n";
		exit;
	}
}

// 登録端末の通知設定情報を返す
$sql = "SELECT valid_flg FROM devtokens_gcm WHERE device_id = $1";
$result = pg_query_params($conn, $sql, array($devID));
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