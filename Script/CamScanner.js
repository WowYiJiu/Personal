/*
CamScanner unlocks pro, Cloud scanning is not available
Quantumult X:
^https:\/\/(api|api-cs)\.intsig\.net\/purchase\/cs\/query_property\? url script-response-body https://raw.githubusercontent.com/WowYiJiu/Personal/main/Script/CamScanner.js
hostname =  ap*.intsig.net
*/

let obj = JSON.parse($response.body);
obj = {"data":{"psnl_vip_property":{"expiry":"3061015303"}}};
$done({body: JSON.stringify(obj)});