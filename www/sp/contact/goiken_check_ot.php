<?php

    
    $txtIken = $_POST["txtIken"];    // 1．ご意見・ご要望
    $txtName = $_POST["txtName"];    // 2.お名前 
    $rdoSex = $_POST["rdoSex"];      // 3.性別
    $sltAge = $_POST["sltAge"];      // 4.年齢
    $txtZip = $_POST["txtZip"];      // 郵便番号
    // 郵便番号からハイフンを取り除く
    $repZip  = str_replace("-", "", $txtZip);
    $txtZip1 = substr($repZip, 0, 3);	// 先頭３桁
    $txtZip2 = substr($repZip, 3, 4);	// 後ろ４桁
    
    $txtAddr1 = $_POST["txtAddr1"];  //   住所(都道府県・市区郡町村) 
    $txtAddr2 = $_POST["txtAddr2"];  //   住所(○丁目○番地○号) 
    $txtAddr3 = $_POST["txtAddr3"];  //   住所(ビル名・マンション名)
    $txtTel = $_POST["txtTel"];      // 6.電話番号
    $txtMail = $_POST["txtMail"];    // 7.メールアドレス
    $txtType = $_POST["txtType"];    // 投稿種別
    
    // 画像
    foreach($_POST as $key => $value) {
        if(preg_match('/image/', $key) === 1 && $_POST[$key]){
            $postImg = $_POST[$key];
        }
    }
?>
<!DOCTYPE html>
<html lang="ja" dir="ltr">
<head>
<meta charset="UTF-8" />
<title>安楽亭（お問い合わせページ）</title>
<meta name="robots" content="noindex,nofollow" />
<meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no" />
<link rel="stylesheet" href="../css/top2011.css" />
<link rel="stylesheet" href="../css/common2011.css" />
<link rel="stylesheet" type="text/css" href="https://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css" />
<link rel="stylesheet" type="text/css" href="css/import.css" />
<link rel="stylesheet" type="text/css" href="css/mailform.css" />

<script type="application/javascript">
<!--//

var listidx = 52;

//-->
</script>
<script type="text/javascript" src="js/jquery-1.12.2.min.js"></script>
<script type="text/javascript" src="js/jquery.xdomainrequest.min.js"></script>
<script type="text/javascript" src="js/common.js"></script>
<script type="text/javascript" src="../js/top.js"></script>
<script type="text/javascript" src="js/emoji.js"></script>
<script type="text/javascript" src="js/contact2.js"></script>

</head>
<body style="background-color: rgb(255,255,255);">
<!-- contentsWrap  -->
<div id="contentsWrap">
<header id="topPageHeader" style='color:#666666; background-color: rgb(255,255,255); width: 90%;max-width: 550px;'>
<h1 style="width: 50%; text-align: center;">
	<a href="http://k.anrakutei.jp/sp/index.html"><img src="../images/logo.jpg" alt="トップページへ" width="60" height="34"></a>
</h1>
<p class="menuBtn" style="width: auto">
	<a style="margin: 9px auto 7px auto;" href="javascript:void(0)" onclick="slideUpMenu();">メニュー一覧</a>
</p>
</header>

<div class="page-title1">お客様の声</div>

