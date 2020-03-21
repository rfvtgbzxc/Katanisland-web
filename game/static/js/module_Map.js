//用于处理地图的点、边、块的抽象关系的模块。
//--------------------------------------------------------
// 计算最长道路
// 算法：dfs搜索以每条边为起点的最长路径,再在里面选最长。
//--------------------------------------------------------
function cal_longest_road(player_index){
	var roads=all_roads(player_index);
	var pathes=[];
	//第一遍
	for(road_index in roads){
		var road_id=roads[road_index];
		var path=[road_id];
		//his_window.push("初始搜索"+road_id)
		path=dp_search_road(path,player_index);
		pathes.push(path.concat());
	}
	var max_index=0;
	var max_length=0;
	for(var path_index in pathes){
		if(pathes[path_index].length>max_length){
			max_length=pathes[path_index].length;
			max_index=path_index;
		}
	}
	//his_window.push("-------搜索结束---------")
	if(pathes[max_index]==null){
		return [];
	}
	else{
		return pathes[max_index];
	}
}
//--------------------------------------------------------
// 深度搜索
// 特殊1：游戏规则中,道路的连接点如果有其他人的城市的话就会断开。
// 骑士拓展中,有其他玩家的骑士一样。
// 特殊2：除第一条边,其他边寻找相邻边时，不能找来路那条边(Y字形不能从左上往下经过一竖后再去右上)
//--------------------------------------------------------
function dp_search_road(path_now,player_index,from_pt=null){
	var edge_now=path_now[path_now.length-1];
	var edges_round=edge_round_edges_with_pt(edge_now,"road_self");
	var pathes=[];
	var ever_searched=false;
	//不记录被其他玩家占据的节点以及来路的交点
	//his_window.push("---新的搜索,目前路径："+JSON.stringify(path_now)+"---");
	//his_window.push("边"+edge_now+"有以下两个点：");
	for(var point_id in edges_round){
		if(game_info.cities.hasOwnProperty(point_id)){
			if(game_info.cities[point_id].owner!=player_index){
				//his_window.push("点"+point_id+"被放弃,因为被占据");
				continue;
			}
		}
		if(point_id==from_pt){
			//his_window.push("点"+point_id+"被放弃,因为从这里来");
			continue;
		}
		//除已经过的边,进行深度搜索
		var edges_next=edges_round[point_id];
		//his_window.push("点"+point_id+"有以下可用边：");
		for(edge_index in edges_next){
			var edge_id=edges_next[edge_index];
			if(path_now.indexOf(edge_id)==-1){
				ever_searched=true;
				//his_window.push("从"+point_id+"节点向"+edge_id+"搜索")
				pathes.push(dp_search_road(path_now.concat(edge_id),player_index,point_id));
			}
		}
	}
	//已没有可以探寻的边,则返回当前的道路
	if(ever_searched==false){
		//his_window.push("没有可以走的道路,返回")
		return path_now;
	}
	//从遍历的道路中选择最长的一条返回
	var max_index=0;
	var max_length=0;
	for(var path_index in pathes){
		if(pathes[path_index].length>max_length){
			max_length=pathes[path_index].length;
			max_index=path_index;
		}
	}
	if(pathes[max_index]==null){
		return [];
	}
	else{
		return pathes[max_index];
	}
}
//--------------------------------------------------------
// 获取玩家可设置强盗的地块
//--------------------------------------------------------
function available_places(){
	//只需要删除有强盗的地块即可
	var places=[];
	for(var place_id in map_info.places){
		if(place_id!=game_info.occupying){
			places.push(parseInt(place_id));
		}
	}
	return places;
}
//--------------------------------------------------------
// 获取玩家可修路的边
// 要求：玩家所有的道路附近的边+玩家所有定居点、城市附近的边
// temp_edge:额外考虑temp_edge
//--------------------------------------------------------
function available_edges(player_index,temp_edge=[]){
	return sQuery("edge",$gamePlayers[player_index].own_roads).union(temp_edge).near_points()
	.not(function(point_id){
		return $gameCities.hasOwnProperty(point_id);
	}).near_edges().union(sQuery("point",$gamePlayers[player_index].own_cities).near_edges())
	.not($gamePlayers[player_index].own_roads).get_list();
}
//--------------------------------------------------------
// 获取玩家可定居的点
// 要求：玩家所有的道路附近的点,且这些点以及附近不能有任何人的定居点、城市
//--------------------------------------------------------
function available_points(player_index){
	return sQuery("edge",$gamePlayers[player_index].own_roads).near_points()
	.not(function(point_id){
		if($gameCities.hasOwnProperty(point_id)){
			return true;
		}
		for(let pt_id of sQuery("point",point_id).near_points().get_list()){
			if($gameCities.hasOwnProperty(pt_id)){
				return true;
			}
		}
		return false;
	}).get_list();
}
//--------------------------------------------------------
// 获取玩家可定居的点(开局时)
// 要求：所有点,但这些点以及附近不能有任何人的定居点、城市
//--------------------------------------------------------
function available_points_st(player_index){
	return sQuery("point",$gameSystem.all_points()).not(function(point_id){
		if($gameCities.hasOwnProperty(point_id)){
			return true;
		}
		for(let pt_id of sQuery("point",point_id).near_points().get_list()){
			if($gameCities.hasOwnProperty(pt_id)){
				return true;
			}
		}
		return false;
	}).get_list();
}
//--------------------------------------------------------
// 获取骑士能够移动的地方
// 没有实装,就爽爽sQuery
//--------------------------------------------------------
function available_saber_move_points(player_index,saber_id,initiative=false){
	return sQuery("edge",$gamePlayers[player_index].own_roads).near_points()
	.not(function(point_id){
		return $gameCities.hasOwnProperty(point_id);
	}).not($gameSabers[saber_id].occupying)
	.not(function(point_id){
			if($gameSabers.map.hasOwnProperty(point_id)){
				if(initiative && $gameSabers[saber_id].level > $gameSabers.map[point_id].level){
					return false;
				}
			}
			return true;
	}).get_list();
}
//--------------------------------------------------------
// 获取商队能够放置的地方
// 没有实装,就爽爽sQuery
//--------------------------------------------------------
function available_merchant_set_points(player){
	return sQuery("points",player.own_cities).near_places().get_list();
}
//--------------------------------------------------------
// 获取玩家所有城市
//--------------------------------------------------------
function all_cities(player_index){
	var cities=[];
	for(var city_id in game_info.cities){
		if(game_info.cities[city_id].owner==player_index){
			cities.push(city_id);
		}
	}
	return cities;
}
//--------------------------------------------------------
// 获取地块对应方向的地块id
// place_id：地块id ,dir：方向 0~5从上顺时针计数
//--------------------------------------------------------
function plc_near_places(place_id,dir=[0,1,2,3,4,5]){
	place_id=parseInt(place_id);
	var is_single=false;
	//非str视为数组
	if(typeof(dir)!="object"){
		is_single=true;
		need=[dir];
	}
	else{
		need=dir;
	}
	//输入检查
	if(isNaN(place_id)){
		if(is_single){
			return null;
		}
		else{
			return [];
		}	
	}
	var xi=parseInt(place_id/ysize);
	var yi=place_id%ysize;
	var places=[];
	for(i in need){
		switch(parseInt(need[i])){
			case 0:
				places.push(place_id-1);
				break;
			case 1:
				places.push((xi+1)*ysize+yi+xi%2-1);
				break;
			case 2:
				places.push((xi+1)*ysize+yi+xi%2);
				break;
			case 3:
				places.push(place_id+1);
				break;
			case 4:
				places.push((xi-1)*ysize+yi+xi%2);
				break;
			case 5:
				places.push((xi-1)*ysize+yi+xi%2-1);
				break;
		}
	}
	//删除不存在的地块
	//因为代码的特殊性,即使不存在的地块也可以调用,逻辑为单地块则不删除
	if(is_single){
		return places[0];
	}
	var i=0;
	while(i<places.length){
		if(map_info.places.hasOwnProperty(places[i])==false){
			places.splice(i,1);
			continue;
		}
		i++;			
	}
	return places;
}
//--------------------------------------------------------
// 获取地块对应方向的边id
// place_id：地块id ,dir：方向 0~5从上顺时针计数
//--------------------------------------------------------
function plc_round_edges(place_id,dir=[0,1,2,3,4,5]){
	place_id=parseInt(place_id);
	var is_single=false;
	//非str视为数组
	if(typeof(dir)!="object"){
		is_single=true;
		need=[dir];
	}
	else{
		need=dir;
	}
	//输入检查
	if(isNaN(place_id)){
		if(is_single){
			return null;
		}
		else{
			return [];
		}	
	}
	var xi=parseInt(place_id/ysize);
	var yi=place_id%ysize;
	var edges=[];
	for(i in need){
		switch(parseInt(need[i])){
			case 0:
				edges.push(3*place_id+1);
				break;
			case 1:
				edges.push(3*place_id+2);
				break;
			case 2:
				edges.push(3*plc_near_places(place_id,2));
				break;
			case 3:
				edges.push(3*(place_id+1)+1);
				break;
			case 4:
				//alert("?");
				//alert(place_id);
				//alert(plc_near_places(place_id,4));
				//alert(3*plc_near_places(place_id,4)+2);
				edges.push(3*plc_near_places(place_id,4)+2);
				break;
			case 5:
				edges.push(3*place_id);
				break;
		}
	}
	//删除不存在的边
	var i=0;
	while(i<edges.length){
		if(map_info.edges.indexOf(edges[i])==-1){
			edges.splice(i,1);
			continue;
		}
		i++;			
	}
	if(is_single){
		return edges[0];
	}
	else
	{
		return edges;
	}
}
//--------------------------------------------------------
// 获取地块对应的所有点的id
// place_id：地块id
//--------------------------------------------------------
function plc_round_points(place_id){
	var x=parseInt(place_id/ysize);
	//输入检查
	if(isNaN(place_id)){
		return [];
	}
	var y=place_id%ysize;
	var place_id=parseInt(place_id);
	var points=[place_id*2,place_id*2+1,place_id*2+2,place_id*2+3,(place_id-ysize+x%2)*2+1,(place_id+ysize+x%2)*2]
	//删除不存在的点
	var i=0;
	while(i<points.length){
		if(map_info.points.indexOf(points[i])==-1){
			points.splice(i,1);
			continue;
		}
		i++;			
	}
	//alert(points);
	return points;
}
//--------------------------------------------------------
// 获取一条边周围所有边的id
// edge_id：边id
// type：边的类型：edge 默认值所有边,blank_edge 未有道路的边,road 有道路的边,road_self 有自己的道路的边
//--------------------------------------------------------
function edge_round_edges(edge_id,type="edge"){
	var need;
	switch(type){
		case "edge":
			need=3;
			break;
		case "blank_edge":
			need=2;
			break;
		case "road":
			need=1;
			break;
		case "road_self":
			need=0;
			break;
	}
	//输入检查
	edge_id=parseInt(edge_id);
	if(isNaN(edge_id)){
		return [];
	}
	var place_id=parseInt(edge_id/3);
	var xi=parseInt(place_id/ysize);
	var yi=place_id%ysize;
	var dir=edge_id%3;
	var edges;
	if(dir==0){
	edges=[edge_id+1,3*((xi-1)*ysize+yi+xi%2-1)+2,3*((xi-1)*ysize+yi+xi%2)+1,3*((xi-1)*ysize+yi+xi%2)+1];
	}
	else if(dir==1){
		edges=[edge_id-1,edge_id+1,3*((xi-1)*ysize+yi+xi%2-1)+2,3*((xi+1)*ysize+yi+xi%2-1)];
	}
	else{
		edges=[edge_id-1,3*((xi+1)*ysize+yi+xi%2-1),3*((xi+1)*ysize+yi+xi%2),3*((xi+1)*ysize+yi+xi%2)+1];
	}
	//删除不存在的边
	var i=0;
	while(i<edges.length){
		if(map_info.edges.indexOf(edges[i])==-1){
			edges.splice(i,1);
			continue;
		}
		i++;			
	}
	if(need==3){return edges;}
	var self_edge_owner;
	if(game_info.roads.hasOwnProperty(edge_id)){
		self_edge_owner=game_info.roads[edge_id].owner;
	}
	else if(need==0){need=2;}
	//删除不符合要求的边
	while(i<edges.length){
		if(game_info.roads.hasOwnProperty(edges[i])){
			if(need==2)
			{
				edges.splice(i,1);
				continue;
			}
			else if(game_info.roads[edges[i]].owner!=self_edge_owner && need==0){
				edges.splice(i,1);
				continue;
			}	
		}
		else if(need==0 || need==1){
			kid_edges.splice(i,1);
			continue;
		}
		i++;			
	}
	return edges;
}
//--------------------------------------------------------
// 以节点为基础,获取一条边周围所有边的id
// edge_id：边id
// type：边的类型：edge 默认值 所有边,blank_edge 未有道路的边,road 有道路的边,road_self 有自己的道路的边
//--------------------------------------------------------
function edge_round_edges_with_pt(edge_id,type="edge"){
	var need;
	switch(type){
		case "edge":
			need=3;
			break;
		case "blank_edge":
			need=2;
			break;
		case "road":
			need=1;
			break;
		case "road_self":
			need=0;
			break;
	}
	//输入检查
	edge_id=parseInt(edge_id);
	if(isNaN(edge_id)){
		return [];
	}
	var place_id=parseInt(edge_id/3);
	var xi=parseInt(place_id/ysize);
	var yi=place_id%ysize;
	var dir=edge_id%3;
	var edges;
	edges={};
	if(dir==0){
		edges[2*place_id]=[edge_id+1,3*((xi-1)*ysize+yi+xi%2-1)+2];
		edges[2*((xi-1)*ysize+yi+xi%2)+1]=[3*((xi-1)*ysize+yi+xi%2)+1,3*((xi-1)*ysize+yi+xi%2)+2];
	}
	else if(dir==1){
		edges[2*place_id]=[edge_id-1,3*((xi-1)*ysize+yi+xi%2-1)+2];
		edges[2*place_id+1]=[edge_id+1,3*((xi+1)*ysize+yi+xi%2-1)];
	}
	else{
		edges[2*place_id+1]=[edge_id-1,3*((xi+1)*ysize+yi+xi%2-1)];
		edges[2*((xi+1)*ysize+yi+xi%2)]=[3*((xi+1)*ysize+yi+xi%2),3*((xi+1)*ysize+yi+xi%2)+1];
	}
	//删除不存在的边
	for(var edges_index in edges)
	{
		var i=0;
		var t_edges=edges[edges_index];
		while(i<t_edges.length){
			if(map_info.edges.indexOf(t_edges[i])==-1){
				t_edges.splice(i,1);
				continue;
			}
			i++;			
		}
	}
	if(need==3){return edges;}
	var self_edge_owner;
	if(game_info.roads.hasOwnProperty(edge_id)){
		self_edge_owner=game_info.roads[edge_id].owner;
	}
	else if(need==0){need=2;}
	//删除不符合要求的边
	for(point_id in edges){
		var kid_edges=edges[point_id];
		var i=0;
		while(i<kid_edges.length){
			if(game_info.roads.hasOwnProperty(kid_edges[i])){
				if(need==2)
				{
					kid_edges.splice(i,1);
					continue;
				}
				else if(game_info.roads[kid_edges[i]].owner!=self_edge_owner && need==0){
					kid_edges.splice(i,1);
					continue;
				}	
			}
			else if(need==0 || need==1){
				kid_edges.splice(i,1);
				continue;
			}
			i++;	
		}			
	}
	return edges;
}

