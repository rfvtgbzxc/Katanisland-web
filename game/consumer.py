from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from .models import User,Room
from django.db.models import F
import json

class ChatConsumer(WebsocketConsumer):
    def connect(self):

        #print(self.scope['url_route'])
        #print("?????????????"+str(self.scope))

        self.accept()

    def disconnect(self, close_code):
        pass

    def receive(self, text_data):
        #text_data_json = json.loads(text_data)
        #message = text_data_json['message']

        self.send(text_data="hello")

class RoomReady(WebsocketConsumer):
    #准备连接时的操作
    def connect(self):
        print("Readying")
        #print("test==================="+str(self.scope['url_route']['kwargs']))
        #print(self.scope)
        #链接成功后，初始化各种参数
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.user_id = self.scope['cookies']['user_id']
        self.room_group_id = "room_"+str(self.room_id)
        self.user = User.objects.get(ID=self.user_id)
        self.refused=False
        #不应被重复连接，发现后则拒绝响应，并要求关闭窗口
        #检查重复
        if(self.user.linking==1):
            print("重复连接，拒绝访问")
            self.refused=True
            return
        self.room = Room.objects.filter(out_room_ID=self.room_id)
        if(self.room.exists()==False):
            print("房间已销毁")
            self.refused=True
            return
        self.room=self.room[0]
        print("handing")
        #加入对话组
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_id,
            self.channel_name
        )
        #print(self.channel_name)
        #未开始游戏的房间，视为从大厅进入(暂不考虑从其他房间直接跳转)
        if(self.room.game_state==0):
            hall = Room.objects.get(room_ID=1)
            self.user.in_room=self.room
            self.room.member_num+=1
            hall.member_num-=1
            hall.save()
            #为自己分配一个player
            t_game_info=json.loads(self.room.game_info)
            player_list=t_game_info['player_list']
            #print(player_list)
            #注：因为user_id是字符串，所以这里没有再次转换
            for i in range(1,self.room.member_max+1):
                if(str(i) in player_list):
                    pass
                else:
                    print(i)
                    player_list[str(i)]=[self.user_id,self.user.name]
                    t_game_info['user_list'][self.user_id]=str(i)
                    break

            self.room.game_info=json.dumps(t_game_info)
            print("then")
            #向对话组发送加入消息
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_id,
                {
                    'type': 'mes_member',
                    'message': {
                        'change':'add',
                        'value':[self.user_id,self.user.name]}
                }
            )

            print(self.user.name+"加入房间")
        else:
            #向对话组发送重连消息
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_id,
                {
                    'type': 'mes_member',
                    'message': {
                        'change':'relink',
                        'value':[self.user_id,self.user.name]}
                }
            )
            print(self.user.name+"重连")

        #已开始游戏的房间，只需要重连
        self.user.linking=1
        #print(self.room.room_name)
        #print("yes"+self.user.in_room.room_name)
        self.user.save()
        self.room.save()    

        self.accept()

    #连接中断后的行为
    def disconnect(self, close_code):
        #被拒绝的访问不作任何处理
        if(self.refused):
            return
        #重载数据库models
        self.room = Room.objects.filter(out_room_ID=self.room_id)
        #以下情况个人认为不会发生
        if(self.room.exists()==False):
            print("房间已销毁")
            return
        self.room=self.room[0]
        #如果是房主，首先移交房主
        #顺位寻找
        if(self.room.room_owner==int(self.user_id)):
            t_game_info=json.loads(self.room.game_info)
            t_player_list=t_game_info["player_list"]
            for i in range(1,self.room.member_max+1):
                #print(t_player_list)   
                if(str(i) in t_player_list):
                    player_id=t_player_list[str(i)][0]
                    if(player_id==self.user_id):
                        continue
                    self.room.room_owner=int(player_id)
                    t_game_info["owner"]=player_id
                    #向对话组发送移交房主消息
                    print("房主移交")
                    async_to_sync(self.channel_layer.group_send)(
                        self.room_group_id,
                        {
                            'type': 'mes_member',
                            'message': {
                                'change':'owner',
                                'value':[player_id,self.user.name]}
                        }
                    )
                    break
            self.room.game_info=json.dumps(t_game_info)   
        #根据游戏状态来判断是否移出房间
        if(self.room.game_state==0 or self.room.game_state==3):
            #移出房间
            hall = Room.objects.get(room_ID=1)
            self.room.member_num-=1
            hall.member_num+=1
            self.user.linking=0
            self.user.in_room = hall
            self.user.save()
            #已经没有玩家的房间，移除房间
            #print("房间剩余人数："+str(self.room.member_num))
            if(self.room.member_num==0):
                self.room.delete()
            else:
                self.room.save()
            hall.save()
            #向对话组发送离开消息
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_id,
                {
                    'type': 'mes_member',
                    'message': {
                        'change':'leave',
                        'value':[self.user_id,self.user.name]}
                }
            )
            print(self.user.name+"离开房间")
        else:
            self.user.linking=0
            self.room.save()
            self.user.save()
            print(self.user.name+"掉线")

        #移出对话组
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_id,
            self.channel_name
        )
        #print(self.user.in_room)
    #处理对话组发来的消息
    def mes_member(self, event):
        print(self.user.name+"收到消息")
        print(event)
        #转发给客户端
        self.send(text_data=json.dumps(event))
        #分析消息
        #in_type=event['type']
        #in_mess=event['message']
        #if(in_type=='member'):
            #if(in_mess['change']=='add'):
                #pass
        #message = event['message']
        #数据库的大型数据刷新操作全部交由房主操作
        #if(self.user_id==self.room.room_owner):
        # t_game_info=json.loads(self.room.game_info)
        #t_game_info["player_list"]

    def mes_game(self, event):
        print(self.user.name+"收到消息")
        print(event)
        #转发给客户端
        self.send(text_data=json.dumps(event))    

    #处理从客户端发来的消息
    def receive(self, text_data):
        #直接发送到对话组
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_id,
            {
                'type': 'mes_game',
                'message': 'start'
            }
        )
        #text_data_json = json.loads(text_data)
        #message = text_data_json['message']
        #print("test==================="+text_data)
        #self.send(text_data="hello")