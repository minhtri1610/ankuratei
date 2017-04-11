/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// スペシャル壁紙関連処理
SpecialCtrl = function ($scope, $timeout, GetSpecialInfoSV, GetWallpaperVersionSV, ProgressSV) {

    // IOSスタイルを指定
    if (ons.platform.isIOS()) {
        $scope.iosStyle = "{'padding-top': '" + (10 + (1000 / scale)) + "px'}";
        $scope.iosLeftStyle = "{'padding': '0px'}";
        $scope.iosCenterStyle = "{'margin-top': '-10px'}";
        $timeout(function () {
            // OSのステータスバー表示エリアの背景セット
            $('ons-page#wallpaper').prepend('<div class="statusbar" id="special-status" style="zoom:' + (10000 / scale) + '%"></div>');
        }, 200);
    } else {
        $scope.iosStyle = "{}";
        $scope.iosLeftStyle = "{}";
        $scope.iosCenterStyle = "{}";
    }

    var width = screen.width;
    var height = screen.height;
    var deviceRatio = Number((height / width).toFixed(1));

    $scope.maxIconNum = 18;

    // スペシャルクーポン数の初期化
    $scope.pageNum = 0;

    // タイマーの初期化
    $scope.SpecialTimer = null;

    // 画像ダウンロード関連変数初期化
    var countAlert = 0;

    // 壁紙画像の保存先
    specialPath = (device.platform === 'Android') ? ("../" + specialPath) : specialPath;

    // ファイルパス
    $scope.specialLocalDir = rootDir + specialPath;         // スペシャル画像の保存先（ローカル）
    $scope.specialSrvlDir = serverUrl + "sp/wallpaper/";    // スペシャル画像の保存先（サーバー）

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

    // タイムアウト、画像ダウンロード失敗した際の処理
    $scope.downloadFailure = function (fileTransfer) {

        // スペシャル画像の件数、ダウンロード件数
        localStorage.setItem('specialDownloadStatus', false);
        localStorage.setItem('downloadSpecialNum', 0);

        // ダウンロード処理強制終了
        fileTransfer.abort();

        // ネットワーク状態（オンライン）チェック
        if ((navigator.connection.type !== 'none') && (countAlert === 0)) {

            if (tabbar.getActiveTabIndex() === 3) {
                // エラーメッセージ表示
                navigator.notification.alert(
                        '情報の取得に失敗しました。\n通信環境の良い場所で、ご利用ください。', // メッセージ
                        function (et) {
                            console.log(et);
                            // プログレスバー消去
                            ProgressSV.hide(3);
                        }, // コールバック
                        '情報取得エラー', // タイトル
                        'OK' // ボタン名
                        );
            }

            countAlert = 1;

        } else if ((navigator.connection.type === 'none') && (countAlert === 0)) {

            // プログレスバー消去
            ProgressSV.hide(3);

            countAlert = 1;

        }

    };

    // 壁紙画像のダウンロード
    $scope.downloadSpecial = function (img, fileTransfer, len) {

        // 端末のディレクトリパスが取得できていない場合があるので、ここで再セット
        if ($scope.specialLocalDir === "null" + specialPath) {
            $scope.specialLocalDir = rootDir + specialPath;
        }

        // ダウンロードするURL
        var url = encodeURI($scope.specialSrvlDir + img);
        // 保存先ファイルパス
        var filePath = $scope.specialLocalDir + img;

        fileTransfer.download(url, filePath,
                function () {
                    var downloadNum = localStorage.getItem('downloadSpecialNum');
                    downloadNum++;
                    localStorage.setItem('downloadSpecialNum', downloadNum);

                    // ダウンロードが全て完了したら表示を行う。
                    if (Number(len) === Number(downloadNum)) {

                        // ダウンロードタイマー解除
                        $timeout.cancel($scope.SpecialTimer);
                        $scope.SpecialTimer = null;

                        // 画像を表示する
                        $scope.selectSpecialInfo();
                        localStorage.setItem('specialDownloadStatus', true);
                        localStorage.setItem('wallpaperVersion', $scope.wallpaperVersion);
                    }
                },
                function (error) {

                    // ダウンロードタイマー解除
                    $timeout.cancel($scope.SpecialTimer);
                    $scope.SpecialTimer = null;

                    // ダウンロード失敗
                    $scope.downloadFailure(fileTransfer);
                });

    };

    // 壁紙画像ディレクトリ削除
    $scope.updateSpecialDir = function (imgArr) {

        // ディレクトリエントリーを取得
        resolveLocalFileSystemURL(rootDir + specialPath, function (dirEntry) {
            // ディレクトリの再帰的削除
            dirEntry.removeRecursively(function () {
                // 壁紙画像の削除
                $scope.downloadSpecialImg(imgArr);
            }, function (error) {
                console.log("クーポン画像の削除に失敗しました " + error.code);
                // 壁紙画像の削除（削除処理に失敗しても処理続行）
                $scope.downloadSpecialImg(imgArr);
            });
        }, function (error) {
            console.log("なぞポンのディレクトリが存在しない条件で、なぞポン画像をダウンロード。コード：" + error.code);
            // 壁紙画像の削除（指定ディレクトリが無い場合も処理を続行）
            $scope.downloadSpecialImg(imgArr);

        });
    };

    // スペシャル画像をすべてダウンロード
    $scope.downloadSpecialImg = function (imgArr) {

        // ファイル転送オブジェクト（画像ダウンロード処理用）
        var fileTransfer = new FileTransfer();
        var len = imgArr.length;

        // 画像ダウンロード関連変数リセット
        countAlert = 0;

        localStorage.setItem('specialDownloadStatus', false);

        // スペシャル画像の件数、ダウンロード件数
        localStorage.setItem('specialNum', len);
        localStorage.setItem('downloadSpecialNum', 0);

        // ダウンロードタイマーセット
        if ($scope.SpecialTimer !== null) {
            // ダウンロードタイマー解除
            $timeout.cancel($scope.SpecialTimer);
            $scope.SpecialTimer = null;
        }

        // ダウンロードタイマー設定
        $scope.SpecialTimer = $timeout(function () {
            $scope.downloadFailure(fileTransfer);
        }, 60000);  // タイムアウト：１分

        for (var i = 0; i < len; i++) {

            // ダウンロードに失敗した場合は、処理を抜ける。
            if (countAlert === 1) {
                return;
            }

            var dimg = (deviceRatio === 1.8) ? imgArr[i].imgname : imgArr[i].imgname_s;
            $scope.downloadSpecial(dimg, fileTransfer, len);
        }

    };

    // スペシャル画像データのダウンロード進捗チェック
    $scope.checkDownloadStatus = function () {

        return (localStorage.getItem('specialDownloadStatus') === 'true') && (localStorage.getItem('specialDownloadStatus') !== null);

    };

    /*
     * 初期処理
     * 
     * @param {type} mode ： 0:通常起動、1:レジューム起動
     * @returns {undefined}
     */
    $scope.initial = function (mode) {

        // 壁紙のinitialが呼ばれたから、フラグを下ろす
        localStorage.setItem('wallpaperUpdateFlg', false);

        if (navigator.connection.type !== 'none') {

            // アップデートチェックフラグをセット
            setEventExclusionTimer(3500);
            console.log('アップデータチェックを開始したので、タブバー操作をロックした');

            // 壁紙のバージョン取得
            GetWallpaperVersionSV.getVersion(function (data) {

                $scope.wallpaperVersion = data[0].version;

                // アプリ初期時、スペシャル関連処理
                if ((localStorage.getItem('specialIniFlg') !== 'false') || (localStorage.getItem('appVer') === null)) {

                    $scope.netStatus = (navigator.connection.type !== 'none') ? true : false;

                    if (navigator.connection.type !== 'none') {

                        // スペシャル情報取得モーダル表示
                        ProgressSV.show(3, 'スペシャル情報を読み込んでいます', tabbarHeight);

                        // スペシャルテーブル作成
                        $scope.makeTb();
                    }

                } else {

                    if (navigator.connection.type !== 'none') {

                        $scope.netStatus = true;

                        if ((localStorage.getItem('wallpaperVersion') !== $scope.wallpaperVersion) || ($scope.checkDownloadStatus() === false)) {

                            // 更新モーダルを開く
                            ProgressSV.show(3, 'スペシャル情報を更新しています', tabbarHeight);

                            // 二回目から起動した場合、データの更新を行う
                            $scope.wallpaperUpdate();

                        } else {

                            if (mode === 0 || localStorage.getItem('wallpaperMode') !== 'online') {

                                $scope.wallpaperInfo = null;
                                $scope.offlineWallpaperInfo = null;

                                // 更新がなければ、前回の壁紙を表示する
                                $scope.selectSpecialInfo();
                            }

                        }

                    } else {

                        // オフラインモードに切り替え
                        if (mode === 0) {
                            $scope.netStatus = false;
                            $scope.selectSpecialInfo();
                        }
                    }

                }

                // アップデートチェックフラグを解除
                setEventExclusionTimer(300);
                console.log('アップデータチェックが完了したので、タブバー操作ロックを解除した');

            });

        } else {
            // 300ミリ秒ごに排他を解除
            setEventExclusionTimer(300);

            // オフラインモードに切り替え
            if (mode === 0) {
                $scope.netStatus = false;
                $scope.selectSpecialInfo();
            }
        }

    };

    // スペシャルテーブル作成
    $scope.makeTb = function () {

        console.log('m_wallpaper テーブル作成開始.');

        // データベースが開いていなければ、開く
        if (goiken === null) {

            goiken = openDatabase('goiken', '0.1', '店舗情報', 2 * 1024 * 1024);

        }

        if (localStorage.getItem('appVer') === null) {

            cordova.getAppVersion.getVersionNumber(function (version) {
                appVer = version;
                console.log('アプリバージョン' + appVer);
                localStorage.setItem('appVer', appVer);
            });

            var dropTblSQL = 'drop table m_wallpaper';

            // テーブル作成SQLの実行
            goiken.transaction(function (tx) {

                tx.executeSql(dropTblSQL, [],
                        function () {

                            console.log('m_wallpaperを削除完了.');

                            //　テーブル作成SQL
                            var createSpecialTblSQL = "CREATE TABLE IF NOT EXISTS m_wallpaper(" +
                                    "id integer NOT NULL unique," +
                                    "sortkey integer," + //sortkeyが重複していたため、削除
                                    "wpname character," +
                                    "imgname character," +
                                    "imgname_s character," +
                                    "md5 character," +
                                    "md5_s character)";

                            // テーブル作成SQLの実行
                            goiken.transaction(function (tx) {

                                tx.executeSql(createSpecialTblSQL, [],
                                        function () {

                                            console.log('m_wallpaper テーブル作成完了.');

                                            // スペシャルデータをサーバーから取得して、DBに挿入
                                            $scope.insertSpecialInfo();

                                        },
                                        function () {

                                            console.log('m_coupons テーブル作成エラー.');

                                            // プログレスバー消去
                                            ProgressSV.hide(3);

                                        });

                            });

                        },
                        function () {

                            console.log('m_wallpaperを削除エラー.');

                            //　テーブル作成SQL
                            var createSpecialTblSQL = "CREATE TABLE IF NOT EXISTS m_wallpaper(" +
                                    "id integer NOT NULL unique," +
                                    "sortkey integer," + //sortkeyが重複していたため、削除
                                    "wpname character," +
                                    "imgname character," +
                                    "imgname_s character," +
                                    "md5 character," +
                                    "md5_s character)";

                            // テーブル作成SQLの実行
                            goiken.transaction(function (tx) {

                                tx.executeSql(createSpecialTblSQL, [],
                                        function () {
                                            console.log('m_wallpaper テーブル作成完了.');

                                            // スペシャルデータをサーバーから取得して、DBに挿入
                                            $scope.insertSpecialInfo();
                                        },
                                        function () {
                                            console.log('m_coupons テーブル作成エラー.');

                                            // プログレスバー消去
                                            ProgressSV.hide(3);

                                        });
                            });

                        });

            });

        } else {

            //　テーブル作成SQL
            var createSpecialTblSQL = "CREATE TABLE IF NOT EXISTS m_wallpaper(" +
                    "id integer NOT NULL unique," +
                    "sortkey integer," + //sortkeyが重複していたため、削除
                    "wpname character," +
                    "imgname character," +
                    "imgname_s character," +
                    "md5 character," +
                    "md5_s character)";

            // テーブル作成SQLの実行
            goiken.transaction(function (tx) {

                tx.executeSql(createSpecialTblSQL, [],
                        function () {

                            console.log('m_wallpaper テーブル作成完了.');

                            // スペシャルデータをサーバーから取得して、DBに挿入
                            $scope.insertSpecialInfo();

                        },
                        function () {

                            console.log('m_coupons テーブル作成エラー.');

                            // プログレスバー消去
                            ProgressSV.hide(3);

                        });

            });
        }

    };

    // スペシャルデータをサーバーから取得して、DBに挿入
    $scope.insertSpecialInfo = function () {

        console.log('m_wallpaper テーブルにデータの挿入開始.');

        var i = 0;

        // データベースが開いていなければ、開く
        if (goiken === null) {

            goiken = openDatabase('goiken', '0.1', '店舗情報', 2 * 1024 * 1024);

        }

        GetSpecialInfoSV.getInfo(function (data) {

            var dataNum = data.length;

            if ((localStorage.getItem('specialIniFlg') !== 'false') || ($scope.checkDownloadStatus() === false)) {
                // 壁紙のダウンロード
                $scope.downloadSpecialImg(data);
            } else {
                // 壁紙の更新
                $scope.updateSpecialDir(data);
            }

            // 壁紙の件数、ダウンロード件数
            localStorage.setItem('wallpaperNum', dataNum);
            localStorage.setItem('downloadWallpapersNum', 0);

            Object.keys(data).forEach(function (key) {

                var sql = 'insert into m_wallpaper(id, sortkey,wpname,imgname,imgname_s,md5,md5_s) values (' +
                        '?,?,?,?,?,?,?)';

                var values = [
                    data[key].id,
                    data[key].sortkey,
                    data[key].wpname,
                    data[key].imgname,
                    data[key].imgname_s,
                    data[key].md5,
                    data[key].md5_s];

                i++;

                goiken.transaction(
                        function (tx) {
                            tx.executeSql(sql,
                                    values,
                                    function () {

                                        dataNum--;

                                        // 壁紙ダウンロード数集計
                                        var downloadNum = localStorage.getItem('downloadWallpapersNum');
                                        downloadNum++;

                                        localStorage.setItem('downloadWallpapersNum', downloadNum);

                                        if (dataNum === 0) {

                                            console.log('m_wallpaper テーブルにデータの挿入終了.');

                                        }

                                    },
                                    function () {
                                        console.log('error');

                                        // プログレスバー消去
                                        ProgressSV.hide(3);
                                    }
                            );
                        });
            });

        });

    };

    // スペシャル画像を取得
    $scope.selectSpecialInfo = function () {

        console.log('m_wallpaper テーブルのデータ抽出開始.');

        // オフラインモードで初期化
        localStorage.setItem('wallpaperMode', 'offline');

        // データベースが開いていなければ、開く
        if (goiken === null) {

            goiken = openDatabase('goiken', '0.1', '店舗情報', 2 * 1024 * 1024);

        }

        // 店舗情報DBから検索SQL文の作成
        var sql = "select *  from m_wallpaper order by sortkey";

        // 検索
        goiken.transaction(
                function (tx) {

                    tx.executeSql(sql, [],
                            function (tx, rs) {

                                var result = rs.rows;
                                var data = new Array();
                                var len = result.length;

                                // 画像数をセット
                                $scope.pageNum = len;
                                $scope.pageCount = Math.floor($scope.pageNum / $scope.maxIconNum);
                                $scope.pageAmari = $scope.pageNum % $scope.maxIconNum;

                                // 端末のディレクトリパスが取得できていない場合があるので、ここで再セット
                                if ($scope.specialLocalDir === "null" + specialPath) {
                                    $scope.specialLocalDir = rootDir + specialPath;
                                }

                                for (var i = 0; i < len; i++) {

                                    var dimg = (deviceRatio === 1.8) ? result.item(i).imgname : result.item(i).imgname_s;

                                    // 表示データセット
                                    var info = {
                                        img: $scope.specialLocalDir + dimg,
                                        dimg: $scope.specialSrvlDir + dimg
                                    };

                                    data.push(info);
                                    ProgressSV.setProgress(3, i / len);
                                }

                                // Viewにデータをバインド
                                if (navigator.connection.type !== 'none') {

                                    $scope.netStatus = true;
                                    // オンライン
                                    $scope.wallpaperInfo = data;
                                    localStorage.setItem('wallpaperMode', 'online');

                                } else {

                                    $scope.netStatus = false;
                                    // ローカル画像数をセット
                                    $scope.pageNum = 8;
                                    $scope.pageCount = Math.floor($scope.pageNum / $scope.maxIconNum);
                                    $scope.pageAmari = $scope.pageNum % $scope.maxIconNum;

                                    localStorage.setItem('wallpaperMode', 'offline');

                                    // オフライン
                                    $scope.offlineWallpaperInfo = new Array({
                                        img: 'img/special/offline/wallpaper-01.png',
                                        dimg: serverUrl+ 'sp/wallpaper/wallpaper-01.png'
                                    },
                                    {
                                        img: 'img/special/offline/wallpaper-04.png',
                                        dimg: serverUrl+ 'sp/wallpaper/wallpaper-04.png'
                                    },
                                    {
                                        img: 'img/special/offline/special_wallpaper_Brown_744x1392-1.png',
                                        dimg: serverUrl+ 'sp/wallpaper/special_wallpaper_Brown_744x1392-1.png'
                                    },
                                    {
                                        img: 'img/special/offline/special_wallpaper_Red_744x1392-1.png',
                                        dimg: serverUrl+ 'sp/wallpaper/special_wallpaper_Red_744x1392-1.png'
                                    },
                                    {
                                        img: 'img/special/offline/special_wallpaper_744x1392.png',
                                        dimg: serverUrl+ 'sp/wallpaper/special_wallpaper_744x1392.png'
                                    },
                                    {
                                        img: 'img/special/offline/03_5.png',
                                        dimg: serverUrl+ 'sp/wallpaper/03_5.png'
                                    },
                                    {
                                        img: 'img/special/offline/1407_iPhone5s.png',
                                        dimg: serverUrl+ 'sp/wallpaper/1407_iPhone5s.png'
                                    },
                                    {
                                        img: 'img/special/offline/tiop_01_5.png',
                                        dimg: serverUrl+ 'sp/wallpaper/tiop_01_5.png'
                                    }

                                    );

                                }

                                // フルー壁紙ページビュー用
                                var damidatafull = new Array();

                                for (var j = 0; j < $scope.maxIconNum; j++) {

                                    // ページナビダミーデータをセット
                                    var dami = {
                                        img: 'dami'
                                    };

                                    damidatafull.push(dami);
                                }

                                $scope.fullWallpaper = damidatafull;

                                // 余り壁紙ページ用
                                var damidataamari = new Array();

                                for (var j = 0; j < $scope.pageAmari; j++) {

                                    // ページナビダミーデータをセット
                                    var dami = {
                                        img: 'dami'
                                    };

                                    damidataamari.push(dami);
                                }

                                $scope.amariArr = damidataamari;
                                $scope.$apply();

                                // モーダル解除
                                ProgressSV.setProgress(3, 1.0);

                                $timeout(function () {
                                    ProgressSV.hide(3);
                                }, 1000);

                                if (localStorage.getItem('specialIniFlg') !== 'false') {

                                    // 初期解除
                                    localStorage.setItem('specialIniFlg', 'false');

                                    console.log('m_wallpaper テーブルのデータ抽出終了---初期.');

                                } else {

                                    console.log('m_wallpaper テーブルのデータ抽出終了---二回目.');

                                }

                            });
                });
    };

    // スペシャル画像の更新
    $scope.wallpaperUpdate = function () {

        // データベースが開いていなければ、開く
        if (goiken === null) {

            goiken = openDatabase('goiken', '0.1', '店舗情報', 2 * 1024 * 1024);

        }

        // 店舗情報DBから検索SQL文の作成
        var sql = "delete from m_wallpaper";

        goiken.transaction(
                function (tx) {
                    tx.executeSql(sql,
                            [],
                            function () {

                                // テーブルを空にして、最新データを挿入
                                $scope.insertSpecialInfo();

                            },
                            function () {

                                console.log('error');

                            }
                    );
                });

    };

    // スペシャル画像のダウンロード
    $scope.downloadImg = function (img) {

        if (navigator.connection.type === 'none') {

            navigator.notification.alert(
                    '通信ができない環境の可能性があります。\n本アプリケーションはインターネットから最新の情報を取得しているため、通信可能な環境でご利用ください。', // メッセージ
                    function (et) {
                        console.log(et);
                    }, // コールバック
                    '接続エラー', // タイトル
                    'OK' // ボタン名
                    );

            return;
        }

        var options = {
            'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
            'title': '壁紙ダウンロード',
            'addCancelButtonWithLabel': 'キャンセル',
            'androidEnableCancelButton': true,
            'winphoneEnableCancelButton': true
        };

        options.buttonLabels = (device.platform === 'Android') ? ['壁紙を保存する'] : ['カメラロールに保存'];

        window.plugins.actionsheet.show(options, function (buttonIndex) {
            setTimeout(function () {

                if (buttonIndex === 1) {

                    // 画像保存
                    if (navigator.connection.type === 'none') {

                        navigator.notification.alert(
                                '通信ができない環境の可能性があります。\n本アプリケーションはインターネットから最新の情報を取得しているため、通信可能な環境でご利用ください。', // メッセージ
                                function (et) {
                                    console.log(et);
                                }, // コールバック
                                '接続エラー', // タイトル
                                'OK' // ボタン名
                                );

                    } else if (device.platform === 'iOS') {

                        //ダウンロードするURL
                        var url = encodeURI(img);

                        cordova.plugins.imgDownloader.downloadWithUrl(url,
                                function () {
                                    // ダウンロード成功時
                                    navigator.notification.alert(
                                            '画像を保存しました。',
                                            function () {
                                                console.log('ダウンロード成功しました。');
                                            },
                                            'ダウンロード成功',
                                            'OK'
                                            );
                                },
                                function (error) {
                                    // ダウンロード失敗時
                                    navigator.notification.alert(
                                            error,
                                            function () {
                                            },
                                            'ダウンロードエラー',
                                            'OK'
                                            );
                                });

                    } else {

                        // 画像ダウンロード開始
                        var fileTransfer = new FileTransfer();

                        //ダウンロードするURL
                        var url = encodeURI(img);

                        // 画像ファイル名
                        var imagName = img.match(".+/(.+?)$")[1];

                        //保存するパス
                        var filePath = rootDir + specialDlPath + imagName;

                        console.log(filePath);

                        fileTransfer.download(url,
                                filePath,
                                function () {

                                    // ダウンロード成功時
                                    navigator.notification.alert(
                                            '画像を保存しました。',
                                            function () {
                                                if (ons.platform.isAndroid()) {
                                                    refreshMedia.refresh(filePath);
                                                }
                                            },
                                            'ダウンロード成功',
                                            'OK'
                                            );

                                },
                                function (error) {

                                    console.log("ダウンロードエラー：" + error);

                                    // ダウンロード失敗時
                                    navigator.notification.alert(
                                            '画像のダウンロードに失敗しました。',
                                            function () {
                                            },
                                            'ダウンロードエラー',
                                            'OK'
                                            );
                                },
                                false,
                                {
                                    headers: {
                                        "Authorization": "dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
                                    }
                                }
                        );
                    }
                } else {
                    window.plugins.actionsheet.hide();
                }

            });
        });
    };

    $scope.itemOnLongPress = function () {
        console.log('Long press');
    };

    $scope.itemOnTouchEnd = function (dmg) {

        $scope.downloadImg(dmg);

    };

    $scope.initial(0);

    // カルーセルの要素が変更された場合、表示中の要素が最後だったら、表示位置を調整
    ons.ready(function () {

        document.addEventListener('ons-carousel:init', function (e) {

            specialCarousel.on('postchange', function (event) {

                // 今、いるページを計算
                $scope.nowPage = Math.floor((event.activeIndex) / $scope.maxIconNum) * $scope.maxIconNum;

                // 余白になった場合、１つ前に戻す
                if ((event.activeIndex + 1) > $scope.pageNum) {
                    specialCarousel.setActiveCarouselItemIndex(event.activeIndex - 1);
                }
            });

            // カルーセルの範囲外にスクロールした場合の処理
            specialCarousel.on('overscroll', function (event) {

                // カルーセルの２つめの余白になった場合の制御
                if ((event.activeIndex + 1) > $scope.pageNum) {
                    specialCarousel.setActiveCarouselItemIndex(event.activeIndex - 2);
                }
            });

        });
    });

};

