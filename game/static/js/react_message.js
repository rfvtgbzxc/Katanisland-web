//用于处理websocket发送过来的消息
//模拟websocket
ws={};
function load_ws_function_msg(){
	if(offline){
		ws.send=function(msg){
		$.get("/ajax/t_virtual_websocket/",msg,function(evt){
			//模拟接收到消息触发函数
			ws.onmessage(evt);},"json");
		}
	}
	//只属于ws的封装函数
	ws.sendmsg=function(typ,mes){
		//打开等待窗口
		$("wait_window").show();
		var evt={"type":typ,"message":mes};
		if(offline){
			this.send("data="+JSON.stringify(evt));
		}
		else{
			this.send(JSON.stringify(evt));
		}
	}
	//只属于ws的解读函数
	ws.onmessage=function(evt){
		//evt是js对象，然而evt.data不是(尽管格式是json)
		var data;
		if(typeof(evt.data)=="object"){
			data=evt.data
		}
		else
		{
			data=JSON.parse(evt.data)
		}	
		handle_msg(data);
	};
}
//不管,肯定不是多此一举
//解读信息
function handle_msg(msg){
	//alert(msg.message.val);
	switch(msg.type){
		case "mes_action":
			var val=msg.message.val;
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
							build_road(val[2],msg.message.starter);
							break;
						//建立定居点
						case 2:
							build_city0(val[2],msg.message.starter);
							break;
						//建设新城市
						case 3:
							build_city1(val[2],msg.message.starter);
							break;
						//抽取发展卡
						case 4 :
							extract_dev_card(val[3],msg.message.starter);
					}
					break;
				//交易
				case 2:
					switch(val[1]){
					    //与银行交易
					 	case 1:
					 		trade_with_bank(val[2],val[3],msg.message.starter);
					 		break;
				 		//与港口交易,本质还是与银行交易
				 		case 2:
				 			trade_with_bank(val[2],val[3],msg.message.starter);
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
				 					response_trade_with_player(val[3],msg.message.starter);
				 					break;
				 				//拒绝交易
				 				case 2:
				 					msg_refuse_trade(val[3],msg.message.starter);
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
							set_robber_info(val[2],msg.message.starter,val[3],val[5],true);
							break;
						//丰收卡
						case 2:
							dev_plenty(val[2],msg.message.starter);
							break;
						//垄断卡
						case 3:
							dev_monopoly(val[2],msg.message.starter);
							break;
						//修路卡
						case 4:
							dev_road_making(val[2],val[3],msg.message.starter);
							break;
						//展示分数卡
						case 5:
							show_score_card(val[2],msg.message.starter);
							break;
					}
					break;
				//设置强盗(因7)
				case 4:
				    set_robber_info(val[1],msg.message.starter,val[2],val[4]);
					break;
				//丢弃卡片(因7)
				case 5:
					drop_srcs(val[1],msg.message.starter);
					break;
				//结束回合
				case 6:
					new_turn();
					break;
				//初始坐城内容
				case 8:
					set_home(val[1],val[2],msg.message.starter);
					break;
				//初始投骰
				case 9:
					fst_dice(val[2],val[3],msg.message.starter);
					break;
			}
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
	//然后由房主更新game_info
	//离线模式不更新
	if(!offline && game_info.player_list[user_index][0]==game_info.owner){
		upload_game_info();
	}
	//暂不设计
	//再然后检查胜利条件
	update_vp_infos();
	//最后更新画面，先设计为全局更新，以后如果画面刷新量过大考虑重构
	update_static_Graphic();
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
		//依照自己是否需要丢弃资源来打开UI
		start_drop_select();
		return;
	}
	for(var place_id in places){
		var place=places[place_id];
		if(place.create_num==num_sum){
			if(game_info.occupying==place_id){
				his_window.push("地块被占据,无法产出");
				continue;
			}
			//alert(order[place.create_type]+" "+place.create_num);
			var points=plc_round_points(place_id);
			//alert(points);
			for(var pt_index in points){
				var pt_id=points[pt_index];
				//alert(pt_id);
				if(game_info.cities.hasOwnProperty(pt_id)){
					var city=game_info.cities[pt_id];
					var player=game_info.players[city.owner];
					var add_num;
					if(city.level==0){
						add_num=1;
					}
					else{
						add_num=2;
					}
					player[order[place.create_type]+"_num"]+=add_num;
					//添加消息	
					his_window.push(game_info.player_list[city.owner][1]+"获得 "+order_ch[place.create_type]+" x "+add_num);
				}
			}
		}
	}
	if(can_start_build){
		UI_start_build();
	}
	//alert("end");
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
		//如果不需要丢弃资源(或已经丢弃过),发送一条空的丢弃消息,然后进入等待状态
		ws.sendmsg("mes_action",{"starter":user_index,"val":[5,{}]});
	}
}
//--------------------------------------------------------
// 建造道路
//--------------------------------------------------------
function build_road(edge_id,player_index,cost=true){
	//建造道路的UI回调函数,只需要清除selectors和active
	clear_selectors();
	$("#action_build_road").removeClass("active");
	var player=game_info.players[player_index];
	//扣除资源
	if(cost){
		player.brick_num--;
		player.wood_num--;
	}
	//安置道路(更新game_info)
	game_info.roads[edge_id]=new Road(player_index);
	his_window.push(game_info.player_list[player_index][1]+" 建造了一条道路");
	//此处可以添加动画
	//安置道路(更新画面)
	add_road(edge_id);
}
//--------------------------------------------------------
// 建立定居点
//--------------------------------------------------------
function build_city0(point_id,player_index,cost=true){
	//建造定居点的UI回调函数,只需要清除selectors和active
	clear_selectors();
	$("#action_build_city0").removeClass("active");

	var player=game_info.players[player_index];
	//扣除资源
	if(cost){
		player.brick_num--;
		player.wood_num--;
		player.wool_num--;
		player.grain_num--;
	}
	//建立新定居点(更新game_info)
	var ex_type=0;
	//检查该点附近是否有港口
	for(var harbor_index in map_info.harbors){
		var harbor=map_info.harbors[harbor_index];
		var about_points=edge_round_points(plc_round_edges(harbor.place_id,dir_reflection[harbor.direct]));
		if(about_points.indexOf(point_id)==-1){continue;}
		//添加交易能力
		ex_type=harbor.ex_type;
	}
	game_info.cities[point_id]=new City(player_index,ex_type);
	game_info.players[player_index].own_cities.push(point_id);
	his_window.push(game_info.player_list[player_index][1]+" 建立了一个新定居点");
	//此处可以添加动画
	//建立新定居点(更新画面)
	add_city(point_id);
}
//--------------------------------------------------------
// 建设新城市
//--------------------------------------------------------
function build_city1(point_id,player_index){
	//建造城市的UI回调函数,只需要清除selectors和active
	clear_selectors();
	$("#action_build_city1").removeClass("active");
	var player=game_info.players[player_index];
	//扣除资源
	player.grain_num-=2;
	player.ore_num-=3;
	//升级城市(更新game_info)
	game_info.cities[point_id].level=1;
	his_window.push(game_info.player_list[player_index][1]+" 建成了一座新城市");
}
//--------------------------------------------------------
// 抽取发展卡
//--------------------------------------------------------
function extract_dev_card(randomint,player_index){
	//设置强盗的UI回调函数,只需要清除active
	$("#action_buy_dev_card").removeClass("active");
	var cards=game_info.cards;
	var player=game_info.players[player_index];
	//扣除资源
	player.grain_num-=1;
	player.wool_num-=1;
	player.ore_num-=1;
	his_window.push(game_info.player_list[player_index][1]+" 抽取了一张发展卡");
	//根据随机数判断发展卡的类型
	if(randomint<cards.soldier_num){
		if(user_index==player_index){
			his_window.push("(你获得了士兵卡)");
		}
		//获得士兵卡
		cards.soldier_num--;
		player.soldier_num++;
		player.soldier_get_before++;
		return;
	}
	randomint-=cards.soldier_num;
	if(randomint<cards.plenty_num){
		if(user_index==player_index){
			his_window.push("(你获得了丰收卡)");
		}
		//获得丰收卡
		cards.plenty_num--;
		player.plenty_num++;
		player.plenty_get_before++;
		return;
	}
	randomint-=cards.plenty_num;
	if(randomint<cards.monopoly_num){
		if(user_index==player_index){
			his_window.push("(你获得了垄断卡)");
		}
		//获得垄断卡
		cards.monopoly_num--;
		player.monopoly_num++;
		player.monopoly_get_before++;
		return;
	}
	randomint-=cards.monopoly_num;
	if(randomint<cards.road_making_num){
		if(user_index==player_index){
			his_window.push("(你获得了修路卡)");
		}
		//获得修路卡
		cards.road_making_num--;
		player.road_making_num++;
		player.road_making_get_before++;
		return;
	}
	randomint-=cards.road_making_num;
	if(randomint<cards.score_cards.length){
		if(user_index==player_index){
			his_window.push("(你获得了分数卡:"+cards.score_cards[randomint]+")");
		}
		//获得分数卡
		player.score_unshown.push(cards.score_cards[randomint]);
		cards.score_cards.splice(randomint,1);	
		return;
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
		var src_num=order[src_id]+"_num";
		trader[src_num]-=give_list[src_id];
		bank[src_num]+=give_list[src_id];
		his_window.push(game_info.player_list[trader_index][1]+" 给了银行 "+order_ch[src_id]+" x "+give_list[src_id]);
	}
	for(var src_id in get_list){
		var src_num=order[src_id]+"_num";
		trader[src_num]+=get_list[src_id];
		bank[src_num]-=get_list[src_id];
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
	for(var src_id in trade.starter_list){
		var src_name=order[src_id]+"_num";
		var src_num=trade.starter_list[src_id];
		trade_starter[src_name]-=src_num;
		trade_accepter[src_name]+=src_num;
		his_window.push(names[trade.starter][1]+" 给了 "+names[trade.final_accepter][1]+" "+order_ch[src_id]+" x "+src_num);
	}
	for(var src_id in trade.accepter_list){
		var src_name=order[src_id]+"_num";
		var src_num=trade.accepter_list[src_id];
		trade_starter[src_name]+=src_num;
		trade_accepter[src_name]-=src_num;
		his_window.push(names[trade.final_accepter][1]+" 给了 "+names[trade.starter][1]+" "+order_ch[src_id]+" x "+src_num);
	}
	//UI回调,结束交易
	window_finish_trade(trade);
}
//--------------------------------------------------------
// 设置强盗
//--------------------------------------------------------
function set_robber_info(place_id,robber_index,victim_index,randomint,cost=false)
{
	//设置强盗的UI回调函数
	clear_selectors();
	$("#action_use_dev_soldier").removeClass("active");
	$("#cancel_robbing").hide();
	$("#to_before_action").hide();
	//如果是因为丢出七,额外打开建设界面,并设置步骤
	if(!cost){
		$gameSystem.dice_7_step=0;
		UI_start_build();
	}	
	if(cost){
		game_info.players[robber_index].soldier_num--;
		game_info.players[robber_index].soldier_used++;
		$gamePlayers[robber_index].dev_used=true;
		//UI回调,设置菜单级数为1
		init_menu_lv(1,$("#action_use_dev_soldier"));
		UI_use_dev_update();
	}
	game_info.occupying=place_id;
	var place=map_info.places[place_id];
	his_window.push("强盗被放置在数字为 "+place.create_num+" 的 "+order_ch[place.create_type]+" 地块上");
	rob_player(robber_index,victim_index,randomint);
	//临时消息清空
	game_temp.action_now="";
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
		if(count<victim[order[i]+"_num"]){
			victim[order[i]+"_num"]--;
			game_info.players[robber_index][order[i]+"_num"]++;
			his_window.push(names[robber_index][1]+" 掠夺了 "+names[victim_index][1]+" 的一份 "+order_ch[i]);
			break;
		}
		count-=victim[order[i]+"_num"];
	}
}
//--------------------------------------------------------
// 丢弃资源(因为丢出7)
//--------------------------------------------------------
function drop_srcs(drop_list,dropper_index){
	//遍历丢弃列表,舍弃对应数字
	var dropper=game_info.players[dropper_index];
	for(var src_id in drop_list){
		dropper[order[src_id]+"_num"]-=drop_list[src_id];
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
	init_menu_lv(1,$("#action_use_dev_plenty"));
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
	init_menu_lv(1,$("#action_use_dev_monopoly"));
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
	build_road(road_id1,builder_index,false);
	build_road(road_id2,builder_index,false);
	//UI回调,设置菜单级数为1
	init_menu_lv(1,$("#action_use_dev_road_making"));
	UI_use_dev_update();
}
//--------------------------------------------------------
// 展示分数卡
//--------------------------------------------------------
function show_score_card(card_name,player_index){
	var player=$gamePlayers[player_index];
	player.show_score_cards(card_name);
	his_window.push(player.name+" 展示了分数卡 "+card_name);
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
	//清空所有玩家的发展卡get_before限制(尽管对于某位玩家来说只需要清除自己的)
	for(player_index in $gamePlayers){
		var player=$gamePlayers[player_index];	
		for(var i=0;i<4;i++){
			player[devs[i]+"_get_before"]=0;
			player.dev_used=false;
			player.no_build_dev_used=false;
		}
	}	
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
			build_city0(val,setter_index,false);
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
			build_road(val,setter_index,false);
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
// 检查胜利条件
//--------------------------------------------------------
function update_vp_infos(){
	var players=game_info.players;
	var names=game_info.player_list;
	//检查最长道路
    var max_length=0;
	for(var player_index in game_info.player_list){
		var player=game_info.players[player_index]
		player.road_longest=cal_longest_road(player_index);
		max_length=Math.max(player.road_longest.length,max_length);
	}
	if(max_length<5){max_length=5;}
	if(game_info.longest_road!=0 && game_info.players[game_info.longest_road].road_longest.length<max_length){		
		his_window.push(game_info.player_list[game_info.longest_road][1]+" 不再是 最长道路 的修建者。");
		game_info.longest_road=0;
	}
	var max_list=[];
	for(var player_index in game_info.player_list){
		var player=game_info.players[player_index]
		if(player.road_longest.length==max_length){
			max_list.push(player_index);
		}
	}
	if(max_list.length==1){
		if(game_info.longest_road==0){
			his_window.push(game_info.player_list[max_list[0]][1]+"成为 最长道路 的修建者！");
			game_info.longest_road=max_list[0];
		}		
	}

	//检查最大军队
	if(game_info.max_minitory==0){
		var max_minitory=2;
	}
	else{
		var max_minitory=players[game_info.max_minitory].soldier_used;
	}
	for(var player_index in players){
		if(players[player_index].soldier_used>max_minitory){
			if(game_info.max_minitory==0){
				his_window.push(names[player_index][1]+"成为了 最大军队 的建立者！");
			}
			else{
				his_window.push(names[player_index][1]+" 取代 "+names[game_info.max_minitory][1]+"成为了 最大军队 的建立者！");
			}
			game_info.max_minitory=player_index;
		}
	}

	//计算总胜利点
	for(var player_index in players){
		var player=players[player_index];
		if(player.vp_update(true)>=10){
			if(player.index==game_info.step_list[game_info.step_index]){
				player.show_score_cards();
				his_window.push(player.name+"取得了胜利！","important");
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