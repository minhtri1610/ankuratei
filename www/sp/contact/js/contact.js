var previewImgs = [];                   // 画像データ
var maxWidth = 640, maxHeight = 640;  // 縮小する画像のサイズ
var bid = 0;                            // 画像のＩＤ
var pw = '23%';                // アップロード画像のプレビューサイズ
// グローバル変数
var syncerTimeout = null ;

// IE8 trim関数対応
if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, ''); 
  }
}
// IE8 indexOF関数対応
if (!("indexOf" in Array.prototype)) {
    Array.prototype.indexOf = function(find, i) {
      var n;
      if (i === undefined) i = 0;
      if (i < 0) i += this.length;
      if (i < 0) i = 0;
      n = this.length;
      while (i < n) {
        if (i in this && this[i] === find) return i;
        i++;
      }
      return -1;
    };
}

// 月の変更
function funcChangeMonth(obj) {

    var month = $(obj).children(':selected').val();
    var year = $('#year').children(':selected').val();
    var year = Number(year);
    var isUruYear = (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) ? true : false;
    var selectDay = document.USER_VOICE.hidDay.value;
    var selectdayNum =  (selectDay == '--') ? '--' : Number(selectDay);
  
    if(month !== "") {
      
        // 日をクリア
        clearSelecter('day');

        // 30日の日
        var day30 = ['4', '6', '9', '11'];
        var day31 = ['1', '3', '5', '7', '8', '10', '12'];
        // 日のオブジェクト取得
        var select = document.getElementById("day");
        
        if(day30.indexOf(month) > -1) {
            for(var i = 1; i < 31; i++){
                var visibleDay = document.createElement("option");
                visibleDay.setAttribute("value", i);
                visibleDay.innerHTML = i;
                
                // 選択された日付があれば、それをセット
                if(selectdayNum == i) {
                    visibleDay.setAttribute("selected", true);
                }
                // オプションの追加
                select.appendChild(visibleDay);
            }
        } else if(day31.indexOf(month) > -1) {
            for(var i = 1; i < 32; i++){
                var visibleDay = document.createElement("option");
                visibleDay.setAttribute("value", i);
                visibleDay.innerHTML = i;
                
                // 選択された日付があれば、それをセット
                if(selectdayNum == i) {
                    visibleDay.setAttribute("selected", true);
                }
                // オプションの追加
                select.appendChild(visibleDay);
            }
        } else{
           if(isUruYear == true) {
                for(var i = 1; i < 30; i++){
                var visibleDay = document.createElement("option");
                visibleDay.setAttribute("value", i);
                visibleDay.innerHTML = i;
                
                // 選択された日付があれば、それをセット
                if(selectdayNum == i) {
                    visibleDay.setAttribute("selected", true);
                }
                // オプションの追加
                select.appendChild(visibleDay);
             }
           } else {
                for(var i = 1; i < 29; i++){
                var visibleDay = document.createElement("option");
                visibleDay.setAttribute("value", i);
                visibleDay.innerHTML = i;
                
                // 選択された日付があれば、それをセット
                if(selectdayNum == i) {
                    visibleDay.setAttribute("selected", true);
                }
                // オプションの追加
                select.appendChild(visibleDay);
             }
           }
        }
    } else {
        // 日のオブジェクト取得
        var select = document.getElementById("day");
        for(var i = 1; i < 32; i++){
            var visibleDay = document.createElement("option");
            visibleDay.setAttribute("value", i);
            visibleDay.innerHTML = i;

            // 選択された日付があれば、それをセット
            if(selectdayNum == i) {
                visibleDay.setAttribute("selected", true);
            }
            // オプションの追加
            select.appendChild(visibleDay);
        }
    }

}

// 日付の変更
function funcChangeDay(obj) {
    document.USER_VOICE.hidDay.value = $(obj).children(':selected').val();
}

/*----------------------------------*/
/* マップ画面を開く                 */
/*----------------------------------*/
function funcMapOpen(nHeight, area) {
    var newWin = null;
    if(nHeight == "0"){
        var strWin = "width=1000,scrollbars=yes,toolbar=yes,resizable=yes";
    } else {
        var strWin = "width=1000,height=" + nHeight + ",scrollbars=yes,toolbar=no,resizable=yes";
    }
    if(area !== "") {
        var url = "map.html?area=" + area;
        newWin = window.open(url,"_blank",strWin);
    }
    $('#product').val('');
}

/*----------------------------------*/
/* IOSのwindow.open対応             */
/*----------------------------------*/
function selectArea() {
	funcMapOpen(550, $('#product option:selected').val());
}

