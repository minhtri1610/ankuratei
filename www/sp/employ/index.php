<?
mb_internal_encoding('UTF-8');

require_once('../../common.inc');

// プレビューモード
$prev = $_REQUEST['prev'];

// DB接続
$conn = @pg_connect("host=".DB_HOST." dbname=".DB_NAME." user=".DB_USER." password=".DB_PASS);
if($conn == false){
	exit;
}

$table1 = ($prev==1) ? "ＷＭ職種区分マスタ" : "Ｍ職種区分マスタ";
$table2 = ($prev==1) ? "ＷＭ募集職種マスタ" : "Ｍ募集職種マスタ";
$table3 = ($prev==1) ? "ＷＭ募集要項マスタ" : "Ｍ募集要項マスタ";

// 有効職種区分リスト
$sql=<<<END
select
	m.職種区分 as kbn,
	m.職種区分名 as kbnnm
from
	employ.$table1 as m
where
	exists(
		select
			a.*
		from
			employ.$table2 as a
			inner join
				employ.$table3 as b
			on
				b.職種ＩＤ = a.職種ＩＤ and
				b.媒体ＩＤ = 2 and
				b.本文 is not null and
				b.本文 != ''
		where
			a.職種区分 = m.職種区分 and
			a.停止フラグ is false
	)
order by
	m.表示順
END;
$result = pg_query($conn, $sql);
$f_new = $f_career = 0;
while($row = pg_fetch_array($result)){
	$kbn = $row['kbn'];
	$kbnnm = $row['kbnnm'];
	
	if($kbn=='00') $f_new		=1;
	if($kbn!='00') $f_career	=1;
	
	$kbnList[] = array($kbn, $kbnnm);
}

// 募集職種
$sql=<<<END
select
	m.職種区分 as kbn,
	m.職種ＩＤ as cd,
	m.職種名 as name
from
	employ.$table2 as m
	inner join
		employ.$table3 as m2
	on
		m2.職種ＩＤ = m.職種ＩＤ and
		m2.媒体ＩＤ = 2 and
		m2.本文 is not null and
		m2.本文 != ''
where
	m.停止フラグ is false
order by
	m.職種区分,
	m.配置番号
END;
$result = pg_query($conn, $sql);
while($row = pg_fetch_array($result)){
	$kbn = $row['kbn'];
	$cd = $row['cd'];
	$name = $row['name'];
	
	$syokusyuList[] = array($kbn, $cd, $name);
}

if($prev==1) $prev_param = "&amp;prev=1";

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta id="viewport" name="viewport" content="width=320; initial-scale=1.0; maximum-scale=2.0; user-scalable=1;" />
	<title>安楽亭 正社員採用情報</title>
	<link rel="stylesheet" href="../css/top2011.css" />
	<link rel="stylesheet" href="../css/common2011.css" />
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
<h1><a href="../index.html"><img src="../images/anrakulogo_head.jpg" alt="トップページへ" width="60" height="34"></a>正社員採用情報</h1>
<p class="menuBtn"><a href="javascript:void(0)" onclick="slideUpMenu();">メニュー一覧</a></p>
</header>


<br />

<table width="100%"><tr><td bgcolor="#66ff99">◇新卒採用</td></tr></table>
<? if($f_new!=1){ ?>
&nbsp;&nbsp;<font size="-1">現在募集しておりません</font><br />
<? }else{ ?>
<table width="100%">
<?
foreach($syokusyuList as $syokusyuR){
	if($syokusyuR[0]!='00') continue;
	
	echo "<tr><td width=\"10\"></td><td><font size=\"-1\"><a href=\"./youkou.php?cd=".$syokusyuR[1].$prev_param."\">○" . $syokusyuR[2] . "</a></font></td></tr>";
}
?>
</table>
<? } ?>
<br />
<table width="100%"><tr><td bgcolor="#aaaaff">◇キャリア採用(中途)</td></tr></table>
<? if($f_career!=1){ ?>
&nbsp;&nbsp;<font size="-1">現在募集しておりません</font><br />
<? }else{ ?>
<table width="100%">
<?
foreach($kbnList as $kbnR){
	if($kbnR[0]=='00') continue;
	
	echo "<tr><td width=\"10\"></td><td bgcolor=\"#ddddff\"><font size=\"-1\">" . $kbnR[1] . "</font>";
	
	if($kbnR[0]=='04' || $kbnR[0]=='05'){
		echo "<br /><font size=\"-1\">&nbsp;&nbsp;※安楽亭の100％子会社です。</font>";
	}
	echo "</td></tr>\n";
	
	foreach($syokusyuList as $syokusyuR){
		if($kbnR[0]==$syokusyuR[0]){
			echo "<tr><td></td><td><font size=\"-1\"><a href=\"./youkou.php?cd=".$syokusyuR[1].$prev_param."\">○" . $syokusyuR[2] . "</a></font></td></tr>\n";
		}
	}
}
?>
</table>
<? } ?>
<br />
<div align="right"><font size="-1"><a href="http://anrakutei.jp">トップページへ</a></font></div>
<br />
</div>
<nav id="menu">
</nav>
<script src="../js/menu.js"></script>
</body>
</html>
