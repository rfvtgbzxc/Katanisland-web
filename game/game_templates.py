import copy
import random
def base_info():
	return copy.deepcopy(t_base_info)

def map_setting(type):
	c_map_setting=copy.deepcopy(t_map_setting[type])
	c_map_setting["rand_seed"]=random.randint(0,1000000)
	#c_map_setting["rand_seed"]=num
	return c_map_setting

def game_info(num):
	return test_game_info[str(num)];

t_base_info={
	"index":0,
	"owner":0,
	"step_list":[],
	"online_list":[],
	"player_list":{},
	"user_list":{},
	"game_process":0,
	"occupying":0,
	"play_turns":0,
}

t_map_setting={
	#默认
	"default":{
		"ysize":6,
		"xsize":7,
		"place_set":[7,8,9,13,14,15,16,18,19,20,21,22,25,26,27,28,31,32,33],
		"place_distribution":{"desert": 1,
			"brick": 4,
		    "wood": 4,
		    "wool": 4,
		    "grain": 3,
		    "ore": 3
		},
		"harbor_set":{"13":"up",
			"25":"up",
			"7":"lu",
			"31":"ru",
			"8":"ld",
			"32":"rd",
			"16":"ld",
			"28":"rd",
			"22":"dn",
		},
		"harbor_distrubution":{"any_type": 4,
			"brick": 1,
		    "wood": 1,
		    "wool": 1,
		    "grain": 1,
		    "ore": 1
		},
		"number_distrubution":[2,3,3,4,4,5,5,6,6,8,8,9,9,10,10,11,11,12]
	},
	#富饶
	"fruitful":{
		"ysize":6,
		"xsize":7,
		"place_set":[7,8,9,13,14,15,16,18,19,20,21,22,25,26,27,28,31,32,33],
		"place_distribution":{"desert": 1,
		    "brick": 2,
		    "wood": 5,
		    "wool": 5,
		    "grain": 4,
		    "ore": 2
		},
		"harbor_set":{"13":"up",
			"25":"up",
			"7":"lu",
			"31":"ru",
			"8":"ld",
			"32":"rd",
			"16":"ld",
			"28":"rd",
			"22":"dn",
		},
		"harbor_distrubution":{"any_type": 2,
			"brick": 1,
		    "wood": 2,
		    "wool": 2,
		    "grain": 1,
		    "ore": 1
		},
		"number_distrubution":[2,3,4,4,5,5,5,6,6,8,8,9,9,9,10,10,11,12]
	},
	#山脉
	"mountains":{
		"ysize":6,
		"xsize":7,
		"place_set":[7,8,9,13,14,15,16,18,19,20,21,22,25,26,27,28,31,32,33],
		"place_distribution":{"desert": 1,
			"brick": 5,
		    "wood": 3,
		    "wool": 3,
		    "grain": 3,
		    "ore": 4
		},
		"harbor_set":{"13":"up",
			"25":"up",
			"7":"lu",
			"31":"ru",
			"8":"ld",
			"32":"rd",
			"16":"ld",
			"28":"rd",
			"22":"dn",
		},
		"harbor_distrubution":{"any_type": 2,
			"brick": 2,
		    "wood": 1,
		    "wool": 1,
		    "grain": 1,
		    "ore": 2
		},
		"number_distrubution":[2,3,3,4,4,5,5,6,6,8,8,9,9,10,10,11,11,12]
	},
	"poor":{
		"ysize":6,
		"xsize":7,
		"place_set":[7,8,9,13,14,15,16,18,19,20,21,22,25,26,27,28,31,32,33],
		"place_distribution":{"desert": 3,
			"brick": 4,
		    "wood": 3,
		    "wool": 3,
		    "grain": 3,
		    "ore": 3
		},
		"harbor_set":{
			"18":"up",
			"13":"lu",
			"7":"ld",
			"9":"lu",
			"16":"ld",
			"22":"dn",
			"28":"rd",
			"33":"ru",
			"31":"rd",
			"25":"ru",	
		},
		"harbor_distrubution":{"any_type": 0,
			"brick": 2,
		    "wood": 2,
		    "wool": 2,
		    "grain": 2,
		    "ore": 2
		},
		"number_distrubution":[2,3,3,4,4,5,5,6,8,9,9,10,10,11,11,12]
	}
}


