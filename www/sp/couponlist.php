<?php
define("NO_USERINFO", FALSE);

require_once("coupon_std.inc");
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
<a href="coupon.php?cpn=<?=$cnt;?>" class="arrow">
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
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=yes">
<title>お得なクーポン</title>
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

<script type="application/javascript">
<!--//
$(function(){
    $('#mainImages ul li').flickSlide({target:'#mainImages>ul', duration:9000});
});

function jumpList(){
	location.href="couponlist.php";
}
//-->
</script>
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
<header id="topPageHeader" style='color:#FFF; background-color: rgb(255,255,255);'>
<h1><a href="index.html"><img src="images/logo.jpg" width="60" height="35"></a> お得なクーポン</h1>
<p class="menuBtn"><a href="javascript:void(0)" onClick="slideUpMenu();">メニュー一覧</a></p>
</header>
<section class="campaign">
	<ul>	

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

</ul>
</section>
</div>
<!-- menu -->
<nav id="menu">
<header>
<h1>メニュー</h1>
<p class="menuClose"><a onClick="slideDownMenu();" href="javascript:void(0)">閉じる</a></p>
</header>
<ul>
<li class="icon01"><a href="index.html">トップページ</a></li>
<li class="icon02"><a href="questionnaire.php">メールマガジン登録</a></li>
<li class="icon03"><span>店舗を探す</span></li> 
<li class="sublist"><a href="#3" class="arrow small" onClick="sendPosition();">GPSで近くの店舗を探す</a></li>
<li class="sublist"><a href="search_pref.html" class="arrow small">住所から探す</a></li>
<li class="sublist"><a href="search_kind.html" class="arrow small">業態から探す(安楽亭以外)</a></li>
<li class="icon04"><span>おすすめメニュー</span></li> 
<li class="sublist"><a href="http://k.anrakutei.jp/menu/tabehoudai.php" class="arrow small">食べ放題コース</a></li>
<li class="sublist"><a href="http://k.anrakutei.jp/course.php" class="arrow small">宴会コース</a></li>
<li class="sublist"><a href="http://k.anrakutei.jp/menu/oneuchi.php" class="arrow small">お値打ち黒毛和牛</a></li>
<li class="icon05"><span>安全、安心への確かな取り組み</span></li> 
<li class="sublist"><a href="1.html" class="arrow small">1.本物主義の調達</a></li>
<li class="sublist"><a href="2.html" class="arrow small">2.検査体制と情報開示</a></li>
<li class="sublist"><a href="3.html" class="arrow small">3.サプライチェーンの構築</a></li>
<li class="sublist"><a href="4.html" class="arrow small">4.手間をかけた伝統の味</a></li>
<li class="sublist"><a href="5.html" class="arrow small">5.教育と人材育成</a></li>
</ul>
</nav>
<script src="js/menu.js"></script>

</body>
</html>