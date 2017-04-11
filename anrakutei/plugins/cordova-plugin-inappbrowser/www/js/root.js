/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
// Angular JsにOnsen uiのモジュールを取り込み
//var app = ons.bootstrap();

// ほかのモジュールを導入
var app = angular.module('sp2App', ['onsen', 'ngSanitize', 'ngTouch']);

// グローバル変数の定義
var map, // マップ
        currentLat = 35.887531389, // 現在地緯度 地図初期緯度(安楽亭　本社)
        currentLon = 139.630968333, // 現在地経度 地図初期緯度(安楽亭　本社)
        eventExclusion = true, // イベント排他用のフラグ
        eventExclusionTimer = null, // イベント排他用のタイマー
        tabbarHeight = 49.0, // IOSプログレスバー表示の縦位置
        owner = null, // プログレスバーの表示オーナー（おしらせ：0、店舗：1、クーポン：2、スペシャル：3）
        goiken = null, // アプリDB
        rootObj = null, // ファイルシステムのルートオブジェクト
        rootDir = null, // ルートディレクトリのパス
        infoPath = 'info/', // お知らせ画像格納先（rootDir + infoPath）
        iconPath = 'icon/', // お知らせアイコン画像格納先(rootDir + iconPath)
        couponsImagPath = 'coupons/', // お得なクーポンのなぞポン画像格納先(rootDir + nazoponPath)
        serviceIconPath = 'service/', // サービスアイコン画像格納先(rootDir + serviceIconPath)
        specialPath = 'special/', // スペシャル画像格納先(rootDir + specialPath)
        specialDlPath = '../../../../DCIM/Camera/', // スペシャル画像のダウンロード先(rootDir + specialDlPath)
//        serverUrl = 'http://10.1.10.42/', // サーバーURL（開発用）
        serverUrl = 'https://k.anrakutei.jp/', // サーバーURL（本番用）
        infoIcon = new Object, // 「おしらせ」画面のアイコン情報
        pushBoot = false, // 通知バーからの起動（※バックグラウンド復帰は除く）
        bootProcess = false, // 起動処理中フラグ
        MarkerNomalArray = [], // マーカー
        MarkerSelectArray = [], // マーカー
        lat = 35.887531389, // 地図初期緯度(安楽亭　本社)
        lon = 139.630968333, // 地図初期経度(安楽亭　本社)
        selectedTenpoStr = '', // 吹き出しのメッセージ
        flg = 0, // 0:現在地イベント、1:中心移動イベント、2:店舗検索結果からのクリック
        currentTitle, // 一番最新クリックされたマーカータイトル
        currentMarker = null, // 一番最新クリックされたマーカー
        bookmarkArr = [], // クーポンブックマーク配列
        showDialogTimer = null; // ダイアログ表示制御タイマー

// タブレットの場合、画面を拡大表示する
var ua = navigator.userAgent;
var scale = 100;
if ((ua.indexOf('iPad') > 0) || ((ua.indexOf('Android') > 0) && (ua.indexOf('Mobile') === -1))) {
    var rootElement = document.documentElement;
    scale = 125;
    rootElement.style.zoom = scale + "%";
}

// FastClick対応
$(document).on({
    'DOMNodeInserted': function () {
        $('.pac-item, .pac-item span', this).addClass('needsclick');
    }
}, '.pac-container');

// イベントタイマーのセット
var setEventExclusionTimer = function (time) {

    if (eventExclusionTimer !== null) {
        // イベントタイマーのリセット
        clearTimeout(eventExclusionTimer);
    }

    // 排他解除タイマーセット
    eventExclusionTimer = setTimeout(function () {

        // ロック解除
        eventExclusion = false;
        eventExclusionTimer = null;
        console.log('排他解除');

    }, time);

};

// イベントタイマーの解除
var clearEventExclusionTimer = function () {

    if (eventExclusionTimer !== null) {
        // イベントタイマーのリセット
        clearTimeout(eventExclusionTimer);
        eventExclusionTimer = null;
    }

};

/*
 * デバイス起動処理
 * 
 * @param {type} param1
 * @param {type} param2
 * @param {type} param3
 */
