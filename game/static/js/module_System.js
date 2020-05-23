//--------------------------------------------------------
// class Game_System
// 处理游戏整体数据
//--------------------------------------------------------
class Game_System{
	//--------------------------------------------------------
	// 初始化,载入数据
	//--------------------------------------------------------
	constructor(static_system){
		for(let attr of Object.keys(static_system)){
			this[attr]=static_system[attr];
		}
	}
	//--------------------------------------------------------
	// 判定是否是自己的回合
	//--------------------------------------------------------
	is_own_turn(){
		if(this.is_audience()){return false;}
		return user_index == this.step_list[this.step_index];
	}
	//--------------------------------------------------------
	// 判定是否是观众
	//--------------------------------------------------------
	is_audience(){
		return user_index == 0;
	}
	//--------------------------------------------------------
	// 判定是否是房主
	//--------------------------------------------------------
	is_room_owner(){
		return user_index == 1;
	}
	//--------------------------------------------------------
	// 判定是否在recive_list中
	//--------------------------------------------------------
	is_in_recive(){
		return this.recive_list.includes(user_index);
	}
	//--------------------------------------------------------
	// 获取本人对应的玩家
	//--------------------------------------------------------
	self_player(){
		return $gamePlayers[user_index];
	}
	//--------------------------------------------------------
	// 获取当前行动中的玩家
	//--------------------------------------------------------
	active_player(){
		return $gamePlayers[this.step_list[this.step_index]];
	}
	//--------------------------------------------------------
	// 获取所有城市的数组
	//--------------------------------------------------------
	all_cities(){
		return Object.keys($gameCities).map(Number);
	}
	//--------------------------------------------------------
	// 获取所有道路的数组
	//--------------------------------------------------------
	all_roads(){
		return Object.keys($gameRoads).map(Number);
	}
	//--------------------------------------------------------
	// 获取所有点的数组
	//--------------------------------------------------------
	all_points(){
		return map_info.points;
	}
	//--------------------------------------------------------
	// 获取所有边的数组
	//--------------------------------------------------------
	all_edges(){
		return map_info.edges;
	}
	//--------------------------------------------------------
	// 获取所有地块的数组
	//--------------------------------------------------------
	all_palces(){
		return Object.keys(map_info.places).map(Number);
	}
	//--------------------------------------------------------
	// 生成以当前玩家为起始的顺序列表
	//--------------------------------------------------------
	make_player_list_by_order(){
		return this.step_list.slice(this.step_index,this.step_list.length).concat(this.step_list.slice(0,this.step_index));
	}
	//--------------------------------------------------------
	// 同步操作完成人数
	//--------------------------------------------------------
	msg_recive(player_index){
		//每次删除一个已经确认了行动的玩家,如果列表清空,则说明全部行动完成
		var index = this.recive_list.indexOf(player_index);
		//已删除则无视
		if(index!=-1){
			this.recive_list.splice(index,1);
		}		
		return this.recive_list.length==0 || offline;
	}
	//--------------------------------------------------------
	// 检查发展卡可见性
	//--------------------------------------------------------
	visible_use_dev(action){
		return this.self_player().dev(action.key)>0;
	}
	//--------------------------------------------------------
	// 检查发展卡可用性
	//--------------------------------------------------------
	usable_use_dev(action){
		var result = true,reason = "";
		return [result,reason];
	}
	//--------------------------------------------------------
	// 检查基本建设可见性
	//--------------------------------------------------------	
	visible_base_build(action){
		return true;
	}
	//--------------------------------------------------------
	// 检查基本建设可用性
	//--------------------------------------------------------
	usable_base_build(action){
		var result = true,reason = "";
		return [result,reason];
	}
}