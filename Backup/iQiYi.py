#!/usr/bin/python3
# -- coding: utf-8 --
# -------------------------------
# @Author : github@limoruirui https://github.com/limoruirui
# @Modifier : github@WowYiJiu https://github.com/WowYiJiu
# @Update : 2024/6/4
# @env : iqyck
# -------------------------------
"""
cookie为爱奇艺整个cookie
export iqyck = "cookie"
"""
from time import sleep, time
from random import randint, choice
from json import dumps
from hashlib import md5 as md5Encode
from string import digits, ascii_lowercase, ascii_uppercase
from sys import exit, stdout
from os import environ, system
from re import findall
from uuid import uuid4
from datetime import datetime

try:
    from requests import Session, get, post
    from fake_useragent import UserAgent
except:
    print(
        "你还没有安装requests库和fake_useragent库 正在尝试自动安装 请在安装结束后重新执行此脚本\n若还是提示本条消息 请自行运行pip3 install requests和pip3 install fake-useragent或者在青龙的依赖管理里安装python的requests和fake-useragent")
    system("pip3 install fake-useragent")
    system("pip3 install requests")
    print("安装完成 脚本退出 请重新执行")
    exit(0)
iqyck = environ.get("iqyck") if environ.get("iqyck") else ""
P00001 = P00003 = dfp = qyid = ""
pushplus_token = environ.get("PUSH_PLUS_TOKEN") if environ.get("PUSH_PLUS_TOKEN") else ""
tgbot_token = environ.get("TG_BOT_TOKEN") if environ.get("TG_BOT_TOKEN") else ""
tg_userId = environ.get("TG_USER_ID") if environ.get("TG_USER_ID") else ""
tg_push_api = environ.get("TG_API_HOST") if environ.get("TG_API_HOST") else ""
if iqyck == "":
    print("未找到iqy_ck，请填写iqy_ck变量")
    exit(0)

check_items = ["P00001", "P00003", "QC005", "__dfp"]

for item in check_items:
    try:
        found = findall(rf"{item}=(.*?)(;|$)", iqyck)

        if found:
            value = found[0][0]
            
            if item == "P00001":
                P00001 = value
            elif item == "P00003":
                P00003 = value
            elif item == "QC005":
                qyid = value
            elif item == "__dfp":
                dfp = value
        else:
            print(f"{item}未在iqyck中找到")
    except IndexError:
        print(f"{item}存在但无法被正确解析")

