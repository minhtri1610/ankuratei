<?

// 抽選処理

require_once("./common.inc");
require_once('lib.php');
$prefix = getPrefixCode($kbn);

// Try1 個体識別番号から過去の抽選結果を取得
if($prefix!=""){
	
	$conn = @pg_connect($DBCON);
	$sql = "select couponcd, to_char(eigyobi,'YYYYMMDD') as eigyobi from t_coupon_term02 where prefixcode = '$prefix'";
	$res= @pg_query($conn, $sql);
	if(!$res){
	}
	// ◆登録があったら結果を表示
	elseif($row = pg_fetch_array($res)){
		
		$couponcd	= $row['couponcd'];
		$eigyobi	= $row['eigyobi'];
		
		require_once("./result.php");
		exit;
	}
}

// Try2 COOKIEから過去の抽選結果を取得
$cookie = explode(",", $_COOKIE["coupon_term02"]);	// "クーポンコード,営業日"

// ◆登録があったら結果を表示
if(count($cookie)>1){
	$couponcd	= $cookie[0];
	$eigyobi	= $cookie[1];
	
	require_once("./result.php");
	exit;
}



// ◆ここから新規抽選処理
$msec = substr(microtime(),2,3);

// サーバ時刻ミリ秒でクーポンコード決定（1等1%, 2等4%, 3等10%…）
if($msec<10)		$couponcd = 1;
elseif($msec<50)	$couponcd = 2;
elseif($msec<150)	$couponcd = 3;
elseif($msec<400)	$couponcd = 4;
elseif($msec<650)	$couponcd = 5;
elseif($msec<900)	$couponcd = 6;
elseif($msec<950)	$couponcd = 7;
else				$couponcd = 8;

$eigyobi = (date('H')<'07') ? date('Ymd', strtotime("-1 day")) : date('Ymd');

// 個体識別番号が取得できたらデータベースに登録
if($prefix!=""){
	
	$conn = @pg_connect($DBCON);
	$sql = "insert into t_coupon_term02 values ('$prefix', $couponcd, '$eigyobi', current_timestamp)";
	@pg_query($conn, $sql);
}

// COOKIEにも保存(70日間)
$value		= $couponcd . "," . $eigyobi;
$timeout	= time() + 70 * 86400;
@setcookie("coupon_term02", $value, $timeout,'/','k.anrakutei.jp');

// 結果表示へ
require_once("./result.php");
?>
