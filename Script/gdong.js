/*
脚本名称：G动签到脚本
下载地址：https://apps.apple.com/cn/app/g%E5%8A%A8-%E5%87%AF%E6%A0%BC%E5%B0%94%E8%BF%90%E5%8A%A8%E9%94%BB%E7%82%BC%E8%BD%AF%E4%BB%B6/id1096015822
脚本说明：本脚本仅适用于G动每日签到，仅测试QuantumultX
环境变量：gdCookie、gd_accessToken
脚本作者：WowYiJiu
更新时间：2024-2-16
脚本来源：https://raw.githubusercontent.com/WowYiJiu/Personal/main/Script/gdong.js
====================================================================================================
获取Cookie和access_token说明：
进入G动app，点击底部锻炼和我的两个按钮，看到系统消息提示'获取Cookie成功'和'获取access_token成功'即可
获取Cookie后, 请将Cookie脚本禁用并移除主机名，以免产生不必要的MITM.

配置 (QuanX)
[MITM]
gdongapi.wo-ish.com

[rewrite_local]
^https:\/\/gdongapi\.wo-ish\.com\/user\/getUInfo url script-request-header https://raw.githubusercontent.com/WowYiJiu/Personal/main/Script/gdong.js
^https:\/\/gdongapi\.wo-ish\.com\/MsgBoard\/ShupUpV5 url script-request-body https://raw.githubusercontent.com/WowYiJiu/Personal/main/Script/gdong.js

[task_local]
10 7 * * * https://raw.githubusercontent.com/WowYiJiu/Personal/main/Script/gdong.js, tag=G动, img-url=https://raw.githubusercontent.com/WowYiJiu/Personal/main/icon/gdong.png, enabled=true
====================================================================================================
*/
const $ = new Env('G动');

let gdCookie = $.getdata('gdCookie');
let gd_accessToken = $.getdata('gd_accessToken');

let checkInMsg = '', message = '';
let isCheck = false, isComment = false;

if (isGetCookie = typeof $request !== `undefined`) {
  getCookie();
  $.done();
} else {
  !(async () => {
    if (gdCookie && gd_accessToken) {
        console.log('===== 开始【G动任务】 =====');
                await getSignState();
                if(!isCheck){
                    await checkIn();
                } else{
                    $.log(`每日签到已完成，跳过签到`);
                    checkInMsg = `每日签到已完成，跳过签到`;
                }
                if(!isComment){
                    await comment();
                } else{
                    $.log(`社区评论已完成，跳过评论`);
                    message = `社区评论已完成，跳过评论`;
                }
                await showMsg();
    } else {
        $.msg($.name, '【提示】请先获取G动Cookie和access_token', '');
    }
})()
  .catch((e) => $.logErr(e))
  .finally(() => $.done())
}

// G动每日签到
function checkIn() {
    return new Promise((resolve, reject) => {
        let opt = {
            url: 'https://gdongapi.wo-ish.com/Sign/SignV52',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': gdCookie
            },
            body: $.queryStr({
                'access_token' : gd_accessToken
            })
        }
        $.post(opt, async (error, resp, data) => {       
                try {
                    var obj = JSON.parse(data);
                    if (obj.errcode === 0) {
                        $.log(`签到成功`);
                        checkInMsg = `签到成功`;
                    } else {
                        $.log(`签到失败：未知错误请查看日志或手动签到!!!\n${obj}`);
                        checkInMsg = `签到失败：未知错误请查看日志或手动签到!!!\n${obj}`;
                    }
                } catch (e) {
                    $.logErr(e);
                } finally {
                    resolve();
                }  
            }        
        )
    })
}

// G动社区评论，本请求为评论我的一篇文章
function comment() {
    return new Promise((resolve, reject) => {
        let opt = {
            url: 'https://gdongapi.wo-ish.com/MsgBoard/CommentTopicV41',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': gdCookie
            },
            body: $.queryStr({
                'ReplayContext': '%E5%8A%A0%E6%B2%B9%E5%8A%A0%E6%B2%B9%E5%8A%A0%E6%B2%B9',
                'TopicId': '2876047',
                'access_token': gd_accessToken
            })
        }
        $.post(opt, async (error, resp, data) => {       
                try {
                    var obj = JSON.parse(data);
                    if (obj.errcode === 0) {
                        $.log(`评论成功`);
                        message = `评论成功`;
                    } else {
                        $.log(`评论失败：未知错误请查看日志或手动评论!!!\n${obj}`);
                        message = `评论失败：未知错误请查看日志或手动评论!!!\n${obj}`;
                    }
                } catch (e) {
                    $.logErr(e);
                } finally {
                    resolve();
                }  
            }        
        )
    })
}

