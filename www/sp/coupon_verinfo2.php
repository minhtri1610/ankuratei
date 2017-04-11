<?php
define("NO_USERINFO", FALSE);
mb_internal_encoding('UTF-8');
		require_once("Services/JSON.php");
$json = new Services_JSON();

	//バージョン枝番　緊急更新時にはこの変数を変更
	$version = "05";

	// 営業日を取得
	if( date( "H:i:s" ) >= "00:00:00" && date( "H:i:s" ) < "07:00:00" ){
		$strDATE = date( "Ymd", strtotime( "-1 day" ) );
	}
	else{
		$strDATE = date( "Ymd" );
	}

//バージョンを記述
$fullversion = "{$strDATE}-{$version}";



$cpnlist[] = Array(
	"version" => $fullversion
	);

$outdat = $json->encode($cpnlist);

print $outdat;
?>
