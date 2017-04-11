<?php
define("NO_USERINFO", FALSE);

require_once("coupon_std.inc");
//require_once("$txtdir/coupon.inc");

//print($user['session_id']);
$coupon=Array();

	// 営業日を取得
	if( date( "H:i:s" ) >= "00:00:00" && date( "H:i:s" ) < "07:00:00" ){
		$strDATE = date( "Y/m/d", strtotime( "-1 day" ) );
	}
	else{
		$strDATE = date( "Y/m/d" );
	}


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
//$eigyobi = "2013-06-29";

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

$cpncnt = 0;

foreach($res as $val) {
	$cpncnt++;
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
<li style="height:362px; overflow:hidden; width:266px; margin:0px; padding:0px; background-color:#F5F5F5;">
<a href="javascript:void(0);" class="arrow">
<div style="background-image:url( './img/couponBgQ.png' ); width:266px; height:172px; margin:0px; padding:0px; padding-top:9px;"><div style="width:245px; height:163px; overflow:hidden;"><img src='<?= $imgdir ?>/<?= $coupon['pictname_sp'] ?>' width='245'></div></div></a>
<!--
<?php
	if($coupon['coupon_price']== 0) {
?>
<font color='red'>なんと無料！</font>
-->
<?php
	}
	elseif($coupon['normal_hontai']== 0) {
?>
特別価格&nbsp;&nbsp;<font color='red'><?= $coupon['coupon_hontai'] ?>円
<?php 
		if($coupon['coupon_price']>0){
?>
(税込<?= $coupon['coupon_price'] ?>円)</font>
-->
<?php
		}else{
?>
</font>
-->
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
-->
<?php
	}
	print("</li>");
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Cache-Control" content="no-cache">
<meta http-equiv="Expires" content="0">
<meta name="viewport" content="target-densitydpi=device-dpi,height=device-height,user-scalable=no,initial-scale=1,maximum-scale=0.6667">
<title>お得なクーポン</title>
<script src="js/jquery-1.5.2.min.js" type="application/javascript" charset="UTF-8"></script>
<script src="js/jquery.query.js" type="application/javascript" charset="UTF-8"></script>
<style type="text/css">
body {
	margin:0;
	padding:0;
	width:100%;
	padding-left:24px;
	padding-right:24px;
	/* overflow:hidden; */
}
      #flickable1 {
        //border: 1px solid #CCC;
        width: <?=($cpncnt * 267 + 24 )?>px;
        height: 333px;
        overflow: hidden;
      }
      #flickable1 ul {
        list-style: none;
        width:<?=($cpncnt * 267 + 24 )?>px;
        margin: 0;
        padding: 5px;
      }
      #flickable1 ul li {
        background-color: #FFF;
        //background-image: url(img/couponBg.png);
        //border: 1px solid #CCC;
        height: 330px;
        width: 280px;
        margin-top: 5px;
        margin-left: 30px;
        margin-right: 0px;
        padding: 5px;
        float: left;
      }
      #flickable1 .ui-flickable-container {
        cursor: pointer;
      }

</style>
<script type="application/javascript" onLoad="init();">
<!--//
var listidx = 1;

/*
  $(function() {
      $(window).flickable({section:li});
  });
*/
function jumpList(){
	location.href="couponlist.php";
}


function fncInit(){

	var width_num;
	var height_num;

	if(window.devicePixelRatio > 0){
		width_num = screen.width * window.devicePixelRatio;
		height_num = screen.height * window.devicePixelRatio;
	}
	else{
		width_num = screen.width;
		height_num = screen.height;
    }

	// iPhone4
	if( height_num == 960 ){

		$( "#flickable1" ).css( "margin-top", "48px" );

		var strHTML =  "";
			strHTML += "<img src='<?= $imgdir ?>/coupon_icon_miserudake.png' width='100' height='50' align='left'>";
			strHTML += "<div style='font-size:10px; font-weight:bold; line-height:105%; padding-top:14px; margin-bottom:16px;'>クーポン券は、ご注文の際に、<br>この画面を店員にお見せください。</div>";
		$( "#ID_HEADER" ).html( strHTML );

		var strHTML =  "";
			strHTML += "<span style='font-size:16px; font-weight:bold;'><?= $strDATE ?>営業日限り有効</span><br>";
			strHTML += "<span style='font-size:12px; line-height:125%;'>本券１枚で表記のメニュー１セットを<br>特別価格でお召し上がりいただけます。</span>";
		$( "#ID_FOOTER" ).html( strHTML );

		$( "#ID_FOOTER" ).css( "bottom", "112px" );

	}

	// iPhone5
	else{

		// $( "#flickable1" ).css( "margin-top", "120px" );
		$( "#flickable1" ).css( "margin-top", "103px" );

		var strHTML =  "";
			strHTML += "<img src='<?= $imgdir ?>/coupon_icon_miserudake.png' width='82' height='41'><br>";
			strHTML += "<div style='font-size:12px; font-weight:bold; line-height:105%; padding-top:7px; margin-bottom:16px;'>クーポン券は、ご注文の際に、<br>この画面を店員にお見せください。</div>";
		$( "#ID_HEADER" ).css( "top", "16px" );
		$( "#ID_HEADER" ).html( strHTML );

		var strHTML =  "";
			strHTML += "<span style='font-size:16px; font-weight:bold;'><?= $strDATE ?>営業日限り有効</span><br>";
			strHTML += "<span style='font-size:12px; line-height:150%;'>本券１枚で表記のメニュー１セットを<br>特別価格でお召し上がりいただけます。</span>";
		$( "#ID_FOOTER" ).html( strHTML );

		$( "#ID_FOOTER" ).css( "bottom", "129px" );

	}

}
//-->
</script>

</head>

<body id='normal' style='background-color:#F5F5F5;' onload="fncInit()">
<!-- topPageHeader -->
<div id="contentsWrap">
<section class="campaign">
<!--
ご注文の際にこちらの画面を店員に提示してください。
クーポンのご利用注文点数の上限は、ご来店人数×２点迄となります。
但し、アルコールクーポンについてはご利用注文点数の上限内で、成人のお客様人数×２点を上限とさせていただきます。
その他の割引サービスとは併用できません。
新浦安店、久喜吉羽店、ふじみの店、館林北店、コスモス店、ぼたん店ではご利用になれません。
一部店舗にてお取扱いしていないメニューがございますので予めご了承下さいませ。<br> 

<br>
-->
<div id="ID_HEADER" style="margin:0 auto; position:fixed; top:4px; width:267px; height:64px; text-align:center;">
</div>

<div align=center id="flickable1" style="height:336px; margin-top:48px; overflow:hidden;"><ul>	
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
<div id="ID_FOOTER" style="margin:0 auto; position:fixed; bottom:104px; width:267px; height:24px;">
</div>
<div style="clear:both;"></div>
</div>
</section>
</div>
<!-- menu -->

</body>
</html>