<form id="upload-form" name="USER_VOICE" method="post">

	<div class="page-title2">
		その他のお問い合わせ<br>（入力内容の確認）
		<input type=hidden name="txtType" value="<?=$txtType?>">
	</div>
	
	<hr class="titil_underline">
	
	<dl>
		<dt>お問い合わせ内容</dt>
		<dd class="required">
			<textarea class="comments123" name="txtIkenview" rows=5 cols=69 wrap="hard" readonly><?=$txtIken?></textarea>
			<textarea style="display:none;" class="comments" name="txtIken"><?=$txtIken?></textarea>

			<div id="upImg" style='margin:4px;'>
				<?php
					// 画像
					foreach($_POST as $key => $value) {
						if(preg_match('/image/', $key) === 1 && $_POST[$key]){
							$postImg = $_POST[$key];
							print '<img src="data:image/jpeg;base64,' . $postImg . '" style="width:23%;height:auto;margin:1%;"/>';
							print '<input type="hidden" name="' . $key . '" value="' . $postImg . '"/>';
						}
					}
				?>
			</div>
			<div id="_preview" style='margin:4px;'></div>
		</dd>

		<dt>お名前</dt>
		<dd>
			<input type=hidden name="txtName" value="<?=$txtName?>">
			<span style=font-size:16px;><?=$txtName?></span>
		</dd>

		<dt>性別</dt>
		<dd>
			<input type=hidden name="rdoSex" value="<?=$rdoSex?>">
			<span style=font-size:16px;><?=$rdoSex?></span>
		</dd>

		<dt>年齢</dt>
		<dd>
			<input type=hidden name="sltAge" value="<?=$sltAge?>">
			<span style=font-size:16px;><?=$sltAge?></span>
		</dd>

		<dt>郵便番号</dt>
		<dd>
			<input type=hidden name="txtZip1"  value="<?=$txtZip1?>">
			<input type=hidden name="txtZip2"  value="<?=$txtZip2?>">
			<div style=font-size:16px;>
				〒&nbsp;<?=$txtZip1?>&nbsp;-&nbsp;<?=$txtZip2?>
			</div>
		</dd>

		<dt>住所</dt>
		<dd>
			<input type=hidden name="txtAddr1" value="<?=$txtAddr1?>">
			<input type=hidden name="txtAddr2" value="<?=$txtAddr2?>">
			<input type=hidden name="txtAddr3" value="<?=$txtAddr3?>">
			<div style=font-size:16px;>
				<?=$txtAddr1?><br>
				<?=$txtAddr2?><br>
				<?=$txtAddr3?>
			</div>
		</dd>

		<dt>電話番号</dt>
		<dd>
			<input type=hidden name="txtTel" value="<?=$txtTel?>">
			<span style=font-size:16px;><?=$txtTel?></span>
		</dd>

		<dt>
			<span class="optional">任意</span>メールアドレス
		</dt>
		<dd>
			<input type=hidden name="txtMail" value="<?=$txtMail?>">
			<span style=font-size:16px;><?=$txtMail?></span>
		</dd>
	</dl>
	<div id="send_button">
		<input type="button" class="btnCheck" name="btnSendMail" value="送信" onclick="funcSendMail3()">&nbsp;
		<input type="button" class="btnCheck"                    value="戻る" onclick="self.history.back()">
	</div>
	
<!--【2016/07/13 企画部要望により、削除】
	<div class="freedial">
		(株)安楽亭　お客様相談室<br>
		フリーダイヤル　０１２０−２９８−９５７ <br>
		受付時間　９:００～１８:００
	</div>
-->
	
	<div class="info-box">
		<div class="info-title">【個人情報の取り扱いについて】</div>
		<div class="info-body">
			1. 個人情報の収集・利用の目的<BR>
			　 お問い合わせ・ご意見・ご要望における個人情報の収集は、本サービスの充実や円滑な運営を目的とし、その目的の達成に必要な範囲内で行うものとします。<BR><BR>
			2. 個人情報の利用制限<BR>
			　 個人情報は、目的の範囲内で利用いたします。<BR>
			　 また、お客様の同意なく目的の範囲を超えて利用することはいたしません。<BR><BR>
			3. 第三者への非開示の原則<BR>
			　お客様の個人情報は次の場合を除き、第三者へは提供いたしません。<BR>
			　（1）お客様の同意がある場合<BR>
			　（2）その他法令等に基づく正当な理由がある場合。
		</div>
	</div>
	
</form>

<!-- ここからボタン -->
<p id="pageTop">
	<a href="#">
		<i class="ion-ios-arrow-up"></i>
	</a>
</p>
<!-- ここまでボタン -->

<footer id="topPageFooter">
	<p class="copyright_contact">&copy;Anrakutei Co.,Ltd.</p>
</footer>
</div>
<!-- //contents -->

<!-- menu -->
<nav id="menu">
</nav>
<script src="../js/menu.js"></script>
</body>
</html>
