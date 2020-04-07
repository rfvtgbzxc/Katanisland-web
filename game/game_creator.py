import json
def new_ScoreCards(bank=False):
	scoreCards={}
	cards=["artemis","oxford","panama","forbiddencity","vasili"]
	for card in cards:
		if(bank):
			scoreCards[card]=1
		else:
			scoreCards[card]=0
	return scoreCards

def new_Player(index):
	player={}
	# 基本参数
	player["index"]=index
	player["src_secret"]=True
	player["own_cities"]=[]
	player["own_roads"]=[]
	player["brick_num"]=0
	player["wool_num"]=0
	player["wood_num"]=0
	player["grain_num"]=0
	player["ore_num"]=0
	player["soldier_num"]=0
	player["own_score_unshown"]=new_ScoreCards()
	player["own_score_shown"]=new_ScoreCards()
	player["plenty_num"]=0
	player["monopoly_num"]=0
	player["road_making_num"]=0
	# 状态参数
	player["first_dice"]=[0,0]
	player["home_step"]=0
	player["drop_required"]=0
	player["dev_used"]=False
	player["no_build_dev_used"]=False
	player["soldier_get_before"]=0
	player["plenty_get_before"]=0
	player["monopoly_get_before"]=0
	player["road_making_get_before"]=0
	# 其他参数
	player["soldier_used"]=0
	player["road_longest"]=[]
	return player

def new_Cards():
	cards={}
	cards["brick_num"]=19
	cards["wool_num"]=19
	cards["wood_num"]=19
	cards["grain_num"]=19
	cards["ore_num"]=19

	cards["soldier_num"]=14
	#cards["score_cards"]=["The Temple of Artemis","Oxford University","Panama Canal","the Forbidden City","Bishop of Saint Vasili"]
	#cards["score_cards"]=["阿尔忒弥斯神庙","牛津大学","巴拿马运河","紫禁城","圣瓦西里大教堂"]
	cards["own_score_cards"]=new_ScoreCards(True)
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

def new_System(time_per_turn):
	system = {}
	system["step_index"]=0
	system["game_process"]=0
	system["time_per_turn"]=time_per_turn
	system["occupying"]=0
	system["longest_road"]=0
	system["max_minitory"]=0
	system["play_turns"]=0
	system["dice_num"]=[0,0]
	system["owner"]=1
	system["active_trades"]=[]
	system["step_list"]=[]
	system["online_list"]=[]
	system["player_list"]={}
	system["user_list"]={}
	system["recive_list"]=[]
	return system

def init_game_info(player_size,time_per_turn,map_info):
	#初始化
	game_info={}
	system=new_System(time_per_turn)
	players={}
	cities={}
	roads={}
	bank=new_Cards()
	trades={}

	#生成玩家
	for i in range(1,player_size+1):
		players[str(i)]=new_Player(i)
		system["online_list"].append(i)
		system["player_list"][str(i)]=[i,""]
		system["user_list"][str(i)]=i
	#生成交易
	trades[0]=new_Trade(0,0,0)
	for st in range(1,player_size+1):
		for ac in range(0,player_size+1):
			num=st*(player_size+1)+ac
			trades[num]=new_Trade(st,ac,num)

	game_info["system"]=system
	game_info["players"]=players
	game_info["cities"]=cities
	game_info["roads"]=roads
	game_info["bank"]=bank
	game_info["trades"]=trades	

	#初始化强盗位置
	game_info["system"]["occupying"]=map_info["basic_roober"]

	return game_info

#print(init_game_info(2))

