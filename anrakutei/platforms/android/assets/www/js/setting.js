/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * 「アプリ設定」ページのコントローラ
 * 
 * @param {type} $scope
 * @returns {undefined}
 */
settingCtrl = function ($scope, $timeout, InfoService) {

    // IOSスタイルを指定
    if (ons.platform.isIOS()) {
        $scope.iosStyle = "{'padding-top': '" + (10 + (1000 / scale)) + "px'}";
        $scope.iosRightStyle = "{'padding': '0px'}";
        $scope.iosCenterStyle = "{'margin-top': '-10px'}";
        $timeout(function () {
            // OSのステータスバー表示エリアの背景セット
            $('ons-page#setting').prepend('<div class="statusbar2" id="setting-status" style="zoom:' + (10000 / scale) + '%"></div>');
        }, 200);
    } else {
        $scope.iosStyle = "{}";
        $scope.iosRightStyle = "{}";
        $scope.iosCenterStyle = "{}";
    }

    // バージョンを表示
    cordova.getAppVersion.getVersionNumber(function (version) {
        $scope.version = version;
        $scope.$apply();
    });

    // 通知設定読込み
    var push = localStorage.getItem('push_permission');
    if (push === null) {
        // 情報が無い場合、トークンの登録が出来ていないので、OFF設定にする
        push = 0;
        localStorage.setItem('push_permission', push);
    }

    // 注意書きメッセージ
    $scope.msg = "";
    if (device.platform === 'Android') {
        // Android用
        $scope.msg = "※通知を許可する場合、端末での通知設定がON（「通知を表示」が有効）になっている必要があります。";
    } else {
        // iOS用
        $scope.msg = "※通知を許可する場合、端末での通知設定が有効になっている必要があります。";
    }

    // 端末設定へのダイレクトジャンプの表示／非表示設定
    $scope.direct = true;
    if (ons.platform.isIOS()) {
        // iOS8 未満は、アプリから直接端末設定を呼び出せない。
        var devVer = device.version.split(".");
        if (Number(devVer[0]) < 8) {
            $scope.direct = false;
            $scope.msg += "\n※端末の通知設定は、「設定」->「通知センター」->「安楽亭」から確認することが出来ます。";
        }
    }

    // 「×」ボタン押下処理
    $scope.pageClose = function () {
        // イベントリスナー解除
        document.removeEventListener('ons-switch:init', $scope.swInit, false);

        // ページを閉じる
        myNavigator.popPage("setting.html");
    };

    // 通知設定変更
    $scope.chgPushSetting = function (chk) {

        var setting = 0;

        // サーバ用設定値に変換
        (chk === true) ? setting = 1 : setting = 0;   // 0:無効、1:有効

        // 変更が無い場合は、処理終了
        var preSetting = localStorage.getItem('push_permission');
//        console.log("setting:" + setting);
//        console.log("preSetting:" + preSetting);
        if (parseInt(preSetting) === setting) {
            // 変更なし
            return;
        }

        // レジストレーションID
        var token = localStorage.getItem('token');
        if ((token === null) || (token === "")) {
            // レジストレーションIDが無い場合は、エラー表示で終了。

            // 表示はOFFにセット
            $scope.pushSwitch.setChecked(false);

            // エラーメッセージ表示
            navigator.notification.alert(
                    '通知に必要な情報が登録できていないため、通知を受け取ることが出来ません。\nアプリを再起動した後、もう一度お試しください。', // メッセージ
                    function (et) {
                        console.log(et);
                    }, // コールバック
                    '通知設定エラー', // タイトル
                    'OK' // ボタン名
                    );

            return;
        }

        // 送信パラメータセット
        var param = {
            regID: token,
            setting: setting,
            os: device.platform
        };

        // 設定切換え
        InfoService.chgPushSetting(param, function (result) {

            // 変更前の設定情報を保持
            var preSetting = localStorage.getItem('push_permission');
            var newSetting = 0;

            if (result === "OK") {
                // 前回の設定値の反対の値をセット
                (parseInt(preSetting) === 0) ? newSetting = 1 : newSetting = 0; // 0:無効、1:有効
                // 許可設定を保持
                localStorage.setItem('push_permission', newSetting);
            } else {
                // サーバの設定処理に失敗した場合は、元の状態に戻す。
                (parseInt(preSetting) === 1) ? $scope.pushSwitch.setChecked(true) : $scope.pushSwitch.setChecked(false);

                // エラーメッセージ表示
                navigator.notification.alert(
                        '通知設定の変更に失敗しました。\n通信ができない環境の可能性がありますので、通信環境の良い場所でお使いください。', // メッセージ
                        function (et) {
                            console.log(et);
                        }, // コールバック
                        '通知設定エラー', // タイトル
                        'OK' // ボタン名
                        );
            }
        });
    };

    // 端末の設定画面呼び出し
    $scope.openSetting = function () {
        if (device.platform === 'Android') {
            // Android用
            if (typeof cordova.plugins.settings.openSetting != undefined) {
                cordova.plugins.settings.openSetting("application_details", function () {
//                    console.log("opened application_details");
                }, function () {
                    console.log("failed to open application_details");
                }, 0);
            }
        } else {
            // iOS用
            cordova.plugins.settings.open(function () {
//                console.log("opened settings");
            }, function () {
                console.log("failed to open settings");
            });
        }
    };

    // 初期処理
    $scope.swInit = function (e) {
        $scope.pushSwitch = e.component;

        // 初期状態セット
        (parseInt(push) === 1) ? $scope.pushSwitch.setChecked(true) : $scope.pushSwitch.setChecked(false);

        var evCnt = 0;
        // スイッチ状態の監視
        $scope.pushSwitch.on('change', function (event) {

            // Android 4.2以下は、イベントが多重発生するので制御する。
            var devVer = device.version;
            if (devVer.match(/^4.[0-2].*/)) {
                // 多重イベント制御
                if (evCnt !== 0) {
                    evCnt = 0;
                    return;
                }
                evCnt++;
            }

            // 通知設定変更
            $scope.chgPushSetting(event.value);
        });
    };

    // OnsenUIの準備完了
    ons.ready(function () {
        // スイッチの初期化処理
        document.addEventListener('ons-switch:init', $scope.swInit, false);
    });

    // デバイスのバックボタン押下イベント
    $scope.onDeviceBackButton = function ($event) {
        if ($event.callParentHandler) {
            // ページを閉じる
            $scope.pageClose();
        }
    };
};

app.controller('settingCtrl', ['$scope', '$timeout', 'InfoService', settingCtrl]);
