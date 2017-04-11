/**
 * 作成日：2016/05/28
 * 作成者：許　亜軍
 * 
 * 内容：地図検索関連処理
 * 更新履歴：
 *  ・2016/05/28 作成
 *  ・2016/07/07 スマホサイト対応
 */
 
// マップ
var map;
// 現在エリア中心緯度経度
var initLatlng;
var defaultLat = 35.887531389, defaultLon = 139.630968333;
// マーカーのハンズ
var markerBounds;
// 全店舗のMarker
var mcs = [];
// 情報ウィンドウ
var infowindows = [];
// クリックされたマーカー
var clickedTenpo = null;
// 現在地緯度経度
var currentLat = null, currentLon = null;
// 現在地のマーカー
var currentMarker = null;
var currentWin = null;

// エリアオブジェクト
var areas = {
    '0': {
        'ken': '日本',
        'default_shi': '日本',
        'zoom': 12
    },
    '1': {
        'ken': '埼玉県',
        'default_shi': '埼玉県さいたま市',
        'zoom': 12
    },
    '2': {
        'ken': '茨城県',
        'default_shi': '茨城県石岡市',
        'zoom': 10
    },
    '3': {
        'ken': '栃木県',
        'default_shi': '栃木県栃木市',
        'zoom': 10
    },
    '4': {
        'ken': '群馬県',
        'default_shi': '群馬県伊勢崎市',
        'zoom': 11
    },
    '5': {
        'ken': '千葉県',
        'default_shi': '千葉県佐倉市',
        'zoom': 11
    },
    '6': {
        'ken': '東京都',
        'default_shi': '東京都新宿区',
        'zoom': 12
    },
    '7': {
        'ken': '神奈川県',
        'default_shi': '神奈川県横山市',
        'zoom': 11
    },
    '8': {
        'ken': '静岡県',
        'default_shi': '静岡県静岡市',
        'zoom': 10
    }
};

var areasDefualtVal = {
    '0': '日本',
    '1': '埼玉県さいたま市',
    '2': '茨城県',
    '3': '栃木県',
    '4': '群馬県',
    '5': '千葉県千葉市',
    '6': '東京都新宿区',
    '7': '神奈川県横浜市',
    '8': '静岡県'
};

// ブランドマーカーアイコン（小さい）
var imageMini = {
    '1': { // 安楽亭
        img: 'map_marker_PC_80x70.png',
        size: {
            w: 80, 
            h: 70
        }
    },
    '4': { // 七輪房
        img: 'map_marker7rin_PC_80x70.png',
        size: {
            w: 80, 
            h: 70
        }
    },
    '5': { // からくに屋
        img: 'map_markerKarakuni_PC_80x70.png',
        size: {
            w: 80, 
            h: 70
        }
    },
    '6': { // 上海菜館
        img: 'map_markerShanghai_PC_70x70.png',
        size: {
            w: 70, 
            h: 70
        }
    },
    '8': { // Benn's
        img: 'map_markerBeans_PC_70x70.png',
        size: {
            w: 70, 
            h: 70
        }
    },
    '9': { // アグリコ
        img: 'map_markerAgrico_PC_70x70.png',
        size: {
            w: 70, 
            h: 70
        }
    },
    '10': { // 春秋亭
        img: 'map_markerShunju_PC_80x70.png',
        size: {
            w: 80, 
            h: 70
        }
    },
    '15': { // 国産牛カルビ本舗
        img: 'map_markerHonpo_PC_95x70.png',
        size: {
            w: 95, 
            h: 70
        }
    },
    '17': { // ロンちゃん
        img: 'map_markerRonchan_PC_80x70.png',
        size: {
            w: 80, 
            h: 70
        }
    },
    '19': { // 和牛カルビ屋
        img: 'map_markerWagyuKarubiya_PC_95x70.png',
        size: {
            w: 95, 
            h: 70
        }
    }
};

