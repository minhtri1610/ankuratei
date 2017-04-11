<?
mb_internal_encoding('UTF-8');

require_once('../common.inc');

// 店舗検索組織
$kaisyacd = KAISYACD;

$spdir = "../flickslide";

$g		= $_REQUEST['g'];				// 業態
$lv		= $_REQUEST['lv'];				// 階層
$lv1	= mb_convert_encoding(urldecode($_REQUEST['lv1']),'UTF-8', 'auto');	// 都道府県
$lv2	= mb_convert_encoding(urldecode($_REQUEST['lv2']),'UTF-8', 'auto');	// 市区郡

$o		= $_REQUEST['o'];				// お値打ち黒毛和牛実施店

// DB接続
$conn = @pg_connect("host=".DB_HOST." dbname=".DB_NAME." user=".DB_USER." password=".DB_PASS);
if($conn == false){
	exit;
}

if($lv=='') $lv = 0;

$sql_where = '';
if($o=='1')		$sql_where = " and substr(m2.tm19kbn,1,1) = '1'";

// 都道府県リスト
if($g=='' && $lv==0){
	
$sql=<<<END
select
	ken
from
	(
		select
			substr(m2.postno,1,3) as postno,
			case
				when strpos(m2.address1,'東京都') = 1 then '東京都'
				else substr(m2.address1,1,strpos(m2.address1,'県'))
			end as ken
		from
			f_get_m_syozoku() as m
			inner join
				f_get_m_tenpo() as m2
			on
				m2.tenpocd = m.tenpocd and
				m2.tenpokbn07 not in ('5', '9') and
				(m2.kaitenbi is null or m2.kaitenbi <= current_date + 10) and
				m2.heitenbi is null
				$sql_where
		where
			m.kaisyacd = '$kaisyacd'
	) as v
group by
	v.ken
order by
	min(v.postno)
END;
	//$sql = mb_convert_encoding($sql, 'UTF-8', 'SJIS-win');
	$result = pg_query($conn,$sql);
	while($row = pg_fetch_array($result)){
		$lv1_list[] = $row['ken'];
	}
}

// 階層２（市町村区）
elseif($lv==1){
	
	$like_lv1 = $lv1."%";
	
$sql=<<<END
select
	v.sikugun
from
	(
		select
			substr(m2.postno,1,3) as postno,
			case
				-- 市がある場合
				when strpos(substr(m2.address1,length($1)+2),'市') >0 then
					substr(substr(m2.address1,length($2)+1), 1, strpos(substr(m2.address1,length($3)+2),'市')+1)
				-- 区がある場合
				when strpos(substr(m2.address1,length($4)+2),'区') >0 then
					substr(substr(m2.address1,length($5)+1), 1, strpos(substr(m2.address1,length($6)+2),'区')+1)
				-- 郡がある場合
				when strpos(substr(m2.address1,length($7)+2),'郡') >0 then
					substr(substr(m2.address1,length($8)+1), 1, strpos(substr(m2.address1,length($9)+2),'郡')+1)
			end as sikugun
		from
			f_get_m_syozoku() as m
			inner join
				f_get_m_tenpo() as m2
			on
				m2.tenpocd = m.tenpocd and
				m2.tenpokbn07 not in ('5', '9') and
				(m2.kaitenbi is null or m2.kaitenbi <= current_date + 10) and
				m2.heitenbi is null and
				m2.address1 like $10
				$sql_where
		where
			m.kaisyacd = '$kaisyacd'
	) as v
group by
	v.sikugun
order by
	min(v.postno)

END;
	//$result = pg_query($conn,$sql);
	$result = pg_query_params(
		$conn,
		$sql,
		array(
			$lv1,
			$lv1,
			$lv1,
			$lv1,
			$lv1,
			$lv1,
			$lv1,
			$lv1,
			$lv1,
			$like_lv1
		)
	);
	while($row = pg_fetch_array($result)){
		$lv2_list[] = $row['sikugun'];
	}
}

