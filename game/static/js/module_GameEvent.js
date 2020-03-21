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
	this.replay_statu_index = 0;
	this.replay_status_queue = [JSON.stringify(DataManager.makeSaveContents())];
}
GameEvent.replay_next_event = function(){
	//执行事件
	this.execute_event(this.replay_queue[this.replay_statu_index])
	this.replay_statu_index++;
	this.replay_status_queue.push(JSON.stringify(DataManager.makeSaveContents()));
}
GameEvent.replay_prev_event = function(){
	//执行事件
	this.replay_statu_index--;
	DataManager.extractSaveContents(JSON.parse(this.replay_status_queue[this.replay_statu_index]));
	//什么效率,不存在的
	this.replay_status_queue.pop();
}
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
			set_robber_info(val[2],event.starter,val[3],val[5],true);
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
	    set_robber_info(val[1],event.starter,val[2],val[4]);
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
}