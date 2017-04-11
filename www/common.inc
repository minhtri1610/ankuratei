<?php
/**************************************************************
*   common.inc                                                *
*   共通定義                                                  *
***************************************************************/

mb_language("japanese");
mb_http_output("SJIS-win");
mb_http_input ("SJIS-win");
mb_internal_encoding("SJIS-win");
mb_regex_encoding("SJIS-win");

////  デバッグモード ////////////////////////////////
define ("DEBUG" , "1");

//-------------------------------------
// 本番環境
//-------------------------------------
if(DEBUG=='0'){
	// モバイルサイト
	define ("MOBILE_URL", "http://anrakutei.jp/");
	define ("K_MOBILE_URL", "http://k.anrakutei.jp/");
	// ＰＣサイト
	define ("PCSITE_URL", "http://www.anrakutei.co.jp/");
	define ("YOYAKU_URL", "https://www.anrakutei.co.jp/yoyaku/");
	// SSL
	define ("SSL_HONBAN", "https://www.anrakutei.co.jp");
	define ("SSL_MIRROR", "http://10.1.10.143/anrakutei");
	
	// 店舗検索組織
	define ("KAISYACD" , "V001");
	
	// DB名,DBユーザ名,DBパスワード
	define ("DB_TYPE" , "pgsql");
	define ("DB_HOST" , "10.1.10.1");
	define ("DB_NAME" , "anrakutei");
	define ("DB_USER" , "master");
	define ("DB_PASS" , "master");
	
	//-------------------------------------
	// らくとも用
	//-------------------------------------
	// 楽友 DB名,DBユーザ名,DBパスワード
	define ("R_DB_TYPE" , "pgsql");
	define ("R_DB_HOST" , "10.1.13.2");
	define ("R_DB_NAME" , "rakutomo");
	define ("R_DB_USER" , "rakutomo");
	define ("R_DB_PASS" , "rakutomo");
	
	// 個体識別情報を用いたオートログイン 有効なら "ON"
	define ("AUTO_LOGIN" , "ON");
	
	// 暗号化キー
	define ("MCRYPT_KEY" , "i hate anrakun");
	// 暗号化利用ベクトル (適当に長い文字列を用意しておく)
	define ("MCRYPT_IV"  , "anrakuteianrakuteianrakuteianrakuteianrakuteianrakuteianrakutei");
	
	define ("COUPON_COST" , "2");							// クーポン交換消費来店ポイント
	define ("MAX_COUPON" , "5");							// 保持可能な最大クーポン枚数
	define ("BBS_DISP_THREAD" , "10");						// BBSにおける１ページの表示来店数
	define ("TRIM_CHAR", " \t\r\n\0\x0B　");				// trim対象文字（通常のtrim＋全角スペース） 
	
	// メール送信サーバ
	define ("MAIL_HOST" , "10.1.13.2");
	define ("MAIL_PORT" , "25");
	
	// ライブラリへのルートディレクトリからのパス
	define ("LIB_PATH"  , "/lib");
	
	define ("JIMU_MAIL" , "rakutomo@anrakutei.co.jp");		// らくとも事務局
	define ("BCC_MAIL"  , "shimoike@anis.co.jp");			// BCC（DEBUG時のみ有効
	
	define ("MAIL_ALERT_TO"  , "shimoike@anis.co.jp");		// アラートメール宛先
}
//-------------------------------------
// 開発環境
//-------------------------------------
else{
	// モバイルサイト
	define ("MOBILE_URL", "http://k.anrakutei.jp/1129/");
	define ("K_MOBILE_URL", "http://k.anrakutei.jp/1129/");
	// ＰＣサイト
	define ("PCSITE_URL", "http://10.1.10.143/anrakutei/");
	define ("YOYAKU_URL", "http://www.anrakutei.co.jp/yoyaku/29/");	// 携帯からミラーは参照できないため、本サーバにテスト用環境を構築
	// SSL
	define ("SSL_HONBAN", "https://www.anrakutei.co.jp");
	define ("SSL_MIRROR", "http://10.1.10.143/anrakutei");
	
	// 店舗検索組織
	define ("KAISYACD" , "V001");
	
	// マスタ管理 DB名,DBユーザ名,DBパスワード
	define ("DB_TYPE" , "pgsql");
	define ("DB_HOST" , "10.1.10.42");
	define ("DB_NAME" , "anrakutei");
	define ("DB_USER" , "master");
	define ("DB_PASS" , "master");
	
	//-------------------------------------
	// らくとも用
	//-------------------------------------
	// 楽友 DB名,DBユーザ名,DBパスワード
	define ("R_DB_TYPE" , "pgsql");
	define ("R_DB_HOST" , "10.1.13.2");
	define ("R_DB_NAME" , "rakutomo_demo");
	define ("R_DB_USER" , "rakutomo");
	define ("R_DB_PASS" , "rakutomo");
	
	// 個体識別情報を用いたオートログイン 有効なら "ON"
	define ("AUTO_LOGIN" , "ON");
	
	// 暗号化キー
	define ("MCRYPT_KEY" , "i hate anrakun");
	// 暗号化利用ベクトル (適当に長い文字列を用意しておく)
	define ("MCRYPT_IV"  , "anrakuteianrakuteianrakuteianrakuteianrakuteianrakuteianrakutei");
	
	define ("COUPON_COST" , "2");							// クーポン交換消費来店ポイント
	define ("MAX_COUPON" , "5");							// 保持可能な最大クーポン枚数
	define ("BBS_DISP_THREAD" , "10");						// BBSにおける１ページの表示来店数
	define ("TRIM_CHAR", " \t\r\n\0\x0B　");				// trim対象文字（通常のtrim＋全角スペース） 
	
	// メール送信サーバ
	define ("MAIL_HOST" , "10.1.13.2");
	define ("MAIL_PORT" , "25");
	
	// ライブラリへのルートディレクトリからのパス
	define ("LIB_PATH"  , "/29/lib");
	
	define ("JIMU_MAIL" , "rakutomo@anrakutei.co.jp");		// らくとも事務局
	define ("BCC_MAIL"  , "shimoike@anis.co.jp");			// BCC（DEBUG時のみ有効
	
	define ("MAIL_ALERT_TO"  , "shimoike@anis.co.jp");		// アラートメール宛先
}

