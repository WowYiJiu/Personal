/*
脚本名称：腾讯体育签到脚本
脚本说明：本脚本仅适用于腾讯体育每日签到，仅测试QuantumultX
环境变量：txSports
脚本作者：WowYiJiu
更新时间：2024-2-14
脚本来源：https://github.com/WowYiJiu/Personal
====================================================================================================
获取Cookie说明：
进入腾讯体育app，点击右下角我的，点击头像下的VIP信息进入体育VIP会员中心即可获取
获取Cookie后, 请将Cookie脚本禁用并移除主机名，以免产生不必要的MITM.

配置 (QuanX)
[MITM]
video.qq.com

[rewrite_local]
^https:\/\/video\.qq\.com\/cookie\/1.0.0\/cookie\.html? url script-request-header https://raw.githubusercontent.com/WowYiJiu/Personal/main/Script/txSports.js

[task_local]
10 7 * * * https://raw.githubusercontent.com/WowYiJiu/Personal/main/Script/txSports.js, tag=腾讯体育, img-url=https://raw.githubusercontent.com/WowYiJiu/Personal/main/icon/txSports.png, enabled=true
====================================================================================================
*/
const $ = new Env('腾讯体育');

let txSportsCookie = $.getdata('txSports');
let checkInMsg = '', message = '';
let disCookie = false, isCheck = false;

if (isGetCookie = typeof $request !== `undefined`) {
  getCookie();
  $.done();
} else {
  !(async () => {
    if (txSportsCookie) {
        console.log('===== 开始【腾讯体育任务】 =====');
                await checkIn();
                if(disCookie){                    
                    await showMsg();
                } else {
                    await getTicket();
                    await lottery();
                    await vipScore();
                    await showMsg();
                }
    } else {
        $.msg($.name, '【提示】请先获取腾讯体育Cookie', '');
    }
})()
  .catch((e) => $.logErr(e))
  .finally(() => $.done())
}

// 签到获取热爱值
function checkIn() {
    return new Promise((resolve, reject) => {
        let opt = {
            url: 'https://vip.video.qq.com/rpc/trpc.new_task_system.task_system.TaskSystem/CheckIn?rpc_data=%7B%22task_id%22:8006%7D',
            headers: {
                'Host': 'vip.video.qq.com',
                'Sec-Fetch-Site': 'same-site',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Sec-Fetch-Mode': 'cors',
                'Accept': 'application/json, text/plain, */*',
                'Origin': 'https://film.video.qq.com',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;QQSportsV3/com.tencent.sportskbs/7.4.45.103 (iPhone(iPhone14,2); iOS 17.3; Scale/3.00) TenvideoUnion/1.4.5',
                'Connection': 'keep-alive',
                'Referer': 'https://film.video.qq.com/x/sports-grade/?ovscroll=0&hidetitlebar=1&immersive=1',
                'Cookie': txSportsCookie,
                'Sec-Fetch-Dest': 'empty'
    
            }
        }
        $.get(opt, async (error, resp, data) => {       
                if(typeof data === 'undefined' ? true : data.length === 0){
                    disCookie = true;
                    $.log(`签到失败：Cookie失效, 已清除\n请重新获取Cookie`);
                    checkInMsg = `签到失败：Cookie失效，已清除\n请重新获取Cookie`;
                    $.setdata('', 'txSports');
                } else {
                    var obj = JSON.parse(data);
                    var code = obj.ret;
                    if (code === 0 && obj.check_in_score != undefined) {
                        $.log(`签到成功：获得${obj.check_in_score}热爱值`);
                        checkInMsg = `签到成功：获得${obj.check_in_score}热爱值`;
                    }  else if (code === -2002) {
                        $.log(`签到失败：重复签到`);
                        checkInMsg = `签到失败：重复签到`;
                    } else {
                        $.log(`签到失败：未知错误请查看日志或手动签到!!!\n${obj}`);
                        checkInMsg = `签到失败：未知错误请查看日志或手动签到!!!\n${obj}`;
                    }
                }
                resolve();
            }        
        )
    })
}