test_game_info={
	"1":{
		"step_index": 0,
		"game_process": 3,
		"occupying": 19,
		"longest_road": 0,
		"max_minitory": 0,
		"play_turns": 4,
		"dice_num": [0, 0],
		"owner": 233,
		"step_list": [1, 2],
		"online_list": [1, 2],
		"trade_count": 0,
		"player_list": {
			"1": [1, "解忧唯杜康"],
			"2": [2, "Fade into fate"]
		},
		"user_list": {
			"233": 1,
			"666": 2
		},
		"players": {
			"1": {
				"index": 1,
				"src_secret": "true",
				"brick_num": 10,
				"wool_num": 20,
				"wood_num": 10,
				"grain_num": 10,
				"ore_num": 3,
				"soldier_num": 1,
				"soldier_used": 0,
				"score_unshown": [],
				"score_shown": [],
				"plenty_num": 1,
				"monopoly_num": 1,
				"road_making_num": 1,
				"soldier_get_before": 0,
				"plenty_get_before": 0,
				"monopoly_get_before": 0,
				"road_making_get_before": 0,
				"road_longest": [42],
				"own_cities": [28, 44]
			},
			"2": {
				"index": 2,
				"src_secret": "true",
				"brick_num": 10,
				"wool_num": 10,
				"wood_num": 10,
				"grain_num": 10,
				"ore_num": 3,
				"soldier_num": 0,
				"soldier_used": 0,
				"score_unshown": [],
				"score_shown": [],
				"plenty_num": 1,
				"monopoly_num": 1,
				"road_making_num": 1,
				"soldier_get_before": 0,
				"plenty_get_before": 0,
				"monopoly_get_before": 0,
				"road_making_get_before": 0,
				"road_longest": [79, 78],
				"own_cities": [53, 54, 27]
			}
		},
		"cities": {
			"28": {
				"owner": 1,
				"level": 1,
				"ex_type": 0
			},
			"44": {
				"owner": 1,
				"level": 0,
				"ex_type": 0
			},
			"53": {
				"owner": 2,
				"level": 0,
				"ex_type": 0
			},
			"54": {
				"owner": 2,
				"level": 0,
				"ex_type": 0
			},
			"27": {
				"owner": 2,
				"level": 0,
				"ex_type": 3
			}
		},
		"roads": {
			"42": {
				"owner": 1
			},
			"50": {
				"owner": 1
			},
			"81": {
				"owner": 2
			},
			"78": {
				"owner": 2
			},
			"79": {
				"owner": 2
			}
		},
		"cards": {
			"brick_num": 17,
			"wool_num": 16,
			"wood_num": 18,
			"grain_num": 19,
			"ore_num": 19,
			"soldier_num": 14,
			"score_cards": ["阿尔忒弥斯神庙", "牛津大学", "巴拿马运河", "紫禁城", "圣米歇尔山"],
			"plenty_num": 2,
			"monopoly_num": 2,
			"road_making_num": 2
		},
		"trades": {
			"3": {
				"id": 3,
				"starter": 1,
				"accepter": 0,
				"trade_state": "prepare",
				"starter_list": {},
				"accepter_list": {}
			},
			"4": {
				"id": 4,
				"starter": 1,
				"accepter": 1,
				"trade_state": "prepare",
				"starter_list": {},
				"accepter_list": {}
			},
			"5": {
				"id": 5,
				"starter": 1,
				"accepter": 2,
				"trade_state": "prepare",
				"starter_list": {},
				"accepter_list": {}
			},
			"6": {
				"id": 6,
				"starter": 2,
				"accepter": 0,
				"trade_state": "prepare",
				"starter_list": {},
				"accepter_list": {}
			},
			"7": {
				"id": 7,
				"starter": 2,
				"accepter": 1,
				"trade_state": "prepare",
				"starter_list": {},
				"accepter_list": {}
			},
			"8": {
				"id": 8,
				"starter": 2,
				"accepter": 2,
				"trade_state": "prepare",
				"starter_list": {},
				"accepter_list": {}
			}
		},
		"active_trades": []
	},
	"2":{
	"step_index": 0,
	"game_process": 1,
	"occupying": 19,
	"longest_road": 0,
	"max_minitory": 0,
	"play_turns": 0,
	"dice_num": [0, 0],
	"owner": 1,
	"step_list": [1, 2],
	"online_list": [1, 2],
	"player_list": {
		"1": [1, "解忧唯杜康"],
		"2": [2, "Fade into fate"]
	},
	"user_list": {
		"1": 1,
		"2": 2
	},
	"players": {
		"1": {
			"index": 1,
			"src_secret": "true",
			"brick_num": 0,
			"wool_num": 0,
			"wood_num": 0,
			"grain_num": 0,
			"ore_num": 0,
			"soldier_num": 0,
			"soldier_used": 0,
			"score_unshown": [],
			"score_shown": [],
			"plenty_num": 0,
			"monopoly_num": 0,
			"road_making_num": 0,
			"soldier_get_before": 0,
			"plenty_get_before": 0,
			"monopoly_get_before": 0,
			"road_making_get_before": 0,
			"road_longest": [],
			"own_cities": []
		},
		"2": {
			"index": 2,
			"src_secret": "true",
			"brick_num": 0,
			"wool_num": 0,
			"wood_num": 0,
			"grain_num": 0,
			"ore_num": 0,
			"soldier_num": 0,
			"soldier_used": 0,
			"score_unshown": [],
			"score_shown": [],
			"plenty_num": 0,
			"monopoly_num": 0,
			"road_making_num": 0,
			"soldier_get_before": 0,
			"plenty_get_before": 0,
			"monopoly_get_before": 0,
			"road_making_get_before": 0,
			"road_longest": [],
			"own_cities": []
		}
	},
	"cities": {
	},
	"roads": {
	},
	"cards": {
		"brick_num": 20,
		"wool_num": 20,
		"wood_num": 20,
		"grain_num": 20,
		"ore_num": 20,
		"soldier_num": 14,
		"score_cards": ["阿尔忒弥斯神庙", "牛津大学", "巴拿马运河", "紫禁城", "圣米歇尔山"],
		"plenty_num": 2,
		"monopoly_num": 2,
		"road_making_num": 2
	},
	"trades": {
		"3": {
			"id": 3,
			"starter": 1,
			"accepter": 0,
			"trade_state": "prepare",
			"starter_list": {},
			"accepter_list": {}
		},
		"4": {
			"id": 4,
			"starter": 1,
			"accepter": 1,
			"trade_state": "prepare",
			"starter_list": {},
			"accepter_list": {}
		},
		"5": {
			"id": 5,
			"starter": 1,
			"accepter": 2,
			"trade_state": "prepare",
			"starter_list": {},
			"accepter_list": {}
		},
		"6": {
			"id": 6,
			"starter": 2,
			"accepter": 0,
			"trade_state": "prepare",
			"starter_list": {},
			"accepter_list": {}
		},
		"7": {
			"id": 7,
			"starter": 2,
			"accepter": 1,
			"trade_state": "prepare",
			"starter_list": {},
			"accepter_list": {}
		},
		"8": {
			"id": 8,
			"starter": 2,
			"accepter": 2,
			"trade_state": "prepare",
			"starter_list": {},
			"accepter_list": {}
		}
	},
	"active_trades": []
}
}
