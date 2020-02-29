import json
import random
global ysize,xsize,place_set,place_distribution,harbor_set,harbor_distrubution,number_distrubution,places,points,edges,cities,players
def new_Point(id):
	point={}
	#point["id"]=id
	#point["harbor"]=0
	return point

def new_Place(id):
	place={}
	#place["id"]=id
	place["create_type"]=0
	place["create_num"]=0
	return place

def new_Edge(id):
	edge={}
	#edge["id"]=id
	#edge["road"]=0
	return edge

def new_Harbor(place_id,direct_in):
	harbor={}
	harbor["place_id"]=place_id
	harbor["direct"]=direct_in
	harbor["ex_type"]=0
	return harbor

def plc_round_places(id):
	if(isinstance(id,int)==False):
		id=int(id)
	x=id//ysize
	y=id%ysize
	#上，下，左上/左下，右上/右下(依据奇偶顺序会有改变)
	rounds=[id-1,id+1,(x-1)*ysize+y+x%2-1,(x-1)*ysize+y+x%2,(x+1)*ysize+y+x%2-1,(x+1)*ysize+y+x%2]
	#print(rounds)
	#删除不存在的
	i=0
	while(i<len(rounds)):
		if(rounds[i] not in place_set):
			del(rounds[i])
			continue
		i+=1
	#print(rounds)
	return rounds
def plc_round_points(id,dir="all"):
	if(isinstance(id,int)==False):
		id=int(id)
	x=id//ysize
	y=id%ysize
	if(dir=="all"):
		rounds=[id*2,id*2+1,id*2+2,id*2+3,(id-ysize+x%2)*2+1,(id+ysize+x%2)*2]
	elif(dir=="up"):
		rounds=[id*2,id*2+1]
	elif(dir=="dn"):
		rounds=[id*2+2,id*2+3]
	elif(dir=="lu"):
		rounds=[id*2,(id-ysize+x%2)*2+1]
	elif(dir=="ld"):
		rounds=[id*2+2,(id-ysize+x%2)*2+1]
	elif(dir=="ru"):
		rounds=[id*2+1,(id+ysize+x%2)*2]
	elif(dir=="rd"):
		rounds=[id*2+3,(id+ysize+x%2)*2]
	#删除不存在的
	i=0
	while(i<len(rounds)):
		if(str(rounds[i]) not in points):
			del(rounds[i])
			continue
		i+=1
	#print(rounds)
	return rounds

