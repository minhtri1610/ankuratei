<?php
define("NO_USERINFO", FALSE);
	session_start();
$req= $_REQUEST;
if($req['fm'] == 1){
	$frommail = 1;
}
require_once("coupon_std.inc");

$route = $req['rt'];
if(strlen($route) == 0 || !is_numeric($route))$route = 0;

switch($route){
	case 2:
	$enqmail = "enq_r@anrakutei.jp";
	break;
	case 3:
	$enqmail = "enq_l@anrakutei.jp";
	break;
	case 6:
	$enqmail = "enq_s@anrakutei.jp";
	break;
	default:
	$enqmail = "enq_r@anrakutei.jp";
	break;
}

//$enqmail = "enq_p@anrakutei.jp";//for smartphone

$sql = "insert into t_enq_log(id,registtime,seq,route) values('{$user['id']}',current_timestamp,0,'$route')";
if($req['fm'] != 1)dberrexit($con, $con->query($sql), "<html>", __FILE__, __LINE__);


list($yubin1, $yubin2)= explode("-", $user['yubin']);
$nenrei= (strlen($user['nenrei'])> 0)? (intval(date('Y', time()))- intval($user['nenrei'])): "";

switch($minfo['provider']) {
	case "au":
		include "page_ezweb/questionnaire_postal.php";
		break;
	case "yahoo":
		include "page_softbank/questionnaire_postal.php";
		break;
	default:	// docomoとその他
		include "page_imode/questionnaire_postal.php";
}


?>