// 店舗検索（業態指定）
elseif($g!='' && $g!=1){
$sql=<<<END
select
	m2.*,
	-- 営業時間
	to_char(m2.egjknfrom,'HH24:MI')		as s_egjknfrom,
	to_char(m2.egjknto,'HH24:MI')		as s_egjknto,
	to_char(m2.egjknfrom2,'HH24:MI')	as s_egjknfrom2,
	to_char(m2.egjknto2,'HH24:MI')		as s_egjknto2,
	to_char(m2.idlefrom,'HH24:MI')		as s_idlefrom,
	to_char(m2.idleto,'HH24:MI')		as s_idleto,
	to_char(m2.idlefrom2,'HH24:MI')		as s_idlefrom2,
	to_char(m2.idleto2,'HH24:MI')		as s_idleto2,
	case
		when m2.kaitenbi > current_date then
			to_char(m2.kaitenbi,'YYYY/MM/DD')
		else
			null
	end as mikaiten
from
	f_get_m_syozoku() as m
	inner join
		f_get_m_tenpo() as m2
	on
		m2.tenpocd = m.tenpocd and
		m2.tenpokbn07 not in ('5', '9') and
		(m2.heitenbi is null or m2.heitenbi > current_date)
		$sql_where
	inner join
		m_gyotai as m3
	on
		m3.gyotaicd = m2.gyotaicd and
		($1 = '' or m3.gyotaicd = $2)
where
	m.kaisyacd = '$kaisyacd' and
	(m2.kaitenbi is null or m2.kaitenbi <= current_date + 7)
order by
	case
		-- リフレ,A2,V2,道玄坂は安楽亭と同じ表示順序
		when m2.gyotaicd in ('1900','2200','2700','2800') then '0000'
		else m2.gyotaicd
	end asc,
	m2.postno, m2.address1
END;
	$gyotai = mb_convert_encoding($g, 'UTF-8', 'SJIS-win');
	$result = pg_query_params(
		$conn,
		$sql,
		array( $gyotai, $gyotai )
	);
	while($row = pg_fetch_array($result)){
		$tenpo_list[] = $row;
	}
}

// 店舗検索（市区郡指定）
elseif($lv==2){
	
	$like_lv1 = $lv1."%";
	$like_lv2 = "%".$lv2."%";
	
$sql=<<<END
select
	m2.*,
	-- 営業時間
	to_char(m2.egjknfrom,'HH24:MI')		as s_egjknfrom,
	to_char(m2.egjknto,'HH24:MI')		as s_egjknto,
	to_char(m2.egjknfrom2,'HH24:MI')	as s_egjknfrom2,
	to_char(m2.egjknto2,'HH24:MI')		as s_egjknto2,
	to_char(m2.idlefrom,'HH24:MI')		as s_idlefrom,
	to_char(m2.idleto,'HH24:MI')		as s_idleto,
	to_char(m2.idlefrom2,'HH24:MI')		as s_idlefrom2,
	to_char(m2.idleto2,'HH24:MI')		as s_idleto2
from
	f_get_m_syozoku() as m
	inner join
		f_get_m_tenpo() as m2
	on
		m2.tenpocd = m.tenpocd and
		m2.tenpokbn07 not in ('5', '9') and
		(m2.kaitenbi is null or m2.kaitenbi <= current_date + 10) and
		m2.heitenbi is null and
		m2.address1 like $1 and
		m2.address1 like $2
		$sql_where
where
	m.kaisyacd = '$kaisyacd'
order by
	case
		-- リフレ,A2,V2,道玄坂は安楽亭と同じ表示順序
		when m2.gyotaicd in ('1900','2200','2700','2800') then '0000'
		else m2.gyotaicd
	end asc,
	m2.postno, m2.address1
END;
	$result = pg_query_params(
		$conn,
		$sql,
		array( $like_lv1, $like_lv2 )
	);
	while($row = pg_fetch_array($result)){
		$tenpo_list[] = $row;
	}
}

?>
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
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<meta id="viewport" name="viewport" content="width=320; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;" />
	<title>店舗のご案内</title>
	<link rel="stylesheet" href="css/top2011.css" />
	<link rel="stylesheet" href="css/common2011.css" />

	<script type="text/javascript" src="js/jquery-1.5.2.min.js"></script>
	<script type="text/javascript" src="js/common.js"></script>
	<script type="text/javascript" src="js/top.js"></script>
	<script type="text/javascript" src="js/gears_init.js"></script>
	<script type="text/javascript" src="js/gps.js"></script>
	<script language="javascript"> 
	<!--
	var state = 'none';
	var listidx = 5;

	function showhide(layer_ref) {

	if (state == 'block') { 
	state = 'none'; 
	} 
	else { 
	state = 'block'; 
	} 
	if (document.getElementById &&!document.all) { 
	hza = document.getElementById(layer_ref); 
	hza.style.display = state; 
	} 
	} 
	//--> 
	</script>

