<?
mb_internal_encoding('UTF-8');

require_once('../../common.inc');
require_once('./func_sp.php');

// プレビューモード
$cd   = $_REQUEST['cd'];
$prev = $_REQUEST['prev'];

// DB接続
$conn = @pg_connect("host=".DB_HOST." dbname=".DB_NAME." user=".DB_USER." password=".DB_PASS);
if($conn == false){
	exit;
}

$table1 = ($prev==1) ? "ＷＭ募集職種マスタ"	: "Ｍ募集職種マスタ";
$table2 = ($prev==1) ? "ＷＭ募集要項マスタ"	: "Ｍ募集要項マスタ";
$table3 = ($prev==1) ? "Ｗ画像情報"			: "画像情報";
$table4 = ($prev==1) ? "Ｗ先輩メッセージ"	: "先輩メッセージ";
$table5 = ($prev==1) ? "ＷＭ職種区分マスタ"	: "Ｍ職種区分マスタ";

$sql=<<<END
select
	m2.職種区分		as kbn,
	m3.職種区分名	as kbnnm,
	m.本文			as body,
	m.給与			as txt1,
	m.勤務地		as txt2,
	m.勤務時間		as txt3,
	m.休日休暇		as txt4,
	m.手当			as txt5,
	m.保険			as txt6,
	m.昇給			as txt7,
	m.賞与			as txt8,
	m.福利厚生		as txt9,
	m.募集学科		as txt10,
	m.採用人数		as txt11,
	m2.職種名		as syokusyunm,
	m2.概要			as gaiyou,
	t.ファイル名	as imagenm,
	t.サイズ		as imagesize,
	t.横サイズ		as imagewidth,
	t2.名前			as senpainm
from
	employ.$table2 as m
	inner join
		employ.$table1 as m2
	on
		m2.職種ＩＤ = m.職種ＩＤ and
		m2.停止フラグ is false
	inner join
		employ.$table5 as m3
	on
		m3.職種区分 = m2.職種区分
	left join
		employ.$table3 as t
	on
		t.職種ＩＤ = m.職種ＩＤ and
		t.媒体ＩＤ = m.媒体ＩＤ
	left join
		employ.$table4 as t2
	on
		t2.職種ＩＤ = m.職種ＩＤ and
		t2.媒体ＩＤ = m.媒体ＩＤ
where
	m.職種ＩＤ = $cd and m.媒体ＩＤ = 2
END;
$ret = pg_query($conn, $sql);
if($row = pg_fetch_array($ret)){
	$kbn		= $row['kbn'];
	$kbnnm		= original_convert($row['kbnnm']);
	$body		= original_convert($row['body']);
	$txt1		= original_convert($row['txt1']);
	$txt2		= original_convert($row['txt2']);
	$txt3		= original_convert($row['txt3']);
	$txt4		= original_convert($row['txt4']);
	$txt5		= original_convert($row['txt5']);
	$txt6		= original_convert($row['txt6']);
	$txt7		= original_convert($row['txt7']);
	$txt8		= original_convert($row['txt8']);
	$txt9		= original_convert($row['txt9']);
	$txt10		= original_convert($row['txt10']);
	$txt11		= original_convert($row['txt11']);
	$syokusyunm	= original_convert($row['syokusyunm']);
	$gaiyou		= original_convert($row['gaiyou']);
	$imagenm	= original_convert($row['imagenm']);
	$imagesize	= $row['imagesize'];
	$imagewidth = $row['imagewidth'];
	$senpainm	= original_convert($row['senpainm']);
}

if($prev==1){
	$prev_param2 = "&amp;prev=1";
	$prev_param1 = "?prev=1";
}

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta id="viewport" name="viewport" content="width=320; initial-scale=1.0; maximum-scale=2.0; user-scalable=1;" />
	<title>安楽亭採用情報 <?=$syokusyunm?></title>
	<link rel="stylesheet" href="../css/top2011.css" />
	<link rel="stylesheet" href="../css/common2011.css" />
	<link rel="stylesheet" href="./employ.css" />
<script type="application/javascript">
<!--//
var listidx = 88;
//-->
</script>
	<script type="text/javascript" src="../js/jquery-1.5.2.min.js"></script>
	<script type="text/javascript" src="../js/gears_init.js"></script>
	<script type="text/javascript" src="../js/common.js"></script>
	<script type="text/javascript" src="../js/top.js"></script>
<!-- Place this tag after the last +1 button tag. -->
<script type="text/javascript">
  window.___gcfg = {lang: 'ja'};

  (function() {
    var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
    po.src = 'https://apis.google.com/js/plusone.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
  })();
</script>
</head>
<body style='background-color: rgb(255,255,255);'>
<div id="fb-root"></div>
<script>
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/ja_JP/all.js#xfbml=1";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
</script>
<!-- topPageHeader -->
<div id="contentsWrap">

