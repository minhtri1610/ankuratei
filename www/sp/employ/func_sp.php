<?
// 特定の記述をCSSにコンバート・逆コンバートする
function original_convert($txt){
	
	//$ret = mb_convert_encoding($txt,'SJIS-win','UTF-8');
	
	$ret = nl2br($txt);
	
//	$ret = str_replace ('"', '\\\"', $ret);										// 順番に注意
	$ret = str_replace ('<見出し>', '<font size="3">', $ret);
	$ret = str_replace ('</見出し>', '</font>', $ret);
	
	$ret = str_replace ('<青>', '<font color="#0000FF">', $ret);
	$ret = str_replace ('<赤>', '<font color="#FF0000">', $ret);
	$ret = str_replace ('<緑>', '<font color="#008800">', $ret);
	$ret = str_replace ('<橙>', '<font color="orangered">', $ret);
	$ret = str_replace ('</青>', '</font>', $ret);
	$ret = str_replace ('</赤>', '</font>', $ret);
	$ret = str_replace ('</緑>', '</font>', $ret);
	$ret = str_replace ('</橙>', '</font>', $ret);
	$ret = str_replace ('<太字>', '', $ret);
	$ret = str_replace ('</太字>', '', $ret);
	
	$ret = str_replace ('<表>', '<table>', $ret);
	$ret = str_replace ('<行>', '<tr>', $ret);
	$ret = str_replace ('<列1>', '<td valign="top" nowrap>', $ret);
	$ret = str_replace ('<列2>', '<td valign="top">', $ret);
	$ret = str_replace ('<列3>', '<td valign="top">', $ret);
	$ret = str_replace ('</列>', '</td>', $ret);
	$ret = str_replace ('</行>', '</tr>', $ret);
	$ret = str_replace ('</表>', '</table>', $ret);
	
	$ret = str_replace ("<table><br />", '<table>', $ret);
	$ret = str_replace ("<table>\r\n<br />", '<table>', $ret);
	$ret = str_replace ("<tr><br />", '<tr>', $ret);
	$ret = str_replace ("<td><br />", '<td>', $ret);
	$ret = str_replace ("<td>\r\n<br />", '<td>', $ret);
	$ret = str_replace ("</tr><br />", '</tr>', $ret);
	$ret = str_replace ("</tr>\r\n<br />", '</tr>', $ret);
	$ret = str_replace ("</td><br />", '</td>', $ret);

	return $ret;
}
?>