//--------------------------------------------------------
// 获取一条边端点的id
// edge_id：边id
//--------------------------------------------------------
function edge_round_points(edge_id){
	//输入检查
	edge_id=parseInt(edge_id);
	if(isNaN(edge_id)){
		return [];
	}
	var place_id=parseInt(edge_id/3);
	var points;
	switch(edge_id%3){
		case 0:
			points=[2*place_id,2*plc_near_places(place_id,4)+1];
			break;
		case 1:
			points=[2*place_id,2*place_id+1];
			break;
		case 2:
			points=[2*place_id+1,2*plc_near_places(place_id,2)];
	}
	//his_window.push("边"+edge_id+"周围的点id："+JSON.stringify(points));
	//删除不存在的点
	var i=0;
	while(i<points.length){
		if(map_info.points.indexOf(points[i])==-1){
			points.splice(i,1);
			continue;
		}
		i++;			
	}
	return points;
}
//--------------------------------------------------------
// 获取一个点周围所有地块的id
// point_id：点id
//--------------------------------------------------------
function pt_round_places(point_id){
	point_id=parseInt(point_id);
	//检查输入
	if(isNaN(point_id)){
		return [];
	}
	var place_id=parseInt(point_id/2);
	var xi=parseInt(place_id/ysize);
	var yi=place_id%ysize;
	var pos=point_id%2;
	var places;
	if(pos==0){
		places=union([place_id],plc_near_places(place_id,[0,5]));
	}
	else{
		places=union([place_id],plc_near_places(place_id,[0,1]));
	}
	//删除不存在的块
	var i=0;
	while(i<places.length){
		if(map_info.places.hasOwnProperty(places[i])==-1){
			places.splice(i,1);
			continue;
		}
		i++;			
	}
	return places;
}
//--------------------------------------------------------
// 获取一个点周围所有边的id
// point_id：点id
//--------------------------------------------------------
function pt_round_edges(point_id){
	point_id=parseInt(point_id);
	//检查输入
	if(isNaN(point_id)){
		return [];
	}
	var place_id=parseInt(point_id/2);
	var xi=parseInt(place_id/ysize);
	var yi=place_id%ysize;
	var pos=point_id%2;
	var edges;
	if(pos==0){
		edges=[3*place_id,3*place_id+1,3*((xi-1)*ysize+yi-1+xi%2)+2];
	}
	else{
		edges=[3*place_id+1,3*place_id+2,3*((xi+1)*ysize+yi-1+xi%2)];
	}
	//删除不存在的边
	var i=0;
	while(i<edges.length){
		if(map_info.edges.indexOf(edges[i])==-1){
			edges.splice(i,1);
			continue;
		}
		i++;			
	}
	return edges;
}
//--------------------------------------------------------
// 获取一个点周围所有点的id
// point_id：点id
//--------------------------------------------------------
function pt_round_points(point_id){
	point_id=parseInt(point_id);
	//检查输入
	if(isNaN(point_id)){
		return [];
	}
	var place_id=parseInt(point_id/2);
	var points;
	if(point_id%2==0){
		points=[point_id+1,2*plc_near_places(place_id,5)+1,2*plc_near_places(place_id,4)+1];
	}
	else{
		points=[point_id-1,2*plc_near_places(place_id,1),2*plc_near_places(place_id,2)];
	}
	//删除不存在的点
	var i=0;
	while(i<points.length){
		if(map_info.points.indexOf(points[i])==-1){
			points.splice(i,1);
			continue;
		}
		i++;			
	}
	return points;
}
//--------------------------------------------------------
// 地图选择器集合
// 用于为快速筛选合适的选择器提供解决方案
//--------------------------------------------------------
function sQuery(type,input_id_list=[]){
	//检查输入
	var id_list = SelectorQuery.prototype.check_input(input_id_list);
	//去除重复
	var vis={};
	var new_id_list=[];
	for(let i of id_list){
		if(!vis.hasOwnProperty(i)){
			new_id_list.push(i);
			vis[i]=true;
		}
	}
	//生成并返回对象
	return new SelectorQuery(type,new_id_list);
}
function SelectorQuery(type,id_list){
	this.type = type;
	this.id_list = id_list;
}
//--------------------------------------------------------
// 获取列表
//--------------------------------------------------------
SelectorQuery.prototype.get_list =function(){
	return this.id_list;
}
//--------------------------------------------------------
// 检查输入,并转化为Array
// 支持输入：数字、数组、SQ对象
//--------------------------------------------------------
SelectorQuery.prototype.check_input = function(obj){
	var new_list;
	if(typeof(obj) == "number"){
		new_list=[obj];
	}
	else if(obj instanceof SelectorQuery){
		new_list=obj.get_list();
	}
	else{
		new_list=obj;
	}
	return new_list;
};
//--------------------------------------------------------
// 并入SQ
// 支持输入：数字、数组、SQ对象
//--------------------------------------------------------
SelectorQuery.prototype.union = function(input_list){
	//检查输入
	var other_list = this.check_input(input_list);
	this.id_list = this.id_list.concat(other_list.filter(function(v) {
        return this.id_list.indexOf(v) === -1},this));
	return this;
};
//--------------------------------------------------------
// 条件筛选函数
// 支持输入：数字、数组、SQ对象、函数
//--------------------------------------------------------
SelectorQuery.prototype.filter = function(input_request){
	//检查输入
	//函数的话,遍历并根据返回值进行筛选
	if(typeof(input_request) == "function"){
		this.id_list=this.id_list.filter(function(v){
			return input_request(v);
		});
	}
	//其他的,转换为列表后使用
	else{
		var other_list = this.check_input(input_request);
		this.id_list = this.id_list.filter(function(v){
			return other_list.indexOf(v)!=-1;
		});
	}
	return this;	
};
//--------------------------------------------------------
// 条件反筛函数
// 支持输入：数字、数组、SQ对象、函数
//--------------------------------------------------------
SelectorQuery.prototype.not = function(input_request){
	//检查输入
	//函数的话,遍历并根据返回值进行筛选
	if(typeof(input_request) == "function"){
		this.id_list=this.id_list.filter(function(v){
			return !input_request.call(this,v);
		},this);
	}
	//其他的,转换为列表后使用
	else{
		var other_list = this.check_input(input_request);
		this.id_list = this.id_list.filter(function(v){
			return other_list.indexOf(v)==-1;
		});
	}
	return this;	
};
//--------------------------------------------------------
// 获取周围的地块
//--------------------------------------------------------
SelectorQuery.prototype.near_places = function(){
	//不同的SQ有不同的获取方式
	var places = [];
	switch(this.type){
	case "place":
		for(let place_id of this.id_list){
			places = union(places,plc_near_places(place_id));
		}
		break;
	case "edge":
		for(let edge_id of this.id_list){
			places = union(places,edge_round_places(edge_id));
		}
		break;
	case "point":
		for(let point_id of this.id_list){
			places = union(places,pt_round_places(point_id));
		}
		break;
	}
	this.type = "place";
	this.id_list=places;
	return this;
};
//--------------------------------------------------------
// 获取周围的边
//--------------------------------------------------------
SelectorQuery.prototype.near_edges = function(){
	//不同的SQ有不同的获取方式
	var edges = [];
	switch(this.type){
	case "place":
		for(let place_id of this.id_list){
			edges = union(edges,plc_round_edges(place_id));
		}
		break;
	case "edge":
		for(let edge_id of this.id_list){
			edges = union(edges,edge_round_edges(edge_id));
		}
		break;
	case "point":
		for(let point_id of this.id_list){
			edges = union(edges,pt_round_edges(point_id));
		}
		break;
	}
	this.type = "edge";
	this.id_list=edges;
	return this;
};
//--------------------------------------------------------
// 获取周围的点
//--------------------------------------------------------
SelectorQuery.prototype.near_points = function(){
	//不同的SQ有不同的获取方式
	var points = [];
	switch(this.type){
	case "place":
		for(let place_id of this.id_list){
			points = union(points,plc_round_points(place_id));
		}
		break;
	case "edge":
		for(let edge_id of this.id_list){
			points = union(points,edge_round_points(edge_id));
		}
		break;
	case "point":
		for(let point_id of this.id_list){
			points = union(points,pt_round_points(point_id));
		}
		break;
	}
	this.type = "point";
	this.id_list=points;
	return this;
};