<header id="topPageHeader" style='color:#666666; background-color: rgb(255,255,255);'>
<h1><a href="../index.html"><img src="../images/anrakulogo_head.jpg" alt="トップページへ" width="60" height="34" /></a>正社員採用情報</h1>
<p class="menuBtn"><a href="javascript:void(0)" onclick="slideUpMenu();">メニュー一覧</a></p>
</header>
<div style="text-align:center;">
<table style="margin-left:auto;margin-right:auto;"><tr>
<td>
            <a href="https://twitter.com/share" class="twitter-share-button" data-lang="ja" >ツイート</a>
            <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>
</td><td>
            <div class="fb-like" data-send="false" data-layout="button_count" data-width="150" data-show-faces="true"></div>
</td><td>&nbsp;&nbsp;
            <!-- Place this tag where you want the +1 button to render. -->
            <g:plusone size="medium"></g:plusone>
</td></tr></table>
</div>
<table width="100%"><tr><td bgcolor="#aaaaff" align="center">
<?=$kbnnm?><br /><?=$syokusyunm?><br />
</td></tr></table>
<font size="-1"><?=$gaiyou?></font><br />
<?
if($senpainm!=''){
?>
<div align="right"><font size="-1"><a href="./senpai.php?cd=<?=$cd?><?=$prev_param2?>">&gt;&gt;先輩スタッフインタビュー</a></font></div>
<?
}
?>
<br />
<?
if($imagenm!=''){
	if($imagewidth > 300) $buf = "style=\"width:300px;\"";
?>
<div align="center">
<img src="./image.php?cd=<?=$cd?>&amp;no=2<?=$prev_param2?>" <?=$buf?> /><br />
</div>
<br />
<? } ?>
<table width="100%"><tr><td bgcolor="#aaaacc">募集要項</td></tr></table>
<font size="-1">
<?= $body?>
</font><br />
<br />
<font size="3">■待遇</font><br />
<table border="1">
<? if($txt1!=''){ ?>
<tr><td width="50px"><font size="-1">給与</font></td><td><font size="-1"><?=$txt1?></font></td></tr>
<? } ?>
<? if($txt2!=''){ ?>
<tr><td nowrap><font size="-1">勤務地</font></td><td><font size="-1"><?=$txt2?></font></td></tr>
<? } ?>
<? if($txt3!=''){ ?>
<tr><td nowrap><font size="-1">勤務時間</font></td><td><font size="-1"><?=$txt3?></font></td></tr>
<? } ?>
<? if($txt4!=''){ ?>
<tr><td nowrap><font size="-1">休日休暇</font></td><td><font size="-1"><?=$txt4?></font></td></tr>
<? } ?>
<? if($txt5!=''){ ?>
<tr><td nowrap><font size="-1">手当</font></td><td><font size="-1"><?=$txt5?></font></td></tr>
<? } ?>
<? if($txt6!=''){ ?>
<tr><td nowrap><font size="-1">保険</font></td><td><font size="-1"><?=$txt6?></font></td></tr>
<? } ?>
<? if($txt7!=''){ ?>
<tr><td nowrap><font size="-1">昇給</font></td><td><font size="-1"><?=$txt7?></font></td></tr>
<? } ?>
<? if($txt8!=''){ ?>
<tr><td nowrap><font size="-1">賞与</font></td><td><font size="-1"><?=$txt8?></font></td></tr>
<? } ?>
<? if($txt9!=''){ ?>
<tr><td nowrap><font size="-1">福利厚生</font></td><td><font size="-1"><?=$txt9?></font></td></tr>
<? } ?>
<? if($txt10!=''){ ?>
<tr><td nowrap><font size="-1">募集学科</font></td><td><font size="-1"><?=$txt10?></font></td></tr>
<? } ?>
<? if($txt11!=''){ ?>
<tr><td nowrap><font size="-1">採用人数</font></td><td><font size="-1"><?=$txt11?></font></td></tr>
<? } ?>
</table>
<br />
<div align="center">
<?
if($prev==1){
	$url = SSL_MIRROR . "/employ/entry/sp_entry.php";
}else{
	$url = SSL_HONBAN . "/employ/entry/sp_entry.php";
}
?>
<form name="frm" method="post" action="<?= $url ?>">
<input type="hidden" name="cd" value="<?= $cd ?>">
<input type="submit" value="エントリーする！">
</form>
</div>
<br />
<div style="text-align:center;">
<table style="margin-left:auto;margin-right:auto;"><tr>
<td>
            <a href="https://twitter.com/share" class="twitter-share-button" data-lang="ja" >ツイート</a>
            <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>
</td><td>
            <div class="fb-like" data-send="false" data-layout="button_count" data-width="150" data-show-faces="true"></div>
</td><td>&nbsp;&nbsp;
            <!-- Place this tag where you want the +1 button to render. -->
            <g:plusone size="medium"></g:plusone>
</td></tr></table>
</div>
<br />
<div align="right">
<font size="-1"><a href="./<?=$prev_param1?>">戻る</a></font><br />
<font size="-1"><a href="http://anrakutei.jp">トップページへ</a></font>
</div>
<br />
</div>
<nav id="menu">
</nav>
<script src="../js/menu.js"></script>
</body>
</html>
