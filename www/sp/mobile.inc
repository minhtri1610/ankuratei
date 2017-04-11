<?php

function getmobileinfo() {

	
	$server= $_SERVER;
	if(dirname(__FILE__)== "/usr/local/www/test/inc") {
		// テスト環境の場合、サーバ情報の変更ができる。
	}
	
	$ua= $server['HTTP_USER_AGENT'];
	$ret= array();
	
	if(preg_match("/^DoCoMo/", $ua)) {
		$ret['provider']= "docomo";
		$match= array(); if(preg_match("/(ser[0-9]+)/", $ua, $match))	$ret['serial']= $match[1];	// シリアルの取得
		
		$ret= array_merge($ret, get_mobileinfo_sub_docomo($ua));
	}
	elseif(preg_match("/^Softbank/", $ua) || preg_match("/^Semulator/", $ua)) {
		$ret['provider']= "softbank";
		$ret= array_merge($ret, get_mobileinfo_sub_softbank($ua, $server));
	}
	elseif(preg_match("/^Vodafone/", $ua)) {
		$ret['provider']= "softbank";
		$ret= array_merge($ret, get_mobileinfo_sub_vodafone($ua, $server));
	}
	elseif(preg_match("/^J\-PHONE/", $ua)) {
		$ret['provider']= "softbank";
		$ret= array_merge($ret, get_mobileinfo_sub_jphone($ua, $server));
	}
	elseif(preg_match("/^KDDI/", $ua) || preg_match("/UP.Browser/", $ua)) {
		$ret['provider']= "au";
		if(strlen($server['HTTP_X_UP_SUBNO'])> 0)	$ret['serial']= $server['HTTP_X_UP_SUBNO'];
		
		$ret= array_merge($ret, get_mobileinfo_sub_au($ua, $server));
	}
	else {
		$ret['provider']= "unknown";
	}
	
	return $ret;
}

