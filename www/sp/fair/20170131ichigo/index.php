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
<p>☆★香り豊かないちごで美味しいひと時を　フレッシュいちごフェア☆★<br />
  <br />
安楽亭では1月31日（火）から【フレッシュいちごフェア】を開催いたします。<br />
みずみずしさと甘酸っぱさが凝縮された新鮮ないちごを使用。春の風味をお楽しみください。
<br />
<br />
【フレッシュいちごとなめらか杏仁のパフェ】　590円<br />
新鮮ないちごをたっぷりと使用しました。<br />
いちごと杏仁豆腐とバニラアイスの極上のハーモニーをお楽しみください。<br />
<br />
【甘さすっきり！フレッシュいちご杏仁】　290円<br />
とろける杏仁豆腐に新鮮ないちごと果肉感たっぷりのソースをのせた甘さ控えめのデザート。<br />
<br />
≪フレッシュいちごフェアのご注意点≫<br />
・最初のご注文が22時以降のお客様には、深夜料金として10%と加算させて頂きます。<br />
・盛付け、付け合わせが変わる場合がございます。<br />
・一部メニューが異なる店舗があり、ご利用いただけない場合がございます。ご利用予定の各店舗へお問い合わせ下さい。
<br />
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
</p>
</body>
</html>
