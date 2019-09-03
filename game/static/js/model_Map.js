//用于处理地图的点、边、块的抽象关系的模块。
//--------------------------------------------------------
// 计算最长道路
// 算法：dfs搜索以任一条边为起点的最长边，再以最长边的末端为起点搜索最长边。
//--------------------------------------------------------
function cal_longest_road(player_index){
	var roads=all_roads(player_index);
	visited=[];
	var pathes=[];
	//第一遍
	for(road_index in roads){
		var road_id=roads[road_index];
		if(visited.indexOf(road_id)==-1){
			visited.push(road_id);
			var path=[road_id];
			path=dp_search_road(path,player_index);
			pathes.push(path.concat());
		}
	}
	//第二遍
	for(var path_index in pathes){
		var path=pathes[path_index];
		pathes[path_index]=dp_search_road([path[path.length-1]],player_index);
	}
	//alert(pathes)
	//查看最长路
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
	for(point_id in edges_round){
		if(game_info.cities.hasOwnProperty(point_id)){
			if(game_info.cities[point_id].owner!=player_index){
				continue;
			}
		}
		if(point_id==from_pt){
			continue;
		}
		//除已经过的边,进行深度搜索
		var edges_next=edges_round[point_id];
		for(edge_index in edges_next){
			var edge_id=edges_next[edge_index];
			if(path_now.indexOf(edge_id)==-1){
				ever_searched=true;
				visited.push(edge_id);
				alert("从"+point_id+"节点向"+edge_id+"搜索")
				pathes.push(dp_search_road(path_now.concat(edge_id),player_index,point_id));
			}
		}
	}
	//已没有可以探寻的边,则返回当前的道路
	if(ever_searched==false){
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
// 获取玩家可修路的边
//--------------------------------------------------------
function avaliable_edges(player_index){
	var roads=all_roads(player_index);
	var available_edges_from_road={};
	var available_edges_all=[];
	for(var base_road_index in roads){
		var base_road_id=roads[base_road_index];
		available_edges_from_road[base_road_id]=edge_round_edges_with_pt(base_road_id,"blank_edge");
	}
	//无视有其他玩家已坐城点的备选道路
	for(var base_road_id in available_edges_from_road){
		for(var available_pt in available_edges_from_road[base_road_id]){
			if(game_info.cities.hasOwnProperty(available_pt) && game_info.cities[available_pt].owner!=user_index){
				//delete available_edges[available_pt];
				continue;
			}
			else{
				var t_edges=available_edges_from_road[base_road_id][available_pt];
				available_edges_all=union(available_edges_all,t_edges);
				/*for(i in t_edges){
					//已有道路的边无法选择
					if(game_info.roads.hasOwnProperty(t_edges[i])){continue;}
					$("edge_selector").filter("#"+t_edges[i]).addClass("active").show();
				}*/
			}
		}			
	}
	//自己城市周边的三条边可以放置道路,已有道路的边无法选择
	var cities=all_cities(player_index);
	var available_edges_from_city=[];
	for(var base_pt in cities){
		available_edges_from_city=union(available_edges_from_city,pt_round_edges(cities[base_pt]));
	}
	available_edges_all=union(available_edges_all,available_edges_from_city);
	//删除已有道路的边
	for(var i in available_edges_all){
		if(game_info.roads.hasOwnProperty(available_edges_all[i])){
			delete available_edges_all[i];
			continue;
		}			
	}
	return available_edges_all;
}
//--------------------------------------------------------
// 获取玩家可定居的点
//--------------------------------------------------------
function avaliable_points(player_index){
	var roads=all_roads(player_index);
	var avaliable_points_all=[];
	//获取自己所有道路的端点
	for(var i in roads){
		avaliable_points_all=union(avaliable_points_all,edge_round_points(roads[i]));	
	}
	//alert(avaliable_points_all);
	//alert(pt_round_points(38))
	//删除自己或周围有其他城市的点
	var i=0;
	while(i<avaliable_points_all.length){
		//alert("1");
		var can_settle=true;
		if(game_info.cities.hasOwnProperty(avaliable_points_all[i])){
			avaliable_points_all.splice(i,1);
			continue;
		}
		var near_pts=pt_round_points(avaliable_points_all[i]);	
		for(var j in near_pts){
			if(game_info.cities.hasOwnProperty(near_pts[j])){
				avaliable_points_all.splice(i,1);
				//alert(avaliable_points_all)
				can_settle=false;
				break;
			}
		}
		if(can_settle){
			i++;
		}
		//alert("2");				
	}
	return avaliable_points_all;
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
	var i=0;
	while(i<places.length){
		if(map_info.places.hasOwnProperty(places[i])==false){
			places.splice(i,1);
			continue;
		}
		i++;			
	}
	if(is_single){
		return places[0];
	}
	else
	{
		return places;
	}
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
		edges=[3*place_id,3*place_id+1,3*((xi-1)*ysize+ysize-1+xi%2)+2];
	}
	else{
		edges=[3*place_id+1,3*place_id+2,3*((xi+1)*ysize+ysize-1+xi%2)];
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