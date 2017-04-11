/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// サービス
app.factory('InfoService', ['$http', function ($http) {
        var infoSV = {};

        // おしらせ情報取得
        infoSV.getInfo = function (callback) {
            $http.get(serverUrl + 'sp2/get_info_json.php', {timeout: 60000})
                    .success(function (data) {
                        callback(data);
                    })
                    .error(function () {
                        // ネットワーク異常の場合は、フラグリセット
                        localStorage.setItem("last_ref_date", "20150101");
                        // デフォルト画面表示
                        callback(-1);
                    });
        };

        // 最終更新日取得
        infoSV.getLastUpdate = function (callback) {
            $http.get(serverUrl + 'sp2/get_last_update.php', {timeout: 60000})
                    .success(function (data) {
                        callback(data);
                    })
                    .error(function () {
                        // ネットワーク異常の場合は、フラグリセット
                        localStorage.setItem("last_ref_date", "20150101");
                        // 既存情報を表示
                        callback(-1);
                    });
        };

        // 未読件数取得
        infoSV.getNewNoticeCnt = function (dt, callback) {
            var url = serverUrl + 'sp2/get_new_info_cnt.php?dt=' + dt;
            $http.get(url, {timeout: 60000})
                    .success(function (data) {
                        callback(data);
                    })
                    .error(function () {
                        callback(null);
                    });
        };

        // 通知設定変更（setting 0:OFF、1:ON）
        infoSV.chgPushSetting = function (data, callback) {
            var url = serverUrl + 'sp2/chg_push_setting_v2.php';
            $http.post(url, $.param(data),
                    {
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                        timeout: 60000
                    })
                    .success(function (data) {
                        callback(data);
                    })
                    .error(function () {
                        callback("NG");
                    });
        };

        // おしらせアイコン情報取得
        infoSV.getInfoIcon = function (callback) {
            $http.get(serverUrl + 'sp2/get_info_icon.php', {timeout: 60000})
                    .success(function (data) {
                        callback(data);
                    })
                    .error(function () {
                        callback(null);
                    });
        };

        // おしらせアイコン情報の最終更新日取得
        infoSV.getLastUpdateIcon = function (callback) {
            $http.get(serverUrl + 'sp2/get_last_update_icon.php', {timeout: 60000})
                    .success(function (data) {
                        callback(data);
                    })
                    .error(function () {
                        callback(-1);
                    });
        };

        return infoSV;
    }]);

////////////////////////////////////////////////////////////////////////////////

