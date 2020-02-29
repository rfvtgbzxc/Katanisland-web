from django.shortcuts import render
from django.shortcuts import redirect,HttpResponse
from .models import User,Room
from django.db.models import F,Max
from . import game_templates as gm_temp
from . import map_creator as gm_map
from . import game_creator as gm_game
import json
#from dwebsocket.decorators import accept_websocket
import time,random

# Create your views here.


def init(request):
    return redirect('/gametest/')

#进入房间页面，该部分兼具对用户重连时的各种情况的判断
def gotoRoom(request):
	#判断会话状态
	user_id=request.COOKIES.get('user_id','')
	if(user_id==''):
		#重定向至登录界面
		print("用户不存在")
		return redirect('/login/')
	user=User.objects.get(ID=user_id)
	room_id=request.GET.get('room','')
	#如果用户所在的房间仍在游戏中，则返回房间(自动校正不正确的房间号)
	if(user.in_room.game_state!=0 and user.in_room.game_state!=3 and user.in_room.out_room_ID!=room_id):
		return redirect('/room/?room='+str(user.in_room.out_room_ID)+'/')
	#恢复游戏
	if(user.in_room.game_state==1 or user.in_room.game_state==2):
		room=user.in_room
		info={
			'room':{
				'id':room.out_room_ID,
				'name':room.room_name,
			}
		}
		#载入游戏页面，恢复游戏
		return render(request,'game.html')
	#如果用户所在的房间已经游戏结束，或用户正在大厅，或当前房间游戏尚未开始，尝试加入请求的房间
	#寻找未处于游戏状态的同名房间（旧房间新开）
	room=Room.objects.filter(out_room_ID=room_id,game_state=0)
	#房间不存在则返回大厅
	if(room.exists()==False):
		print("房间不存在")
		#返回大厅
		User.objects.filter(ID=user_id).update(in_room=Room.objects.get(room_ID=1))
		return redirect('/hall/')

	room=room[0]
	info={
		'room':{
			'id':room.out_room_ID,
			'name':room.room_name,
		}
	}
	print(room.players.filter(ID=user_id))
	#如果本来就在这个房间中没问题
	if(room.players.filter(ID=user_id).exists()):
		pass
	#判断人数看是否可以加入
	elif(room.member_num<room.member_max):
		pass
	else:
		print("房间已满")
		return redirect('/hall/')
	#加入房间，载入房间页面，等待游戏开始

	return render(request,'room.html',info)

#获取房间信息
def getRoomInfo(request):
	room_id=request.POST.get("room_id",'')
	room=Room.objects.get(out_room_ID=room_id,game_state=0)
	room_info=room.game_info
	return HttpResponse(room_info)

#获取房间信息(游戏中用)
def getRoomInfo_g(request):
	user_id=request.POST.get("user_id",'')
	room=User.objects.get(ID=user_id).in_room
	room_info=room.game_info
	return HttpResponse(room_info)

#创建新房间
def createRoom(request):
	#获取所有存在的房间的最大值
	maxid=Room.objects.all().aggregate(Max('out_room_ID'))
	user_id=request.COOKIES.get('user_id','')
	user=User.objects.get(ID=user_id)
	t_game_info=gm_temp.base_info()
	t_map_setting=gm_temp.map_setting()
	#t_game_info["player_list"]['1']=[user_id,user.name]
	#t_game_info["user_list"][user_id]=1
	t_game_info["owner"]=user_id
	new_room=Room(game_info=json.dumps(t_game_info),
		out_room_ID=maxid["out_room_ID__max"]+1,
		room_owner=int(user_id),
		#member_max=1,
		map_setting=json.dumps(t_map_setting),
		map_info="general",
		room_name="新房间")
	new_room.save()
	#print(json.dumps(t_game_info))
	return HttpResponse(maxid["out_room_ID__max"]+1)

#检查游戏成员
def check_members(request):
	room_id=int(request.POST.get("room_id"))
	room=Room.objects.get(out_room_ID=room_id,game_state=0)
	if(room.member_num==room.member_max):
		room.game_state=1
		room.save()
		#此处应有生成完整game_info的部分
		return HttpResponse("OK")
	else:
		return HttpResponse("failed")

