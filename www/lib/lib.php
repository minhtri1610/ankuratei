<?php

require_once('Net/UserAgent/Mobile.php');

//-----------------------------------------------------------
// 共通関数群
//-----------------------------------------------------------

// 個体識別情報取得
// 
// OUT引数
//     個体識別区分
//     1: docomo   - iモードID (2より優先）
//     2: docomo   - 端末シリアル番号 + UIM
//     3: au       - サブスクライバID
//     4: SoftBank - ユーザID
//
// 戻り値
//     個体識別情報
function getPrefixCode(&$kbn){
	
	$agent = Net_UserAgent_Mobile::singleton();
	
	// docomo
	if($agent->isDoCoMo()){
		
		// iモードIDが取得できたら優先して返す
		if($_SERVER['HTTP_X_DCMGUID']!=''){
			$kbn = '1';
			return $_SERVER['HTTP_X_DCMGUID'];
		}
		
		// iモードIDが取得できなかった場合 (URL に utn 付けたとき）
		$ser = $agent->getSerialNumber();		// 端末シリアルNO
		$uim = $agent->getCardID();				// UIM
		
		if($ser!='' && $uim!=''){
			$kbn = '2';
			return $ser . $uim;
		}
		
		return '';
	}
	// au
	else if($agent->isEZweb()){
		// サブスクライバID
		$kbn = '3';
		return $_SERVER['HTTP_X_UP_SUBNO'];
	}
	// SoftBank
	else if($agent->isSoftBank()){
		// ユーザID
		$kbn = '4';
		return $_SERVER['HTTP_X_JPHONE_UID'];
	}
	
	return '';
}

// 携帯GPSリンク取得（キャリアごとのGPS取得リンクを返します。）
//  引数１ $url --- GPSを処理するスクリプトのURL（指定しない "" or 0 の場合は現在表示しているページに設定）
//  引数２ $link_title --- リンクのタイトル
function GPS_output_link($url,$link_title){
	
	if(!$url){$url = $_SERVER['PHP_SELF'];}
	$agent = Net_UserAgent_Mobile::singleton();
	
	// docomo
	if($agent->isDoCoMo()){
		echo "<a href=\"".$url."\" lcs>".$link_title."</a>";
	}
	// au
	else if($agent->isEZweb()){
		echo "<a href=\"device:gpsone?url=".$url."&ver=1&datum=0&unit=0\">".$link_title."</a>";
	}
	// SoftBank
	else if($agent->isSoftBank()){
		echo "<a href=\"location:auto?url=".$url."\">".$link_title."</a>";
	}
	// Willcom
	else if($agent->isWillcom()){
		echo "<a href=\"http://location.request/dummy.cgi?my=".$url."&pos=$location\">".$link_title."</a>";
	}
	else {
		echo "ご利用の端末は未対応です。" ;
	}
}

// GPS取得情報
class GPS_param_get{
	
	//緯度 latitude（dd.mm.ss.sss）
	var $lat;
	
	//経度 longitude（dd.mm.ss.sss）
	var $lon;
	
	//緯度（10進数に変換：00.000000）
	var $lat_world;
	
