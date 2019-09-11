//用于处理websocket发送过来的消息
//只属于ws的封装函数
ws.sendmsg=function(typ,mes){
	//打开等待窗口
	$("wait_window").show();
	var evt={type:typ,message:mes};
	//debug模式下不会发送到channels
	if(debug){
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
				//发展
				case 3:
					switch(val[1]){
						//士兵卡
						case 1:
							set_robber_info(val[2],msg.message.starter,val[3],val[5],true);
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
			}
			break;		
	}
	//然后由房主更新game_info
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
	//刷新game_info
	game_info.dice_num[0]=num1;
	game_info.dice_num[1]=num2;
	UI_set_dices();
	//根据数字和收取资源
	var num_sum=num1+num2;
	var places=map_info.places;
	//添加消息
	his_window.push("掷出点数: "+ num_sum);
	//七点,所有玩家检查自己的资源数,大于七则触发丢弃选择,如果未大于7则丢弃一个空的丢弃列表。
	if(num_sum==7){
		if(all_src_num(game_info.players[user_index])>7){
			game_temp.drop_required=parseInt(all_src_num(game_info.players[user_index])/2);
			his_window.push("你需要丢弃 "+game_temp.drop_required+" 份资源");
			game_temp.action_base="action_drop_srcs_for_7";
			game_temp.action_now="action_drop_srcs_for_7";
			//打开丢弃窗口
			UI_start_drop_select();
		}
		else{
			//如果没有大于7,发送一条空的丢弃消息,然后进入等待状态
			ws.sendmsg("mes_action",{"starter":user_index,"val":[5,{}]});
		}
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
	//alert("end");
}
//--------------------------------------------------------
// 建造道路
//--------------------------------------------------------
function build_road(edge_id,player_index){
	//建造道路的UI回调函数,只需要清除selectors和active
	clear_selectors();
	$("#action_build_road").removeClass("active");
	var player=game_info.players[player_index];
	//扣除资源
	player.brick_num--;
	player.wood_num--;
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
function build_city0(point_id,player_index){
	//建造定居点的UI回调函数,只需要清除selectors和active
	clear_selectors();
	$("#action_build_city0").removeClass("active");
	var player=game_info.players[player_index];
	//扣除资源
	player.brick_num--;
	player.wood_num--;
	player.wool_num--;
	player.grain_num--;
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
// 设置强盗
//--------------------------------------------------------
function set_robber_info(place_id,robber_index,victim_index,randomint,cost=false)
{
	//设置强盗的UI回调函数,只需要清除selectors和active
	clear_selectors();
	$("#action_use_dev_soldier").removeClass("active");
	if(cost){
		game_info.players[robber_index].soldier_num--;
		game_info.players[robber_index].soldier_used++;
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
		}
		count-=victim[order[i]+"_num"];
	}
}
//--------------------------------------------------------
// 丢弃资源(因为丢出7)
//--------------------------------------------------------
function drop_srcs(drop_list,dropper_index){
	//遍历丢弃列表,舍弃对应数字
	var dropper=game_info.player_list[dropper_index];
	for(var src_id in drop_list){
		dropper[order[src_id]+"_num"]-=drop_list[src_id];
		his_window.push(game_info.player_list[dropper_index][1]+" 丢弃了 "+order_ch[src_id]+" x "+drop_list[src_id]);
	}
	//完成丢弃后,检查recive_list,释放操作权或保持等待。
	game_temp.recive_list.splice(game_temp.recive_list.indexOf(dropper_index),1);
	if(game_temp.recive_list.length==0){
		$("wait_window").hide();
		//由掷出者设置强盗
		if(game_info.step_list[game_info.step_index]==user_index){
			his_window.push("由你设置强盗:");
			//当前行动记为action_set_robber_for_7
			//设置最初行动
	    	game_temp.action_base="action_set_robber_for_7";
			game_temp.action_now="action_set_robber_for_7";
			start_robber_set();
		}
	}
	else if(game_info.step_list[game_info.step_index]==user_index){
		his_window.push("等待其他玩家选择丢弃资源...");
		$("wait_window").show();
	}
}
//--------------------------------------------------------
// 新的回合
//--------------------------------------------------------
function new_turn()
{
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
	game_info.play_turns++;
	//清空所有玩家的发展卡get_before限制(尽管对于某位玩家来说只需要清除自己的)
	for(player_index in game_info.players){
		var player=game_info.players[player_index];	
		for(var i=0;i<4;i++){
			player[devs[i]+"_get_before"]=0;
		}
	}	
	//debug模式下,核心角色移交
	if(debug){
		user_index=game_info.step_list[game_info.step_index];
	}
	//动画：回合指示轮盘跳转
	turn_rounds();
	//添加消息
	his_window.push("----------回合结束----------");
	his_window.push("第 "+game_info.play_turns+" 回合,轮到 "+game_info.player_list[game_info.step_list[game_info.step_index]][1]+" 行动");
	//emmm好像没什么要做的了= =||
	//UI更新
	UI_new_turn();
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