</head>
<body id='normal' style='background-color:#DDD;'>

<!-- contentsWrap -->
<div id="contentsWrap">


<!-- topPageHeader -->
<header id="topPageHeader" style='color:#000; background-color: rgb(255,255,255);'>
<h1><a href="index.html"><img src="images/logo.jpg" width="60" height="35"></a>店舗のご案内</h1>
<p class="menuBtn"><a href="javascript:void(0)" onclick="slideUpMenu();">メニュー</a></p>
</header>
<section class="topics">
	
<?

$url1 = ($o=='1') ? "&amp;o=1" : "";

if($o=="1")	echo "<br><font size=\"2\">★お値打ち黒毛和牛実施店</font><br>";

// 都道府県リスト（初期表示）
if(count($lv1_list)>0){
	echo "	<ul>	";

	foreach($lv1_list as $buf){
		echo "<li><a href=\"lists.php?lv=1&amp;lv1=". urlencode($buf) .$url1."\" class='arrow'>". $buf. "</a></li>\r\n";
	}
	echo "	</ul>	";
}

// 市区郡リスト
if(count($lv2_list)>0){
	echo "	<ul>	";

	foreach($lv2_list as $buf){
		echo "<li><a href=\"lists.php?lv=2&amp;lv1=". urlencode($lv1) ."&amp;lv2=". urlencode($buf) .$url1.$url2."\" class='arrow'>". $buf. "</a></li>\r\n";
	}
	echo "	</ul>	";
}

