<?php
$agent = $_SERVER['HTTP_USER_AGENT'];
$agent2 = $_SERVER['HTTP_X_OPERAMINI_PHONE'];
if(
	preg_match("/iPhone/i", $agent) ||
	preg_match("/iPad/i", $agent) ||
	preg_match("/Android/i", $agent)||
	preg_match("/iPhone/i", $agent2) ||
	preg_match("/iPad/i", $agent2) ||
	preg_match("/Android/i", $agent2)
)
{
	header("Location: http://k.anrakutei.jp/sp/summer2013/");
	exit;
}else{
	header("Location: http://k.anrakutei.jp/summerbig2013/");
	exit;
}

?>