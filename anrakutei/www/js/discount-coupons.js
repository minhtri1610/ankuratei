/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * クーポン表示関連処理
 * 
 */
CouponsCtrl = function ($scope, $timeout, $interval, GetCounponsInfoSV, GetVersionSV, GetNazoPeriodSV, RootService, ProgressSV) {

    // IOSスタイルを指定
    if (ons.platform.isIOS()) {
        $scope.iosStyle = "{'padding-top': '" + (10 + (1000 / scale)) + "px'}";
        $scope.iosLeftStyle = "{'padding': '0px'}";
        $scope.iosCenterStyle = "{'margin-top': '-10px'}";
        $timeout(function () {
            // OSのステータスバー表示エリアの背景セット
            $('ons-page#coupon').prepend('<div class="statusbar" id="coupon-status" style="zoom:' + (10000 / scale) + '%"></div>');
        }, 200);
    } else {
        $scope.iosStyle = "{}";
        $scope.iosLeftStyle = "{}";
        $scope.iosCenterStyle = "{}";
    }

    // 4：3端末のクーポン表示エリア対応
    if (Number((screen.height / screen.width).toFixed(1)) === 1.3) {

        // クーポン表示エリア
        $('.carousel-area').css({"height": "60.5%"});

    }

    // タブレット表示対応
    if ((ua.indexOf('iPad') > 0) || ((ua.indexOf('Android') > 0) && (ua.indexOf('Mobile') === -1))) {
        $('.use-conditions-contents').css({"font-size": "12px"});
        $('.bookmark-nazoBefor').css({"zoom": "80%"});
        $('.bookmark').css({"zoom": "80%"});
    }

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

    // 表示フラグ（データ件数が0件の場合は表示しない）
    $scope.NoData = false;
    $scope.netStatus = true;
    $scope.clickedDialog = false;
    $scope.clickedUse = false;

    // タイマーの初期化
    $scope.CouponTimer = null;

    // 画像ダウンロード関連変数初期化
    var countAlert = 0;

    // なぞポン画像の保存先
    couponsImagPath = (device.platform === 'Android') ? ("../" + couponsImagPath) : couponsImagPath;

    // ファイルパス
    $scope.nazoponLocalDir = rootDir + couponsImagPath;             // クーポン画面の画像保存先（ローカル）
    $scope.nazoponSrvlDir = serverUrl + "sp/img/";   // クーポン画面の画像保存先（サーバー）
    localStorage.setItem('nazoImgDir', $scope.nazoponLocalDir);     // なぞポン画像の保存先

    // 有効期限日付を取得
    $scope.getDate = function (sep) {

        // クーポン情報バージョンのセット
        var limitDate = $scope.limitDate;
        var year = limitDate.substr(0, 4);
        var month = limitDate.substr(4, 2);
        var date = limitDate.substr(6, 2);

        if (sep === '/') {

            return year + '/' + month + '/' + date;

        } else {

            return year + '-' + month + '-' + date;

        }
    };

    // ログ情報を取得
    RootService.log(3, -1);

    // タイムアウト、画像ダウンロード失敗した際の処理
    $scope.downloadFailure = function (fileTransfer) {

        // オフライン画面表示
        $scope.NoData = true;
        $scope.netStatus = false;

        // ダウンロード処理強制終了
        fileTransfer.abort();

        // ダウンロード件数初期化、ダウンロードステータス初期化
        localStorage.setItem('downloadCouponsNum', 0);
        localStorage.setItem('viewCouponStatus', false);

        // ネットワーク状態（オンライン）チェック
        if ((navigator.connection.type !== 'none') && (countAlert === 0)) {

            if (tabbar.getActiveTabIndex() === 2) {
                // エラーメッセージ表示
                navigator.notification.alert(
                        '情報の取得に失敗しました。\n通信環境の良い場所で、ご利用ください。', // メッセージ
                        function (et) {
                            console.log(et);
                            // プログレスバー消去
                            ProgressSV.hide(2);
                        }, // コールバック
                        '情報取得エラー', // タイトル
                        'OK' // ボタン名
                        );
            }

            countAlert = 1;

        } else if ((navigator.connection.type === 'none') && (countAlert === 0)) {

            // オナー指定のプログレスバー消去
            ProgressSV.hide(2);

            countAlert = 1;

        }

    };

    // クーポン画像のダウンロード
    $scope.downloadCoupons = function (img, fileTransfer, len) {

        // 端末のディレクトリパスが取得できていない場合があるので、ここで再セット
        if ($scope.nazoponLocalDir === "null" + couponsImagPath) {
            $scope.nazoponLocalDir = rootDir + couponsImagPath;
            localStorage.setItem('nazoImgDir', $scope.nazoponLocalDir);
        }

        // ダウンロードするURL
        var url = encodeURI($scope.nazoponSrvlDir + img);
        // 保存先ファイルパス
        var filePath = $scope.nazoponLocalDir + img;

        fileTransfer.download(url, filePath,
                function () {

                    // ダウンロード数を更新
                    var downloadNum = localStorage.getItem('downloadCouponsNum');
                    downloadNum++;
                    localStorage.setItem('downloadCouponsNum', downloadNum);

                    // ダウンロードが全て完了したら表示を行う。
                    if (Number(len) === Number(downloadNum)) {

                        // ダウンロードタイマー解除
                        $timeout.cancel($scope.CouponTimer);
                        $scope.CouponTimer = null;

                        $scope.$apply(function () {
                            // クーポンデータを抽出
                            $scope.selectCouponsInfo(true);
                        });
                    }
                },
                function (error) {
                    console.log('ダウンロードエラー' + error.code + 'で、サーバーのなぞポン画像を直接参照する');

                    // ダウンロードタイマー解除
                    $timeout.cancel($scope.CouponTimer);
                    $scope.CouponTimer = null;

                    // ダウンロード失敗
                    $scope.downloadFailure(fileTransfer);
                });

    };

    // クーポン画像ディレクトリ更新
    $scope.updateCouponsDir = function (imgArr) {

        // ディレクトリエントリーを取得
        resolveLocalFileSystemURL(rootDir + couponsImagPath, function (dirEntry) {
            // ディレクトリの再帰的削除
            dirEntry.removeRecursively(function () {
                // クーポン画像の削除
                $scope.downloadCouponsImg(imgArr);
            }, function (error) {
                console.log("クーポン画像の削除に失敗しました " + error.code);
                // クーポン画像の削除（削除処理に失敗しても処理続行）
                $scope.downloadCouponsImg(imgArr);
            });
        }, function (error) {
            console.log("なぞポンのディレクトリが存在しない条件で、なぞポン画像をダウンロード。コード：" + error.code);
            // クーポン画像の削除（指定ディレクトリが無い場合も処理を続行）
            $scope.downloadCouponsImg(imgArr);

        });
    };

    // クーポン画像をすべてダウンロード
    $scope.downloadCouponsImg = function (imgArr) {

        // ファイル転送オブジェクト（画像ダウンロード処理用）
        var fileTransfer = new FileTransfer();
        var len = imgArr.length;
        $scope.pageNum = len;

        // 画像ダウンロード関連変数リセット
        countAlert = 0;

        // クーポンの件数、ダウンロード件数、クーポン描画済み
        localStorage.setItem('couponsNum', len);
        localStorage.setItem('downloadCouponsNum', 0);
        localStorage.setItem('viewCouponStatus', false);

        // ダウンロードタイマーセット
        if ($scope.CouponTimer !== null) {
            // ダウンロードタイマー解除
            $timeout.cancel($scope.CouponTimer);
            $scope.CouponTimer = null;
        }

        // ダウンロードタイマー設定
        $scope.CouponTimer = $timeout(function () {
            $scope.downloadFailure(fileTransfer);
        }, 60000);  // タイムアウト：１分

        for (var i = 0; i < len; i++) {

            // ダウンロードに失敗した場合は、処理を抜ける。
            if (countAlert === 1) {
                return;
            }

            // 画像ダウンロード
            $scope.downloadCoupons(imgArr[i].imgname, fileTransfer, len);
        }

    };

    // クーポン画像のダウンロード進捗チェック
    $scope.checkDownloadStatus = function () {

        return (localStorage.getItem('couponsNum') !== null) &&
                (localStorage.getItem('downloadCouponsNum') !== null) &&
                (localStorage.getItem('serverError') === 'false') &&
                (localStorage.getItem('couponsNum') !== '0') &&
                (localStorage.getItem('couponsNum') === localStorage.getItem('downloadCouponsNum'));

    };

    // 初期処理
    $scope.initial = function () {

        // サーバー問い合わせエラーフラグ
        localStorage.setItem('serverError', false);

        // クーポン数、ブックマーク数、ブックマークインデックス初期化
        $scope.pageNum = 0;
        $scope.bookmarkPageNum = 0;
        $scope.markIndex = -100;

        // ブックマーク遷移ボタン
        $scope.selectRightHave = false;
        $scope.selectLeftHave = false;

        // ブックマーク表示できる最大件数
        $scope.maxBookmarkNum = 25;

        // ブックマークボタン表示フラグ
        $scope.bookmarkFlag = false;

        if (localStorage.getItem('couponIniFlg') === 'false' && $scope.checkDownloadStatus() === true) {

            // ブックマークIndexを記憶
            $scope.bookmarkArr = angular.fromJson(localStorage.getItem('bookmarkArr'));

            // ブックマーク数セット
            if ($scope.bookmarkArr === null) {
                $scope.bookmarkPageNum = 0;
            } else {
                $scope.bookmarkPageNum = $scope.bookmarkArr.length;
            }

            // ブックマークがある場合は、フックマーク遷移ボタンをアクティブにする
            if ($scope.bookmarkPageNum > 0) {
                $scope.selectRightHave = true;
                $scope.selectLeftHave = true;
            }

            $scope.nazoponStatus = localStorage.getItem('nazoponStatus');

            // 抽選後、なぞポンランクをセット
            if ($scope.nazoponStatus === 'nazoAfter') {
                $scope.nazoponStatusRank = localStorage.getItem('nazoponStatusRank');
            }

            // クーポンを表示
            $scope.selectCouponsInfo(false);

        } else {

            // プログレスバー表示
            ProgressSV.show(2, 'クーポン情報を読み込んでいます', tabbarHeight);
        }

        // アップデートチェックフラグをセット
        setEventExclusionTimer(3500);
        console.log('アップデータチェックを開始したので、タブバー操作をロックした');

        // クーポン情報バージョンのセット
        GetVersionSV.getVersion(function (data) {

            // クーポンバージョンをセット
            var serverVersion = data[0].version;
            var couponsVersion = serverVersion.split('-');
            $scope.limitDate = couponsVersion[0];

            // 有効期限日付を設定
            $scope.expirationDate = $scope.getDate('/');
            GetNazoPeriodSV.set($scope.expirationDate);

            // アプリ初期時、クーポン関連処理
            if (localStorage.getItem('couponIniFlg') === 'false' && $scope.checkDownloadStatus() === true) {

                var couponLocalDate = localStorage.getItem('couponLocalDate'),
                        couponNowDate = $scope.getDate('/');

                // 日が変わったら
                if (((new Date(couponLocalDate.replace(/-/g, '/'))) < (new Date(couponNowDate.replace(/-/g, '/')))) ||
                        (serverVersion !== localStorage.getItem('couponVersion'))) {

                    // プログレスバー表示
                    ProgressSV.show(2, 'クーポン情報を更新しています', tabbarHeight);

                    $timeout(function () {
                        // クーポン情報を更新
                        $scope.controllerUpdate(serverVersion);

                    }, 100);

                    // クーポンの日付を更新
                    localStorage.setItem('couponLocalDate', couponNowDate);

                }

            } else if (localStorage.getItem('couponIniFlg') === 'false' && $scope.checkDownloadStatus() === false) {

                // プログレスバータイトルを変更
                ProgressSV.setTitle(2, 'クーポン情報を更新しています');

                $timeout(function () {
                    // クーポン情報を更新
                    $scope.controllerUpdate(serverVersion);

                }, 100);

            } else {

                // ブックマークIndexを記憶
                $scope.bookmarkArr = new Array();

                // ブックマーク情報を記録する
                localStorage.setItem('bookmarkArr', angular.toJson($scope.bookmarkArr));

                // sdの初期設定
                localStorage.setItem('sd', 0);

                // なぞポンステータス設定
                localStorage.setItem('nazoponStatus', 'nazoBefore');

                // なぞポンクーポンバック画像表示用設定
                $scope.nazoponStatus = localStorage.getItem('nazoponStatus');

                if ($scope.netStatus === true) {

                    // クーポン情報更新日付をセット
                    localStorage.setItem('couponLocalDate', $scope.getDate('-'));

                    // クーポン情報バージョンのセット
                    localStorage.setItem('couponVersion', data[0].version);

                    // クーポンテーブル作成
                    $scope.makeTb();

                } else {

                    // プログレスバー消去
                    ProgressSV.hide(2);
                }

            }

            // アップデートチェックフラグを解除
            setEventExclusionTimer(300);
            console.log('アップデータチェックが完了したので、タブバー操作ロックを解除した');

        });
    };

    // クーポン画像を取得
    $scope.selectCouponsInfo = function (progressFlg) {

        // データベースが開いていなければ、開く
        if (goiken === null) {

            goiken = openDatabase('goiken', '0.1', '店舗情報', 2 * 1024 * 1024);

        }

        // 店舗情報DBから検索SQL文の作成
        var sql = "select *  from m_coupons order by viewid";

        // 検索
        goiken.transaction(
                function (tx) {
                    tx.executeSql(sql, [],
                            function (tx, rs) {

                                var result = rs.rows;
                                var data = new Array();
                                var len = result.length;
                                var imgName;

                                if (len === 0) {
                                    console.log("クーポンデータ：なし");
                                    $scope.NoData = true;
                                    $scope.netStatus = false;
                                    localStorage.setItem('couponsNum', "0");
                                    localStorage.setItem('viewCouponStatus', false);
                                    return;
                                } else {
                                    $scope.NoData = false;
                                }

                                console.log("クーポンデータ：" + len + "件");

                                // 端末のディレクトリパスが取得できていない場合があるので、ここで再セット
                                if ($scope.nazoponLocalDir === "null" + couponsImagPath) {
                                    $scope.nazoponLocalDir = rootDir + couponsImagPath;
                                    localStorage.setItem('nazoImgDir', $scope.nazoponLocalDir);
                                }

                                // 常にローカルの画像を参照
                                imgName = $scope.nazoponLocalDir;

                                // なぞポン画像のセット
                                $scope.nazoImgnm = result.item(0).imgname;
                                localStorage.setItem('nazoImgnm', $scope.nazoImgnm);
                                $scope.nazoImg = localStorage.getItem('nazoImgDir') + $scope.nazoImgnm;
                                localStorage.setItem('nazoImg', $scope.nazoImg);
                                $scope.nazoRank = result.item(0).nazoponrank;

                                // なぞポン抽選中のアプリ切断対応
                                if ($scope.nazoponStatusRank === null) {
                                    $scope.nazoponStatusRank = ($scope.nazoRank > 2) ? 'oshi' : 'getsp';
                                    localStorage.setItem('nazoponStatusRank', $scope.nazoponStatusRank);
                                }

                                for (var i = 1; i < len; i++) {

                                    // 表示データセット
                                    var info = {
                                        img: imgName + result.item(i).imgname
                                    };

                                    data.push(info);
                                    if (progressFlg === true) {
                                        ProgressSV.setProgress(2, i / len);
                                    }

                                }

                                // 画像数をセット
                                $scope.pageNum = len;
                                $scope.pageCount = Math.floor($scope.pageNum / $scope.maxBookmarkNum);
                                $scope.pageAmari = $scope.pageNum % $scope.maxBookmarkNum;

                                // クーポンページビュー用
                                var damidata = new Array();

                                for (var j = 0; j < $scope.maxBookmarkNum; j++) {

                                    // ページナビダミーデータをセット
                                    var dami = {
                                        img: 'dami'
                                    };

                                    damidata.push(dami);
                                }

                                $scope.fullCouponArr = damidata;

                                var damidataAmari = new Array();

                                for (var j = 0; j < $scope.pageAmari; j++) {

                                    // ページナビダミーデータをセット
                                    var dami = {
                                        img: 'dami'
                                    };

                                    damidataAmari.push(dami);
                                }

                                $scope.amariArr = damidataAmari;

                                // Viewにデータをバインド
                                $scope.couponsInfo = data;
                                $scope.$apply();

                                if (len > 0) {
                                    // sdのセット
                                    localStorage.setItem('sd', result.item(0).id);
                                }

                                if (localStorage.getItem('couponIniFlg') !== 'false') {

                                    // 初期解除
                                    localStorage.setItem('couponIniFlg', 'false');

                                }

                                // クーポン情報取得モーダルを閉じる
                                if (progressFlg === true) {
                                    ProgressSV.setProgress(2, 1.0);

                                    $timeout(function () {
                                        ProgressSV.hide(2);
                                    }, 1000);
                                }

                                // クーポン描画済み
                                localStorage.setItem('viewCouponStatus', true);

                            });
                });

    };

    // クーポンテーブル作成
    $scope.makeTb = function () {

        // データベースが開いていなければ、開く
        if (goiken === null) {

            goiken = openDatabase('goiken', '0.1', '店舗情報', 2 * 1024 * 1024);

        }

        //　テーブル作成SQL
        var createCounponTblSQL = "CREATE TABLE IF NOT EXISTS m_coupons(" +
                "viewid integer," + //sortkeyが重複していたため、削除
                "nazoponrank character varying(4) NOT NULL," +
                "cpnname character varying(50)," +
                "imgname character varying(50) NOT NULL unique," +
                "genka nymeric," +
                "tokka nymeric," +
                "id nymeric," +
                "md5 character varying(50))";

        // テーブル作成SQLの実行
        goiken.transaction(
                function (tx) {

                    tx.executeSql(createCounponTblSQL, [],
                            function () {

                                // クーポンデータをサーバーから取得
                                $scope.insertCounponsInfo();

                            },
                            function () {

                                console.log('m_coupons テーブル作成エラー.');
                                // プログレスバー消去
                                ProgressSV.hide(2);
                            }
                    );

                }
        );
    };

    // サーバーから取得したクーポン情報をテーブルに挿入
    $scope.insertCounponsInfo = function () {

        // sd取得
        var sd = localStorage.getItem('sd');
        var i = 0;

        var deleteSql = 'delete from m_coupons';

        // データベースが開いていなければ、開く
        if (goiken === null) {

            goiken = openDatabase('goiken', '0.1', '店舗情報', 2 * 1024 * 1024);

        }

        goiken.transaction(
                function (tx) {
                    tx.executeSql(deleteSql, [],
                            function () {
                                console.log('差分データをWebDBからの削除に成功');

                                GetCounponsInfoSV.getInfo(sd, function (data) {

                                    $scope.couponsData = data;
                                    $scope.downloadCouponsImg($scope.couponsData);

                                    Object.keys(data).forEach(function (key) {

                                        var sql = 'insert into m_coupons(viewid,nazoponrank,cpnname,imgname,genka,tokka,id,md5) values (' +
                                                '?,?,?,?,?,?,?,?)';

                                        var values = [
                                            i,
                                            data[key].nazoponrank,
                                            data[key].cpnname,
                                            data[key].imgname,
                                            data[key].genka,
                                            data[key].tokka,
                                            data[key].id,
                                            data[key].md5];

                                        i++;

                                        goiken.transaction(
                                                function (tx) {
                                                    tx.executeSql(sql,
                                                            values,
                                                            function () {
                                                            },
                                                            function () {

                                                                // プログレスバーがあれば、削除
                                                                ProgressSV.hide(2);

                                                            }
                                                    );
                                                });
                                    });
                                });
                            },
                            function () {

                                // オフライン画面表示
                                $scope.NoData = true;
                                $scope.netStatus = false;

                                // クーポン描画済み
                                localStorage.setItem('viewCouponStatus', false);
                                $scope.$apply();

                                // プログレスバーがあれば、削除
                                ProgressSV.hide(2);
                            });
                });

    };

    // バージョンアップ
    $scope.updateDb = function (id) {

        var deleteSql = 'delete from m_coupons';

        // データベースが開いていなければ、開く
        if (goiken === null) {

            goiken = openDatabase('goiken', '0.1', '店舗情報', 2 * 1024 * 1024);

        }

        goiken.transaction(
                function (tx) {
                    tx.executeSql(deleteSql, [],
                            function () {
                                console.log('差分データをWebDBからの削除に成功');

                                GetCounponsInfoSV.getInfo(id, function (data) {

                                    var i = 0;
                                    $scope.couponsData = data;
                                    $scope.updateCouponsDir($scope.couponsData);

                                    Object.keys(data).forEach(function (key) {

                                        var sql = 'insert into m_coupons(viewid,nazoponrank,cpnname,imgname,genka,tokka,id,md5) values (' +
                                                '?,?,?,?,?,?,?,?)';

                                        var values = [
                                            i,
                                            data[key].nazoponrank,
                                            data[key].cpnname,
                                            data[key].imgname,
                                            data[key].genka,
                                            data[key].tokka,
                                            data[key].id,
                                            data[key].md5];

                                        i++;

                                        goiken.transaction(
                                                function (tx) {
                                                    tx.executeSql(sql,
                                                            values,
                                                            function () {
                                                            },
                                                            function () {
                                                                $scope.NoData = true;
                                                                $scope.netStatus = false;
                                                                // クーポン描画済み
                                                                localStorage.setItem('viewCouponStatus', false);
                                                                $scope.$apply();

                                                                // プログレスバーがあれば、削除
                                                                ProgressSV.hide(2);

                                                            }
                                                    );
                                                });

                                    });

                                });
                            },
                            function () {
                                $scope.NoData = true;
                                $scope.netStatus = false;
                                // クーポン描画済み
                                localStorage.setItem('viewCouponStatus', false);
                                $scope.$apply();

                                // プログレスバーがあれば、削除
                                ProgressSV.hide(2);

                                console.log('差分データをWebDBから削除時にエラー');
                            });
                });

    };

    // バージョンアップ制御
    $scope.controllerUpdate = function (serverVersion) {

        // クーポンのバージョン番号を取得
        var sd = localStorage.getItem('sd');

        // なぞポンステータスリセット
        localStorage.setItem('nazoponStatus', 'nazoBefore');
        $scope.nazoponStatus = 'nazoBefore';
        $scope.nazoponStatusRank = 'blank';
        localStorage.setItem('nazoponStatusRank', 'blank');

        // ブックマークをクリア
        $scope.bookmarkArr = new Array();
        $scope.selectRightHave = false;
        $scope.selectLeftHave = false;
        $scope.bookmarkFlag = false;

        localStorage.setItem('bookmarkArr', angular.toJson($scope.bookmarkArr));

        $scope.updateDb(sd);

        // 最新バージョンをセット
        localStorage.setItem('couponVersion', serverVersion);
    };

    $scope.nazoponDialog = function () {

        // クリックイベントの排他解除タイマーセット
        $timeout(function () {
            eventExclusion = false;
            console.log("なぞポンダイアログ表示 排他解除");
        }, 1000);

        if ($scope.clickedDialog === true) {
            return;
        } else {
            $scope.clickedDialog = true;
        }

        // ダウンロードが完了していない場合は、なぞポン抽選も行わない。
        if ($scope.checkDownloadStatus() === false) {
            // エラーメッセージ表示
            navigator.notification.alert(
                    'クーポン情報の取得に失敗しました。\n通信環境の良い場所で「お得なクーポン」を開きなおしてください。', // メッセージ
                    function (et) {
                        console.log(et);
                    }, // コールバック
                    '情報取得エラー', // タイトル
                    'OK' // ボタン名
                    );
            // ダイアログの表示ロック解除
            $scope.clickedDialog = false;
            return;
        }

        $scope.dialogs = {};
        var dlg = 'nazopon.html';

        if (!$scope.dialogs[dlg]) {

            ons.createDialog(dlg).then(function (nazoponDialog) {

                $scope.dialogs[dlg] = nazoponDialog;

                $timeout(function () {

                    nazoponDialog.show({animation: "none"});

                    $scope.clickedDialog = false;
                }, 0);

            });
        } else {

            $timeout(function () {

                $scope.dialogs[dlg].show({animation: "none"});

                $scope.clickedDialog = false;
            }, 0);
        }
    };

    $scope.viewUseConditions = function () {

        // クリックイベントの排他解除タイマーセット
        $timeout(function () {
            eventExclusion = false;
            console.log("ご利用条件表示 排他解除");
        }, 500);

        if ($scope.clickedUse === true) {
            return;
        } else {
            $scope.clickedUse = true;
        }

        if (navigator.connection.type === 'none') {
            // エラーメッセージ表示
            navigator.notification.alert(
                    '通信ができない環境の可能性があります。\n本アプリケーションはインターネットから最新の情報を取得しているため、通信可能な環境でご利用ください。', // メッセージ
                    function (et) {
                        console.log(et);
                    }, // コールバック
                    '接続エラー', // タイトル
                    'OK' // ボタン名
                    );
            // ダイアログの表示ロック解除
            $scope.clickedUse = false;
            return;
        }

        $scope.dialogs = {};

        var dlg = 'use-conditions.html';

        if (!$scope.dialogs[dlg]) {

            ons.createDialog(dlg).then(function (useConditionsDialog) {

                $scope.dialogs[dlg] = useConditionsDialog;

                $timeout(function () {
                    useConditionsDialog.show({animation: "none"});
                    $scope.clickedUse = false;
                }, 0);

            });
        } else {

            $timeout(function () {

                $scope.dialogs[dlg].show({animation: "none"});
                $scope.clickedUse = false;
            }, 0);
        }
    };

    $scope.compareIndex = function (a, b) {

        return a - b;

    };

    $scope.bookmarkStack = function (index) {

        if (!($scope.bookmarkArr.indexOf(index) > -1)) {

            $scope.bookmarkArr.push(index);
            $scope.bookmarkFlag = true;

        } else {

            $scope.bookmarkArr.splice($scope.bookmarkArr.indexOf(index), 1);
            $scope.bookmarkFlag = false;

        }

        // インデックスのソート
        $scope.bookmarkArr.sort($scope.compareIndex);

        // ブックマーク情報を記録する
        localStorage.setItem('bookmarkArr', angular.toJson($scope.bookmarkArr));
    };

    $scope.togle = function () {

        $scope.markIndex = carousel.getActiveCarouselItemIndex() - 1;

        // ブックマーク位置ずれ対応
        carousel.setActiveCarouselItemIndex($scope.markIndex + 1);

        $scope.bookmarkStack($scope.markIndex);
        $scope.bookmarkPageNum = $scope.bookmarkArr.length;

        // クーポン範囲チェック
        if (($scope.markIndex) > ($scope.pageNum - 2)) {
            return;
        }

        // 右クーポンフラグの初期化
        if ($scope.bookmarkPageNum > 0) {

            $scope.selectRightHave = true;
            $scope.selectLeftHave = true;

        } else {

            $scope.selectRightHave = false;
            $scope.selectLeftHave = false;

        }

    };

    // ブックマークナビ　左へ
    $scope.toBefore = function () {

        $scope.nowIndex = carousel.getActiveCarouselItemIndex() - 1;
        console.log('now Index:' + carousel.getActiveCarouselItemIndex() + ' ページ総数:' + $scope.pageNum);
        var len = $scope.bookmarkArr.length;
        var maxDiff = -10000;

        console.log('now Index:' + ($scope.nowIndex + 1) + ' ブックマークページの最後:' + ($scope.bookmarkArr[0] + 1));
        if (($scope.nowIndex + 1) <= ($scope.bookmarkArr[0] + 1)) {
            carousel.setActiveCarouselItemIndex($scope.bookmarkArr[len - 1] + 1);
            return;
        }

        if ($scope.nowIndex > -2) {

            for (var i = 0; i < len; i++) {

                var diff = $scope.bookmarkArr[i] - $scope.nowIndex;

                if (diff < 0 && diff > maxDiff) {
                    maxDiff = diff;
                }

            }

            if (maxDiff !== -10000) {

                carousel.setActiveCarouselItemIndex(maxDiff + $scope.nowIndex + 1);

            }
        }
    };

    // ブックマークナビ　右へ
    $scope.toAfter = function () {

        $scope.nowIndex = carousel.getActiveCarouselItemIndex() - 1;

        var len = $scope.bookmarkArr.length;
        var minDiff = $scope.bookmarkArr[len - 1] + 1;

        if (($scope.nowIndex + 1) >= minDiff) {
            carousel.setActiveCarouselItemIndex($scope.bookmarkArr[0] + 1);
            return;
        }

        for (var i = 0; i < len; i++) {

            var diff = $scope.bookmarkArr[i] - $scope.nowIndex;

            if (diff > 0 && diff < minDiff) {

                minDiff = diff;

            }
        }

        if (minDiff !== 10000) {

            carousel.setActiveCarouselItemIndex(minDiff + $scope.nowIndex + 1);

        }
    };

    // オンラインなら、初期化をスタート
    if (navigator.connection.type !== 'none') {
        $scope.netStatus = true;
        $scope.initial();
    } else {
        $scope.netStatus = false;
    }

    // カルーセルの要素が変更した場合、それをビューに反映
    ons.ready(function () {
        // カルーセルオブジェクトを取得
        document.addEventListener('ons-carousel:init', function (e) {
            // カルーセルの変化イベント
            carousel.on('postchange', function (event) {

                var newActiveIndex = event.activeIndex - 1;

                $scope.nowPage = Math.floor((event.activeIndex) / $scope.maxBookmarkNum) * $scope.maxBookmarkNum;

                // ブックマークのアイコンを切り替え
                if ($scope.bookmarkArr.indexOf(newActiveIndex) > -1) {
                    $scope.bookmarkFlag = true;
                } else {
                    $scope.bookmarkFlag = false;
                }

                // 余白に遷移した場合、１つ前に戻す
                if ((event.activeIndex + 1) > $scope.pageNum) {
                    carousel.setActiveCarouselItemIndex(event.activeIndex - 1);
                }

            });
        });
    });

    // 30分ごとに、クーポンテーブル情報更新
    $interval(function () {

        // アップデートチェックフラグをセット
        eventExclusion = true;
        setEventExclusionTimer(3500);
        console.log('30分のアップデータチェックを開始したので、タブバー操作をロックした');

        GetVersionSV.getVersion(function (data) {

            // サーバーのクーポンバージョン
            var serverVersion = data[0].version;

            // ローカルのクーポンバージョン
            var localVersion = localStorage.getItem('couponVersion');

            if (serverVersion !== localVersion) {

                // プログレスバー表示
                ProgressSV.show(2, 'クーポン情報を更新しています', tabbarHeight);

                // クーポン情報の更新を行う
                $scope.controllerUpdate(serverVersion);

                // 有効期限日付を更新
                var couponsVersion = serverVersion.split('-');
                $scope.limitDate = couponsVersion[0];
                $scope.expirationDate = $scope.getDate('/');
                GetNazoPeriodSV.set($scope.expirationDate);

                // クーポンの日付を更新
                localStorage.setItem('couponLocalDate', $scope.expirationDate);
            }

            // アップデートチェックフラグを解除
            eventExclusion = false;
            clearEventExclusionTimer();
            console.log('アップデータチェックが完了したので、タブバー操作ロックを解除した');
        });

    }, 1800000); // 30分　1800000

};