function get_mobileinfo_sub_au($ua, $server) {
	$ret= array();
	$ret['modelname']= $ret['browser']= "unknown";
	$ret['char_width']= 8;
	$ret['char_height']= 6;
	$ret['buffersize']= 7.5;
	
	// シリアル (取得済み)
	
	// ブラウザタイプと機種名
	if(preg_match("/^KDDI\-/", $ua)) {
		$ret['browser']= "auwap2.0";
		$ret['picttype']= array("gif", "jpeg", "png", "bmp");
		$ret['pages']= "wap2";
		$match= array(); if(preg_match("/^KDDI-([a-zA-Z0-9]+)/", $ua, $match))	$ret['modelname']= $match[1];
	}
	else {
		$ret['browser']= "hdml";
		$ret['picttype'][]= "png";
		$ret['pages']= "auhdml";
		$match= array(); if(preg_match("/^UP.Browser\/[a-zA-Z0-9.]+-([a-zA-Z0-9]+)/", $ua, $match))	$ret['modelname']= $match[1];
	}
	// 表示桁数
	if(strlen($server['HTTP_X_UP_DEVCAP_SCREENCHARS'])> 0) {
		list($ret['char_width'], $ret['char_height'])= split(",", $server['HTTP_X_UP_DEVCAP_SCREENCHARS']);
	}
	// 画像表示可能
	$ret['ispicture']= (preg_match("/(bmp|png|jpeg|gif)/", $ua));
	
	return $ret;
}
function get_mobileinfo_sub_softbank($ua, $server) {
	
	$ret['modelname']= $ret['browser']= "unknown";
	// バッファサイズ
	$ret['buffersize']= 6;
	// 画像表示（不明なため）
	$ret['ispicture']= TRUE;
	$ret['picttype'][]= "png";
	// 表示桁数
	$match= array(); if(preg_match("/([0-9]+)\*([0-9]+)/", $server['x-jphone-display'], $match)) {
		$ret['char_width']= $match[1];
		$ret['char_height']= $match[2];
	}
	// 機種名
	$match= array(); if(preg_match("/^SoftBank\/[0-9.]+\/([A-Z0-9]+)\//", $ua, $match))	$ret['modelname']= $match[1];
	// シリアル
	$match= array(); if(preg_match("/(SN[0-9]+)/", $ua, $match))	$ret['serial']= $match[1];
	// ページファイルディレクトリ
	$ret['pages']= "softbank1";
	
	return $ret;
}
function get_mobileinfo_sub_vodafone($ua, $server) {
	// バッファサイズ
	$ret['buffersize']= 6;
	// 画像表示（不明なため）
	$ret['ispicture']= TRUE;
	$ret['picttype'][]= "png";
	// 表示桁数
	$match= array(); if(@preg_match("/([0-9]+)\*[[0-9]+)/", $server['x-jphone-display'])) {
		$ret['char_width']= $match[1];
		$ret['char_height']= $match[2];
	}
	// 機種名
	$match= array(); if(preg_match("/^Vodafone\/[0-9.]+\/([A-Z0-9]+)\//", $ua, $match))	$ret['modelname']= $match[1];
	// シリアル
	$match= array(); if(preg_match("/(SN[0-9]+)/", $ua, $match))	$ret['serial']= $match[1];
	// ページファイルディレクトリ
	$ret['pages']= "vodafone1";
	
	return $ret;
}
function get_mobileinfo_sub_jphone($ua, $server) {
	
	// バッファサイズ
	$ret['buffersize']= 6;
	
	// 画像表示（不明なため）
	$ret['ispicture']= TRUE;
	$ret['picttype'][]= "png";

	// 表示桁数
	$match= array(); if(preg_match("/([0-9]+)\*([0-9]+)/", $server['x-jphone-display'])) {
		$ret['char_width']= $match[1];
		$ret['char_height']= $match[2];
	}
	
	// 機種名
	$match= array(); if(preg_match("/^J\-PHONE\/[0-9.]+\/([a-zA-Z0-9-])\//", $ua, $match))	$ret['modelname']= $match[1];
	
	// シリアル
	$match= array(); if(preg_match("/(SN[A-Z0-9]+)/", $ua, $match))	$ret['serial']= $match[1];
	
	return $ret;
}
function get_mobileinfo_sub_docomo($ua) {
	
//	print($ua);
	
	$ret= array();
	$ret['modelname']= $ret['browser']= "unknown";	// 初期値設定
	$ret['char_width']= 8;	// 最小サイズ
	$ret['char_height']= 6;	// 最小サイズ
	$ret['buffersize']= 5;	// 最小サイズ
	$ret['picttype'][]= "gif";	// 共有して有効なもの
	$ret['pages']= "docomo1";
	
	// シリアル
	$match= array(); if(preg_match("/(ser[A-Z0-9]+)($|;|\)| )/", $ua, $match[1]))	$ret['serial']= $match[1][0];
	
//	print_r($match);
	
	// ブラウザバージョン
	if(preg_match("/([A-Z]+903i|[A-Z]+703i|[A-Z]904i|[A-Z]704i|F883iES)/", $ua)) {
		$ret['browser']= "f7.0";
		$ret['picttype'][]= "jpeg";
	}
	elseif(preg_match("/([A-Z]+900i|F880iES|[A-Z]+901i|[A-Z]+700i|(SH|P)851i)/", $ua)) {
		$ret['browser']= "f5.0";
		$ret['picttype'][]= "jpeg";
	}
	elseif(preg_match("/(F881iES|[A-Z]+701i|SA800i|(L|N)600i|L601i|M702i|L602i)/", $ua)) {
		$ret['browser']= "f5.0";
		$ret['picttype'][]= "jpeg";
	}
	elseif(preg_match("/([A-Z]+902i|[A-Z]+702i|D851iWM|F882iES|N601i|D800iDS|P703imyu|F883i|P704imyu)/", $ua)) {
		$ret['browser']= "f6.0";	// 似た名前を使っているので順序を変更している
		$ret['picttype'][]= "jpeg";
	}
	elseif(preg_match("/([A-Z]+505i|[A-Z]+252i|[A-Z]+506i|[A-Z]+253i|P213i)/", $ua)) {
		$ret['browser']= "5.0";
		$ret['picttype'][]= "jpeg";
	}
	elseif(preg_match("/((F|N)2051|(P|F|N)2102V|N2701|NM850iG)/", $ua)) {
		$ret['browser']= "f4.0";
		$ret['picttype'][]= "jpeg";
	}
	elseif(preg_match("/([A-Z]+504i|[A-Z]+251i|F671iS|(F|SO)212i|F661i|F672i|SO213i)/", $ua)) {
		$ret['browser']= "4.0";
		$ret['picttype'][]= "jpeg";
	}
	elseif(preg_match("/(N2001|N2002|P2002|(D|P|SH|T)2101V)/", $ua)) {
		$ret['browser']= "f3.0";
	}
	elseif(preg_match("/([A-Z]+210i|[A-Z]+503i|[A-Z]+211i|SH251i|R692i)/", $ua)) {
		$ret['browser']= "3.0";
	}
	
	// 機種名
	$match= array(); if(preg_match("/^DoCoMo\/(?:1.0|2.0)(?:\/| )([A-Z]+[0-9]+[a-zA-Z]+)/", $ua, $match))	$ret['modelname']= $match[1];
	
	// 文字数の取得
	$match= array();
	if(preg_match("/W([0-9]+)H([0-9]+)/", $ua, $match)) {
		$ret['char_width']= $match[1];
		$ret['char_height']= $match[2];
	}
	
	// 画像表示可能
	$ret['ispicture']= (strpos("/TB/", $ua)!= FALSE);
	
	// キャッシュ容量
	$match= array();
	if(preg_match("/c([0-9]+)/", $ua, $match))	$ret['buffersize']= $match[1];
	
	return $ret;
}

?>