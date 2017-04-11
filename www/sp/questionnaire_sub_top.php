<?php
define("NO_USERINFO", FALSE);
	session_start();
require_once("Mail.php");

require_once("coupon_std.inc");
//require_once("$txtdir/questionnaire_submit.inc");

//if($FirstConnect)	header("Location: $rooturl/");

// 登録作業
if($user['session_id']== 0)	header("Location: $rooturl/");
$req= $_POST;
$tenpoAry = Array();
$sent = 0;
foreach($req as $name=>$val){
	if(preg_match('/^favtenpo/',$name)){
		if(!is_numeric($val))continue;
		if($val > 9999)continue;
		$tenpoAry[] = pg_escape_string($val);
	}
}

$route = $req['rt'];
if(strlen(trim($route)) == 0 || !is_numeric($route))$route = 0;

$sql = "insert into t_enq_log(id,registtime,seq,route) values(?,current_timestamp,1,?)";
dberrexit($con, $con->query($sql,Array($user['id'],$route)), "<html>", __FILE__, __LINE__);


$data= array();

$data['mailaddr']= $_POST['mailaddr'];
$data['mailaddr']= str_replace("\n", "", $data['mailaddr']);
$data['mailaddr']= str_replace("\r", "", $data['mailaddr']);
if(preg_match("/[^0-9a-zA-Z@_\.-]/", $data['mailaddr']))	$data['mailaddr']= "";

if(is_numeric($_POST['nenrei']) && $_POST['nenrei']> 0)		$data['nenrei']= intval(date('Y', time()))- intval($_POST['nenrei']);
else																$data['nenrei']= "NULL";
if(is_numeric($_POST['seibetsu']) && $_POST['seibetsu']> 0)	$data['seibetsu']= intval($_POST['seibetsu']);
else																$data['seibetsu']= 1;
if(is_numeric($_POST['doukyo']) && $_POST['doukyo']> 0)		$data['doukyo']= intval($_POST['doukyo']);
else																$data['doukyo']= "NULL";
// 郵便番号
if(strlen($_REQUEST['yubin1'])== 0 || !is_numeric($_REQUEST['yubin1']) || strlen($_REQUEST['yubin1'])> 5) {
	$yubin1= "";
}
else	$yubin1= $_REQUEST['yubin1'];
if(strlen($_REQUEST['yubin2'])== 0 || !is_numeric($_REQUEST['yubin2']) || strlen($_REQUESST['yubin2'])> 5) {
	$yubin2= "";
}
else	$yubin2= $_REQUEST['yubin2'];
$data['yubin']= $yubin1. "-". $yubin2;
//if(strlen($_POST['mailaddr'])> 0)								$data['mailaddr']= "'". pg_escape_string(trim($data['mailaddr'])). "'";
//$data['mailaddr']= "'". $data['mailaddr']. "'";
	$mailaddr = $data['mailaddr'];
	$data['mailaddr']= $data['mailaddr'];

	$data['question9'] = implode(",",$tenpoAry);

	//$data['mailaddr']= str_replace("\n", "", $data['mailaddr']);
	//$data['mailaddr']= str_replace("\r", "", $data['mailaddr']);
if($_POST['anraku']=="on"){
	$regd = registml($con,$data,$user,$route);
}
if($_POST['honpo']=="on"){
	$sesbuf = $user['session_id'];
	$user['session_id'] = makesessionid($con_honpo);
	initializesession($con_honpo, $user, $minfo,1);
	$user['session_id'] = $sesbuf;
	$regd = $regd + registml($con_honpo,$data,$user,$route);
	//if($regd == 1)exit();
}
/*
*/


if(preg_match("/([a-zA-Z0-9_.￥-]+@[a-zA-Z0-9_.￥-]+)/", $mailaddr, $match)){
	
	$sql = "select * from t_sent_addr where mailaddr = ?";
//	$sql = "select * from t_sent_addr where mailaddr = '$mailaddr' and  senttime > (current_timestamp + '-1 day')";
	$res = $con->query($sql,Array($mailaddr));
	if(DB::isError($res)){
		die($res->getMessage());
	}
	if($res->numRows()>0){
		$sent = 1;
	}else{
		$sql = "insert into t_sent_addr(mailaddr,senttime) values(?,current_timestamp)";
		$res = $con->query($sql,Array($mailaddr));
		if(DB::isError($res)){
			die($res->getMessage());
		}
	}/**/
	echo " ";
	$params = array(
	//  "host" => "10.90.1.18",
	//  "host" => "10.1.13.2",
	  "host" => "10.1.10.9",
	//  "port" => 587,
	  "port" => 25//,
	//  "auth" => true,
	//  "username" => "anis",
	//  "password" => "sc0tt1e"
	);



	$mailObject = Mail::factory("smtp", $params);



	$title= mb_convert_encoding("安楽亭携帯サイト 登録完了", "ISO-2022-JP", "UTF-8");
	//$title= "安楽亭携帯サイト 登録完了";

	$body= <<<END
この度は、安楽亭 携帯サイトのご利用ありがとうございます。
安楽亭メルマガ会員へのご登録が完了致しました。
今後、安楽亭の最新フェア情報やお得なクーポン情報等がメールでお知らせされます。

★ワクワク・ドキドキ★
【おいしい商品】が100％当たる【抽選URL】はこちら！

当選された商品の引換え期限は、【ご登録日から１週間】となります。予めご了承ください。

http://k.anrakutei.jp/coupon/201303/?qid={$user['id']}

↑クリックすると抽選結果が表示されます。

お得な情報満載の安楽亭モバイルサイトはこちら
http://anrakutei.jp/

もし、このメールに覚えが無い場合、メール配信の停止をご希望の場合は、大変お手数ですが、下記URLよりメール配信停止登録をして頂きますようお願い致します。
http://k.anrakutei.jp/coupon_next/unsub_start.php

※このメールに返信することは出来ません

- 安楽亭 -
END;
	$body = mb_convert_encoding($body, "ISO-2022-JP", "UTF-8");

	$mary = Array($mailaddr);
	$from=$to="information@anrakutei.jp";

	$recipients = $mailaddr;
	$headers = array(
	  "To" => "$mailaddr",
	  "From" => "information@anrakutei.jp",
	  "Subject" => mb_encode_mimeheader($title,"ISO-2022-JP")
	);

	//if($regd ==0)$mailObject -> send($recipients, $headers, $body);
	if($sent == 0)$mailObject -> send($recipients, $headers, $body);
}

