<?php
define("NO_USERINFO", FALSE);
	session_start();
$req= $_REQUEST;
if($req['fm'] == 1){
	$frommail = 1;
}
require_once("coupon_std.inc");

$route = $req['rt'];
if(strlen($route) == 0 || !is_numeric($route))$route = 0;

switch($route){
	case 2:
	$enqmail = "enq_r@anrakutei.jp";
	break;
	case 3:
	$enqmail = "enq_l@anrakutei.jp";
	break;
	case 6:
	$enqmail = "enq_s@anrakutei.jp";
	break;
	default:
	$enqmail = "enq_r@anrakutei.jp";
	break;
}

//$enqmail = "enq_p@anrakutei.jp";//for smartphone

if($user['deletetime']<date("Y-m-d 23:59:59",mktime())){
	$user['mailaddr'] = "";
}


$sql = "insert into t_enq_log(id,registtime,seq,route) values(?,current_timestamp,0,?)";
if($req['fm'] != 1)dberrexit($con, $con->query($sql,Array($user['id'],$route)), "<html>", __FILE__, __LINE__);


list($yubin1, $yubin2)= explode("-", $user['yubin']);
$nenrei= (strlen($user['nenrei'])> 0)? (intval(date('Y', time()))- intval($user['nenrei'])): "";
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<meta id="viewport" name="viewport" content="width=320; initial-scale=1.0; maximum-scale=2.0; user-scalable=1;" />
	<title>◆焼肉 安楽亭スマートフォンサイト◆</title>
	<link rel="stylesheet" href="css/top2011.css" />
	<link rel="stylesheet" href="css/common2011.css" />
<script type="application/javascript">
<!--//
var listidx = 3;
//-->
</script>

	<script type="text/javascript" src="js/jquery-1.5.2.min.js"></script>
	<script type="text/javascript" src="js/gears_init.js"></script>
	<script type="text/javascript" src="js/common.js"></script>
	<script type="text/javascript" src="js/top.js"></script>

</head>

<body  style='background-color: rgb(255,255,255);'>
<!-- topPageHeader -->
<div id="contentsWrap">
<header id="topPageHeader" style='color:#666666; background-color: rgb(255,255,255);'>
<h1><a href="index.html"><img src="images/anrakulogo_head.jpg" alt="トップページへ" width="60" height="34"></a>会員登録</h1>
<p class="menuBtn"><a href="javascript:void(0)" onclick="slideUpMenu();">メニュー一覧</a></p>
</header>
<div style="text-align:left;margin-left:5px;margin-right:5px;">
メルマガ会員登録ありがとうございます。<br>
<?php
//print($user['session_id']);
?>
<br>
以下の設問への回答とメールアドレスのご登録をお願いします。<br>
<br><form action="questionnaire_conf_top.php" method=get>
<input type=hidden name="i" value="<?= $user['session_id'] ?>">
<input type="hidden" name="rt" value="<?=$req['rt'];?>">
年齢: <input type="text" name="nenrei" accesskey="1" size=3 maxlength="20" istyle=4 value="<?= $nenrei ?>" /><br>
性別: <input type=radio name="seibetsu" value="1" accesskey="2" <?= ($user['seibetsu']== 1)? "checked": "" ?>>男性 <input type=radio name="seibetsu" value="2" accesskey="2" <?= ($user['seibetsu']== 2)? "checked": "" ?>>女性<br>
郵便番号: <input name="yubin1" accesskey="3" size=3 maxlength="3" istyle=4 value="<?= $yubin1 ?>" type="text" />－<input  name="yubin2" accesskey="3" size=4 maxlength="4" istyle=4 value="<?= $yubin2 ?>" type="text" /><br>
同居人数: <input name="doukyo" accesskey="4" size=3 maxlength="3" istyle=4 value="<?= $user['doukyo'] ?>" type="text" />人 (本人を含む)<br>
<br>
<input type="hidden" name="anraku" value="on"><br>
メールアドレス: <input type=text name="mailaddr" size=30 maxlength="99" istyle=3 value="<?= $user['mailaddr'] ?>"><br>
<input type=hidden name="mailaddr_hid" size=30 maxlength="99" istyle=3 value="<?= $user['mailaddr'] ?>">
メールアドレスの入力は<a href="mailto:<?=$enqmail;?>">こちらから</a>空メールを送信して、
返信されてくるアドレスを開くことでもできます。<br />
<font size=2>※ メールアドレスを入力する場合、安楽亭の<a href='privacy.html'>ﾌﾟﾗｲﾊﾞｼｰﾎﾟﾘｼｰ</a>に同意されたものとします。</font><br>
<br>
<input type=submit value="次へ"><font size=2> </font><input type=reset value="リセット"><br>
<br>
</form><br>
</div>
</div>
<!-- menu -->
<nav id="menu">
</nav>
<script src="js/menu.js"></script>

</body>
</html>