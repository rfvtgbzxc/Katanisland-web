//--------------------------------------------------------
// BasicExtend.js
// 卡坦岛原版拓展
// 主要是将原版的有关发展卡的规则单独移了出来
//--------------------------------------------------------
function BasicExtend(){
	throw new Error('This is a static class');
}
BasicExtend.alias={};
//------------------基础参数--------------------
BasicExtend.extraNewTurnAction = true;
ExtendManager.registExtend(BasicExtend);
console.log("BasicExtend load success!");
//---------------------------------------------
//------------------新的数据--------------------
dev_cards.push("soldier","plenty","monopoly","road_making");
score_cards.push("artemis","oxford","panama","forbiddencity","vasili");
//---------------------------------------------
//--------------------------------------------------------
// 基础建设额外菜单：抽取发展卡
//--------------------------------------------------------
DynamicMenu.add_menu_item("base_build",{
	key:"draw_a_dev_card",
	name:"抽取发展卡",
	intro:"抽一张发展卡,之后可以使用发展卡来帮助你赢得胜利。抽到的发展卡不能立刻使用(除分数卡)。",
	costlist:[{type:"wool",num:1},{type:"grain",num:1},{type:"ore",num:1}],
	on_active:{
		run:async function(){
			try{
				var valid = this.start();
				[selector,action] = await GameUI.next_step();
				if(action=="confirm" && valid){this.final();}
			}
			catch(e){
				//使用trycatch来以更直接的方式结束等待闭环
				if(e.message=="breakPromiseLine"){return;}
				throw e;
			}
		},
		start:function(){
			var player=$gameSystem.self_player();
			if(player.src("wool")==0 || player.src("grain")==0 || player.src("ore")==0){
				confirm_window.set("资源不足！");
				confirm_window.show();
				return false;
			}
			else{
				confirm_window.set(`要抽取发展卡吗？`);
				confirm_window.show();
				return true;
			}	
		},
		final:function(){
			if($gameBank.all_dev_num()==0){his_window.push("发展卡已经被抽完了。");}
			else{ws.sendmsg("mes_action",{"starter":user_index,"val":[1,4,0,$gameBank.all_dev_num()]});}	
		}
	}
});
//--------------------------------------------------------
// 发展卡详细信息与功能函数
//--------------------------------------------------------
//--------------------------------------------------------
// 士兵
//--------------------------------------------------------
DynamicMenu.add_menu_item("use_dev",{
	key:"soldier",
	name:"士兵",
	intro:"移动强盗,之后可以掠夺强盗附近城市所有者的资源卡。",
	on_active:new promiseLineTemplates.SelectPlaceAndRobPlayer({
		final:function(){
			if(this.selected_player==0){
				ws.sendmsg("mes_action",{"starter":user_index,"val":[3,1,this.selected_place,this.selected_player,0,1]});
			}
			else
			{
				ws.sendmsg("mes_action",{"starter":user_index,"val":[3,1,this.selected_place,this.selected_player,0,$gamePlayers[this.selected_player].all_src_num()]});
			}
		}
	})
});
//--------------------------------------------------------
// 丰收
//--------------------------------------------------------
DynamicMenu.add_menu_item("use_dev",{
	key:"plenty",
	name:"丰收之年",
	intro:"立刻获得两份资源,种类不限。",
	on_active:function(){
		//当前行动记为"action_use_dev_plenty"
		game_temp.action_now="action_use_dev_plenty";
		game_temp.item_top_limit = 2;
		his_window.push("选择要丰收的资源:");
		UI_start_plenty_select();
	}
});
//--------------------------------------------------------
// 垄断
//--------------------------------------------------------
DynamicMenu.add_menu_item("use_dev",{
	key:"monopoly",
	name:"垄断",
	intro:"从其他玩家手上拿走所有你指定的资源,但使用后本回合不能进行修建。",
	on_active:function(){
		//当前行动记为"action_use_dev_monopoly"
		game_temp.action_now="action_use_dev_monopoly";
		his_window.push("选择要垄断的资源:");
		$(".src_selector").show();
	}
});
//--------------------------------------------------------
// 道路建设
//--------------------------------------------------------
DynamicMenu.add_menu_item("use_dev",{
	key:"road_making",
	name:"道路建设",
	intro:"立刻无消耗修建两条道路,只要满足修建的基本规则即可。",
	on_active:new promiseLineTemplates.BuildTwoRoads({
		final:function(){
			ws.sendmsg("mes_action",{"starter":user_index,"val":[3,4,...this.selected_edge]});
		}
	});
});
//--------------------------------------------------------
// 函数覆写
//--------------------------------------------------------
//--------------------------------------------------------
// 重载游戏
//--------------------------------------------------------
function reload_game(){
	//检测当前游戏状态
	switch($gameSystem.game_process){
	//尚未开始
	case 0:
		//等待所有玩家加入完毕
		break;
	//投掷骰子
	case 1:
		if(!$gameSystem.is_audience()){		
			UI_start_dice();
			if($gameSystem.self_player().first_dice[0]!=0){
				var nums = $gameSystem.self_player().first_dice;
				var num_sum = nums[0] + nums[1];
				his_window.push("正在确定行动顺序,你已投骰,共计 "+num_sum,"important");
				UI_set_dices(nums[0],nums[1]);
			}
			else{
				his_window.push("所有玩家准备就绪,开始确定行动顺序,请投骰子：","important");
			}
		}
		break;
	//前期坐城
	case 2:
		create_step_list();
		if(!$gameSystem.is_audience()){
			//在自己的回合,进行判断
			if($gameSystem.is_own_turn()){
				var own_cities = $gameSystem.active_player().own_cities
				UI_start_set_home($gameSystem.active_player().home_step,own_cities[own_cities.length-1]);
			}		
		}
		break;
	//正常游戏
	case 3:
		create_step_list();
		UI_begin_turn();
		//是否已经投骰?
		if($gameSystem.dice_num[0]!=0){
			UI_set_dices(...$gameSystem.dice_num);
			//查看投出7的进行状态
			if($gameSystem.dice_7_step==0){
				//由于非正交的层级设计,如果不是自己回合该函数没有任何作用= =,不过会打开计时器
				UI_start_build();
			}
			else{
				if(!$gameSystem.is_audience()){
					if($gameSystem.dice_7_step==1){
						start_drop_select();
					}
					else if($gameSystem.dice_7_step==2 && $gameSystem.is_own_turn()){
						start_robber_set();
					}
				}
				break;
			}
			if(!$gameSystem.is_audience()){
				//检查交易并显示
				for(let trade_id of $gameSystem.active_trades){
					let trade = $gameTrades[trade_id];
					if(trade.accepter_index==user_index){
						his_window.push($gamePlayers[trade.starter_index].name+" 想要与你交易","important");
						show_special_actions("trade",trade.starter_index);
						break;
					}
				}	
			}			
		}
		break;	
	}
}
//--------------------------------------------------------
// 函数拓展
//--------------------------------------------------------
//--------------------------------------------------------
// 加载骰子
//--------------------------------------------------------
BasicExtend.alias.create_dices = create_dices;
create_dices = function(){
	BasicExtend.alias.create_dices();
	$("dice_list").append(`<dice dice_id="0"></dice>`);
	$("dice_list").append(`<dice dice_id="1"></dice>`);
};
//--------------------------------------------------------
// 额外玩家标记：最大军队
//--------------------------------------------------------
BasicExtend.alias.create_player_info = create_player_info;
create_player_info = function(player_state,player){
	BasicExtend.alias.create_player_info(player_state,player);
	player_state.append("<max_minitory></max_minitory>")
	//设置激活标记
	if($gameSystem.max_minitory==player.index){add_player_tag(player.index,"max_minitory");}
};
//--------------------------------------------------------
// 发展卡使用限制
//--------------------------------------------------------
BasicExtend.alias.usable_use_dev = Game_System.prototype.usable_use_dev;
Game_System.prototype.usable_use_dev = function(action) {
	let [result,reason] = BasicExtend.alias.usable_use_dev(action);
	if(!result){return [result,reason];}
	if(this.self_player().dev_used){
		result = false;
		reason = "本回合已使用发展卡";
		return [result,reason];
	}
	if(this.self_player().dev(action.key)<=this.self_player().dev_get_record(action.key)){
		result = false;
		reason = "本回合获得的发展卡不能立刻使用";
		return [result,reason];
	}
	return [result,reason];
};
//--------------------------------------------------------
// 垄断导致的禁止建造
//--------------------------------------------------------
BasicExtend.alias.usable_base_build = Game_System.prototype.usable_base_build;
Game_System.prototype.usable_base_build = function(action) {
	let [result,reason] = BasicExtend.alias.usable_base_build(action);
	if(!result){return [result,reason];}
	if(this.self_player().no_build_dev_used){
		result = false;
		reason = "本回合使用过垄断等使用后禁止建设的发展卡";
		return [result,reason];
	}
	return [result,reason];
};
//--------------------------------------------------------
// 额外事件
//--------------------------------------------------------
//--------------------------------------------------------
// 新的回合
//--------------------------------------------------------
GameEvent.addEventListener("new_turn",function(){
	//清空所有玩家的发展卡限制(尽管对于某位玩家来说只需要清除自己的)
	for(player_index in $gamePlayers){
		let player=$gamePlayers[player_index];	
		for(let dev of dev_cards){
			player.dev_get_record(dev,0);
			player.dev_used=false;
			player.no_build_dev_used=false;
		}
	}
});
