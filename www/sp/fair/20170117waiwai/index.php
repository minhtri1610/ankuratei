<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
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
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<meta id="viewport" name="viewport" content="width=320; initial-scale=1.0; maximum-scale=2.0; user-scalable=1;" />
	<title>◆焼肉 安楽亭スマートフォンサイト</title>
<body style='background-color: rgb(255,255,255);'>
<div id="content" style="position: relative;">
<table border=0 cellpadding="0px" cellspacing="0px">
<tr><td>
	<div id="content" style="position: relative;">
	<a href="../../coupon.php"><img src="./page1.jpg" align="absbottom" width = "100%"></a>
</td></tr>
</div>
</table>
<br />
<br />
<p>★【冬のわいわい宝くじ】当選番号発表！★</p>
<br />
わいわいナンバー一致で賞品GET!! <br />
ご注文の際にお手持ちの｢わいわい宝くじ｣をスタッフにお渡しください。 <br />
引換え期間は2017年1月17日（火）～3月24日（金）です。<br />
<br />
当選番号はこちら！<br />
*******************<br />
<br />
【特賞】　黒毛和牛プレミアムビッグ<br />
下3ケタ<br />
394<br />
<br />
【1等】　黒毛和牛特選ロースステーキ<br />
下2ケタ<br />
51<br />
<br />
【2等】　厚切り上ハラミ<br />
下2ケタ<br />
32、75<br />
<br />
【3等】　焼きすきカルビ or 焼きしゃぶカルビ<br />
下1ケタ<br />
6<br />
<br />
【4等】　サンチュ<br />
下1ケタ<br />
3、8<br />
<br />
【ハズレ】 ミニいちご杏仁またはミニバニラアイス<br />
⇒上記以外の番号全て<br />
<br />
≪「冬のわいわい宝くじ」ご利用時のご注意点≫<br />
●わいわいナンバーと当選番号が一致した商品を1品無料でご提供いたします。ご注文時に本券をスタッフにお渡しください。<br />
●本券は無料サービス券を除く他サービス券との併用が可能ですが、賞品引換えはご来店1回でお1人様1枚までとなります。<br />
●下北あんらく亭、国産牛カルビ本舗浦和大谷口店、福島エリアではご利用いただけません。<br />
●引き換え期限が過ぎたもの、コピーされたものは無効となります。<br />
●本券は現金との交換はできません。<br />
●本券のみ、または、各種無料特典と本券のみではご利用いただけません。<br />
●店舗によって当選された賞品をお取り扱いしていない場合がございます。その場合は代替商品をご提案させて頂きます。<br />
<br />
</div>
<br>
<a href="../../index.html">戻る</a>
<?php
// Google Analyticsのトラッキングコード PHP版
// </body>の直前に書くこと
  $googleAnalyticsImageUrl = googleAnalyticsGetImageUrl();
  echo '<img src="' . $googleAnalyticsImageUrl . '" />';
?>
</body>
</html>
