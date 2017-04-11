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
	<br />
		<table width="100%" border="0" cellpadding="0" cellspacing="0">
		<tr>
			<td align="center">
				<br />
				<b>≪【安楽亭　渋谷道玄坂店】業態変更および改装による休業のおしらせ≫</b><br />
				<br />
				<br />
				いつも「安楽亭　渋谷道玄坂店」をご利用いただき、
				誠にありがとうございます。<br />
				<br />
				「安楽亭　渋谷道玄坂店」は、
				来たる2016年10月12日（水）より、
				新業態『ANRAKUTEI　SHIBUYA　DOGENZAKA（アンラクテイ　シブヤ　ドウゲンザカ）』としてリニューアルいたします。
				新しい食べ方“炭火×鉄板”メニューを始め、
				こだわりの新商品に加え、
				従来の炭火焼肉もお楽しみいただけます。
				メニューや空間構成も一新し、
				今まで以上にお客様に満足いただける飲食店として新たに皆様をお迎えいたします。<br />
				<br />
				リニューアルに伴い、改装のため下記日程にて休業させていただきます。<br />
				<br />
				【店休期間】2016年9月20日（火）～10/11日（火）<br />
				【営業再開】2016年10月12日（水）11:00～<br />
				<br />
				皆様にはご迷惑をおかけしますが、何卒ご理解のほどよろしくお願い申し上げます。<br />
			</td>
		</tr>
		</table>
            <hr>
</div>
<br>
<a href="../index.html">戻る</a>
<?php
// Google Analyticsのトラッキングコード PHP版
// </body>の直前に書くこと
  $googleAnalyticsImageUrl = googleAnalyticsGetImageUrl();
  echo '<img src="' . $googleAnalyticsImageUrl . '" />';
?>
</body>
</html>
