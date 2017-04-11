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
	<title>安楽亭焼肉宴会コース</title>
	<link rel="stylesheet" href="css/top2011.css" />
	<link rel="stylesheet" href="css/common2011.css" />
<script type="application/javascript">
<!--//
var listidx = 22;
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
<h1><a href="index.html"><img src="images/anrakulogo_head.jpg" alt="トップページへ" width="60" height="34"></a>安楽亭焼肉宴会コース</h1>
<p class="menuBtn"><a href="javascript:void(0)" onclick="slideUpMenu();">メニュー一覧</a></p>
</header>
<br>
<table border=0 cellpadding="0px" cellspacing="0px">
  <tr>
    <td><div id="content" style="position: relative;">
      <img src="./img/enkai20161109.jpg" align="absbottom" width = "100%"></td>
  </tr>
    </div>
  
</table>
<br>

<a href="#1" accesskey="1">和牛たっぷり！プレミアムコース</a><br>
<a href="#2" accesskey="2">味わい満足コース</a><br>
<a href="#3" accesskey="3">まんぷく得々コース</a><br>
<a href="#4" accesskey="4">女子会専用コース</a><br>

※<a href="tabehoudai.php">食べ放題コース</a>&nbsp;<font size="-1">別ﾍﾟｰｼﾞへ遷移</font><br>

<br>

<a href="#9" accesskey="9">飲み放題パック</a><br>
<a href="#c" accesskey="#">注意事項</a><br>

<hr>
<a name="1" id="1"><font color="red">◆和牛たっぷり！プレミアムコース</font></a><br>
<font color="#ff00ff">
おすすめNo.1！ゴージャス宴会なら断然コレ！！<br>
</font>
<font color="#008080">
全14品&nbsp;3,980円(税抜)<br>
☆ｼﾝﾌﾟﾙﾊﾟｯｸ&nbsp;4,960円(税抜)<br>
☆生ﾋﾞｰﾙﾊﾟｯｸ&nbsp;5,460円(税抜)<br>
</font>
<br>
<font size="-1">
・上タン塩<br>
・黒毛和牛カルビ<br>
・黒毛和牛ロース<br>
・牛ハラミ<br>
・牛ホルモン<br>
・国産鶏もも<br>
・ポークソーセージ<br>
・キムチ<br>
・オイキムチ<br>
・ナムル盛合せ<br>
・サンチュ<br>
・シーザーサラダ<br>
・ライス<br>
・バニラアイス<br>
<br>
お一人様あたりのお肉<br>
約275g<br>
</font>
<hr>
<a name="2" id="2"><font color="red">◆味わい満足コース</font></a><br>
<font color="#ff00ff">
和牛カルビ、上タン塩など、人気メニューが勢揃い！<br>
</font>
<font color="#008080">
全14品&nbsp;2,780円(税抜)<br>
☆ｼﾝﾌﾟﾙﾊﾟｯｸ&nbsp;3,760円(税抜)<br>
☆生ﾋﾞｰﾙﾊﾟｯｸ&nbsp;4,260円(税抜)<br>
</font>
<br>
<font size="-1">
・上タン塩<br>
・黒毛和牛カルビ<br>
・ファミリーロース<br>
・中落ちカルビ<br>
・牛ハラミ<br>
・豚とんとろ<br>
・牛ホルモン<br>
・ポークソーセージ<br>
・シーザーサラダ<br>
・キムチ<br>
・オイキムチ<br>
・韓国風冷奴<br>
・ライス<br>
・バニラアイス<br>
<br>
お一人様あたりのお肉<br>
約240g<br>
</font>
<hr>
<a name="3" id="3"><font color="red">◆まんぷく得々コース</font></a><br>
<font color="#ff00ff">
お肉増量！納得のシンプルコース！<br>
</font>
<font color="#008080">
全14品&nbsp;1,980円(税抜)<br>
☆ｼﾝﾌﾟﾙﾊﾟｯｸ&nbsp;2,960円(税抜)<br>
☆生ﾋﾞｰﾙﾊﾟｯｸ&nbsp;3,460円(税抜)<br>
</font>
<br>
<font size="-1">
・牛タン<br>
・ファミリーカルビ<br>
・ファミリーロース<br>
・豚カルビ<br>
・豚とんとろ<br>
・鶏もも<br>
・牛ホルモン<br>
・牛レバー<br>
・ポークソーセージ<br>
・シーザーサラダ<br>
・キムチ<br>
・ナムル盛り合せ<br>
・ライス（大盛り無料）<br>
・杏仁豆腐<br>
<br>
お一人様あたりのお肉<br>
さらに増量！約320g<br>
</font>
<hr>
<a name="4" id="4"><font color="red">◆女子会専用コース</font></a><br>
<font color="#ff00ff">
プチデザート食べ放題付き！<br>
</font>
<font color="#008080">
全17品&nbsp;2,480円(税抜)<br>
</font>
<br>
<font size="-1">

・牛タン<br>
・牛ハラミ<br>
・ファミリーカルビ<br>
・ファミリーロース<br>
・豚カルビ<br>
・鶏もも<br>
・海老の岩塩焼き<br>
・ナムル盛合せ<br>
・チョレギサラダ<br>
・サンチュ<br>
・トマトキムチ<br>
・デザート食べ放題<br>
　（いちごバニラ、チョコバニラ、バニラアイス、いちご杏仁、和風杏仁、杏仁豆腐）<br>
※デザート食べ放題は制限時間100分となります。<br>

<br>

お一人様あたりのお肉<br>

約240g<br>

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
・ﾊｲﾎﾞｰﾙ<br>
・ｻﾜｰ＆ｶｸﾃﾙ(生搾りは除く)<br>
・ﾉﾝｱﾙｺｰﾙ飲料<br>
・梅酒<br>
・日本酒(冷・燗)<br>
・ﾜｲﾝ(赤・白)<br>
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
※ 終了20分前にﾗｽﾄｵｰﾀﾞｰをお伺いします。<br><br>
</font>

<br>
<hr>
<a name="c" id="c"><font color="#000080">【注意事項】</font></a><br>
<br>
<font size="-1">
※ 各ｺｰｽともお一人様よりご利用可能ですが、ご予約状況または仕入状況により、お受けできない場合もございます。<br><br>
※ 全員、同一ｺｰｽでのご利用とさせていただきます。<br><br>
※ ご予約後、人数、時間などの変更またはキャンセルの場合は前日までにご連絡ください。<br><br>
※ ご予約は安楽亭ﾎｰﾑﾍﾟｰｼﾞからも行えます。<br><br>
※ 土日祝日の午後5時から9時までの間のご予約は直接店舗へご相談ください。<br><br>
※ 一部お取り扱いしていない店舗もございます。<br><br>
※ お車を運転される方、および20歳未満のお客様へのｱﾙｺｰﾙ販売はお断りいたします。<br><br>
※ 季節により料理の内容が一部変更になる場合がございます。<br><br>
※ 午後10時以降のお客様には深夜料金として10％加算させて頂きます。<br><br>
※ 商品ｸｰﾎﾟﾝ券はご利用可能ですが、会計値引き、割引券各種はご利用いただけません。<br>
<br>
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
