<?php
/**************************************************************
*   common.inc                                                *
*   ���ʒ�`                                                  *
***************************************************************/

mb_language("japanese");
mb_http_output("SJIS-win");
mb_http_input ("SJIS-win");
mb_internal_encoding("SJIS-win");
mb_regex_encoding("SJIS-win");

////  �f�o�b�O���[�h ////////////////////////////////
define ("DEBUG" , "1");

//-------------------------------------
// �{�Ԋ�
//-------------------------------------
if(DEBUG=='0'){
	// ���o�C���T�C�g
	define ("MOBILE_URL", "http://anrakutei.jp/");
	define ("K_MOBILE_URL", "http://k.anrakutei.jp/");
	// �o�b�T�C�g
	define ("PCSITE_URL", "http://www.anrakutei.co.jp/");
	define ("YOYAKU_URL", "https://www.anrakutei.co.jp/yoyaku/");
	// SSL
	define ("SSL_HONBAN", "https://www.anrakutei.co.jp");
	define ("SSL_MIRROR", "http://10.1.10.143/anrakutei");
	
	// �X�܌����g�D
	define ("KAISYACD" , "V001");
	
	// DB��,DB���[�U��,DB�p�X���[�h
	define ("DB_TYPE" , "pgsql");
	define ("DB_HOST" , "10.1.10.1");
	define ("DB_NAME" , "anrakutei");
	define ("DB_USER" , "master");
	define ("DB_PASS" , "master");
	
	//-------------------------------------
	// �炭�Ƃ��p
	//-------------------------------------
	// �y�F DB��,DB���[�U��,DB�p�X���[�h
	define ("R_DB_TYPE" , "pgsql");
	define ("R_DB_HOST" , "10.1.13.2");
	define ("R_DB_NAME" , "rakutomo");
	define ("R_DB_USER" , "rakutomo");
	define ("R_DB_PASS" , "rakutomo");
	
	// �̎��ʏ���p�����I�[�g���O�C�� �L���Ȃ� "ON"
	define ("AUTO_LOGIN" , "ON");
	
	// �Í����L�[
	define ("MCRYPT_KEY" , "i hate anrakun");
	// �Í������p�x�N�g�� (�K���ɒ����������p�ӂ��Ă���)
	define ("MCRYPT_IV"  , "anrakuteianrakuteianrakuteianrakuteianrakuteianrakuteianrakutei");
	
	define ("COUPON_COST" , "2");							// �N�[�|����������X�|�C���g
	define ("MAX_COUPON" , "5");							// �ێ��\�ȍő�N�[�|������
	define ("BBS_DISP_THREAD" , "10");						// BBS�ɂ�����P�y�[�W�̕\�����X��
	define ("TRIM_CHAR", " \t\r\n\0\x0B�@");				// trim�Ώە����i�ʏ��trim�{�S�p�X�y�[�X�j 
	
	// ���[�����M�T�[�o
	define ("MAIL_HOST" , "10.1.13.2");
	define ("MAIL_PORT" , "25");
	
	// ���C�u�����ւ̃��[�g�f�B���N�g������̃p�X
	define ("LIB_PATH"  , "/lib");
	
	define ("JIMU_MAIL" , "rakutomo@anrakutei.co.jp");		// �炭�Ƃ�������
	define ("BCC_MAIL"  , "shimoike@anis.co.jp");			// BCC�iDEBUG���̂ݗL��
	
	define ("MAIL_ALERT_TO"  , "shimoike@anis.co.jp");		// �A���[�g���[������
}
//-------------------------------------
// �J����
//-------------------------------------
else{
	// ���o�C���T�C�g
	define ("MOBILE_URL", "http://k.anrakutei.jp/1129/");
	define ("K_MOBILE_URL", "http://k.anrakutei.jp/1129/");
	// �o�b�T�C�g
	define ("PCSITE_URL", "http://10.1.10.143/anrakutei/");
	define ("YOYAKU_URL", "http://www.anrakutei.co.jp/yoyaku/29/");	// �g�т���~���[�͎Q�Ƃł��Ȃ����߁A�{�T�[�o�Ƀe�X�g�p�����\�z
	// SSL
	define ("SSL_HONBAN", "https://www.anrakutei.co.jp");
	define ("SSL_MIRROR", "http://10.1.10.143/anrakutei");
	
	// �X�܌����g�D
	define ("KAISYACD" , "V001");
	
	// �}�X�^�Ǘ� DB��,DB���[�U��,DB�p�X���[�h
	define ("DB_TYPE" , "pgsql");
	define ("DB_HOST" , "10.1.10.42");
	define ("DB_NAME" , "anrakutei");
	define ("DB_USER" , "master");
	define ("DB_PASS" , "master");
	
	//-------------------------------------
	// �炭�Ƃ��p
	//-------------------------------------
	// �y�F DB��,DB���[�U��,DB�p�X���[�h
	define ("R_DB_TYPE" , "pgsql");
	define ("R_DB_HOST" , "10.1.13.2");
	define ("R_DB_NAME" , "rakutomo_demo");
	define ("R_DB_USER" , "rakutomo");
	define ("R_DB_PASS" , "rakutomo");
	
	// �̎��ʏ���p�����I�[�g���O�C�� �L���Ȃ� "ON"
	define ("AUTO_LOGIN" , "ON");
	
	// �Í����L�[
	define ("MCRYPT_KEY" , "i hate anrakun");
	// �Í������p�x�N�g�� (�K���ɒ����������p�ӂ��Ă���)
	define ("MCRYPT_IV"  , "anrakuteianrakuteianrakuteianrakuteianrakuteianrakuteianrakutei");
	
	define ("COUPON_COST" , "2");							// �N�[�|����������X�|�C���g
	define ("MAX_COUPON" , "5");							// �ێ��\�ȍő�N�[�|������
	define ("BBS_DISP_THREAD" , "10");						// BBS�ɂ�����P�y�[�W�̕\�����X��
	define ("TRIM_CHAR", " \t\r\n\0\x0B�@");				// trim�Ώە����i�ʏ��trim�{�S�p�X�y�[�X�j 
	
	// ���[�����M�T�[�o
	define ("MAIL_HOST" , "10.1.13.2");
	define ("MAIL_PORT" , "25");
	
	// ���C�u�����ւ̃��[�g�f�B���N�g������̃p�X
	define ("LIB_PATH"  , "/29/lib");
	
	define ("JIMU_MAIL" , "rakutomo@anrakutei.co.jp");		// �炭�Ƃ�������
	define ("BCC_MAIL"  , "shimoike@anis.co.jp");			// BCC�iDEBUG���̂ݗL��
	
	define ("MAIL_ALERT_TO"  , "shimoike@anis.co.jp");		// �A���[�g���[������
}

// �c�Ɠ��i�ߑO�U���O�͑O���A�ȍ~�͓����j
if ("06" > date('H')){
	$eigyobi = date('Ymd', strtotime( "-1 day" ));
} else {
	$eigyobi = date('Ymd');
}

set_include_path(get_include_path() . PATH_SEPARATOR . $_SERVER["DOCUMENT_ROOT"] . LIB_PATH);

// �炭�Ƃ��A���[�g���[�����M
// $message ���[���{���iSJIS�ł��邱��)
function alertMail($message){
	
	$headers = array(
		"From" => "rakutomo@anrakutei.jp",
		"To" => MAIL_ALERT_TO,
		"Subject" => mb_encode_mimeheader("�炭�Ƃ��G���["),
		"Mime-Version" => "1.0",
		"Content-Type" => "text/plain; charset=Shift_JIS",
		"Content-Transfer-Encoding" => "base64"
	);
	
	//******************************************************************
	// ���[�����M
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
		// ���M���s�̓X���[
	}
}

?>