// ブランドマーカーアイコン（大きい）
var imageMax = {
    '1': { // 安楽亭
        img: 'map_marker_PC_160x74.png',
        size: {
            w: 160, 
            h: 74
        }
    },
    '4': { // 七輪房
        img: 'map_marker7rin_PC_160x74.png',
        size: {
            w: 160, 
            h: 74
        }
    },
    '5': { // からくに屋
        img: 'map_markerKarakuni_PC_160x74.png',
        size: {
            w: 160, 
            h: 74
        }
    },
    '6': { // 上海菜館
        img: 'map_markerShanghai_PC_74x74.png',
        size: {
            w: 74, 
            h: 74
        }
    },
    '8': { // Benn's
        img: 'map_markerBeans_PC_160x74.png',
        size: {
            w: 160, 
            h: 74
        }
    },
    '9': { // アグリコ
        img: 'map_markerAgrico_PC_74x74.png',
        size: {
            w: 74, 
            h: 74
        }
    },
    '10': { // 春秋亭
        img: 'map_markerShunju_PC_160x74.png',
        size: {
            w: 160, 
            h: 74
        }
    },
    '15': { // 国産牛カルビ本舗
        img: 'map_markerHonpo_PC_128x94.png',
        size: {
            w: 128, 
            h: 94
        }
    },
    '17': { // ロンちゃん
        img: 'map_markerRonchan_PC_160x74.png',
        size: {
            w: 160, 
            h: 74
        }
    },
    '19': { // 和牛カルビ屋
        img: 'map_markerWagyuKarubiya_PC_128x94.png',
        size: {
            w: 128, 
            h: 94
        }
    }
};

// ブランド名
var brands = {
    '1': '安楽亭',
    '4': '七輪房',
    '5': 'からくに屋',
    '6': '上海菜館',
    '8': 'カフェビーンズ',
    '9': 'アグリコ',
    '10': '春秋亭',
    '15': '国産牛カルビ本舗安楽亭',
    '17': '飲茶バーロンチャン',
    '19': '和牛カルビ安楽亭'
};

// 店舗名を決定
function funcSetTenponinfo(tenpocode) {

    if (!window.opener || window.opener.closed) {
        //親ウィンドウが存在しない
        window.close();
    } else {
        tenpo = funcGetTenpo(tenpocode);
        var tenponame = funcShortTenponm(tenpocode, tenpo.getTitle());
        var brandname = brands[tenpo.brand_code];
        
        //window.openerで親ウィンドウのオブジェクトを操作
        window.opener.document.USER_VOICE.hidTenpo.value = tenponame;
        window.opener.$('.active').next().toggle("slow");
        window.opener.$('.active').removeClass('active');
        window.opener.document.getElementById('decisionName').value = tenponame;
        window.opener.document.USER_VOICE.hidTenpoCd.value = tenpocode;
        window.opener.document.USER_VOICE.hidBrand.value = brandname;
        
        window.close();
    }
}

/** 
 * クリックしたマーカーの情報ウィンドウを表示
 * @param {obj} marker 
 * @return なし
 */
function funcAttachMessage(marker) {
    google.maps.event.addListener(marker, 'click', function () {
    
        // 選択された店舗の情報
        var tenponame = marker.getTitle();
        var tenpocode = marker.tenpo_code;
        // 情報ウィンドウステータス
        var isOpened = funcIsOpenedWindow(tenpocode);
        
        // 情報ウィンドウが閉じていれば、それを開く
        if (isOpened == false) {

            // 情報ウィンドウの表示コンテンツを設定
            var contents = '<p class="tenponame">' + marker.getTitle() + '</p>' +
                        '<button type="button" value="決定" onclick="funcSetTenponinfo(' + tenpocode + ')" class="button-pos">' +
                        '<font size="2">この店舗で決定</font>' +
                        '</button>';

            // 情報ウィンドウオプションを設定
            var infoWndOpts = {
                content: contents,
                tenpocode: tenpocode,
                disableAutoPan: true
            };

            // 情報ウィンドウを定義
            var infoWnd = new google.maps.InfoWindow(infoWndOpts);
            
            // 閉じるボタンが押された場合、情報ウィンドウをリストから削除
            google.maps.event.addListener(infoWnd,'closeclick',function(){
                funcCloseWindow(infoWnd.tenpocode);
                if(clickedTenpo.tenpocode == tenpocode) {
                    clickedTenpo = null;
                }
            });

            // 情報ウィンドウを開く
            infoWnd.open(marker.getMap(), marker);

            // 情報ウィンドウを格納
            funcPushWindow(infoWnd);
            
            // クリックされた情報ウィンドウをセット
            if(clickedTenpo !== null) {
                clickedTenpo.close();
            }
            
            clickedTenpo = infoWnd;
        }

    });
}

/** 
 * マップの処理
 * @return なし
 */
