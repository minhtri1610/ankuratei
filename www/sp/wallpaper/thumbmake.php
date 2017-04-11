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

	imagecopyresampled($canvas,  // �w�i�摜
                   $img,   // �R�s�[���摜
                   0,        // �w�i�摜�� x ���W
                   0,        // �w�i�摜�� y ���W
                   0,        // �R�s�[���� x ���W
                   0,        // �R�s�[���� y ���W
                   $width,   // �w�i�摜�̕�
                   $height,  // �w�i�摜�̍���
                   $orgwidth, // �R�s�[���摜�t�@�C���̕�
                   $orgheight  // �R�s�[���摜�t�@�C���̍���
                  );
        echo "write to $thumbdir/$filename\n";
	imagepng($canvas,"$thumbdir/$filename",9);
}
?>
