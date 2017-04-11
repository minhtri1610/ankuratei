<?php
define("NO_USERINFO", FALSE);
mb_internal_encoding('UTF-8');
		require_once("Services/JSON.php");
$json = new Services_JSON();

//バージョン枝番　緊急更新時にはこの変数を変更
$version = "01";

// 営業日をデフォルト値「20160101」に変更
$strDATE = "20160101";

//バージョンを記述
$fullversion = "{$strDATE}-{$version}";

$cpnlist[] = Array(
	"version" => $fullversion
	);

$outdat = $json->encode($cpnlist);

print $outdat;
?>