// なぞポン関連処理
NazoponCtrl = function ($scope, $interval, $timeout, GetNazoPeriodSV) {

    $scope.nazogif = 'img/coupons/coupon_nazopon_anim_GetSp.png';
    $scope.challengeStatus = 0; //0:チャレンジ前、1:チャレンジ時、2:チャレンジ後
    $scope.period = GetNazoPeriodSV.get();
    $scope.isEnabled = false;

    // 「お得なクーポン」画面を再描画
    var element = document.getElementById("coupon");
    var $target_scope = angular.element(element).scope();

    $scope.nazoRank = ($target_scope.nazoRank > 2) ? 'oshi' : 'getsp';

    // なぞポン画像取得
    $scope.getNazoImg = function () {

        localStorage.setItem('nazoponStatusRank', $scope.nazoRank);

        // なぞぽん画像をセット
        $scope.nazoponImgUrl = $target_scope.nazoImg;
        $target_scope.nazoponStatus = 'nazoAfter';
        $target_scope.nazoponStatusRank = $scope.nazoRank;

        // 抽選後 
        $target_scope.selectCouponsInfo(true);

    };

    // オフライン
    document.addEventListener("offline", function () {

        // ダイアログ閉じる
        nazoponDialog.destroy();

    }, false);

    // チャレンジ前
    $scope.challengeBefore = $interval(function () {

        if ($scope.nazogif === 'img/coupons/coupon_nazopon_anim_GetSp.png') {

            $scope.nazogif = 'img/coupons/coupon_nazopon_anim_GetOshii.png';

        } else {

            $scope.nazogif = 'img/coupons/coupon_nazopon_anim_GetSp.png';

        }

    }, 1000);

    // なぞポンチャレンジ
    $scope.challenge = function () {

        // 排他チェック
        if (eventExclusion === true) {
            console.log("なぞポンチャレンジ 排他中");
            return;
        } else {
            eventExclusion = true;
            // クリックイベントの排他解除タイマーセット
            $timeout(function () {
                eventExclusion = false;
                console.log("なぞポンチャレンジ 排他解除");
            }, 500);
        }

        $scope.challengeStatus = 1;
        $interval.cancel($scope.challengeBefore);

        // なぞポンステータス変更
        localStorage.setItem('nazoponStatus', 'nazoAfter');

        $scope.stop = $interval(function () {

            if ($scope.nazogif === 'img/coupons/coupon_nazopon_anim_GetSp.png') {
                $scope.nazogif = 'img/coupons/coupon_nazopon_anim_GetOshii.png';
            } else {
                $scope.nazogif = 'img/coupons/coupon_nazopon_anim_GetSp.png';
            }

        }, 120);

        $timeout(function () {

            $interval.cancel($scope.stop);
            $scope.getNazoImg();
            $scope.challengeStatus = 2;

        }, 1440);

    };

    // なぞポン抽選画面の閉じる
    $scope.onClose = function () {

        // チャレンジ中はダイアログを閉じない
        if ($scope.challengeStatus === 1) {
            return;
        }

        // ダイアログ閉じる
        nazoponDialog.destroy();
    };

};

