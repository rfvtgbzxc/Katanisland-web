//用于处理websocket发送过来的消息
 
//不管,肯定不是多此一举
//解读信息
function handle_msg(msg){
	//alert(msg.message.val);
	switch(msg.type){
		case "mes_action":
			GameEvent.execute_event(msg.message);
			break;
		case "mes_member":
			member_handle_msg(msg.message);
			break;		
	}
	//由model_Debug进行额外解读
	try{
		debug_handel_msg(msg);
	}
	catch(err){

	};
	//最后关闭等待窗口
	//(game_temp.action_now!="action_drop_srcs_for_7")
	$("wait_window").hide();
}

//--------------------------------------------------------
// 处理函数
//--------------------------------------------------------
//--------------------------------------------------------
// 设置骰子
//--------------------------------------------------------
function set_dice(num1,num2){
	if(debug){
		num1=3;
		num2=3;
	}
	var can_start_build=true;
	$gameSystem.dice_7_step=0;
	//刷新game_info
	game_info.dice_num[0]=num1;
	game_info.dice_num[1]=num2;
	UI_set_dices(num1,num2);
	//根据数字和收取资源
	var num_sum=num1+num2;
	var places=map_info.places;
	//添加消息
	his_window.push("掷出点数: "+ num_sum);
	//七点,所有玩家检查自己的资源数,大于七则触发丢弃选择,如果未大于7则丢弃一个空的丢弃列表。
	if(num_sum==7){
		//更新数据
		$gameSystem.recive_list=[].concat($gameSystem.online_list);
		$gameSystem.dice_7_step=1;
		for(let player of Object.values($gamePlayers)){
			if(player.all_src_num()>7){
				player.drop_required = parseInt(player.all_src_num()/2);
			}
			else{
				player.drop_required = 0;
			}
		}
		//丢弃资源
		if(!$gameSystem.is_audience()){start_drop_select();}
		return;
	}
	//收获资源,自己造的轮子真香
	sQuery("place",$gameSystem.all_palces()).filter((place_id)=>map_info.places[place_id].create_num==num_sum).each((place_id)=>{
		if($gameSystem.occupying==place_id){
			his_window.push("地块被占据,无法产出");
			return;
		}
		sQuery("place",place_id).near_points().filter((point_id)=>$gameCities.hasOwnProperty(point_id)).each((point_id)=>{
			$gamePlayers[$gameCities[point_id].owner].src(map_info.places[place_id].create_type,"+=",$gameCities[point_id].level+1);
		});
	});
	if(can_start_build){
		UI_start_build();
	}
}
//--------------------------------------------------------
// 启动资源丢弃
//--------------------------------------------------------
function start_drop_select(){
	if($gameSystem.self_player().drop_required>0){
		game_temp.drop_required=$gameSystem.self_player().drop_required;
		his_window.push("你需要丢弃 "+game_temp.drop_required+" 份资源");
		game_temp.action_base="action_drop_srcs_for_7";
		game_temp.action_now="action_drop_srcs_for_7";
		can_start_build=false;
		//打开丢弃窗口
		UI_start_drop_select();
		//手动关闭等待窗口
		$("wait_window").hide();
	}
	else{
		//如果已发送过该消息则不再发送
		if($gameSystem.recive_list.indexOf($gameSystem.self_player().index)==-1){return;}
		//如果不需要丢弃资源,发送一条空的丢弃消息,然后进入等待状态
		ws.sendmsg("mes_action",{"starter":user_index,"val":[5,{}]});
	}
}
//--------------------------------------------------------
// 建造道路
//--------------------------------------------------------
function build_road(edge_id,player_index){
	//建造道路的UI回调函数,只需要清除selectors和active
	clear_selectors();
	$("#action_build_road").removeClass("active");
	var player=$gamePlayers[player_index];
	//扣除资源
	player.src("brick","-=",1);
	player.src("wood","-=",1);
	GameEvent.build_road(player_index,edge_id);
} 
//--------------------------------------------------------
// 建立定居点
//--------------------------------------------------------
function build_city0(point_id,player_index){
	//建造定居点的UI回调函数,只需要清除selectors和active
	clear_selectors();
	$("#action_build_city0").removeClass("active");

	var player=game_info.players[player_index];
	//扣除资源
	player.src("brick","-=",1);
	player.src("wood","-=",1);
	player.src("wool","-=",1);
	player.src("grain","-=",1);
	GameEvent.build_city(player_index,point_id);
}
//--------------------------------------------------------
// 建设新城市
//--------------------------------------------------------
function build_city1(point_id,player_index){
	var player=game_info.players[player_index];
	//扣除资源
	player.src("grain","-=",2);
	player.src("ore","-=",3);
	//升级城市(更新game_info)
	GameEvent.set_city_level(point_id,1);

	//建造城市的UI回调函数,只需要清除selectors和active
	init_menu_lv(1,$("#action_build_city1"));
}
//--------------------------------------------------------
// 抽取发展卡
//--------------------------------------------------------
function extract_dev_card(randomint,player_index){
	//设置抽取发展卡的UI回调函数,只需要清除active
	$("#action_buy_dev_card").removeClass("active");
	var player=$gamePlayers[player_index];
	//扣除资源
	/*player.src("wool","-=",1);
	player.src("grain","-=",1);
	player.src("ore","-=",1);*/
	his_window.push(player.name+" 抽取了一张发展卡");
	//根据随机数判断发展卡的类型
	var count=randomint;
	for(let dev of dev_cards){
		if(count<$gameBank.dev(dev)){
			player.dev(dev,"+=",1);
			player.dev_get_record(dev,player.dev_get_record(dev)+1);
			$gameBank.dev(dev,"-=",1);
			his_window.push(`(你获得了发展卡:${dev_ch[dev]})`);
			return;
		}
		count-=$gameBank.dev(dev);
	}
	for(let score of score_cards){
		if(count<$gameBank.score(score)){
			$gamePlayers[player_index].score_unshown(score,"+=",1);
			$gameBank.score(score,"-=",1);
			his_window.push(`(你获得了分数卡:${score_ch[score]})`);
			return;
		}
		count-=$gameBank.score(score);
	}
}
//--------------------------------------------------------
// 与银行交易
//--------------------------------------------------------
function trade_with_bank(give_list,get_list,trader_index){
	//UI回调,关闭交易窗口
	close_trade_window();

	var trader=game_info.players[trader_index];
	var bank=game_info.cards;
	game_info.active_trades.splice(game_info.active_trades.indexOf(0),1);
	//进行资源转移
	for(var src_id in give_list){
		trader.src(src_id,"-=",give_list[src_id]);
		$gameBank.src(src_id,"+=",give_list[src_id]);
		his_window.push(game_info.player_list[trader_index][1]+" 给了银行 "+order_ch[src_id]+" x "+give_list[src_id]);
	}
	for(var src_id in get_list){
		trader.src(src_id,"+=",get_list[src_id]);
		$gameBank.src(src_id,"-=",get_list[src_id]);
		his_window.push("银行给了 "+game_info.player_list[trader_index][1]+" "+order_ch[src_id]+" x "+get_list[src_id]);
	}

}
//--------------------------------------------------------
// (被)生成交易
//--------------------------------------------------------
function give_trade_with_player(new_trade){
	//更新交易状态
	//如果是交易发起者则不需要
	if(new_trade.starter!=user_index){
		game_info.trades[new_trade.id].refresh(new_trade);
		game_info.active_trades.push(new_trade.id);
		if(new_trade.accepter==user_index){
			his_window.push(game_info.player_list[new_trade.starter][1]+" 想要与你交易","important");
			show_special_actions("trade",new_trade.starter);
		}
		else if(new_trade.accepter==0){
			his_window.push(game_info.player_list[new_trade.starter][1]+" 发起了公开交易","important");	
			show_special_actions("trade","0");	
		}	
		
	}	
	if(offline && new_trade.accepter!=0){
		ws.sendmsg("mes_action",{"starter":new_trade.accepter,"accepter":new_trade.starter,"val":[2,4,1,new_trade.id]});
	}
}
//--------------------------------------------------------
// (被)拒绝交易
//--------------------------------------------------------
function msg_refuse_trade(trade_id,refuser_index){
	//更新交易状态
	//交易已被移除则不做任何事
	if(game_info.active_trades.indexOf(trade_id)==-1){return;}
	var trade=game_info.trades[trade_id];
	//公开交易在各自玩家的状态中显示不同
	trade.trade_state="refused";
	game_info.active_trades.splice(game_info.active_trades.indexOf(trade.id),1);
	window_finish_trade(trade,refuser_index);
}
//--------------------------------------------------------
// (被)取消交易
//--------------------------------------------------------
function msg_cancel_trade(trade_id){
	//更新交易状态
	//交易已被移除则不做任何事
	if(game_info.active_trades.indexOf(trade_id)==-1){return;}
	var trade=game_info.trades[trade_id];
	//如果是交易发起者则不需要
	if(trade.starter!=user_index){	
		trade.trade_state="canceled";
		game_info.active_trades.splice(game_info.active_trades.indexOf(trade.id),1);
		window_finish_trade(trade);
	}
}
//--------------------------------------------------------
// 与玩家交易
//--------------------------------------------------------
function response_trade_with_player(trade_id,accepter_index){
	//检查交易状态
	var trade=game_info.trades[trade_id];
	if(trade.trade_state=="requesting"){
		//达成交易
		trade.trade_state="success";
		trade.final_accepter=accepter_index;
		ws.sendmsg("mes_action",{"val":[2,5,trade_id,accepter_index]});
	}
}
//--------------------------------------------------------
// 执行与玩家交易
//--------------------------------------------------------
function trade_with_player(trade_id,accepter_index){
	var trade=game_info.trades[trade_id];
	//更新交易状态
	trade.final_accepter=accepter_index;
	trade.trade_state="success";
	game_info.active_trades.splice(game_info.active_trades.indexOf(trade_id),1);
	//执行交易
	var trade_starter=game_info.players[trade.starter];
	var trade_accepter=game_info.players[trade.final_accepter];
	var names=game_info.player_list
	//进行资源转移
	for(let src_id in trade.starter_list){
		let src_num = trade.starter_list[src_id];
		trade_starter.src(src_id,"-=",src_num);
		trade_accepter.src(src_id,"+=",src_num);
		his_window.push(names[trade.starter][1]+" 给了 "+names[trade.final_accepter][1]+" "+order_ch[src_id]+" x "+src_num);
	}
	for(let src_id in trade.accepter_list){
		let src_num = trade.starter_list[src_id];
		trade_starter.src(src_id,"+=",src_num);
		trade_accepter.src(src_id,"-=",src_num);
		his_window.push(names[trade.final_accepter][1]+" 给了 "+names[trade.starter][1]+" "+order_ch[src_id]+" x "+src_num);
	}
	//UI回调,结束交易
	window_finish_trade(trade);
}
//--------------------------------------------------------
// 设置强盗(投出7)
//--------------------------------------------------------
function set_robber_for_dice7(place_id,robber_index,victim_index,randomint){
	//设置强盗的UI回调函数
	clear_selectors();
	hide_special_actions();

	GameEvent.set_robber(place_id);
	rob_player(robber_index,victim_index,randomint);
	//打开建设界面,并设置步骤
	$gameSystem.dice_7_step=0;
	UI_start_build();
}
//--------------------------------------------------------
// 士兵卡
//--------------------------------------------------------
function dev_soldier(place_id,robber_index,victim_index,randomint){
	$gamePlayers[robber_index].dev("soldier","-=",1);
	$gamePlayers[robber_index].dev_used=true;
	$gamePlayers[robber_index].soldier_used++;
	GameEvent.set_robber(place_id);
	rob_player(robber_index,victim_index,randomint);
	init_menu_lv(1,$(`.use_dev[dev='soldier']`));
	UI_use_dev_update();
}
//--------------------------------------------------------
// 掠夺资源
//--------------------------------------------------------
function rob_player(robber_index,victim_index,randomint){
	//如果没有受害者,则返回
	if(victim_index==0){
		return;
	}
	var names=game_info.player_list;
	var victim=game_info.players[victim_index]
	var count=randomint;
	for(var i=1;count>=0;i++){
		if(count<victim.src(i)){
			victim.src(i,"-=",1);
			$gamePlayers[robber_index].src(i,"+=",1);
			his_window.push(names[robber_index][1]+" 掠夺了 "+names[victim_index][1]+" 的一份 "+order_ch[i]);
			break;
		}
		count-=victim.src(i);
	}
}
//--------------------------------------------------------
// 丢弃资源(因为丢出7)
//--------------------------------------------------------
function drop_srcs(drop_list,dropper_index){
	//遍历丢弃列表,舍弃对应数字
	var dropper=game_info.players[dropper_index];
	for(var src_id in drop_list){
		dropper.src(src_id,"-=",drop_list[src_id]);
		his_window.push(game_info.player_list[dropper_index][1]+" 丢弃了 "+order_ch[src_id]+" x "+drop_list[src_id]);
	}
	//更新该玩家的数据
	$gamePlayers[dropper_index].drop_required=0;
	//如果是自己所为,进行回调关闭窗口
	if(dropper_index==user_index){
		//回调,关闭丢弃资源窗口
		$("simple_item_select_window").hide();
	}
	//完成丢弃后,检查recive_list,释放操作权或保持等待。
	if($gameSystem.msg_recive(dropper_index)==true){
		//更新数据
		$gameSystem.dice_7_step=2;
		for(let player of Object.values($gamePlayers)){
			player.drop_required=0;
		}
		$("wait_window").hide();
		//由掷出者设置强盗
		if($gameSystem.is_own_turn()){
			start_robber_set();
		}
		else{
			his_window.push("由 "+game_info.player_list[game_info.step_list[game_info.step_index]][1]+" 设置强盗");
		}
	}
	else if(game_info.step_list[game_info.step_index]==user_index && dropper_index==user_index){
		his_window.push("等待其他玩家选择丢弃资源...");
		$("wait_window").show();
	}
}
//--------------------------------------------------------
// 准备设置强盗
//--------------------------------------------------------
function start_robber_set(){
	his_window.push("由你设置强盗:");
	//当前行动记为action_set_robber_for_7
	//设置最初行动
	game_temp.action_base="action_set_robber_for_7";
	game_temp.action_now="action_set_robber_for_7";
	UI_start_robber_set();
}
//--------------------------------------------------------
// 丰收
//--------------------------------------------------------
function dev_plenty(src_list,player_index){
	var player=$gamePlayers[player_index];
	player.dev_used=true;
	his_window.push(player.name+" 使用了 "+"丰收卡");
	for(let src_id in src_list){
		player.src(src_id,"+=",src_list[src_id]);
	}
	player.dev("plenty","-=",1);
	//UI回调,设置菜单级数为1
	close_simple_item_select_window();
	init_menu_lv(1,$(`.use_dev[dev='plenty']`));
	UI_use_dev_update();
}
//--------------------------------------------------------
// 垄断
//--------------------------------------------------------
function dev_monopoly(src_id,starter_index){
	var starter=game_info.players[starter_index];
	starter.dev_used=true;
	//垄断卡使用后,本回合无法再进行建设
	starter.no_build_dev_used=true;
	his_window.push(starter.name+" 使用了 "+"垄断卡");
	starter.dev("monopoly","-=",1);
	for(var player_index in game_info.players){
		//自己是垄断者则不受影响
		if(starter_index==player_index){
			continue;
		}
		var player=game_info.players[player_index];	
		starter.src(src_id,"+=",player.src(src_id),false);
		his_window.push(player.name+" 交出了 "+player.src(src_id)+" 份 "+order_ch[src_id]);
		player.src(src_id,0,false);
	}	
	//UI回调,设置菜单级数为1
	init_menu_lv(1,$(`.use_dev[dev='monopoly']`));
	UI_use_dev_update();
}
//--------------------------------------------------------
// 修路
//--------------------------------------------------------
function dev_road_making(road_id1,road_id2,builder_index){
	var builder=game_info.players[builder_index];
	builder.dev_used=true;
	builder.dev("road_making","-=",1);
	his_window.push(builder.name+" 使用了 "+"道路建设卡");
	GameEvent.build_road(builder_index,road_id1);
	GameEvent.build_road(builder_index,road_id2);
	//UI回调,设置菜单级数为1
	init_menu_lv(1,$(`.use_dev[dev='road_making']`));
	UI_use_dev_update();
}
//--------------------------------------------------------
// 展示分数卡
//--------------------------------------------------------
function show_score_card(card_name,player_index){
	var player=$gamePlayers[player_index];
	player.show_score_cards([card_name]);
	add_player_tag(player_index,"score_card");
	his_window.push(player.name+" 展示了分数卡 "+score_ch[card_name]);
	//UI回调,设置菜单级数为1
	init_menu_lv(1,$("#action_show_score_cards"));
	UI_use_dev_update();
}
//--------------------------------------------------------
// 新的回合
//--------------------------------------------------------
function new_turn()
{
	if(game_info.step_list==[]){
		alert("出现死循环!");
		return;
	}
	timer.stop();
	close_trade_window();
	//记录当前值
	last_step_index=game_info.step_index;
	//寻找没有掉线的下一位玩家
	//最差也能找到自己吧
	var index=game_info.step_index+1;
	var player_index;
	while(true)
	{
		if(index==Object.keys(game_info.player_list).length){
			index=0;
		}
		player_index=game_info.step_list[index];
		if(game_info.online_list.indexOf(player_index)!=-1){
			break;
		}
		index++;
	}
	game_info.step_index=index;
	//清空骰子值
	game_info.dice_num=[0,0];
	if(game_info.game_process==3){
		game_info.play_turns++;
	}
	//重置recive_list
	$gameSystem.recive_list=[].concat(game_info.online_list);
	//清空所有交易
	game_info.active_trades.length=0;
	//offline模式下,核心角色移交
	if(offline){
		user_index=game_info.step_list[game_info.step_index];
	}
	//动画：回合指示轮盘跳转
	turn_rounds();
	//添加消息
	his_window.push("----------回合结束----------");
	his_window.push("第 "+game_info.play_turns+" 回合,轮到 "+game_info.player_list[game_info.step_list[game_info.step_index]][1]+" 行动");
	//emmm好像没什么要做的了= =||
	//UI更新
	UI_begin_turn();
	ExtendManager.new_turn();
}
//--------------------------------------------------------
// 初始坐城
//--------------------------------------------------------
function set_home(step,val,setter_index){
	var setter=game_info.players[setter_index];
	//更新坐城状态
	setter.home_step=step+1;
	switch(step%2){
		//建立定居点
		case 0:
			clear_selectors();
			GameEvent.build_city(setter_index,val);
			//判断轮数
			if(step>1){
				//收获资源
				var places=pt_round_places(val);
				for(i in places){
					var place=map_info.places[places[i]];
					if(place==null){continue;}
					setter.src(place.create_type,"+=",1);
				}				
			}
			his_window.push("由 "+setter.name+" 建设道路");
			if(setter_index==user_index){
				//接着请求修建道路
				UI_start_set_home(setter.home_step,val);
			}	
			break;
		//修建道路
		case 1:
			GameEvent.build_road(setter_index,val);
			//判断是否所有玩家都完成了一轮坐城
			if(game_info.step_index==game_info.step_list.length-1){
				//逆序行动列表
				game_info.step_list.reverse();
				//判断轮数
				if(step>2){
					if(!offline || step>Object.keys(game_info.player_list).length*4-2){
						//更改游戏状态,正式游戏开始
						game_info.game_process=3;
					}					
				}

			}
			//结束回合,移交行动权
			new_turn();
			//如果接下来是自己的回合,且没有进入下一个游戏阶段,请求修建定居点
			if($gameSystem.is_own_turn() && game_info.game_process!=3){		
				UI_start_set_home($gameSystem.active_player().home_step);
			}
			break;
	}


}
//--------------------------------------------------------
// 初始投骰
//--------------------------------------------------------
function fst_dice(num1,num2,dicer_index){
	var player=game_info.players[dicer_index];
	//更新数据
	player.first_dice[0] = num1;
	player.first_dice[1] = num2;
	if(user_index==dicer_index){
		//显示骰子数
		UI_set_dices(num1,num2);
	}	
	var num_sum=num1+num2;
	//添加消息
	his_window.push(player.name+" 掷出点数: "+num1+","+num2+" ,共计 "+num_sum,"important");	
	var player_ranks=[];
	if($gameSystem.msg_recive(dicer_index)){
		//整合骰子数据
		var dices=[0];
		for(let index in $gamePlayers){
			dices[index]=$gamePlayers[index].first_dice[0]+$gamePlayers[index].first_dice[1];
		}
		//对所有玩家投出的值进行排序:选择排序
		var count=0;
		while(Object.keys(dices).length>1){
			let max_index=0;
			for(let player_index in dices){
				if(dices[player_index]>dices[max_index]){
					max_index=player_index;
				}
			}
			player_ranks.push(parseInt(max_index));
			delete dices[max_index];
			count++;
			if(count>100){
				alert("循环次数过多!");
				return;
			}
		}
		//应用该行动列表,进入前期坐城阶段
		game_info.step_list=player_ranks;
		game_info.step_index=-1;
		game_info.game_process=2;
		var text="";
		for(let i in $gameSystem.step_list){
			text += $gamePlayers[$gameSystem.step_list[i]].name
			if(i!=$gameSystem.step_list.length-1){
				text+="->";
			}
		}
		his_window.push("行动顺序为:"+text,"important");
		his_window.push("----开始安放前期定居点----");
		create_step_list();
		new_turn();
		//如果是自己的回合,开始设置第一个定居点
		if($gameSystem.is_own_turn()){
			UI_start_set_home(0);
		}
	}
}
//--------------------------------------------------------
// 新的聊天消息
//--------------------------------------------------------
function new_talk_message(text,player_index){
	his_window.push($gamePlayers[player_index].name+"："+text,"important");
	//清空发送者的输入内容
	if(user_index==player_index){
		$("#talk_msg_input_window").val("");
	}
}
//--------------------------------------------------------
// 检查胜利条件
//--------------------------------------------------------
function update_vp_infos(){
	var players=game_info.players;
	var names=game_info.player_list;
	//检查最长道路
    var max_length=0;
	for(let player of Object.values($gamePlayers)){
		player.road_longest=cal_longest_road(player.index);
		max_length=Math.max(player.road_longest.length,max_length);
	}
	if(max_length<5){max_length=5;}
	if($gameSystem.longest_road!=0 && $gamePlayers[$gameSystem.longest_road].road_longest.length<max_length){		
		his_window.push($gamePlayers[$gameSystem.longest_road].name+" 不再是 最长道路 的修建者。");
		remove_player_tag($gamePlayers[$gameSystem.longest_road].index,"longest_road");
		$gameSystem.longest_road=0;
	}
	var max_list=[];
	for(let player of Object.values($gamePlayers)){
		if(player.road_longest.length==max_length){
			max_list.push(player.index);
		}
	}
	if(max_list.length==1){
		if($gameSystem.longest_road==0){
			his_window.push($gamePlayers[max_list[0]].name+" 成为 最长道路 的修建者！");
			add_player_tag(max_list[0],"longest_road");
			$gameSystem.longest_road=max_list[0];	
		}		
	}
	var max_minitory=2;
	//检查最大军队
	if($gameSystem.max_minitory!=0){
		max_minitory=$gamePlayers[$gameSystem.max_minitory].soldier_used;
	}
	for(let player of Object.values($gamePlayers)){
		if(player.soldier_used>max_minitory){
			if($gameSystem.max_minitory==0){
				his_window.push(player.name+"成为了 最大军队 的建立者！");
				add_player_tag(player.index,"max_minitory");
			}
			else{
				his_window.push(player.name+" 取代 "+$gamePlayers[$gameSystem.max_minitory].name+"成为了 最大军队 的建立者！");
				remove_player_tag($gameSystem.max_minitory,"max_minitory");
				add_player_tag(player.index,"max_minitory");
			}
			$gameSystem.max_minitory=player.index;
		}
	}

	//计算总胜利点
	for(var player_index in players){
		var player=players[player_index];
		if(player.vp()>=10){
			if(player.index==$gameSystem.step_list[$gameSystem.step_index]){
				GameEvent.game_over(player);
			}		
		}
	}

}
//--------------------------------------------------------
// 数据构造函数
//--------------------------------------------------------
//--------------------------------------------------------
// 新的道路
//--------------------------------------------------------
function Road(owner_index) {
	this.owner = owner_index;
}
//--------------------------------------------------------
// 新的定居点
//--------------------------------------------------------
function City(owner_index,ex_type) {
	this.ex_type=ex_type;
	this.level=0;
	this.owner=owner_index;
}