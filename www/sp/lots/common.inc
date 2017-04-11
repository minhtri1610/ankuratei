<?

set_include_path(get_include_path() . PATH_SEPARATOR . $_SERVER["DOCUMENT_ROOT"] . "/lib");

$URL	= "http://k.anrakutei.jp/lots/";
$SPURL	= "http://k.anrakutei.jp/sp/lots/";

$DBCON	= "host=10.1.13.2 dbname=coupon user=ow_coupon password=ow_coupon";

$SYOHIN = array(
	array(	1,	10,		"厚切り上タン塩"),
	array(	2,	40,		"帆立の磯焼"),
	array(	3,	100,	"トマトキムチ"),
	array(	4,	250,	"岩海苔"),
	array(	5,	250,	"韓国風冷奴"),
	array(	6,	250,	"枝豆"),
	array(	7,	50,		"冷麺"),
	array(	8,	50,		"アイス石焼ブリュレ")
);

?>
