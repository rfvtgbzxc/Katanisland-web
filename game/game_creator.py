import json
class GameCreator:
	def __init__(self):
		self.gameData={
		"src_cards":["brick","wood","wool","grain","ore"],
		"dev_cards":{},
		"score_cards":[]
		}
		self.extendListener={
			"Player":[],
			"Game":[],
			"System":[],
		}
	def new_SourceCards(self,bank=False):
		sourceCards={}
		cards=self.gameData["src_cards"]
		for card in cards:
			if(bank):
				sourceCards[card]=20
			else:
				sourceCards[card]=0
		return sourceCards

	def new_ScoreCards(self,bank=False):
		scoreCards={}
		cards=self.gameData["score_cards"]
		for card in cards:
			if(bank):
				scoreCards[card]=1
			else:
				scoreCards[card]=0
		return scoreCards

	def new_DevCards(self,bank=False):
		devCards={}
		cards=self.gameData["dev_cards"]
		for card in cards.keys():
			if(bank):
				devCards[card]=cards[card]
			else:
				devCards[card]=0
		return devCards

	def new_Player(self,index):
		player={}
		# 基本参数
		player["index"]=index
		player["src_secret"]=True
		player["own_cities"]=[]
		player["own_roads"]=[]
		player["own_sources"]=self.new_SourceCards()
		player["own_dev_cards"]=self.new_DevCards()
		player["own_score_unshown"]=self.new_ScoreCards()
		player["own_score_shown"]=self.new_ScoreCards()
		# 状态参数(进度)
		player["first_dice"]=[0,0]
		player["home_step"]=0
		player["drop_required"]=0
		# 拓展额外参数
		for extend in self.extendListener["Player"]:
			extend.extendPlayer(player)
		# 其他参数
		player["road_longest"]=[]
		return player

	def new_Bank(self):
		cards={}
		cards["own_sources"]=self.new_SourceCards(True)
		#cards["score_cards"]=["The Temple of Artemis","Oxford University","Panama Canal","the Forbidden City","Bishop of Saint Vasili"]
		#cards["score_cards"]=["阿尔忒弥斯神庙","牛津大学","巴拿马运河","紫禁城","圣瓦西里大教堂"]
		cards["own_score_cards"]=self.new_ScoreCards(True)
		cards["own_dev_cards"]=self.new_DevCards(True)
		return cards

	def new_Trade(self,starter,accepter,id):
		trade={}
		trade["id"]=id
		trade["starter_index"]=starter
		trade["accepter_index"]=accepter
		trade["trade_state"]="prepare"
		trade["starter_list"]={}
		trade["accepter_list"]={}
		return trade

	def new_System(self,time_per_turn):
		system = {}
		system["step_index"]=0
		system["game_process"]=0
		system["time_per_turn"]=time_per_turn
		system["occupying"]=0
		system["longest_road"]=0
		system["max_minitory"]=0
		system["play_turns"]=0
		system["owner"]=1
		system["active_trades"]=[]
		system["step_list"]=[]
		system["online_list"]=[]
		system["player_list"]={}
		system["user_list"]={}
		system["recive_list"]=[]
		# 拓展额外参数
		for extend in self.extendListener["System"]:
			extend.extendSystem(system)
		return system

	def new_Game(self,player_size,time_per_turn,map_info,extends):
		#按extends加载数据
		for extend_name in extends:
			self.regist_extend(extend_name,self.gameData,self.extendListener)
		#初始化
		game_info={}
		system=self.new_System(time_per_turn)
		players={}
		cities={}
		roads={}
		bank=self.new_Bank()
		trades={}

		#生成玩家
		for i in range(1,player_size+1):
			players[str(i)]=self.new_Player(i)
			system["online_list"].append(i)
			system["player_list"][str(i)]=[i,""]
			system["user_list"][str(i)]=i
		#生成交易
		trades[0]=self.new_Trade(0,0,0)
		for st in range(1,player_size+1):
			for ac in range(0,player_size+1):
				num=st*(player_size+1)+ac
				trades[num]=self.new_Trade(st,ac,num)

		game_info["system"]=system
		game_info["players"]=players
		game_info["cities"]=cities
		game_info["roads"]=roads
		game_info["bank"]=bank
		game_info["trades"]=trades	

		#初始化强盗位置
		game_info["system"]["occupying"]=map_info["basic_roober"]

		# 拓展额外参数
		for extend in self.extendListener["Game"]:
			extend.extendGame(game_info)
		print(game_info)
		return game_info

	def regist_extend(self,extend_name,gameData,extendListener):
		if(extend_name=="BasicExtend"):
			basicExtend = BasicExtend(self)
			self.extendListener["System"].append(basicExtend)
			self.extendListener["Player"].append(basicExtend)
		if(extend_name=="SaberExtend"):
			saberExtend = SaberExtend(self)
			self.extendListener["Game"].append(saberExtend)
			self.extendListener["System"].append(saberExtend)
			self.extendListener["Player"].append(saberExtend)

