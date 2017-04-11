<?php
/*---------- データベースのエラーをチェックしエラーが発生していた場合はエラーを出力し終了します ----------*/
/*
  Argument:
    $con :    データベースのコネックション(rollbackに使用します)
    $result:  結果セット(DB::isErrorで判定します)
    $message: エラーメッセージ(エラーが発生した事とエラー内容は自動で出力します)
    $file:    エラー発生のファイル名を指定します(__FILE__定数推奨)
    $line:    エラー発生の行数を指定します(__LINE__定数推奨)
*/
if(!function_exists("DBErrExit")) {
	function DBErrExit($con, $result, $message= "", $file= "", $line= "") {
		
		if(DB::isError($result)) {
			
			print($result->getUserInfo());
			
			$con->rollback();
			$con->disconnect();
			
			$message= mb_convert_encoding($message, "sjis", "utf8");
			print("$message [ $file: $line ]\n");
			print("------ err exit by ". __FILE__. ":". __FUNCTION__. " ------\n");
			exit;
		}
	}
}

/*---------- isErrorがTRUEの場合、メッセージを表示して終了します ----------*/
/*
  ---注意--- 最初の引数は『エラー時』がTRUEになるようにしてください -----
  
  Argument:
    $iserror:      エラーの有無を判断します、TRUEである場合エラーと認識します
    $msg:          エラー時に表示する内容を指定します
    $html:         エラーをHTMLで出力するかどうかを指定します(HTMLで出力する場合、html_optionsも指定できます
    $encode:       出力エンコードを指定します(省略可能 デフォルトはUTF-8)
    $html_options: HTML出力する際のオプションを連想配列で指定できます
                      header : HTMLの<HEAD>に囲われた中を指定できます。通常の<HEAD>の中と同様の記述をしてください
                      footer : </doby>と</html>の間を記述できます
                      bgcolor: 画面の背景色を決定できます
                      fgcolor: 文字色を指定できます
*/
if(!function_exists("ErrMsgExit")) {
	function ErrMsgExit($iserror, $msg, $encode= "UTF-8", $html= FALSE, $html_options= array()) {
		if($iserror) {
			if($html) {
				if(strlen($html_options['header'])== 0)		$html_options['header']= "";
				if(strlen($html_options['footer'])== 0)		$html_options['footer']= "";
				if(strlen($html_options['bgcolor'])== 0)	$html_options['bgcolor']= "#ffffff";
				if(strlen($html_options['fgcolor'])== 0)	$html_options['fgcolor']= "#000000";
				
				if(strlen($bgcolor)== 0 && defined("DEFAULT_BGCOLOR"))	$bgcolor= DEFAULT_BGCOLOR;
			header("content-type: text/html; charset=$encode");
print<<<END
<html>
<head>
{$html_options['header']}
</head>
<body bgcolor={$html_options['bgcolor']}>
<div style='text-align: center; color: {$html_options['fgcolor']};'>$msg</div>
</body>
{$html_options['footer']}
</html>
END;
			}
			else	die(mb_convert_encoding($msg, $encode, "UTF-8"));
		}
	}
}
?>