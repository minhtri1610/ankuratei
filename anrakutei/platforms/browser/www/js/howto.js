/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * 「アプリの使い方」ページのコントローラ
 * 
 * @param {type} $scope
 * @returns {undefined}
 */
howtoCtrl = function ($scope, $timeout) {

    // IOSスタイルを指定
    if (ons.platform.isIOS()) {
        $scope.iosStyle = "{'padding-top': '" + (10 + (1000 / scale)) + "px'}";
        $scope.iosRightStyle = "{'padding': '0px'}";
        $scope.iosCenterStyle = "{'margin-top': '-10px'}";
        $timeout(function () {
            // OSのステータスバー表示エリアの背景セット
            $('ons-page#howto').prepend('<div class="statusbar2" id="howto-status" style="zoom:' + (10000 / scale) + '%"></div>');
        }, 200);
    } else {
        $scope.iosStyle = "{}";
        $scope.iosRightStyle = "{}";
        $scope.iosCenterStyle = "{}";
    }

    $scope.isDetail = false;

    // 「×」ボタン押下処理
    $scope.pageClose = function () {
        // ページを閉じる
        myNavigator.popPage("howto.html");
    };

    // スクロール制御（jQuery版）※アニメーションあり
    $(document).ready(function () {
        // トップへ戻るボタンの要素を作成
        var e = document.getElementById('howto');
        var elemdiv = document.createElement('div');
        elemdiv.className = 'pagetop';
        elemdiv.innerHTML = "<a href='#top'><img ng-src='img/manual/btn_top136x106.png' src='img/manual/btn_top136x106.png'></a>";
        e.appendChild(elemdiv);

        var pagetop = $('.pagetop');
        // デフォルト表示状態で、起動時に消す（初期スクロール時の動作不正対応）
        pagetop.fadeOut();
        $('.page__content').scroll(function () {
            if ($(this).scrollTop() > 100) {
                pagetop.fadeIn();
            } else {
                pagetop.fadeOut();
            }
        });
        pagetop.click(function () {
            $('.page__content').animate({scrollTop: 0}, 500);
            return false;
        });
    });

    // 詳細表示
    $scope.showDetail = function () {
        $scope.isDetail = true;
    };
    // 詳細非表示
    $scope.hideDetail = function () {
        $scope.isDetail = false;
    };

    // デバイスのバックボタン押下イベント
    $scope.onDeviceBackButton = function ($event) {
        if ($event.callParentHandler) {
            // ページを閉じる
            $scope.pageClose();
        }
    };

};

app.controller('howtoCtrl', ['$scope', '$timeout', howtoCtrl]);