// 営業日（午前６時前は前日、以降は当日）
if ("06" > date('H')){
	$eigyobi = date('Ymd', strtotime( "-1 day" ));
} else {
	$eigyobi = date('Ymd');
}

set_include_path(get_include_path() . PATH_SEPARATOR . $_SERVER["DOCUMENT_ROOT"] . LIB_PATH);

// らくともアラートメール送信
// $message メール本文（SJISであること)
function alertMail($message){
	
	$headers = array(
		"From" => "rakutomo@anrakutei.jp",
		"To" => MAIL_ALERT_TO,
		"Subject" => mb_encode_mimeheader("らくともエラー"),
		"Mime-Version" => "1.0",
		"Content-Type" => "text/plain; charset=Shift_JIS",
		"Content-Transfer-Encoding" => "base64"
	);
	
	//******************************************************************
	// メール送信
	//******************************************************************
	require_once "Mail.php";
	
	$params = array(
	  'host' => MAIL_HOST,
	  'port' => MAIL_PORT,
	  'auth' => false,
	  'username' => '',
	  'password' => ''
	);
	
	$recipients = array(
		'To'	=> MAIL_ALERT_TO,
		'Bcc'	=> ''
	);
	
	$objMail =& Mail::factory('smtp', $params);
	$result = $objMail->send($recipients, $headers, base64_encode($message));
	if (PEAR::isError($result)) {
		// die($result->getMessage());
		// 送信失敗はスルー
	}
}

?>
