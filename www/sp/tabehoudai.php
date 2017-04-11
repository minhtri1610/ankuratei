<?php
// Google Analyticsのトラッキングコード PHP版
// <html>の直前に書くこと
  
  // Copyright 2009 Google Inc. All Rights Reserved.
  $GA_ACCOUNT = "MO-20022925-6";
  $GA_PIXEL = "/ga.php";

  function googleAnalyticsGetImageUrl() {
    global $GA_ACCOUNT, $GA_PIXEL;
    $url = "";
    $url .= $GA_PIXEL . "?";
    $url .= "utmac=" . $GA_ACCOUNT;
    $url .= "&utmn=" . rand(0, 0x7fffffff);
    $referer = $_SERVER["HTTP_REFERER"];
    $query = $_SERVER["QUERY_STRING"];
    $path = $_SERVER["REQUEST_URI"];
    if (empty($referer)) {
      $referer = "-";
    }
    $url .= "&utmr=" . urlencode($referer);
    if (!empty($path)) {
      $url .= "&utmp=" . urlencode($path);
    }
    $url .= "&guid=ON";
    return str_replace("&", "&amp;", $url);
  }
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html lang="ja">
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<meta id="viewport" name="viewport" content="width=320; initial-scale=1.0; maximum-scale=1.0; user-scalable=1;" />
	<title>安楽亭の食べ放題</title>
	<link rel="stylesheet" href="css/top2011.css" />
	<link rel="stylesheet" href="css/common2011.css" />
<script type="application/javascript">
<!--//
var listidx = 21;
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
<h1><a href="index.html"><img src="images/anrakulogo_head.jpg" alt="トップページへ" width="60" height="34"></a>安楽亭の食べ放題</h1>
<p class="menuBtn"><a href="javascript:void(0)" onclick="slideUpMenu();">メニュー一覧</a></p>
</header>
<p>&nbsp;</p>
<table border=0 cellpadding="0px" cellspacing="0px">
  <tr>
    <td><div id="content" style="position: relative;">
      <img src="./img/tabeho20161109.jpg" align="absbottom" width = "100%"></td>
  </tr>
    </div>
  
</table>
<p><br>
  <font size="-1">
    ※春日部店・稲毛駅前店・コスモス店・ぼたん店は、実施しておりません。<br />
    ※浦和大谷口店、ふじみ野店、久喜吉羽店、新小岩駅前店、ANRAKUTEI  SHIBUYA DOUGENZAKA店、五反田駅前店、下北沢店、北本店、けやき台店は、取扱いメニュー・価格が異なります。 </font>
  <br>
</p>

<hr>
<a name="1" id="1"><font color="red">◆お手軽バリューコース</font></a><br>
<font color="#ff00ff">
定番のカルビや人気のタンも食べ放題！<br>
</font>
<font color="#008080">
全40品＋デザート　&nbsp;&yen;2,480<font size="-1">(税抜)<br>
</font>
<font size="-1" color="#FF0000">
&nbsp;☆小学生未満&nbsp;無料<br>
</font>
<font size="-1" color="#008080">
&nbsp;☆小学生以下&nbsp;半額<br>
&nbsp;☆65歳以上&nbsp;&yen;500引(税抜)<br>
</font><font color="#008080"><font size="-1" color="#008080">※デザートはお一人様1品までとなります。
</font></font><font size="-1" color="#008080">
<br>
</font>
</font>
<hr>
<a name="1" id="1"><font color="red">◆大満足安楽亭コース</font></a><br>
<font color="#ff00ff">
お席でゆっくり100分&nbsp;食べ放題！<br>
</font>
<font color="#008080">
全75品&nbsp;&yen;3,280<font size="-1">(税抜)<br>
</font>
<font size="-1" color="#FF0000">
&nbsp;☆小学生未満&nbsp;無料<br>
</font>
<font size="-1" color="#008080">
&nbsp;☆小学生以下&nbsp;半額<br>
&nbsp;☆65歳以上&nbsp;&yen;2,200(税抜)<br>
</font>
</font>

<hr>


<a name="2" id="2"><font color="red">◆     ちょっと贅沢スペシャルコース</font></a><br>
<font color="#ff00ff">
お席でゆっくり100分！<br>

タンやハラミにユッケジャンも自慢の美味しさ大集合！<br>
</font>


<font color="#008080">
全107品&nbsp;&yen;3,780<font size="-1">(税抜)<br>
</font>
<font size="-1" color="#FF0000">
☆小学生未満 無料<br>
</font>
<font size="-1" color="#008080">

 ☆小学生以下 半額<br>
 ☆65歳以上 &yen;2,700(税抜)<br>
</font>
</font>

<hr>


<a name="2" id="2"><font color="red">◆     自分へのご褒美！ゴージャスコース</font></a><br>
<font color="#ff00ff">

お席でゆっくり100分 ！<br>

黒毛和牛も全～部食べ放題。<br>
</font>



<font color="#008080">
全119品 &yen;5,980<font size="-1">(税抜)<br>
</font>
<font size="-1" color="#FF0000">
☆小学生未満 無料<br>
</font>
<font size="-1" color="#008080">

 ☆小学生以下 半額<br>
 ☆65歳以上 &yen;4,700<font size="-1">(税抜)<br>
</font>
</font>

