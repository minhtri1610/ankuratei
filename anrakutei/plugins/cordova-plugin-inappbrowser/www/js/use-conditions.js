/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


UseConditions = function ($scope, $http, GetUserVersionSV) {

    // デフォルトをセット
    $scope.initContents = "<li>クーポン券のご利用は、新聞折込クーポン類と併せて、1回のご来店でお１人様２枚までとなります。</li><br>" +
            "<li>クーポン券１枚で表記のメニューが表記価格にて１品ご飲食できます。</li>" +
            "<br>" +
            "<li>クーポン券は、ご注文の際にお出しください。</li>" +
            "<br>" +
            "<li>生ビール、サワー・カクテル、ソフトドリンク割引券のみでのご飲食はご遠慮ください。</li>" +
            "<br>" +
            "<li>生ビール割引券、サワー・カクテル割引券は２０歳以上のお客様に限らせていただきます。</li>" +
            "<br>" +
            "<li>クーポン券は焼肉レストラン安楽亭の店舗で有効です。<br>" +
            "但し、下北あんらく亭、安楽亭　新浦安店、福島エリア各店、国産牛カルビ本舗　浦和大谷口店ではご利用いただけません。</li>" +
            "<br>" +
            "<li>店舗によってお取り扱いの無い商品がございます。詳しくはご利用の店舗に直接お問い合わせください。</li>" +
            "<br>" +
            "<li>価格の「税込」は、消費税加算後の小数点以下を切り上げ表記しているため、お会計金額と誤差が生じる可能性があります。予めご了承ください。</li>" +
            "<br>" +
            "<li>他の割引券、サービス券との併用はできません。</li>" +
            "<br>" +
            "<li>有効期限の無いものは、無効とさせて頂きます。</li>";

    // ご利用条件を読み込み
    $scope.loadContents = function (userVersion) {

        // サーバの情報があれば、その情報で上書き
        $http.get(serverUrl + 'sp2/couponcomment_json.php?callback=JSON_CALLBACK', {timeout: 60000})
                .success(
                        function (data) {

                            var contents = data[0].commentbody.replace(/(?:\r\n|\r|\n)/g, '<br>');
                            $scope.contents = contents;
                            localStorage.setItem('userVersion', userVersion);
                            localStorage.setItem('useContents', contents);
                            console.log('cpncommentの書き込み完了');

                        })
                .error(function (error) {

                    console.log(error);
                    console.log('エラーでデフォルトデータを使用');

                });
    };

    // 更新をチェックして、表示する
    $scope.checkChange = function () {

        // 前回の内容があれば、それをデフォルトとして利用
        $scope.contents = (localStorage.getItem('useContents') !== null) ? localStorage.getItem('useContents') : $scope.initContents;

        // バージョンチェック
        GetUserVersionSV.getVersion(function (data) {

            var userVersion = data[0].version;

            if (localStorage.getItem('userVersion') !== userVersion) {
                $scope.loadContents(userVersion);
            }

        });

    };

    // 更新をチェックして、表示する
    $scope.checkChange();
};

app.controller('UseConditions', ['$scope', '$http', 'GetUserVersionSV', UseConditions]);


// ご利用条件情報のバージョンを取得
GetUserVersionSV = function ($http) {

    var getUserVersionSV = {};

    getUserVersionSV.getVersion = function (callback) {

        // タイムアウトを3000に変更
        $http.get(serverUrl + 'sp2/get_use_conditions_verinfo.php?callback=JSON_CALLBACK', {timeout: 3000})
                .success(
                        function (data) {
                            callback(data);
                        })
                .error(function () {
                    if (tabbar.getActiveTabIndex() === 2) {
                        // ネットワーク状態（オンライン）チェック
                        if (navigator.connection.type !== 'none') {
                            // エラーダイアログ表示
                            navigator.notification.alert(
                                    '情報の取得に失敗しました。\n通信環境の良い場所で、ご利用ください。', // メッセージ
                                    function (et) {
                                        console.log(et);
                                    }, // コールバック
                                    '情報取得エラー', // タイトル
                                    'OK' // ボタン名
                                    );
                        }
                    }
                });
    };

    return getUserVersionSV;
};

// ご利用条件バージョン取得サービス
app.factory('GetUserVersionSV', ['$http', GetUserVersionSV]);


app.directive('ngTitle', function () {
    return function (scope, element, attrs) {
        // タブレット表示対応
        if ((ua.indexOf('iPad') > 0) || ((ua.indexOf('Android') > 0) && (ua.indexOf('Mobile') === -1))) {
            // タイトルを拡大表示
            $('.use-conditions-title-txt-content').css({"font-size": "34px"});
            // ご利用条件の文章を拡大表示
            $('.conditions-description-contents').css({"font-size": "18px"});
        }
    };
});