function getSignState() {
    return new Promise((resolve, reject) => {
        let opt = {
            url: 'https://gdongapi.wo-ish.com/Sign/SignStateV51',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': gdCookie
            },
            body: $.queryStr({
                'access_token' : gd_accessToken
            })
        }
        $.post(opt, async (error, resp, data) => {     
                try {
                    var obj = JSON.parse(data);
                    if (obj.errcode === 0) {
                        var taskList = obj.data.otherGetMethon;
                        if(taskList[0].isFinish == 1){
                            isCheck = true;
                        }
                        if(taskList[1].isFinish == 1){
                            isComment = true;
                        }
                    } else {
                        $.log(`查询失败：未知错误请查看日志!!!\n${obj}`);
                        checkInMsg = `查询失败：未知错误请查看日志!!!\n${obj}`;
                    }
                } catch (e) {
                    $.logErr(e);
                } finally {
                    resolve();
                }  
            }        
        )
    })
}

function getCookie() {
    if($request&&$request.method!=`OPTIONS`&&$request.url.match(/\/user\/getUInfo/)) {
        const cookie = $request.headers['Cookie'] || $request.headers['cookie'];
        if (cookie) {
            if (typeof gdCookie === 'undefined' || (gdCookie && gdCookie.length === 0)){
                $.setdata(cookie, 'gdCookie');
                $.log(`Cookie: ${cookie}`);
                $.msg($.name, '🎉 Cookie写入成功', '');
            } else if(cookie != gdCookie){
                $.setdata(cookie, 'gdCookie');
                $.log(`Cookie: ${cookie}`);
                $.msg($.name, '🎉 Cookie更新成功', '');
            } else {
                $.msg($.name, '⚠️ Cookie未变动 跳过更新', '');
            }    
        } else {
                $.msg($.name, '⚠️ Cookie未找到', '');    
        }
    }
    if($request&&$request.method!=`OPTIONS`&&$request.url.match(/\/MsgBoard\/ShupUpV5/)) {
        const gdBody = new URLSearchParams($request.body);
        let acc_token = '';
        if(gdBody.has('access_token')){
            acc_token = gdBody.get('access_token');
            if (typeof gd_accessToken === 'undefined' || (gd_accessToken && gd_accessToken.length === 0)){
                $.setdata(acc_token, 'gd_accessToken');
                $.log(`gd_accessToken: ${acc_token}`);
                $.msg($.name, '🎉 access_token写入成功', '');
            } else if(acc_token != gd_accessToken){
                $.setdata(acc_token, 'gd_accessToken');
                $.log(`gd_accessToken: ${acc_token}`);
                $.msg($.name, '🎉 access_token更新成功', '');
            } else {
                $.msg($.name, '⚠️ access_token未变动 跳过更新', '');
            } 
        } else {
            $.msg($.name, '⚠️ access_token未找到', '');    
        }
    }
}

async function showMsg() {
    $.msg($.name, checkInMsg, message);
}

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,a)=>{s.call(this,t,(t,s,r)=>{t?a(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const a=this.getdata(t);if(a)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,a)=>e(a))})}runScript(t,e){return new Promise(s=>{let a=this.getdata("@chavy_boxjs_userCfgs.httpapi");a=a?a.replace(/\n/g,"").trim():a;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[i,o]=a.split("@"),n={url:`http://${o}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":i,Accept:"*/*"},timeout:r};this.post(n,(t,e,a)=>s(a))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e);if(!s&&!a)return{};{const a=s?t:e;try{return JSON.parse(this.fs.readFileSync(a))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):a?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const a=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of a)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,a)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[a+1])>>0==+e[a+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,a]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,a,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,a,r]=/^@(.*?)\.(.*?)$/.exec(e),i=this.getval(a),o=a?"null"===i?null:i||"{}":"{}";try{const e=JSON.parse(o);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),a)}catch(e){const i={};this.lodash_set(i,r,t),s=this.setval(JSON.stringify(i),a)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),t.params&&(t.url+="?"+this.queryStr(t.params)),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:a,statusCode:r,headers:i,rawBody:o}=t,n=s.decode(o,this.encoding);e(null,{status:a,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:a,response:r}=t;e(a,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let a=require("iconv-lite");this.initGotEnv(t);const{url:r,...i}=t;this.got[s](r,i).then(t=>{const{statusCode:s,statusCode:r,headers:i,rawBody:o}=t,n=a.decode(o,this.encoding);e(null,{status:s,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:s,response:r}=t;e(s,r,r&&a.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let a={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in a)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?a[e]:("00"+a[e]).substr((""+a[e]).length)));return t}queryStr(t){let e="";for(const s in t){let a=t[s];null!=a&&""!==a&&("object"==typeof a&&(a=JSON.stringify(a)),e+=`${s}=${a}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",a="",r){const i=t=>{switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{let e=t.url||t.openUrl||t["open-url"];return{url:e}}case"Loon":{let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}case"Quantumult X":{let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,a=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":a}}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,a,i(r));break;case"Quantumult X":$notify(e,s,a,i(r));break;case"Node.js":}if(!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),a&&t.push(a),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,t);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,t.stack)}}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;switch(this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}