	//経度（10進数に変換：00.000000）
	var $lon_world;
	
	
	//コンストラクタ
	function GPS_param_get(){
		//携帯GPSで取得したパラメーターから緯度経度を取得
		//返り値 $hoge['lat'] -> 緯度　$hoge['lon'] -> 経度
		$agent = Net_UserAgent_Mobile::singleton();
		
		// docomo
		if($agent->isDoCoMo()){
			if($_GET['lat'] && $_GET['lon']){
				$lat = preg_replace("/\-/","+-",$_GET['lat']);
				$lon = preg_replace("/\-/","+-",$_GET['lon']);
				$lat = preg_split("/\+/",$lat);
				$lon = preg_split("/\+/",$lon);
				$this->lat = $lat[1];
				$this->lon = $lon[1];
				//10進数に変換
				$location_converted = $this->location_convert($lat[1],$lon[1]);
				$this->lat_world = $location_converted['lat_converted'];
				$this->lon_world = $location_converted['lon_converted'];
			}else{
				return FALES;
			}
		}
		// SoftBank
		else if($agent->isSoftBank()){
			if($_GET['pos']){
				$location = preg_replace("/N/","+",$_GET['pos']);
				$location = preg_replace("/E/","+",$location);
				$location = preg_replace("/S/","+-",$location);
				$location = preg_replace("/W/","+-",$location);
				$location = preg_split("/\+/",$location);
				$this->lat = $location[1];
				$this->lon = $location[2];
				//10進数に変換
				$location_converted = $this->location_convert($location[1],$location[2]);
				$this->lat_world = $location_converted['lat_converted'];
				$this->lon_world = $location_converted['lon_converted'];
			}else{
				return FALES;
			}
		}
		// au
		else if($agent->isEZweb()){
			if($_GET['lat'] && $_GET['lon']){
				$lat = preg_replace("/\-/","+-",$_GET['lat']);
				$lon = preg_replace("/\-/","+-",$_GET['lon']);
				$lat = preg_split("/\+/",$lat);
				$lon = preg_split("/\+/",$lon);
				$this->lat = $lat[1];
				$this->lon = $lon[1];
				//10進数に変換
				$location_converted = $this->location_convert($lat[1],$lon[1]);
				$this->lat_world = $location_converted['lat_converted'];
				$this->lon_world = $location_converted['lon_converted'];
			}else{
				return FALES;
			}
		}
		// Willcom
		else if($agent->isWillcom()){
			if($_GET['pos']){
				$location = preg_replace("/N/","+",$_GET['pos']);
				$location = preg_replace("/E/","+",$location);
				$location = preg_replace("/S/","+-",$location);
				$location = preg_replace("/W/","+-",$location);
				$location = preg_split("/\+/",$location);
				$this->lat = $location[1];
				$this->lon = $location[2];
				//10進数に変換
				$location_converted = $this->location_convert($location[1],$location[2]);
				$this->lat_world = $location_converted['lat_converted'];
				$this->lon_world = $location_converted['lon_converted'];
			}else{
				return FALES;
			}
		} else {
			;
		}
	}
	
	function location_convert($lat,$lon){
		//携帯GPSで取得した時分秒形式の緯度・経度情報を10進数に変換する
		//引数１ $lat 緯度
		//引数２ $lon 軽度
		//返り値 $hoge['lat_converted'] -> 変換された緯度　$hoge['lon_converted'] -> 変換された経度
		$lat_convert = preg_split("/\./",$lat);
		if(preg_match("/^-[[:digit:]]+/",$lat_convert[0])){
			$lat_converted = $lat_convert[0] - (  ($lat_convert[1]/ 60) + (( $lat_convert[2] + ($lat_convert[3] / 1000)) / 3600 )  );
		}else{
			$lat_converted = $lat_convert[0] + (  ($lat_convert[1]/ 60) + (( $lat_convert[2] + ($lat_convert[3] / 1000)) / 3600 )  );
		}
		$lon_convert = preg_split("/\./",$lon);
		if(preg_match("/^-[[:digit:]]+/",$lon_convert[0])){
			$lon_converted = $lon_convert[0] - (  ($lon_convert[1]/ 60) + (( $lon_convert[2] + ($lon_convert[3] / 1000)) / 3600 )  );
		}else{
			$lon_converted = $lon_convert[0] + (  ($lon_convert[1]/ 60) + (( $lon_convert[2] + ($lon_convert[3] / 1000)) / 3600 )  );
		}
		return array("lat_converted"=>$lat_converted,"lon_converted"=>$lon_converted);
	}
	
}//class GPS_param_get END

