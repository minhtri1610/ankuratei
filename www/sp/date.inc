<?php
define("DATEINC_VERSION", "1.0.0.20061123");		// update 2006/11/23

$strweek= array("日", "月", "火", "水", "木", "金", "土");

/**************************************************
 * php日時関数に慣れない人の為の日付操作の関数群  *
 * （普通に使えるならこれいらん）                 *
 *                                                *
 * dateadd =>   日付の加減算                      *
 * ymd2date =>  良い感じに文字列からUnixﾀｲﾑｽﾀﾝﾌﾟ  *
 * weeknumber2date => 週番号+曜日からUnixﾀｲﾑｽﾀﾝﾌﾟ *
 * date2weeknumber => Unixﾀｲﾑｽﾀﾝﾌﾟから週番号+曜日 *
 * getlastday => 月の最終日を取得                 *
 *                                                *
 **************************************************/

// Microsoft標準のDateAdd関数 (対象, 加減算数, Unixタイムスタンプ)
// 対象の種類
//   y || yyyy -> 年操作
//   q         -> 四半期(使えないかも)
//   m         -> 月操作
//   d         -> 日操作
//   w || ww   -> 曜日操作
//   h         -> 時操作
//   n         -> 分操作
//   s         -> 秒操作
if(!function_exists('dateadd')) {
	function DateAdd($interval, $number, $date) {


		$date_time_array = getdate($date);
		$hours = $date_time_array['hours'];
		$minutes = $date_time_array['minutes'];
		$seconds = $date_time_array['seconds'];
		$month = $date_time_array['mon'];
		$day = $date_time_array['mday'];
		$year = $date_time_array['year'];

		switch ($interval) {
			case 'y':
			case 'yyyy':
				$year+= $number;
				break;
			case 'q':
				$year+= ($number*3);
				break;
			case 'm':
				// 月の加減算がそのつきの最終日を越えてしまい、次月に進んでしまうことを解決する
				$tmp1= mktime($hours, $minutes, $seconds, $month+ $number, 1, $yaer);
				$tmp2= mktime($hours, $minutes, $seconds, $month+ $number, $day, $year);
				
				if(date("m", $tmp1)!= date("m", $tmp2))	{
					$tmp3= mktime($hours, $minuts, $seconds, $month+ $number+ 1, 0, $year);
					$date_time_array= getdate($tmp3);
					$hours=		$date_time_array['hours'];
					$minutes=	$date_time_array['minutes'];
					$seconds=	$date_time_array['seconds'];
					$month=		$date_time_array['mon'];
					$day=		$date_time_array['mday'];
					$year=		$date_time_array['year'];
				}
				else									$month+= $number;
				
				break;
			case 'd':
				$day+= $number;
				break;
			case 'w':
			case 'ww':
				$day+= ($number*7);
				break;
			case 'h':
				$hours+= $number;
				break;
			case 'n':
			case 'i':
				$minutes+= $number;
				break;
			case 's':
				$seconds+= $number; 
				break;			
		}
			
		$timestamp= mktime($hours,$minutes,$seconds,$month,$day,$year);
		return $timestamp;
	}
}

if(!function_exists("dateadd2")) {
	function dateadd2($interval, $number, $date) {
		switch($interval) {
			case "y":
			case "year":
				$ret= strtotime($number. " year", $date);	break;
			case "m":
			case "month":
				$ret= strtotime($number. " month", $date);
				$d= strtotime(date('Y/m/1', $date). " ". $number. " month");
				
				if(date('m', $d)!= date('m', $ret))	$ret= strtotime("1 month - 1 day", $d);
				break;
			case "d": case "day": case "days":
				$ret= strtotime($number. " day", $date);	break;
			case "w": case "week":
				$ret= strtotime($number. " week", $date);	break;
			case "h": case "hour": case "hours":
				$ret= strtotime($number. " hours", $date);	break;
			case "n": case "minute": case "minutes":
				$ret= strtotime($number. " minutes", $date); break;
			case "s": case "second": case "seconds":
				$ret= strtotime($number. " second", $date);	break;
		}
		
		return $ret;
	}
}

if(!function_exists('monthlastday')) {
	function monthlastday($date) {
		$edate= ymd2date(date('Ym', $date). "01");
		return dateadd("d", -1, dateadd("m", 1, ymd2date(date('Ym', $date). "01")));
	}
}