// 変数初期化
var tenpoArr = [];

/*----------------------------------*/
/* 都道府県リストボックス制御        */
/*----------------------------------*/
function funcChangeBrand(obj) {

    //都道府県リストボックスの選択項目の初期化
    clearSelecter('ken');
    //市区町村リストボックスの選択項目の初期化
    clearSelecter('shiku');
    //店舗リストボックスの選択項目の初期化
    clearSelecter('tenpo');

    // ブランド名のセット
    var brand = $(obj).children(':selected').val();
    // ブランドに対応した都道府県リストボックスを表示
    var brand_arr = brand.split("_");
    var brand_code = brand_arr[0];

    if (brand_code !== 'brand') {
        //都道府県の取得
        getAddr1(brand_code, 'ken', null);
        // ブランドのみで、店舗を取得
        getTenpo(brand_code, null, null);
    }
}

/*----------------------------------*/
/* 市区郡町村リストボックス制御        */
/*----------------------------------*/
function funcChangeAddr1(obj) {

    //市区町村リストボックスの選択項目の初期化
    clearSelecter('shiku');
    //店舗リストボックスの選択項目の初期化
    clearSelecter('tenpo');

    // 選択された都道府県
    var ken = $(obj).children(':selected').val();
    var ken_arr = ken.split("_");
    var ken_code = ken_arr[0];
    
    // 選択されたブランド
    var brand = $('#brand').children(':selected').val();
    var brand_arr = brand.split("_");
    var brand_code = brand_arr[0];

    if (ken_code == 'ken') {
        // 今まで表示していたリストボックスを非表示にする
        getTenpo(brand_code, null, null);
    } else {
        // 市区町村を取得
        getAddr2(brand_code, ken_code, 'shiku');
        // ブランドと都道府県で、店舗を取得
        getTenpo(brand_code, ken_code, null);
    }
}

/*----------------------------------*/
/* ご利用店舗名リストボックス制御    */
/*----------------------------------*/
function funcChangeAddr2(obj) {

    //店舗リストボックスの選択項目の初期化
    clearSelecter('tenpo');

    // 選択された都道府県
    var ken = $('#ken').children(':selected').val();
    var ken_arr = ken.split("_");
    var ken_code = ken_arr[0];

    // 選択されたブランド
    var brand = $('#brand').children(':selected').val();
    var brand_arr = brand.split("_");
    var brand_code = brand_arr[0];

    // 選択された市区町村
    var shiku = $(obj).children(':selected').val();
    var shiku_arr = shiku.split("_");
    var shiku_code = shiku_arr[0];

    if (shiku_code == 'shiku') {
        // 今まで表示していたリストボックスを非表示にする
        getTenpo(brand_code, ken_code, null);
    } else {
        // 今まで表示していたリストボックスを非表示にする
        getTenpo(brand_code, ken_code, shiku_code);
    }
    
}

/*----------------------------------*/
/* ご利用店舗名の反映               */
/*----------------------------------*/
function funChangeTenpo(obj) {

    $('.active').next().hide("slow");
    $('.active').removeClass('active');
    
    // 選択された店舗
    var tenpo = $(obj).children(':selected').val();
    var tenpo_arr = tenpo.split("_");
    var tenpo_code = tenpo_arr[0];
    var tenpo_name = tenpo_arr[1];
    
    // 店舗名が選択されていた場合、店舗名を反映
    if ($(obj).children(':selected').val() !== 'tenpo') {
        // 選択されたブランド
        var brand = $('#brand').children(':selected').val();
        var brand_arr = brand.split("_");
        // ブランド名のセット
        var brand_name = brand_arr[1];
        document.USER_VOICE.hidBrand.value = brand_name;
        
        // 選択された都道府県
        var ken = $('#ken').children(':selected').val();
        var ken_arr = ken.split("_");
        var ken_code = ken_arr[0];
        if (ken_code !== 'ken') {
            // 都道府県のセット
            var ken_name = ken_arr[1];
            document.USER_VOICE.hidAddr1.value = ken_name;
        }
        
        // 選択された市区町村
        var shiku = $('#shiku').children(':selected').val();
        var shiku_arr = shiku.split("_");
        var shiku_code = shiku_arr[0];
        if(shiku_code !== 'shiku') {
           // 市区町村のセット
           var shiku_name = shiku_arr[1];
           document.USER_VOICE.hidAddr2.value = shiku_name;
        }
        
        document.getElementById('decisionName').value = tenpo_name;
        document.USER_VOICE.hidTenpo.value = tenpo_name;
        document.USER_VOICE.hidTenpoCd.value = tenpo_code;
    } else {
        // データクリア
        document.getElementById('decisionName').value = '';
        document.USER_VOICE.hidBrand.value = null;
        document.USER_VOICE.hidAddr1.value = null;
        document.USER_VOICE.hidAddr2.value = null;
        document.USER_VOICE.txtTenpo2.value = null;
        document.USER_VOICE.hidTenpo.value = null;
        document.USER_VOICE.hidTenpoCd.value = null;
    }
    
}

