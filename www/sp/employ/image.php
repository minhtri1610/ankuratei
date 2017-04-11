<?
/***************************************************************
*   image.php
*   ファイルダウンロード
*   fno   ファイルＮＯ
***************************************************************/
require_once('../../common.inc');

$conn = pg_connect("host=".DB_HOST. " dbname=".DB_NAME." user=".DB_USER." password=".DB_PASS);
if($conn == false){
	exit;
}

$prev	= $_REQUEST["prev"];
$cd		= $_REQUEST["cd"];
$no		= $_REQUEST["no"];
$sp		= $_REQUEST["sp"];

$table = ($sp==1) ? "先輩画像情報" : "画像情報";
$table = (($prev==1) ? "Ｗ" : "") . $table;

// 検索
$sql=<<<END
select
	ファイル名		as filenm,
	データ			as file,
	ＭＩＭＥ		as mime
from
	employ.$table
where
	職種ＩＤ = $cd and 媒体ＩＤ = $no
END;
$result = pg_query($conn, $sql);

if($row = pg_fetch_array($result)){
	
	$filenm = $row['filenm'];
	
	// mime が取得出来ていれば利用
	if($row['mime']!=''){
		header("Content-type: " . $row['mime']);
	}
	// できていなければ拡張子で判断
	else{
		if (preg_match("/jpg$/i", $row['filenm']) || preg_match("/jpeg$/i", $row['filenm'])){
			header("Content-type: image/jpeg");
		}
		elseif(preg_match("/gif$/i", $row['filenm'])){
			header("Content-type: image/gif");
		}
		elseif(preg_match("/png$/i", $row['filenm'])){
			header("Content-type: image/png");
		}
		else{
			header("Content-type: image/jpeg");
		}
	}
	header("Content-Disposition: inline; filename={$filenm}\n\n"); // 保存時ファイル名
	
	// アンエスケープして出力
	echo pg_unescape_bytea($row['file']);
}
?>
