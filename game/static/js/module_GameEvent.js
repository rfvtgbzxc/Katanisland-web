//--------------------------------------------------------
// class GameEvent
// 用于解读消息并执行对应事件的模块,包含大量主事件与小型事件
// 这些事件会调取UI层和游戏数据层的接口
//--------------------------------------------------------
function GameEvent() {
    throw new Error('This is a static class');
}
GameEvent.initial_replay_event_queue = function(event_queue){
	this.replay_queue = event_queue;
	//this.replay_statu_index = 0;
	//this.replay_status_queue = [JSON.stringify(DataManager.makeSaveContents())];
}
GameEvent.replay_next_event = function(){
	//执行事件
	if(this.replay_queue.length==0){
		return false;
	}
	this.execute_event(this.replay_queue.shift());
	return true;
	//this.replay_statu_index++;
	//this.replay_status_queue.push(JSON.stringify(DataManager.makeSaveContents()));
}
/*
GameEvent.replay_prev_event = function(){
	//执行事件
	this.replay_statu_index--;
	DataManager.extractSaveContents(JSON.parse(this.replay_status_queue[this.replay_statu_index]));
	//什么效率,不存在的
	this.replay_status_queue.pop();
}*/
GameEvent.execute_event = function(event){
	var val=event.val;
	switch(val[0]){
	//骰子,一定是获取点数
	case 0:
		set_dice(val[2],val[3]);
		break;
	//建造
	case 1:
		switch(val[1]){
		//建造道路
		case 1:
			build_road(val[2],event.starter);
			break;
		//建立定居点
		case 2:
			build_city0(val[2],event.starter);
			break;
		//建设新城市
		case 3:
			build_city1(val[2],event.starter);
			break;
		//抽取发展卡
		case 4 :
			extract_dev_card(val[3],event.starter);
		}
		break;
	//交易
	case 2:
		switch(val[1]){
	    //与银行交易
	 	case 1:
	 		trade_with_bank(val[2],val[3],event.starter);
	 		break;
 		//与港口交易,本质还是与银行交易
 		case 2:
 			trade_with_bank(val[2],val[3],event.starter);
 			break;
 		//与玩家交易(请求)
 		case 3:
 			give_trade_with_player(val[2])
 			break;
 		//响应玩家交易
 		case 4:
 			switch(val[2]){
 				//尝试接受交易
 				case 1:
 					response_trade_with_player(val[3],event.starter);
 					break;
 				//拒绝交易
 				case 2:
 					msg_refuse_trade(val[3],event.starter);
 					break;
 				//取消交易
 				case 3:
 					msg_cancel_trade(val[3]);
 					break;
 			}
 			break;
 		//执行交易
 		case 5:
 			trade_with_player(val[2],val[3]);
 			break;		
		}
	    break;
	//发展
	case 3:
		switch(val[1]){
		//士兵卡
		case 1:
			dev_soldier(val[2],event.starter,val[3],val[5]);
			break;
		//丰收卡
		case 2:
			dev_plenty(val[2],event.starter);
			break;
		//垄断卡
		case 3:
			dev_monopoly(val[2],event.starter);
			break;
		//修路卡
		case 4:
			dev_road_making(val[2],val[3],event.starter);
			break;
		//展示分数卡
		case 5:
			show_score_card(val[2],event.starter);
			break;
		}
		break;
	//设置强盗(因7)
	case 4:
	    set_robber_for_dice7(val[1],event.starter,val[2],val[4]);
		break;
	//丢弃卡片(因7)
	case 5:
		drop_srcs(val[1],event.starter);
		break;
	//结束回合
	case 6:
		new_turn();
		break;
	//初始坐城内容
	case 8:
		set_home(val[1],val[2],event.starter);
		break;
	//初始投骰
	case 9:
		fst_dice(val[2],val[3],event.starter);
		break;
	//聊天
	case 19:
		new_talk_message(val[1],event.starter);
		break;
	}
	//然后检查胜利条件
	update_vp_infos();
	//然后由房主更新game_info
	//离线模式不更新
	if(!offline && $gameSystem.is_room_owner()){
		//游戏结束则发送包含结束的消息
		if($gameSystem.game_process==4){
			upload_game_info(event,true);
		}
		else{
			upload_game_info(event);
		}	
	}
	//最后更新画面，先设计为全局更新，以后如果画面刷新量过大考虑重构
	if($gameSystem.is_own_turn()){
		UI_basic_action_udpate();
	}
	update_static_Graphic();
}

