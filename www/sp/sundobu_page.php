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
	<meta id="viewport" name="viewport" content="width=320; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;" />
	<title>◆焼肉 安楽亭スマートフォンサイト</title>
<body style='background-color: rgb(255,255,255);'>
<div id="content" style="position: relative;">
<table border=0 cellpadding="0px" cellspacing="0px">
<tr><td><img src="./img/sundobu_page.jpg" align="absbottom" width = "100%"></td></tr>
</table>
<br>
<hr>
</div>
<br>
 ※以下の店舗ではお取扱いをしておりません。<br>
福島エリア各店、新浦安、久喜吉羽、ふじみ野、館林北、渋谷道玄坂、新小岩
駅前、稲毛駅前店
<br>
<br>

<a href="index.html">戻る</a>
<?php
// Google Analyticsのトラッキングコード PHP版
// </body>の直前に書くこと
  $googleAnalyticsImageUrl = googleAnalyticsGetImageUrl();
  echo '<img src="' . $googleAnalyticsImageUrl . '" />';
?>
</body>
</html>