#进入大厅界面
def gotoHome(request):
	#判断会话状态
	user_id=request.COOKIES.get('user_id','')
	info={}
	if(user_id==''):
		#重定向至登录界面
		return redirect('/login/')
	#成功的登录
	#判断所处房间并自动跳转，若房间对局尚未开始则返回大厅
	user=User.objects.get(ID=user_id)
	#print("现在================"+user.in_room.room_name)
	if(user.in_room.game_state!=0):
		#尝试返回对局
		return redirect('/room/?room='+str(user.in_room.out_room_ID)+'/')
	#返回大厅
	User.objects.filter(ID=user_id).update(in_room=Room.objects.get(room_ID=1))
	info['user']=user.name
	info['welcome']='欢迎您，'
	#查询所有可用的房间
	#受限于刷新时间，此时玩家可能还在房间内，因此主动去除玩家所在的房间
	rooms_available=Room.objects.filter(game_state=0).exclude(member_num=0)
	if(user.in_room.member_num==1):
		rooms_available=rooms_available.exclude(room_ID=user.in_room.room_ID)
	info['rooms']=[]
	for room in rooms_available:
		if room.out_room_ID==1:
			continue
		info['rooms'].append({
			'room_id':room.out_room_ID,
			'game_id':room.room_ID,
			'name':room.room_name,
			'member_max':room.member_max,
			'member_num':room.member_num,
			'game_state':'正常' if room.game_state==0 else '游戏中',
			'map_info':'默认' if room.map_info=='general' else '自定义',
			'map_size':'默认' if room.map_size==0 else '大地图',
			})
	return render(request, 'hall.html',info)


def gotoLogin(request):
	#判断会话状态
	user_id=request.COOKIES.get('user_id','')
	info={}
	if(user_id!=''):
		#重定向至大厅界面
		return redirect('/hall/')
	if(request.POST):
		usname = request.POST.get('username', '')
		user = User.objects.filter(name=usname)
		psin = request.POST.get('password', '')
		info = {'usernamex':usname}
		if(usname == ""):
			info['info_username'] = "请输入用户名！"
			return render(request, 'login.html', info)
		elif(user.exists()==False):
			info['info_username'] = "用户名不存在！"
			return render(request, 'login.html', info)
		elif(psin == ""):
			info['info_password'] = "请输入密码！"
			return render(request, 'login.html', info)
		user=user[0]
		pswd = user.password
		#如果密码不是隐藏密码则不进行cookie读取
		if(psin=="------"):
			#从cookie中获取用户名对应的凭证，与服务器中的凭证比对
			passer = request.get_signed_cookie("id"+usname,'',salt="skerio")
			if(passer==pswd):
				pass#前往登录成功部分
			else:
				info['info_password'] = "请重新输入密码！"
				return render(request, 'login.html', info)
		#正常密码判断
		elif(pswd == psin):
			pass#前往登录成功部分
		else:
			info['info_password'] = "密码错误！"
			return render(request, 'login.html', info)
		#成功登录后的操作
		rep = redirect("/hall/")
		#Cookie记录登录凭证(关闭浏览器消失)
		rep.set_cookie('user_id',user.ID,path='/')
		#Cookie记录登录记忆（有效时间一周，当前凭证的值为用户密码+salt)			
		if(request.POST.get('memory',0)=='1'):
			rep.set_cookie('localuser',usname,max_age=7*24*60*60,path='/')
			rep.set_signed_cookie("id"+usname,pswd,salt="skerio",max_age=7*24*60*60,path='/')
		else:#没有选择记忆就一定要尝试删除cookie
			rep.delete_cookie('localuser')
			rep.delete_cookie("id"+usname)
		return rep
	else:
		info = {}
		user = request.GET.get('username','')
		if(user == ''):
			user = request.COOKIES.get('localuser','')
			if(user != ''):
				info['base_password']='------'
				info['st_check']="checked"
		info['usernamex']=user
		return render(request, 'login.html',info)


def gotoRegist(request):
    if(request.POST):
        #time.sleep(5)
        user = request.POST.get('user_name', '')
        pswd = request.POST.get('pswd', '')
        if(User.objects.filter(name=user)):
        	return HttpResponse('用户名已存在！')
        Room.objects.filter(room_ID=1).update(member_num=F('member_num') + 1)
        new_user=User(password=pswd,name=user,in_room=Room.objects.get(room_ID=1))
        new_user.save()
        return HttpResponse('true')
    else:
        return render(request,'register.html')

def logout(request):
	rep = redirect('/login/')
	rep.delete_cookie('user_id')
	return rep
def gotoTest(request):
	return render(request,'test.html')

