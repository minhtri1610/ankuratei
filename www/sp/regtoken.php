<?php
mb_internal_encoding('UTF-8');
	    require_once("DB.php");
		// DB接続
		$objDb = DB::connect("pgsql://postgres:postgres@10.1.13.2/coupon");

if($_REQUEST["t"] == "")exit;

$sql = "select * from devtokens where token = '{$_REQUEST["t"]}'";
$res = $objDb->query($sql);
if(DB::isError($res)){
	print "NG";
	exit;
}
if($res->numRows()>0){
	print "OK";
	exit;
}

$sql = "insert into devtokens(token,valid_flg) values('{$_REQUEST["t"]}',1)";

$res = $objDb->query($sql);

if(DB::isError($res)){
	print "$sql NG";
	exit;
}

print "OK";
exit;

?>