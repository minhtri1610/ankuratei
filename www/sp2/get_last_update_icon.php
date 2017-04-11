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

// データ取得
$sql=<<<END
SELECT
	MAX(update_date) as last_update
FROM
	m_info_icon
END;

// クエリ実行
$result = pg_query($conn, $sql);

// 実行結果を連想配列で取得
while($row = pg_fetch_assoc($result)){
	$data[] = $row;
}
//echo "<pre>"; print_r($data); echo "</pre>";

// JSON形式に変換
$outdat = json_encode($data);

header("Access-Control-Allow-Origin:*");
header('Content-type: application/json');
print $outdat;

?>