document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {

    // オフライン
    document.addEventListener("offline", function () {

        // クーポンを非表示にする
        var element = document.getElementById("coupon");

        if (element) {

            var $target_scope = angular.element(element).scope();

            $target_scope.$apply(function () {
                $target_scope.netStatus = false;
            });

            // オフライン画面表示
            localStorage.setItem('viewCouponStatus', false);
        }

    }, false);

    // オンライン復帰イベント
    document.addEventListener("online", function () {

        // 選択タブ位置が「お知らせ」の場合、表示更新
        if (tabbar.getActiveTabIndex() === 0) {

            // 起動時は処理しない
            if (eventExclusion === true) {
                console.log("おしらせ表示排他中に、オンラインイベント発生");
                return;
            } else {
                eventExclusion = true;
            }

            var element = document.getElementById("info");

            if (element) {

                var $target_scope = angular.element(element).scope();

                $target_scope.$apply(function () {

                    //ページ更新処理実行
                    $target_scope.initial(false);
                });
            } else {
                // 排他を解除
                eventExclusion = false;
            }
        }

        // 選択タブ位置が「店舗」の場合、表示更新
        if (tabbar.getActiveTabIndex() === 1) {

            // 排他ロックをかける
            if (eventExclusion === false) {
                eventExclusion = true;
            }

            var element = document.getElementById("cmap");

            if (element) {

                var $target_scope = angular.element(element).scope();

                $target_scope.$apply(function () {

                    //ページ更新処理実行
                    $target_scope.initial();
                });
            } else {
                // 排他を解除
                eventExclusion = false;
            }
        }

        // 選択タブ位置が「お得なクーポン」の場合、表示更新
        if (tabbar.getActiveTabIndex() === 2) {

            // 排他ロックをかける
            if (eventExclusion === false) {
                eventExclusion = true;
            }

            var element = document.getElementById("coupon");

            if (element) {

                var $target_scope = angular.element(element).scope();

                $target_scope.$apply(function () {

                    $target_scope.netStatus = true;

                    //ページ更新処理実行
                    $target_scope.initial();
                });
            } else {
                // 排他を解除
                eventExclusion = false;
            }
        }

    }, false);

    // resumeイベントリスナー登録
    document.addEventListener("resume", onResume, false);

    /*
     * レジューム起動処理
     * 
     * @returns {undefined}
     */
    function onResume() {

//        console.log("レジューム起動");

        // Push通知の設定状態取得
        var push = localStorage.getItem('push_permission');

        // Push通知の受信をOFFにしている場合のみ、バッジ更新を行う。
        // ※コールドスタートからのバッジ更新は、TabbarCtrlで行う。
        if ((push === null) || (push === '0')) {

            // バッジ更新
            var element = document.getElementById("root");
            var $scope = angular.element(element).scope();
            $scope.$apply(function () {
                $scope.updateBadge();
            });
        }

        //----------------------------------------------------------------------
        // 店舗情報の更新チェック
        //----------------------------------------------------------------------
        var element = document.getElementById("cmap");
        if (element) {
            var $target_scope = angular.element(element).scope();

            // 現在時間を取得
            $target_scope.nowTime();

            // 最新の更新日付
            var localTime = localStorage.getItem('ludate');
            // 現在の日付
            var realNowTime = $target_scope.ludate;
            // ローカルにある店舗の最新更新日付
            var localDate = localTime.split(' ')[0];
            // 現在の日付
            var realDate = realNowTime.split(' ')[0];

//            console.log('最新の更新日付' + localTime);
//            console.log('現在の日付' + realNowTime);
//            console.log('ローカルにある店舗の最新更新日付' + localDate);
//            console.log('現在の日付' + realDate);

            // 日替わり処理
            if ((new Date(localDate.replace(/-/g, '/'))) < (new Date(realDate.replace(/-/g, '/')))) {

//                console.log('日替わり更新が発生');

                if (tabbar.getActiveTabIndex() === 1) {
                    // initail処理を実行
                    $target_scope.initial();
                } else {
                    // tenpoUpdateFlgを立てる
                    localStorage.setItem('tenpoUpdateFlg', true);
                }
            }
        }

        //----------------------------------------------------------------------
        // スペシャル情報の更新チェック
        //----------------------------------------------------------------------
        var wallpaperElement = document.getElementById("wallpaper");
        if (wallpaperElement) {
            var $wallpaper_scope = angular.element(wallpaperElement).scope();

            if (tabbar.getActiveTabIndex() === 3) {
                // initail処理を実行
                $wallpaper_scope.initial(1);
            } else {
                // wallpaperUpdateFlgを立てる
                localStorage.setItem('wallpaperUpdateFlg', true);
            }
        }

    }

    /*
     * Push通知プラグイン読込み
     * 
     * @type @exp;window@pro;plugins@pro;pushNotification
     */
    var pushNotification;
    pushNotification = window.plugins.pushNotification;

    // Android 通知の登録が成功した場合
    function successHandler(result) {
//        console.log('result = ' + result);
    }

    // iOS 通知の登録が成功した場合
    function tokenHandler(token) {
//        console.log('device token = ' + token);

        // ローカルに保存されているデバイストークンを取得
        var preID = localStorage.getItem('token');
        if (preID === null) {
            preID = "";
        }

        // デバイストークンの登録済みチェック
        if (preID !== token) {
            // 送信パラメータ設定
            var param = {
                devID: device.uuid,
                preToken: preID,
                newToken: token,
                os: device.platform
            };

            $.ajax({
                type: 'POST',
                url: serverUrl + 'sp2/reg_token_v2.php',
                data: param,
                dataType: 'json',
                success: function (result) {
//                    console.log("登録結果：" + result['msg']);
                    // デバイストークンの登録成功
                    if (result.msg === 'OK') {
//                        console.log('デバイストークンを登録しました');

                        // ローカルストレージに値を保持
                        localStorage.setItem('token', token);

                        // 通知許可設定保持
                        localStorage.setItem('push_permission', result['valid_flg']);
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log('デバイストークンの登録に失敗しました ' + errorThrown);

                    // デバイストークンをリセット
                    localStorage.setItem('token', "");
                }
            });
        }
    }

    // 通知の登録が失敗した場合
    function errorHandler(error) {
        console.log('error = ' + error);
    }

    console.log('registering ' + device.platform);
    if (device.platform == 'android' || device.platform == 'Android' || device.platform == "amazon-fireos") {
        pushNotification.register(
                successHandler,
                errorHandler,
                {
                    // ここをSender ID(プロジェクト番号)に変更
                    "senderID": "323371694234",
                    "ecb": "onNotificationGCM"
                });
    } else {
        pushNotification.register(
                tokenHandler,
                errorHandler,
                {
                    "badge": "true",
                    "sound": "true",
                    "alert": "true",
                    "ecb": "onNotificationAPN" // iOSは試せないので一旦保留
                });
    }

    //----------------------
    // デバイス情報登録処理
    //----------------------
    // ローカルに保存されている情報を取得
    var osVer = localStorage.getItem('os_version'); // OSバージョン
    var preUUID = localStorage.getItem('device_id'); // デバイスID

    // バージョン もしくは、デバイスIDに変更があった場合、情報を更新
    if ((osVer !== device.version) || (preUUID !== device.uuid)) {
        // デバイス情報セット
        var devInfo = {
            uuid: device.uuid,
            pre_uuid: preUUID,
            platform: device.platform,
            version: device.version,
            model: device.model
        };
        // デバイス情報更新
        $.ajax({
            type: 'POST',
            url: serverUrl + 'sp2/set_device_info_v2.php',
            data: devInfo,
            dataType: 'json',
            success: function (result) {
//                console.log("登録結果：" + result['msg']);
                // 端末情報更新成功
                if (result.msg === 'OK') {
//                    console.log('デバイス情報を登録しました');

                    // OSバージョンを保持
                    localStorage.setItem('os_version', device.version);
                    // デバイスID（uuid）を保持
                    localStorage.setItem('device_id', device.uuid);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log('デバイス情報の登録に失敗しました ' + errorThrown);
            }
        });
    }

    /*------------------------------ログ操作処理-------------------------------*/
    // 本日の日付を取得
    function nowDate(sep) {

        var nowDate = new Date();
        var year = nowDate.getFullYear();
        var month = (nowDate.getMonth() + 1 - 10 < 0) ? ('0' + (nowDate.getMonth() + 1)) : (nowDate.getMonth() + 1);
        var date = (nowDate.getDate() - 10 < 0) ? ('0' + nowDate.getDate()) : nowDate.getDate();

        if (sep === '/') {

            return year + '/' + month + '/' + date;

        } else {

            return year + '-' + month + '-' + date;

        }
    }

    // データベースが開いていなければ、開く 
    if (goiken === null) {

        goiken = openDatabase('goiken', '0.1', '店舗情報', 2 * 1024 * 1024);

    }

    // ログ処理初期化
    if (localStorage.getItem('is_log_initial') !== 'false') {

//        console.log('ログ処理初期化開始.');

        // ログテーブル作成SQL
        var createLogSQL = "CREATE TABLE IF NOT EXISTS t_app_op_log(" +
                "device_id character varying(512), " +
                "op_type smallint, " +
                "op_date bigint, " +
                "lat numeric(9,6), " +
                "lon numeric(9,6), " +
                "info_id bigint" +
                ")";

//        console.log('Log テーブル作成開始.');

        // ログテーブルを作成
        goiken.transaction(
                function (tx) {
                    tx.executeSql(createLogSQL, [],
                            function () {

//                                console.log('Log テーブル作成完了.');
//                                console.log('ログ処理初期化成功.');

                                // 初期済みフラグを立てる
                                localStorage.setItem('is_log_initial', 'false');

                                // 最新ログアップ日付を初期化
                                localStorage.setItem('last_log_up', nowDate('-'));

                            },
                            function () {

                                console.log('Log テーブル作成エラー.');
                                console.log('ログ処理初期化失敗.');

                                // ログ処理初期化失敗で、初期済みフラグを立てる
                                localStorage.setItem('is_log_initial', 'true');

                            });

                });
    } else {

        // ログ処理初期化を行ってからの、ログ処理

        var lastLogUp = localStorage.getItem('last_log_up'); // 最新ログアップ日付
        var nowDate = nowDate('-');                          // 本日の日付

        // 昨日まで、溜めたログがある
        if ((new Date(lastLogUp.replace(/-/g, '/'))) < (new Date(nowDate.replace(/-/g, '/')))) {

            // 起動処理表示
            if (owner === null) {
                owner = 0;  // オーナーは「おしらせ」で登録
                document.addEventListener("deviceready", function () {
                    if (ons.platform.isIOS()) {
                        window.Progress.show("起動処理中です", tabbarHeight);
                    } else {
                        window.plugins.ProgressView.show('起動処理中です',
                                "HORIZONTAL",
                                "DEVICE_LIGHT");
                        window.plugins.ProgressView.setProgress(0.00);
                    }
                }, false);

                // 起動処理中フラグをセット
                bootProcess = true;
            }

//            console.log('ログファイルをアップロードします。');

            // ログの抽出SQL
            var selectSQL = "SELECT * FROM t_app_op_log;";

            // ログを抽出、アップ
            goiken.transaction(function (tx) {
                tx.executeSql(selectSQL, [],
                        function (tx, rs) {

                            var data = rs.rows;    // 検索結果
                            var len = data.length; // 検索件数
                            var upNum = len;       // ログデータのカウント件数

                            // 抽出したログをアップ
                            for (var i = 0; i < len; i++) {

                                // ログのタイムスタンプ
                                var op_date = data.item(i).op_date;

//                                console.log('Ajaxでログデータを同期通信で、アップする');

                                // 同期通信を行う
                                $.ajax({
                                    type: 'POST',
                                    url: serverUrl + 'sp2/post_log_json.php',
                                    data: data.item(i),
                                    dataType: 'json',
                                    async: false,
                                    success: function (result) {

                                        // ログデータのアップに成功
                                        if (result.msg === 'OK') {

//                                            console.log('タイムスタンプが' + op_date + 'のデータがアップ完了しました。これから削除します。');

                                            // アップロード済みのログデータ削除SQL
                                            var deleteLogSQL = "DELETE FROM t_app_op_log WHERE op_date =" + op_date;

                                            // アップロード済みのログデータを削除
                                            goiken.transaction(
                                                    function (tx) {

                                                        tx.executeSql(deleteLogSQL, [],
                                                                function () {

//                                                                    console.log('タイムスタンプが' + op_date + 'のデータを削除しました。');
                                                                    upNum--;

                                                                    if (upNum === 0) {

//                                                                        console.log('溜めたログをすべて、アップロードしました。' + '(合計：' + len + '件)');

                                                                        // ファイルアップロードが完了し、ログアップ日付を更新
                                                                        localStorage.setItem('last_log_up', nowDate);
                                                                    }

                                                                },
                                                                function () {
                                                                    console.log('タイムスタンプが' + op_date + 'のデータを削除に失敗しました。');
                                                                });
                                                    });
                                        }

                                    },
                                    error: function (XMLHttpRequest, textStatus, errorThrown) {

                                        console.log('ログデータのアップに失敗しました。原因：' + errorThrown);

                                    }
                                });

                            }

                        },
                        function (tx, error) {

                            console.log('ログデータの抽出に失敗しました。原因：' + error);

                        }
                );
            });

        } else {

//            console.log('ログファイルをアップロードずみか、アプリを初期インストールした当日です。');

        }
    }
}

/*
 * androidの通知（GCMからの通知）
 * 
 * @param {type} e
 * @returns {undefined}
 */
function onNotificationGCM(e) {
//    console.log('EVENT -> RECEIVED:' + e.event);
    switch (e.event) {
        case 'registered':
            if (e.regid.length > 0)
            {
                // Your GCM push server needs to know the regID before it can push to this device
                // here is where you might want to send it the regID for later use.
//                console.log("regID = " + e.regid);

                // ローカルに保存されているレジストレーションIDを取得
                var preID = localStorage.getItem('token');
                if (preID === null) {
                    preID = "";
                }

                // レジストレーションIDの登録済みチェック
                if (preID !== e.regid) {
                    // 送信パラメータ設定
                    var param = {
                        devID: device.uuid,
                        preToken: preID,
                        newToken: e.regid,
                        os: device.platform
                    };

                    $.ajax({
                        type: 'POST',
                        url: serverUrl + 'sp2/reg_token_v2.php',
                        data: param,
                        dataType: 'json',
                        success: function (result) {
//                            console.log("登録結果：" + result['msg']);
                            // レジストレーションIDの登録成功
                            if (result.msg === 'OK') {
//                                console.log('レジストレーションIDを登録しました');

                                // ローカルストレージに値を保持
                                localStorage.setItem('token', e.regid);

                                // 通知許可設定保持
                                localStorage.setItem('push_permission', result['valid_flg']);
                            }
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            console.log('レジストレーションIDの登録に失敗しました ' + errorThrown);

                            // レジストレーションIDをリセット
                            localStorage.setItem('token', "");
                        }
                    });
                }
            }
            break;
        case 'message':
            // if this flag is set, this notification happened while we were in the foreground.
            // you might want to play a sound to get the user's attention, throw up a dialog, etc.
            if (e.foreground)
            {
//                console.log('--INLINE NOTIFICATION--');

                // on Android soundname is outside the payload.
                // On Amazon FireOS all custom attributes are contained within payload
//                    var soundfile = e.soundname || e.payload.sound;
                // if the notification contains a soundname, play it.
//                    var my_media = new Media("/android_asset/www/" + soundfile);
//                    my_media.play();
                //
                // 起動中の通知受信処理はここへ

                //--------------------------------------------------------------
                // アクティブ時の受信の場合のみ、バッジ更新
                // ※非アクティブからの起動の場合は、「おしらせ」遷移のため
                //--------------------------------------------------------------
                // 受信件数カウントアップ
                var cnt = localStorage.getItem('notice_cnt');
                cnt = parseInt(cnt) + 1;
                localStorage.setItem('notice_cnt', cnt);

                // 表示更新
                var element = document.getElementById("tab");
                // jQueryかjqLiteが有効な場合はセレクタを使える
                // var $scope = angular.element('#myElement').scope()
                var $scope = angular.element(element).scope();
//                alert("set badge:" + cnt);
                $scope.badge = cnt;
                $scope.$apply();
            } else
            { // otherwise we were launched because the user touched a notification in the notification tray.
                if (e.coldstart)
                {
                    // 未起動時の受信から起動の場合
//                    console.log('--COLDSTART NOTIFICATION--');

                    // 通知バーからの起動フラグをON
                    pushBoot = true;
                } else
                {
                    // バックグランド受信からの起動の場合
//                    console.log('--BACKGROUND NOTIFICATION--');

                    // 遷移先を「おしらせ」にする
                    tabbar.setActiveTab(0);

                    // 「おしらせ」再描画
                    var element = document.getElementById("info");
                    if (element) {
                        var $target_scope = angular.element(element).scope();
                        $target_scope.$apply(function () {
                            $target_scope.initial(true);
                        });
                    }
                }
            }
//            console.log('MESSAGE -> MSG: ' + e.payload.message);
            //Only works for GCM
//            console.log('MESSAGE -> MSGCNT: ' + e.payload.msgcnt);
            //Only works on Amazon Fire OS
//            console.log('MESSAGE -> TIME: ' + e.payload.timeStamp);
            break;
        case 'error':
            console.log('ERROR -> MSG:' + e.msg);
            break;
        default:
            console.log('EVENT -> Unknown, an event was received and we do not know what it is');
            break;
    }
}

/*
 * iOSの通知（APNSからの通知）
 * 
 * @param {type} event
 * @returns {undefined}
 */
function onNotificationAPN(event) {
    if (event.alert)
    {
        //----------------
        // バッジ更新処理
        //----------------
        // 受信件数カウントアップ
        var cnt = localStorage.getItem('notice_cnt');
        cnt = parseInt(cnt) + 1;
        localStorage.setItem('notice_cnt', cnt);

        // 表示更新
        var element = document.getElementById("tab");
        var $scope = angular.element(element).scope();
        $scope.badge = cnt;
        $scope.$apply();

        //-------------------
        // 確認ダイアログ表示
        //-------------------
//        navigator.notification.confirm(
//                event.alert, // メッセージ
//                function (btnindex) {
//                    if (btnindex === 1) { // 「確認する」が押された場合、「おしらせ」画面へ遷移
//                        // 遷移先を「おしらせ」にする
//                        tabbar.setActiveTab(0);
//
//                        // 「おしらせ」再描画
//                        var element = document.getElementById("info");
//                        if (element) {
//                            var $target_scope = angular.element(element).scope();
//                            $target_scope.$apply(function () {
//                                $target_scope.initial(true);
//                            });
//                        }
//                    }
//                }, // コールバック
//                '新しいお知らせ情報があります', // タイトル
//                '確認する,閉じる' // ボタン名
//                );
    }
    if (event.sound)
    {
        var snd = new Media(event.sound);
        snd.play();
    }
    if (event.badge)
    {
        pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
    }
}


// Onsen UIの初期化
ons.ready(function () {

    // タブ変更前イベント
    tabbar.on('prechange', function (event) {

        // 排他チェック
        if (eventExclusion === true) {
            console.log("タブ切換え 排他中");
            // タブ切換えをキャンセル
            event.cancel();
        }
    });

    // オフライン対応
    tabbar.on('postchange', function () {

        if (navigator.connection.type === 'none') {
            // クーポン描画未完成
            localStorage.setItem('viewCouponStatus', false);
            navigator.notification.alert(
                    '通信ができない環境の可能性があります。\n本アプリケーションはインターネットから最新の情報を取得しているため、通信可能な環境でご利用ください。', // メッセージ
                    function (et) {
                        console.log(et);
                    }, // コールバック
                    '接続エラー', // タイトル
                    'OK' // ボタン名
                    );
        }
    });
});

/*
 * スライディングメニュー関連処理
 *
 * @param {type} $scope
 * @returns null
 */
SlidingMenuCtrl = function ($scope, $timeout, MessageSV) {

    // IOSスタイルを指定
    if (ons.platform.isIOS()) {
        $scope.iosStyle = "{'padding-top': '" + (10 + (1000 / scale)) + "px'}";
        $scope.iosCenterStyle = "{'margin-top': '-10px'}";
        // ドロップシャドウの位置調整
        $('.onsen-sliding-menu__main').css({"-webkit-box-shadow": "-1px " + (2000 / scale) + "px 4px 1px #B3B3B3"});
        $('.onsen-sliding-menu__main').css({"box-shadow": "-1px " + (2000 / scale) + "px 4px 1px #B3B3B3"});
    } else {
        $scope.iosStyle = "{}";
        $scope.iosCenterStyle = "{}";
    }

    // アプリの使い方ページを開く
    $scope.toUseMethod = function () {
        // 排他チェック
        if (eventExclusion === true) {
            console.log("アプリの使い方表示 排他中");
            return;
        } else {
            eventExclusion = true;
            // クリックイベントの排他解除タイマーセット
            $timeout(function () {
                eventExclusion = false;
                console.log("アプリの使い方表示 排他解除");
            }, 500);
        }
        // ページ遷移
        myNavigator.pushPage('howto.html', {animation: 'fade'});
    };

    // アプリ設定ページを開く
    $scope.toSet = function () {
        // 排他チェック
        if (eventExclusion === true) {
            console.log("アプリ設定表示 排他中");
            return;
        } else {
            eventExclusion = true;
            // クリックイベントの排他解除タイマーセット
            $timeout(function () {
                eventExclusion = false;
                console.log("アプリ設定表示 排他解除");
            }, 500);
        }
        // ページ遷移
        myNavigator.pushPage('setting.html', {animation: 'fade'});
    };

    // スライディングメニューが開く前に、地図があれば、地図イベント禁止
    menu.on('preopen', function () {
        if (map !== undefined) {
            map.setClickable(false);
        }
        // iOSの場合の設定
        if (ons.platform.isIOS()) {
            // OSのステータスバー表示エリアの背景セット
            if (document.getElementById("menu-status") === null) {
                $('ons-page#menu').prepend('<div class="statusbar" id="menu-status" style="zoom:' + (10000 / scale) + '%"></div>');
            }
        }
    });

    // スライディングメニューが閉じる前に、地図があれば、地図イベントを復活
    menu.on('preclose', function () {
        if (map !== undefined) {
            map.setClickable(true);
        }
    });

    // 安楽亭ホームページへダイレクト
    $scope.direct = function () {

        // ネットワーク状態チェック
        if (navigator.connection.type === 'none') {
            // 接続エラー表示
            MessageSV.alert(0);
            return;
        }

        var options = {
            'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
            'title': '安楽亭ホームページ',
            'buttonLabels': ['ブラウザで開く'],
            'addCancelButtonWithLabel': 'キャンセル',
            'androidEnableCancelButton': true,
            'winphoneEnableCancelButton': true
        };

        window.plugins.actionsheet.show(options, function (buttonIndex) {

            // プログレスバーのオーナークリア
            owner = null;
            // プログレスバーがあれば、削除
            if (ons.platform.isIOS()) {
                window.Progress.hide();
            } else {
                window.plugins.ProgressView.hide();
            }

            // アクションシートがあれば、削除
            window.plugins.actionsheet.hide();

            if (buttonIndex === 1) {

                // ネットワーク状態チェック
                if (navigator.connection.type === 'none') {
                    // 接続エラー表示
                    MessageSV.alert(0);
                } else {
                    // 安楽亭ホームページを表示
                    cordova.InAppBrowser.open('https://k.anrakutei.jp/sp/', '_system', 'location=yes');
                }
            } else {
                window.plugins.actionsheet.hide();
            }

        });
    };

    // お客様の声メニューのコントロール
    $scope.toggleContact = function () {
        // 一個目以降を閉じる
        $('.menu-item-customer>div').toggleClass("active");
        $('.menu-item-customer>div').siblings("div").removeClass("active");
        $('.menu-item-customer>div').next("ul").slideToggle();
        $('.menu-item-customer>div').next("ul").siblings("ul").slideUp();

    };

    // お客様の声へダイレクト
    $scope.directContact = function (mode) {

        // ネットワーク状態チェック
        if (navigator.connection.type === 'none') {
            // 接続エラー表示
            MessageSV.alert(0);
            return;
        }

        var options = {
            'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
            'title': 'お客様の声',
            'buttonLabels': ['ブラウザで開く'],
            'addCancelButtonWithLabel': 'キャンセル',
            'androidEnableCancelButton': true,
            'winphoneEnableCancelButton': true
        };

        window.plugins.actionsheet.show(options, function (buttonIndex) {

            // プログレスバーのオーナークリア
            owner = null;
            // プログレスバーがあれば、削除
            if (ons.platform.isIOS()) {
                window.Progress.hide();
            } else {
                window.plugins.ProgressView.hide();
            }

            // アクションシートがあれば、削除
            window.plugins.actionsheet.hide();

            if (buttonIndex === 1) {

                // ネットワーク状態チェック
                if (navigator.connection.type === 'none') {
                    // 接続エラー表示
                    MessageSV.alert(0);
                } else {

                    if (mode === 1) {
                        // 店舗へのお問い合わせ
                        cordova.InAppBrowser.open('https://k.anrakutei.jp/sp/contact/index.html', '_system', 'location=yes');
                    } else {
                        // その他のお問い合わせ
                        cordova.InAppBrowser.open('https://k.anrakutei.jp/sp/contact/form_ot.html', '_system', 'location=yes');
                    }
                }
            } else {
                window.plugins.actionsheet.hide();
            }

        });
    };
};

/*
 * タブバー関連処理
 *
 * @param $scope
 * @returns null
 */
TabbarCtrl = function ($scope, $timeout, RootService) {

    // バッジの値セット
    $scope.setBadge = function () {
        var cnt = localStorage.getItem('notice_cnt');
        if (cnt === null) {
            cnt = 0;
        }
        $scope.badge = cnt;
    };

    $scope.setBadge();

    // 「おしらせ」タブクリック
    $scope.infoClick = function () {

        console.log("「おしらせ」クリック");

        // 処理中（プログレスバー表示中）はイベント破棄
        if (owner !== null) {
            console.log("「おしらせ」クリック：イベント破棄");
            return;
        }

        // 排他チェック
        if (eventExclusion === true) {
            console.log("タブタップ 排他中");
            return;
        } else {
            // 排他開始
            eventExclusion = true;
            console.log("排他開始（おしらせ）");
        }

        // 通知情報
        var cnt = localStorage.getItem('notice_cnt');
        // 読込みエラーフラグ
        var errflg = localStorage.getItem('infoLoadError');
        // 画像参照先
        var refer = localStorage.getItem('infoReference');

        // "通知情報あり" or "読込み失敗時" or "サーバー画像参照時" は、お知らせ情報の再読込みを行う。
        if (((cnt > 0) || (errflg === 'true') || (refer === 'server')) && (navigator.connection.type !== 'none')) {
            // 「おしらせ」再描画
            var element = document.getElementById("info");
            if (element) {
                var $target_scope = angular.element(element).scope();
                $target_scope.initial(true);
            } else {
                // 排他解除タイマーセット
                setEventExclusionTimer(300);
            }
        } else {
            // 排他解除タイマーセット
            setEventExclusionTimer(300);
        }

        // 操作ログ保存
        RootService.log(0, -1);
    };

    // 「店舗」タブクリック
    $scope.infoTenpo = function () {

        console.log("「店舗」クリック");

        // 処理中（プログレスバー表示中）はイベント破棄
        if (owner !== null) {
            console.log("「店舗」クリック：イベント破棄");
            return;
        }

        // 排他チェック
        if (eventExclusion === true) {
            console.log("タブタップ 排他中");
            return;
        } else {
            // 排他開始
            eventExclusion = true;
            console.log("排他開始（店舗）");
        }

        // 「店舗」再描画
        var element = document.getElementById("cmap");

        if (element) {

            var $target_scope = angular.element(element).scope();

            // 検索不可の場合、Googleフレームワークをダウンロードさせる
            if ($target_scope.readonly === true) {
                $target_scope.downloadGoogleFM();
                // 店舗データのダウンロードが完了していない場合、リロードさせる
            } else if ((($target_scope.checkDownloadStatus() === false) ||
                    (localStorage.getItem('serviceIconDownloadStatus') === 'false') ||
                    (localStorage.getItem('tenpoUpdateFlg') === 'true')) &&
                    (navigator.connection.type !== 'none')) {
                $target_scope.initial();
            } else {
                // 排他解除タイマーセット
                setEventExclusionTimer(300);
            }
        } else {
            // 排他解除タイマーセット
            setEventExclusionTimer(300);
        }

    };

    // 「お得なクーポン」タブクリック
    $scope.infoCoupon = function () {

        console.log("「お得なクーポン」クリック");

        // 処理中（プログレスバー表示中）はイベント破棄
        if (owner !== null) {
            console.log("「お得なクーポン」クリック：イベント破棄");
            return;
        }

        // 排他チェック
        if (eventExclusion === true) {
            console.log("タブタップ 排他中");
            return;
        } else {
            // 排他開始
            eventExclusion = true;
            console.log("排他開始（お得なクーポン）");
        }

        // 操作ログ保存
        RootService.log(2, -1);

        var element = document.getElementById("coupon");

        if (element) {
            var $target_scope = angular.element(element).scope();

            // クーポン画像のダウンロードに失敗した場合、かつネットワークが復活した場合、リロードさせる
            if ((($target_scope.checkDownloadStatus() === false) && (navigator.connection.type !== 'none')) ||
                    ((localStorage.getItem('viewCouponStatus') === 'false') && (navigator.connection.type !== 'none'))) {
                $target_scope.netStatus = true;
                $target_scope.initial(0);
            } else {
                // 排他解除タイマーセット
                setEventExclusionTimer(300);
            }
        } else {
            // 排他解除タイマーセット
            setEventExclusionTimer(300);
        }

    };

    // 「スペシャル」タブクリック
    $scope.infoWallpaper = function () {

        console.log("「スペシャル」クリック");

        // 処理中（プログレスバー表示中）はイベント破棄
        if (owner !== null) {
            console.log("「スペシャル」クリック：イベント破棄");
            return;
        }

        // 排他チェック
        if (eventExclusion === true) {
            console.log("タブタップ 排他中");
            return;
        } else {
            // 排他開始
            eventExclusion = true;
            console.log("排他開始（スペシャル）");
        }

        // 「スペシャル」再描画
        var element = document.getElementById("wallpaper");

        if (element) {

            var $target_scope = angular.element(element).scope();

            // 壁紙データのダウンロードが完了していない場合、または「ネットが復活し、壁紙がオフラインの表示である場合」リロードさせる
            if ((navigator.connection.type !== 'none') &&
                    (($target_scope.checkDownloadStatus() === false) ||
                            (localStorage.getItem('wallpaperMode') === 'offline') ||
                            (localStorage.getItem('wallpaperUpdateFlg') === 'true'))) {
                $target_scope.netStatus = true;
                if (localStorage.getItem('wallpaperUpdateFlg') === 'true') {
                    $target_scope.initial(1);
                } else {
                    $target_scope.initial(0);
                }
            } else {
                // 排他解除タイマーセット
                setEventExclusionTimer(300);
            }
        } else {
            // 排他を解除
            eventExclusion = false;
        }

    };

};

/*
 * Rootコントローラ
 * 
 * @param {type} $scope
 * @param {type} InfoService
 * @returns {undefined}
 */
RootCtrl = function ($scope, InfoService) {
    /*
     * バッジ更新（サーバに未読件数を問い合わせてバッジの値を更新する）
     */
    $scope.updateBadge = function () {

        // ローカルストレージから「おしらせ」の最終更新日付を取得
        var dt = localStorage.getItem('last_update');
        if (dt === null) {
            dt = "2015/01/01";
        }

        // サーバから未読件数取得
        InfoService.getNewNoticeCnt(dt, function (result) {
            var cnt = 0;
            if (result !== null) {
                cnt = result[0].cnt;
            }
            // タブバーのバッジに値セット
            var element = document.getElementById("tab");
            var $target_scope = angular.element(element).scope();
            $target_scope.badge = cnt;

            // ローカルストレージに値を保持
            localStorage.setItem('notice_cnt', cnt);
        });
    };

    // 起動時のバッジセット
    $scope.updateBadge();
};

app.controller('SlidingMenuCtrl', ['$scope', '$timeout', 'MessageSV', SlidingMenuCtrl]);
app.controller('TabbarCtrl', ['$scope', '$timeout', 'RootService', TabbarCtrl]);
app.controller('RootCtrl', ['$scope', 'InfoService', RootCtrl]);


// ログ集計サービス
app.factory('RootService', function () {

    var rootSV = {};

    //------------------
    // 操作ログ取得
    //------------------
    rootSV.log = function (op_type, info_id) {

        document.addEventListener("deviceready", function () {
            rootSV.type = (op_type === undefined) ? 3 : op_type;
            rootSV.id = (info_id === undefined) ? -1 : info_id;
            rootSV.device_id = device.uuid;

            // 現在のUNIX TIMESTAMPを取得する
            rootSV.ts = Math.floor($.now());

            // 位置情報取得
            navigator.geolocation.getCurrentPosition(
                    rootSV.onSuccess,
                    rootSV.onError,
                    rootSV.geoOption
                    );
        }, false);

    };

    // 現在地取得オプション
    rootSV.geoOption = {
        enableHighAccuracy: false,
        timeout: 500,
        maximumAge: 300000  // 保持期間：5分
    };

    // 現在地取得成功
    rootSV.onSuccess = function (position) {

        // 位置情報取得成功時に、ログデータの設定
        var device_id = rootSV.device_id;
        var op_type = rootSV.type;
        var op_date = rootSV.ts;
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        var info_id = rootSV.id;

        rootSV.insertLog(device_id, op_type, op_date, lat, lon, info_id);

    };

    // 現在地取得失敗
    rootSV.onError = function (error) {

        var errorMessage = {
            0: "原因不明のエラーが発生しました…。",
            1: "位置情報の取得が許可されませんでした…。",
            2: "電波状況などで位置情報が取得できませんでした…。",
            3: "位置情報の取得に時間がかかり過ぎてタイムアウトしました…。"
        };

        console.log('現在地情報取得失敗した。原因：' + errorMessage[error.code]);

        // 位置情報取得失敗時に、ログデータの設定
        var device_id = rootSV.device_id;
        var op_type = rootSV.type;
        var op_date = rootSV.ts;
        var lat = 0; //現在地が不明
        var lon = 0; //現在地が不明
        var info_id = rootSV.id;

        rootSV.insertLog(device_id, op_type, op_date, lat, lon, info_id);

    };

    // ログ挿入
    rootSV.insertLog = function (device_id, op_type, op_date, lat, lon, info_id) {

        var sql = 'insert into t_app_op_log(device_id, op_type, op_date, lat, lon, info_id) values (' +
                '?,?,?,?,?,?)';

        var values = [
            device_id,
            op_type,
            op_date,
            lat,
            lon,
            info_id];

        goiken.transaction(
                function (tx) {
                    tx.executeSql(sql,
                            values,
                            function () {

//                                console.log('Log テーブルにデータ挿入完了.');

                            },
                            function (error) {

                                console.log(error);
                                console.log('Log テーブルにデータ挿入エラー.');

                            }
                    );
                });
    };

    return rootSV;
});

// プログレスサービス
app.factory('ProgressSV', function () {

    var progressSV = {};

    //------------------
    // Show
    //------------------
    progressSV.show = function (tabIdx, title, tabbarHeight) {
        // オーナーチェック
        if ((owner === null) && (tabbar.getActiveTabIndex() === tabIdx)) {
            // オーナー登録
            owner = tabIdx;

            // プログレスバー表示
            if (ons.platform.isIOS()) {
                window.Progress.show(title, tabbarHeight);
            } else {
                window.plugins.ProgressView.show(title, "HORIZONTAL", "DEVICE_LIGHT");
            }
        } else {
            // 使用中
        }
    };

    //------------------
    // hide
    //------------------
    progressSV.hide = function (tabIdx) {
        // オーナーチェック
        if (owner === tabIdx) {
            // オーナーをクリア
            owner = null;

            // プログレスバー消去
            if (ons.platform.isIOS()) {
                window.Progress.hide();
            } else {
                window.plugins.ProgressView.hide();
            }
        }
    };

    //------------------
    // setTitle
    //------------------
    progressSV.setTitle = function (tabIdx, title) {
        // オーナーチェック
        if ((owner === tabIdx) && (tabbar.getActiveTabIndex() === tabIdx)) {
            // タイトル設定
            if (ons.platform.isIOS()) {
                window.Progress.setTitle(title);
            } else {
                window.plugins.ProgressView.setLabel(title);
            }
        }
    };

    //------------------
    // setProgress
    //------------------
    progressSV.setProgress = function (tabIdx, value) {
        // オーナーチェック
        if ((owner === tabIdx) && (tabbar.getActiveTabIndex() === tabIdx)) {
            // ステータス値セット
            if (ons.platform.isIOS()) {
                window.Progress.setProgress(value);
            } else {
                window.plugins.ProgressView.setProgress(value);
            }
        }
    };

    return progressSV;
});

// メッセージサービス
app.factory('MessageSV', function () {

    var messageSV = {};

    //-------------------
    // 警告メッセージ表示
    //-------------------
    messageSV.alert = function (type) {

        switch (type) {
            case 0:
                // 接続エラー
                navigator.notification.alert(
                        '通信ができない環境の可能性があります。\n本アプリケーションはインターネットから最新の情報を取得しているため、通信可能な環境でご利用ください。',
                        function (et) {
                            console.log(et);
                        },
                        '接続エラー',
                        'OK'
                        );
                break;
            default:
                // nop
                break;
        }
    };

    return messageSV;
});

// "ng-click"の代替ディレクティブ
app.directive('singleClick', function () {

    return function (scope, element, attrs) {

        element.bind('click', function (event) {

            event.preventDefault();
            event.stopPropagation();

            scope.$apply(attrs['singleClick']);
        });
    };
});