// コントローラー
InfoCtrl = function ($scope, $timeout, $location, $anchorScroll, InfoService, RootService, ProgressSV, MessageSV) {

    // タブバーの高さを設定
    tabbarHeight = $('ons-tab').height() * (scale / 100);

    // IOSスタイルを指定
    if (ons.platform.isIOS()) {
        $scope.iosStyle = "{'padding-top': '" + (10 + (1000 / scale)) + "px'}";
        $scope.iosLeftStyle = "{'padding': '0px'}";
        $scope.iosCenterStyle = "{'margin-top': '-10px'}";
    } else {
        $scope.iosStyle = "{}";
        $scope.iosLeftStyle = "{}";
        $scope.iosCenterStyle = "{}";
    }

    // 画像ダウンロードタイマー
    $scope.InfoTimer = null;
    // 画像ダウンロード関連変数初期化
    var countAlert = 0;

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

    // デバイス準備イベント
    document.addEventListener("deviceready", function () {
        /*
         * ファイルパス取得
         * 
         * PERSISTENT：Androidの場合、アプリケーション管理外のディレクトリが指定されてしまうので、使わない。
         *             ※アプリケーションを削除した際に、一緒にクリアされないため。
         * TEMPORARY ：Android/iOSともに、永続性のないストレージが指定されるので、ひとつ上の階層にフォルダ指定すること。
         *             例）rootDir + "../info/"
         */
        var type = LocalFileSystem.PERSISTENT;
        if (device.platform === 'Android') {
            // ディレクトリ種別
            type = LocalFileSystem.TEMPORARY;
            // おしらせ画像の保存先
            infoPath = '../info/';
            iconPath = '../icon/';
        }
//        requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {  // for iOS
//        requestFileSystem(LocalFileSystem.TEMPORARY, 0, function (fileSystem) {   // for Android
        requestFileSystem(type, 0, function (fileSystem) {
            // ルートのパスを格納
            rootDir = fileSystem.root.toURL();
//            console.log('rootDir：' + rootDir);
            // ルートのオブジェクトを格納（フォルダ削除に使用する）
            rootObj = fileSystem.root;

            // ページ更新処理
            if (pushBoot) {
                // Push通知からの起動の場合
                $scope.initial(true);
                pushBoot = false;
            } else {
                // 通常起動の場合
                $scope.initial(false);
            }

        }, function (e) {
            console.log('ファイルアクセスエラー：' + e);
        });
    }, false);

    /*
     * 「おしらせ」本文中のリンクをクリックした場合の動作
     * ※iOSの場合、WebView内にリンク先を表示してしまうため。
     */
    $(document).on('click', 'a[target="_blank"]', function (ev) {
        var url;

        ev.preventDefault();
        url = $(this).attr('href');
        window.open(url, '_system');
    });

    // 通知バーからの起動フラグ
    $scope.pushBootFlg = false;

    /*
     * ページ更新処理
     * @param {type} flg : 通知バー起動フラグ
     * @returns なし
     */
    $scope.initial = function (flg) {

        console.log("初期化処理開始（おしらせ）");

        // ダミー情報表示
        $scope.setDummy();

        // 通知バーからの起動フラグをクラス変数に格納
        $scope.pushBootFlg = flg;

        // エラーフラグ解除
        localStorage.setItem("infoLoadError", "false");

        // アイコン画像の更新処理実行
        $scope.updateInfoIcon();
    };

    /*
     * ページ更新処理（実処理）
     * @param {type} flg : 通知バー起動フラグ
     * @returns なし
     */
    $scope.initial2 = function (flg) {
        // 日付情報取得
        var now = new Date();
        var year = now.getFullYear();   // 年
        var month = now.getMonth() + 1; // 月
        var day = now.getDate();        // 日
        if (year < 2000) {
            year += 1900;
        }
        // 数値が1桁の場合、頭に0を付けて2桁で表示する指定
        if (month < 10) {
            month = "0" + month;
        }
        if (day < 10) {
            day = "0" + day;
        }

        // クラス変数に日付情報をセット（文字列として格納）
        $scope.year = '' + year;
        $scope.month = '' + month;
        $scope.day = '' + day;
        // 本文の折りたたみ制御用
        $scope.isDetail = new Array();
        // ファイルパス
        $scope.infoLocalDir = rootDir + infoPath;  // おしらせ画面の画像保存先（ローカル）
        $scope.infoSrvlDir = serverUrl + "sp2/img/"; // おしらせ画面の画像保存先（サーバー）

        // 描画処理開始
        var init_flg = localStorage.getItem('infoIniFlg');
        var today = $scope.year + $scope.month + $scope.day;
        var last_ref_date = localStorage.getItem('last_ref_date');
        var cnt = localStorage.getItem('notice_cnt');

        // バッジのクリア処理
        localStorage.setItem('notice_cnt', 0);
        // タブバーのバッジ表示更新
        var element = document.getElementById("tab");
        var $target_scope = angular.element(element).scope();
        $target_scope.badge = 0;

        // お知らせ情報テーブルのバージョンチェック
        var infoTbVer = localStorage.getItem('infoTableVer');

        // プログレスバー表示フラグ
        var progress_show = true;

        // 起動状態判定
        if (init_flg === 'false') {
            // 更新の有無チェック
            if ((infoTbVer === null) || (Number(infoTbVer) < 1)) {
                console.log('テーブル更新が必要な起動');
                // テーブル再作成
                $scope.dropTb();
            } else if ((today > last_ref_date) || (cnt > 0) || (flg)) {
                console.log('本日初回起動 もしくは、通知あり もしくは、通知バーからの起動');
                // 更新情報があれば、更新してデータ表示
                $scope.chkUpdate(bootProcess);
                // プログレスバーを表示しない
                progress_show = false;
            } else {
                console.log('本日２回目以降の起動');
                // 情報表示（※現在の情報で一旦表示し、裏で更新を行う）
                $scope.setInfo($scope.infoLocalDir, 0);
                // プログレスバーを表示しない
                progress_show = false;
            }
        } else {
            console.log('初期起動');
            // お知らせ情報格納用DB作成
            $scope.makeDb();
        }

        // 起動処理中判定
        if (bootProcess === false) {
            // プログレスバー表示
            if (progress_show === true) {
                document.addEventListener("deviceready", function () {
                    ProgressSV.show(0, "おしらせ情報を読み込んでいます", tabbarHeight);
                }, false);
            }
        } else {
            // プログレスバー表示
            if (progress_show === true) {
                // プログレスバーのタイトル変更
                ProgressSV.setTitle(0, "おしらせ情報を読み込んでいます");
            }
        }
        // 起動処理中フラグをリセット
        bootProcess = false;

        // タブタップ可能
        $timeout(function () {
            eventExclusion = false;
            console.log("イベント 排他解除");
        }, 500);
    };

    /*
     * テーブル削除
     * 
     * @returns {undefined}
     */
    $scope.dropTb = function () {

        // データベースが開いていなければ、開く
        if (goiken === null) {
            goiken = openDatabase('goiken', '0.1', '店舗情報', 2 * 1024 * 1024);
        }

        var sql = "DROP TABLE m_info";
        goiken.transaction(
                function (tx) {
                    tx.executeSql(sql, [],
                            function () {
                                console.log('[OK]m_info テーブル削除成功');
                                // お知らせ情報格納用DB作成
                                $scope.makeDb();
                            },
                            function () {
                                console.log('[ERROR]m_info テーブル削除失敗');
                                // 読込みエラーフラグセット
                                localStorage.setItem("infoLoadError", "true");
                                // プログレスバー消去
                                ProgressSV.hide(0);
                            }
                    );
                },
                function (ex) {
                    console.log('[ERROR]m_info トランザクションエラー');
                    // 読込みエラーフラグセット
                    localStorage.setItem("infoLoadError", "true");
                    // プログレスバー消去
                    ProgressSV.hide(0);
                }
        );
    };

    /*
     * テーブル生成
     * 
     * @returns {undefined}
     */
    $scope.makeDb = function () {
        // データベース作成
        if (window.openDatabase) {

            if (goiken === null) {
                goiken = openDatabase('goiken', '0.1', '店舗情報', 2 * 1024 * 1024);
            }

            var createInfoSQL = "CREATE TABLE IF NOT EXISTS m_info(" +
                    "id integer NOT NULL unique," +
                    "new_flg integer," +
                    "update_date date," +
                    "info_type integer," +
                    "post_start date," +
                    "post_end date," +
                    "disp_type integer," +
                    "comment_title text," +
                    "short_comment text," +
                    "comment_body text," +
                    "image text," +
                    "coupon_link integer," +
                    "coupon_link_title text," +
                    "img_link integer," +
                    "img_link_url text)";

            goiken.transaction(
                    function (tx) {
                        tx.executeSql(createInfoSQL, [],
                                function () {
                                    console.log('m_info テーブル作成成功');
                                    // 初期起動完了とする
                                    localStorage.setItem("infoIniFlg", "false");
                                    // テーブルバージョンセット（※テーブルを変更したら、ここのバージョンを上げる）
                                    localStorage.setItem('infoTableVer', 1);
                                    // おしらせ情報をサーバーから取得して、テーブルに格納
                                    $scope.getInfo();
                                },
                                function () {
                                    console.log('[ERROR]m_info テーブル作成失敗');
                                    // 読込みエラーフラグセット
                                    localStorage.setItem("infoLoadError", "true");
                                    // プログレスバー消去
                                    ProgressSV.hide(0);
                                }
                        );
                    }
            );
        } else {
            console.log('[ERROR]m_info DB接続エラー');
            // 読込みエラーフラグセット
            localStorage.setItem("infoLoadError", "true");
            // プログレスバー消去
            ProgressSV.hide(0);
        }
    };

    /*
     * 更新チェック処理
     * サーバDBから最終更新日付を取得し、更新情報がないかチェック
     * 
     * @param {type} bootFlg ： 起動処理フラグ（true:起動処理あり、false:起動処理なし）
     * @returns {undefined}
     */
    $scope.chkUpdate = function (bootFlg) {
        InfoService.getLastUpdate(function (data) {

            if (data === -1) {
                console.log('ネットワーク接続エラー：getLastUpdate');

                // 読込みエラーフラグセット
                localStorage.setItem("infoLoadError", "true");
                // 再取得のため、フラグリセット
                localStorage.setItem("last_ref_date", "20150101");
                localStorage.setItem("last_update", "2015/01/01 00:00:00");

                if (tabbar.getActiveTabIndex() === 0) {
                    // ネットワーク状態（オンライン）チェック
                    if (navigator.connection.type !== 'none') {
                        // エラーメッセージ表示
                        navigator.notification.alert(
                                '情報の取得に失敗しました。\n通信環境の良い場所で、ご利用ください。', // メッセージ
                                function (et) {
                                    console.log(et);
                                    // プログレスバー消去
                                    ProgressSV.hide(0);
                                }, // コールバック
                                '情報取得エラー', // タイトル
                                'OK' // ボタン名
                                );
                    } else {
                        // プログレスバー消去
                        ProgressSV.hide(0);
                    }
                    // 情報表示（既存情報を表示）
                    $scope.setInfo($scope.infoLocalDir, 0);
                }
                return;
            }

            var server_dt = 0;
            if (data[0].last_update !== null) {
                server_dt = new Date((data[0].last_update).replace(/-/g, '/'));
            }

            var local_dt = 0;
            if (localStorage.getItem('last_update') !== null) {
                local_dt = new Date((localStorage.getItem('last_update')).replace(/-/g, '/'));
            }

            console.log('最終更新日付（サーバー）：' + server_dt);
            console.log('最終更新日付（ローカル）：' + local_dt);

            // サーバの最終更新日付がローカルのものより新しい場合、更新データあり
            if (server_dt > local_dt) {
                // プログレスバー表示
                if (bootFlg === true) {
                    ProgressSV.setTitle(0, "おしらせ情報を更新しています");
                } else {
                    ProgressSV.show(0, "おしらせ情報を更新しています", tabbarHeight);
                }
                // データ更新して表示
                $scope.removeInfoDir();
            } else {
                // 情報表示（既存情報を表示）
                $scope.setInfo($scope.infoLocalDir, 0);
                // 最終参照日付を更新
                var today = $scope.year + $scope.month + $scope.day;
                localStorage.setItem("last_ref_date", today);
            }
        });
    };

    /*
     * ダウンロードエラー処理
     * 
     * @param {type} fileTransfer
     * @returns {undefined}
     */
    $scope.downloadError = function (fileTransfer) {

        // ダウンロード処理強制終了
        fileTransfer.abort();

        // 読込みエラーフラグセット
        localStorage.setItem("infoLoadError", "true");
        // 再取得のため、フラグリセット
        localStorage.setItem("last_ref_date", "20150101");
        localStorage.setItem("last_update", "2015/01/01 00:00:00");

        // ネットワーク状態（オンライン）チェック
        if ((navigator.connection.type !== 'none') && (countAlert === 0)) {

            if (tabbar.getActiveTabIndex() === 0) {
                // エラーメッセージ表示
                navigator.notification.alert(
                        '情報の取得に失敗しました。\n通信環境の良い場所で、ご利用ください。', // メッセージ
                        function (et) {
                            console.log(et);
                            // プログレスバー消去
                            ProgressSV.hide(0);
                        }, // コールバック
                        '情報取得エラー', // タイトル
                        'OK' // ボタン名
                        );
            }

            countAlert = 1;

        } else if ((navigator.connection.type === 'none') && (countAlert === 0)) {

            // プログレスバー消去
            ProgressSV.hide(0);

            countAlert = 1;

        }
    };

    /*
     * お知らせ画像ダウンロード
     * 
     * @param {type} imgArray
     * @param {type} last_update_dt
     * @param {type} dtNum
     * @returns {undefined}
     */
    $scope.downloadInfoImg = function (imgArray, last_update_dt, dtNum) {

        // プログレスバーのタイトル変更
        ProgressSV.setTitle(0, "おしらせ画像を読み込んでいます");

        // ファイル転送オブジェクト（画像ダウンロード処理用）
        var fileTransfer = new FileTransfer();

        // ダウンロード画像数
        var imgNum = imgArray.length;
        localStorage.setItem('downloadInfoImgNum', 0);

        // 画像ダウンロード関連変数リセット
        countAlert = 0;

        // ダウンロードタイマーセット
        if ($scope.InfoTimer !== null) {
            // ダウンロードタイマー解除
            $timeout.cancel($scope.InfoTimer);
            $scope.InfoTimer = null;
        }
        $scope.InfoTimer = $timeout(function () {
            console.log("ダウンロードタイムアウト（お知らせ画像）");

            // ダウンロードエラー処理
            $scope.downloadError(fileTransfer);

        }, 60000);  // タイムアウト：１分

        for (var i = 0; i < imgNum; i++) {

            // ダウンロードに失敗した場合は、処理を抜ける。
            if (countAlert === 1) {
                return;
            }

            // ダウンロードするURL
            var url = encodeURI($scope.infoSrvlDir + imgArray[i]);
            // 保存するパス
            var filePath = $scope.infoLocalDir + imgArray[i];

//            console.log("ダウンロード開始：" + i + "/" + imgNum);

            fileTransfer.download(url, filePath,
                    function () {

                        var downloadNum = localStorage.getItem('downloadInfoImgNum');
                        downloadNum++;
                        localStorage.setItem('downloadInfoImgNum', downloadNum);

//                        console.log("ダウンロード完了：" + downloadNum + "/" + imgNum);

                        // プロセスバーセット
                        ProgressSV.setProgress(0, downloadNum / (imgNum + dtNum));

                        // ダウンロードが全て完了したら表示を行う。
                        if (Number(imgNum) === Number(downloadNum)) {
                            console.log("お知らせ画像：ダウンロード完了");

                            // ダウンロードタイマー解除
                            $timeout.cancel($scope.InfoTimer);
                            $scope.InfoTimer = null;

                            $scope.$apply(function () {
                                // お知らせ情報セット
                                $scope.setInfo($scope.infoLocalDir, Number(downloadNum));
                            });

                            // 最終参照日付を保持
                            var today = $scope.year + $scope.month + $scope.day;
                            localStorage.setItem("last_ref_date", today);
                            // 最終更新日時を保持
                            localStorage.setItem('last_update', last_update_dt);
                        }
                    },
                    function (error) {
                        console.log('ダウンロードエラー ' + error.code);

                        // ダウンロードタイマー解除
                        $timeout.cancel($scope.InfoTimer);
                        $scope.InfoTimer = null;

                        // ダウンロードエラー処理
                        $scope.downloadError(fileTransfer);
                    });
        }
    };

    /*
     * お知らせ情報取得処理
     * サーバーＤＢから取得したデータを新規作成したWebDBに格納する
     * 
     * @returns {undefined}
     */
    $scope.getInfo = function () {

        InfoService.getInfo(function (data) {

            if (data === -1) {
                console.log('ネットワーク接続エラー：getInfo');

                // 読込みエラーフラグセット
                localStorage.setItem("infoLoadError", "true");
                // 再取得のため、フラグリセット
                localStorage.setItem("last_ref_date", "20150101");
                localStorage.setItem("last_update", "2015/01/01 00:00:00");

                if (tabbar.getActiveTabIndex() === 0) {
                    // ネットワーク状態（オンライン）チェック
                    if (navigator.connection.type !== 'none') {
                        // エラーメッセージ表示
                        navigator.notification.alert(
                                '情報の取得に失敗しました。\n通信環境の良い場所で、ご利用ください。', // メッセージ
                                function (et) {
                                    console.log(et);
                                    // プログレスバー消去
                                    ProgressSV.hide(0);
                                }, // コールバック
                                '情報取得エラー', // タイトル
                                'OK' // ボタン名
                                );
                    } else {
                        // プログレスバー消去
                        ProgressSV.hide(0);
                    }
                }
                return;
            }

            if (data === null) {
                console.log('おしらせ情報がありません');
                // プログレスバー消去
                ProgressSV.hide(0);
                return;
            }

            // データ件数取得
            var dataNum = data.length;

            // ダウンロード画像の配列
            var imgArray = new Array();

            // ローカルストレージから最終更新日時を取得
            var last_update_ts;
            var last_update_ts_org;
            var last_update_dt = localStorage.getItem('last_update');
            if (last_update_dt === null) {
                last_update_ts = new Date("2015/01/01 00:00:00");
            } else {
                last_update_ts = new Date(last_update_dt.replace(/-/g, '/'));
            }
            // 比較用に処理前の情報を退避
            last_update_ts_org = last_update_ts;

            // お知らせ画像の格納先フォルダ（rootDirの取得タイミングの関係で、ここでも再セット）
            $scope.infoLocalDir = rootDir + infoPath;

            // WebSQLに取得データを格納
            Object.keys(data).forEach(function (key) {

                // 新規取得データ判定
                var update_ts = new Date((data[key].update_date).replace(/-/g, '/'));
                var new_flg = 0;
                if (update_ts > last_update_ts_org) {
                    new_flg = 1;
                }

                var sql = 'insert into m_info(id, new_flg, update_date, info_type, post_start, post_end, disp_type, comment_title, short_comment, comment_body, image, coupon_link, coupon_link_title, img_link, img_link_url) values (' +
                        '?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
                var values = [
                    data[key].id,
                    new_flg,
                    data[key].update_date,
                    data[key].info_type,
                    data[key].post_start,
                    data[key].post_end,
                    data[key].disp_type,
                    data[key].comment_title,
                    data[key].short_comment,
                    data[key].comment_body,
                    data[key].image,
                    data[key].coupon_link,
                    data[key].coupon_link_title,
                    data[key].img_link,
                    data[key].img_link_url
                ];
                goiken.transaction(function (tx) {
                    tx.executeSql(sql, values,
                            function () {
                                // 最終更新日時を更新
                                if (update_ts > last_update_ts) {
                                    last_update_ts = update_ts;             // 比較用データ
                                    last_update_dt = data[key].update_date; // 保存用のデータ
                                }

                                // お知らせ画像の有無チェック
                                if (data[key].image !== "") {
//                                    console.log("image:" + data[key].image);
                                    // ダウンロード対象として配列に格納
                                    imgArray.push(data[key].image);
                                }

                                // 挿入完了判定
                                dataNum--;
                                if (dataNum === 0) {
//                                    console.log(imgArray);
                                    if (imgArray.length > 0) {

                                        // 画像ダウンロード
                                        $scope.downloadInfoImg(imgArray, last_update_dt, data.length);

                                    } else {

                                        // お知らせ情報セット
                                        $scope.setInfo($scope.infoLocalDir, 0);

                                        // 最終参照日付を保持
                                        var today = $scope.year + $scope.month + $scope.day;
                                        localStorage.setItem("last_ref_date", today);
                                        // 最終更新日時を保持
                                        localStorage.setItem('last_update', last_update_dt);
                                    }
                                }
                            },
                            function () {
                                console.log('[ERROR]m_info データ挿入に失敗しました');
                                // 読込みエラーフラグセット
                                localStorage.setItem("infoLoadError", "true");
                                // 再取得のため、フラグリセット
                                localStorage.setItem("last_ref_date", "20150101");
                                localStorage.setItem("last_update", "2015/01/01 00:00:00");
                                // プログレスバー消去
                                ProgressSV.hide(0);
                            }
                    );
                });
            });
        });
    };

    /*
     * お知らせ情報セット
     * ローカルストレージ（WebSQL）からデータ取得
     * 
     * @param {type} infoDir
     * @param {type} dlNum
     * @returns {undefined}
     */
    $scope.setInfo = function (infoDir, dlNum) {

        // プログレスバーのタイトル変更
        ProgressSV.setTitle(0, "おしらせ情報を読み込んでいます");

        //----------------------------------------------------------------
        // 端末のディレクトリ情報が取れていない場合は、サーバの情報を参照する
        //----------------------------------------------------------------
        // おしらせ画像の参照先
        if (infoDir === "null" + infoPath) {
            infoDir = $scope.infoSrvlDir;
        }
        // アイコン画像の参照先
        var iconDir = rootDir + iconPath;
        if (rootDir === null) {
            iconDir = serverUrl + "sp2/icon/";
        }
        console.log("画像参照先：" + infoDir);
        console.log("アイコン参照先：" + iconDir);

        // お知らせ画像の参照先情報を保持
        if (infoDir === $scope.infoSrvlDir) {
            localStorage.setItem("infoReference", "server");
        } else {
            localStorage.setItem("infoReference", "local");
        }

        var today = $scope.year + "-" + $scope.month + "-" + $scope.day;
        var sql = "SELECT * FROM m_info" +
                " WHERE post_start <= '" + today + "'" +
                "   AND post_end >= '" + today + "'" +
                " ORDER BY post_start DESC, id DESC";
        if (goiken === null) {
            goiken = openDatabase('goiken', '0.1', '店舗情報', 2 * 1024 * 1024);
        }

        goiken.transaction(
                function (tx) {
                    tx.executeSql(sql, [],
                            function (tx, rs) {
                                var result = rs.rows;
                                var data = new Array();
                                var len = result.length;

                                for (var i = 0; i < len; i++) {

                                    // 表示アイコンセット
                                    var icon = null;
                                    if (result.item(i).info_type in infoIcon) {
                                        icon = infoIcon[result.item(i).info_type];
                                        if ((result.item(i).info_type === 2) && (result.item(i).new_flg)) {
                                            // 情報種別が「フェア」で、新規情報の場合は、"NEW"を表示
                                            icon = infoIcon[0];
                                        }
                                    }
                                    if (icon == null) { // あえて"=="で比較
                                        // 未定義の場合は、リソースファイルの"NEW"アイコンを使用
                                        iconDir = "img/info/";
                                        icon = "info_icon_new_96x32.png";
                                    }

                                    //******************************************
                                    // 画像存在チェック
//                                    if (result.item(i).image !== ""){
//                                        var url = infoDir + result.item(i).image;
//                                        console.log('Loading: ' + url);
//
//                                        var img = new Image();
//                                        img.onload = function () {
//                                            console.log('Loading success');
//                                        }
//                                        img.onerror = function () {
//                                            console.log('Loading failure');
//                                            // 読込みエラーフラグセット
//                                            localStorage.setItem("infoLoadError", "true");
//                                            // 再取得のため、フラグリセット
//                                            localStorage.setItem("last_ref_date", "20150101");
//                                            localStorage.setItem("last_update", "2015/01/01 00:00:00");
//                                        }
//                                        img.src = url;
//                                    }
                                    //******************************************

                                    // 表示データセット
                                    var info = {
                                        index: i,
                                        id: result.item(i).id,
                                        isNew: result.item(i).new_flg,
                                        info_type: result.item(i).info_type,
                                        icon: iconDir + icon,
                                        disp_date: result.item(i).post_start,
                                        disp_type: result.item(i).disp_type,
                                        img: infoDir + result.item(i).image,
                                        link_url: result.item(i).img_link_url,
                                        title: result.item(i).comment_title,
                                        comment: result.item(i).short_comment,
                                        detail: result.item(i).comment_body,
                                        link_flg: result.item(i).coupon_link,
                                        link_title: result.item(i).coupon_link_title,
                                        continue_title: "つづきを見る"
                                    };
                                    data.push(info);
                                    // 折りたたみ表示制御用のフラグセット
                                    $scope.isDetail[i] = true;

//                                    console.log("お知らせ件数：" + (i + 1) + "/" + len);

                                    // プロセスバーセット
                                    ProgressSV.setProgress(0, (i + 1 + dlNum) / (len + dlNum));
                                }

                                if (len > 0) {
                                    // Viewにデータをバインド
                                    $scope.feeds = data;
                                    $scope.$apply();

                                    // iOSの場合の設定
                                    if (ons.platform.isIOS()) {
                                        // OSのステータスバー表示エリアの背景セット
                                        if (document.getElementById("info-status") === null) {
                                            $('ons-page#info').prepend('<div class="statusbar" id="info-status" style="zoom:' + (10000 / scale) + '%"></div>');
                                        }
                                    }
                                } else {
                                    // ダミーデータをセット
                                    $scope.setDummy();
                                    $scope.$apply();
                                }

                                // プログレスバー消去
                                $timeout(function () {
                                    ProgressSV.hide(0);
                                }, 1000);

                                // ページトップへ遷移
                                $scope.scrollTop();
                                // 表示調整処理
                                $scope.adjustDisp(len);
                            },
                            function () {
                                console.log('[ERROR]m_info 情報取得に失敗しました');
                                // 読込みエラーフラグセット
                                localStorage.setItem("infoLoadError", "true");
                                // 再取得のため、フラグリセット
                                localStorage.setItem("last_ref_date", "20150101");
                                localStorage.setItem("last_update", "2015/01/01 00:00:00");
                                // プログレスバー消去
                                ProgressSV.hide(0);
                            });
                },
                function (ex) {
                    console.log('[ERROR]m_info トランザクションエラー');
                    // 読込みエラーフラグセット
                    localStorage.setItem("infoLoadError", "true");
                    // 再取得のため、フラグリセット
                    localStorage.setItem("last_ref_date", "20150101");
                    localStorage.setItem("last_update", "2015/01/01 00:00:00");
                    // プログレスバー消去
                    ProgressSV.hide(0);
                }
        );
    };

    /*
     * おしらせ情報のデータ消去
     * 
     * @returns {undefined}
     */
    $scope.delInfo = function () {

        var sql = "DELETE FROM m_info";
        goiken.transaction(
                function (tx) {
                    tx.executeSql(sql, [],
                            function () {
                                // おしらせ情報をサーバーから取得して、テーブルに格納
                                $scope.getInfo();
                            },
                            function () {
                                console.log('[ERROR]m_info データ削除失敗');
                                // 読込みエラーフラグセット
                                localStorage.setItem("infoLoadError", "true");
                                // 再取得のため、フラグリセット
                                localStorage.setItem("last_ref_date", "20150101");
                                localStorage.setItem("last_update", "2015/01/01 00:00:00");
                                // プログレスバー消去
                                ProgressSV.hide(0);
                            }
                    );
                },
                function (ex) {
                    console.log('[ERROR]m_info トランザクションエラー');
                    // 読込みエラーフラグセット
                    localStorage.setItem("infoLoadError", "true");
                    // 再取得のため、フラグリセット
                    localStorage.setItem("last_ref_date", "20150101");
                    localStorage.setItem("last_update", "2015/01/01 00:00:00");
                    // プログレスバー消去
                    ProgressSV.hide(0);
                }
        );
    };

    /*
     * おしらせ画像格納フォルダの削除
     * 
     * @returns {undefined}
     */
    $scope.removeInfoDir = function () {
        // ディレクトリエントリーを取得
        resolveLocalFileSystemURL(rootDir + "info", function (dirEntry) {
            // ディレクトリの再帰的削除
            dirEntry.removeRecursively(function () {
                // お知らせ情報の削除
                $scope.delInfo();
            }, function (error) {
                console.log("おしらせ画像フォルダの削除に失敗しました " + error.code);
                // お知らせ情報の削除（削除処理に失敗しても処理続行）
                $scope.delInfo();
            });
        }, function (error) {
            console.log("Error resolveLocalFileSystemURL() " + error.code);
            // お知らせ情報の削除（指定ディレクトリが無い場合も処理を続行）
            $scope.delInfo();
        });
    };

    /*
     * 詳細表示
     * 
     * @param {type} index
     * @param {type} id
     * @returns {undefined}
     */
    $scope.showDetail = function (index, id) {
        $scope.isDetail[index] = true;

        // 操作ログ保存
        RootService.log(1, id);
    };

    /*
     * 詳細非表示
     * 
     * @param {type} index
     * @returns {undefined}
     */
    $scope.hideDetail = function (index) {
        $scope.isDetail[index] = false;
    };

    /*
     * ダミーデータ作成
     * 
     * @returns {undefined}
     */
    $scope.setDummy = function () {
        var data = new Array();
        var info = {
            disp_type: 99
        };
        data.push(info);
        $scope.feeds = data;

        // iOSの場合の設定
        if (ons.platform.isIOS()) {
            // OSのステータスバー表示エリアの背景セット
            if (document.getElementById("info-status") === null) {
                $('ons-page#info').prepend('<div class="statusbar" id="info-status" style="zoom:' + (10000 / scale) + '%"></div>');
            }
        }
    };

    /*
     * 画面トップへスクロール
     * 
     * @returns {undefined}
     */
    $scope.scrollTop = function () {
        // set the location.hash to the id of the element you wish to scroll to.
        $location.hash('info-top');
        // call $anchorScroll()
        $anchorScroll();
        $scope.$apply();
    };

    /*
     * 表示調整処理（コメントの折りたたみ表示制御）
     * 
     * @param {type} cnt
     * @returns {undefined}
     */
    $scope.adjustDisp = function (cnt) {
        // フォントサイズを抽出
        var target = document.getElementById('info-top');
        var div = $('<div style="display:none;font-size:1em;margin:0;padding:0;height:auto;line-height:1;border:0;">&nbsp;</div>');
        var size = div.appendTo(target).height();
        div.remove();

        // フォントサイズから、表示エリアの高さを計算
        var dispHeight = (size * 2);
        // コメント表示エリアの高さを求め、２行表示以上なら、折りたたみ表示する。
        for (var i = 0; i < cnt; i++) {

            // コメント表示エリアが無い場合（画像のみの場合）は、処理をスキップ
            if (document.getElementById('com-all' + i) === null) {
                continue;
            }

            // 表示エリアサイズ指定
            document.getElementById('com-short' + i).style.height = dispHeight + 'px';
            // 情報が指定エリアに収まらない場合は、折りたたみ表示
            var height = $('#com-all' + i).height();

            if (height > dispHeight + 2) {
                // 折りたたみ表示
                $scope.hideDetail(i);
                $scope.$apply();
            } else {
                // 折りたたみ不要
                document.getElementById('com-close' + i).style.display = 'none';
            }
        }
    };

    /*
     * クーポン画面への遷移処理
     * 
     * @param {type} id
     * @returns {undefined}
     */
    $scope.gotoCoupon = function (id) {

        tabbar.setActiveTab(2);

        // お得なクーポン操作ログ情報を取得(1:お知らせボタンをクリックして、お得なクーポンへジャンプ)
        RootService.log(2, id);

    };

////////////////////////////////////////////////////////////////////////////////

    /*
     * アイコン画像更新処理
     * 
     * @returns {undefined}
     */
    $scope.updateInfoIcon = function () {

        // 初期起動判定
        var init_flg = localStorage.getItem('infoIconIniFlg');
        if (init_flg === 'false') {
            console.log("おしらせアイコン：２回目の起動");
            // 更新データがあれば、情報を更新
            $scope.chkUpdateIcon();
        } else {
            console.log("おしらせアイコン：初期起動");
            // アイコン情報を新規取得
            $scope.makeDbInfoIcon();
        }
    };

    /*
     * アイコン画像情報の格納テーブル生成
     * 
     * @returns {undefined}
     */
    $scope.makeDbInfoIcon = function () {
        // データベース作成
        if (window.openDatabase) {

            if (goiken === null) {
                goiken = openDatabase('goiken', '0.1', '店舗情報', 2 * 1024 * 1024);
            }

            var createInfoSQL = "CREATE TABLE IF NOT EXISTS m_info_icon(" +
                    "icon_type integer NOT NULL unique," +
                    "update_date date," +
                    "icon_name text," +
                    "icon text)";

            goiken.transaction(function (tx) {
                tx.executeSql(createInfoSQL, [],
                        function () {
                            localStorage.setItem("infoIconIniFlg", "false");
                            $scope.getInfoIcon();
                        },
                        function () {
                            console.log('[ERROR]m_info_icon テーブル作成失敗');
                            // 読込みエラーフラグセット
                            localStorage.setItem("infoLoadError", "true");
                        }
                );
            });
        } else {
            console.log("WebSQL is not supported by your browser!");
        }
    };

    /*
     * アイコンデータの更新チェック
     * 
     * @returns {undefined}
     */
    $scope.chkUpdateIcon = function () {
        InfoService.getLastUpdateIcon(function (data) {

            if (data === -1) {
                console.log('ネットワーク接続エラー：getLastUpdateIcon');
                // 読込みエラーフラグセット
                localStorage.setItem("infoLoadError", "true");
                // 再取得のため、日付をリセット
                localStorage.setItem("last_update_icon", "2015/01/01 00:00:00");
                // 更新前のアイコン情報があればそれをセットする
                if (localStorage.getItem('icons') !== null) {
                    // アイコン情報セット
                    infoIcon = angular.fromJson(localStorage.getItem('icons'));
                }
                // お知らせ情報更新（※アイコンの更新に失敗してもお知らせ情報は表示する）
                $scope.initial2($scope.pushBootFlg);
                return;
            }

            var server_dt = 0;
            if (data[0].last_update !== null) {
                server_dt = new Date((data[0].last_update).replace(/-/g, '/'));
            }

            var local_dt = 0;
            if (localStorage.getItem('last_update_icon') !== null) {
                local_dt = new Date((localStorage.getItem('last_update_icon')).replace(/-/g, '/'));
            }

            console.log('アイコン最終更新日付（サーバー）：' + server_dt);
            console.log('アイコン最終更新日付（ローカル）：' + local_dt);

            // サーバの最終更新日付がローカルのものより新しい場合、更新データあり
            if (server_dt > local_dt) {
                console.log("アイコン情報更新開始");
                // データ更新
                $scope.removeIconDir();
            } else {
                // アイコン情報セット
                infoIcon = angular.fromJson(localStorage.getItem('icons'));
                // お知らせ情報表示
                $scope.initial2($scope.pushBootFlg);
            }
        });
    };

    /*
     * アイコンデータの取得
     * 
     * @returns {undefined}
     */
    $scope.getInfoIcon = function () {

        // サーバー問い合わせ
        InfoService.getInfoIcon(function (data) {

            if (data === null) {
                console.log('アイコン情報取得エラー');
                // 読込みエラーフラグセット
                localStorage.setItem("infoLoadError", "true");
                // 再取得のため、日付をリセット
                localStorage.setItem("last_update_icon", "2015/01/01 00:00:00");
                // 更新前のアイコン情報があればそれをセットする
                if (localStorage.getItem('icons') !== null) {
                    // アイコン情報セット
                    infoIcon = angular.fromJson(localStorage.getItem('icons'));
                }
                // お知らせ情報更新（※アイコンの更新に失敗してもお知らせ情報は表示する）
                $scope.initial2($scope.pushBootFlg);
                return;
            }

            // ダウンロードエラーフラグ
            var errflg = false;

            // データ件数取得
            var dataNum = data.length;
            localStorage.setItem('iconNum', dataNum);
            localStorage.setItem('downloadIconNum', 0);

            // ファイル転送オブジェクト（画像ダウンロード処理用）
            var fileTransfer = new FileTransfer();

            // ローカルストレージから最終更新日時を取得
            var last_update_ts;
            var last_update_ts_org;
            var last_update_dt = localStorage.getItem('last_update_icon');
            if (last_update_dt === null) {
                last_update_ts = new Date("2015/01/01 00:00:00");
            } else {
                last_update_ts = new Date(last_update_dt.replace(/-/g, '/'));
            }
            // 比較用に処理前の情報を退避
            last_update_ts_org = last_update_ts;

            // WebSQLに取得データを格納
            Object.keys(data).forEach(function (key) {

                var sql = 'INSERT INTO m_info_icon(icon_type, update_date, icon_name, icon) VALUES (?, ?, ?, ?)';
                var values = [
                    data[key].icon_type,
                    data[key].update_date,
                    data[key].icon_name,
                    data[key].icon
                ];

                if (goiken === null) {
                    goiken = openDatabase('goiken', '0.1', '店舗情報', 2 * 1024 * 1024);
                }

                goiken.transaction(function (tx) {
                    tx.executeSql(sql, values,
                            function () {
                                // 最終更新日時を更新
                                var update_ts = new Date((data[key].update_date).replace(/-/g, '/'));
                                if (update_ts > last_update_ts) {
                                    last_update_ts = update_ts;             // 比較用データ
                                    last_update_dt = data[key].update_date; // 保存用のデータ
                                }

                                // 画像保存
                                if (data[key].icon !== "") {
                                    //ダウンロードするURL
                                    var url = encodeURI(serverUrl + 'sp2/icon/' + data[key].icon);
                                    //保存するパス
                                    var filePath = rootDir + iconPath + data[key].icon;
                                    fileTransfer.download(url, filePath,
                                            function () {
                                                //******************************
                                                var downloadNum = localStorage.getItem('downloadIconNum');
                                                downloadNum++;
                                                localStorage.setItem('downloadIconNum', downloadNum);

                                                var iconNum = localStorage.getItem('iconNum');
                                                // ダウンロードが全て完了したら表示を行う。
                                                if (Number(iconNum) === Number(downloadNum)) {
                                                    $scope.$apply(function () {
                                                        // アイコン情報セット
                                                        $scope.setInfoIcon();
                                                    });
                                                }
                                                //******************************
                                            },
                                            function (error) {
                                                console.log('ダウンロードエラー ' + error.code);
                                                errflg = true;

                                                // 読込みエラーフラグセット
                                                localStorage.setItem("infoLoadError", "true");
                                                // 再取得のため、フラグリセット
                                                localStorage.setItem("last_update_icon", "2015/01/01 00:00:00");
                                            });
                                }

                                // 挿入完了判定
                                dataNum--;
                                if (dataNum === 0) {

                                    // ダウンロードが成功していれば、更新日付を更新
                                    if (errflg === false) {
                                        // 最終更新日時をローカルストレージに格納
                                        localStorage.setItem('last_update_icon', last_update_dt);
                                    } else {
                                        // 読込みエラーフラグセット
                                        localStorage.setItem("infoLoadError", "true");
                                        // 再取得のため、日付をリセット
                                        localStorage.setItem("last_update_icon", "2015/01/01 00:00:00");
                                        // 更新前のアイコン情報があればそれをセットする
                                        if (localStorage.getItem('icons') !== null) {
                                            // アイコン情報セット
                                            infoIcon = angular.fromJson(localStorage.getItem('icons'));
                                        }
                                        // お知らせ情報更新（※アイコンの更新に失敗してもお知らせ情報は表示する）
                                        $scope.initial2($scope.pushBootFlg);
                                    }
                                }
                            },
                            function () {
                                console.log('[ERROR]m_info_icon データ挿入に失敗しました：' + dataNum);
                                errflg = true;

                                // 処理完了判定
                                dataNum--;
                                if (dataNum === 0) {
                                    // 読込みエラーフラグセット
                                    localStorage.setItem("infoLoadError", "true");
                                    // 再取得のため、日付をリセット
                                    localStorage.setItem("last_update_icon", "2015/01/01 00:00:00");
                                    // 更新前のアイコン情報があればそれをセットする
                                    if (localStorage.getItem('icons') !== null) {
                                        // アイコン情報セット
                                        infoIcon = angular.fromJson(localStorage.getItem('icons'));
                                    }
                                    // お知らせ情報更新（※アイコンの更新に失敗してもお知らせ情報は表示する）
                                    $scope.initial2($scope.pushBootFlg);
                                }
                            }
                    );
                });
            });
        });
    };

    /*
     * アイコンデータセット
     * 
     * @returns {undefined}
     */
    $scope.setInfoIcon = function () {

        var sql = "SELECT * FROM m_info_icon";

        if (goiken === null) {
            goiken = openDatabase('goiken', '0.1', '店舗情報', 2 * 1024 * 1024);
        }

        goiken.transaction(function (tx) {
            tx.executeSql(sql, [], function (tx, rs) {
                var result = rs.rows;
                var len = result.length;
                for (var i = 0; i < len; i++) {
                    infoIcon[result.item(i).icon_type] = result.item(i).icon;
                }
                // アイコン情報をローカルストレージに格納
                localStorage.setItem('icons', angular.toJson(infoIcon));

                // お知らせ情報更新
                $scope.initial2($scope.pushBootFlg);
            });
        });
    };

    /*
     * アイコンデータ消去
     * 
     * @returns {undefined}
     */
    $scope.delInfoIcon = function () {

        var sql = "DELETE FROM m_info_icon";

        if (goiken === null) {
            goiken = openDatabase('goiken', '0.1', '店舗情報', 2 * 1024 * 1024);
        }

        goiken.transaction(function (tx) {
            tx.executeSql(sql, [],
                    function () {
                        // おしらせアイコン情報取得
                        $scope.getInfoIcon();
                    },
                    function () {
                        console.log('m_info_icon 削除失敗');
                        // 読込みエラーフラグセット
                        localStorage.setItem("infoLoadError", "true");
                        // 再取得のため、日付をリセット
                        localStorage.setItem("last_update_icon", "2015/01/01 00:00:00");
                        // 更新前のアイコン情報があればそれをセットする
                        if (localStorage.getItem('icons') !== null) {
                            // アイコン情報セット
                            infoIcon = angular.fromJson(localStorage.getItem('icons'));
                        }
                        // お知らせ情報更新（※アイコンの更新に失敗してもお知らせ情報は表示する）
                        $scope.initial2($scope.pushBootFlg);
                    }
            );
        });
    };

    /*
     * アイコン格納フォルダの削除
     * 
     * @returns {undefined}
     */
    $scope.removeIconDir = function () {
        // ディレクトリエントリーを取得
        resolveLocalFileSystemURL(rootDir + "icon", function (dirEntry) {
            // ディレクトリの再帰的削除
            dirEntry.removeRecursively(function () {
                // おしらせアイコン情報削除
                $scope.delInfoIcon();
            }, function (error) {
                console.log("おしらせアイコンフォルダの削除に失敗しました " + error.code);

                // おしらせアイコン情報削除
                $scope.delInfoIcon();
            });
        }, function (error) {
            console.log("Error resolveLocalFileSystemURL() " + error.code);

            // おしらせアイコン情報削除
            $scope.delInfoIcon();
        });
    };

////////////////////////////////////////////////////////////////////////////////

    /*
     * おしらせ画像のリンク表示（ブラウザ起動）
     * 
     * @param {type} linkUrl
     * @returns {undefined}
     */
    $scope.openLink = function (linkUrl) {

        console.log("画像リンクURL：" + linkUrl);

        // 事前チェック
        if ((linkUrl === "") || (linkUrl === null)) {
            // リンク設定がない場合は、処理なし
            return;
        } else if ((linkUrl !== "") && (navigator.connection.type === 'none')) {
            // リンク設定ありで、オフラインの場合、接続エラー表示
            MessageSV.alert(0);
            return;
        }

        // 確認ダイアログ表示
        var options = {
            'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
            'title': 'リンク先表示',
            'buttonLabels': ['リンク先を表示する'],
            'addCancelButtonWithLabel': 'キャンセル',
            'androidEnableCancelButton': true,
            'winphoneEnableCancelButton': true
        };
        window.plugins.actionsheet.show(options, function (buttonIndex) {
            if (buttonIndex === 1) {
                if (navigator.connection.type === 'none') {
                    // 接続エラー表示
                    MessageSV.alert(0);
                } else {
                    // リンク先を表示
                    cordova.InAppBrowser.open(linkUrl, '_system', 'location=yes');
                }
            } else {
                window.plugins.actionsheet.hide();
            }
        });

//        // 接続確認
//        $.ajax({
//            url: linkUrl,
//            type: 'GET',
//            timeout: 1000,
//            success: function (data) {
////                console.log(data);
//                console.log("接続OK");
//
//                // 確認ダイアログ表示
//                var options = {
//                    'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
//                    'title': 'リンク先表示',
//                    'buttonLabels': ['リンク先を表示する'],
//                    'addCancelButtonWithLabel': 'キャンセル',
//                    'androidEnableCancelButton': true,
//                    'winphoneEnableCancelButton': true
//                };
//                window.plugins.actionsheet.show(options, function (buttonIndex) {
//                    if (buttonIndex === 1) {
//                        if (navigator.connection.type === 'none') {
//                            // 接続エラー表示
//                            MessageSV.alert(0);
//                        } else {
//                            // リンク先を表示
//                            cordova.InAppBrowser.open(linkUrl, '_system', 'location=yes');
//                        }
//                    } else {
//                        window.plugins.actionsheet.hide();
//                    }
//                });
//            },
//            error: function (XMLHttpRequest, textStatus, errorThrown) {
//                console.log("XMLHttpRequest : " + XMLHttpRequest.status);
//                console.log("textStatus : " + textStatus);
//                console.log("errorThrown : " + errorThrown.message);
//            }
//        });

    };

};

app.controller('InfoCtrl', ['$scope', '$timeout', '$location', '$anchorScroll', 'InfoService', 'RootService', 'ProgressSV', 'MessageSV', InfoCtrl]);
