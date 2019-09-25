import json

def new_Player(index):
	player={}
	player["index"]=index
	player["src_secret"]=True
	player["brick_num"]=0
	player["wool_num"]=0
	player["wood_num"]=0
	player["grain_num"]=0
	player["ore_num"]=0
	player["soldier_num"]=0
	player["soldier_used"]=0
	player["score_unshown"]=[]
	player["score_shown"]=[]
	player["plenty_num"]=0
	player["monopoly_num"]=0
	player["road_making_num"]=0
	player["soldier_get_before"]=0
	player["plenty_get_before"]=0
	player["monopoly_get_before"]=0
	player["road_making_get_before"]=0
	player["road_longest"]=[]
	player["own_cities"]=[]
	return player

def new_Cards():
	cards={}
	cards["brick_num"]=19
	cards["wool_num"]=19
	cards["wood_num"]=19
	cards["grain_num"]=19
	cards["ore_num"]=19

	cards["soldier_num"]=14
	cards["score_cards"]=["The Temple of Artemis","Oxford University","Panama Canal","the Forbidden City","Bishop of Saint Vasili"]
	cards["plenty_num"]=2
	cards["monopoly_num"]=2
	cards["road_making_num"]=2
	return cards

def new_Trade(starter,accepter,id):
	trade={}
	trade["id"]=id
	trade["starter"]=starter
	trade["accepter"]=accepter
	trade["trade_state"]="prepare"
	trade["starter_list"]={}
	trade["accepter_list"]={}
	return trade

def init_game_info(player_size):
	#初始化
	game_info={}
	players={}
	cities={}
	roads={}
	cards=new_Cards()
	trades={}
	step_index=0
	game_process=0
	occupying=0
	longest_road=0
	max_minitory=0
	play_turns=0
	dice_num=[0,0]
	owner=1
	active_trades=[]
	step_list=[]
	online_list=[]
	player_list={}
	user_list={}

	#生成玩家
	for i in range(1,player_size+1):
		players[str(i)]=new_Player(i)
		online_list.append(i)
		player_list[str(i)]=[i,""]
		user_list[str(i)]=i
	#生成交易
	for st in range(1,player_size+1):
		for ac in range(0,player_size+1):
			num=st*(player_size+1)+ac
			trades[num]=new_Trade(st,ac,num)
	game_info["step_index"]=step_index
	game_info["game_process"]=game_process
	game_info["occupying"]=occupying

	game_info["longest_road"]=longest_road
	game_info["max_minitory"]=max_minitory

	game_info["play_turns"]=play_turns
	game_info["dice_num"]=dice_num
	game_info["game_process"]=game_process
	
	game_info["owner"]=owner
	game_info["step_list"]=step_list
	game_info["online_list"]=online_list		
	game_info["player_list"]=player_list
	game_info["user_list"]=user_list
	game_info["players"]=players

	game_info["players"]=players
	game_info["cities"]=cities
	game_info["roads"]=roads
	game_info["cards"]=cards
	game_info["trades"]=trades	
	game_info["active_trades"]=active_trades

	return game_info

#print(init_game_info(4))

