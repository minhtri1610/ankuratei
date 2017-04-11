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
<p>
☆★☆　2929（にくにく）クーポン　期間延長　☆★☆<br />
<br />
肉年肉の日を記念して発行したクーポンのご利用枚数が３００００枚を突破しました！<br />
ご利用いただいたお客様に感謝の気持ちを込めて、もう３月ですが２９２９クーポンの期間を延長しちゃいます！<br />
人気アイテムが特別価格290円で楽しめるクーポンや食べ放題10％OFFクーポン、ランチタイム特典など盛り沢山！<br />
<br />
※各クーポンをご利用の際は、下部に記載の「ご利用上の注意」をご確認ください。
<br />
<br />
＼人気メニューが290円♪／<br />
☆★☆★☆★☆★☆★☆<br />
◎安楽亭人気No.1！<br />
『ファミリーカルビ』（通常480円）<br />　→　クーポン価格　290円<br />
<br />
◎さっぱりとした味わい♪<br />
『ファミリーロース』（通常480円）<br />　→　クーポン価格　290円<br />
<br />
◎旨みと鮮度にこだわりアリ！<br />
『牛ホルモン』（通常480円）<br />　→　クーポン価格　290円<br />
<br />
◎ジューシーさがたまらない♪<br />
『豚カルビ』（通常390円）<br />　→　クーポン価格　290円<br />
<br />
◎プリプリのやわらかさ！<br />
『鶏もも』（通常390円）<br />　→　クーポン価格　290円<br />
<br />
◎おつまみに最高♪<br />
『牛タンから揚げ』（通常390円）<br />　→　クーポン価格　290円<br />
<br />
※ご利用条件は「290円クーポンご利用上の注意」をご確認ください。

<br />
<br />

＼食べ放題コース10％OFF／<br />
☆★☆★☆★☆★☆★☆<br />
ご注文時にこちらの画面をご提示いただくと、焼肉食べ放題各コースが10%OFFに！<br />
お席でゆっくりご注文できて、40品目のメニューが楽しめる大人気の『お手軽バリューコース』は2,232円でご利用いただけます！<br />
※ご利用条件は「食べ放題10％OFFクーポンご利用上の注意」をご確認ください。
<br />
<br />
＼ランチタイム特典♪／<br />
☆★☆★☆★☆★☆★☆<br />
17時までにご来店いただき、こちらの画面をご提示いただいたお客様に<br />
『ライスお替りし放題』もしくは『ドリンクバー無料』のどちらか一つプレゼント！<br />
※ご利用条件は「ランチタイム特典のご利用上の注意」をご確認ください。
<br />
<br />
安楽亭の美味しい焼肉で最高の肉時間を過ごしましょう♪<br />
<br />
☆★☆★☆★☆★☆★☆★<br />
<br />
店舗によってはメニューが異なるため、ご利用いただけないクーポンがございます。<br />
ご利用予定の各店舗へお問い合わせ下さい。価格は全て税抜価格です。 <br />
<br />
≪290円クーポンご利用上の注意≫<br />
クーポンのご利用は他のクーポン類と併せて、1回のご来店につきお一人様2回までとさせていただきます。<br />
クーポンはご注文の際にお出しください。他の割引券、サービス券との併用はできません。 <br />
<br />
≪食べ放題10％OFFクーポンご利用上の注意≫<br />
ご注文時にクーポン券を従業員にご提示ください。<br />
クーポンのご利用は他のクーポン類と併せて、1回のご来店につきお一人様2回までとなります。<br />
他の割引券、サービス券との併用はできません。<br />
こちらのクーポンは安楽亭の店舗のみで有効です。<br />
ただし、福島エリア各店、和牛カルビ屋（東大宮店）、国産牛カルビ本舗（浦和大谷口店）ではご利用いただけません。渋谷道玄坂店の「王道コース」、「dogenzakaコース」、下北あんらく亭の「満足コース」、「スペシャルコース」、「ゴージャスコース」も10%OFFとなります。一部店舗で提供しております「ランチ食べ放題」、「学生限定食べ放題」は対象外となります。<br />
<br />
≪ランチタイム特典のご利用上の注意≫<br />
ご注文時にこちらの画面を従業員にご提示ください。<br />
本特典は他のクーポン、割引券、サービス券、宴会ご予約特典との併用はできません。<br />
また、ご利用は1回のご来店につきお一人様１回までとなります。<br />
本特典のご利用はランチタイム（開店から17時まで）限定となります。<br />
本特典を利用してのライスのお替りとドリンクバーのご利用は18時までとさせていただきます。<br />
ライスのお替りは空いた器と交換でご提供させていただきます。<br />
本特典のみでのご飲食はできません。<br />
本特典は安楽亭の店舗のみで有効です。<br />
ただし、福島エリア各店、和牛カルビ屋（東大宮店）、国産牛カルビ本舗（浦和大谷口店）ではご利用できません。ドリンクバー設備のない店舗では「ドリンクバー無料」のサービスはお選びいただけません。 <br />

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
