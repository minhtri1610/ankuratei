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
	<a href="../../coupon.php"><img src="./page.jpg" alt="【うれしい価格でおいしさ色々！メニューリニューアル！】
" width = "100%" align="absbottom"></a>
</td></tr>
</div>
</table>
<br />
<br />
<p>【うれしい価格でおいしさ色々！メニューリニューアル！】<br />
  <br />
ワンコイン焼肉ランチ復活！焼肉もおつまみもドリンクも大幅値下げ！<br />
ぜひこの機会にランチもディナーも美味しい焼肉をお楽しみください！

<br />
<br />
＼ワンコイン焼肉ランチ復活／<br />
☆★☆★☆★☆★☆★☆★<br />
大人気の焼肉ランチセットが税込500円で楽しめるように！<br />
お肉は「ファミリーカルビ」と「豚カルビ」の2種類から選べて、ライスとスープ、キムチorミニサラダ付きのとってもお得なセットです！<br />
また、焼肉屋のこだわりが詰まった「味わい牛丼」も税込500円でご用意しております！<br />
<br />
＼焼肉大皿　大幅値下げ／<br />
☆★☆★☆★☆★☆★☆★<br />
安楽亭で人気の牛肉三種の大皿「牛・牛トリオ400」が破格の2,480円（税抜）に！<br />
さらに、ボリューム満点で一番人気大皿の「元気盛り500」も2,780円（税抜）とお値段頑張ってます！<br />
<br />
他にも牛タンや牛ホルモンなど焼肉アイテムはもちろん、おつまみやドリンクも大幅値下げ！<br />
美味しい焼肉がいっぱい食べられる安楽亭へぜひこの機会にお越しください！<br />
<br />
☆★☆★☆★☆★☆★☆★
<br />
≪ご注意≫<br />
※五反田店、下北あんらく亭、ANRAKUTEI SHIBUYA DOUGENZAKA店、福島エリア、国産牛カルビ本舗浦和大谷口店では500円ランチは取り扱っておりません。<br />
※店舗によってはお取り扱いのない商品がございます。詳しくは店舗までお問い合わせください。

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
