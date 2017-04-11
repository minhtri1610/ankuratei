<?php
/*-----------------------------------------------------------------------------*/
/*                                                                             */
/*                  2005/02/01 AN INFOMATION SERVICE CO,.LTD                   */
/*                                                                             */
/*                  安楽亭社外ＨＰ 店舗のご案内 共通変数         	           	   */
/*                                                           		           */
/*-----------------------------------------------------------------------------*/

	/**************************/
	/* ＤＢ接続用変数         */	
	/**************************/
	// ユーザー名
	$DB_USER = "postgres";		
	// パスワード、ホスト名	
	switch($_SERVER['SERVER_ADDR']){
		case "10.90.1.18":  
			$DB_PASS = "postgres";			
        	$DB_HOST = "10.90.1.18"; 
            break;
		case "10.1.10.42":  
			$DB_PASS = "postgres";			
        	$DB_HOST = "10.90.1.18"; 
            break;
		case "10.1.13.2": 
			$DB_PASS = "";			
        	$DB_HOST = "10.1.10.42"; 
            break;
		default:            
			$DB_PASS = "ankita";			
        	$DB_HOST = "localhost"; 
            break;
	}
	// ＤＢ名
	$DB_NAME = "goiken";
	// dbTypeの設定
	$DB_TYPE = "pgsql";			


	/**************************/
	/* エンコーディングの設定 */
	/**************************/
	// 内部文字エンコーディングの設定："EUC-JP"
	//mb_internal_encoding("EUC-JP") ;	
	// HTTP入力文字エンコーディングの検出："EUC-JP"
	//mb_http_input("EUC-JP") ;	
	// HTTP出力文字エンコーディングの設定："EUC-JP"
	//mb_http_output("EUC-JP") ;
	// 内部文字エンコーディングの設定："EUC-JP"
	mb_internal_encoding("UTF-8") ;	
	// HTTP入力文字エンコーディングの検出："EUC-JP"
	mb_http_input("UTF-8") ;	
	// HTTP出力文字エンコーディングの設定："EUC-JP"
	mb_http_output("UTF-8") ;


	/****************************/
	/* 安楽亭以外の業態名       */
	/****************************/
	//※業態を増やしたときは必ず指定してください※
	//全角の文字数を指定。業態名＋１(スペース分)
	//業態名をロゴに置き換えるのに使用しています
	//BrandCode1：安楽亭
	$aryBrandNum[1] = 0;
	//BrandCode2：素材市場
	$aryBrandNum[2] = 5;
	//BrandCode3：ＴＥＲＲＡ　ＰＬＡＴＥ
	$aryBrandNum[3] = 11;
	//BrandCode4：七輪房
	$aryBrandNum[4] = 4;
	//BrandCod5：からくに屋
	$aryBrandNum[5] = 6;
	//BrandCod6：上海菜館
	$aryBrandNum[6] = 0;
	//BrandCod7：チャイニーズガーデン龍饗
	$aryBrandNum[7] = 12;
	//BrandCod8：カフェビーンズ
	$aryBrandNum[8] = 0;
	//BrandCod9：アグリコ
	$aryBrandNum[9] = 0;
	//BrandCod10：春秋亭
	$aryBrandNum[10] = 3;
	//BrandCod11：Varie
	$aryBrandNum[11] = 0;
	//BrandCod12：素苑
	$aryBrandNum[12] = 10;
	//BrandCod13：まんぼく
	$aryBrandNum[13] = 5;
	//BrandCod14：
	$aryBrandNum[14] = 0;
	//BrandCod15：国産牛カルビ本舗安楽亭
	$aryBrandNum[15] = 12;
	//BrandCod17：飲茶バーロンチャン
	$aryBrandNum[17] = 10;
	//BrandCod18：楽コンセプト
	$aryBrandNum[18] = 7;
	//BrandCod19：和牛カルビ屋安楽亭
	$aryBrandNum[19] = 10;


	/******************************/
	/* 安楽亭以外の業態用コメント */
	/******************************/
	//※業態を増やしたときは必ず指定してください※
	//業態の特徴などを書いてください
	//BrandCode1：安楽亭
	$aryBikouBrand[1] = ""; 
	//BrandCode2：素材市場
	$aryBikouBrand[2] = ""; 
	//BrandCode3：TERRA PLATE
	$aryBikouBrand[2] = ""; 
	//BrandCode4：七輪房
	$aryBikouBrand[4] = "<img src=\"img/imgBrand4_s.jpg\">　は 安楽亭が展開する、炭火の七輪で焼肉を楽しむ 新しいタイプのお店です。"; 
	//BrandCod5：からくに屋
	$aryBikouBrand[5] = ""; 
	//BrandCod6：上海菜館
	$aryBikouBrand[6] = ""; 
	//BrandCod7：チャイニーズガーデン龍饗
	$aryBikouBrand[7] = "<img src=\"img/imgBrand7_s.gif\">　チャイニーズガーデン龍饗　は中華のお店です。"; 
	//BrandCod8：カフェビーンズ
	$aryBikouBrand[8] = ""; 
	//BrandCod9：アグリコ
	$aryBikouBrand[9] = "<a href=\"http://www.anrakutei.co.jp/agrico/index.html\" target=\"blank\"><img src=\"img/imgBrand9_s.gif\" border=\"0\">アグリコ</a>は、イタリアンのお店です。"; 
	//BrandCod10：春秋亭
	$aryBikouBrand[10] = ""; 
	//BrandCod11：Varie
	$aryBikouBrand[11] = "<a href=\"http://www.anrakutei.co.jp/varie/index.html\" target=\"blank\"><img src=\"img/imgBrand11_s.jpg\" border=\"0\">Varie</a>は、厳選された旬の素材を丁寧に仕上げた手作りハンバーグ＆ステーキのお店です。"; 
	//BrandCod13：まんぼく
	$aryBikouBrand[13] = "<img src=\"img/imgBrand13_s.gif\">　は本格炭火焼肉店です。"; 
	//BrandCod14：
	$aryBikouBrand[14] = ""; 
	//BrandCod15：国産牛カルビ本舗安楽亭
	$aryBikouBrand[15] = ""; 
	//BrandCod17：飲茶バーロンチャン
	$aryBikouBrand[17] = ""; 
	//BrandCod18：楽コンセプト
	$aryBikouBrand[18] = ""; 
	//BrandCod19：和牛カルビ屋安楽亭
	$aryBikouBrand[19] = ""; 

	/******************************/
	/* 新店・改装店情報用コメント */
	/******************************/
	//店舗のご案内トップページで表示するコメントです
	// kaiso_flg=1：新店
	$kaiso_comment[1] = "";
	// kaiso_flg=2：改装店：営業時間変更および休業
	$kaiso_comment[2] = "誠に勝手ながら店舗改装のため、下記の通り営業時間の短縮およびお休みさせていただきます。<br>";
	// kaiso_flg=3：改装店：休業のみ
	$kaiso_comment[3] = "誠に勝手ながら店舗改装のため、下記の通りお休みさせていただきます。<br>";
	// kaiso_flg=4：改装店：営業時間変更のみ
	$kaiso_comment[4] = "誠に勝手ながら店舗改装のため、下記の通り営業時間を短縮させていただきます。<br>";
	// kaiso_flg=5：改装店：改装終了
	$kaiso_comment[5] = "";
	// kaiso_flg=6：営業時間変更
	$kaiso_comment[6] = "誠に勝手ながら、下記の通り営業時間を変更させていただきます。<br>";
	// kaiso_flg=7：臨時休業
	$kaiso_comment[7] = "誠に勝手ながら、下記の通りお休みさせていただきます。<br>";
	// kaiso_flg=8：おしらせ
	$kaiso_comment[8] = "";
	// kaiso_flg=9：閉店
	$kaiso_comment[9] = "誠に勝手ながら、下記の通り閉店させていただきます。ご愛顧ありがとうございました。";

	/******************************/
	/* 新店・改装店情報用（簡素） */
	/******************************/
	//店舗情報 詳細ページで表示する用のコメントです
	//ここのコメントは短めにお願いします(武田さん＠事務チームより)
	// kaiso_flg=1：新店
	$kaiso_comment2[1] = "";
	// kaiso_flg=2：改装店：営業時間変更および休業
	$kaiso_comment2[2] = "店舗改装のため休業いたします。<BR>";
	// kaiso_flg=3：改装店：休業のみ
	$kaiso_comment2[3] = "店舗改装のため休業いたします。<BR>";
	// kaiso_flg=4：改装店：営業時間変更のみ
	$kaiso_comment2[4] = "店舗改装のため営業時間を短縮いたします。<BR>";
	// kaiso_flg=5：改装店：改装終了
	$kaiso_comment2[5] = "";
	// kaiso_flg=6：営業時間変更
	$kaiso_comment2[6] = "";
	// kaiso_flg=7：臨時休業
	$kaiso_comment2[7] = "以下の通り休業いたします。<BR>";
	// kaiso_flg=8：おしらせ
	$kaiso_comment2[8] = "";
	function cencode($str,$code = "EUC-JP"){
		return mb_convert_encoding($str,"UTF-8",$code);
	}
	function cencode_r($str){
		return mb_convert_encoding($str,"EUC_JP","UTF-8");
	}
?>
