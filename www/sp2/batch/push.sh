#!/bin/sh

# プッシュ送信（GCM）
/usr/local/bin/php /usr/local/couponmail/bin/push_gcm.php

# プッシュ送信（APN）
/usr/local/bin/php /usr/local/couponmail/bin/push_apn.php

