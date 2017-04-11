#!/usr/local/bin/php
<?php
chdir("/usr/local/www/sp/");
$dir= "/usr/local/www/sp/wallpaper";
$dir_thumb= "/usr/local/www/sp/thumbnail";

$width = 116;

$d= opendir($dir);

while(($f= readdir($d))!== FALSE) {
	if(!file_exists("$dir_thumb/$f"))setimage($dir,$dir_thumb, $f,$width);
}

function setimage( $dir, $thumbdir, $filename,$width) {
	echo "$dir/$filename\n";
	$img= imagecreatefromstring(file_get_contents("$dir/$filename"));
	$size = getimagesize("$dir/$filename");
	print_r($size);
	$orgwidth = $size[0];
	$orgheight = $size[1];
	
	$height = floor($width * $orgheight / $orgwidth);
	$canvas = imagecreatetruecolor($width, $height);

	imagecopyresampled($canvas,  // 背景画像
                   $img,   // コピー元画像
                   0,        // 背景画像の x 座標
                   0,        // 背景画像の y 座標
                   0,        // コピー元の x 座標
                   0,        // コピー元の y 座標
                   $width,   // 背景画像の幅
                   $height,  // 背景画像の高さ
                   $orgwidth, // コピー元画像ファイルの幅
                   $orgheight  // コピー元画像ファイルの高さ
                  );
        echo "write to $thumbdir/$filename\n";
	imagepng($canvas,"$thumbdir/$filename",9);
}
?>