app.controller('NazoponCtrl', ['$scope', '$interval', '$timeout', 'GetNazoPeriodSV', NazoponCtrl]);
app.controller('CouponsCtrl', ['$scope', '$timeout', '$interval', 'GetCounponsInfoSV', 'GetVersionSV', 'GetNazoPeriodSV', 'RootService', 'ProgressSV', CouponsCtrl]);


// クーポン情報をサーバーから取得
GetCounponsInfoSV = function ($http) {

    var getCounponsInfoSV = {};

    getCounponsInfoSV.getInfo = function (sd, callback) {

        $http.get(serverUrl + 'sp2/get_coupon_json.php?sd=' + sd + '&callback=JSON_CALLBACK', {timeout: 60000})
                .success(
                        function (data) {
                            callback(data);
                        })
                .error(
                        function () {

                            // 「お得なクーポン」画面を再描画
                            var element = document.getElementById("coupon");
                            var $target_scope = angular.element(element).scope();
                            $target_scope.NoData = true;
                            $target_scope.netStatus = false;

                            // クーポン描画済み
                            localStorage.setItem('viewCouponStatus', false);
                            // サーバー問い合わせエラーフラグ
                            localStorage.setItem('serverError', true);
                            // クーポン数に"0"をセット
                            localStorage.setItem('couponsNum', "0");

                            if (tabbar.getActiveTabIndex() === 2) {
                                // ネットワーク状態（オンライン）チェック
                                if (navigator.connection.type !== 'none') {
                                    // エラーダイアログ表示
                                    navigator.notification.alert(
                                            '情報の取得に失敗しました。\n通信環境の良い場所で、ご利用ください。', // メッセージ
                                            function (et) {
                                                console.log(et);
                                                // プログレスバーを消去
                                                // オーナーチェック
                                                if (owner === 2) {
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
                                    if (owner === 2) {
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

    return getCounponsInfoSV;

};

// 最新クーポン情報のバージョンを取得
GetVersionSV = function ($http) {

    var getVersionSV = {};

    getVersionSV.getVersion = function (callback) {

        // バージョンをチェックするタイムアウト時間を3000に変更
        $http.get(serverUrl + 'sp2/get_coupon_verinfo.php?callback=JSON_CALLBACK', {timeout: 3000})
                .success(
                        function (data) {
                            callback(data);
                        })
                .error(
                        function () {

                            // 「お得なクーポン」画面を再描画
                            var element = document.getElementById("coupon");
                            var $target_scope = angular.element(element).scope();
                            $target_scope.NoData = true;
                            $target_scope.netStatus = false;
                            // クーポン描画済み
                            localStorage.setItem('viewCouponStatus', false);
                            // サーバー問い合わせエラーフラグ
                            localStorage.setItem('serverError', true);

                            // アップデートチェックフラグを解除
                            setEventExclusionTimer(300);
                            console.log('アップデータチェック時にエラーが発生したので、タブバー操作ロックを解除した');
                        });

    };

    return getVersionSV;
};

// なぞ期限共有
GetNazoPeriodSV = function () {

    var getNazoPeriodSV = {};

    getNazoPeriodSV = {
        set: function (data) {
            getNazoPeriodSV.data = data;
        },
        get: function () {
            return getNazoPeriodSV.data;
        }
    };

    return getNazoPeriodSV;

};

app.factory('GetNazoPeriodSV', GetNazoPeriodSV);
app.factory('GetVersionSV', ['$http', GetVersionSV]);
app.factory('GetCounponsInfoSV', ['$http', GetCounponsInfoSV]);

app.directive('backImg', function () {
    return function (scope, element, attrs) {

        // クーポン表示エリア計算
        var width = screen.width * 0.8;
        // Android 4.3未満は、dpの変換を行う
        var devVer = device.version;
        if (devVer.match(/^4.[0-2].*/)) {
            width = width / (window.screen.width / window.innerWidth);
        }
        // タブレットの場合、画面拡大した分、縮小する
        var ua = navigator.userAgent;
        if ((ua.indexOf('iPad') > 0) || ((ua.indexOf('Android') > 0) && (ua.indexOf('Mobile') === -1))) {
            width = width / (scale / 100);
        }
        var height = (width * 728) / 1104;

        if (Number((screen.height / screen.width).toFixed(1)) < 1.5) {
            $('.coupon-label').css({"margin-top": "-5%"});
        }

        // クーポン表示エリアCSS設定
        angular.element(element[0]).css({
            "zoom": "91.5%",
            "width": width + "px",
            "height": height + "px"
        });
    };
});

app.directive('fitCoupon', function () {
    return function (scope, element, attrs) {

        // クーポン画像
        var url = attrs.fitCoupon;

        // クーポン画像表示CSS
        angular.element(element[0]).css({
            "background-image": "url(" + url + ")"
        });

    };
});

app.directive('fitNazocoupon', function () {
    return function (scope, element, attrs) {

        // クーポン画像
        var url;

        if (ons.platform.isIOS()) {
            url = localStorage.getItem('nazoImgDir') + localStorage.getItem('nazoImgnm');
        } else {
            url = localStorage.getItem('nazoImg');
        }

        // クーポン画像表示CSS
        angular.element(element[0]).css({
            "background-image": "url(" + url + ")"
        });
    };
});

app.directive('afterImg', function () {
    return function (scope, element, attrs) {

        var width = screen.width * 0.8;
        // Android 4.3未満は、dpの変換を行う
        var devVer = device.version;
        if (devVer.match(/^4.[0-2].*/)) {
            width = width / (window.screen.width / window.innerWidth);
        }
        // タブレットの場合、画面拡大した分、縮小する
        var ua = navigator.userAgent;
        if ((ua.indexOf('iPad') > 0) || ((ua.indexOf('Android') > 0) && (ua.indexOf('Mobile') === -1))) {
            width = width / (scale / 100);
        }
        var height = (width * 728) / 1104;

        if ((Number((screen.height / screen.width).toFixed(1)) < 1.5) && (window.devicePixelRatio === 1)) {
            angular.element(element[0]).css({"top": "53.8%"});
        } else if ((Number((screen.height / screen.width).toFixed(1)) < 1.5) || ((Number((screen.height / screen.width).toFixed(1)) === 1.5) && (window.devicePixelRatio === 1))) {
            angular.element(element[0]).css({"top": "54.6%"});
        }

        angular.element(element[0]).css({
            "zoom": "91.5%",
            "width": width + "px",
            "height": height + "px"
        });
    };
});

app.directive('fitNazopon', function () {
    return function (scope, element, attrs) {

        // クーポン画像
        var url;

        if (ons.platform.isIOS()) {
            url = localStorage.getItem('nazoImgDir') + localStorage.getItem('nazoImgnm');
        } else {
            url = localStorage.getItem('nazoImg');
        }

        // クーポン画像表示CSS
        angular.element(element[0]).css({
            "background-image": "url(" + url + ")"
        });
    };
});

app.directive('getNazoimg', function ($timeout) {
    return function (scope, element, attrs) {

        var width = screen.width * 0.8;
        // Android 4.3未満は、dpの変換を行う
        var devVer = device.version;
        if (devVer.match(/^4.[0-2].*/)) {
            width = width / (window.screen.width / window.innerWidth);
        }
        // タブレットの場合、画面拡大した分、縮小する
        var ua = navigator.userAgent;
        if ((ua.indexOf('iPad') > 0) || ((ua.indexOf('Android') > 0) && (ua.indexOf('Mobile') === -1))) {
            width = width / (scale / 100);
        }
        var height = (width * 728) / 1104;

        var bkDom = (attrs.getNazoimg === 'oshi') ? '.nazopon-result-bk-oshi' : '.nazopon-result-bk-getsp';
        $(bkDom).css({
            "width": "0px",
            "height": "0px",
            "scale": "0,0"
        });

        $timeout(function () {
            $(bkDom).animate({"width": "100%",
                "height": "100%",
                "scale": "1, 1"},
            {queue: false, duration: 0});
        }, 0);

        // クーポン表示エリアCSS設定
        angular.element(element[0]).css({
            "zoom": "91.5%",
            "width": width + "px",
            "height": height + "px"
        });
    };
});

app.directive('ngNazoponclick', function () {
    return function (scope, element, attrs) {
        element.on('click', function (event) {

            // 排他チェック
            if (eventExclusion === true) {
                console.log("なぞポンダイアログ表示 排他中");
            } else {
                eventExclusion = true;
                scope.nazoponDialog();
            }

        });
    };
});

app.directive('ngUseclick', function () {
    return function (scope, element, attrs) {
        element.on('click', function (event) {

            // 排他チェック
            if (eventExclusion === true) {
                console.log("ご利用条件表示 排他中");
            } else {
                eventExclusion = true;
                scope.viewUseConditions();
            }

        });
    };
});

app.directive('ngtop', function () {
    return function (scope, element, attrs) {
        var width = screen.width;
        var height = screen.height;

        if (ons.platform.isAndroid()) {
            if (Number((height / width).toFixed(1)) === 1.8) {
                angular.element(element[0]).css('top', '46.5%');
            } else if ((Number((height / width).toFixed(1)) === 1.5) && (window.devicePixelRatio === 2)) {
                angular.element(element[0]).css('top', '46.5%');
            } else if ((Number((height / width).toFixed(1)) === 1.5) && (window.devicePixelRatio !== 1.5) && (window.devicePixelRatio !== 2)) {
                angular.element(element[0]).css('top', '45.8%');
            } else if ((Number((height / width).toFixed(1)) === 1.5) && (window.devicePixelRatio === 1.5)) {
                angular.element(element[0]).css('top', '46.5%');
            } else if (Number((height / width).toFixed(1)) === 1.6) {
                angular.element(element[0]).css('top', '46.5%');
            } else if (Number((height / width).toFixed(1)) === 1.4) {
                angular.element(element[0]).css('top', '45.05%');
            } else if (Number((height / width).toFixed(1)) === 1.3) {
                angular.element(element[0]).css('top', '45.473%');
                $('.coupon-label').css({"margin-top": "-5%"});
            } else if ((Number((height / width).toFixed(1)) === 0.6) && (window.devicePixelRatio === 1)) {
                angular.element(element[0]).css('top', '46.5%');
            } else {
                angular.element(element[0]).css('top', '45.75%');
            }
        } else { // IOS用
            if (Number((height / width).toFixed(1)) === 1.8 && (window.devicePixelRatio === 2)) {
                angular.element(element[0]).css('top', '46.6%');
            } else if (Number((height / width).toFixed(1)) === 1.8 && (window.devicePixelRatio === 3)) {
                angular.element(element[0]).css('top', '46.65%');
            } else if (Number((height / width).toFixed(1)) === 1.5) {
                angular.element(element[0]).css('top', '45.8%');
            } else if ((device.model === "iPad6,7") || (device.model === "iPad6,8")) {
                // iPad Pro (12.9 inch)対応
                angular.element(element[0]).css('top', '45.8%');
            } else if (Number((height / width).toFixed(1)) === 1.3) {
                // iPad対応
                angular.element(element[0]).css('top', '45.5%');
            } else {
                angular.element(element[0]).css('top', '46.6%');
            }

        }
    };
});

app.directive('ngCoverposition', function () {
    return function (scope, element, attrs) {
        if ((Number((screen.height / screen.width).toFixed(1)) < 1.5) && (window.devicePixelRatio === 1)) {
            angular.element(element[0]).css({"top": "15%"});
        } else if ((Number((screen.height / screen.width).toFixed(1)) < 1.5) || ((Number((screen.height / screen.width).toFixed(1)) === 1.5) && (window.devicePixelRatio === 1))) {
            angular.element(element[0]).css({"top": "5%"});
        } else if ((ons.platform.isIOS() === true) && (Number((screen.height / screen.width).toFixed(1)) === 1.5) && (window.devicePixelRatio === 2)) {
            // iPhone4s対応
            angular.element(element[0]).css({"top": "5%"});
        }
    };
});

// タブレット対応のため、なぞポンの説明文フォントサイズを変更
app.directive('ngNazopondes', function () {
    return function (scope, element, attrs) {
        // タブレット対応
        if ((ua.indexOf('iPad') > 0) || ((ua.indexOf('Android') > 0) && (ua.indexOf('Mobile') === -1))) {
            angular.element(element[0]).css({'fontSize': '20px'});
        }
    };
});

// タブレット対応のため、「チャレンジ」ボタンサイズを変更
app.directive('ngChallengbutton', function () {
    return function (scope, element, attrs) {
        // タブレット対応
        if ((ua.indexOf('iPad') > 0) || ((ua.indexOf('Android') > 0) && (ua.indexOf('Mobile') === -1))) {
            angular.element(element[0]).css({'max-width': '47%'});
        }
    };
});

app.directive('ngLabel', function () {
    return function (scope, element, attrs) {
        // タブレット表示対応
        if ((ua.indexOf('iPad') > 0) || ((ua.indexOf('Android') > 0) && (ua.indexOf('Mobile') === -1))) {
            // 有効期限表示を拡大表示
            $('.coupon-label').css({"zoom": "120%"});
        }
    };
});
