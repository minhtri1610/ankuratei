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
$table2 = ($prev==1) ? "Ｗ先輩メッセージ"	: "先輩メッセージ";
$table3 = ($prev==1) ? "Ｗ先輩画像情報"		: "先輩画像情報";
$table4 = ($prev==1) ? "ＷＭ職種区分マスタ"	: "Ｍ職種区分マスタ";

$sql=<<<END
select
	m2.職種区分		as kbn,
	m3.職種区分名	as kbnnm,
	m.質問１		as q1,
	m.質問２		as q2,
	m.質問３		as q3,
	m.質問４		as q4,
	m.質問５		as q5,
	m.本文１		as txt1,
	m.本文２		as txt2,
	m.本文３		as txt3,
	m.本文４		as txt4,
	m.本文５		as txt5,
	m2.職種名		as syokusyunm,
	m2.概要			as gaiyou,
	t.ファイル名	as imagenm,
	t.サイズ		as imagesize,
	t.横サイズ		as imagewidth,
	m.名前			as senpainm,
	m.所属部署		as syozoku,
	m.担当業務		as gyoumu,
	m.仕事内容		as sigoto
from
	employ.$table2 as m
	inner join
		employ.$table1 as m2
	on
		m2.職種ＩＤ = m.職種ＩＤ and
		m2.停止フラグ is false
	inner join
		employ.$table4 as m3
	on
		m3.職種区分 = m2.職種区分
	left join
		employ.$table3 as t
	on
		t.職種ＩＤ = m.職種ＩＤ and
		t.媒体ＩＤ = m.媒体ＩＤ
where
	m.職種ＩＤ = $cd and m.媒体ＩＤ = 2
END;
$ret = pg_query($conn, $sql);
if($row = pg_fetch_array($ret)){
	
	$kbn		= $row['kbn'];
	$kbnnm		= original_convert($row['kbnnm']);
	$q1			= original_convert($row['q1']);
	$q2			= original_convert($row['q2']);
	$q3			= original_convert($row['q3']);
	$q4			= original_convert($row['q4']);
	$q5			= original_convert($row['q5']);
	$txt1		= original_convert($row['txt1']);
	$txt2		= original_convert($row['txt2']);
	$txt3		= original_convert($row['txt3']);
	$txt4		= original_convert($row['txt4']);
	$txt5		= original_convert($row['txt5']);
	$syokusyunm	= original_convert($row['syokusyunm']);
	$gaiyou		= original_convert($row['gaiyou']);
	$imagenm	= original_convert($row['imagenm']);
	$imagesize	= $row['imagesize'];
	$imagewidth = $row['imagewidth'];
	$senpainm	= original_convert($row['senpainm']);
	$syozoku	= original_convert($row['syozoku']);
	$gyoumu		= original_convert($row['gyoumu']);
	$sigoto		= original_convert($row['sigoto']);
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
	<title>安楽亭 正社員採用情報</title>
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
</head>
<body style='background-color: rgb(255,255,255);'>
<!-- topPageHeader -->
<div id="contentsWrap">

<header id="topPageHeader" style='color:#666666; background-color: rgb(255,255,255);'>
<h1><a href="../index.html"><img src="../images/anrakulogo_head.jpg" alt="トップページへ" width="60" height="34" /></a>正社員採用情報</h1>
<p class="menuBtn"><a href="javascript:void(0)" onclick="slideUpMenu();">メニュー一覧</a></p>
</header>

<table width="100%"><tr><td bgcolor="#aaaaff" align="center">
<?=$kbnnm?><br /><?=$syokusyunm?>
</td></tr></table>
<font size="-1" color="orangered">■先輩スタッフインタビュー</font><br />
<div align="right"><font size="-1"><a href="./youkou.php?cd=<?=$cd?><?=$prev_param2?>">&lt;&lt;募集要項に戻る</a></font></div>
<br />
<?
if($imagenm!=''){
	if($imagewidth > 300) $buf = "style=\"width:300px;\"";
?>
<div align="center">
<img src="./image.php?cd=<?=$cd?>&amp;no=2&amp;sp=1<?=$prev_param2?>" <?=$buf?> /><br />
</div>
<? } ?>
<div align="center">
<table border="1" width="100%">
<tr><td width="60px" bgcolor="#dddddd"><font size="-1">名前</font></td><td><font size="-1"><?=$senpainm?></font></td></tr>
<tr><td bgcolor="#dddddd"><font size="-1">所属部署</font></td><td><font size="-1"><?=$syozoku?></font></td></tr>
<tr><td bgcolor="#dddddd"><font size="-1">担当業務</font></td><td><font size="-1"><?=$gyoumu?></font></td></tr>
<tr><td bgcolor="#dddddd"><font size="-1">仕事内容</font></td><td><font size="-1"><?=$sigoto?></font></td></tr>
</table>
</div>
<br />
<img src="./images/imgSenkoLine.gif" style="height:10px;width:100%;" /><br />
<img src="./images/interview.jpg" style="height:20px;" />
<img src="./images/imgSenkoLine.gif" style="height:10px;width:100%;vertical-align:top;" /><br />

<table width="100%">
<tr bgcolor="#ccffcc">
	<td width="20px"></td>
	<td></td>
</tr>
<? if($q1!="" && $txt1!=""){ ?>
<tr bgcolor="#ccffcc">
	<td valign="top" width="20px"><img src="./images/q.jpg"></td>
	<td valign="top"><font size="-1"><?=$q1?></font></td>
</tr>
<tr>
	<td valign="top"><img src="./images/a.jpg"></td>
	<td valign="top"><font size="-1"><?=$txt1?></font><br /><br /></td>
</tr>
<? } ?>
<? if($q2!="" && $txt2!=""){ ?>
<tr bgcolor="#ccffcc">
	<td valign="top" width="20px"><img src="./images/q.jpg"></td>
	<td valign="top"><font size="-1"><?=$q2?></font></td>
</tr>
<tr>
	<td valign="top"><img src="./images/a.jpg"></td>
	<td valign="top"><font size="-1"><?=$txt2?></font><br /><br /></td>
</tr>
<? } ?>
<? if($q3!="" && $txt3!=""){ ?>
<tr bgcolor="#ccffcc">
	<td valign="top" width="20px"><img src="./images/q.jpg"></td>
	<td valign="top"><font size="-1"><?=$q3?></font></td>
</tr>
<tr>
	<td valign="top"><img src="./images/a.jpg"></td>
	<td valign="top"><font size="-1"><?=$txt3?></font><br /><br /></td>
</tr>
<? } ?>
<? if($q4!="" && $txt4!=""){ ?>
<tr bgcolor="#ccffcc">
	<td valign="top" width="20px"><img src="./images/q.jpg"></td>
	<td valign="top"><font size="-1"><?=$q4?></font></td>
</tr>
<tr>
	<td valign="top"><img src="./images/a.jpg"></td>
	<td valign="top"><font size="-1"><?=$txt4?></font><br /><br /></td>
</tr>
<? } ?>
</table>
<img src="./images/imgSenkoLine.gif" style="height:10px;width:100%;" /><br />
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