def createmap(var):
	global ysize,xsize,place_set,place_distribution,harbor_set,harbor_distrubution,number_distrubution,places,points,edges,cities,players
	#读取地图的初始参数
	var=json.loads(var)
	rand_seed=var["rand_seed"]
	ysize=var["ysize"]
	xsize=var["xsize"]
	place_set=var["place_set"]
	place_distribution=var["place_distribution"]
	harbor_set=var["harbor_set"]
	harbor_distrubution=var["harbor_distrubution"]
	number_distrubution=var["number_distrubution"]


	#准备生成
	#校验数据合理性
	sum_place=0
	sum_src=0
	sum_harbor=0
	for num in place_distribution.values():
		sum_place+=num
	sum_src=sum_place-place_distribution["desert"]
	for num in harbor_distrubution.values():
		sum_harbor+=num

	if(sum_place!=len(place_set)):
		print("资源分布总数与可用地块数不符！")
		return False
	if(sum_src!=len(number_distrubution)):
		print("点数分布总数与可用地块数不符！")
		return False
	if(len(harbor_set)!=sum_harbor):
		print(len(harbor_set))
		print(sum_harbor)
		print("海港分布总数与可用海港数不符！")
		return False
	for place_id in harbor_set:
		if(int(place_id) not in place_set):
			print("有海港不在地块列表中！")
			return False

	#初始化
	random.seed(rand_seed)
	#random.seed(5)
	places={}
	points=[]
	edges=[]
	cities={}
	players={}
	harbors=[]
	map_info={"places":places,
		"points":points,
		"xsize":xsize,
		"ysize":ysize,
		"rand_seed":rand_seed,
		"harbors":harbors,
		"edges":edges
	} 
	game_info={"cities":cities,
		"players":players	
	}
	#对应序列
	order={"desert": 0,
		"brick": 1,
		"wood": 2,
		"wool": 3,
		"grain": 4,
		"ore": 5,
		"any_type":6
	}


	#生成基本数据
	for place_id in place_set:
		places[str(place_id)]=new_Place(str(place_id))
		if(str(place_id) in harbor_set):
			harbors.append(new_Harbor(str(place_id),harbor_set[str(place_id)]))
		x=place_id//ysize
		y=place_id%ysize
		pts=[place_id*2,place_id*2+1,place_id*2+2,place_id*2+3,(place_id-ysize+x%2)*2+1,(place_id+ysize+x%2)*2]
		egs=[place_id*3,place_id*3+1,place_id*3+2,place_id*3+4,((x-1)*ysize+y+x%2)*3+2,((x+1)*ysize+y+x%2)*3]
		for pt_id in pts:
			if(pt_id not in points):
				points.append(pt_id) 
		for eg_id in egs:
			if(eg_id not in edges):
				edges.append(eg_id)

	#分配资源与点数
	#初分配，有序分配
	place_index=0
	src_index=0
	for src_name in place_distribution:
		for i in range(0,place_distribution[src_name]):
			place=places[str(place_set[place_index])]
			place["create_type"]=order[src_name]
			#print(src_name)
			if(src_name!="desert"):
				place["create_num"]=number_distrubution[src_index]
				src_index+=1
			place_index+=1

	#再分配，随机化
	for place_id in places:
		place=places[place_id]
		#随机资源块
		ex_id=str(place_set[random.randint(0,len(place_set)-1)])
		ex_place=places[ex_id]
		#交换资源
		t=place["create_type"]
		place["create_type"]=ex_place["create_type"]
		ex_place["create_type"]=t
		#再随机资源块
		ex_id=str(place_set[random.randint(0,len(place_set)-1)])
		ex_place=places[ex_id]
		#交换点数
		t=place["create_num"]
		place["create_num"]=ex_place["create_num"]
		ex_place["create_num"]=t

	for place_id in places:
		if(places[place_id]["create_type"]==0):
			map_info["basic_roober"]=place_id

	#检查高频数字是否紧邻，是则重生成
	np=False
	while(np==False):
		np=True
		#如果沙漠上有数字，放到没有数字的地方
		#如果没有设置沙漠地块,跳过这一步
		if(place_distribution["desert"]!=0):
			for place in places.values():
				if(place["create_type"]==0 and ["create_num"]!=0):
					for ex_place in places.values():
						if(ex_place["create_num"]==0 and ex_place["create_type"]!=0):
							ex_place["create_num"]=place["create_num"]
							place["create_num"]=0
							break

		for place_id in places:
			place=places[place_id]
			if(place["create_num"] in [6,8]):
				#print("碰到高频数")
				for rd_place_id in plc_round_places(place_id):
					if(places[str(rd_place_id)]["create_num"] in [6,8]):
						#print("重置")
						#随机资源块
						ex_id=str(place_set[random.randint(0,len(place_set)-1)])
						ex_place=places[ex_id]
						#交换点数
						t=place["create_num"]
						place["create_num"]=ex_place["create_num"]
						ex_place["create_num"]=t
						np=False
						break
				if(np==False):
					break
	#分配港口
	#初分配，有序分配
	harbor_srcs=[]
	for src_name in harbor_distrubution:
		for i in range(0,harbor_distrubution[src_name]):
			harbor_srcs.append(order[src_name])
	#再分配，随机化
	for i in range(0,len(harbor_srcs)):
		ex_id=random.randint(0,len(harbor_srcs)-1)
		t=harbor_srcs[i]
		harbor_srcs[i]=harbor_srcs[ex_id]
		harbor_srcs[ex_id]=t
	#执行分配		
	harbor_index=0
	for harbor in harbors:
		harbor["ex_type"]=harbor_srcs[harbor_index]
		harbor_index+=1
	#print(harbors)
	#print(json.dumps(map_info))
	#清除固定种子
	random.seed()
	return map_info


#print(json.dumps(map_info))