if(!function_exists("ymd2date")) {
	function ymd2date($strdate) {
	/* 抽出可能パターン */
	/*-------------------
	 y/m                  |
	 yyyy/mm              |
	 yyyymm               |
	 y/m/d                |
	 yyyy/mm/dd           |
	 yyyymmdd             |
	 yyyymmddhhii
	 yyyymmddhhiiss
	 y-m-d h:i
	 y/m/d h:i
	 y-m-d h:i:s
	 y/m/d h:i:s
	 y-m-d hh:ii
	 y/m/d hh:ii
	 y-m-d hh:ii:ss
	 y/m/d hh:ii:ss
	 yyyy-mm-dd hh:ii
	 yyyy/mm/dd hh:ii
	 yyyy-mm-dd hh:ii:ss
	 yyyy/mm/dd hh:ii:ss
	|yyyy/mm/dd h:i
	|yyyy/mm/dd h:i:s
	|yyyy mm
	|yyyy mm dd
	|yyyy mm dd hh ii
	|yyyy mm dd hh ii ss
	 -------------------*/
	//	$year= 0;
	//	$month= 0;
	//	$day= 0;
	//	$hour= 0;
	//	$minute= 0;
	//	$second= 0;	

	// 全角数に対応
//	$strdate= mb_convert_kana($strdate, "n", "utf8");

	// 年月という文字にも対応
	$strdate= preg_replace("/(年|月|日|ねん|がつ|び|び|にち|ぴ)/", '/', $strdate);
	if(substr($strdate, -1)== '/')	$strdate= substr($strdate, 0, strlen($strdate)- 1);

	// 対象外の文字列を除去して、変わりにスペースを配置する
//	$strdate= trim(preg_replace("/\s{2,}/", " ", preg_replace("/[^0-9\/\s-]/", " ", $strdate)));

#	print($strdate);

	// 最大文字長より長い場合は削る
	if(strlen($strdate)> 19) {
		$strdate= substr($strdate, 0, 19);
	}


$regexp_ymd2date[0]= <<<END
/^
((?:190[1-9]|19[1-9]\d)|(?:203[0-8]|20[0-2]\d))
(1[0-2]|0[1-9])
(?:$|
	(0[1-9]|[1-2]\d|3[0-1])
	(?:$|
		(2[0-3]|[0-1]\d)
		(5[0-9]|[0-4]\d)
		(?:$|
			(5\d|[0-4]\d)$
		)
	)
)
/
END;

$regexp_ymd2date[1]= <<<END
/^
((?:190[1-9]|19[1-9]\d)|(?:203[0-8]|20[0-2]\d)|\d.)
(?:\/|\-|\s)
(1[0-2]|0[1-9]|[1-9])
(?:$|
	(?:\/|\-|\s)
	(0[1-9]|[1-2]\d|3[0-1]|[1-9])
	(?:$|
		\s
		(2[0-3]|[0-1]\d|\d)
		(?:\:|\s)
		(5[0-9]|[0-4]\d|\d)
		(?:$|
			(?:\:|\s)
			(5[0-9]|[0-4]\d|\d)$
		)
	)
)
/
END;

		$arr_date= array();
		
		/* 正規表現マッチ(データは既に読込み済み */
		for($i= 0; $i< count($regexp_ymd2date); $i++) {
			$regexp= preg_replace("/[\n,\t,\s]/", "", $regexp_ymd2date[$i]);	// 改行やタブの除去
			if(preg_match($regexp, $strdate, $match))	$arr_date= $match;		// 正規表現にマッチングさせてマッチすれば後方参照の値を$arr_dateに組み込む
		}
		
		/* 年月日のチェック (日は指定無しでもOKだが指定されていなければ1日で処理する) */
		if(intval($arr_date[1])> 0)	$year= intval($arr_date[1]);
		else						return;
		if(intval($arr_date[2])> 0)	$month= intval($arr_date[2]);
		else						$month= 1;
		if(intval($arr_date[3])> 0)	$day= intval($arr_date[3]);
		else						$day= 1;
		
		/* 時・分・秒　どれも指定無でもOKで、配列は空で帰ってくるのでintvalで0扱いとなる */
		$hour= 		intval($arr_date[4]);
		$minute=	intval($arr_date[5]);
		$second=	intval($arr_date[6]);
		
		return mktime($hour, $minute, $second, $month, $day, $year);


	}
}

// 年週数から日付を取得する
if(!function_exists('weeknumber2date')) {
	function weeknumber2date($year, $week, $youbi) {
		$tm= ymd2date($year. "0101");
		// 1月1日の曜日分を差し引く
		$tm= dateadd("d", (-1)* date('w', $tm), $tm);
		// 週数＋曜日分だけ加算した数字を吐く
		return dateadd("d", ($week- 1)* 7+ $youbi, $tm);
	}
}

// 日付から年週数を取得する
// 引数の$weekと$youbiに戻りを返す
if(!function_exists('date2weeknumber')) {
	function date2weeknumber($date, &$week, &$youbi) {
		$tm= getdate($date);	// 日付情報の取得
		$week= ceil(($tm['yday']+ date("w", ymd2date(date('Y', $date). "0101"))+ 1)/ 7);
		$youbi= date('w', $date);
		return TRUE; 
	}
}

// 月の最終日を取得する
// 数字として日を返す <- 数字として返すところに注意
if(!function_exists("getlastday")) {
	function getlastday($date) {
	//	return intval(date("d", dateadd("d", -1, ymd2date(date('Ym', dateadd("m", 1, $date)). "01"))));
		return intval(date("d", getlastmonth($date)));
	}
}

if(!function_exists("getlastmonth")) {
	function getlastmonth($date) {
		// dateadd関数は、月差分による月超現象を回避している為利用する
//		return dateadd("d", -1, dateadd("m", 1, ymd2date(date('Ym', $date))));
		return ymd2date(date('Y/m/t', $date));
	}
}

if(!function_exists("getlastdate")) {
	function getlastdate($date) {
		return getlastmonth($date);
	}
}

if(!function_exists("getfirstdate")) {
	function getfirstdate($date) {
		return ymd2date(date('Ym', $date));
	}
}

if(!function_exists("setnichiji")) {
	function setnichiji($fname) {
		$tm= localtime();
		$tm[4]+= 1;
		$tm[5]+= 1900;
		
		$search= array("%Y", "%M", "%D", "%H", "%I", "%S", "%W");
		$string= array($tm[5], sprintf("%02s", $tm[4]), sprintf("%02s", $tm[3]), sprintf("%02s", $tm[2]), sprintf("%02s", $tm[1]), sprintf("%02s", $tm[0]), $tm[6]);
		
		return str_replace($search, $string, $fname);
	}
}

// 営業日を取得する 日付変更時間を第一引数に与えられる（省略時は7時）
if(!function_exists("geteigyobi")) {
	function geteigyobi($dateline_time= 7) {
		$ndate= ymd2date(date('Ymd', time()));	// 日付だけ抽出するので時分を00:00に変更
		
		if( intval( date('H', time()) ) < $dateline_time)	return dateadd("d", -1, $ndate);
		else									return $ndate;
	}
}
?>