// 签到领球票
function getTicket() {
    return new Promise((resolve, reject) => {
        let opt = {
            url: 'https://activity.video.qq.com/fcgi-bin/asyn_activity?otype=xjson&act_id=118561&module_id=158089&type=90&option=5',
            headers: {
                'Host': 'activity.video.qq.com',
                'Sec-Fetch-Site': 'same-site',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Sec-Fetch-Mode': 'cors',
                'Accept': 'application/json, text/plain, */*',
                'Origin': 'https://film.video.qq.com',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;QQSportsV3/com.tencent.sportskbs/7.4.45.103 (iPhone(iPhone14,2); iOS 17.3; Scale/3.00) TenvideoUnion/1.4.5',
                'Connection': 'keep-alive',
                'Referer': 'https://film.video.qq.com/x/sports-vip-channel/?from=tab',
                'Cookie': txSportsCookie,
                'Sec-Fetch-Dest': 'empty'
    
            }
        }
        $.get(opt, async (error, resp, data) => {       
                var obj = JSON.parse(data);
                var code = obj.ret;
                if (code === 0) {
                    $.log(`领取每日球票成功, 连续签到${obj.data.day}天`);
                    message += `领取每日球票成功, 连续签到${obj.data.day}天\n`;             
                }  else if (code === -2021) {
                    $.log(`领取每日球票失败：重复领取`);
                    message += `领取每日球票失败：重复领取\n`;
                } else {
                    $.log(`领取每日球票失败：未知错误请查看日志或手动签到!!!\n${obj}`);
                    message += `领取每日球票失败：未知错误请查看日志或手动签到!!!\n${obj}\n`;
                }    
                resolve();
            }        
        )
    })
}

// 抽抽乐 2024年2月29日10点下线
function lottery() {
    return new Promise((resolve, reject) => {
        let opt = {
            url: 'https://activity.video.qq.com/fcgi-bin/asyn_activity?otype=xjson&act_id=118561&module_id=158090&type=100143&option=100',
            headers: {
                'Host': 'activity.video.qq.com',
                'Sec-Fetch-Site': 'same-site',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Sec-Fetch-Mode': 'cors',
                'Accept': 'application/json, text/plain, */*',
                'Origin': 'https://film.video.qq.com',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;QQSportsV3/com.tencent.sportskbs/7.4.45.103 (iPhone(iPhone14,2); iOS 17.3; Scale/3.00) TenvideoUnion/1.4.5',
                'Connection': 'keep-alive',
                'Referer': 'https://film.video.qq.com/x/sports-vip-channel/?from=tab',
                'Cookie': txSportsCookie,
                'Sec-Fetch-Dest': 'empty'
            }
        }
        $.get(opt, async (error, resp, data) => {       
                var obj = JSON.parse(data);
                var code = obj.ret;
                if (code === 0) {
                $.log(`抽奖成功: ${obj.lotter_ext}`);
                message += `抽奖成功: ${obj.lotter_ext}\n`;
                }  else if (code === -904) {
                $.log(`抽奖失败：您已经抽过了`);
                message += `抽奖失败：您已经抽过了\n`;
                } else {
                $.log(`抽奖失败：未知错误请查看日志或手动抽奖!!!\n${obj}`);
                message += `抽奖失败：未知错误请查看日志或手动抽奖!!!\n${obj}\n`;
                }
                resolve();
            }        
        )
    })
}

// 获取今日签到所得热爱值和总热爱值
function vipScore() {
    return new Promise((resolve, reject) => {
        let opt = {
            url: 'https://vip.video.qq.com/rpc/trpc.vipscore.read.VScoreRead/GetScoreFlowH5?rpc_data=%7B%22type%22:3002,%22page_context%22:%7B%22page_size%22:15,%22cur_page_index%22:0%7D%7D',
            headers: {
                'Host': 'vip.video.qq.com',
                'Sec-Fetch-Site': 'same-site',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Sec-Fetch-Mode': 'cors',
                'Accept': 'application/json, text/plain, */*',
                'Origin': 'https://film.video.qq.com',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;QQSportsV3/com.tencent.sportskbs/7.4.45.103 (iPhone(iPhone14,2); iOS 17.3; Scale/3.00) TenvideoUnion/1.4.5',
                'Connection': 'keep-alive',
                'Referer': 'https://film.video.qq.com/x/sports-grade/growth/?ptag=SportsGrade',
                'Cookie': txSportsCookie,
                'Sec-Fetch-Dest': 'empty'
            }
        }
        $.get(opt, async (error, resp, data) => {
                var obj = JSON.parse(data);
                var scoreList = obj.flow_list;
                for(let i = 0; i < scoreList.length; i++){
                    if(isToday(scoreList[i].flow_time * 1000) && scoreList[i].pay_source === 104){
                        $.log(`今日签到获得热爱值：${scoreList[i].score} 总热爱值：${scoreList[i].level_score}`);
                        message += `今日签到获得热爱值：${scoreList[i].score} 总热爱值：${scoreList[i].level_score}`;
                        isCheck = true;
                        break;
                    } 
                }
                if(!isCheck){
                    $.log(`您今日还未签到, 请别忘了哦`);
                    message += `您今日还未签到, 请别忘了哦`;
                }
                resolve();
            }
        )
    })
}