/*----------------------------------*/
/* 店舗自由入力チェックボックス        */
/*----------------------------------*/
function funcFreeTenpo() {
    if (document.USER_VOICE.freeTenpo.checked) {
        document.USER_VOICE.txtTenpo.style.background = "#CCCCCC";
        document.USER_VOICE.txtTenpo.style.color = "#CCCCCC";
        document.USER_VOICE.txtTenpo2.style.background = "#FFFFFF";
        document.USER_VOICE.txtTenpo2.readOnly = false;
    } else {
        document.USER_VOICE.txtTenpo.style.background = "#FFFFFF";
        document.USER_VOICE.txtTenpo.style.color = "#000000";
        document.USER_VOICE.txtTenpo2.style.background = "#CCCCCC";
        document.USER_VOICE.txtTenpo2.value = "";
        document.USER_VOICE.txtTenpo2.readOnly = true;
    }
}

/*----------------------------------*/
/* 店舗名のフリーワード検索            */
/*----------------------------------*/
$(document).ready(function () {

    // アプリからのアクセスタイプを取得
    var appTypeObj = funcGetEreaCode();
    var appType = appTypeObj['type'];
    
    // タイプの隠しパラメータにセット
    appType = (appType !== undefined) ? appType : 3;
    document.USER_VOICE.txtType.value = appType

    // 確認画面から戻った際に、登録画像を再表示
    reviewPiction();
    // 登録画像のリサイズ処理を登録
    $('#photo').change(resize);
        
	// 日付のデフォルト値を設定
    var now = new Date();
    var yyyymmdd = now.getFullYear()+
    '/' +
    ( "0"+( now.getMonth()+1 ) ).slice(-2)+
    '/' +
    ( "0"+now.getDate() ).slice(-2);
    var hour =     now.getHours();
    
    $('#datepicker').val(yyyymmdd);
    $('#hour').val(hour);
    
    // 一個目以降を閉じる
    $('.accordion_dl ul:gt(0)').hide();
    
    $('.accordion_dl>div').click(function(){
    	$(this).toggleClass("active");
    	$(this).siblings("div").removeClass("active");
    	$(this).next("ul").slideToggle();
    	$(this).next("ul").siblings("ul").slideUp();
    });
    
    // 画像選択
    $('#select-photo').click(function() {
        
        // 選択処理事前チェック処理
        if( !preCheck() ) {
            return;
        }
        
        // input type="file" のイベント発火
        $('#photo').click();
    });
    
    // フォームの初期化
    initForm();
    
    // ご利用店舗名のブランドから探す初期化
    $('#brand').val('brand');
    $('#ken').val('ken');
    $('#shiku').val('shiku');
    $('#tenpo').val('tenpo');
    
    // サジェストの作成
    $("#keywordTenpo").autocomplete({
        autoFocus: true,
        source: function (req, resp) {

            // エリア内の店舗検索
            $.ajax({
                type: "post",
                url: "https://www.anrakutei.co.jp/contact/get_tenpo.php",
                data: {
                    freeword: funcCheckValue(req.term)
                },
                dataType: "jsonp",
                jsonp: 'callback',
                success: function (data) {

                    // 店舗
                    if (data.code == 0) {
                        resp(data.tenpo_name);
                        tenpoArr = data.tenpo;
                    } else {
                        //console.log(data);
                    }

                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    //console.log('店舗情報取得に失敗しました。しばらくしてから、ご利用ください。');
                }
            });

        }
    });
    
    // 選択した店舗名を反映
    $('#keywordTenpo').on('autocompleteselect', function (e, ui) {
    	
    	// 店舗コード、店舗名
    	var tenpocd, tenponm;
    	
        document.USER_VOICE.hidBrand.value = null;
        
        for(var key in tenpoArr) {
          if(tenpoArr.hasOwnProperty(key) && tenpoArr[key].hasOwnProperty(ui.item.value)) {
              tenpocd = tenpoArr[key][ui.item.value];
          }
        }
        
        tenponm = funcShortTenponm(tenpocd, ui.item.value);
        
        document.USER_VOICE.hidTenpo.value = tenponm;
        document.USER_VOICE.hidTenpoCd.value = tenpocd;
        document.getElementById('decisionName').value = tenponm;
        
        // キーワードで探すアコーディオン表示を閉じる
        $('.active').next().toggle("slow");
        $('.active').removeClass('active');
    
    });

    // ブランドリスト取得・セレクト作成
    $.ajax({
        type: "post",
        url: "https://www.anrakutei.co.jp/contact/get_brand.php",
        dataType: "jsonp",
        jsonp: 'callback',
        success: function (data) {

            var select = document.getElementById("brand");

            // ブランドリスト
            if (data.code == 0) {
                var brand = data.brand;

                for (var i in brand) {
                    var option = document.createElement("option");

                    option.setAttribute("value", brand[i].brand_code + "_" + brand[i].brand_name);
                    option.innerHTML = brand[i].brand_name;

                    select.appendChild(option);
                }
            } else {
                //console.log(data);
            }

        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            //console.log('ブランドリスト取得に失敗しました。しばらくしてから、ご利用ください。');
        }
    });
});