def init_game_info(player_size,time_per_turn,map_info,extends):
	return GameCreator().new_Game(player_size,time_per_turn,map_info,extends)

# 纯接口类，不携带任何数据
class BasicExtend:
	def __init__(self,gameCreator):
		self.upCrt=gameCreator
		self.extendDevs()
		self.extendScores()

	def extendDevs(self):
		self.upCrt.gameData["dev_cards"]["soldier"]=14
		self.upCrt.gameData["dev_cards"]["plenty"]=2
		self.upCrt.gameData["dev_cards"]["monopoly"]=2
		self.upCrt.gameData["dev_cards"]["road_making"]=2
	def extendScores(self):
		self.upCrt.gameData["score_cards"]+=["artemis","oxford","panama","forbiddencity","vasili"]

	def extendPlayer(self,player):
		player["dev_used"]=False
		player["no_build_dev_used"]=False
		player["dev_get_before"]=self.upCrt.new_DevCards()
		player["soldier_used"]=0

	def extendSystem(self,system):
		system["dice_num"]=[0,0]
		system["dice_7_step"]=0

class SaberExtend:
	def __init__(self,gameCreator):
		self.upCrt=gameCreator
		self.extendSrc()
		self.extendDevs()
	def extendDevs(self):
		self.upCrt.gameData["dev_cards"]["alchemist"]=2
		self.upCrt.gameData["dev_cards"]["crane"]=2
		self.upCrt.gameData["dev_cards"]["engineer"]=1
		self.upCrt.gameData["dev_cards"]["inventor"]=2
		self.upCrt.gameData["dev_cards"]["irrigation"]=2
		self.upCrt.gameData["dev_cards"]["medicine"]=2
		self.upCrt.gameData["dev_cards"]["mining"]=2
		self.upCrt.gameData["dev_cards"]["road_building"]=2
		self.upCrt.gameData["dev_cards"]["smith"]=2

		self.upCrt.gameData["dev_cards"]["bishop"]=2
		self.upCrt.gameData["dev_cards"]["diplomat"]=2
		self.upCrt.gameData["dev_cards"]["deserter"]=2
		self.upCrt.gameData["dev_cards"]["intrigue"]=2
		self.upCrt.gameData["dev_cards"]["saboteur"]=2
		self.upCrt.gameData["dev_cards"]["spy"]=3
		self.upCrt.gameData["dev_cards"]["warlord"]=2
		self.upCrt.gameData["dev_cards"]["wedding"]=2

		self.upCrt.gameData["dev_cards"]["commercial_harbor"]=2
		self.upCrt.gameData["dev_cards"]["master_merchant"]=2
		self.upCrt.gameData["dev_cards"]["merchant"]=6
		self.upCrt.gameData["dev_cards"]["merchant_fleet"]=2
		self.upCrt.gameData["dev_cards"]["resource_monopoly"]=4
		self.upCrt.gameData["dev_cards"]["trade_monopoly"]=2

	def extendSrc(self):
		self.upCrt.gameData["src_cards"]+=["coin","paper","crystal"]
	def extendGame(self,game):
		game["sabers"]={}
	def extendSystem(self,system):
		system["dice_num"]=[0,0,0]
		system["dice_step"]=0
	def extendPlayer(self,player):
		player["dev_process"]={"commerce":0,"science":0,"politic":0}

#print(init_game_info(2))

