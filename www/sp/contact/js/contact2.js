// IE8 trim関数対応
if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, ''); 
  }
}

/*----------------------------------*/
/* 送信処理                            */
/*----------------------------------*/
function funcSendMail3(){
    varFlg = confirm('送信を行います。よろしいですか？')
    if (varFlg == true){
        var dmy;
        var dlen;
        var kekka = '';
        var i;
        
        dmy = document.USER_VOICE.txtIken.value;
        dlen = dmy.length;
        
        for(i = 0; i < dlen; i++){
            if(((i + 1) % 400) == 0 )    kekka = kekka + dmy.charAt(i) + '\n';
            else                        kekka = kekka + dmy.charAt(i);
        }
        
        document.USER_VOICE.txtIken.value = kekka;
        
        if( window.FormData ){
            
            // 画像をアップロード
            var file = $('#upload-form');
            var fd = new FormData(file[0]);
            
            $.ajax(
                'https://k.anrakutei.jp/customer_voice/post_customer_voice.php',
                {
                    type: 'post',
                    processData: false,
                    contentType: false,
                    data: fd,
                    dataType: "json",
                    success: function(data) {
                        if(data.code == '00') {
                            window.location.href = 'https://k.anrakutei.jp/sp/contact/goiken_kanryo.html';
                        }
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                    }
            });        
        } else {
            var param = {};
            
            $($('#upload-form').serializeArray()).each(function(i, v) {
                param[v.name] = v.value;
            });
            
            $.ajax({
              url: 'https://k.anrakutei.jp/customer_voice/post_customer_voice.php',
              data: param,
              contentType: 'text/plain',
              type: 'POST',
              dataType: 'json'
            }).done(function(data) {
                if(data.code == '00') {
                    window.location.href = 'https://k.anrakutei.jp/sp/contact/goiken_kanryo.html';
                }
            });
        }
    }
}

$(document).ready(function () {
	
	// フォームの初期化
	initForm();
	
	// 絵文字変換対応
	var $text = $('.comments');
	var html = $text.html().trim().replace(/\n/g, '<br/>');
	html = jEmoji.softbankToUnified(html);
	html = jEmoji.googleToUnified(html);
	html = jEmoji.docomoToUnified(html);
	html = jEmoji.kddiToUnified(html);
	$text.html(jEmoji.unifiedToCODE(html));
});
