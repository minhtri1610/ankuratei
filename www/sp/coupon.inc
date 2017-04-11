<?php
require_once("mobile.inc");

/*************************************************/
/* セッションIDを生成します                      */
/* 重複しないセッションIDを20回試行します        */
/* 重複IDを20回生成してしまった場合は空文字で    */
/* 返します                                      */
/*************************************************/
function makesessionid($con) {
	for($i= 0; $i< 20; $i++) {
		$ret= "";
		for($j= 0; $j< 7; $j++) {
			$ret.= mt_rand(0, 99);
		}
		$sql= "select count(id) from t_customer where session_id= '$ret'";
		$res= $con->getone($sql);
		dberrexit($con, $res, "", __FILE__, __LINE__);
		
		if($res== 0)	break;
		else			$ret= "";
	}
	
	return $ret;
}

/*************************************************/
/* セッション初期化を行います                    */
/* セッションの有効無効は無視して                */
/* ユーザIDだけで処理されます。                  */
/*                                               */
/* 主に無効なセッションをクリアする時に使用します*/
/* ユーザセッションには新しいセッションを格納    */
/* してください                                  */
/*                                               */
/* ユーザ情報配列を渡します(実体渡し)            */
/* 携帯情報配列を渡します(値渡し)                */
/* 失敗した場合はFALSEを返します                 */
/*************************************************/
function initializesession($con, &$user, $minfo,$sw=0) {
	
	if($user['id']== 0 || !is_numeric($user['id']))	return FALSE;
	
	// IDを検索
	$sql= "select count(id) from t_customer where id= ?";
	$res= $con->getone($sql,Array($user['id']));
	dberrexit($con, $res, "", __FILE__, __LINE__);
	
	// なければ、新たに生成
	if($res== 0) {
		$car= 0;
		switch($minfo['provider']) {
			case "docomo":
				$car= 1;	break;
			case "au":
				$car= 2;	break;
			case "softbank":
				$car= 3;	break;
			case "willcom":
				$car= 4;	break;
		}
$sql=<<<END
insert into t_customer (
  id,
  prefixcode,
  access_count,
  last_access,
  mailaddr,
  carrier,
  last_useragent,
  session_id,
  session_limit
) values (
  ?,
  ?,
  1,
  now(),
  ?,
  ?,
  ?,
  ?,
  to_timestamp(to_char(now() + '+17 hour','yyyy-mm-dd') || ' 07:00:00' ,'yyyy-mm-dd hh24:mi:ss')
)
END;
		dberrexit($con, $con->query($sql,Array($user['id'],$minfo['serial'],$user['mailaddr'],$car,$_SERVER['HTTP_USER_AGENT'],$user['session_id'])), "<html>", __FILE__, __LINE__);
	}
	else {
		// 存在していれば、セッション等を配列情報を元にクリアする
		$addsql ="";
		$phary = Array($user['id']);
		if($sw == 1){
			$addsql = ",mailaddr=  ?";
			$phary = Array($user['mailaddr'],$user['id']);
		}
$sql=<<<END
update t_customer
set
  last_access= now(),
  access_count= access_count+ 1,
  session_id= '{$user['session_id']}',
  session_limit= to_timestamp(to_char(now() + '+17 hour','yyyy-mm-dd') || ' 07:00:00' ,'yyyy-mm-dd hh24:mi:ss'),
  session_nazopon= NULL
  $addsql
where
  id= ?
END;
		
		dberrexit($con, $con->query($sql,$phary), "<html>", __FILE__, __LINE__);
		
	}
	
	return TRUE;
}

/*************************************************/
/* セッション継続処理を行います                  */
/* 渡されたセッションIDに対して行います          */
/*************************************************/
function keepsession($con, $sid) {

$sql=<<<END
update t_customer
set
  access_count= access_count+ 1,
  last_access= now(),
  last_useragent= ?,
  session_limit= to_timestamp(to_char(now() + '+17 hour','yyyy-mm-dd') || ' 07:00:00' ,'yyyy-mm-dd hh24:mi:ss')
where
  session_id= ?
END;
	
	dberrexit($con, $con->query($sql,Array($_SERVER['HTTP_USER_AGENT'],$sid)), "<html>", __FILE__, __LINE__);
}

function sessionreset($con,$sid){
//セッション時間切れ処理。
//なぞポン抽選をクリアしてセッション時間更新

if(strlen($sid)==0)return;

$sql=<<<END
update t_customer
set
  access_count= access_count+ 1,
  last_access= now(),
  last_useragent= ?,
  session_limit= to_timestamp(to_char(now() + '+17 hour','yyyy-mm-dd') || ' 07:00:00' ,'yyyy-mm-dd hh24:mi:ss'),
  session_nazopon = null
where
  session_id= ?
END;
	
	dberrexit($con, $con->query($sql,Array($_SERVER['HTTP_USER_AGENT'],$sid)), "<html>", __FILE__, __LINE__);
	
}

?>