def gotoMapTest(request):
	return render(request,'maptest.html')

def t_createMap(request):
	#按照基础设置生成一张随机地图
	map_setting=gm_temp.map_setting("fruitful")
	map_info=gm_map.createmap(json.dumps(map_setting))
	return HttpResponse(json.dumps(map_info))

def t_createRoom(request):
	#获取房间大小
	room_size=int(request.GET.get("room_size"))
	room_pswd=request.GET.get("room_pswd")
	room_time_per_turn=int(request.GET.get("time_per_turn"))
	room_map_template=request.GET.get("map_template")
	if(Room.objects.filter(password=room_pswd)):
		return HttpResponse("密码重复！")
	#test_room=Room.objects.get(out_room_ID=1)
	#生成对应数据并保存在测试房间
	maxid=Room.objects.all().aggregate(Max('out_room_ID'))
	map_setting=gm_temp.map_setting(room_map_template)
	map_info=gm_map.createmap(json.dumps(map_setting))
	base_game_info=gm_game.init_game_info(room_size,room_time_per_turn)
	new_room=Room(
		out_room_ID=maxid["out_room_ID__max"]+1,
		room_owner=1,
		member_max=room_size,
		password=room_pswd,
		map_setting=json.dumps(map_setting),
		map_info=json.dumps(map_info),
		game_info=json.dumps(base_game_info),
		room_name="新房间")
	new_room.save()
	#test_room.map_info=json.dumps(map_info)
	#test_room.game_info=json.dumps(base_game_info)
	#test_room.save()
	return HttpResponse("创建成功!")


def t_load_game(request):
	#读取保存的数据
	#game_info=gm_temp.game_info(2)
	#test_room=Room.objects.get(out_room_ID=1)
	room_pswd=request.GET.get("room_pswd")
	room=Room.objects.filter(password=room_pswd)
	if(room.exists()==False):
		return HttpResponse("找不到房间!")
	room=room[0]
	info={
		"map_info":json.loads(room.map_info),
		"game_info":json.loads(room.game_info)
	}
	return HttpResponse(json.dumps(info))

def t_update_game_info(request):
	#更新测试房间数据库
	room_pswd=request.POST.get("room_pswd")
	room=Room.objects.filter(password=room_pswd)
	if(room.exists()==False):
		return HttpResponse("找不到房间!")
	room=room[0]
	room.game_info=request.POST.get("game_info")
	room.save()
	return HttpResponse("更新成功!")

def t_virtual_websocket(request):
	evt=json.loads(request.GET.get("data"))
	#只有随机数请求会被特殊化响应
	if(evt["message"]["val"][0]==0 and evt["message"]["val"][1]==0):
		#msg={"data":{"type":"mes_action","message":{"val":[0,1,random.randint(1,6),random.randint(1,6)]}}}
		msg={"data":{"type":"mes_action","message":{"val":[0,1,3,3]}}}
		return HttpResponse(json.dumps(msg))
	if(evt["message"]["val"][0]==1 and evt["message"]["val"][1]==4 and evt["message"]["val"][2]==0):
		msg={"data":{"type":"mes_action","message":{"starter":evt["message"]["starter"],"val":[1,4,1,random.randint(0,evt["message"]["val"][3]-1)]}}}
		return HttpResponse(json.dumps(msg))
	if(evt["message"]["val"][0]==4 and evt["message"]["val"][3]==0):
		evt["message"]["val"][4]=random.randint(0,evt["message"]["val"][4]-1)
		return HttpResponse(json.dumps({"data":evt}))
	if(evt["message"]["val"][0]==3 and evt["message"]["val"][1]==1 and evt["message"]["val"][4]==0):
		evt["message"]["val"][5]=random.randint(0,evt["message"]["val"][5]-1)
		return HttpResponse(json.dumps({"data":evt}))
	if(evt["message"]["val"][0]==9 and evt["message"]["val"][1]==0):
		evt[1]=1
		evt.append(random.randint(1,6))
		evt.append(random.randint(1,6))
		return HttpResponse(json.dumps({"data":evt}))
	#好吧现在还有向玩家的交易请求,会等待一秒
	if(evt["message"]["val"][0]==2 and evt["message"]["val"][1]==3):
		time.sleep(3)
		return HttpResponse(json.dumps({"data":evt}))

	return HttpResponse(json.dumps(request.GET))

def gotoGameTest(request):
	return render(request,'gametest.html')