// 店舗リスト
if(count($tenpo_list)>0){
	$tenpocnt = 0;
	$style = "style='display: none'";
	if(count($tenpo_list) == 1){
		$style = "";
	}
	foreach($tenpo_list as $tenpo){
		echo "<ul><li><a href=\"javascript:void(0);\" onClick=\"showhide('tenpo{$tenpocnt}');\" class=\"arrow\">" . $tenpo['tenponm'] . "</a></li></ul>";
		echo "<div id='tenpo{$tenpocnt}'  $style>";
		// 住所
		$address = str_replace($lv2,'',str_replace($lv1,'',$tenpo['address1']));
		echo "&nbsp;&nbsp;<font size=\"2\">" . $address . "</font><br>";
		echo "&nbsp;<font size='2'><a href=\"./access.php?tenpo=" . urlencode(mb_convert_encoding($tenpo['tenponm'], 'SJIS-win', 'UTF-8')) . "\">[アクセス]</a></font><br>";
		if($tenpo['address2']!='') echo "<br>" . mb_convert_encoding($tenpo['address2'], 'SJIS-win', 'UTF-8') . "<br>";
		
		// 営業時間
			//  営業時間１(アイドルタイム１) \n
			//  区分 + 営業時間２(アイドルタイム２）
			$egjkn = $tenpo['s_egjknfrom'] . '～' . $tenpo['s_egjknto'];
			
			// アイドルタイム１
			if($tenpo['s_idlefrom'] != '')
				$egjkn .= ' （休憩:' . $tenpo['s_idlefrom'] . '～' . $tenpo['s_idleto'] . '）';
			
			// 営業時間２
			if( $tenpo['s_egjknfrom2'] != ''){
				
				$egjkn .= "\n";
				
				// 区分
				if($tenpo['egjkn2kbn'] == '1')
					$egjkn .= '土日・祝前日 ';
				if($tenpo['egjkn2kbn'] == '2')
					$egjkn .= '金土 ';
				if($tenpo['egjkn2kbn'] == '3')
					$egjkn .= '土日祝 ';
				
				$egjkn .= $tenpo['s_egjknfrom2'] . '～' . $tenpo['s_egjknto2'];
				
				// アイドルタイム２
				if($tenpo['s_idlefrom2'] != '')
					$egjkn .= ' （休憩:' . $tenpo['s_idlefrom2'] . '～' . $tenpo['s_idleto2'] . '）';
			}
		echo "&nbsp;&nbsp;<font size=\"2\">▼営業時間</font><br>";
		echo "&nbsp;&nbsp;<font size=\"2\">" . $egjkn . "</font><br>";
		// 駐車場台数
		if($tenpo['suryo02']>0){
			echo "&nbsp;&nbsp;<font size=\"2\">○駐車場:" . $tenpo['suryo02'] . "台</font><br>";
			if($tenpo['tenpocd']=='3005') echo "&nbsp;&nbsp;&nbsp;&nbsp;<font size=\"2\">※高さ制限&nbsp;1.8m</font><br>";
			if($tenpo['tenpocd']=='2510') echo "&nbsp;&nbsp;&nbsp;&nbsp;<font size=\"2\">※高さ制限&nbsp;1.7m</font><br>";
			if($tenpo['tenpocd']=='2072') echo "&nbsp;&nbsp;&nbsp;&nbsp;<font size=\"2\">※高さ制限&nbsp;1.8m</font><br>";
			if($tenpo['tenpocd']=='2512') echo "&nbsp;&nbsp;&nbsp;&nbsp;<font size=\"2\">※高さ制限&nbsp;2.3m</font><br>";
		}
		// TEL
		echo "&nbsp;&nbsp;<font size=\"2\">○TEL:<a href=\"tel:". str_replace('-','',$tenpo['tel1']) . "\">" . $tenpo['tel1'] . "</a></font><br>";
		
		// くざわばし
		// if($tenpo['tenpocd']!='3034')
			echo "&nbsp;&nbsp;<font size=\"2\"><a href=\"".YOYAKU_URL."yoyaku_form.php?tenpocd=".$tenpo['tenpocd']."\">[宴会ご予約]</a></font><br>";
		
		// オプション情報
		//if(substr($tenpo['tm19kbn'],0,1)=='1') echo "&nbsp;&nbsp;<font size=\"2\" color=\"orangered\">★お値打ち黒毛和牛</font><br>";
		//if(substr($tenpo['tm18kbn'],0,1)=='1') echo "&nbsp;&nbsp;<font size=\"2\" color=\"orangered\">★食べ放題</font><br>";
		
		echo "<table><tr>";
		// 20150430 お値打ち終了
		//if(substr($tenpo['tm19kbn'],0,1)=='1'){
		//	echo "<td colspan=\"2\"><font size=\"2\" color=\"orangered\">★お値打ち黒毛和牛</font></td></tr><tr>";
		//}
		
		$i=0;
		if($tenpo['tenpokbn03']=='2'){
			echo "<td><font size=\"2\" color=\"green\">★炭火焼肉</font></td>";
			$i++;
		}
		if($tenpo['tenpokbn04']=='1'){
			echo "<td><font size=\"2\" color=\"green\">★ﾄﾞﾘﾝｸﾊﾞｰ</font></td>";
			$i++;
		}
		if($tenpo['tenpokbn06']=='1'){
			if($i>0 && $i%2==0) echo "<tr>";
			echo "<td><font size=\"2\" color=\"green\">★ｻﾗﾀﾞﾊﾞｰ</font></td>";
			$i++;
		}
		if($tenpo['tenpokbn08']=='1'){
			if($i>0 && $i%2==0) echo "<tr>";
			echo "<td><font size=\"2\" color=\"green\">★ｹｰｷﾊﾞｰ</font></td>";
			$i++;
		}
		if($tenpo['tenpokbn15']=='1'){
			if($i>0 && $i%2==0) echo "<tr>";
			echo "<td><font size=\"2\" color=\"green\">★ｼﾞｪﾗｰﾄﾊﾞｰ</font></td>";
			$i++;
		}
		if($tenpo['tenpokbn13']=='1'){
			if($i>0 && $i%2==0) echo "<tr>";
			echo "<td><font size=\"2\" color=\"green\">★ｷｯｽﾞﾙｰﾑ</font></td>";
			$i++;
		}
		if($tenpo['tenpocd']=='2082'){
			if($i>0 && $i%2==0) echo "<tr>";
			echo "<td><font size=\"2\"><br><a href=\"http://r.gnavi.co.jp/bx8vpr180000/\">★安楽亭下北沢店　ぐるなびページ★</a></font></td>";
			$i++;
		}
		if($i%2==1) echo "<td></td>";
		echo "</tr></table>";
		
		echo "<br></div>\r\n";
		$tenpocnt++;
	}
}
?>
<?php
// Google Analyticsのトラッキングコード PHP版
// </body>の直前に書くこと
  $googleAnalyticsImageUrl = googleAnalyticsGetImageUrl();
  echo '<img src="' . $googleAnalyticsImageUrl . '" />';
?>
</section>
</div>
	
<!-- menu -->
<nav id="menu">
</nav>
<script src="js/menu.js"></script>
	
	
</body>
</html>