function getCookie() {
    const CK = $request.headers['Cookie'] || $request.headers['cookie'];
    if (CK) {
        let keys = ['main_login', 'video_platform', 'vqq_access_token', 'vqq_appid', 'vqq_openid'];
        let ck = extractValues(CK, keys)
        if (typeof txSportsCookie === 'undefined'){
            $.setdata(ck, 'txSports');
            $.log(`Cookie: ${ck}`);
            $.msg($.name, '🎉 Cookie写入成功', '');
        } else if(txSportsCookie.length === 0){
            $.setdata(ck, 'txSports');
            $.log(`Cookie: ${ck}`);
            $.msg($.name, '🎉 Cookie写入成功', '');
        } else if(ck != txSportsCookie){
            $.setdata(ck, 'txSports');
            $.log(`Cookie: ${ck}`);
            $.msg($.name, '🎉 Cookie更新成功', '');
        } else {
            $.msg($.name, '⚠️ Cookie未变动 跳过更新', '');
        }
    } else {
        $.msg($.name, '⚠️ Cookie未找到', '');
    }
}

async function showMsg() {
    $.msg($.name, checkInMsg, message);
}

// 提取Cookie的指定字段
function extractValues(str, keys) {
    let results = keys.map(key => str.split('; ').find(s => s.startsWith(key + '=')));
    return results.join(';');
}

// 判断时间戳是不是今天
function isToday(timestamp) {
    let date = new Date(timestamp);
    let today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
}

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,a)=>{s.call(this,t,(t,s,r)=>{t?a(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const a=this.getdata(t);if(a)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,a)=>e(a))})}runScript(t,e){return new Promise(s=>{let a=this.getdata("@chavy_boxjs_userCfgs.httpapi");a=a?a.replace(/\n/g,"").trim():a;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[i,o]=a.split("@"),n={url:`http://${o}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":i,Accept:"*/*"},timeout:r};this.post(n,(t,e,a)=>s(a))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e);if(!s&&!a)return{};{const a=s?t:e;try{return JSON.parse(this.fs.readFileSync(a))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):a?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const a=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of a)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,a)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[a+1])>>0==+e[a+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,a]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,a,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,a,r]=/^@(.*?)\.(.*?)$/.exec(e),i=this.getval(a),o=a?"null"===i?null:i||"{}":"{}";try{const e=JSON.parse(o);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),a)}catch(e){const i={};this.lodash_set(i,r,t),s=this.setval(JSON.stringify(i),a)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),t.params&&(t.url+="?"+this.queryStr(t.params)),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:a,statusCode:r,headers:i,rawBody:o}=t,n=s.decode(o,this.encoding);e(null,{status:a,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:a,response:r}=t;e(a,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let a=require("iconv-lite");this.initGotEnv(t);const{url:r,...i}=t;this.got[s](r,i).then(t=>{const{statusCode:s,statusCode:r,headers:i,rawBody:o}=t,n=a.decode(o,this.encoding);e(null,{status:s,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:s,response:r}=t;e(s,r,r&&a.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let a={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in a)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?a[e]:("00"+a[e]).substr((""+a[e]).length)));return t}queryStr(t){let e="";for(const s in t){let a=t[s];null!=a&&""!==a&&("object"==typeof a&&(a=JSON.stringify(a)),e+=`${s}=${a}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",a="",r){const i=t=>{switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{let e=t.url||t.openUrl||t["open-url"];return{url:e}}case"Loon":{let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}case"Quantumult X":{let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,a=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":a}}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,a,i(r));break;case"Quantumult X":$notify(e,s,a,i(r));break;case"Node.js":}if(!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),a&&t.push(a),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,t);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,t.stack)}}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;switch(this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}