//--------------------------------------------------------
// 建造道路
// builder_index:修建者index ,edge_id:道路的id
//--------------------------------------------------------
GameEvent.build_road = function(builder_index,edge_id){
	$gameRoads[edge_id]=new Road(builder_index);
	$gamePlayers[builder_index].own_roads.push(edge_id);
	his_window.push($gamePlayers[builder_index].name+" 建造了一条道路");
	//更新画面
	add_road(edge_id);
}
//--------------------------------------------------------
// 移除道路
// edge_id:道路的id
//--------------------------------------------------------
GameEvent.remove_road = function(edge_id){
	//暂不考虑移除不存在的道路引发的道路缩短问题
	$gamePlayers[$gameRoads[edge_id].owner].own_roads.splice($gamePlayers[$gameRoads[edge_id].owner].own_roads.indexOf(edge_id),1);
	delete $gameRoads[edge_id];
	//更新画面
	remove_road(edge_id);
}
//--------------------------------------------------------
// 建造最低级城市(定居点)
// builder_index:修建者index ,point_id:城市的id
//--------------------------------------------------------
GameEvent.build_city = function(builder_index,point_id){
	//检查该点附近是否有港口,添加交易能力
	var ex_type=new Set();
	sQuery("point",point_id).near_places().filter((place_id)=>map_info.harbors.hasOwnProperty(place_id)).each((place_id)=>{
		for(let direction in map_info.harbors[place_id]){
			let about_points = edge_round_points(plc_round_edges(place_id,dir_reflection[direction]));
			if(about_points.indexOf(point_id)==-1){continue;}
			ex_type.add(map_info.harbors[place_id][direction].ex_type);
		}
	});
	game_info.cities[point_id]=new City(builder_index,Array.from(ex_type));
	game_info.players[builder_index].own_cities.push(point_id);
	his_window.push($gamePlayers[builder_index].name+" 建立了一个新定居点");
	//更新画面
	add_city(point_id);
}
//--------------------------------------------------------
// 设置城市等级
// point_id:城市id ,level:目标等级
//--------------------------------------------------------
GameEvent.set_city_level = function(point_id,level){
	var ori_city = $gameCities[point_id];
	if(ori_city.level<level){
		//城市升级		
		his_window.push($gamePlayers[ori_city.owner].name+" 的一个定居点升级为城市");
	}
	else if(ori_city.level>level){
		//城市降级
		his_window.push($gamePlayers[ori_city.owner].name+" 的一座城市降级为定居点");
	}
	//刷新地图上的对应元素
	ori_city.level = level;
	remove_city(point_id);
	add_city(point_id);	
}
//--------------------------------------------------------
// 移动强盗
// place_id:目的地id
//--------------------------------------------------------
GameEvent.set_robber = function(place_id){
	var place = map_info.places[place_id];
	$gameSystem.occupying=place_id;
	his_window.push("强盗被放置在数字为 "+place.create_num+" 的 "+order_ch[place.create_type]+" 地块上");
	//画面更新
	set_robber(game_info.occupying);
}
//--------------------------------------------------------
// 游戏结束
//--------------------------------------------------------
GameEvent.game_over = function(winner){
	$gameSystem.game_process=4;
	for(let player_index in $gamePlayers){
		$gamePlayers[player_index].show_score_cards();
	}
	his_window.push(winner.name+"成为了卡坦岛的新领主！","important");
	UI_game_over();
}