function initMap() {

    // クエリパラメート
    var queryPara = (funcGetEreaCode() !== 0) ? funcGetEreaCode() : {area: 1};
    // エリアコードの初期化（1:埼玉県）
    var addr1_code = queryPara.area;
    // 住所検索オブジェクット
    var geocoder = new google.maps.Geocoder();
    //マーカーのハンズ初期化
    markerBounds = new google.maps.LatLngBounds();
    // 日本
    var ken = areas[addr1_code].default_shi;
    var zoom = areas[addr1_code].zoom;
    
    // クエリパラメータ（日本全体）
    var param = {"addr1_code": 0};
    
    // 県セレクトを生成
    getAddr1(null, 'ken-select-box', addr1_code);
    // 市区町村を生成
    getAddr2(null, addr1_code, 'shiku-select-box');

    // 日本を検索
    geocoder.geocode({'address': ken}, function (results, status) {
        
        // 日本の検索成功
        if (status === google.maps.GeocoderStatus.OK) {
            
            var initLatlng = results[0].geometry.location;
            
            // 地図の初期化
            map = new google.maps.Map(
                    document.getElementById('map'),
                    {
                        zoom: zoom,
                        center: initLatlng,
                        mapTypeControl: false
                    });
            // ビジネスPOIを非表示
            var styleOptions = [
                    {
                        featureType:'poi.business',//ビジネスに関連するものを指定
                        elementType:'all',//ビジネスに関連するすべて
                        stylers:[{visibility: 'off' }]//非表示設定
                    }
                    ];
            // 現在地マーカーをセット
            if(addr1_code == 0) {
                funcMovotoCurrent();
            }
            
            // スタイルをセット
            map.setOptions({styles: styleOptions});
    
            // ズーム変更処理
            map.addListener('zoom_changed', function () {
                var zoom = map.getZoom();
                resizeMarker(zoom);
            });

            // 店舗検索
            $.ajax({
                type: "post",
                url: "https://www.anrakutei.co.jp/contact/get_tenpo.php",
                data: param,
                dataType: "jsonp",
                jsonp: 'callback',
                async: false,
                success: function (data) {

                    // 店舗数
                    var tenpoNum = data.tenpo.length;

                    // すべての店舗のマーカーを作成
                    for (var i = 0; i < tenpoNum; i++) {

                        // 緯度、経度
                        var lat = parseFloat(data.tenpo[i].lat);
                        var lng = parseFloat(data.tenpo[i].lon);
                        // 業種アイコン、アイコンサイズ
                        var iconImage = './img/' + imageMini[data.tenpo[i].brand_code].img;
                        var w = imageMini[data.tenpo[i].brand_code].size.w * 0.5;
                        var h = imageMini[data.tenpo[i].brand_code].size.h * 0.5;
                        
                        // エリア内マーカーをハンズへセット
                        if (addr1_code == data.tenpo[i].addr1_code) {
                            markerBounds.extend(new google.maps.LatLng(lat, lng));
                        }

                        // マーカー作成
                        var marker = new google.maps.Marker({
                            position: {
                                lat: lat, 
                                lng: lng
                            },
                            map: map,
                            title: data.tenpo[i].tenpo_name,
                            icon: {
                                url: iconImage,
                                scaledSize: new google.maps.Size(w, h)
                            },
                            addr1_code: data.tenpo[i].addr1_code,
                            addr2_code: data.tenpo[i].addr2_code,
                            brand_code: data.tenpo[i].brand_code,
                            tenpo_code: data.tenpo[i].tenpo_code
                        });

                        // マーカークリック時に、情報ウィンドウを表示
                        funcAttachMessage(marker);

                        // マーカーを全国マーカー配列に格納
                        mcs.push(marker);
                        
                    }
                    
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    //alert('店舗情報取得に失敗しました。しばらくしてから、ご利用ください。');
                }
            });
        } else {
            //alert('店舗情報取得に失敗しました。しばらくしてから、ご利用ください。');
        }
    });

}

/** 
 * 選択したエリアへ地図を移動
 * @param {string} area
 * @param {string} shiku
 * @return なし
 */