function registml($con,$data,$user,$route){
	//メールアドレス登録済みかどうかを確認
	$id = 0;
	$sql = "select id,mailaddr from t_customer where session_id=?";
	$res = $con->query($sql,Array($user['session_id']));

	if($res->numRows()>0){
		$rows = $res->fetchRow(DB_FETCHMODE_ASSOC);
		$mail_db = $rows['mailaddr'];
		$id = $rows['id'];
	}
	$regdflg =0;
	
	//pc等個体識別不能なところからの登録もないならば、新規登録としてログDBに書き込み
	if(strlen($data['mailaddr'])>0){
		//同一IDで登録形跡ある場合アドレス変更でユーザは同一と考え無視
		$sql = "select * from t_mlentry where id='$id'";
		//echo $sql;
		$res = $con->query($sql);
		//echo $res->numRows();
		if($res->numRows()==0){
			$sql = "select id,mailaddr from t_customer where mailaddr=?";
			$res = $con->query($sql,Array($data['mailaddr']));
			if($res->numRows()==0 && $mail_db != $data['mailaddr']){
				$sql = "insert into t_mlentry(id,registtime,route) values('$id',current_timestamp,'$route')";
				dberrexit($con, $con->query($sql), "<html>", __FILE__, __LINE__);
			}else{
				
				$regdflg = 1;
			}
		}else{
			$sql = "select id,mailaddr from t_customer where mailaddr=?";
			$res = $con->query($sql,Array($data['mailaddr']));
			if($res->numRows()>0)$regdflg = 1;
		}
	}
	$preAry = Array();
	foreach($data as $key=> $val) {
		$ndata[]= "$key=?";
		$preAry[] = $val;
	}
	$preAry[] = $user['session_id'];
	$sql= "update t_customer set ". join(",", $ndata). " , deletetime = '2999-12-31',createtime=current_timestamp where session_id=?";
	//print($sql);
	dberrexit($con, $con->query($sql,$preAry), "<html>", __FILE__, __LINE__);
	return $regdflg;
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<meta id="viewport" name="viewport" content="width=320; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;" />
	<title>◆焼肉 安楽亭モバイルサイト</title>
	<link rel="stylesheet" href="css/top2011.css" />
	<link rel="stylesheet" href="css/common.css" />

	<script type="text/javascript" src="js/jquery-1.5.2.min.js"></script>
	<script type="text/javascript" src="js/gears_init.js"></script>
	<script type="text/javascript" src="js/common.js"></script>
	<script type="text/javascript" src="js/top.js"></script>
	<script language="javascript"> 
	<!--//
	var listidx = 3;
//-->
</script>

</head>

<body id='normal' style='background-color:#FFF;'>

<!-- contentsWrap -->
<div id="contentsWrap">


<!-- topPageHeader -->
<header id="topPageHeader" style='color:#666666; background-color: rgb(255,255,255);'>
<h1><a href="index.html"><img src="images/anrakulogo_head.jpg" alt="トップページへ" width="60" height="34"></a>会員登録</h1>
<p class="menuBtn"><a href="javascript:void(0)" onclick="slideUpMenu();">メニュー一覧</a></p>
</header>


<font color="blue">アンケート登録完了</font><br>
<hr size=1 noshade color="blue">
<br>
メールマガジンへのご登録ありがとうございました。<br>

<font color='#ff0080'>新規会員登録の場合は</font>、ご登録のメールアドレスへ【黒毛和牛カルビ】などが当たる<font color="#ff0080">【抽選URL】</font>が送られます。<br>
<br>

※当選された「商品」の引換え期限は、<font color="#ff0080">ご登録日から1週間</font>となります。<br>
<br>

<hr size=1 noshade color="blue">
※既に会員登録済みのアドレスには【抽選URL】は<font color='#ff0080'>送信されません。</font><br>
※以下の店舗ではご利用になれません。<br>
<br>
新浦安店、久喜吉羽店、ふじみ野店、館林北店、コスモス店、ぼたん店<br>
<br>
<hr size=1 noshade color="blue">
<br>
<?
//print_r($_POST);
?>
<div align=center><a href="index.html">トップページへ</a><br></div>

</div>
<!-- menu -->
<nav id="menu">
</nav>
<script src="js/menu.js"></script>

</body>
</html>
