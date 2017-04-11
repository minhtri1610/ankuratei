<?php
//Google Mapsのカスタマイズファイル
//$shght='地図の高さpix';$swdth='地図の幅pix';$szoom='ズーム値'
//Google Maps環境の初期化ファイル
require_once( 'GoogleMapAPI.class.php');
$apikey = 'ABQIAAAACUtywH1CxrdWW0PKFBXCyhR9s7ZpR5qDbvT6g8Rm_POFuGgIOhTrFepC_EDoOCxHbzvfhZkk5n1REQ';
class GoogleMapAPI_GuestBook extends GoogleMapAPI {
	var $api_key; //APIキー変数定義
	function GoogleMapAPI_GuestBook($shght="300",$swdth="450",$szoom="15") 
	{
		$this->api_key = 'ABQIAAAACUtywH1CxrdWW0PKFBXCyhR9s7ZpR5qDbvT6g8Rm_POFuGgIOhTrFepC_EDoOCxHbzvfhZkk5n1REQ';//10.1.10.42
		//$this->api_key = 'ABQIAAAACUtywH1CxrdWW0PKFBXCyhQw9HPmuPyLUAGcnaletbKb4CjwwhQ-K0-ZjI7h-aGeiT6wq_Ep9dmvDw';//10.1.10.143
		//$this->api_key = 'ABQIAAAACUtywH1CxrdWW0PKFBXCyhSljJiZYypCmU-OSsTnq91oR_SDlRQL3C_kA5hXhrywhINHEAmB6hYq2Q';//www.anrakutei.co.jp
		$this->GoogleMapAPI();
		$this -> setDSN('pgsql://postgres:postgres@10.1.10.42/gmap');//test
		//$this -> setDSN('pgsql://postgres:postgres@10.1.10.42/gmap');//honban
		//Google MapsのAPIキー設定
		$this -> setAPIKey($this->api_key);
		//地図の表示サイズ
		$this -> setHeight($shght.'px');
		$this -> setWidth($swdth.'px');
		//地図のコントローラ表示
		$this -> enableMapControls();
		//最初の拡大レベルを手動設定
		$this -> setZoomLevel($szoom);
		$this -> disableZoomEncompass();
		//マーカーの平均座標から自動設定したいとき
		//$map -> enableZoomEncompass();
		//エラーメッセージ
		$this -> setBrowserAlert(
		'このブラウザでは地図を表示できません。IE6.0以降かFirefox1.0以降をお奨めします。');
		$this -> setJSAlert(
		'Javascriptを有効にしないと、地図が表示できません。');
		//詳細をマウスオーバーで表示させる
		$this -> setInfoWindowTrigger('mouseover');//クリック表示は'mouseclick'
		//米国の道案内は使用しない
		$this -> disableDirections();
	}
}
?>