function funcMoveMap(area, shiku) {
    
    if(shiku == null) {
        // 住所検索オブジェクット
        var geocoder = new google.maps.Geocoder();
        var ken = areas[area].default_shi;
        var zoom = areas[area].zoom;
        
        // 日本を検索
        geocoder.geocode({'address': ken}, function (results, status) {
            map.setZoom(zoom);
            map.setCenter(results[0].geometry.location);
        });    
    } else {
        // 全マーカーの数
        var markerNum = mcs.length;
        // マーカーのハンズ初期化
        markerBounds = new google.maps.LatLngBounds();

        // 指定した県へ移動
        if (shiku == null) {
            for (var i = 0; i < markerNum; i++) {
                if (area == mcs[i].addr1_code) {
                    markerBounds.extend(mcs[i].getPosition());
                }
            }
        } else {
            // 指定した市区へ移動
            for (var i = 0; i < markerNum; i++) {
                if ((area == mcs[i].addr1_code && shiku == mcs[i].addr2_code)) {
                    markerBounds.extend(mcs[i].getPosition());
                }
            }
        }
    
        // ハンズ内のマーカーを全部入るように地図を表示
        map.fitBounds(markerBounds);    
    }
}

/** 
 * 地図用の市区郡町村リストボックス制御
 * @param {obj} obj
 * @return なし
 */
function funcChangeKen(obj) {

    //市区町村リストボックスの選択項目の初期化
    clearSelecter('shiku-select-box');

    // 選択された都道府県
    var ken = $(obj).children(':selected').val();
    var ken_arr = ken.split("_");
    var ken_code = ken_arr[0];
    
    if(ken_code === 'current') {
        // 現在地周辺へ移動
        funcMovotoCurrent();
    } else {
        // 指定エリアへ移動
        funcMoveMap(ken_code, null);
        
        if (ken_code !== 'ken-select-box') {
            // 市区町村を取得
            getAddr2(null, ken_code, 'shiku-select-box');
        }
    }
    
}

/** 
 * マーカーのサイズを変更・地図が移動した際の情報ウィンドウ処理
 * @param {obj} obj
 * @return なし
 */
function resizeMarker(zoom) {
    
    // マーカーの合計数
    var markerNum = mcs.length;
    
    if (zoom < 13) {
        // ズームレベルが１３未満なら、小さいアイコンを利用
        for (var i = 0; i < markerNum; i++) {
            // 業種アイコン
            var iconImage = './img/' + imageMini[mcs[i].brand_code].img;
            var w = imageMini[mcs[i].brand_code].size.w * 0.5;
            var h = imageMini[mcs[i].brand_code].size.h * 0.5;

            mcs[i].setIcon({url: iconImage,
                scaledSize: new google.maps.Size(w, h)
            });
        }
    } else {
        // ズームレベルが１３以上なら、大きいアイコンを利用
        for (var i = 0; i < markerNum; i++) {
            // 業種アイコン
            var iconImage = './img/' + imageMax[mcs[i].brand_code].img;
            var w = imageMax[mcs[i].brand_code].size.w * 0.5;
            var h = imageMax[mcs[i].brand_code].size.h * 0.5;

            mcs[i].setIcon({url: iconImage,
                scaledSize: new google.maps.Size(w, h)
            });

        }
    }
}

/** 
 * 地図用の市区郡町村リストボックス制御
 * @param {obj} obj
 * @return なし
 */
function funcChangeShiku(obj) {

    // 選択された都道府県
    var ken = $('#ken-select-box').children(':selected').val();
    var ken_arr = ken.split("_");
    var ken_code = ken_arr[0];

    // 選択された市区町
    var shiku = $(obj).children(':selected').val();
    var shiku_arr = shiku.split("_");
    var shiku_code = shiku_arr[0];
    
    if(shiku_code !== 'shiku-select-box') {
        // 指定エリアへ移動
        funcMoveMap(ken_code, shiku_code);
    } else {
        // 指定エリアへ移動
        funcMoveMap(ken_code, null);
    }
}

/** 
 * 情報ウィンドウを格納
 * @param {obj} infowindow
 * @return なし
 */
function funcPushWindow(infowindow) {

    // 情報ウィンドウの合計数
    var windowNum = infowindows.length;
    // 情報ウィンドウが格納されたかのフラグ
    var flg = true;
    
    // 情報ウィンドウが格納されたかをチェック
    for (var i = 0; i < windowNum; i++) {
        if (infowindows[i].tenpocode == infowindow.tenpocode) {
            flg = false;
        }
    }

    // 情報ウィンドウが格納されていなければ、それを格納
    if (flg == true) {
        infowindows.push(infowindow);
    }

}

