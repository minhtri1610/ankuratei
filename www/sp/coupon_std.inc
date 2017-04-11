<?php
require_once("db.inc");
require_once("date.inc");
require_once("error.inc");
require_once("coupon.inc");
require_once("mobile.inc");
require_once("mode.php");

$cookielimit = time() + 730*86400;//cookie 有効期限2年とする。

/*---------- 標準DBへの接続 ----------*/
/*if($mode ==1){
	define("ROOT_URL", "http://dbsv.anrakutei.co.jp/sp");	// ルートURL
	$con= connectdb("pgsql", "10.1.10.42", "coupon", "postgres", "postgres");
	$con_honpo= connectdb("pgsql", "10.1.10.42", "coupon_honpo", "postgres", "postgres");
	define("COOKIEDOMAIN","dbsv.anrakutei.co.jp"); //クッキー用ドメイン
	define("COOKIEPATH","/sp/");
}else{
	define("ROOT_URL", "http://k.anrakutei.jp/sp");	// ルートURL
	$con= connectdb("pgsql", "10.1.13.2", "coupon", "coupon", "coupon");
	//$con= connectdb("pgsql", "10.1.13.2", "coupon", "coupon", "coupon");
	$con_honpo= connectdb("pgsql", "10.1.13.2", "coupon_honpo", "coupon", "coupon");
	//$con_honpo= connectdb("pgsql", "10.1.13.2", "coupon_honpo", "coupon", "coupon");
	define("COOKIEDOMAIN","k.anrakutei.jp"); //クッキー用ドメイン
	define("COOKIEPATH","/sp/");
}*/
//local host --tri--
	define("ROOT_URL", "http://cordova.dev/");	// ルートURL
	$con= connectdb("pgsql", "127.0.0.1", "new", "postgres","123");
	//$con= connectdb("pgsql", "10.1.13.2", "coupon", "coupon", "coupon");
	$con_honpo= connectdb("pgsql", "127.0.0.1", "new", "postgres","123");
	//$con_honpo= connectdb("pgsql", "10.1.13.2", "coupon_honpo", "coupon", "coupon");
	define("COOKIEDOMAIN","http://cordova.dev/"); //クッキー用ドメイン
	define("COOKIEPATH","/sp/");

//ユーザID、セッションID名
$uidname = "ia";
$sesname = "sa";

/*---------- 定数定義 ----------*/
define("DEBUG_MODE", 0);								// デバッグモード(1:有効)
define("ERROR_DIR", "err");								// エラーページのディレクトリ(ROOT_URLからの相対参照)
define("IMAGE_DIR", "img");								// 画像ファイルのディレクトリ(ROOT_URLからの相対参照)
define("TEXT_DIR",	"txt");								// 各ページの文言ファイルディレクトリ(ROOT_URLからの相対参照)
define("PAGE_EZWEB", "page_ezweb");						// Ezweb用HTML出力ファイル格納ディレクトリ(ROOT_URLからの相対参照)
define("PAGE_IMODE", "page_imode");						// Imode用HTML出力ファイル格納ディレクトリ(ROOT_URLからの相対参照)
define("PAGE_SOFTBANK", "page_softbank");				// softbank用HTML出力ファイル格納ディレクトリ(ROOT_URL


/*---------- 変数定義 ----------*/
$FirstConnect= FALSE;	// 初回表示フラグ( TRUE= 初回 ) 直リンクなどの判別に使用

// 定数のままでは使いにくいので変数に格納しておく
$rooturl= removeslashes(ROOT_URL);
$errdir= removeslashes(ERROR_DIR);
$imgdir= removeslashes(IMAGE_DIR);
$txtdir= removeslashes(TEXT_DIR);
$page_ez= removeslashes(PAGE_EZWEB);
$page_im= removeslashes(PAGE_IMODE);
$page_sb= removeslashes(PAGE_SOFTBANK);

function removeslashes($dir) {	// 最初と最後のスラッシュを除去する
	return preg_replace("/\/$/", "", preg_replace("/^\//", "", $dir));
}

/*---------- 携帯の情報を取得する ----------*/
$minfo= getmobileinfo();

// 携帯以外のアクセスはDoCoMoとして出力を行う
if($minfo['provider']== "unknown")	$minfo['provider']= "docomo";

// 画像出力の拡張子が定義できない場合はpngとする
if(strlen($minfo['picttype'][0])== 0)	$picttype= "png";
else									$picttype= $minfo['picttype'][0];

/*---------- ユーザ情報を取得しない場合はここで終了 ----------*/
if(NO_USERINFO)	return;


/*---------- ユーザの検出とセッションの取得 ----------*/
$user= array();

