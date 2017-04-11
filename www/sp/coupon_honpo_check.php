<?php
define("NO_USERINFO", FALSE);

require_once("honpo_std.inc");
//require_once("$txtdir/coupon.inc");

//print($user['session_id']);
$coupon=Array();

if($_REQUEST['a']!= 1 && $user['session_id']== 0)	header("Location: $rooturl/");
//カウンタ加算
$today = date('Ymd',mktime());

$sql = "update t_accesscount set access_count = access_count+1 where access_date='$today'";
$res = $con->query($sql);
dberrexit($con, $res, "<html>", __FILE__, __LINE__);

// なぞポンの抽選
$sql= "select session_nazopon from t_customer where session_id='{$user['session_id']}'";
$res= $con->getone($sql);
dberrexit($con, $res, "<html>", __FILE__, __LINE__);

$eigyobi= date('Ymd', geteigyobi());
if(strlen($_REQUEST['viewyear'])>0){
	$eigyobi = "{$_REQUEST['viewyear']}{$_REQUEST['viewmonth']}{$_REQUEST['viewday']}";
}

$thisyear = date("Y",mktime());

$viewyear = substr($eigyobi,0,4);
$viewmonth = substr($eigyobi,4,2);
$viewday = substr($eigyobi,6,2);

$yearopt = $monthopt = $dayopt = "";
for($i=0;$i<=2;$i++){
	$opyear = $thisyear + $i -1;
	$selected = "";
	if($opyear == $viewyear)$selected = " selected";
	$yearopt .= "<option value=\"{$opyear}\"{$selected}>$opyear";
}

for($i=1;$i<=12;$i++){
	$selected = "";
	$ii = sprintf("%02d",$i);
	if($ii == $viewmonth)$selected = " selected";
	$monthopt .= "<option value=\"{$ii}\"{$selected}>$i";
}

for($i=1;$i<=31;$i++){
	$selected = "";
	$ii = sprintf("%02d",$i);
	if($ii == $viewday)$selected = " selected";
	$dayopt .= "<option value=\"{$ii}\"{$selected}>$i";
}


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
<li>
<a href="honpo_div.php?cpn=<?=$cnt;?>" class="arrow">
<?
	if($is_nazopon) {
		print("<img src='$imgdir/rank{$coupon['nazopon_rank']}.$picttype' width='80%'><br>\n");
	}
?>
<img src='<?= $imgdir ?>/<?= $coupon['pictname_sp'] ?>' width='80%'><br><?= $coupon['name'] ?></a></li>
<?php
	if($coupon['coupon_price']== 0) {
?>
<font color='red'>なんと無料！</font>
<?php
	}
	elseif($coupon['normal_hontai']== 0) {
?>
特別価格&nbsp;&nbsp;<font color='red'><?= $coupon['coupon_hontai'] ?>円
<?php 
		if($coupon['coupon_price']>0){
?>
(税込<?= $coupon['coupon_price'] ?>円)</font>
<?php
		}else{
?>
</font>
<?php
		}
	}
	else {
?>
<?= $coupon['normal_hontai'] ?>円
<?php 
		if($coupon['normal_price']>0){
?>
(税込<?= $coupon['normal_price'] ?>円)
<?php
		}
?>
→ <font color='red'><?= $coupon['coupon_hontai'] ?>円
<?php 
		if($coupon['coupon_price']>0){
?>
(税込<?= $coupon['coupon_price'] ?>円)</font>
<?php
		}
?>
</font>
<?php
	}
	print("<BR><font color='red'>". date('Y/m/d', geteigyobi()). "営業日限り有効<br></font>");
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=yes">
<title>お得なクーポン</title>
<script type="application/javascript">
<!--//
var listidx = 2;
$(function(){
    //$('#mainImages ul li').flickSlide({target:'#mainImages>ul', duration:9000});
    //$('#list_cpn').append('◎');
});

function jumpList(){
	location.href="couponlist.php";
}
//-->
</script>
<script src="js/jquery-1.5.2.min.js" type="application/javascript" charset="UTF-8"></script>
<script src="js/jquery.flickslide.js" type="application/javascript" charset="UTF-8"></script>
<script src="js/jquery.query.js" type="application/javascript" charset="UTF-8"></script>
	<script type="text/javascript" src="js/common.js"></script>
	<script type="text/javascript" src="js/top.js"></script>
	<script type="text/javascript" src="js/gears_init.js"></script>
	<script type="text/javascript" src="js/gps.js"></script>
<link rel="stylesheet" type="text/css" href="css/flickslide.css" />
	<link rel="stylesheet" href="css/top2011.css" />
	<link rel="stylesheet" href="css/common2011.css" />

<style>
body {
	margin:0;
	padding:0;
	width:100%;
}
</style>
</head>

<body id='normal' style='background-color:#FFF;'>
<!-- topPageHeader -->
<div id="contentsWrap">
<header id="topPageHeader" style='color:#000; background-color: rgb(255,255,255);'>
<h1><a href="index.html"><img src="images/logo.jpg" width="60" height="35"></a> お得なクーポン</h1>
<p class="menuBtn"><a href="javascript:void(0)" onClick="slideUpMenu();">メニュー一覧</a></p>
</header>
<section class="campaign">
ご注文の際にこちらの画面を店員に提示してください。クーポンのご利用注文点数の上限は、ご来店人数×２点迄となります。但し、アルコールクーポンについてはご利用注文点数の上限内で、成人のお客様人数×２点を上限とさせていただきます。その他の割引サービスとは併用できませんのでご了承ください。 <br> 
<br>
<form method="post" action="coupon_honpo_check.php">
<select name="viewyear"><?=$yearopt;?></select>年<select name="viewmonth"><?=$monthopt;?></select>月<select name="viewday"><?=$dayopt;?></select><input type="submit" value="日現在のページを見る">
</form>
<br>
<div align=center>	<ul>	

<?php
// なぞポンの出力
$cnt = 0;
setcoupon($coupon['nazopon'],$cnt, TRUE);

$cnt++;

// それ以外のクーポンの出力
foreach($coupon['normal'] as $val){
	setcoupon($val,$cnt);
	$cnt++;
}
?> 

</ul></div>
</section>
</div>
<!-- menu -->
<nav id="menu">
</nav>
<script src="js/menu.js"></script>

</body>
</html>