app.controller('SpecialCtrl', ['$scope', '$timeout', 'GetSpecialInfoSV', 'GetWallpaperVersionSV', 'ProgressSV', SpecialCtrl]);



// スペシャル情報をサーバーから取得
GetSpecialInfoSV = function ($http) {

    var getSpecialInfoSV = {};

    getSpecialInfoSV.getInfo = function (callback) {
        $http.get(serverUrl + 'sp2/wallpaper_json_v2.php', {timeout: 60000})
                .success(
                        function (data) {
                            callback(data);
                        })
                .error(function () {

                    // オフラインモードに切り替え
                    var element = document.getElementById("wallpaper");
                    var $target_scope = angular.element(element).scope();
                    $target_scope.selectSpecialInfo();

                    if (tabbar.getActiveTabIndex() === 3) {
                        // ネットワーク状態（オンライン）チェック
                        if (navigator.connection.type !== 'none') {
                            // エラーメッセージ表示
                            navigator.notification.alert(
                                    '情報の取得に失敗しました。\n通信環境の良い場所で、ご利用ください。', // メッセージ
                                    function (et) {
                                        console.log(et);
                                        // プログレスバー消去
                                        // オーナーチェック
                                        if (owner === 3) {
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
                            if (owner === 3) {
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

    return getSpecialInfoSV;

};

// タッチイベントサービス
app.directive('onLongPress', function ($timeout) {

    return {
        restrict: 'A',
        link: function ($scope, $elm, $attrs) {

            $elm.bind('touchstart', function (evt) {

                $scope.longPress = true;

                $timeout(function () {

                    if ($scope.longPress) {

                        $scope.$apply(function () {

                            $scope.$eval($attrs.onLongPress);
                            $elm.attr('src', 'img/special/Spacial_saveBtnDisable_700x164.png');

                        });
                    }

                }, 0);
            });

            $elm.bind('touchend', function (evt) {

                $scope.longPress = false;

                if ($attrs.onTouchEnd) {

                    $scope.$apply(function () {

                        $scope.$eval($attrs.onTouchEnd);
                        $elm.attr('src', 'img/special/Spacial_saveBtn_700x164.png');

                    });
                }
            });

        }
    };

});

app.factory('GetSpecialInfoSV', ['$http', GetSpecialInfoSV]);

/*
 * 壁紙のバージョンを取得
 */
// 最新クーポン情報のバージョンを取得
GetWallpaperVersionSV = function ($http) {

    var getWallpaperVersionSV = {};

    getWallpaperVersionSV.getVersion = function (callback) {

        // バージョンをチェックするタイムアウト時間を3000に変更
        $http.get(serverUrl + 'sp2/get_wallpaper_verinfo_v2.php?callback=JSON_CALLBACK', {timeout: 3000})
                .success(
                        function (data) {
                            callback(data);
                        })
                .error(function () {

                    // オフラインモードに切り替え
                    var element = document.getElementById("wallpaper");
                    var $target_scope = angular.element(element).scope();
                    $target_scope.selectSpecialInfo();

                    if (tabbar.getActiveTabIndex() === 3) {
                        // ネットワーク状態（オンライン）チェック
                        if (navigator.connection.type !== 'none') {
                            // エラーダイアログ表示
                            navigator.notification.alert(
                                    '情報の取得に失敗しました。\n通信環境の良い場所で、ご利用ください。', // メッセージ
                                    function (et) {
                                        console.log(et);
                                        // プログレスバー消去
                                        // オーナーチェック
                                        if (owner === 3) {
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
                            if (owner === 3) {
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
                    console.log('アップデータチェック時にエラーが発生したので、タブバー操作ロックを解除した');
                });
    };

    return getWallpaperVersionSV;
};

// 壁紙のバージョンの取得サービス
app.factory('GetWallpaperVersionSV', ['$http', GetWallpaperVersionSV]);

/*
 * フレームSwipeイベント
 */

app.directive('frameWatch', function ($swipe) {
    return function (scope, element, attrs) {

        // フレームを切り替える
        var frameImg = (screen.width < 321 || (Number((screen.height / screen.width).toFixed(1)) === 1.3)) ? "img/special/origin_i4_frame.png" : "img/special/origin_i5_frame.png";
        scope.frameImg = frameImg;

        // タブレット表示対応
        if ((ua.indexOf('iPad') > 0) || ((ua.indexOf('Android') > 0) && (ua.indexOf('Mobile') === -1))) {
            // フレーム画像を縮小表示
            $('.carousel-back-frame-img').css({"width": "95%"});
            // カルーセルエリア（壁紙画像）を縮小表示
            $('.special-carousel-area').css({"zoom": "80%"});
            // 「壁紙を保存する」ボタンを縮小表示
            $('.special-download-img').css({"max-width": "47%"});
        }

        var x;

        $swipe.bind(
                element,
                {
                    start: function (coords) {
                        x = coords.x;
                    },
                    end: function (coords) {
                        // 終点のXよりもスタート地点のXの方が大きい場合はleft swipe
                        // スタート地点のXよりも終点のXの方が大きい場合はright swipe
                        if (x > coords.x) {
                            specialCarousel.next();

                        } else if (x < coords.x) {
                            specialCarousel.prev();

                        }
                    }
                }
        );

    };
});

/*
 * フレーム関連のサイズ変更（４：３タブレット対応）
 */

app.directive('ngFrame', function () {
    return function (scope, element, attrs) {
        if (Number((screen.height / screen.width).toFixed(1)) < 1.5) {
            $('.special-frame').css({"margin-left": "-15.5%"});
            $('.special-img-back-frame').css({"margin-right": "9%"});
        }
    };
});