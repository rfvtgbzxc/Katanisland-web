from django.db import models

class Room(models.Model):
	room_ID=models.AutoField(primary_key=True)  #房间自增长ID
	out_room_ID=models.IntegerField(default=0) #外部查看id，便于玩家查找
	room_name=models.CharField(max_length=20) #房间名
	room_owner=models.IntegerField(default=0) #房主id
	password=models.CharField(max_length=20,default="",null=True)#房间密码
	game_state=models.IntegerField(null=True,default=0) #游戏状态
	map_size=models.IntegerField(null=True,default=0) #地图大小
	game_info=models.CharField(max_length=100000) #游戏数据
	map_setting=models.CharField(max_length=10000,default="geneal") #地图基础设置
	map_info=models.CharField(max_length=10000,default="geneal") #地图数据
	member_num=models.IntegerField(null=True,default=0) #加入玩家数
	member_max=models.IntegerField(null=True,default=2) #房间最大玩家数
	def __str__(self):
		return self.room_name

class User(models.Model):
	ID=models.AutoField(primary_key=True)  #用户ID
	password=models.CharField(max_length=18) #用户密码
	name=models.CharField(max_length=20) #用户昵称
	linking=models.IntegerField(null=True,default=0) #已与房间建立连接
	#in_room=models.IntegerField(null=True,default=0) #所在游戏房间
	in_room=models.ForeignKey(Room, on_delete=models.DO_NOTHING,related_name='players',null=True)
	def __str__(self):
		return self.name

