<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
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
<html lang="ja">
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<meta id="viewport" name="viewport" content="width=320; initial-scale=1.0; maximum-scale=2.0; user-scalable=1;" />
	<title>安楽亭 お値打ち黒毛和牛</title>
	<link rel="stylesheet" href="css/top2011.css" />
	<link rel="stylesheet" href="css/common2011.css" />
<script type="application/javascript">
<!--//
var listidx = 23;
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
<h1><a href="index.html"><img src="images/anrakulogo_head.jpg" alt="トップページへ" width="60" height="34"></a>お値打ち黒毛和牛</h1>
<p class="menuBtn"><a href="javascript:void(0)" onclick="slideUpMenu();">メニュー一覧</a></p>
</header>
<br>
安楽亭ｸﾞﾙｰﾌﾟの総力を集結して、正真正銘の黒毛和牛をお値打ち価格でご提供！
販売店舗を拡大中です！<br>
<font size="-1"><a href="./lists.php?o=1">お値打ち黒毛和牛実施店はこちら</a></font><br>
<br>
<font color="#ff00ff">
正真正銘の黒毛和牛が780円から！<br>
</font>
<br>
<font size="-1" color="#008080">
※一部店舗では商品価格が異なります。ご了承ください<br>
</font>
</font>
<br>

ﾌﾟﾛの加工技術が和牛のおいしさを活かしきります。安全安心な黒毛和牛を心ゆくまでご堪能ください。<br>
<br>
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