/*----------------------------------*/
/* 店舗取得                            */
/*----------------------------------*/
function getTenpo(brandCode, kenCode, shikuCode) {

    var select = document.getElementById("tenpo");
    var query = {brand_code: brandCode};

    if (kenCode !== null) {
        query['addr1_code'] = kenCode;
    }

    if (shikuCode !== null) {
        query['addr2_code'] = shikuCode;
    }
    
    // エリア内の店舗検索
    $.ajax({
        type: "post",
        url: "https://www.anrakutei.co.jp/contact/get_tenpo.php",
        data: query,
        dataType: "jsonp",
        jsonp: 'callback',
        success: function (data) {

            // 店舗
            if (data.code == 0) {
                var tenpo = data.tenpo;

                for (var i in tenpo) {
                    var option = document.createElement("option");
                    var tenponm = funcShortTenponm(tenpo[i].tenpo_code, tenpo[i].tenpo_name);
                    
                    option.setAttribute("value", tenpo[i].tenpo_code + "_" + tenponm);
                    option.innerHTML = tenponm;

                    select.appendChild(option);
                }
            } else {
                //console.log(data);
            }

        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            //console.log('店舗情報取得に失敗しました。しばらくしてから、ご利用ください。');
        }
    });
}

/*----------------------------------*/
/* 送信処理                         */
/*----------------------------------*/
function funcSendMail() {
    
    // メールアドレスの正規表現
    var regexp = /^[a-zA-Z0-9\._-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
    
    // 必須項目のチェック、メールアドレスの入力があればチェック
    if (document.USER_VOICE.hidTenpo.value.trim() == '')
    {
        alert('ご利用店舗名は必須項目となります。');
        $('#decisionName').css({'background-color': '#FFE4E1'});
        $('#decisionName').focus();
        //$('body,html').animate({scrollTop: document.getElementById( "decisionName" ).getBoundingClientRect().top + window.pageYOffset}, 500);
    } else if(document.USER_VOICE.txtIken.value.trim() == '') {
        alert('ご意見・ご要望記入欄は必須項目となります。');
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

// SQLインジェクション対応
function funcCheckValue(value) {
    var value = value.replace(/'/g, '"');
    value = value.replace(/;/g, '\;');
    value = value.replace(/--/g, '\--');
    value = value.replace(/%/g, '#%');
    value = value.replace(/_/, '\_');

    return value;
};


// 隠しパラメーラのリセット
function funcResetAll() {
    // 確認ダイアログ表示
    if(window.confirm('入力内容を全て削除します。よろしいですか？')){
        document.USER_VOICE.hidBrand.value = null;
        document.USER_VOICE.hidAddr1.value = null;
        document.USER_VOICE.hidAddr2.value = null;
        document.USER_VOICE.hidTenpo.value = null;
        document.USER_VOICE.hidTenpoCd.value = null;
        document.USER_VOICE.hidImages.value = "--";

        // 画像をクリア
        $('.img-comment').css({'display': 'none'});
        $("#_preview").empty();
        $('#upImg').empty();
        previewImgs = [];
        bid = 0;
        
        return true;    //「OK」時は、リセット実行
    } else {
        return false;    // キャンセル時は、リセット中止
    }
}
