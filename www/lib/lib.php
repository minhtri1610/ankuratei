<?php

require_once('Net/UserAgent/Mobile.php');

//-----------------------------------------------------------
// ���ʊ֐��Q
//-----------------------------------------------------------

// �̎��ʏ��擾
// 
// OUT����
//     �̎��ʋ敪
//     1: docomo   - i���[�hID (2���D��j
//     2: docomo   - �[���V���A���ԍ� + UIM
//     3: au       - �T�u�X�N���C�oID
//     4: SoftBank - ���[�UID
//
// �߂�l
//     �̎��ʏ��
function getPrefixCode(&$kbn){
	
	$agent = Net_UserAgent_Mobile::singleton();
	
	// docomo
	if($agent->isDoCoMo()){
		
		// i���[�hID���擾�ł�����D�悵�ĕԂ�
		if($_SERVER['HTTP_X_DCMGUID']!=''){
			$kbn = '1';
			return $_SERVER['HTTP_X_DCMGUID'];
		}
		
		// i���[�hID���擾�ł��Ȃ������ꍇ (URL �� utn �t�����Ƃ��j
		$ser = $agent->getSerialNumber();		// �[���V���A��NO
		$uim = $agent->getCardID();				// UIM
		
		if($ser!='' && $uim!=''){
			$kbn = '2';
			return $ser . $uim;
		}
		
		return '';
	}
	// au
	else if($agent->isEZweb()){
		// �T�u�X�N���C�oID
		$kbn = '3';
		return $_SERVER['HTTP_X_UP_SUBNO'];
	}
	// SoftBank
	else if($agent->isSoftBank()){
		// ���[�UID
		$kbn = '4';
		return $_SERVER['HTTP_X_JPHONE_UID'];
	}
	
	return '';
}

// �g��GPS�����N�擾�i�L�����A���Ƃ�GPS�擾�����N��Ԃ��܂��B�j
//  �����P $url --- GPS����������X�N���v�g��URL�i�w�肵�Ȃ� "" or 0 �̏ꍇ�͌��ݕ\�����Ă���y�[�W�ɐݒ�j
//  �����Q $link_title --- �����N�̃^�C�g��
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
		echo "�����p�̒[���͖��Ή��ł��B" ;
	}
}

// GPS�擾���
class GPS_param_get{
	
	//�ܓx latitude�idd.mm.ss.sss�j
	var $lat;
	
	//�o�x longitude�idd.mm.ss.sss�j
	var $lon;
	
	//�ܓx�i10�i���ɕϊ��F00.000000�j
	var $lat_world;
	