<hr>
<font color="red">●大満足安楽亭コースの例</font>
<br>

<font size="-1">
<font color="blue">◇焼肉各種</font><br>
(ｶﾙﾋﾞ・ﾛｰｽ・ﾎﾙﾓﾝ・豚・鶏)<br>
<font color="blue">◇海鮮各種</font><br>
(ｲｶ・ｲｲﾀﾞｺ)<br>
<font color="blue">◇ｻﾗﾀﾞ各種</font><br>
(ｻﾝﾁｭ・ﾐﾆｼｰｻﾞｰｻﾗﾀﾞなど)<br>
<font color="blue">◇ｽｰﾌﾟ各種</font><br>
(玉子・野菜・ﾜｶﾒ)<br>
<font color="blue">◇漬物</font><br>
(ｷﾑﾁ・ｶｸﾃｷ・ｵｲｷﾑﾁ)<br>
<font color="blue">◇ごはん</font><br>
(ﾗｲｽ・ﾋﾞﾋﾞﾝﾊﾞ・ｸｯﾊﾟ)<br>
<font color="blue">◇野菜焼各種</font><br>
<font color="blue">◇逸品</font><br>
(ﾅﾑﾙ・枝豆・ﾎﾟﾃﾄﾌﾗｲなど)<br>
<font color="blue">◇ﾄｯﾋﾟﾝｸﾞ各種</font><br>
(ねぎ塩・おろしﾎﾟﾝ酢など)<br>
<font color="blue">◇ﾃﾞｻﾞｰﾄ</font><br>
(ﾊﾞﾆﾗｱｲｽ・杏仁豆腐)<br>
<br>
</font>
<hr>
<a name="9" id="9"><font color="#000080">★飲み放題パック</font></a><br>
<font color="#008080">
飲み放題時間120分<br>
</font>
<br>
<font color="red">◆シンプルパック</font><br>
<font color="#008080">&nbsp;お一人様&nbsp;980円(税抜)</font><br>
<br>
<font size="-1">
・ｽｰﾊﾟｰﾄﾞﾗｲ(大瓶)<br>
・ﾉﾝｱﾙｺｰﾙﾋﾞｰﾙ<br>
・ｻﾜｰ＆ｶｸﾃﾙ(生搾りは除く)<br>
・梅酒<br>
・ﾜｲﾝ(赤・白)<br>
・日本酒(冷・燗)<br>
・冷酒<br>
・ｿﾌﾄﾄﾞﾘﾝｸ各種<br>
</font>
<br>
<font color="red">◆生ビールパック</font><br>
<font color="#008080">&nbsp;お一人様&nbsp;1,480円(税抜)</font><br>
<br>
<font size="-1">
・ｼﾝﾌﾟﾙﾊﾟｯｸ全種<br>
・生ﾋﾞｰﾙ<br>
・生搾りｻﾜｰ各種<br>
・草家ﾏｯｺﾘ<br>
・眞露<br>
</font>
<br>
<font color="#000080">【飲み放題ﾊﾟｯｸ注意事項】</font><br>
<font size="-1">
※ 飲み放題ﾊﾟｯｸは宴会ｺｰｽご利用のお客様に限ります。<br><br>
※ 飲み放題ﾊﾟｯｸは、全員同一ｺｰｽでのご利用を原則といたしますが、運転手、妊婦、未成年、お酒が飲めないお客様については人数対象外とします。<br><br>
※ ﾌﾛｰﾄ各種は対象外となります。<br><br>
※ 一部店舗では内容が異なります。<br><br>
※ ﾄﾞﾘﾝｸﾊﾞｰ店舗は、ｶｳﾝﾀｰよりご自由にお取り願います。<br><br>
※ 終了15分前にﾗｽﾄｵｰﾀﾞｰをお伺いします。<br><br>
</font>

<br>
<hr>
<a name="c" id="c"><font color="#000080">【注意事項】</font></a><br>
<br>
<font size="-1">
※ 年齢による金額設定がございますので、申告をお願い致します。<br><br>
※ 10%、20%OFF、500円、1000円割引き、その他割引券との併用は出来ません。<br><br>
※ ラストオーダーは1品目提供から80分後とさせていただきます。<br><br>
※ 食べ残し1品につき500円(税抜)の追加料金を頂戴することがございます。<br><br>
※ 追加のご注文は時間内に食べきれる量でお願いします。<br><br>
※ ご注文は人数分とさせていただきます。<br><br>
※ 一部お取り扱いしていない店舗もございます。<br><br>
※ お車を運転される方、および20歳未満のお客様へのｱﾙｺｰﾙ販売はお断りいたします。<br><br>
※ 食べ残し、お土産など持ち帰り一切禁止とさせていただきます。<br><br>
※ お時間の延長30分につき、500円(税抜)にて承ります。<br><br>
※ 当日10名様以上の場合、ご注文は事前のご予約をお願いいたします。<br><br>
</font>
<?php
// Google Analyticsのトラッキングコード PHP版
// </body>の直前に書くこと
  $googleAnalyticsImageUrl = googleAnalyticsGetImageUrl();
  echo '<img src="' . $googleAnalyticsImageUrl . '" />';
?>
</div>
<nav id="menu">
</nav>
<script src="js/menu.js"></script>

</body>
</html>
