/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* --------------------コントローラー関数作成スタート--------------------*/
/*
 * マップ関連処理
 *
 * @param  $scope                       Angular Js標準サービス
 * @param　GetTenpoinfoSV               店舗情報取得サービス
 * @param　$timeout                     Angular Js標準サービス
 * @param　ShareTenpoInfoSV             一店舗の店舗情報を共有するサービス
 * @param　UpdateDbSV                   店舗更新データ取得サービス
 * @param  GetServiceIconSV             サービスアイコンデータ取得サービス
 * @param  GetServiceIconLastUpdateSV   サービスアイコン最新更新日付取得
 * @returns null
 */
MapCtrl = function ($scope, $timeout, GetTenpoinfoSV, ShareTenpoInfoSV, UpdateDbSV, GetServiceIconSV, GetServiceIconLastUpdateSV, SharedSearchResultSV, ProgressSV) {

    // IOSスタイルを指定
    if (ons.platform.isIOS()) {
        $scope.iosStyle = "{'padding-top': '" + (10 + (1000 / scale)) + "px'}";
        $scope.iosLeftStyle = "{'padding': '0px'}";
        $scope.iosCenterStyle = "{'margin-top': '-10px'}";
        $timeout(function () {
            // OSのステータスバー表示エリアの背景セット
            $('ons-page#cmap').prepend('<div class="statusbar" id="map-status" style="zoom:' + (10000 / scale) + '%"></div>');
        }, 300);
    } else {
        $scope.iosStyle = "{}";
        $scope.iosLeftStyle = "{}";
        $scope.iosCenterStyle = "{}";
    }

    $scope.clickedMarkerName = null;    // クリックされたマーカー
    $scope.readonly = false;            // 検索可能
    $scope.disabled = false;            // 現在地の表示可能
    $scope.TenpoTimer = null;           // 画像ダウンロードタイマー

    // 画像ダウンロード関連変数初期化
    var countAlert = 0;

    // サービス画像の保存先
    serviceIconPath = (device.platform === 'Android') ? ("../" + serviceIconPath) : serviceIconPath;

    // ファイルパス
    $scope.serviceIconLocalDir = rootDir + serviceIconPath;        // サービス画面の画像保存先（ローカル）
    $scope.serviceIconSrvlDir = serverUrl + "sp2/service_icon/";   // サービス画面の画像保存先（サーバー）

    // バックボタンが押された時の処理
    $scope.backDeal = function () {

        // スライドメニューが開いていなければ、アプリを閉じる
        if (menu.isMenuOpened() === false) {
            navigator.notification.confirm("アプリを終了しますか？",
                    function (index) {
                        if (index === 2) { // OKボタンが押された
                            // アプリを閉じる
                            KillApp.killProcess();
                        }
                    },
                    '',
                    ['いいえ', 'はい']
                    );
        } else {
            // スライドメニューが開いたら、スライドメニューを閉じる
            menu.closeMenu();
        }

    };

    // Google Play開発者サービスのダウンロード
    $scope.downloadGoogleFM = function () {

        var googleFrameWorkDownlodUrl = 'https://play.google.com/store/apps/details?id=com.google.android.gms&hl=ja';

        //失敗のときの処理
        navigator.notification.confirm(
                'Google Play開発者サービスが必要です。本アプリを終了し、Google Play開発者サービスをダウンロードしますか？', // メッセージ
                function (btnindex) {
                    if (btnindex === 1) { // ダウンロードが押された場合、アプリケーションをインストールする
                        // アプリを閉じる
                        KillApp.killProcess();
                        cordova.InAppBrowser.open(googleFrameWorkDownlodUrl, '_system', 'location=yes');
                    } else {
                        navigator.notification.alert(
                                'ダウンロードがキャンセルされました。「店舗」サービスは、ご利用頂けません。', // message
                                function () {
                                    $scope.$apply(function () {
                                        $scope.disabled = true;
                                        $scope.readonly = true;
                                    });
                                }, // callback
                                '警告', // title
                                'OK'                  // buttonName
                                );
                    }
                }, // コールバック
                'GoogleMaps利用不可', // タイトル
                'ダウンロード,キャンセル' // ボタン名
                );
    };

    // タイムアウト、画像ダウンロード失敗した際の処理
    $scope.downloadFailure = function (fileTransfer) {

        // ダウンロード処理強制終了
        fileTransfer.abort();

        // ダウンロード件数初期化、ダウンロードステータス初期化
        localStorage.setItem('downloadServiceIconNum', 0);
        localStorage.setItem('serviceIconDownloadStatus', false);

        // ネットワーク状態（オンライン）チェック
        if ((navigator.connection.type !== 'none') && (countAlert === 0)) {

            if (tabbar.getActiveTabIndex() === 1) {
                // エラーメッセージ表示
                navigator.notification.alert(
                        '情報の取得に失敗しました。\n通信環境の良い場所で、ご利用ください。', // メッセージ
                        function (et) {
                            console.log(et);
                            // プログレスバー消去
                            ProgressSV.hide(1);
                        }, // コールバック
                        '情報取得エラー', // タイトル
                        'OK' // ボタン名
                        );
            }

            countAlert = 1;

        } else if ((navigator.connection.type === 'none') && (countAlert === 0)) {

            // オナー指定のプログレスバー消去
            ProgressSV.hide(1);

            countAlert = 1;

        }

    };

    // サービスアイコン画像のダウンロード
    $scope.downloadServiceIcon = function (img, fileTransfer, len) {

        // 端末のディレクトリパスが取得できていない場合があるので、ここで再セット
        if ($scope.serviceIconLocalDir === "null" + serviceIconPath) {
            $scope.serviceIconLocalDir = rootDir + serviceIconPath;
        }

        // ダウンロードするURL
        var url = encodeURI($scope.serviceIconSrvlDir + img);
        // 保存先ファイルパス
        var filePath = $scope.serviceIconLocalDir + img;

        fileTransfer.download(url, filePath,
                function () {

                    // ダウンロード数を更新
                    var downloadNum = localStorage.getItem('downloadServiceIconNum');
                    downloadNum++;
                    localStorage.setItem('downloadServiceIconNum', downloadNum);

                    // ダウンロードが全て完了したら表示を行う。
                    if (Number(len) === Number(downloadNum)) {

                        // ダウンロードタイマー解除
                        $timeout.cancel($scope.TenpoTimer);
                        $scope.TenpoTimer = null;

                        localStorage.setItem('serviceIconDownloadStatus', true);
                        localStorage.setItem('service_icon_last_update_date', $scope.ludate); // ローカルにあるサービスアイコンの最新更新日時を初期化
                        localStorage.setItem('service_icon_ver', 2); //サービスアイコンのバージョン更新
                    }
                },
                function (error) {

                    console.log('ダウンロード失敗' + error);

                    // ダウンロードタイマー解除
                    $timeout.cancel($scope.TenpoTimer);
                    $scope.TenpoTimer = null;

                    // ダウンロード失敗
                    $scope.downloadFailure(fileTransfer);

                });

    };

    // サービスアイコン画像ディレクトリ削除
    $scope.updateServiceIconDir = function (imgArr) {

        // ディレクトリエントリーを取得
        resolveLocalFileSystemURL(rootDir + serviceIconPath, function (dirEntry) {
            // ディレクトリの再帰的削除
            dirEntry.removeRecursively(function () {
                // サービス画像の削除
                $scope.downloadServiceIconImg(imgArr);
            }, function (error) {
                // サービス画像の削除（削除処理に失敗しても処理続行）
                $scope.downloadServiceIconImg(imgArr);
            });
        }, function (error) {
            console.log("なぞポンのディレクトリが存在しない条件で、なぞポン画像をダウンロード。コード：" + error.code);
            // サービス画像の削除（指定ディレクトリが無い場合も処理を続行）
            $scope.downloadServiceIconImg(imgArr);
        });

    };

    // サービスアイコン画像をすべてダウンロード
    $scope.downloadServiceIconImg = function (imgArr) {

        // ファイル転送オブジェクト（画像ダウンロード処理用）
        var fileTransfer = new FileTransfer();
        var len = imgArr.length;

        // 画像ダウンロード関連変数リセット
        countAlert = 0;

        // サービスアイコンの件数、ダウンロード件数初期化、ダウンロードステータス初期化
        localStorage.setItem('serviceIconNum', len);
        localStorage.setItem('downloadServiceIconNum', 0);
        localStorage.setItem('serviceIconDownloadStatus', false);

        // ダウンロードタイマーセット
        if ($scope.TenpoTimer !== null) {
            // ダウンロードタイマー解除
            $timeout.cancel($scope.TenpoTimer);
            $scope.TenpoTimer = null;
        }

        // ダウンロードタイマー設定
        $scope.TenpoTimer = $timeout(function () {
            $scope.downloadFailure(fileTransfer);
        }, 60000);  // タイムアウト：１分

        // サービスアイコンを全て、ダウンロードする
        for (var i = 0; i < len; i++) {

            // ダウンロードに失敗した場合は、処理を抜ける。
            if (countAlert === 1) {
                return;
            }

            // 画像ダウンロード
            $scope.downloadServiceIcon(imgArr[i].icon, fileTransfer, len);
        }

    };

    // 店舗データのダウンロード進捗チェック
    $scope.checkDownloadStatus = function () {

        return ((localStorage.getItem('tenposNum') !== null) && (localStorage.getItem('downloadTenposNum') !== null) &&
                (localStorage.getItem('tenposNum') === localStorage.getItem('downloadTenposNum')));

    };

    // CordovaのデバイスAPIを読み込み、利用可能で地図を作成
    document.addEventListener("deviceready", function () {

        // 地図API利用可能なら、地図を作成、表示
        plugin.google.maps.Map.isAvailable(function (isAvailable, message) {

            // 利用可能
            if (isAvailable) {

                // マップ表示エリア準備
                var mapDiv = document.getElementById("map");
                var GORYOKAKU_JAPAN = new plugin.google.maps.LatLng(lat, lon); // 初期位置
                $('.page__background').not('.page--menu__background').css('background-color', 'rgba(245, 245, 245, 0)'); // 背景
//------------------------------------------------------------------------------
                var height = $(window).height() - $('#map').offset().top * (scale / 100) - $('ons-tab').height() * (scale / 100);
                $('#map').css('height', height);                // 地図描画エリアの高さ
                $('#map').css('zoom', (10000 / scale) + "%");   // 地図エリアのスケール

                // 検索バーエリアの設定
                $('.searchebar').css({'height': 50 * (scale / 100),
                    'width': '100%',
                    'fontSize': 20 * (scale / 100)});
                if (ons.platform.isIPad()) {
                    $('.search-input-map').css({'padding': '0 0 0 34px'});
                }
                if ((ua.indexOf('iPad') > 0) || ((ua.indexOf('Android') > 0) && (ua.indexOf('Mobile') === -1))) {
                    $('.search-input-map').css({'fontSize': 20 * (scale / 100)});
                    $('.nowbutton').css({'fontSize': 20 * (scale / 100),
                        'padding': 10});
                } else {
                    $('.search-input-map').css({'fontSize': 20});
                    $('.nowbutton').css({'fontSize': 20});
                }
                $('.search-input').css({'background-size': 17 * (scale / 100)});
//------------------------------------------------------------------------------

                // 地図初期化
                map = plugin.google.maps.Map.getMap(mapDiv, {
                    'controls': {
                        'compass': true,
                        'myLocationButton': true,
                        'indoorPicker': false,
                        'zoom': false
                    },
                    'gestures': {
                        'scroll': true,
                        'tilt': true,
                        'rotate': true
                    },
                    'camera': {
                        'latLng': GORYOKAKU_JAPAN,
                        'tilt': 0,
                        'zoom': 15,
                        'bearing': 0
                    }
                });

                // 地図準備イベント
                map.addEventListener(plugin.google.maps.event.MAP_READY, $scope.onMapInit);

            } else { // 利用不可

                $scope.downloadGoogleFM();

            }

        });
    }, false);

    /*
     * 初期処理
     * 
     * @returns {なし}
     */
    $scope.initial = function () {

        // 地図検索結果メッセージ表示
        $scope.msgFlg = false;                           //true: 表示、false:非表示
        $scope.message = 'データを正しく、取得できました'; //表示メッセージ

        // 店舗更新が呼ばれたから、フラグを下ろす
        localStorage.setItem('tenpoUpdateFlg', false);

        if (flg === 2) { // 店舗検索結果からのクリック

            // マーカーをクリア
            map.clear();
            MarkerNomalArray = [];
            currentMarker = null;
            $scope.clickedMarkerName = null;

            // クリックされた店舗の緯度経度をセット
            var selectTenpo = new plugin.google.maps.LatLng(lat, lon);

            // クリックされた店舗を地図中心に移動
            map.animateCamera({
                'target': selectTenpo,
                'tilt': 0,
                'zoom': 15,
                'bearing': 0,
                'duration': 1000
            });

            // 店舗名を現在の吹き出しとして、登録
            currentTitle = selectedTenpoStr;

        }

        // 地図移動イベントを可能にする
        flg = 3;

        // 現在時刻を取得
        $scope.nowTime();

        // 二回目起動以降の処理
        if ((localStorage.getItem('flag') === 'false') && ($scope.checkDownloadStatus() === true)) {

            // 日付処理
            var localTime = localStorage.getItem('ludate');              // ローカルにある店舗の最新更新日時
            var realNowTime = $scope.ludate;                             // 現在の日時
            var localDate = localTime.split(' ')[0];                     // ローカルにある店舗の最新更新日付
            var realDate = realNowTime.split(' ')[0];                    // 現在の日付
            var serviceIconLocalTime = localStorage.getItem('service_icon_last_update_date'); // ローカルにあるサービスアイコンの最新更新日時
            var updateTenpo = true;                                         // 店舗情報の更新フラグ
            var serviceIconVer = localStorage.getItem('service_icon_ver');  // サービスアイコンの最新バージョン

            serviceIconVer = (serviceIconVer === null) ? 1 : Number(serviceIconVer);

            if (serviceIconVer < 2) {
                localTime = '2013-02-14 16:58:23';
            }

            // 日付が変わった場合、店舗情報を更新
            if (localTime === '2015-01-01 12:00:00') {

                // データロードモーダル表示
                ProgressSV.show(1, '店舗情報を読み込んでいます', tabbarHeight);

                // 初期化の再実行
                $scope.tenpoInfo();

            } else if ((new Date(localDate.replace(/-/g, '/'))) < (new Date(realDate.replace(/-/g, '/')))) {

                //店舗DBを更新
                $scope.updateDb(localTime);

            } else {
                // 店舗情報更新：なし
                updateTenpo = false;

            }

            // アップデートチェックフラグをセット、日替わり更新でupdateDbで更新データがあるかどうかの判断に時間がかかるため、タイマーを63500に変更
            setEventExclusionTimer(63500);
            console.log('アップデータチェックを開始したので、タブバー操作をロックした');

            // サービスアイコンの最新更新日時を取得
            GetServiceIconLastUpdateSV.getDate(function (data) {

                // 最新更新日時をセット
                $scope.serverServiceIconTime = data[0].last_update;

                // ローカルにあるサービスアイコンの最新更新日時が古い もしくは、バージョンが古い場合、サービスアイコンを更新
                if (((new Date(serviceIconLocalTime.replace(/-/g, '/'))) < (new Date($scope.serverServiceIconTime.replace(/-/g, '/')))) || (serviceIconVer < 2)) {

                    // サービスアイコンを更新
                    $scope.UpdateServiceIconDb();

                    // 店舗情報を更新していない場合は、店舗情報も更新
                    if (updateTenpo === false) {
                        //店舗DBを更新
                        $scope.updateDb(localTime);
                    }

                    // 店舗の情報更新が行うため、排他処理のタイマーを変更せず、店舗の情報を取得できた時点、タイマーが消される

                } else {

                    // 店舗情報を更新していない場合は、店舗情報も更新
                    if (updateTenpo === false) {
                        // アップデートチェックフラグを解除、updateDbが走らないから、タイムアウトを300へ変更
                        setEventExclusionTimer(300);
                        console.log('アップデータチェックが完了したので、タブバー操作ロックを解除した');
                    }

                    // サービスアイコンの更新がなく、店舗の情報更新が行わない場合、タイマーを300へ変更。
                    // 店舗の情報更新が行っている場合、店舗の情報を取得できた時点、タイマーが消される
                }
            });

        } else { // 初期時の処理

            // データロードモーダル表示
            ProgressSV.show(1, '店舗情報を読み込んでいます', tabbarHeight);

            // 排他を解除
            setEventExclusionTimer(300);

            localStorage.setItem('ludate', '2015-01-01 12:00:00');                        // ローカルにある店舗の最新更新日時を初期化
            localStorage.setItem('service_icon_last_update_date', '2015-01-01 12:00:00'); // ローカルにあるサービスアイコンの最新更新日時を初期化

            // 店舗DB作成し、データを挿入
            $scope.makeTenpoDb();

            //サービスアイコンDB作成し、データを挿入
            $scope.makeServiceIconDb();

            localStorage.setItem("flag", "false"); // 初期処理済み
        }
    };

    /*
     * 現在地取得成功時、地図カメラを現在地に移動
     * 
     * @param {LatLng} location
     * @returns {なし}
     */
    $scope.onSuccess = function (location) {

        // 現在地緯度、経度をセット
        currentLat = location.latLng.lat;
        currentLon = location.latLng.lng;

        // 地図カメラを現在地に移動
        map.animateCamera({
            'target': location.latLng,
            'tilt': 0,
            'zoom': 15,
            'bearing': 0,
            'duration': 1000
        });

    };

    /*
     * 現在地取得失敗した場合、現在地取得エラー表示
     *  
     * @param {string} msg
     * @returns {なし}
     */
    $scope.onError = function (msg) {

        // エラー表示
        navigator.notification.alert(
                '位置情報を利用しているため、位置情報サービスを許可してください。', // メッセージ
                function (et) {
                    console.log(et);
                }, // コールバック
                '位置情報取得エラー', // タイトル
                'OK' // ボタン名
                );

    };

    /*
     * 地図初期化成功時の処理
     * 
     * @returns {なし}
     */
    $scope.onMapInit = function () {

        $scope.setCenter();

        // 地図中心が移動し場合
        map.on(plugin.google.maps.event.CAMERA_CHANGE, function (position) {

            // サービスアイコンのダウンロードが終わらないと、店舗検索を行わない
            if (localStorage.getItem('serviceIconDownloadStatus') === 'true') {
                $scope.searchNearTenpo(position.target.lat, position.target.lng);

            }

        });

        // 地図がクリックされた場合
        map.on(plugin.google.maps.event.MAP_CLICK, function () {

            // キーボードを閉じる
            cordova.plugins.Keyboard.close();

        });

    };

    /*
     * マーカーの重複判断
     * 
     * @param {string} 店舗タイプ＋店舗名
     * @returns {Boolean} true：重複なし、false:重複あり
     */
    $scope.uniquMarker = function (tenpoStr) {

        var flag = true;                   // 重複フラグ（true：重複なし、false:重複あり）
        var len = MarkerNomalArray.length; // マーカーリストのサイズをセット

        // 重複あるかを調査
        for (var i = 0; i < len; i++) {

            // 重複があれば、重複フラグをセット
            if (MarkerNomalArray[i].tenpoStr === tenpoStr) {

                flag = false;

            }

        }

        return flag;

    };

    /*
     * 店舗検索時、範囲越え、店舗がないというメッセージを設定
     * 
     * @param {Boolean} flg (true: 表示、false:非表示)
     * @param {string} msg メッセージ内容
     * @returns {undefined}
     */
    $scope.setMsg = function (flg, msg) {

        $scope.msgFlg = flg;
        $scope.message = msg;

    };

    /*
     * 周辺店舗検索
     * 
     * @param {number} lat
     * @param {number} lon
     * @returns {なし}
     */
    $scope.searchNearTenpo = function (lat, lon) {

        // マップのエリア緯度経度取得
        map.getVisibleRegion(function (latLngBounds) {

            $scope.bounds = latLngBounds;            //　地図エリア矩形緯度経度をセット
            $scope.sw = $scope.bounds.southwest;      //　左下緯度経度（左下 lat 小さい　lon　大きい）
            $scope.ne = $scope.bounds.northeast;      //　右上緯度経度（右上 lat 大きい  lon　大きい）
            $scope.k = $scope.ne.lat - $scope.sw.lat; // 地図エリア上部の緯度と下部の緯度の差

            // 国外
            if (lat > 38.0 || lat < 34.4 || lon > 141.3 || lon < 137.0) {

                map.clear();
                MarkerNomalArray = [];
                currentMarker = null;

                $scope.$apply($scope.setMsg(true, '周辺に店舗が見つかりませんでした'));

                return;

            }

            // ズームレベルオーバー
            if ($scope.k > 0.15) {

                map.clear();
                MarkerNomalArray = [];
                currentMarker = null;

                // 地図エリア上部の緯度と下部の緯度の差が0.15超えた
                $scope.$apply($scope.setMsg(true, '地図を拡大すると店舗を表示できます'));

                return;

            }

            // 店舗情報DBから検索SQL文の作成
            $scope.nearTenpoSQL = "select *  from m_tenpo where lat > " +
                    $scope.sw.lat +
                    " and lat < " +
                    $scope.ne.lat +
                    " and lon > " +
                    $scope.sw.lng +
                    " and lon < " +
                    $scope.ne.lng;

            // データベースが開いていなければ、開く
            if (goiken === null) {

                goiken = openDatabase('goiken', '0.1', '店舗情報', 2 * 1024 * 1024);

            }

            // 検索
            goiken.transaction(
                    function (tx) {
                        $scope.result = tx.executeSql($scope.nearTenpoSQL, [],
                                function (tx, rs) {

                                    var data, len;

                                    data = rs.rows;    // 検索結果
                                    len = data.length; // 検索件数

                                    // 結果なし
                                    if (len === 0) {

                                        $scope.$apply($scope.setMsg(true, '周辺に店舗が見つかりませんでした'));

                                    }

                                    // 検索結果を一件ずつ、処理
                                    for (var i = 0; i < len; i++) {

                                        var latlon, tenpoStr;

                                        latlon = new plugin.google.maps.LatLng(data.item(i).lat, data.item(i).lon); // 店舗緯度経度
                                        if (ons.platform.isIOS()) {
                                            tenpoStr = "  " + data.item(i).tenpotype + "\n  " + data.item(i).tenponame; // 店舗タイプ＋店舗名
                                        } else {
                                            tenpoStr = (data.item(i).tenpotype + '\n' + data.item(i).tenponame).trim(); // 店舗タイプ＋店舗名
                                        }
                                        // データの正常取得し、マーカーを立てる
                                        $scope.$apply($scope.setMsg(false, 'データを正しく、取得できました'));

                                        // 重複なければ
                                        if ($scope.uniquMarker(tenpoStr) === true) {

                                            // マーカーリストに登録
                                            MarkerNomalArray.push({
                                                latlon: latlon,
                                                tenpoStr: tenpoStr
                                            });

                                            // 最後に表示されたマーカーなら
                                            if (tenpoStr === $scope.clickedMarkerName) {

                                                // マーカーを作成して、吹き出しとともに表示
                                                $scope.makeMarker(latlon, tenpoStr, data.item(i).tenpocd, 'clickedSearched');

                                            } else { // 一般マーカーなら

                                                // マーカー作成して表示
                                                $scope.makeMarker(latlon, tenpoStr, data.item(i).tenpocd, 'searched');

                                            }

                                        } else {
                                            console.log('重複:' + tenpoStr);
                                        }
                                    }
                                },
                                function (tx, error) {

                                    // 検索が失敗した場合、エラーメッセージを表示
                                    navigator.notification.alert(
                                            '店舗の検索に失敗しました。', // メッセージ
                                            function () {
                                                console.log(error);
                                            }, // コールバック
                                            '店舗検索エラー', // タイトル
                                            '閉じる' // ボタン名
                                            );
                                });
                    });
        });
    };

    /*
     * マーカーイベントが発生した場合
     * 
     * @param {marker} marker
     * @returns {なし}
     */
    $scope.onMarkerClick = function (marker) {

        // 店舗系ダイアログの表示排他制御
        if (eventExclusion === true) {
            console.log("店舗アイコンクリック：排他中");
            return;
        } else {
            // 店舗詳細情報を表示不可にする
            eventExclusion = true;
            console.log("店舗アイコンクリック：排他開始");

            // 排他解除タイマーセット（最大10秒）
            if (showDialogTimer !== null) {
                // 排他解除タイマー解除
                $timeout.cancel(showDialogTimer);
                showDialogTimer = null;
            }
            showDialogTimer = $timeout(function () {
                // 排他フラグ解除
                eventExclusion = false;
                console.log("店舗アイコンクリック：排他解除");
            }, 10000);
        }

        if (currentMarker !== null) {
            currentMarker.hideInfoWindow();
            currentMarker.setIcon({
                url: 'www/img/map/map_marker_160x140_normal.png',
                size: {
                    width: 160 * 0.4,
                    height: 140 * 0.4
                }
            });
        }

        $scope.clickedMarkerName = marker.getTitle();

        marker.setIcon({
            url: 'www/img/map/map_marker_160x140_select.png',
            size: {
                width: 160 * 0.4,
                height: 140 * 0.4
            }
        });

        $timeout(function () {
            marker.showInfoWindow();
        }, 50);

        currentMarker = marker;

        $scope.searchTenpoByLL(marker.get('tenpocd'));

    };

    /*
     * マーカー作成
     * 
     * @param {latlon} latlon
     * @param {string} tenpoStr
     * @param {number} status 
     *         (clickedSearched: 店舗検索から来た、clicked：クリックイベントから来た)
     * @returns {なし}
     * 
     */
    $scope.makeMarker = function (latlon, tenpoStr, tenpocd, status) {

        var url; // 店舗アイコンURL

        // 店舗アイコンURLをセット
        if ($scope.clickedMarkerName === tenpoStr && status === 'clickedSearched') {

            url = 'www/img/map/map_marker_160x140_select.png';

        } else {

            url = 'www/img/map/map_marker_160x140_normal.png';

        }

        // マーカーを作成
        map.addMarker({
            position: latlon,
            title: tenpoStr,
            tenpocd: tenpocd,
            icon: {
                url: url,
                size: {
                    width: 160 * 0.4,
                    height: 140 * 0.4
                }
            },
            markerClick: $scope.onMarkerClick
        }, function (marker) {

            // 検索から来た、クリックされた、現在表されているマーカーのどっちかであれば、吹き出しを表示
            if ($scope.clickedMarkerName === tenpoStr || currentTitle === tenpoStr) {

                $timeout(function () {
                    marker.showInfoWindow();
                    flg = 100;
                }, 50);

            }

            if (status === 'clickedSearched') {
                currentMarker = marker;
                console.log(marker);
            }

        });

    };

    /*
     * 緯度経度から店舗検索
     *  
     * @param {number} lat
     * @param {number} lon
     * @returns {なし}
     */
    $scope.searchTenpoByLL = function (tenpocd) {

        // キーボードを閉じる
        cordova.plugins.Keyboard.close();

        var dlg = 'result-detail.html'; //店舗詳細情報テンプレート
        var sqlLL = "select *" +
                " from m_tenpo" +
                " where" +
                " tenpocd = " +
                tenpocd;                    //店舗検索SQL

        // データベースが開いていなければ、開く
        if (goiken === null) {

            goiken = openDatabase('goiken', '0.1', '店舗情報', 2 * 1024 * 1024);

        }

        // 検索
        goiken.transaction(
                function (tx) {
                    $scope.result = tx.executeSql(sqlLL, [],
                            function (tx, rs) {

                                // 検索結果をセット
                                ShareTenpoInfoSV.set(rs.rows.item(0));

                                // ダイアログを作成
                                $scope.dialogs = {};

                                // ダイアログを表示
                                if (!$scope.dialogs[dlg]) {

                                    ons.createDialog(dlg).then(function (dialog) {

                                        $scope.dialogs[dlg] = dialog;

                                        dialog.show({animation: "none"});

                                        // 地図を更新させるために、地図を移動する
                                        map.panBy(-1, -1);

                                    });

                                } else {

                                    $scope.dialogs[dlg].show({animation: "none"});

                                    // 地図を更新させるために、地図を移動する
                                    map.panBy(-1, -1);

                                }

                            },
                            function (tx, error) {

                                // 排他解除タイマー解除
                                $timeout.cancel(showDialogTimer);
                                showDialogTimer = null;
                                // 排他フラグ解除
                                eventExclusion = false;
                                console.log("店舗ダイアログ排他解除");

                                // 検索失敗時、エラーを表示
                                navigator.notification.alert(
                                        '店舗の検索に失敗しました。', // メッセージ
                                        function () {
                                            console.log(error);
                                        }, // コールバック
                                        '店舗検索エラー', // タイトル
                                        '閉じる' // ボタン名
                                        );

                            });
                });
    };

    /*
     * 地図のセンターをセット
     * 
     * @returns {なし}
     */
    $scope.setCenter = function () {

        cordova.plugins.diagnostic.isLocationEnabled(function (enabled) {

            if (enabled === 1) {

                var opts = {
//                    enableHighAccuracy: false
                    enableHighAccuracy: true
                };

                // マップSDK用意された機能で現在地を取得
                map.getMyLocation(opts, $scope.onSuccess, $scope.onError);

            } else {

                // エラー表示
                navigator.notification.alert(
                        '位置情報を利用しているため、位置情報サービスを許可してください。', // メッセージ
                        function (et) {
                            console.log(et);
                        }, // コールバック
                        '位置情報取得エラー', // タイトル
                        'OK' // ボタン名
                        );
            }

        }, function (error) {

            // エラー表示
            navigator.notification.alert(
                    '位置情報が取得できませんでした。', // メッセージ
                    function (et) {
                        console.log(et);
                    }, // コールバック
                    '位置情報取得エラー', // タイトル
                    'OK' // ボタン名
                    );
        });

    };

    /*
     * 初期のデータベース処理
     * 
     * @returns {undefined}
     */
    $scope.makeTenpoDb = function () {

        // データベースが開いていなければ、開く
        if (goiken === null) {
            goiken = openDatabase('goiken', '0.1', '店舗情報', 2 * 1024 * 1024);
        }

        var dropTblSQL = 'drop table m_tenpo';

        // テーブル作成SQLの実行
        goiken.transaction(function (tx) {

            tx.executeSql(dropTblSQL, [],
                    function () {

                        // 初期DB作成SQL
                        var createTenpoSQL = "CREATE TABLE IF NOT EXISTS m_tenpo(" +
                                "tenpocd character varying(4) NOT NULL unique," +
                                "tenponame character varying(50) NOT NULL," +
                                "tenpotype character varying(25)," +
                                "lat numeric(9,6)," +
                                "lon numeric(9,6)," +
                                "address character varying(100)," +
                                "tel character varying(50)," +
                                "comment text," +
                                "opentype nymeric," +
                                "opentime text," +
                                "closetime text," +
                                "opentime2 text," +
                                "closetime2 text," +
                                "tabeho_flg integer," +
                                "tablet_flg integer," +
                                "wagyu_flg integer," +
                                "yukke_flg integer," +
                                "sumibi_flg integer," +
                                "drinkbar_flg integer," +
                                "saladbar_flg integer," +
                                "cakebar_flg integer," +
                                "gelatobar_flg integer," +
                                "kidsroom_flg integer," +
                                "park integer," +
                                "chair integer," +
                                "ex1_flg integer," +
                                "ex2_flg integer," +
                                "ex3_flg integer," +
                                "ex4_flg integer," +
                                "ex5_flg integer," +
                                "ex6_flg integer," +
                                "ex7_flg integer," +
                                "ex8_flg integer," +
                                "ex9_flg integer," +
                                "ex10_flg integer," +
                                "valid_flg integer)"; //データが有効かどうか

                        // DB作成を行う
                        goiken.transaction(
                                function (tx) {
                                    tx.executeSql(createTenpoSQL, [],
                                            function () {
                                                console.log('m_tenpo テーブル作成完了.');

                                                // 店舗データをサーバーから取得して、挿入
                                                $scope.tenpoInfo();
                                            },
                                            function () {

                                                // プログレスバーがあれば、削除
                                                ProgressSV.hide(1);
                                                console.log('m_tenpo テーブル作成エラー.');
                                            });
                                }
                        );

                    },
                    function () {

                        // 初期DB作成SQL
                        var createTenpoSQL = "CREATE TABLE IF NOT EXISTS m_tenpo(" +
                                "tenpocd character varying(4) NOT NULL unique," +
                                "tenponame character varying(50) NOT NULL," +
                                "tenpotype character varying(25)," +
                                "lat numeric(9,6)," +
                                "lon numeric(9,6)," +
                                "address character varying(100)," +
                                "tel character varying(50)," +
                                "comment text," +
                                "opentype nymeric," +
                                "opentime text," +
                                "closetime text," +
                                "opentime2 text," +
                                "closetime2 text," +
                                "tabeho_flg integer," +
                                "tablet_flg integer," +
                                "wagyu_flg integer," +
                                "yukke_flg integer," +
                                "sumibi_flg integer," +
                                "drinkbar_flg integer," +
                                "saladbar_flg integer," +
                                "cakebar_flg integer," +
                                "gelatobar_flg integer," +
                                "kidsroom_flg integer," +
                                "park integer," +
                                "chair integer," +
                                "ex1_flg integer," +
                                "ex2_flg integer," +
                                "ex3_flg integer," +
                                "ex4_flg integer," +
                                "ex5_flg integer," +
                                "ex6_flg integer," +
                                "ex7_flg integer," +
                                "ex8_flg integer," +
                                "ex9_flg integer," +
                                "ex10_flg integer," +
                                "valid_flg integer)"; //データが有効かどうか

                        // DB作成を行う
                        goiken.transaction(
                                function (tx) {
                                    tx.executeSql(createTenpoSQL, [],
                                            function () {

                                                // 店舗データをサーバーから取得して、挿入
                                                $scope.tenpoInfo();
                                            },
                                            function () {

                                                // プログレスバーがあれば、削除
                                                ProgressSV.hide(1);
                                                console.log('m_tenpo テーブル作成エラー.');
                                            });
                                }
                        );

                    });
        });
    };

    /*
     * 初期、サーバーＤＢから取得したデータを新規作成したWebDBに格納する
     * 
     * @returns {なし}
     */
    $scope.tenpoInfo = function () {

        // データベースが開いていなければ、開く
        if (goiken === null) {

            goiken = openDatabase('goiken', '0.1', '店舗情報', 2 * 1024 * 1024);

        }

        GetTenpoinfoSV.getTenpoInfo(currentLat + ',' + currentLon, function (data) {

            var dataNum = data.length;

            // 店舗の件数、ダウンロード件数
            localStorage.setItem('tenposNum', dataNum);
            localStorage.setItem('downloadTenposNum', 0);

            Object.keys(data).forEach(function (key) {

                var sql = 'insert into m_tenpo(' +
                        'tenpocd,tenponame,tenpotype,lat,lon,' +
                        'address,tel,comment,opentype,opentime,' +
                        'closetime,opentime2,closetime2,tabeho_flg,tablet_flg,' +
                        'wagyu_flg,yukke_flg,sumibi_flg,drinkbar_flg,saladbar_flg,' +
                        'cakebar_flg,gelatobar_flg,kidsroom_flg,park,chair,' +
                        'ex1_flg,ex2_flg,ex3_flg,ex4_flg,ex5_flg,' +
                        'ex6_flg,ex7_flg,ex8_flg,ex9_flg,ex10_flg,' +
                        'valid_flg) values (' +
                        '?,?,?,?,?,?,?,?,?,?,' +
                        '?,?,?,?,?,?,?,?,?,?,' +
                        '?,?,?,?,?,?,?,?,?,?,' +
                        '?,?,?,?,?,?)';

                // アイコンが追加された場合の対応
                ex1_flg = (data[key].ex1_flg === undefined) ? null : data[key].ex1_flg;
                ex2_flg = (data[key].ex2_flg === undefined) ? null : data[key].ex2_flg;
                ex3_flg = (data[key].ex3_flg === undefined) ? null : data[key].ex3_flg;
                ex4_flg = (data[key].ex4_flg === undefined) ? null : data[key].ex4_flg;
                ex5_flg = (data[key].ex5_flg === undefined) ? null : data[key].ex5_flg;
                ex6_flg = (data[key].ex6_flg === undefined) ? null : data[key].ex6_flg;
                ex7_flg = (data[key].ex7_flg === undefined) ? null : data[key].ex7_flg;
                ex8_flg = (data[key].ex8_flg === undefined) ? null : data[key].ex8_flg;
                ex9_flg = (data[key].ex9_flg === undefined) ? null : data[key].ex9_flg;
                ex10_flg = (data[key].ex10_flg === undefined) ? null : data[key].ex10_flg;

                var values = [
                    data[key].tenpocd,
                    data[key].tenponame,
                    data[key].tenpotype,
                    data[key].lat,
                    data[key].lon,
                    data[key].address,
                    data[key].tel,
                    data[key].comment,
                    data[key].opentype,
                    data[key].fromtime,
                    data[key].totime,
                    data[key].fromtime2,
                    data[key].totime2,
                    data[key].tabeho,
                    data[key].tablet,
                    data[key].kuroge,
                    data[key].yukke,
                    data[key].sumibiflg,
                    data[key].dbar,
                    data[key].sbar,
                    data[key].cbar,
                    data[key].gbar,
                    data[key].kroom,
                    data[key].park,
                    data[key].chair,
                    ex1_flg,
                    ex2_flg,
                    ex3_flg,
                    ex4_flg,
                    ex5_flg,
                    ex6_flg,
                    ex7_flg,
                    ex8_flg,
                    ex9_flg,
                    ex10_flg,
                    1];

                goiken.transaction(
                        function (tx) {

                            tx.executeSql(sql,
                                    values,
                                    function () {

                                        dataNum--;

                                        // 店舗ダウンロード数集計
                                        var downloadNum = localStorage.getItem('downloadTenposNum');
                                        downloadNum++;

                                        localStorage.setItem('downloadTenposNum', downloadNum);
                                        ProgressSV.setProgress(1, (Number(data.length) - Number(dataNum)) / Number(data.length));

                                        if (dataNum === 0) {

                                            localStorage.setItem('ludate', $scope.ludate);                        // ローカルにある店舗の最新更新日時を初期化

                                            // モーダルを閉じる
                                            $timeout(function () {
                                                ProgressSV.hide(1);
                                            }, 1000);

                                        }

                                    },
                                    function () {

                                        // 挿入できないデータがあると、モーダル非表示
                                        ProgressSV.hide(1);
                                    }
                            );

                        });
            });
        });
    };

    /*
     * サービスアイコンＤＢ作成
     * 
     * @returns {なし}
     */
    $scope.makeServiceIconDb = function () {

        // データベースが開いていなければ、開く
        if (goiken === null) {

            goiken = openDatabase('goiken', '0.1', '店舗情報', 2 * 1024 * 1024);

        }

        var createServiceIconSQL = "CREATE TABLE IF NOT EXISTS m_service_icon(" +
                " icon_type integer NOT NULL unique," +
                " update_date timestamp without time zone," +
                " icon_name text," +
                " icon text," +
                " view_priority integer)";

        goiken.transaction(
                function (tx) {

                    tx.executeSql(createServiceIconSQL, [],
                            function () {

                                // 店舗データをサーバーから取得して、挿入
                                $scope.isnertServiceIcon();

                            },
                            function () {

                                // プログレスバーがあれば、削除
                                ProgressSV.hide(1);

                            });

                }
        );

    };

    /*
     * サービスアイコンをサーバーから取得し、ＤＢに挿入
     * 
     * @returns {なし}
     */
    $scope.isnertServiceIcon = function () {

        // データベースが開いていなければ、開く
        if (goiken === null) {

            goiken = openDatabase('goiken', '0.1', '店舗情報', 2 * 1024 * 1024);

        }

        GetServiceIconSV.getIcons(function (data) {

            var dataNum = data.length;
            $scope.updateServiceIconDir(data);

            Object.keys(data).forEach(function (key) {

                var sql = 'insert into m_service_icon(icon_type,update_date,icon_name,icon,view_priority) values (' +
                        '?,?,?,?,?)';

                var values = [
                    data[key].icon_type,
                    data[key].update_date,
                    data[key].icon_name,
                    data[key].icon,
                    data[key].view_priority];

                goiken.transaction(
                        function (tx) {

                            tx.executeSql(sql,
                                    values,
                                    function () {

                                        dataNum--;
//                                        console.log('m_service_icon　テーブルデータ挿入:' + dataNum + '件目');
                                    },
                                    function () {

                                        // 挿入できないデータがあると、モーダル非表示
                                        ProgressSV.hide(1);
                                        console.log('アイコン挿入：error');
                                    }
                            );

                        });
            });

        });
    };

    /*
     * 現在の時間を取得
     * 
     * @returns {なし}
     */
    $scope.nowTime = function () {

        var nowDate = new Date();
        var year = nowDate.getFullYear();
        var month = (nowDate.getMonth() + 1 - 10 < 0) ? ('0' + (nowDate.getMonth() + 1)) : (nowDate.getMonth() + 1);
        var date = (nowDate.getDate() - 10 < 0) ? ('0' + nowDate.getDate()) : nowDate.getDate();
        var hours = (nowDate.getHours() - 10 < 0) ? ('0' + nowDate.getHours()) : nowDate.getHours();
        var minutes = (nowDate.getMinutes() - 10 < 0) ? ('0' + nowDate.getMinutes()) : nowDate.getMinutes();
        var seconds = (nowDate.getSeconds() - 10 < 0) ? ('0' + nowDate.getSeconds()) : nowDate.getSeconds();

        $scope.ludate = year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds;
    };

    /*
     * 店舗データの差分をアップロード
     * 
     * @param {string} ludate 最新更新日時の文字列
     * @returns {なし}
     */
    $scope.updateDb = function (ludate) {

        console.log('日付の変更で、データの更新開始');

        // データベースが開いていなければ、開く
        if (goiken === null) {

            goiken = openDatabase('goiken', '0.1', '店舗情報', 2 * 1024 * 1024);

        }

        // 差分データの取得
        UpdateDbSV.getDiffInfo(ludate, function (data) {

            var delNum = 0;
            var datNum = data.length;
//            console.log('更新データ↓');
//            console.log(data);
//            console.log('更新データ↑');

            if ((data.length === 1 && data[0].tenpocd === '0000') || (data.length === 0)) {

                //店舗の最新更新日時を更新
                localStorage.setItem('ludate', $scope.ludate);
                console.log('日付の変更で、データの更新終了。ただし、更新データはなし');
                // 更新がないので、排他ロックを解除
                setEventExclusionTimer(300);
                console.log('店舗更新ダイアログがないので、排他ロックを解除');

            } else {

                // 店舗データ更新があり、更新プログレスバーを表示する
                ProgressSV.show(1, '店舗情報を更新しています', tabbarHeight);
                // 更新ダイアログが表示されたので、排他ロックを解除
                setEventExclusionTimer(300);
                console.log('店舗更新ダイアログが表示されたので、排他ロックを解除');

                Object.keys(data).forEach(function (key) {

                    // webSQLにあるdataのレコードをすべて削除する
                    var delSQL = 'delete from m_tenpo where tenpocd = ' + data[key].tenpocd;

                    // 差分データをWebDBから削除
                    goiken.transaction(
                            function (tx) {

                                tx.executeSql(delSQL, [],
                                        function () {
                                            delNum = delNum + 1;
                                        },
                                        function () {
                                            console.log('差分データをWebDBから削除時にエラー');
                                        });
                            });

                    // dataにあるvalid_flgの値が1のレコードのみをwebSQLに挿入する
                    if (data[key].valid_flg === '1') {

                        var sql = 'insert into m_tenpo(' +
                                'tenpocd,tenponame,tenpotype,lat,lon,' +
                                'address,tel,comment,opentype,opentime,' +
                                'closetime,opentime2,closetime2,tabeho_flg,tablet_flg,' +
                                'wagyu_flg,yukke_flg,sumibi_flg,drinkbar_flg,saladbar_flg,' +
                                'cakebar_flg,gelatobar_flg,kidsroom_flg,park,chair,' +
                                'ex1_flg,ex2_flg,ex3_flg,ex4_flg,ex5_flg,' +
                                'ex6_flg,ex7_flg,ex8_flg,ex9_flg,ex10_flg,' +
                                'valid_flg) values (' +
                                '?,?,?,?,?,?,?,?,?,?,' +
                                '?,?,?,?,?,?,?,?,?,?,' +
                                '?,?,?,?,?,?,?,?,?,?,' +
                                '?,?,?,?,?,?)';

                        // アイコンが追加された場合の対応
                        ex1_flg = (data[key].ex1_flg === undefined) ? null : data[key].ex1_flg;
                        ex2_flg = (data[key].ex2_flg === undefined) ? null : data[key].ex2_flg;
                        ex3_flg = (data[key].ex3_flg === undefined) ? null : data[key].ex3_flg;
                        ex4_flg = (data[key].ex4_flg === undefined) ? null : data[key].ex4_flg;
                        ex5_flg = (data[key].ex5_flg === undefined) ? null : data[key].ex5_flg;
                        ex6_flg = (data[key].ex6_flg === undefined) ? null : data[key].ex6_flg;
                        ex7_flg = (data[key].ex7_flg === undefined) ? null : data[key].ex7_flg;
                        ex8_flg = (data[key].ex8_flg === undefined) ? null : data[key].ex8_flg;
                        ex9_flg = (data[key].ex9_flg === undefined) ? null : data[key].ex9_flg;
                        ex10_flg = (data[key].ex10_flg === undefined) ? null : data[key].ex10_flg;

                        var values = [
                            data[key].tenpocd,
                            data[key].tenponame,
                            data[key].tenpotype,
                            data[key].lat,
                            data[key].lon,
                            data[key].address,
                            data[key].tel,
                            data[key].comment,
                            data[key].opentype,
                            data[key].fromtime,
                            data[key].totime,
                            data[key].fromtime2,
                            data[key].totime2,
                            data[key].tabeho,
                            data[key].tablet,
                            data[key].kuroge,
                            data[key].yukke,
                            data[key].sumibiflg,
                            data[key].dbar,
                            data[key].sbar,
                            data[key].cbar,
                            data[key].gbar,
                            data[key].kroom,
                            data[key].park,
                            data[key].chair,
                            ex1_flg,
                            ex2_flg,
                            ex3_flg,
                            ex4_flg,
                            ex5_flg,
                            ex6_flg,
                            ex7_flg,
                            ex8_flg,
                            ex9_flg,
                            ex10_flg,
                            1];

                        // 挿入
                        goiken.transaction(
                                function (tx) {
                                    tx.executeSql(sql,
                                            values,
                                            function () {
                                                datNum--;

                                                // 更新時でもプログレスバーをセット
                                                ProgressSV.setProgress(1, (data.length - datNum) / data.length);
                                                
                                                if (datNum === 0) {

                                                    //店舗の最新更新日時を更新
                                                    localStorage.setItem('ludate', $scope.ludate);

                                                    // モーダル非表示
                                                    ProgressSV.setProgress(1, 1.0);
                                                    $timeout(function () {
                                                        ProgressSV.hide(1);
                                                    }, 1000);

                                                    console.log('日付の変更で、データの更新終了');
                                                }
                                            },
                                            function () {

                                                // 挿入できないデータがあると、モーダル非表示
                                                ProgressSV.hide(1);
                                                datNum--;
                                                console.log('error');
                                                console.log(datNum);
                                            });
                                });
                    } else {
                        datNum--;
                    }
                });
            }
        });
    };

    /*
     * サービスアイコンデータの更新
     * 
     * @returns {なし}
     */
    $scope.UpdateServiceIconDb = function () {

        // データベースが開いていなければ、開く
        if (goiken === null) {

            goiken = openDatabase('goiken', '0.1', '店舗情報', 2 * 1024 * 1024);

        }

        var delSQL = 'delete from m_service_icon';

        // 差分データをWebDBから削除
        goiken.transaction(
                function (tx) {
                    tx.executeSql(delSQL, [],
                            function () {
                                console.log('アイコンデータの削除目削除中');
                                $scope.isnertServiceIcon();
                            },
                            function () {
                                console.log('差分データをWebDBから削除時にエラー');
                            });
                });
    };

    // SQLインジェクション対応
    $scope.checkValue = function (value) {
        var value = value.replace(/'/g, '"');
        value = value.replace(/;/g, '\;');
        value = value.replace(/--/g, '\--');
        value = value.replace(/%/g, '#%');
        value = value.replace(/_/, '\_');

        return value;
    };

    /*
     * 店舗検索
     * 
     * @param {string} dlg ダイアログテンプレート
     * @returns {なし}
     */
    $scope.searchInfo = function (dlg) {

        if (localStorage.getItem('serviceIconDownloadStatus') !== 'true') {
            return;
        }

        // 店舗系ダイアログの表示排他制御
        if (eventExclusion === true) {
            console.log("検索実行：排他中");
            return;
        } else {
            // 店舗詳細情報を表示不可にする
            eventExclusion = true;
            console.log("検索実行：排他開始");

            // 排他解除タイマーセット（最大10秒）
            if (showDialogTimer !== null) {
                // 排他解除タイマー解除
                $timeout.cancel(showDialogTimer);
                showDialogTimer = null;
            }
            showDialogTimer = $timeout(function () {
                // 排他フラグ解除
                eventExclusion = false;
                console.log("検索実行：排他解除");
            }, 10000);
        }

        // データベースが開いていなければ、開く
        if (goiken === null) {

            goiken = openDatabase('goiken', '0.1', '店舗情報', 2 * 1024 * 1024);

        }

        var keyword = $scope.keyword;

        if (keyword === undefined || keyword === '') {
            return;
        } else {
            $scope.currentText = $scope.checkValue(keyword);
        }

        $scope.sql = "select tenpotype, tenponame, lat, lon," +
                "((lat - " +
                currentLat +
                ") * (lat - " +
                currentLat +
                ") + (lon - " +
                currentLon +
                ") * (lon - " +
                currentLon +
                ")) as dist" +
                " from m_tenpo " +
                " where " +
                " tenponame like '%" +
                $scope.currentText +
                "%' or address like '%" +
                $scope.currentText +
                "%' or tenpotype like '%" +
                $scope.currentText +
                "%' escape '#' order by dist ASC";

        goiken.transaction(
                function (tx) {

                    $scope.result = tx.executeSql($scope.sql, [],
                            function (tx, rs) {

                                var result = rs.rows;
                                var len = result.length;

                                if (len === 0) {

                                    // 排他解除タイマー解除
                                    $timeout.cancel(showDialogTimer);
                                    showDialogTimer = null;
                                    // 排他フラグ解除
                                    eventExclusion = false;
                                    console.log("店舗ダイアログ排他解除");

                                    map.setClickable(false);

                                    // 検索結果がない場合、アラートを表示
                                    navigator.notification.alert(
                                            'お探しの地名・店舗名に該当する店舗が見つかりませんでした。', // メッセージ
                                            function () {
                                                map.setClickable(true);
                                            }, // コールバック
                                            '検索結果', // タイトル
                                            'OK' // ボタン名
                                            );

                                } else {

                                    var tenpo = new Array();

                                    $scope.data = result;

                                    for (var i = 0; i < len; i++) {

                                        var row = result.item(i);

                                        tenpo.push(row);
                                    }

                                    SharedSearchResultSV.set(tenpo);

                                    ons.createDialog(dlg).then(function (dialog) {
                                        $timeout(function () {
                                            console.log('ダイアログ処理が実行された');
                                            dialog.show({animation: "none"});
                                        }, 0);
                                    });

                                }

                                cordova.plugins.Keyboard.close();

                            },
                            function (tx, error) {
                                console.log(error);
                                // 排他解除タイマー解除
                                $timeout.cancel(showDialogTimer);
                                showDialogTimer = null;
                                // 排他フラグ解除
                                eventExclusion = false;
                                console.log("店舗ダイアログ排他解除");
                            });
                }
        );
    };

    // 初期処理実行
    $scope.initial();
};

/*
 * 店舗検索処理
 *
 * @param $scope Angular Js標準サービス
 * @param SharedSearchResultSV 検索結果共有サービス
 * @returns null
 */
SearchTenpoCtrl = function ($scope, $timeout, SharedSearchResultSV) {

    // データベースが開いていなければ、開く
    if (goiken === null) {

        goiken = openDatabase('goiken', '0.1', '店舗情報', 2 * 1024 * 1024);

    }

    // SQLインジェクション対応
    $scope.checkValue = function (value) {
        var value = value.replace(/'/g, '"');
        value = value.replace(/;/g, '\;');
        value = value.replace(/--/g, '\--');
        value = value.replace(/%/g, '#%');
        value = value.replace(/_/, '\_');

        return value;
    };

    /*
     * 店舗検索
     * 
     * @param {string} dlg ダイアログテンプレート
     * @returns {なし}
     */
    $scope.searchInfo = function (dlg) {

        // データベースが開いていなければ、開く
        if (goiken === null) {

            goiken = openDatabase('goiken', '0.1', '店舗情報', 2 * 1024 * 1024);

        }

        var keyword = $scope.keyword;

        if (keyword === undefined || keyword === '') {
            return;
        } else {
            $scope.currentText = $scope.checkValue(keyword);
        }

        $scope.sql = "select tenpotype, tenponame, lat, lon," +
                "((lat - " +
                currentLat +
                ") * (lat - " +
                currentLat +
                ") + (lon - " +
                currentLon +
                ") * (lon - " +
                currentLon +
                ")) as dist" +
                " from m_tenpo " +
                " where " +
                " tenponame like '%" +
                $scope.currentText +
                "%' or address like '%" +
                $scope.currentText +
                "%' or tenpotype like '%" +
                $scope.currentText +
                "%' escape '#' order by dist ASC";
        ;

        goiken.transaction(
                function (tx) {

                    $scope.result = tx.executeSql($scope.sql, [],
                            function (tx, rs) {

                                var result = rs.rows;
                                var len = result.length;

                                if (len === 0) {

                                    map.setClickable(false);

                                    // 検索結果がない場合、アラートを表示
                                    navigator.notification.alert(
                                            'お探しの地名・店舗名に該当する店舗が見つかりませんでした。', // メッセージ
                                            function () {
                                                map.setClickable(true);
                                            }, // コールバック
                                            '検索結果', // タイトル
                                            'OK' // ボタン名
                                            );

                                } else {

                                    var tenpo = new Array();

                                    $scope.data = result;

                                    for (var i = 0; i < len; i++) {

                                        var row = result.item(i);

                                        tenpo.push(row);
                                    }

                                    SharedSearchResultSV.set(tenpo);

                                    ons.ready(function () {
                                        ons.createDialog(dlg).then(function (dialog) {
                                            $timeout(function () {
                                                console.log('ダイアログ処理が実行された');
                                                dialog.show({animation: "none"});
                                            }, 50);
                                        });
                                    });

                                }

                                cordova.plugins.Keyboard.close();

                            },
                            function (tx, error) {
                                alert(error);
                            });
                }
        );
    };
};

/*
 * 検索結果を取得
 *
 * @param $scope Angular Js標準サービス
 * @param SharedSearchResultSV 検索結果共有サービス
 * @param ShareTenpoInfoSV 店舗情報共有サービス
 * @returns null
 */
GetSearchResultCtrl = function ($scope, $timeout, SharedSearchResultSV, ShareTenpoInfoSV) {

    $scope.result = SharedSearchResultSV.get();
    $scope.map = map;
    $scope.map.setClickable(false);
    $scope.dialogs = {};

    // タブレット対応
    if ((ua.indexOf('iPad') > 0) || ((ua.indexOf('Android') > 0) && (ua.indexOf('Mobile') === -1))) {
        $('.close-detail .close-detail-img').css({'width': '60%'});
    }

    /*
     * 店舗情報をセット
     * 
     * @param {obj} obj
     * @returns {なし}
     */
    $scope.sendTenpoInfo = function (obj) {

        ShareTenpoInfoSV.set(obj);

    };

    /*
     * 店舗詳細を表示
     * 
     * @param {type} dlg
     * @returns {undefined}
     */
    $scope.viewDetail = function (dlg) {

        if (!$scope.dialogs[dlg]) {

            ons.createDialog(dlg).then(function (dialog) {

                $scope.dialogs[dlg] = dialog;
                dialog.show({animation: "none"});

            });

        } else {

            $scope.dialogs[dlg].show({animation: "none"});

        }
    };

    /*
     * 中心に表示する店舗を設定
     * 
     * @param {obj} obj
     * @returns {なし}
     */
    $scope.sendCenter = function (obj) {

        console.log('in on close');

        lat = obj.lat;
        lon = obj.lon;

        if (ons.platform.isIOS()) {
            selectedTenpoStr = "  " + obj.tenpotype + "\n  " + obj.tenponame;
        } else {
            selectedTenpoStr = obj.tenpotype + '\n' + obj.tenponame;
        }

        flg = 2;
    };

    /* ダイアログを閉じる
     * 
     * @param {type} obj
     * @returns {なし}
     */
    $scope.closeDialog = function () {

        // 排他解除タイマー解除
        $timeout.cancel(showDialogTimer);
        showDialogTimer = null;
        // 排他フラグ解除
        eventExclusion = false;
        console.log("店舗ダイアログ排他解除");

        // ダイアログを閉じる 
        dialog.destroy();

        // 地図をクリック可能にする
        map.setClickable(true);

        // 地図移動イベントを可能にする
        flg = 3;
    };

    /*
     * 店舗をクリックして、ダイアログを閉じる
     * 
     * @param {obj} obj
     * @returns {なし}
     */
    $scope.onClose = function (obj) {

        // 排他解除タイマー解除
        $timeout.cancel(showDialogTimer);
        showDialogTimer = null;
        // 排他フラグ解除
        eventExclusion = false;
        console.log("店舗ダイアログ排他解除");

        // ダイアログ消去
        dialog.destroy();

        // 地図の中央表示位置セット
        $scope.sendCenter(obj);

        // 「店舗」画面を再描画
        var element = document.getElementById("cmap");
        var $target_scope = angular.element(element).scope();

        $target_scope.initial();

        $scope.map.setClickable(true);

    };
};

/*
 * 店舗詳細情報取得
 *
 * @param $scope Angular Js標準サービス
 * @param ShareTenpoInfoSV 店舗情報共有サービス
 * @param {type} ShareRenkeiInfoSV アプリ連携サービス
 * @param {type} CalculationSV  計算サービス
 * @returns null
 */
DetailCtrl = function ($scope, $timeout, ShareTenpoInfoSV, ShareRenkeiInfoSV, CalculationSV, MessageSV) {

    $scope.tenpoinfo = ShareTenpoInfoSV.get();   // 店舗情報を取得
    $scope.renkeiImg = 'map_renkeiBtn_390x260';  // 連絡ボタンデフォルト画像
    $scope.telImg = 'map_denwaBtn_390x260';      // 電話ボタンデフォルト画像
    $scope.partyImg = 'map_enkaiBtn_390x260';    // 予約ボタンデフォルト画像
    $scope.map = map;                            // マップを本コントローラに導入
    $scope.isIpad = ons.platform.isIPad();       // iPad判断
    var serviceIconLocalDir = rootDir + serviceIconPath;             // サービス画面の画像保存先（ローカル）

    /*
     * サービスアイコンを取得
     * 
     * @returns {なし}
     */
    $scope.getServiceIcon = function () {

        var getIconsSQL = "select *" +
                " from m_service_icon" +
                " order by view_priority ASC";

        var iconPathArr = [];

        // データベースが開いていなければ、開く
        if (goiken === null) {

            goiken = openDatabase('goiken', '0.1', '店舗情報', 2 * 1024 * 1024);

        }

        goiken.transaction(
                function (tx) {
                    tx.executeSql(getIconsSQL, [],
                            function (tx, rs) {

                                var data = rs.rows;
                                var iconNum = data.length;

                                for (var i = 0; i < iconNum; i++) {

                                    var iconName = data.item(i).icon_name;

                                    if ($scope.tenpoinfo[iconName] !== null && $scope.tenpoinfo[iconName] !== 0) {

                                        iconPathArr.push({url: serviceIconLocalDir + data.item(i).icon});

                                    }

                                }

                                $scope.serviceIcon = iconPathArr;
                                $scope.$apply();

                            },
                            function (tx, error) {

                                console.log('サービスアイコンの取得に失敗しました。' + error);

                            });
                });
    };

    // 地図を一旦非表示
    $scope.map.setClickable(false);

    // ゲットサービスアイコン
    $scope.getServiceIcon();

    /*
     * ナビコールバック
     * 
     * @param {number} buttonIndex
     * @returns {なし}
     */
    $scope.callbackActionSheet = function (buttonIndex) {

        setTimeout(function () {

            var lat = $scope.tenpoinfo.lat;
            var lon = $scope.tenpoinfo.lon;
            var distance = CalculationSV.getDistance(currentLat, currentLon, lat, lon);
            var appName = 'sp2';
            var tel = $scope.tenpoinfo.tel;
            var address = $scope.tenpoinfo.address;
            var callbackUrl = 'anrakute://k.anrakutei.jp/sp/';
            var title = $scope.tenpoinfo.tenpotype + $scope.tenpoinfo.tenponame;
            var mode = $scope.getMode(distance);

            if (buttonIndex === 1) {

                if (device.platform === 'Android') {

                    var googleNaviURL = 'google.navigation:///?ll=' + lat + ',' + lon + '&title=' + title + '&mode=' + mode;
                    var googleDownlodUrl = 'https://play.google.com/store/apps/details?id=com.google.android.apps.maps&hl=ja';
                    var googleNaviSchema = 'com.google.android.apps.maps';


                    appAvailability.check(googleNaviSchema, // ナビコンのスキーマ　https://play.google.com/store/apps/details?id=jp.co.denso.navicon.view&hl=de　を参照
                            function () { // ナビコンがインストールされた場合、アプリケーションを起動させる
                                $scope.startApp(googleNaviURL);
                            },
                            function () { // ナビコンがインストールされていない場合、インストールを促す
                                //失敗のときの処理
                                navigator.notification.confirm(
                                        'Google Mapsとの連携機能を利用するためには、Google Mapsアプリをインストールしてください。', // メッセージ
                                        function (btnindex) {
                                            if (btnindex === 1) { // ダウンロードが押された場合、アプリケーションをインストールする
                                                $scope.startApp(googleDownlodUrl);
                                            }
                                        }, // コールバック
                                        'Google Mapsが見つかりません', // タイトル
                                        'ダウンロード,キャンセル' // ボタン名
                                        );
                            }
                    );
                } else if (device.platform === 'iOS') {
                    $scope.startApp('https://maps.apple.com/?daddr=' + address);
                } else {
                    window.plugins.actionsheet.hide();
                }

            } else if (buttonIndex === 2) {

                if (device.platform === 'Android') {

                    var naviconNaviURL = 'navicon://navicon.denso.co.jp/setPOI?ver=1.4&ll=' + lat + ',' + lon + '&appName=' + appName + '&tel' + tel + '&callURL' + callbackUrl + '&title=' + title + '&mode=' + mode;
                    var naviconSchema = (device.platform === 'Android') ? 'jp.co.denso.navicon.view' : 'navicon://navicon.denso.co.jp/';

                    appAvailability.check(
                            naviconSchema, // ナビコンのスキーマ　https://play.google.com/store/apps/details?id=jp.co.denso.navicon.view&hl=de　を参照
                            function () { // ナビコンがインストールされた場合、アプリケーションを起動させる
                                $scope.startApp(naviconNaviURL);
                            },
                            function () { // ナビコンがインストールされていない場合、インストールを促す
                                var naviconDownlodUrl = (device.platform === 'Android') ? 'https://play.google.com/store/apps/details?id=jp.co.denso.navicon.view&hl=de' :
                                        'https://itunes.apple.com/jp/app/navicon-odekakesapoto/id368186022';

                                //失敗のときの処理
                                navigator.notification.confirm(
                                        'NaviConとの連携機能を利用するためには、NaviConアプリをインストールしてください。', // メッセージ
                                        function (btnindex) {
                                            if (btnindex === 1) { // ダウンロードが押された場合、アプリケーションをインストールする
                                                $scope.startApp(naviconDownlodUrl);
                                            }
                                        }, // コールバック
                                        'NaviConが見つかりません', // タイトル
                                        'ダウンロード,キャンセル' // ボタン名
                                        );
                            }
                    );
                } else if (device.platform === 'iOS') {

                    var googleNaviURL = 'comgooglemaps://?saddr=現在地&daddr=' + address + '&directionsmode=' + mode;
                    var googleDownlodUrl = 'https://itunes.apple.com/jp/app/google-maps/id585027354?mt=8';
                    var googleNaviSchema = 'comgooglemaps://maps.';


                    appAvailability.check(googleNaviSchema,
                            function () { // Google Mapがインストールされた場合、アプリケーションを起動させる
                                $scope.startApp(googleNaviURL);
                            },
                            function (e) { // Google Mapがインストールされていない場合、インストールを促す
                                //失敗のときの処理
                                navigator.notification.confirm(
                                        'Google Mapsとの連携機能を利用するためには、Google Mapsアプリをインストールしてください。', // メッセージ
                                        function (btnindex) {
                                            if (btnindex === 1) { // ダウンロードが押された場合、アプリケーションをインストールする
                                                $scope.startApp(googleDownlodUrl);
                                            }
                                        }, // コールバック
                                        'Google Mapsが見つかりません', // タイトル
                                        'ダウンロード,キャンセル' // ボタン名
                                        );
                            }
                    );


                } else {
                    window.plugins.actionsheet.hide();
                }

            } else if (buttonIndex === 3 && device.platform === 'iOS') {

                var naviconNaviURL = 'navicon://navicon.denso.co.jp/setPOI?ver=1.4&ll=' + lat + ',' + lon + '&appName=' + appName + '&tel' + tel + '&callURL' + callbackUrl + '&title=' + title + '&mode=' + mode;
                var naviconSchema = 'navicon://navicon.denso.co.jp/';

                appAvailability.check(
                        naviconSchema, // ナビコンのスキーマ　https://play.google.com/store/apps/details?id=jp.co.denso.navicon.view&hl=de　を参照
                        function () { // ナビコンがインストールされた場合、アプリケーションを起動させる
                            $scope.startApp(naviconNaviURL);
                        },
                        function () { // ナビコンがインストールされていない場合、インストールを促す
                            var naviconDownlodUrl = 'https://itunes.apple.com/jp/app/navicon-odekakesapoto/id368186022';

                            //失敗のときの処理
                            navigator.notification.confirm(
                                    'NaviConとの連携機能を利用するためには、NaviConアプリをインストールしてください。', // メッセージ
                                    function (btnindex) {
                                        if (btnindex === 1) { // ダウンロードが押された場合、アプリケーションをインストールする
                                            $scope.startApp(naviconDownlodUrl);
                                        }
                                    }, // コールバック
                                    'NaviConが見つかりません', // タイトル
                                    'ダウンロード,キャンセル' // ボタン名
                                    );
                        }
                );
            } else {
                window.plugins.actionsheet.hide();
            }

        });
    };

    /*
     * ナビActionSheet
     * 
     * @returns {なし}
     */
    $scope.shareNaviSheet = function () {

        var options = {
            'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
            'title': '連携アプリを使う',
            'addCancelButtonWithLabel': 'キャンセル',
            'androidEnableCancelButton': true,
            'winphoneEnableCancelButton': true
        };

        options.buttonLabels = (device.platform === 'Android') ? ['経路案内（マップ）', 'カーナビ連携（NaviCon）'] : ['経路案内（マップ）', '経路案内（GoogleMaps）', 'カーナビ連携（NaviCon）'];

        window.plugins.actionsheet.show(options, $scope.callbackActionSheet);

    };

    /*
     * 電話コールバック
     * 
     * @param {number} buttonIndex
     * @returns {なし}
     */
    $scope.callbackTel = function (buttonIndex) {

        setTimeout(function () {

            if (buttonIndex === 1) {

                $scope.startApp('tel:' + $scope.tenpoinfo.tel);

            } else {

                window.plugins.actionsheet.hide();
            }

        });
    };

    /*
     * 電話ActionSheet
     * 
     * @returns {なし}
     */
    $scope.telSheet = function () {

        var options = {
            'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
            'title': 'お電話でもご予約承ります',
            'buttonLabels': [$scope.tenpoinfo.tel + 'に電話する'],
            'addCancelButtonWithLabel': 'キャンセル',
            'androidEnableCancelButton': true,
            'winphoneEnableCancelButton': true
        };

        window.plugins.actionsheet.show(options, $scope.callbackTel);

    };

    /*
     * 予約コールバック
     * 
     * @param {number} buttonIndex
     * @returns {なし}
     */
    $scope.callbackParty = function (buttonIndex) {

        setTimeout(function () {

            if (buttonIndex === 1) {

                // ネットワーク状態チェック
                if (navigator.connection.type === 'none') {
                    // 接続エラー表示
                    MessageSV.alert(0);
                } else {
                    // 「宴会ご予約フォーム」を表示
                    $scope.startApp('https://www.anrakutei.co.jp/yoyaku/yoyaku_form.php?tenpocd=' + $scope.tenpoinfo.tenpocd);
                }

            } else {

                window.plugins.actionsheet.hide();

            }

        });
    };

    /*
     * 予約ActionSheet
     * 
     * @returns {なし}
     */
    $scope.partySheet = function () {

        // ネットワーク状態チェック
        if (navigator.connection.type === 'none') {

            // 接続エラー表示
            MessageSV.alert(0);

            return;
        }

        var options = {
            'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
            'title': 'お電話でもご予約承ります',
            'buttonLabels': ['ご予約フォームから予約する'],
            'addCancelButtonWithLabel': 'キャンセル',
            'androidEnableCancelButton': true,
            'winphoneEnableCancelButton': true
        };

        window.plugins.actionsheet.show(options, $scope.callbackParty);

    };

    /*
     * タップ店舗情報をセット
     * 
     * @param {obj} obj
     * @returns {なし}
     */
    $scope.send = function (obj) {

        ShareRenkeiInfoSV.set(obj);

    };

    /*
     * ナビモード
     * 
     * @param {number} dist
     * @returns {String}
     */
    $scope.getMode = function (dist) {

        var mode = (device.platform === 'Android') ? 'd' : 'driving';

        if (dist < 1000) {
            mode = (device.platform === 'Android') ? 'w' : 'walking';
        }

        return mode;
    };

    /*
     * アプリを起動
     * 
     * @param {string} url
     * @returns {なし}
     */
    $scope.startApp = function (url) {

        cordova.InAppBrowser.open(url, '_system', 'location=yes');

    };

    /*
     * マップを更新、ダイアログを閉じる
     * 
     * @returns {なし}
     */
    $scope.freshMap = function () {

        // 排他解除タイマー解除
        $timeout.cancel(showDialogTimer);
        showDialogTimer = null;
        // 排他フラグ解除
        eventExclusion = false;
        console.log("店舗ダイアログ排他解除");

        map.setClickable(true);

        $timeout(function () {
            dialog.destroy();
        }, 50);

    };
};

/* --------------------コントローラー関数作成エンド--------------------*/


/* --------------------コントローラー登録スタート--------------------*/
app.controller('MapCtrl', ['$scope', '$timeout', 'GetTenpoinfoSV', 'ShareTenpoInfoSV', 'UpdateDbSV', 'GetServiceIconSV', 'GetServiceIconLastUpdateSV', 'SharedSearchResultSV', 'ProgressSV', MapCtrl]);
app.controller('SearchTenpoCtrl', ['$scope', '$timeout', 'SharedSearchResultSV', SearchTenpoCtrl]);
app.controller('GetSearchResultCtrl', ['$scope', '$timeout', 'SharedSearchResultSV', 'ShareTenpoInfoSV', GetSearchResultCtrl]);
app.controller('DetailCtrl', ['$scope', '$timeout', 'ShareTenpoInfoSV', 'ShareRenkeiInfoSV', 'CalculationSV', 'MessageSV', DetailCtrl]);
/* --------------------コントローラー登録エンド--------------------*/

/* --------------------サービス関数作成スタート--------------------*/

/*
 * 店舗情報取得サービス
 *
 * @param $http Angular Js標準サービス
 * @returns {GetTenpoinfoSV.tenpoinfoSV}
 */
GetTenpoinfoSV = function ($http) {

    var tenpoinfoSV = {};

    // 店舗情報取得
    tenpoinfoSV.getTenpoInfo = function (latlon, callback) {

        var latlonArr = latlon.split(',');
        var lat = latlonArr[0], lon = latlonArr[1];

        $http.get(serverUrl + 'sp2/map_all_json_v2.php?lat=' + lat + '&lon=' + lon + '&callback=JSON_CALLBACK', {timeout: 60000})
                .success(
                        function (data) {
                            callback(data);
                        })
                .error(function () {
                    if (tabbar.getActiveTabIndex() === 1) {
                        // ネットワーク状態（オンライン）チェック
                        if (navigator.connection.type !== 'none') {
                            // エラーメッセージ表示
                            navigator.notification.alert(
                                    '情報の取得に失敗しました。\n通信環境の良い場所で、ご利用ください。', // メッセージ
                                    function (et) {
                                        console.log(et);
                                        // プログレスバー消去
                                        // オーナーチェック
                                        if (owner === 1) {
                                            // オーナーをクリア
                                            owner = null;

                                            // プログレスバー消去
                                            if (ons.platform.isIOS()) {
                                                window.Progress.hide();
                                            } else {
                                                window.plugins.ProgressView.hide();
                                            }
                                        }
                                    }, // コールバック
                                    '情報取得エラー', // タイトル
                                    'OK' // ボタン名
                                    );
                        } else {
                            // プログレスバーを消去
                            if (owner === 1) {
                                // オーナーをクリア
                                owner = null;

                                // プログレスバー消去
                                if (ons.platform.isIOS()) {
                                    window.Progress.hide();
                                } else {
                                    window.plugins.ProgressView.hide();
                                }
                            }
                        }
                    }
                });
    };

    return tenpoinfoSV;
};

/*
 * 検索結果共有サービス
 *
 * @returns {SharedSearchResultSV.sharedSearchResult}
 */
SharedSearchResultSV = function () {

    var sharedSearchResult = {};

    sharedSearchResult.data = {};

    sharedSearchResult.set = function (obj) {

        sharedSearchResult.data = obj;

    };

    sharedSearchResult.get = function () {

        return sharedSearchResult.data;

    };

    return sharedSearchResult;
};

/*
 * 店舗情報共有サービス
 *
 * @returns {ShareTenpoInfoSV.shareTenpo}
 */
ShareTenpoInfoSV = function () {

    var shareTenpo = {};

    // 店舗情報設定
    shareTenpo.set = function (obj) {
        shareTenpo.data = obj;
    };

    //店舗情報ゲット
    shareTenpo.get = function () {
        return shareTenpo.data;
    };

    return shareTenpo;
};

/*
 * アプリ連携サービス
 *
 * @returns {ShareRenkeiInfoSV.shareRenkei}
 */
ShareRenkeiInfoSV = function () {

    var shareRenkei = {};

    shareRenkei.set = function (obj) {

        shareRenkei.data = obj;

    };

    shareRenkei.get = function () {

        return shareRenkei.data;

    };

    return shareRenkei;
};

/*
 * 計算サービス
 *
 * @returns {CalculationSV.an3Anonym$13}
 */
CalculationSV = function () {

    return {
        getDistance: function (lat1, lon1, lat2, lon2) {

            var mode = false;
            var radlat1 = lat1 * Math.PI / 180.0; //経度1
            var radlon1 = lon1 * Math.PI / 180.0; //緯度1
            var radlat2 = lat2 * Math.PI / 180.0; //経度2
            var radlon2 = lon2 * Math.PI / 180.0; //緯度2
            //平均緯度
            var radLatAve = (radlat1 + radlat2) / 2;
            //緯度差
            var radLatDiff = radlat1 - radlat2;
            //経度差算
            var radLonDiff = radlon1 - radlon2;

            var sinLat = Math.sin(radLatAve);

            if (mode === true) {

                //mode引数がtrueなら世界測地系で計算（デフォルト）
                var tmp = 1.0 - 0.00669438 * (sinLat * sinLat);
                var meridianRad = 6335439.0 / Math.sqrt(tmp * tmp * tmp); // 子午線曲率半径
                var dvrad = 6378137.0 / Math.sqrt(tmp); // 卯酉線曲率半径

            } else {

                //mode引数がfalseなら日本測地系で計算
                var tmp = 1.0 - 0.00667478 * (sinLat * sinLat);
                var meridianRad = 6334834.0 / Math.sqrt(tmp * tmp * tmp); // 子午線曲率半径
                var dvrad = 6377397.155 / Math.sqrt(tmp); // 卯酉線曲率半径

            }

            var t1 = meridianRad * radLatDiff;
            var t2 = dvrad * Math.cos(radLatAve) * radLonDiff;
            var dist = Math.sqrt((t1 * t1) + (t2 * t2));

            dist = Math.floor(dist); //小数点以下切り捨て

            return dist; //２点間の直線距離を返す (単位はm)
        }
    };

};

/*
 * 店舗更新データ取得サービス
 *
 * @param $http Angular Js標準サービス
 * @returns {UpdateDbSV.updateDbSV}
 */
UpdateDbSV = function ($http) {

    var updateDbSV = {};

    // 店舗情報取得
    updateDbSV.getDiffInfo = function (ludate, callback) {

        $http.get(serverUrl + 'sp2/map_diff_json_v2.php?ludate=' + ludate + '&callback=JSON_CALLBACK', {timeout: 60000})
                .success(
                        function (data) {
                            callback(data);
                        })
                .error(function () {
                    if (tabbar.getActiveTabIndex() === 1) {
                        // ネットワーク状態（オンライン）チェック
                        if (navigator.connection.type !== 'none') {
                            // エラーメッセージ表示
                            navigator.notification.alert(
                                    '情報の取得に失敗しました。\n通信環境の良い場所で、ご利用ください。', // メッセージ
                                    function (et) {
                                        console.log(et);
                                        // プログレスバー消去
                                        // オーナーチェック
                                        if (owner === 1) {
                                            // オーナーをクリア
                                            owner = null;

                                            // プログレスバー消去
                                            if (ons.platform.isIOS()) {
                                                window.Progress.hide();
                                            } else {
                                                window.plugins.ProgressView.hide();
                                            }
                                        }
                                    }, // コールバック
                                    '情報取得エラー', // タイトル
                                    'OK' // ボタン名
                                    );
                        } else {
                            // プログレスバーを消去
                            if (owner === 1) {
                                // オーナーをクリア
                                owner = null;

                                // プログレスバー消去
                                if (ons.platform.isIOS()) {
                                    window.Progress.hide();
                                } else {
                                    window.plugins.ProgressView.hide();
                                }
                            }
                        }
                    }

                    // アップデートチェックフラグを解除
                    setEventExclusionTimer(300);
                    console.log('店舗の情報取得エラーが発生した場合、排他処理を解除');
                });
    };

    return updateDbSV;

};

/*
 * サービスアイコンデータ取得サービス
 *
 * @param $http Angular Js標準サービス
 * @returns {getServiceIconSV}
 */
GetServiceIconSV = function ($http) {

    var getServiceIconSV = {};

    //  サービスアイコン取得
    getServiceIconSV.getIcons = function (callback) {

        $http.get(serverUrl + 'sp2/get_service_icon.php', {timeout: 60000})
                .success(
                        function (data) {
                            callback(data);
                        })
                .error(function () {
                    // ネットワーク状態（オンライン）チェック
                    if (navigator.connection.type !== 'none') {
                        console.log("サービスアイコン情報の取得に失敗しました。");
                    }
                });
    };

    return getServiceIconSV;

};

/*
 * サービスアイコン最新更新日付取得
 * 
 * $http Angular Js標準サービス
 * @returns {getServiceIconLastUpdateSV}
 */
GetServiceIconLastUpdateSV = function ($http) {

    var getServiceIconLastUpdateSV = {};

    //  サービスアイコン取得
    getServiceIconLastUpdateSV.getDate = function (callback) {

        // サービスアイコンの更新をチェックするタイムアウト時間を3000に変更
        $http.get(serverUrl + 'sp2/get_last_update_service_icon.php', {timeout: 3000})
                .success(
                        function (data) {
                            callback(data);
                        })
                .error(function () {
                    if (tabbar.getActiveTabIndex() === 1) {
                        // ネットワーク状態（オンライン）チェック
                        if (navigator.connection.type !== 'none') {
                            // エラーメッセージ表示
                            navigator.notification.alert(
                                    '情報の取得に失敗しました。\n通信環境の良い場所で、ご利用ください。', // メッセージ
                                    function (et) {
                                        console.log(et);
                                        // プログレスバー消去
                                        // オーナーチェック
                                        if (owner === 1) {
                                            // オーナーをクリア
                                            owner = null;

                                            // プログレスバー消去
                                            if (ons.platform.isIOS()) {
                                                window.Progress.hide();
                                            } else {
                                                window.plugins.ProgressView.hide();
                                            }
                                        }
                                    }, // コールバック
                                    '接続エラー', // タイトル
                                    'OK' // ボタン名
                                    );
                        } else {
                            // プログレスバーを消去
                            if (owner === 1) {
                                // オーナーをクリア
                                owner = null;

                                // プログレスバー消去
                                if (ons.platform.isIOS()) {
                                    window.Progress.hide();
                                } else {
                                    window.plugins.ProgressView.hide();
                                }
                            }
                        }
                    }

                    // アップデートチェックフラグを解除
                    setEventExclusionTimer(300);
                    console.log('アップデータチェックが完了したので、タブバー操作ロックを解除した');
                });
    };

    return getServiceIconLastUpdateSV;

};

/* --------------------サービス関数作成エンド--------------------*/

/* --------------------サービス登録スタート--------------------*/
app.factory('GetTenpoinfoSV', ['$http', GetTenpoinfoSV]);
app.factory('SharedSearchResultSV', SharedSearchResultSV);
app.factory('ShareTenpoInfoSV', ShareTenpoInfoSV);
app.factory('ShareRenkeiInfoSV', ShareRenkeiInfoSV);
app.factory('CalculationSV', CalculationSV);
app.factory('UpdateDbSV', ['$http', UpdateDbSV]);
app.factory('GetServiceIconSV', ['$http', GetServiceIconSV]);
app.factory('GetServiceIconLastUpdateSV', ['$http', GetServiceIconLastUpdateSV])

/* --------------------サービス登録エンド--------------------*/


/*---------------------タッチイベントサービス----------------*/

app.directive('touchBotton', function ($timeout) {

    return {
        restrict: 'A',
        link: function ($scope, $elm, $attrs) {
            $elm.bind('touchstart', function (evt) {

                $scope.longPress = true;

                $timeout(function () {

                    if ($scope.longPress) {

                        $scope.$apply(function () {

                            $scope.$eval($attrs.onLongPress);
                            $elm.attr('src', $attrs.touchBotton);

                        });
                    }

                }, 0);
            });

            $elm.bind('touchend', function (evt) {

                $scope.longPress = false;

                if ($attrs.onTouchEnd) {

                    $scope.$apply(function () {
                        $scope.$eval($attrs.onTouchEnd);
                        $elm.attr('src', $attrs.onTouchEnd);
                    });

                }

            });
        }
    };

});

// ダイアログの高さを調整
app.directive('ngDialogheight', function () {
    return function (scope, element, attrs) {

        // タブレット対応
        if ((ua.indexOf('iPad') > 0) || ((ua.indexOf('Android') > 0) && (ua.indexOf('Mobile') === -1))) {
            $('.bottom-icons-renkei-img,.bottom-icons-denwa-img,.bottom-icons-enkai-img').css({'width': '80%'});
            $('.to-image').css({'height': '65%'});
            $('.shopper-comment').css({'fontSize': '17px'});
            $('.name').css({'fontSize': '26px'});
            $('.kind').css({'fontSize': '23px'});
            $('.nazotitle1,.nazotitle3').css({'fontSize': '23px'});
            $('.nazomoji').css({'fontSize': '26px'});
            $('.result-title-text').css({'fontSize': '34px'});
        }

        // タブレットの「チャレンジする」ボタン対応
        if (Number((screen.height / screen.width).toFixed(1)) < 1.5) {
            $('.dialog').css({"height": "84.5%"});
        } else if ((ons.platform.isIOS() === true) && (Number((screen.height / screen.width).toFixed(1)) === 1.5) && (window.devicePixelRatio === 2)) {
            // iPhone4s対応
            $('.dialog').css({"height": "76%"});
        }

    };
});

// サービスアイコンを八つ並べる
app.directive('ngresize', function () {
    return function (scope, element, attrs) {
        // ユーザエンジェトを取得
        var ua = navigator.userAgent;
        console.log(ua);
        // タブレットの「チャレンジする」ボタン対応
        if (ons.platform.isIPad() || (ua.indexOf('Android') > 0 && ua.indexOf('Mobile') === -1)) {
            $('.to-back').css({"width": "91.5%"});
        }
    };
});

// 店舗詳細情報のフォントサイズ設定 ng-detial
app.directive('ngDetial', function () {
    return function (scope, element, attrs) {
        // タブレット対応
        if ((ua.indexOf('iPad') > 0) || ((ua.indexOf('Android') > 0) && (ua.indexOf('Mobile') === -1))) {
            angular.element(element[0]).css({'fontSize': '24px'});
        }
    };
});

// タブレット対応のために、閉じるボタンのワイズ設定　ng-closebutton
app.directive('ngClosebutton', function () {
    return function (scope, element, attrs) {
        // タブレット対応
        if ((ua.indexOf('iPad') > 0) || ((ua.indexOf('Android') > 0) && (ua.indexOf('Mobile') === -1))) {
            angular.element(element[0]).css({'width': '60%'});
        }
    };
});