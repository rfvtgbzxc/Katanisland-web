import json

def new_Player(index):
	player={}
	player["index"]=index
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
	cards["road_maker_num"]=2
	return cards


def init_game_info(player_size):
	#初始化
	game_info={}
	players={}
	cities={}
	roads={}
	cards=new_Cards()
	game_process=0
	occupying=0
	play_turns=0

	game_info["game_process"]=game_process
	game_info["occupying"]=occupying
	game_info["play_turns"]=play_turns
	game_info["players"]=players
	game_info["cities"]=cities
	game_info["roads"]=roads
	game_info["cards"]=cards
	for i in range(1,player_size+1):
		players[str(i)]=new_Player(str(i))
	return json.dumps(game_info)

print(init_game_info(4))

