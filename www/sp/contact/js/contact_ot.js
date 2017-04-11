var previewImgs = [];                   // 画像データ
var maxWidth = 640, maxHeight = 640;  // 縮小する画像のサイズ
var bid = 0;                            // 画像のＩＤ
var pw = '23%';                // アップロード画像のプレビューサイズ

// IE8 trim関数対応
if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, ''); 
  }
}

/*----------------------------------*/
/* 画像処理                         */
/*----------------------------------*/
$(document).ready(function () {

    // アプリからのアクセスタイプを取得
    var appTypeObj = funcGetEreaCode();
    var appType = appTypeObj['type'];

    // タイプの隠しパラメータにセット
    appType = (appType !== undefined) ? appType : 4;
    document.USER_VOICE.txtType.value = appType

    // フォームの初期化
    initForm();
    
    // 確認画面から戻った際に、登録画像を再表示
    reviewPiction();
    
    // 登録画像のリサイズ処理を登録
    $('#photo').change(resize);
    
    // 画像選択
    $('#select-photo').click(function() {
        
        // 選択処理事前チェック処理
        if( !preCheck() ) {
            return;
        }
        
        // input type="file" のイベント発火
        $('#photo').click();
    });
});

/*----------------------------------*/
/* 送信処理                            */
/*----------------------------------*/
function funcSendMail_ot() {
    
    // メールアドレスの正規表現
    var regexp = /^[a-zA-Z0-9\._-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
    
    // 必須項目のチェック
    if (document.USER_VOICE.txtIken.value == '')
    {
        alert('お問い合わせ内容を入力して下さい。');
        $('#comments').css({'background-color': '#FFE4E1'});
        $('#comments').focus();
    } else if (
        ((document.USER_VOICE.txtMail.value.trim() !== '') ||
         (document.USER_VOICE.txtMail1.value.trim() !== '')) &&
         (document.USER_VOICE.txtMail.value.trim() !== document.USER_VOICE.txtMail1.value.trim())
    ) {
        alert('メールアドレスが一致していません。');
    } else if (
        ((document.USER_VOICE.txtMail.value.trim() !== '') &&
         (document.USER_VOICE.txtMail1.value.trim() !== '')
        ) &&
        (document.USER_VOICE.txtMail.value.match(regexp) === null ||
         document.USER_VOICE.txtMail1.value.match(regexp) === null)
    ) {
        alert('メールアドレスが正しくありません。');
    } else {
        var dmy;
        var dlen;
        var kekka = '';
        var i;

        dmy = document.USER_VOICE.txtIken.value;
        dlen = dmy.length;

        for (i = 0; i < dlen; i++) {
            if (((i + 1) % 400) == 0)
                kekka = kekka + dmy.charAt(i) + '\n';
            else
                kekka = kekka + dmy.charAt(i);
        }
        document.USER_VOICE.submit();
    }
}

// 隠しパラメーラのリセット
function funcResetAll() {
	// 確認ダイアログ表示
	if(window.confirm('入力内容を全て削除します。よろしいですか？')){
		document.USER_VOICE.hidAddr1.value = null;
		document.USER_VOICE.hidAddr2.value = null;
		document.USER_VOICE.hidImages.value = "--";

		// 画像をクリア
		$('.img-comment').css({'visibility': 'hidden'});
		$("#_preview").empty();
		$('#upImg').empty();
		previewImgs = [];
		bid = 0;
		
		return true;	//「OK」時は、リセット実行
	} else {
		return false;	// キャンセル時は、リセット中止
	}
}
