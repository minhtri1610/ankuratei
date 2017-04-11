<?php
define("NO_USERINFO", FALSE);

require_once("honpo_std.inc");
//require_once("$txtdir/coupon.inc");

//print($user['session_id']);
$coupon=Array();

if($_REQUEST['a']!= 1 && $user['session_id']== 0)	header("Location: $rooturl/");
//カウンタ加算
$today = date('Ymd',mktime());

$cpnidx = $_REQUEST['cpn'];

$sql = "update t_accesscount set access_count = access_count+1 where access_date='$today'";
$res = $con->query($sql);
dberrexit($con, $res, "<html>", __FILE__, __LINE__);

// なぞポンの抽選
$sql= "select session_nazopon from t_customer where session_id='{$user['session_id']}'";
$res= $con->getone($sql);
dberrexit($con, $res, "<html>", __FILE__, __LINE__);

$eigyobi= date('Ymd', geteigyobi());

if(strlen($res)== 0) {
	
$sql=<<<END
select id, nazopon_odds from m_coupon
where
  createtime<= now() and deletetime> now() and
  startdate<= '$eigyobi' and stopdate> '$eigyobi' and
  nazopon_flg= 1
END;
	
	$res= $con->getall($sql, DB_FETCHMODE_ASSOC);
	
	// １．ランダムで１～１００の番号を抽選
	// ２．なぞポンリストのオッズ（合計値100）の値でランダム抽出値をマイナスしていき、
	// ３．0以下になった商品で当選とする
	$r= mt_rand(1, 100);
	$n= $res[0]['id'];
	if($n =="")$n=1122;
	//if(strlen($n)==0)$n=0;
	
	foreach($res as $val) {
		$r-= $val['nazopon_odds'];
		if($r<= 0) {
			$n= $val['id'];
			break;
		}
	}
	
	$sql= "update t_customer set session_nazopon=$n where session_id='{$user['session_id']}'";
	dberrexit($con, $con->query($sql), "<html>", __FILE__, __LINE__);
}
else $n= $res;

// クーポンデータの取得
$sql=<<<END
select * from m_coupon
where
  createtime<= now() and deletetime> now() and
  startdate<= '$eigyobi' and stopdate> '$eigyobi' and
  (nazopon_flg= 0 or id=$n)
order by c_sortkey
END;

$res= $con->getall($sql, DB_FETCHMODE_ASSOC);
dberrexit($con, $res, "<html>", __FILE__, __LINE__);

foreach($res as $val) {
	if($val['nazopon_flg']== 1)	$coupon['nazopon']= $val;
	else						$coupon['normal'][]= $val;
}

// アンケート登録の有無をチェック
$sql= "select seibetsu from t_customer where id={$user['id']}";
$res= $con->getone($sql);
dberrexit($con, $res, "<html>", __FILE__, __LINE__);
$touroku= ($res== 0)? TRUE: FALSE;

function setcoupon($coupon,$cnt ,$is_nazopon= FALSE) {
global $picttype;
global $imgdir;
?>
<li id="mainImage<?=$cnt;?>">
<div style='width:100%;height:80%;white-space:nowrap;'>
<?
	if($is_nazopon) {
		print("<img src='$imgdir/rank{$coupon['nazopon_rank']}.$picttype' width='80%'><br>\n");
	}
?>
<img src='<?= $imgdir ?>/<?= $coupon['pictname_sp'] ?>' width='80%'>
<?php
	//print("</font></div></div></li>\n");
	print("</li>\n");
	print("<BR>". date('Y/m/d', geteigyobi()). "営業日限り有効<br>");
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=yes">
<title>お得なクーポン（安楽亭）</title>
<script type="application/javascript">
<!--//
var listidx = 1;
//-->
</script>
<script src="js/jquery-1.5.2.min.js" type="application/javascript" charset="UTF-8"></script>
<script src="js/jquery.query.js" type="application/javascript" charset="UTF-8"></script>
	<script type="text/javascript" src="js/common.js"></script>
	<script type="text/javascript" src="js/top.js"></script>
	<script type="text/javascript" src="js/gears_init.js"></script>
	<script type="text/javascript" src="js/gps.js"></script>
<link rel="stylesheet" type="text/css" href="css/flickslide.css" />
	<link rel="stylesheet" href="css/top2011.css" />
	<link rel="stylesheet" href="css/common2011.css" />

<script type="application/javascript">
<!--//
$(function(){
   // $('#mainImages ul li').flickSlide({target:'#mainImages>ul', duration:9000});
});
function jumpList(){
	location.href="coupon_honpo.php";
}//-->
</script>
<style>
body {
	margin:0;
	padding:0;
	width:100%;
}
</style>
</head>

<body id='normal' style='background-color:#EDEDED;'>
<!-- topPageHeader -->
<div id="contentsWrap">
<header id="topPageHeader" style='color:#FFFFFF; background-color: rgb(255,255,255);'>
<h1><a href="index.html"><img src="images/anrakulogo_head.jpg" width="60" height="34"></a> お得なクーポン</h1>
<p class="menuBtn"><a href="javascript:void(0)" onClick="slideUpMenu();">メニュー一覧</a></p>
</header>
<?php
// 未登録の場合のみ
if($touroku && strlen($minfo['serial'])> 0) {
?>
<a href="questionnaire.php?i=<?= $user['session_id'] ?>">アンケートにご協力ください。
</a><br>
<br>
<hr>
<?php
}
?>

<div id="mainImages" class="mainImageInit" align='center'>
    <ul>

<?php
// なぞポンの出力
$cnt = 0;
if($cnt == $cpnidx)setcoupon($coupon['nazopon'],$cnt, TRUE);

$cnt++;

// それ以外のクーポンの出力
foreach($coupon['normal'] as $val){
	if($cnt == $cpnidx)setcoupon($val,$cnt);
	$cnt++;
}
?> 
</ul>
<hr>
<div class="bottomCenter" onclick="jumpList()"></div>
</div>
</div>
<!-- menu -->
<nav id="menu">
</nav>
<script src="js/menu.js"></script>

</body>
</html>