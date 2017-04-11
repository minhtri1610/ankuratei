/*----------------------------------*/
/* 店舗名の短縮処理                 */
/*----------------------------------*/
function funcShortTenponm(tenpoCode, tenpoName) {

	// 店舗名の初期化
	var tenponm = tenpoName;
	
	switch(tenpoCode)
	{
		case '1026':
			tenponm = 'カルビ本舗 浦和大谷口店';
			break;
		case '7120':
	  		tenponm = '龍饗 亀ヶ谷店';
	  		break;
	  	case '7606':
	  		tenponm = '和牛カルビ屋 東大宮店';
	  		break;
		default:
	  		tenponm = tenpoName;
	}
	
    return tenponm;
}

/*----------------------------------*/
/* 都道府県取得                     */
/*----------------------------------*/
function getAddr1(brandCode, id, selectedElement) {

    var select = document.getElementById(id);
    var queryData = {};
    
    if(brandCode !== null) {
        queryData = {
            brand_code: brandCode
        };  
    }

    // エリア内の店舗検索
    $.ajax({
        type: "post",
        url: "https://www.anrakutei.co.jp/contact/get_ken.php",
        data: queryData,
        dataType: "jsonp",
        jsonp: 'callback',
        success: function (data) {

            // 店舗
            if (data.code == 0) {
                var ken = data.ken;

                for (var i in ken) {
                    var option = document.createElement("option");

                    option.setAttribute("value", ken[i].addr1_code + "_" + ken[i].addr1_name);
                    option.innerHTML = ken[i].addr1_name;
                    
                    if(selectedElement == ken[i].addr1_code) {
                        option.setAttribute("selected", true);
                    }
                    
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
/* 市区町村取得                        */
/*----------------------------------*/
function getAddr2(brandCode, kenCode, id) {

    var select = document.getElementById(id);
    var queryData = {};
    
    if(brandCode !== null) {
        queryData = {
            brand_code: brandCode,
            ken_code: kenCode
        }; 
    } else {
        queryData = {
            ken_code: kenCode
        }; 
    }
    

    // エリア内の店舗検索
    $.ajax({
        type: "post",
        url: "https://www.anrakutei.co.jp/contact/get_shiku.php",
        data: queryData,
        dataType: "jsonp",
        jsonp: 'callback',
        success: function (data) {

            // 店舗
            if (data.code == 0) {
                var shiku = data.shiku;

                for (var i in shiku) {
                    var option = document.createElement("option");

                    option.setAttribute("value", shiku[i].addr2_code + "_" + shiku[i].addr2_name);
                    option.innerHTML = shiku[i].addr2_name;

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
/* セレクトクリア                     */
/*----------------------------------*/
function clearSelecter(id) {

    var select = document.getElementById(id);
    
    // デフォルト値をセット
    $("#" + id).val(id);
    
    var optionNum = select.length - 1;
    for (var j = 0; j < optionNum; j++) {
        select.removeChild(select.lastChild);
    }
}


/*----------------------------------*/
/* 確認画面から戻った際の画像表示   */
/*----------------------------------*/
function reviewPiction() {

    var images = document.USER_VOICE.hidImages.value;

    // 確認画面から戻ってきた際に、画像があるときの処理
    if(images !== '--') {
        
        // 削除コメントを表示
        $('.img-comment').css({'display': 'inherit'});
        
        previewImgs = images.split(',');
        var imageNum = previewImgs.length;
        
        for(var i = 0; i < imageNum; i++) {
            
            // 画像データ
            var displaySrc = 'data:image\/jpeg;base64,' + previewImgs[i];
            
            // プレビューimgタグ
            var previewImg = $('<img>').attr({
                id: 'bid' + i,
                src: displaySrc,
                name: 'file_1',
                title: 'この画像を削除する',
                style: 'width:' + pw + ';height:auto;margin:1%;'
            });
            previewImg.appendTo($('#upImg'));
            
            // 画像データをPOST用inputタグ
            var inputImag = $('<input>').attr({
                type: "hidden",
                name: "life_image" + i,
                id: "imgbid" + i,
                value: previewImgs[i]
            })
            inputImag.appendTo($("#_preview"));
            
            // 画像がクリックされた際、画像を削除する処理
            $('#bid' + i).click(function (e) {
                var r = confirm("この画像を削除しますか？");
                if (r == true) {
                    // 画像を削除する
                    $('#' + e.target.id).remove();
                    $('#img' + e.target.id).remove();
                    
                    // すべての画像が削除された場合の処理
                    if(getImgNum() == 0) {
                    
                        // 削除するコメントを隠す
                        $('.img-comment').css({'display': 'none'});
                        
                        // 画像をクリア
                        document.USER_VOICE.hidImages.value = '--';
                        $("#_preview").empty();
                        $('#upImg').empty();
                        $("#photo").val('');
                        previewImgs = [];
                    } else {
                        
                        // 削除した画像をpreviewImgs配列から削除
                        for(var j = 0; j < previewImgs.length; j++) {
                            var imgText = 'data:image\/jpeg;base64,' + previewImgs[j];
                            if(imgText == e.target.src) {
                                previewImgs.splice(j, 1);
                                break;
                            }
                        }
                        
                        // hidImagesを更新
                        document.USER_VOICE.hidImages.value = previewImgs.join(',');
                    }
                }
            });
        }
        
        // 画像のIDを増やす
        bid = i;
    }
}

/* 読込み中モーダル表示 */
function showLoading() {
    $.blockUI({
        message: '<img src="img/saving.gif" />',
        fadeIn: 0,
        fadeOut: 0,
        overlayCSS:  {
            backgroundColor: '#ccc',
            opacity:         0.6,
            cursor:          'wait'
        },
        css: {
            padding: '5px 10px',
            margin:  0,
            width: '31%',
            left: '31%',
            border: 'none',
            backgroundColor: 'initial'
        }
    });
}

/*----------------------------------------------*/
/* 画像ファイルがアップロードされた際に、       */
/* eオブジェクトの画像をリサイズする処理処理    */
/*----------------------------------------------*/
function resize(e) {

    // ファイル選択ダイアログで「キャンセル」が選択された場合の処理
    if( $("#photo").val() == "" ) {
        // 何もせずに終了
        return;
    }
    
    // ローディングGifの表示
    showLoading();
    
    // 画像削除コメントを表示
    $('.img-comment').css({'display': 'inherit'});
    // 画像ファイル数
    var fileNum = e.target.files.length;
    
    for (var i = 0; i < fileNum; i++) {
        
        // 画像ファイル出なければ、処理を中止
        var file = e.target.files[i];
        if (!file.type.match(/^image\/(png|jpeg|gif)$/))
            return;
            
        // 画像オブジェクトを作成
        var img = new Image();
        var reader = new FileReader();
        
        // 画像を読み込み
        reader.onload = function (e) {
        
            // 対象の画像データを定義
            var data = e.target.result;
            
            img.onload = function () {
            
                var iw = img.naturalWidth, ih = img.naturalHeight;
                var width = iw, height = ih;
                var orientation;

                // JPEGの場合には、EXIFからOrientation（回転）情報を取得
                if (data.split(',')[0].match('jpeg')) {
                    orientation = getOrientation(data);
                }
                // JPEG以外や、JPEGでもEXIFが無い場合などには、標準の値に設定
                orientation = orientation || 1;

                // ９０度回転など、縦横が入れ替わる場合には事前に最大幅、高さを入れ替えておく
                if (orientation > 4) {
                    var tmpMaxWidth = maxWidth;
                    maxWidth = maxHeight;
                    maxHeight = tmpMaxWidth;
                }

                if (width > maxWidth || height > maxHeight) {
                    var ratio = width / maxWidth;
                    if (ratio <= height / maxHeight) {
                        ratio = height / maxHeight;
                    }
                    width = Math.floor(img.width / ratio);
                    height = Math.floor(img.height / ratio);
                }

                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                ctx.save();

                // EXIFのOrientation情報からCanvasを回転させておく
                transformCoordinate(canvas, width, height, orientation);

                // iPhoneのサブサンプリング問題の回避
                // 参照サイト http://d.hatena.ne.jp/shinichitomita/20120927/1348726674
                var subsampled = detectSubsampling(img);
                if (subsampled) {
                    iw /= 2;
                    ih /= 2;
                }
                var d = 1024; // size of tiling canvas
                var tmpCanvas = document.createElement('canvas');
                tmpCanvas.width = tmpCanvas.height = d;
                var tmpCtx = tmpCanvas.getContext('2d');
                var vertSquashRatio = detectVerticalSquash(img, iw, ih);
                var dw = Math.ceil(d * width / iw);
                var dh = Math.ceil(d * height / ih / vertSquashRatio);
                var sy = 0;
                var dy = 0;
                while (sy < ih) {
                    var sx = 0;
                    var dx = 0;
                    while (sx < iw) {
                        tmpCtx.clearRect(0, 0, d, d);
                        tmpCtx.drawImage(img, -sx, -sy);
                        // 何度もImageDataオブジェクトとCanvasの変換を行ってるけど、Orientation関連で仕方ない。本当はputImageDataであれば良いけどOrientation効かない
                        var imageData = tmpCtx.getImageData(0, 0, d, d);
                        var resampled = resample_hermite(imageData, d, d, dw, dh);
                        ctx.drawImage(resampled, 0, 0, dw, dh, dx, dy, dw, dh);
                        sx += d;
                        dx += dw;
                    }
                    sy += d;
                    dy += dh;
                }
                ctx.restore();
                tmpCanvas = tmpCtx = null;
                
                // 画像ID
                bid++;
                
                // リサイズされた画像データ
                var displaySrc = ctx.canvas.toDataURL('image/jpeg', .9);
                
                // プレビューimgタグ
                var previewImg = $('<img>').attr({
                    id: 'bid' + bid,
                    src: displaySrc,
                    name: 'file_1',
                    title: 'この画像を削除する',
                    style: 'width:' + pw + ';height:auto;margin:1%;'
                });
                previewImg.appendTo($('#upImg'));
                
                // 画像データをPOST用inputタグ
                var imgUrl = displaySrc.replace(/^data:image\/jpeg;base64,/, '');
                var inputImag = $('<input>').attr({
                    type: "hidden",
                    name: "life_image" + bid,
                    id: "imgbid" + bid,
                    value: imgUrl
                })
                previewImgs.push(imgUrl);
                inputImag.appendTo($("#_preview"));
                
                // hidImagesをセット
                document.USER_VOICE.hidImages.value = (document.USER_VOICE.hidImages.value == '--') ? 
                                                         imgUrl : 
                                                         document.USER_VOICE.hidImages.value + ',' + imgUrl;
                                                         
                // 画像がクリックされた際、画像を削除する処理
                $('#bid' + bid).click(function (e) {
                    var r = confirm("この画像を削除しますか？");
                    if (r == true) {
                        // 画像を削除する
                        $('#' + e.target.id).remove();
                        $('#img' + e.target.id).remove();
                        
                        // すべての画像が削除された場合の処理
                        if(getImgNum() == 0) {
                        
                            // 削除するコメントを隠す
                            $('.img-comment').css({'display': 'none'});
                            
                            // 画像をクリア
                            document.USER_VOICE.hidImages.value = '--';
                            $("#_preview").empty();
                            $('#upImg').empty();
                            $("#photo").val('');
                            previewImgs = [];
                        } else {
                        
                            // 削除した画像をhidImagesからも削除
                            for(var j = 0; j < previewImgs.length; j++) {
                                var imgText = 'data:image\/jpeg;base64,' + previewImgs[j];
                                if(imgText == e.target.src) {
                                    previewImgs.splice(j, 1);
                                    break;
                                }
                            }
                            
                            // hidImagesを更新
                            document.USER_VOICE.hidImages.value = previewImgs.join(',');
                        }
                
                    }
                });
                
                // 画像のIDを増やす
                bid++;
                
                // ローディングgifを非表示にする
                $.unblockUI();
            }
            img.src = data;
        }
        reader.readAsDataURL(file);
    }
}

/*----------------------------------------------*/
/* hermite filterかけてジャギーを削除する       */
/*----------------------------------------------*/
function resample_hermite(img, W, H, W2, H2) {
    var canvas = document.createElement('canvas');
    canvas.width = W2;
    canvas.height = H2;
    var ctx = canvas.getContext('2d');
    var img2 = ctx.createImageData(W2, H2);
    var data = img.data;
    var data2 = img2.data;
    var ratio_w = W / W2;
    var ratio_h = H / H2;
    var ratio_w_half = Math.ceil(ratio_w / 2);
    var ratio_h_half = Math.ceil(ratio_h / 2);
    for (var j = 0; j < H2; j++) {
        for (var i = 0; i < W2; i++) {
            var x2 = (i + j * W2) * 4;
            var weight = 0;
            var weights = 0;
            var gx_r = 0, gx_g = 0, gx_b = 0, gx_a = 0;
            var center_y = (j + 0.5) * ratio_h;
            for (var yy = Math.floor(j * ratio_h); yy < (j + 1) * ratio_h; yy++) {
                var dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
                var center_x = (i + 0.5) * ratio_w;
                var w0 = dy * dy;
                for (var xx = Math.floor(i * ratio_w); xx < (i + 1) * ratio_w; xx++) {
                    var dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
                    var w = Math.sqrt(w0 + dx * dx);
                    if (w >= -1 && w <= 1) {
                        weight = 2 * w * w * w - 3 * w * w + 1;
                        if (weight > 0) {
                            dx = 4 * (xx + yy * W);
                            gx_r += weight * data[dx];
                            gx_g += weight * data[dx + 1];
                            gx_b += weight * data[dx + 2];
                            gx_a += weight * data[dx + 3];
                            weights += weight;
                        }
                    }
                }
            }
            data2[x2] = gx_r / weights;
            data2[x2 + 1] = gx_g / weights;
            data2[x2 + 2] = gx_b / weights;
            data2[x2 + 3] = gx_a / weights;
        }
    }
    ctx.putImageData(img2, 0, 0);
    return canvas;
};

/*----------------------------------------------*/
/* JPEGのEXIFからOrientationのみを取得する      */
/*----------------------------------------------*/
function getOrientation(imgDataURL) {
    var byteString = atob(imgDataURL.split(',')[1]);
    var orientaion = byteStringToOrientation(byteString);
    return orientaion;

    function byteStringToOrientation(img) {
        var head = 0;
        var orientation;
        while (1) {
            if (img.charCodeAt(head) == 255 & img.charCodeAt(head + 1) == 218) {
                break;
            }
            if (img.charCodeAt(head) == 255 & img.charCodeAt(head + 1) == 216) {
                head += 2;
            }
            else {
                var length = img.charCodeAt(head + 2) * 256 + img.charCodeAt(head + 3);
                var endPoint = head + length + 2;
                if (img.charCodeAt(head) == 255 & img.charCodeAt(head + 1) == 225) {
                    var segment = img.slice(head, endPoint);
                    var bigEndian = segment.charCodeAt(10) == 77;
                    if (bigEndian) {
                        var count = segment.charCodeAt(18) * 256 + segment.charCodeAt(19);
                    } else {
                        var count = segment.charCodeAt(18) + segment.charCodeAt(19) * 256;
                    }
                    for (var i = 0; i < count; i++) {
                        var field = segment.slice(20 + 12 * i, 32 + 12 * i);
                        if ((bigEndian && field.charCodeAt(1) == 18) || (!bigEndian && field.charCodeAt(0) == 18)) {
                            orientation = bigEndian ? field.charCodeAt(9) : field.charCodeAt(8);
                        }
                    }
                    break;
                }
                head = endPoint;
            }
            if (head > img.length) {
                break;
            }
        }
        return orientation;
    }
};

/*----------------------------------------------*/
/* iPhoneのサブサンプリングを検出               */
/*----------------------------------------------*/
function detectSubsampling(img) {
    var iw = img.naturalWidth, ih = img.naturalHeight;
    if (iw * ih > 1024 * 1024) {
        var canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, -iw + 1, 0);
        return ctx.getImageData(0, 0, 1, 1).data[3] === 0;
    } else {
        return false;
    }
}

/*----------------------------------------------*/
/*iPhoneの縦画像でひしゃげて表示される問題の回避*/
/*----------------------------------------------*/
function detectVerticalSquash(img, iw, ih) {
    var canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = ih;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    var data = ctx.getImageData(0, 0, 1, ih).data;
    var sy = 0;
    var ey = ih;
    var py = ih;
    while (py > sy) {
        var alpha = data[(py - 1) * 4 + 3];
        if (alpha === 0) {
            ey = py;
        } else {
            sy = py;
        }
        py = (ey + sy) >> 1;
    }
    var ratio = (py / ih);
    return (ratio === 0) ? 1 : ratio;
};

/*----------------------------------------------*/
/* 画像の表示調整                               */
/*----------------------------------------------*/
function transformCoordinate(canvas, width, height, orientation) {
    if (orientation > 4) {
        canvas.width = height;
        canvas.height = width;
    } else {
        canvas.width = width;
        canvas.height = height;
    }
    var ctx = canvas.getContext('2d');
    switch (orientation) {
        case 2:
            // horizontal flip
            ctx.translate(width, 0);
            ctx.scale(-1, 1);
            break;
        case 3:
            // 180 rotate left
            ctx.translate(width, height);
            ctx.rotate(Math.PI);
            break;
        case 4:
            // vertical flip
            ctx.translate(0, height);
            ctx.scale(1, -1);
            break;
        case 5:
            // vertical flip + 90 rotate right
            ctx.rotate(0.5 * Math.PI);
            ctx.scale(1, -1);
            break;
        case 6:
            // 90 rotate right
            ctx.rotate(0.5 * Math.PI);
            ctx.translate(0, -height);
            break;
        case 7:
            // horizontal flip + 90 rotate right
            ctx.rotate(0.5 * Math.PI);
            ctx.translate(width, -height);
            ctx.scale(-1, 1);
            break;
        case 8:
            // 90 rotate left
            ctx.rotate(-0.5 * Math.PI);
            ctx.translate(-width, 0);
            break;
        default:
            break;
    }
}

/*----------------------------------------------*/
/* アップされた画像数を取得                     */
/*----------------------------------------------*/
function getImgNum() {
    var imgNum = $('#upImg').children('img').length;
    return imgNum;
}

////////////////////////////////////////////////////////////////////////////////////////////////////

/*----------------------------------------------*/
/* トップへ戻るボタン制御処理                   */
/*----------------------------------------------*/
function initTopBtn() {
    var topBtn=$('#pageTop');
    topBtn.hide();

    // ◇ボタンの表示設定
    $(window).scroll(function(){
        if($(this).scrollTop()>80){
            //---- 画面を80pxスクロールしたら、ボタンを表示する
            topBtn.fadeIn();
        } else {
            //---- 画面が80pxより上なら、ボタンを表示しない
            topBtn.fadeOut();
        }
    });

    // ◇ボタンをクリックしたら、スクロールして上に戻る
    topBtn.click(function(){
        $('body,html').animate({scrollTop: 0}, 500);
        return false;
    });
}

////////////////////////////////////////////////////////////////////////////////////////////////////

/*----------------------------------------------*/
/* 投稿フォームの制御処理                       */
/*----------------------------------------------*/
function initForm() {

    var mailform_dt = $('#upload-form dl dt');
    
    // 必須／任意の表示設定
    for(var i=0; i<mailform_dt.length-1; i++){
        if( mailform_dt.eq(i).next('dd').attr('class') == 'required' ){
            $('<span/>')
                .text('必須')
                .addClass('required')
                .prependTo($(mailform_dt.eq(i)));

            $('<span/>')
                .appendTo(mailform_dt.eq(i).next('dd'));
        }else{
            $('<span/>')
                .text('任意')
                .addClass('optional')
                .prependTo($(mailform_dt.eq(i)));
        }
    }
    
    // ENTERキーによるSubmit防止
    $('input').on('keydown', function(e){
        if( (e.which && e.which === 13) || (e.keyCode && e.keyCode === 13) ){
            return false;
        }else{
            return true;
        }
    });
    
    // トップへ戻るボタン初期化
    initTopBtn();
    
}

////////////////////////////////////////////////////////////////////////////////////////////////////

/*----------------------------------------------*/
/* 画像選択ボタン押下時のプレチェック処理       */
/*----------------------------------------------*/
function preCheck() {

    // IE9では、ファイルAPIが使えないので、他のブラウザで登録してもらう。
    if(!$.support.noCloneChecked){
        alert("大変、申し訳ございません。\n画像のアップロードは、Chrome/FireFox/IE10以上のブラウザでお願いします。");
        return false;
    }
    
    // 表示中の画像数
    var imgNum = getImgNum();
    
    // ４枚しかアップされないようにする
    if(imgNum > 3) {
        alert('添付できる画像は４枚までです。');
        return false;
    }
    
    return true;
}

/** 
 * クエリパラメータを取得する 
 * @param なし 
 * @return {result} クエリオブジェクト
 */
function funcGetEreaCode() {
    
    // クエリのパラメータを取得
    if (1 < document.location.search.length) {
        
        // 最初の1文字 (?記号) を除いた文字列を取得
        var query = document.location.search.substring(1);
        // クエリの区切り記号 (&) で文字列を配列に分割
        var parameters = query.split('&');
        // クエリを格納するオブジェクト
        var result = new Object();
        
        for (var i = 0; i < parameters.length; i++) {
        
            // パラメータ名とパラメータ値に分割
            var element = parameters[i].split('=');
            var paramName = decodeURIComponent(element[0]);
            var paramValue = decodeURIComponent(element[1]);

            // パラメータ名をキーとして連想配列に追加
            result[paramName] = decodeURIComponent(paramValue);
            
        }

        return result;
        
    }
    
    return 0;
}