/** 
 * 情報ウィンドウが開いたかをチェック
 * @param {string} tenpocode
 * @return {Boolean} true: 開いた, false: 閉じた
 */
function funcIsOpenedWindow(tenpocode) {

    // 情報ウィンドウの合計数
    var windowNum = infowindows.length;
    // 情報ウィンドウが格納されたかのフラグ
    var flg = false;
    
    // 情報ウィンドウが開いたかをチェック
    for (var i = 0; i < windowNum; i++) {
        
        // 情報ウィンドウが閉じていて、情報ウィンドウ配列から削除されていなければそれを削除
        if(infowindows[i] !== undefined && infowindows[i].map == null) {
            funcCloseWindow(infowindows[i].tenpocode);
        } else if (infowindows[i] !== undefined && infowindows[i].tenpocode == tenpocode) {
            // 情報ウィンドウが開いた
            flg = true;
            return flg;
        }
    }

    return flg;
}

/** 
 * 情報ウィンドウを閉じる
 * @param {string} tenpocode
 * @return なし
 */
function funcCloseWindow(tenpocode) {
    
    // 情報ウィンドウの合計数
    var windowNum = infowindows.length;

    // 情報ウィンドウが開いたら、それを閉じて情報ウィンドウ配列から削除
    for (var i = 0; i < windowNum; i++) {

        if (infowindows[i].tenpocode == tenpocode) {
            infowindows[i].close();
            infowindows.splice(i, 1);
            return;
        }
    }
    
}

/** 
 * 店舗コードがtenpocodeのマーカーを返却
 * @param {string} tenpocode
 * @return {obj} マーカー
 */
function funcGetTenpo(tenpocode) {
    
    // マーカーの合計数
    var markerNum = mcs.length;
    
    // 店舗コードがtenpocodeのマーカーを返却
    for (var i = 0; i < markerNum; i++) {
        if (tenpocode == mcs[i].tenpo_code) {
            return mcs[i];
        }
    }
    
}

/** 
 * 現在地へ移動
 * @param {obj} obj
 * @return なし
 */
function funcMovotoCurrent() {

	var currentLatlng = new google.maps.LatLng(defaultLat, defaultLon);
	var currentWinContents = '現在地';
	
	// 現在地のマーカーがすでに表示された場合、それを削除
	if(currentMarker != null) {
    	currentMarker.setMap(null);
    }
    
    // 現在地の吹き大がすでに表示された場合、それを削除
    if(currentWin != null) {
    	currentWin.close();
    }
    
    // 現在地を取得
    // Geolocation APIに対応している
    if( navigator.geolocation ){
        // 現在位置を取得する
        navigator.geolocation.getCurrentPosition( function(position ) {
            
            // 現在地緯度経度
            currentLat = position.coords.latitude;
            currentLon = position.coords.longitude;
            currentLatlng = new google.maps.LatLng(currentLat, currentLon);
            
            // ズームの変更
		    map.setZoom(18);
		    map.setCenter(currentLatlng);
		    
		    // 現在地マーカーを作成
		    currentMarker = new google.maps.Marker({
		        position: currentLatlng,
		        map: map,
		        zIndex: 3
		    });
		    
		    // 現在地吹き出しを作成
		    var currentWinContents = '現在地';
		    currentWin = new google.maps.InfoWindow({
		        content: currentWinContents,
		        position: currentLatlng,
		        pixelOffset: new google.maps.Size(0, -25)
		    });
		    
		    currentWin.open(map);
        },
        function(error) {
        
            // エラーコードのメッセージを定義
            var errorMessage = {
                0: "原因不明のエラーが発生しました。" ,
                1: "位置情報の取得が許可されませんでした。" ,
                2: "電波状況などで位置情報が取得できませんでした。" ,
                3: "位置情報の取得に時間がかかり過ぎてタイムアウトしました。" ,
            };
            
            // デフォルト地にズームイン
		    map.setZoom(15);
		    map.setCenter(currentLatlng);
		    
            alert(errorMessage[error.code]);
        },
        {
            'enableHighAccuracy': false ,
            'timeout': 8000 ,
            'maximumAge': 5000
        }) ;
        
    } else {
    
    	// デフォルト地にズームイン
	    map.setZoom(5);
	    map.setCenter(currentLatlng);
		    
        // 現在位置を取得できない場合の処理
        alert( "あなたの端末では、現在位置を取得できません。" ) ;
    }
}