// session_idが渡されている場合
if(strlen($_REQUEST[$sesname])> 0 && is_numeric($_REQUEST[$sesname])) {
	$sql= "select * from t_customer where session_id= ?";
	$res= $con->getall($sql,Array($_REQUEST[$sesname]), DB_FETCHMODE_ASSOC);
	dberrexit($con, $res, "<html>", __FILE__, __LINE__);
	
	// セッションIDが重複しているか、存在しない
	if(count($res)!= 1) {
		$sql= "update t_customer set session_id= NULL where session_id= ?";
		dberrexit($con, $con->query($sql,array($_REQUEST[$sesname])), "<html>", __FILE__, __LINE__);
		// セッションが渡されているのにセッションが存在しない場合はエラー出力
		setcookie($uidname,"",time() - 3600,"/");
		setcookie($sesname,"",time() - 3600,"/");
		header("Location: $rooturl/$errdir/misssession.php");
	}
	
	$val= $res[0];
	
	// セッション切れ
	if(ymd2date($val['session_limit'])< time())	{
		// セッション切れはなぞポンクリア。
		//header("Location: $rooturl/$errdir/lostsession.php");
		//$user['session_id']= makesessionid($con);
		//$user['session_limit']= date('Y/m/d H:i:s', dateadd("h", 3, time()));
		sessionreset($con,$_REQUEST[$sesname]);
	}
	
	$user= $val;
}
elseif(strlen($_REQUEST[$sesname])> 0) {	// ユーザIDが渡されていた場合
	$sql= "select * from t_customer where id= {$_REQUEST[$sesname]}";
	$res= $con->getrow($sql, DB_FETCHMODE_ASSOC);
	dberrexit($con, $res, "", __FILE__, __LINE__);
	
	// ユーザが存在していなければ
	if(count($res)== 0) {
		setcookie($uidname,"");
		setcookie($sesname,"");
		// ユーザIDを渡されたのに、ユーザが存在していないのでエラー出力
		header("Location: $rooturl/$errdir/nouser.php");
	}
	elseif(ymd2date($res['session_limit'])< time()) {	// セッション切れはなぞポンクリア。
		sessionreset($con,$user['session_id']);
		$user= $res;	// セッション継続
	}else{
		$user= $res;
	}
}
elseif(strlen($_REQUEST[$uidname])> 0) {	// ユーザIDが渡されていた場合
	$stat =  "req2";
	//$sql= "select * from t_customer where id= {$_REQUEST[$uidname]}";
	//$res= $con->getrow($sql, DB_FETCHMODE_ASSOC);
	$sql= "select * from t_customer where id= ?";
	$res= $con->getrow($sql,Array($_REQUEST[$uidname]), DB_FETCHMODE_ASSOC);
	dberrexit($con, $res, "", __FILE__, __LINE__);
	
	// ユーザが存在していなければ
	if(count($res)== 0) {
		setcookie($uidname,"",time() - 3600,"/");
		setcookie($sesname,"",time() - 3600,"/");
		// ユーザIDを渡されたのに、ユーザが存在していないのでエラー出力
		header("Location: $rooturl/$errdir/nouser.php");
	}
	elseif(ymd2date($res['session_limit'])< time()) {	// セッションが切れていればセッションを再生成
		sessionreset($con,$res['session_id']);
	}
	$user= $res;	// セッション継続
}
else if(strlen($minfo['serial'])> 0){
	// PrefixCodeからユーザを検出
	$sql= "select * from t_customer where prefixcode= ?";
	$res= $con->getrow($sql,Array($minfo['serial']), DB_FETCHMODE_ASSOC);
	dberrexit($con, $res, "", __FILE__, __LINE__);
	$stat =  "minfo";
	if(count($res)== 0) {	// ユーザが存在しない
		$FirstConnect= TRUE;
		$user['id']= $con->nextid("mcd");
		$user['session_id']= makesessionid($con);
	}
	elseif(ymd2date($res['session_limit'])< time()) {	// セッションが切れているのでセッションを再生成
		sessionreset($con,$res['session_id']);
		$user= $res;	// セッション継続
	}
	else {
		$user= $res;	// セッション継続
	}
}else if(strlen($_COOKIE[$uidname])> 0) {
	$sql= "select * from t_customer where id= ? and session_id = ?";
	$res= $con->getrow($sql,array($_COOKIE[$uidname],$_COOKIE[$sesname]) ,DB_FETCHMODE_ASSOC);
	dberrexit($con, $res, "", __FILE__, __LINE__);
	$stat =  "cookie";
	// ユーザが存在していなければ
	if(count($res)== 0) {
		// ユーザIDを渡されたのに、ユーザが存在していないのでcookie削除＆エラー出力
		setcookie($uidname,"",time() - 3600,"/");
		setcookie($sesname,"",time() - 3600,"/");

		header("Location: $rooturl/$errdir/nouser.php");
	}
	elseif(ymd2date($res['session_limit'])< time()) {	// セッションが切れていればなぞポンクリア
		sessionreset($con,$res['session_id']);
	}
	$user=$res;
	$user['id']=$_COOKIE[$uidname];
	$user['session_id']=$_COOKIE[$sesname];
}else {
	$stat =  "none";
	// ユーザを特定できないので、不特定として生成
	$FirstConnect= TRUE;
	$user['id']= $con->nextid("mcd");
	$user['session_id']= makesessionid($con);
	//$user['session_limit']= date('Y/m/d H:i:s', dateadd("h", 3, time()));
	$user['session_limit']= date('Y/m/d', dateadd("h", 14, time())) . " 07:00:00";
}
setcookie($uidname,$user['id'],$cookielimit,"/");
setcookie($sesname,$user['session_id'],$cookielimit,"/");


//echo "$uidname,{$user['session_id']},$cookielimit";

if($FirstConnect)	initializesession($con, $user, $minfo);

// SJIS変換用関数
function sjis($text, $default_encode= "utf8") {
	return mb_convert_encoding($text, "sjis", $default_encode);
}

function ismobile() {
	if(strlen($_SERVER['HTTP_X_UP_SUBNO'])> 0)	return TRUE;
	
	return TRUE;
}

?>
