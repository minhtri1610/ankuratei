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
$sql= "select session_nazopon from t_customer where session_id=?";
$res= $con->getone($sql,Array($user['session_id']));
dberrexit($con, $res, "<html>", __FILE__, __LINE__);

$eigyobi= date('Ymd', geteigyobi());

if(strlen($res)== 0) {

	// なぞポン抽選基本オッズ抽出
	$sql=<<<END
select sum(nazopon_odds) as oddssum   
 from m_coupon
 where
  createtime<= now() and deletetime> now() and
  startdate<= '$eigyobi' and stopdate> '$eigyobi' and (nazopon_flg = 1 and nazopon_odds >0)
END;

$result = $con->query($sql);
$rows = $result->fetchRow(DB_FETCHMODE_ASSOC);
$oddssum = $rows['oddssum'];//なぞポン対象オッズ総和

	
$sql=<<<END
select id, nazopon_odds from m_coupon
where
  createtime<= now() and deletetime> now() and
  startdate<= '$eigyobi' and stopdate> '$eigyobi' and
  nazopon_flg= 1
END;
	
	$res= $con->getall($sql, DB_FETCHMODE_ASSOC);
	
	// １．ランダムで１～基本オッズの番号を抽選
	// ２．なぞポンリストのオッズの値でランダム抽出値をマイナスしていき、
	// ３．0以下になった商品で当選とする
	if($oddssum >0){
		$r= mt_rand(1, $oddssum);
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
	}else{
		$n= $val['id'] ;
	}
	if(strlen($n) >0){
		$sql= "update t_customer set session_nazopon=? where session_id=?";
		dberrexit($con, $con->query($sql,Array($n,$user['session_id'])), "<html>", __FILE__, __LINE__);
	}
}
else $n= $res ;

$n = $n * 1.0;

// クーポンデータの取得
$sql=<<<END
select * from m_coupon
where
  createtime<= now() and deletetime> now() and
  startdate<= '$eigyobi' and stopdate> '$eigyobi' and
  (nazopon_flg= 0 or id=?)
order by c_sortkey
END;

$res= $con->getall($sql,Array($n), DB_FETCHMODE_ASSOC);
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
<a href="coupon_div.php?cpn=<?=$cnt;?>" class="arrow">
<?
	if($is_nazopon) {
		//$coupon['nazopon_rank']=3;
		print("<img src='$imgdir/rank{$coupon['nazopon_rank']}.$picttype' width='80%'><br>\n");
		if($coupon['nazopon_rank'] == 1){
?>
<div style="text-align: left;">
<span style="color:#ED1C29;">なぞポンの抽選結果について</span><br>
<br>
一定確率でチラシやPC等、どこにも載っていない<font style="font-size:130%; font-weight:bold;color:#ED1C29;">”すごいクーポン”</font>が当たる<span style="color:#ED1C29;">なぞポン！</span><br>
<br>
本日<font style="font-size:130%; font-weight:bold;color:#ED1C29;"><<スペシャルクーポン>></font>が出現したあなたはすごくラッキー！活用しないともったいない！<br>
</div>
<?
		}else{
?>
<div style="text-align: left;">
<span style="color:#ED1C29;">なぞポンの抽選結果について</span><br>
<br>
一定確率でチラシやPC等、どこにも載っていない<font style="font-size:130%; font-weight:bold;color:#ED1C29;">”すごいクーポン”</font>が当たる<span style="color:#ED1C29;">なぞポン！</span><br>
<br>
本日残念ながら<<font style="font-size:130%; font-weight:bold;color:#ED1C29;"><<スペシャルクーポン>></font>が出現しなかったあなたにもちょーお得なクーポンプレゼント！<br>
</div>

<?
		}
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
(税抜)</font>
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
(税抜)
<?php
		}
?>
→ <font color='red'><?= $coupon['coupon_hontai'] ?>円
<?php 
		if($coupon['coupon_price']>0){
?>
(税抜)</font>
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
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Cache-Control" content="no-cache" />
<meta http-equiv="Cache-Control" content="max-age=0" />
<meta name="viewport" content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=yes">
<title>お得なクーポン</title>
<script type="application/javascript">
<!--//
var listidx = 1;
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

<script type="text/javascript">

  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-20022925-6']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

</script>

</head>

<body id='normal' style='background-color:#FFF;'>
<!-- topPageHeader -->
<div id="contentsWrap">
<header id="topPageHeader" style='color:#000; background-color: rgb(255,255,255);'>
<h1><a href="index.html"><img src="images/logo.jpg" width="60" height="35"></a> お得なクーポン</h1>
<p class="menuBtn"><a href="javascript:void(0)" onClick="slideUpMenu();">メニュー一覧</a></p>
</header>
<section class="campaign">
ご注文の際にこちらの画面を店員に提示してください。 クーポンのご利用注文点数の上限は、ご来店人数×２点迄となります。 
但し、アルコールクーポンについてはご利用注文点数の上限内で、成人のお客様人数×２点を上限とさせていただきます。 
その他の割引サービスとは併用できません。下北あんらく亭、コスモス店、ぼたん店、和牛カルビ屋（東大宮店）、  国産牛カルビ本舗（浦和大谷口店）ではご利用いただけません。
一部店舗にてお取扱いしていないメニューがございますので予めご了承下さいませ。<br> 
<br>
	<div align=center><ul>	

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
