<?php
define("NO_USERINFO", FALSE);
	session_start();
require_once("Mail.php");

require_once("coupon_std.inc");
//require_once("$txtdir/questionnaire_submit.inc");

//if($FirstConnect)	header("Location: $rooturl/");

// 登録作業
if($user['session_id']== 0)	header("Location: $rooturl/");
$req= $_REQUEST;
$tenpoAry = Array();
foreach($req as $name=>$val){
	if(preg_match('/^favtenpo/',$name)){
		if(!is_numeric($val))continue;
		if($val > 9999)continue;
		$tenpoAry[] = pg_escape_string($val);
	}
}

$route = $req['rt'];
if(strlen(trim($route)) == 0 || !is_numeric($route))$route = 0;

if($route > 1000)$route = 0;

$sql = "insert into t_enq_log(id,registtime,seq,route) values('{$user['id']}',current_timestamp,1,'$route')";
dberrexit($con, $con->query($sql), "<html>", __FILE__, __LINE__);


$data= array();

$data['mailaddr']= $_REQUEST['mailaddr'];
$data['mailaddr']= str_replace("\n", "", $data['mailaddr']);
$data['mailaddr']= str_replace("\r", "", $data['mailaddr']);
if(preg_match("/[^0-9a-zA-Z@_\.-]/", $data['mailaddr']))	$data['mailaddr']= "";

if(is_numeric($_REQUEST['nenrei']) && $_REQUEST['nenrei']> 0)		$data['nenrei']= intval(date('Y', time()))- intval($_REQUEST['nenrei']);
else																$data['nenrei']= "NULL";
if(is_numeric($_REQUEST['seibetsu']) && $_REQUEST['seibetsu']> 0)	$data['seibetsu']= intval($_REQUEST['seibetsu']);
else																$data['seibetsu']= 1;
if(is_numeric($_REQUEST['doukyo']) && $_REQUEST['doukyo']> 0)		$data['doukyo']= intval($_REQUEST['doukyo']);
else																$data['doukyo']= "NULL";
if(strlen($_REQUEST['yubin'])> 0)									$data['yubin']= "'". pg_escape_string($_REQUEST['yubin']). "'";
else																$data['yubin']= "NULL";
//if(strlen($_REQUEST['mailaddr'])> 0)								$data['mailaddr']= "'". pg_escape_string(trim($data['mailaddr'])). "'";
//$data['mailaddr']= "'". $data['mailaddr']. "'";
	$mailaddr = $data['mailaddr'];
	$data['mailaddr']= "'". $data['mailaddr']. "'";

	$data['question9'] = "'".implode(",",$tenpoAry)."'";

	//$data['mailaddr']= str_replace("\n", "", $data['mailaddr']);
	//$data['mailaddr']= str_replace("\r", "", $data['mailaddr']);
	$regd = 0;
if($_REQUEST['anraku']=="on"){
	$regd = $regd + registml($con,$data,$user,$route);
	
}
if($_REQUEST['honpo']=="on"){
	$sesbuf = $user['session_id'];
	$user['session_id'] = makesessionid($con_honpo);
	initializesession($con_honpo, $user, $minfo);
	$regd = $regd + registml($con_honpo,$data,$user,$route);
	$user['session_id'] = $sesbuf;

}
/*
*/

if(preg_match("/([a-zA-Z0-9_.￥-]+@[a-zA-Z0-9_.￥-]+)/", $mailaddr, $match)){
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

	//if($regd == 0)$mailObject -> send($recipients, $headers, $body);
	$mailObject -> send($recipients, $headers, $body);
}


switch($minfo['provider']) {
	case "au":
		include "page_ezweb/questionnaire_thanks_postal.php";
		break;
	case "softbank":
	case "yahoo":
		include "page_softbank/questionnaire_thanks_postal.php";
		break;
	default:	// docomoとその他
		include "page_imode/questionnaire_thanks_postal.php";
		//include "page_ezweb/questionnaire_thanks_postal.php";
		//include "page_softbank/questionnaire_thanks_postal.php";
}


function registml($con,$data,$user,$route){
	//メールアドレス登録済みかどうかを確認
	$id = 0;
	$sql = "select id,mailaddr from t_customer where session_id='{$user['session_id']}'";
	$res = $con->query($sql);

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
			$sql = "select id,mailaddr from t_customer where mailaddr={$data['mailaddr']}";
			$res = $con->query($sql);
			if($res->numRows()==0 && $mail_db != $data['mailaddr']){
				$sql = "insert into t_mlentry(id,registtime,route) values('$id',current_timestamp,'$route')";
				dberrexit($con, $con->query($sql), "<html>", __FILE__, __LINE__);
			}else{
				$regdflg = 1;
			}
		}else{
			$sql = "select id,mailaddr from t_customer where mailaddr={$data['mailaddr']}";
			$res = $con->query($sql);
			if($res->numRows()>0)$regdflg = 1;
		}
	}

	foreach($data as $key=> $val) {
		$ndata[]= "$key=$val";
	}
	$sql= "update t_customer set ". join(",", $ndata). " , deletetime = '2999-12-31',createtime = current_timestamp where session_id='{$user['session_id']}'";
	//print($sql);
	dberrexit($con, $con->query($sql), "<html>", __FILE__, __LINE__);
	return $regdflg;
}


?>