	//�o�x�i10�i���ɕϊ��F00.000000�j
	var $lon_world;
	
	
	//�R���X�g���N�^
	function GPS_param_get(){
		//�g��GPS�Ŏ擾�����p�����[�^�[����ܓx�o�x���擾
		//�Ԃ�l $hoge['lat'] -> �ܓx�@$hoge['lon'] -> �o�x
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
				//10�i���ɕϊ�
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
				//10�i���ɕϊ�
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
				//10�i���ɕϊ�
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
				//10�i���ɕϊ�
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
		//�g��GPS�Ŏ擾���������b�`���̈ܓx�E�o�x����10�i���ɕϊ�����
		//�����P $lat �ܓx
		//�����Q $lon �y�x
		//�Ԃ�l $hoge['lat_converted'] -> �ϊ����ꂽ�ܓx�@$hoge['lon_converted'] -> �ϊ����ꂽ�o�x
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
 * 2�n�_�Ԃ̒������������߂�iHubeny�̊ȈՎ��ɂ��j
 * @param string $a_long A�n�_�̌o�x�i10�i�@�j
 * @param string $a_lati A�n�_�̈ܓx
 * @param string $b_long B�n�_�̌o�x
 * @param string $b_lati B�n�_�̈ܓx
 * @return double ���������i���[�g���j
*/
function calc_distanceDeg($a_long, $a_lati, $b_long, $b_lati) {
	
	//���W�A���ɕϊ�
	$a_long = deg2rad($a_long);
	$a_lati = deg2rad($a_lati);
	$b_long = deg2rad($b_long);
	$b_lati = deg2rad($b_lati);

	$latave = ($a_lati + $b_lati) / 2;
	$latidiff = $a_lati - $b_lati;
	$longdiff = $a_long - $b_long;

	//�q�ߐ��ȗ����a
	//$meridian = 6334834 / sqrt(pow(1 - 0.006674 * sin($latave) * sin($latave), 3));        //���{���n�n
	$meridian = 6335439 / sqrt(pow(1 - 0.006694 * sin($latave) * sin($latave), 3));      //���E���n�n

	//�K�ѐ��ȗ����a
	//$primevertical = 6377397 / sqrt(1 - 0.006674 * sin($latave) * sin($latave));       //���{���n�n
	$primevertical = 6378137 / sqrt(1 - 0.006694 * sin($latave) * sin($latave));       //���E���n�n

	//Hubeny�̊ȈՎ�
	$x = $meridian * $latidiff;
	$y = $primevertical * cos($latave) * $longdiff;

	return sqrt($x * $x + $y * $y);
}

/**
 * 2�n�_�Ԃ̒������������߂�iHubeny�̊ȈՎ��ɂ��j
 * @param string $a A�n�_�̈ܓx�o�x�i���{��܂���Exxx.xx.xxNxx.xx.xx�\�L�j
 * @param string $b B�n�_�̈ܓx�o�x�i���{��܂���Exxx.xx.xxNxx.xx.xx�\�L�j
 * @return double ���������i���[�g���j
*/
function calc_distanceDms($a, $b) {
	//�`�n�_�̌o�x�E�ܓx��������
	preg_match("/E(\d+)\.(\d+)\.(\d+)\.(\d+)N(\d+)\.(\d+)\.(\d+)\.(\d+)/", $a, $regs);
	$a_long = $regs[1] + $regs[2] / 60 + $regs[3] / 3600 + $regs[4] / 36000;
	$a_lati = $regs[5] + $regs[6] / 60 + $regs[7] / 3600 + $regs[8] / 36000;

	//�a�n�_�̌o�x�E�ܓx��������
	preg_match("/E(\d+)\.(\d+)\.(\d+)\.(\d+)N(\d+)\.(\d+)\.(\d+)\.(\d+)/", $b, $regs);
	$b_long = $regs[1] + $regs[2] / 60 + $regs[3] / 3600 + $regs[4] / 36000;
	$b_lati = $regs[5] + $regs[6] / 60 + $regs[7] / 3600 + $regs[8] / 36000;

	//���W�A���ɕϊ�
	$a_long = deg2rad($a_long);
	$a_lati = deg2rad($a_lati);
	$b_long = deg2rad($b_long);
	$b_lati = deg2rad($b_lati);

	$latave = ($a_lati + $b_lati) / 2;
	$latidiff = $a_lati - $b_lati;
	$longdiff = $a_long - $b_long;

	//�q�ߐ��ȗ����a
	//$meridian = 6334834 / sqrt(pow(1 - 0.006674 * sin($latave) * sin($latave), 3));        //���{���n�n
	$meridian = 6335439 / sqrt(pow(1 - 0.006694 * sin($latave) * sin($latave), 3));      //���E���n�n

	//�K�ѐ��ȗ����a
	//$primevertical = 6377397 / sqrt(1 - 0.006674 * sin($latave) * sin($latave));       //���{���n�n
	$primevertical = 6378137 / sqrt(1 - 0.006694 * sin($latave) * sin($latave));       //���E���n�n

	//Hubeny�̊ȈՎ�
	$x = $meridian * $latidiff;
	$y = $primevertical * cos($latave) * $longdiff;

	return sqrt($x * $x + $y * $y);
}

?>
