<?
require_once "DB.php";

/*-------- PEARでデータベースに接続する --------*/
// Pearを使用してデータベースに接続するためのモジュールです
// PearのDSN文字設定が面倒なので作成しました。それ以上のことを行いません
// PEAR接続文字列を直接毎回指定できるならば別にそれに越したことはないので
// わざわざこれを使う必要はありません
// 
// 引数にそれぞれの値を入れてください
//  $dbType :  データベースの種類( 例: "pgsql" "mysql")
//  $dbHost :  データベースのサーバ( 例: "localhost" "10.90.1.18" "redqueen")
//  $dbName :  接続データベース名( 例:  "yakiniku" "menusell")
//  $dbUser :  ユーザ名
//  $dbPass :  パスワード

if(!function_exists("connectdb")) {
	function connectdb($dbType, $dbHost, $dbName, $dbUser, $dbPass, $dbPort= 0, $dbSchema= '') {
		
		if($dbPort> 0)	$dbHost= "tcp(". $dbHost. ":". $dbPort. ")";
		
		if(strlen($dbPass)> 0)	$dsn= $dbType. '://'. $dbUser. ':'. $dbPass. '@'. $dbHost. '/'. $dbName;
		else					$dsn= $dbType. '://'. $dbUser.               '@'. $dbHost. '/'. $dbName;
		
		$db= &DB::connect($dsn);
		//echo "dd";
		//if(DB::isError($db))die("connect error");
		if(DB::isError($db))	return FALSE;
		// pgsqlの場合、seq_scanを無効にする
		if(strtoupper($dbType)== "PGSQL")	$db->query("set enable_seqscan to false");
		// schemaを指定されている場合、スキーマを変更する
		if(strlen($dbSchema)> 0) {
			$res= $db->query("set search_path to $dbSchema");
			if(DB::isError($res))	return FALSE;
		}
		
		return $db;
	}
}

if(!function_exists("connectdb_act")) {
	function connectdb_act() {
		$db= connectdb(DB_TYPE, DB_HOST, DB_NAME, DB_USER, DB_PASS);

		return $db;
	}
}

/* DBのクエリー結果のエラーチェック */
// エラーであれば、エラーメッセージと結果表示及び、終了までを行う
if(!function_exists("errorexitdb")) {
	function errexitdb($connection_object, $db_resultset, $error_message, $error_linenumber) {
		if(DB::isError($db_resultset)) {
			$connection_object->rollback();								// DBのトランザクションを失敗で終了させる
			print("$error_message\n");										// エラーメッセージを表示する
			print_r($db_resultset);										// 結果セットの中身を吐き出す
			print("DB QUERY ERROR STOP: $error_linenumber\n");			// 終了行の表示を行って終了する
			die("--- Emergency halt by function 'errexitdb' ---\n");		// この関数が終了させたことを明記する
		}
	}
}

/*------------- DBエラーメッセージ -------------*/
define("DB_MSG_ERR_DB_CONNECT", "サーバに接続できません");
?>
