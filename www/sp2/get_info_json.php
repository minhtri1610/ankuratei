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

// 営業日
$eigyobi = date('Y-m-d', strtotime("-6 hour"));

// データ取得
$sql=<<<END
SELECT
	id,
	update_date,
	info_type,
	post_start,
	post_end,
	disp_type,
	comment_title,
	SUBSTR(comment_body, 1, 30) || '...' AS short_comment,
	comment_body,
	image,
	coupon_link,
	coupon_link_title,
	img_link,
	img_link_url
FROM
	m_info
WHERE
	reg_type = 0 AND
	post_start <= '$eigyobi' AND
	post_end >= '$eigyobi' AND
	approval_status = 2 AND
	delete_flg = 0
ORDER BY
	post_start DESC,
	id DESC
END;

// クエリ実行
$result = pg_query($conn, $sql);

// 実行結果を連想配列で取得
while($row = pg_fetch_assoc($result)){
	$row["continue_title"] = "つづきを見る";		// DB項目以外の値を設定する場合
	$data[] = $row;
}
//echo "<pre>"; print_r($data); echo "</pre>";

// JSON形式に変換
$outdat = json_encode($data);

header("Access-Control-Allow-Origin:*");
header('Content-type: application/json');
print $outdat;

?>
