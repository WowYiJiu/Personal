/*
CaiXinZhouKan Unlock (by WowYiJiu)
Quantumult X:
^http:\/\/ipadcms\.caixin\.com\/tmp\/articles url script-response-body https://raw.githubusercontent.com/WowYiJiu/Personal/main/Script/CXZK.js
hostname = ipadcms.caixin.com
*/

var body = $response.body; 
body = body.replace(/"isfree":0/g,'"isfree":1');
$done({body});

