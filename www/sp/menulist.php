<?
$mark = Array();
$idx = $_REQUEST['idx'];
if($idx =="")$idx=100;
$mark[$idx] = "<img src='/sp/img/tick-red.png'>";
?>

<!-- //contentsWrap -->
<form method="post" action ="/sp/search_gps.php" name="positionget">
<input type="hidden" name="lat">
<input type="hidden" name="lon">
</form>
<header>
<h1>メニュー</h1>
<p class="menuClose"><a onclick="slideDownMenu();" href="javascript:void(0)">閉じる</a></p>
</header>
<ul>
<li id='list_top' class="icon01"><a href="/sp/index.html"><?=$mark[0];?>トップページ</a></li>
<li id='list_cpn' class="icon01"><a href="/sp/coupon.php"><?=$mark[1];?>お得なクーポン</a></li>
<li id='list_mag' class="icon02"><a href="/sp/questionnaire.php"><?=$mark[3];?>メールマガジン登録</a></li>
<li id='list_tnp' class="icon03"><span>店舗を探す</span></li> 
<li id='list_gps' class="sublist"><a href="javascript:void(0);" class="arrow small" onClick="sendPosition();"><?=$mark[4];?>GPSで近くの店舗を探す</a></li>
<li id='list_adr' class="sublist"><a href="/sp/search_pref.html" class="arrow small"><?=$mark[5];?>住所から探す</a></li>
<li id='list_typ' class="sublist"><a href="/sp/search_kind.html" class="arrow small"><?=$mark[6];?>業態から探す(安楽亭以外)</a></li>
<li id='list_far' class="icon06"><span>フェア・キャンペーン</span></li> 

<li id='list_tp1' class="sublist"><a href="/sp/fair/20170301nikuniku" class="arrow small"><?=$mark[10];?>祝・３００００枚突破！２９２９クーポン期間延長！3月31日（金）まで！<br />
 （2017年3月1日）
</a></li>

<li id='list_tp1' class="sublist"><a href="/sp/fair/20170131grand" class="arrow small"><?=$mark[10];?>ワンコイン焼肉ランチ復活！焼肉もおつまみもドリンクも大幅値下げ！<br />【うれしい価格でおいしさ色々！メニューリニューアル！】<br />
 （2017年1月31日）
</a></li>

<li id='list_tp1' class="sublist"><a href="/sp/fair/20170131ichigo" class="arrow small"><?=$mark[10];?>香り豊かないちごで美味しいひと時を【フレッシュいちごフェア】<br />
 （2017年1月31日）
</a></li>

<li id='list_tp1' class="sublist"><a href="/sp/fair/20170117waiwa/" class="arrow small"><?=$mark[10];?>【冬のわいわい宝くじ】当選番号発表！<br />
 （2017年1月17日）
</a></li>

<li id='list_men' class="icon04"><span>おすすめメニュー</span></li> 
<li id='list_mn1' class="sublist"><a href="/sp/tabehoudai.php" class="arrow small"><?=$mark[21];?>食べ放題コース</a></li>
<li id='list_mn2' class="sublist"><a href="/sp/course.php" class="arrow small"><?=$mark[22];?>宴会コース</a></li>
<li id='list_saf' class="icon05"><span>安全、安心への確かな取り組み</span></li> 
<li id='list_sf1' class="sublist"><a href="/sp/1.html" class="arrow small"><?=$mark[31];?>1.本物主義の調達</a></li>
<li id='list_sf2' class="sublist"><a href="/sp/2.html" class="arrow small"><?=$mark[32];?>2.検査体制と情報開示</a></li>
<li id='list_sf3' class="sublist"><a href="/sp/3.html" class="arrow small"><?=$mark[33];?>3.サプライチェーンの構築</a></li>
<li id='list_sf4' class="sublist"><a href="/sp/4.html" class="arrow small"><?=$mark[34];?>4.手間をかけた伝統の味</a></li>
<li id='list_sf5' class="sublist"><a href="/sp/5.html" class="arrow small"><?=$mark[35];?>5.教育と人材育成</a></li>
<li id='list_con' class="icon05"><span>お客様の声</span></li> 
<li id='list_co1' class="sublist"><a href="https://k.anrakutei.jp/sp/contact/index.html" class="arrow small"><?=$mark[51];?>店舗に関するご意見・ご要望</a></li>
<li id='list_co2' class="sublist"><a href="https://k.anrakutei.jp/sp/contact/form_ot.html" class="arrow small"><?=$mark[52];?>その他のお問い合わせ</a></li>
<li id='list_saf' class="icon05"><span>その他</span></li> 
<li id='list_sf1' class="sublist"><a href="/sp/employ/title.html" class="arrow small"><?=$mark[41];?>採用情報</a></li>
<li id='list_sf1' class="sublist"><a href="http://k.anrakutei.jp/event/" class="arrow small"><?=$mark[42];?>過去のイベント・フェア情報</a></li>
<li id='list_sf2' class="sublist"><a href="/sp/policy.html" class="arrow small"><?=$mark[43];?>利用規約</a></li>
<li id='list_sf2' class="sublist"><a href="/sp/privacy.html" class="arrow small"><?=$mark[44];?>プライバシーポリシー</a></li>
<li id='list_sf2' class="sublist"><a href="http://www.anrakutei.co.jp" class="arrow small"><?=$mark[45];?>安楽亭PCサイトへ</a></li>
</ul>