class IQiYi:
    def __init__(self):
        self.P00001 = P00001
        self.userId = P00003
        self.dfp = dfp
        self.qyid = qyid
        self.platform = str(uuid4())[:16],
        self.session = Session()
        self.user_agent = UserAgent().chrome
        self.headers = {
            "User-Agent": self.user_agent,
            "Cookie": f"P00001={self.P00001}",
            'Accept': "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            'sec-fetch-site': "none",
            'sec-fetch-dest': "document",
            'accept-language': "zh-CN,zh-Hans;q=0.9",
            'sec-fetch-mode': "navigate"
        }
        self.msg = ""
        self.title = "爱奇艺\n\n"
        self.user_info = ""
        self.task_info = ""
        self.msg = ""
        self.taskList = []
        self.lotteryList = []
        self.shakeLotteryList = []
        self.gift_list = []
        self.sleep_await = environ.get("sleep_await") if environ.get("sleep_await") else 1

    """工具"""
    def req(self, url, req_method="GET", body=None):
        data = {}
        method = req_method.upper()
        if method not in ["GET", "POST", "OTHER"]:
            self.print_now(f"错误:不支持的请求方法：{method}")
            return 

        try:
            if method == "GET":
                response = self.session.get(url, headers=self.headers, params=body)
            elif method == "POST":
                response = self.session.post(url, headers=self.headers, data=dumps(body))
            elif method == "OTHER":
                response = self.session.get(url, headers=self.headers, params=dumps(body))
                
            if method in ["GET", "POST"]:
                data = response.json()

        except requests.exceptions.RequestException as e:
            self.print_now(f"请求发送失败,可能为网络异常,异常详细信息：{str(e)}")

        return data

    def timestamp(self, short=False):
        if (short):
            return int(time())
        return int(time() * 1000)

    def md5(self, str):
        m = md5Encode(str.encode(encoding='utf-8'))
        return m.hexdigest()

    def uuid(self, num, upper=False):
        str = ''
        if upper:
            for i in range(num):
                str += choice(digits + ascii_lowercase + ascii_uppercase)
        else:
            for i in range(num):
                str += choice(digits + ascii_lowercase)
        return str

    def pushplus(self, title, content):
        url = "http://www.pushplus.plus/send"
        headers = {
            "Content-Type": "application/json"
        }
        data = {
            "token": pushplus_token,
            "title": title,
            "content": content
        }
        try:
            post(url, headers=headers, data=dumps(data))
        except:
            self.print_now('推送失败')

    def tgpush(self, content):
        url = f"https://api.telegram.org/bot{tgbot_token}/sendMessage"
        if tg_push_api != "":
            url = f"{tg_push_api}/bot{tgbot_token}/sendMessage"
        headers = {'Content-Type': 'application/x-www-form-urlencoded'}
        data = {'chat_id': str(tg_userId), 'text': content, 'disable_web_page_preview': 'true'}
        try:
            post(url, headers=headers, data=data, timeout=10)
            self.print_now('推送成功')
        except:
            self.print_now('推送失败')

    def print_now(self, content):
        print(content)
        stdout.flush()

    def sign(self):
        time_stamp = self.timestamp()
        data = f'agentType=1|agentversion=1.0|appKey=basic_pcw|authCookie={self.P00001}|qyid={self.qyid}|task_code=natural_month_sign|timestamp={time_stamp}|typeCode=point|userId={self.userId}|UKobMjDMsDoScuWOfp6F'
        url = f'https://community.iqiyi.com/openApi/task/execute?agentType=1&agentversion=1.0&appKey=basic_pcw&authCookie={self.P00001}&qyid={self.qyid}&task_code=natural_month_sign&timestamp={time_stamp}&typeCode=point&userId={self.userId}&sign={self.md5(data)}'
        headers = {
            'Content-Type': 'application/json'
        }
        body = {
            "natural_month_sign": {
                "agentType": 1,
                "agentversion": 1,
                "authCookie": self.P00001,
                "qyid": self.qyid,
                "taskCode": "iQIYI_mofhr",
                "verticalCode": "iQIYI"
            }
        }
        data = post(url, headers=headers, json=body).json()
        signDays = None
        if 'code' in data and data['code'] == 'A0003':
            self.print_now("iqyck已失效，请重新获取")
            exit(0)
        elif 'code' in data and data['code'] == 'A00000':
            data_data = data.get('data', {})
            msg = data_data.get('msg')
            
            if data_data.get('data'): 
                signDays = data_data.get('data', {}).get('signDays')
            if msg and '已经到达上限' in msg:
                self.print_now(f"签到失败，今天已签到")
                self.task_info += f"签到失败，今天已签到\n"
            elif signDays is not None:
                self.print_now(f"签到成功, 本月累计签到{signDays}天")
                self.task_info += f"签到成功, 本月累计签到{signDays}天\n"

    def get_watch_time(self):
        url = "https://tc.vip.iqiyi.com/growthAgency/watch-film-duration"
        data = self.req(url)
        watch_time = data['data']['viewtime']['time']
        return watch_time

    def watchVideo(self):
        totalTime = self.get_watch_time()
        if totalTime >= 7200:
            self.print_now(f"您的账号今日观影时长大于2小时，不执行刷观影时长")
            self.task_info += f"您的账号今日观影时长大于2小时，不执行刷观影时长\n"
            return
        self.print_now("正在刷观影时长，为减少风控，本过程运行大概1个小时")
        for i in range(1, 121):
            Time = randint(70, 90)
            url = f"https://msg.qy.net/b?u=f600a23f03c26507f5482e6828cfc6c5&pu={self.userId}&p1=1_10_101&v=5.2.66&ce={self.uuid(32)}&de=1616773143.1639632721.1639653680.29&c1=2&ve={self.uuid(32)}&ht=0&pt={randint(1000000000, 9999999999) / 1000000}&isdm=0&duby=0&ra=5&clt=&ps2=DIRECT&ps3=&ps4=&br=mozilla%2F5.0%20(windows%20nt%2010.0%3B%20win64%3B%20x64)%20applewebkit%2F537.36%20(khtml%2C%20like%20gecko)%20chrome%2F96.0.4664.110%20safari%2F537.36&mod=cn_s&purl=https%3A%2F%2Fwww.iqiyi.com%2Fv_1eldg8u3r08.html%3Fvfrm%3Dpcw_home%26vfrmblk%3D712211_cainizaizhui%26vfrmrst%3D712211_cainizaizhui_image1%26r_area%3Drec_you_like%26r_source%3D62%2540128%26bkt%3DMBA_PW_T3_53%26e%3Db3ec4e6c74812510c7719f7ecc8fbb0f%26stype%3D2&tmplt=2&ptid=01010031010000000000&os=window&nu=0&vfm=&coop=&ispre=0&videotp=0&drm=&plyrv=&rfr=https%3A%2F%2Fwww.iqiyi.com%2F&fatherid={randint(1000000000000000, 9999999999999999)}&stauto=1&algot=abr_v12-rl&vvfrom=&vfrmtp=1&pagev=playpage_adv_xb&engt=2&ldt=1&krv=1.1.85&wtmk=0&duration={randint(1000000, 9999999)}&bkt=&e=&stype=&r_area=&r_source=&s4={randint(100000, 999999)}_dianshiju_tbrb_image2&abtest=1707_B%2C1550_B&s3={randint(100000, 999999)}_dianshiju_tbrb&vbr={randint(100000, 999999)}&mft=0&ra1=2&wint=3&s2=pcw_home&bw=10&ntwk=18&dl={randint(10, 999)}.27999999999997&rn=0.{randint(1000000000000000, 9999999999999999)}&dfp={dfp}&stime={self.timestamp()}&r={randint(1000000000000000, 9999999999999999)}&hu=1&t=2&tm={Time}&_={self.timestamp()}"
            self.req(url, 'other')
            totalTime += Time
            sleep(randint(30, 50))
            if i % 30 == 0:
                self.print_now(f"现在已经刷到了{totalTime}秒, 数据同步有延迟, 仅供参考")
            if totalTime >= 7200:
                self.print_now(f"今日观影任务已完成")
                self.task_info += f"今日观影任务已完成\n"
                break

    def dailyTask(self):
        # 查询任务
        """
        status: 0 已完成，未领奖 1 已完成，已领奖 2 未完成
        """
        url = f'https://tc.vip.iqiyi.com/taskCenter/task/queryUserTask?P00001={self.P00001}'
        data = self.req(url)
        if data['code'] == 'A00000':
            for item in data["data"].get("tasks", {}).get("daily", []):
                if item["taskCode"] != "WatchVideo60mins" and item["status"] != 1:
                    self.taskList.append(
                        {
                            "taskTitle": item["taskTitle"],
                            "taskCode": item["taskCode"],
                            "status": item["status"]
                        }
                    )
        if self.taskList:
            for item in self.taskList:
                if item["status"] == 2:
                    # 领任务
                    url = f'https://tc.vip.iqiyi.com/taskCenter/task/joinTask?P00001={self.P00001}&taskCode={item["taskCode"]}&platform={self.platform}&lang=zh_CN&app_lm=cn'
                    if self.req(url)['code'] == 'A00000':
                        sleep(10)
                    # 完成任务
                    url = f'https://tc.vip.iqiyi.com/taskCenter/task/notify?taskCode={item["taskCode"]}&P00001={self.P00001}&platform={self.platform}&lang=cn&bizSource=component_browse_timing_tasks&_={self.timestamp()}'
                    if self.req(url)['code'] == 'A00000':
                        sleep(2)
                if item["status"] == 2 or item["status"] == 0:
                    # 领取奖励
                    url = f"https://tc.vip.iqiyi.com/taskCenter/task/getTaskRewards?P00001={self.P00001}&taskCode={item['taskCode']}&lang=zh_CN&platform={self.platform}"
                    if self.req(url)['code'] == 'A00000':
                        price = self.req(url)['dataNew'][0]["value"]
                        self.print_now(f"{item['taskTitle']}任务已完成, 获得{int(price[1:])}点成长值")
                        self.task_info += f"{item['taskTitle']}任务已完成, 获得{int(price[1:])}点成长值\n"
                        sleep(5)
        else:
            self.print_now("今日日常浏览任务已全部完成")
            self.task_info += "今日日常浏览任务已全部完成\n"

    def lottery(self):
        url = "https://iface2.iqiyi.com/aggregate/3.0/lottery_activity"
        lottery_params = {
            "app_k": 0,
            "app_v": 0,
            "platform_id": 10,
            "dev_os": 0,
            "dev_ua": 0,
            "net_sts": 0,
            "qyid": self.qyid,
            "psp_uid": self.userId,
            "psp_cki": self.P00001,
            "psp_status": 3,
            "secure_v": 1,
            "secure_p": 0,
            "req_sn": self.timestamp()
        }
        params = lottery_params
        data = self.req(url, "get", params)
        if data.get("code") == 0:
            daysurpluschance = int(data.get("daysurpluschance"))
            if daysurpluschance == 0:
                if self.lotteryList:
                    self.print_now(f"抽奖奖品：{'、'.join(self.lotteryList)}")
                    self.task_info += f"抽奖奖品：{'、'.join(self.lotteryList)}\n"
                else:
                    self.print_now(f"抽奖次数已用完, 明日再来吧")
                    self.task_info += f"抽奖次数已用完, 明日再来吧\n"
            else:
                award_info = data.get("awardName")
                self.lotteryList.append(award_info)
                sleep(2)
                self.lottery()
        else:
            self.print_now(f"抽奖接口请求失败：{data}")

    def shake_lottery(self):
        url = f'https://act.vip.iqiyi.com/shake-api/lottery?P00001={self.P00001}&dfp={self.dfp}&qyid={self.qyid}&deviceID={self.qyid}&version=15.4.6&agentType=12&platform=bb35a104d95490f6&ptid=02030031010000000000&fv=afc0b50ed49e732d&source=afc0b50ed49e732d&_={self.timestamp()}&vipType=1&lotteryType=0&actCode=0k9GkUcjqqj4tne8&freeLotteryNum=3&extendParams={{"appIds":"iqiyi_pt_vip_iphone_video_autorenew_12m_348yuan_v2","supportSk2Identity":true,"testMode":"0","iosSystemVersion":"17.4.1","bundleId":"com.qiyi.iphone"}}'
        data = self.req(url)
        if data.get("code") == 'A00000':
            award_info = data.get("data", {}).get("title")
            self.shakeLotteryList.append(award_info)
            sleep(2)
            self.shake_lottery()
        elif data.get("msg") == "抽奖次数用完":
            if self.shakeLotteryList:
                self.print_now(f"每天摇一摇奖品：{'、'.join(self.shakeLotteryList)}")
                self.task_info += f"每天摇一摇奖品：{'、'.join(self.shakeLotteryList)}\n"
            else:
                self.print_now(f"每天摇一摇次数已用完, 明日再来吧")
                self.task_info += f"每天摇一摇次数已用完, 明日再来吧\n"
        else:
            self.print_now(f'每天摇一摇：{data.get("msg")}')

    def giveTimes(self):
        times_code_list = ["browseWeb", "browseWeb", "bookingMovie"]
        for times_code in times_code_list:
            url = f"https://pcell.iqiyi.com/lotto/giveTimes?dfp&qyid={self.qyid}&version&deviceId={self.qyid}&_cctimer={self.timestamp()}&actCode=bcf9d354bc9f677c&timesCode={times_code}&P00001={self.P00001}"
            data = self.req(url)

    def queryTimes(self):
        url = f"https://pcell.iqiyi.com/lotto/queryTimes?dfp&qyid={self.qyid}&version&deviceId={self.qyid}&_cctimer={self.timestamp()}&actCode=bcf9d354bc9f677c&P00001={self.P00001}"
        data = self.req(url)
        if data.get("code") == 'A00000':
            times = data["data"]["times"]
            return times

    def lotto_lottery(self):
        self.giveTimes()
        times = self.queryTimes()
        if times == 0:
            self.print_now(f"白金抽奖次数已用完, 明日再来吧")
            self.task_info += f"白金抽奖次数已用完, 明日再来吧\n"
        for _ in range(times):
            url = f"https://pcell.iqiyi.com/lotto/lottery?dfp&qyid={self.qyid}&version&deviceId={self.qyid}&_cctimer={self.timestamp()}&actCode=bcf9d354bc9f677c&P00001={self.P00001}"
            data = self.req(url)
            gift_name = data["data"]["giftName"]
            if gift_name and "未中奖" not in gift_name:
                self.gift_list.append(gift_name)
            if self.gift_list:
                    self.print_now(f"白金抽奖奖品：{'、'.join(self.gift_list)}")
                    self.task_info += f"白金抽奖奖品：{'、'.join(self.gift_list)}\n"
            else:
                self.print_now(f"很遗憾，白金抽奖未中奖")
                self.task_info += f"很遗憾，白金抽奖未中奖\n"
            
    def get_userinfo(self):
        url = f"https://tc.vip.iqiyi.com/growthAgency/v2/growth-aggregation?messageId=b7d48dbba64c4fd0f9f257dc89de8e25&platform=97ae2982356f69d8&P00001={self.P00001}&responseNodes=duration,growth,upgrade,viewTime,growthAnnualCard&_={self.timestamp()}"
        data = self.req(url)
        growth_info = data['data']['growth']
        if data.get("code") == 'A00000':
            self.user_info += f"用户昵称：{ data['data']['user']['nickname']}\nVIP等级：{growth_info['level']}\nVIP到期时间：{growth_info['deadline']}\n今日成长：{growth_info['todayGrowthValue']}\n当前成长：{growth_info['growthvalue']}\n升级还需：{growth_info['distance']}\n"
        else:
            self.user_info = f"查询失败,未获取到用户信息"

    def main(self):
        self.sign()
        self.watchVideo()
        self.dailyTask()
        self.lottery()
        self.shake_lottery()
        self.lotto_lottery()
        self.print_now(f"任务已经执行完成，因爱奇艺观影时间同步较慢，这里等待1分钟再查询今日成长值信息\n若不需要等待直接查询，请设置环境变量名 sleep_await = 0")
        if int(self.sleep_await) == 1:
            sleep(60)
        self.get_userinfo()
        self.author = f"\n本通知 By：WowYiJiu\n通知时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        self.msg = self.title + self.user_info + self.task_info + self.author
        if pushplus_token != "":
            self.pushplus("爱奇艺每日任务签到", self.msg)
        if tgbot_token != "" and tg_userId != "":
            self.tgpush(self.msg)

if __name__ == '__main__':
    iqiyi = IQiYi()
    iqiyi.main()