/**
 * 2地点間の直線距離を求める（Hubenyの簡易式による）
 * @param string $a_long A地点の経度（10進法）
 * @param string $a_lati A地点の緯度
 * @param string $b_long B地点の経度
 * @param string $b_lati B地点の緯度
 * @return double 直線距離（メートル）
*/
function calc_distanceDeg($a_long, $a_lati, $b_long, $b_lati) {
	
	//ラジアンに変換
	$a_long = deg2rad($a_long);
	$a_lati = deg2rad($a_lati);
	$b_long = deg2rad($b_long);
	$b_lati = deg2rad($b_lati);

	$latave = ($a_lati + $b_lati) / 2;
	$latidiff = $a_lati - $b_lati;
	$longdiff = $a_long - $b_long;

	//子午線曲率半径
	//$meridian = 6334834 / sqrt(pow(1 - 0.006674 * sin($latave) * sin($latave), 3));        //日本測地系
	$meridian = 6335439 / sqrt(pow(1 - 0.006694 * sin($latave) * sin($latave), 3));      //世界測地系

	//卯酉線曲率半径
	//$primevertical = 6377397 / sqrt(1 - 0.006674 * sin($latave) * sin($latave));       //日本測地系
	$primevertical = 6378137 / sqrt(1 - 0.006694 * sin($latave) * sin($latave));       //世界測地系

	//Hubenyの簡易式
	$x = $meridian * $latidiff;
	$y = $primevertical * cos($latave) * $longdiff;

	return sqrt($x * $x + $y * $y);
}

/**
 * 2地点間の直線距離を求める（Hubenyの簡易式による）
 * @param string $a A地点の緯度経度（日本語またはExxx.xx.xxNxx.xx.xx表記）
 * @param string $b B地点の緯度経度（日本語またはExxx.xx.xxNxx.xx.xx表記）
 * @return double 直線距離（メートル）
*/
function calc_distanceDms($a, $b) {
	//Ａ地点の経度・緯度を小数に
	preg_match("/E(\d+)\.(\d+)\.(\d+)\.(\d+)N(\d+)\.(\d+)\.(\d+)\.(\d+)/", $a, $regs);
	$a_long = $regs[1] + $regs[2] / 60 + $regs[3] / 3600 + $regs[4] / 36000;
	$a_lati = $regs[5] + $regs[6] / 60 + $regs[7] / 3600 + $regs[8] / 36000;

	//Ｂ地点の経度・緯度を小数に
	preg_match("/E(\d+)\.(\d+)\.(\d+)\.(\d+)N(\d+)\.(\d+)\.(\d+)\.(\d+)/", $b, $regs);
	$b_long = $regs[1] + $regs[2] / 60 + $regs[3] / 3600 + $regs[4] / 36000;
	$b_lati = $regs[5] + $regs[6] / 60 + $regs[7] / 3600 + $regs[8] / 36000;

	//ラジアンに変換
	$a_long = deg2rad($a_long);
	$a_lati = deg2rad($a_lati);
	$b_long = deg2rad($b_long);
	$b_lati = deg2rad($b_lati);

	$latave = ($a_lati + $b_lati) / 2;
	$latidiff = $a_lati - $b_lati;
	$longdiff = $a_long - $b_long;

	//子午線曲率半径
	//$meridian = 6334834 / sqrt(pow(1 - 0.006674 * sin($latave) * sin($latave), 3));        //日本測地系
	$meridian = 6335439 / sqrt(pow(1 - 0.006694 * sin($latave) * sin($latave), 3));      //世界測地系

	//卯酉線曲率半径
	//$primevertical = 6377397 / sqrt(1 - 0.006674 * sin($latave) * sin($latave));       //日本測地系
	$primevertical = 6378137 / sqrt(1 - 0.006694 * sin($latave) * sin($latave));       //世界測地系

	//Hubenyの簡易式
	$x = $meridian * $latidiff;
	$y = $primevertical * cos($latave) * $longdiff;

	return sqrt($x * $x + $y * $y);
}

?>
