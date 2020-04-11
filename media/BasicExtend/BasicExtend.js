//--------------------------------------------------------
// BasicExtend.js
// 卡坦岛原版拓展
// 主要是将原版的有关发展卡的规则单独移了出来
//--------------------------------------------------------
function BasicExtendBase(){
	throw new Error('This is a static class');
}
//------------------基础参数--------------------
BasicExtendBase.extraNewTurnAction = true;
ExtendManager.registExtend(BasicExtendBase);
console.log("BasicExtend load success!");
//---------------------------------------------
//------------------新的数据--------------------
dev_cards.push("soldier","plenty","monopoly","road_making");
score_cards.push("artemis","oxford","panama","forbiddencity","vasili");
dev_ch["soldier"]="士兵"
dev_ch["plenty"]="丰收之年"
dev_ch["monopoly"]="垄断"
dev_ch["road_making"]="道路建设"
dev_cards_intro["soldier"]="移动强盗,之后可以掠夺强盗附近城市所有者的资源卡。";
dev_cards_intro["plenty"]="立刻获得两份资源,类型不限。";
dev_cards_intro["monopoly"]="从其他玩家手上拿走所有你指定的资源,但使用后本回合不能进行修建。";
dev_cards_intro["road_making"]="立刻无消耗修建两条道路,只要满足修建的基本规则即可。";
//---------------------------------------------
use_dev["soldier"]=function(){
	//设置基础行动
	game_temp.action_base="action_use_dev_soldier";
	//当前行动记为"action_use_dev_soldier"
	game_temp.action_now="action_use_dev_soldier";
	his_window.push("由你设置强盗:");
	//启动强盗选择
	UI_start_robber_set();
};
use_dev["plenty"]=function(){
	//当前行动记为"action_use_dev_plenty"
	game_temp.action_now="action_use_dev_plenty";
	game_temp.item_top_limit = 2;
	his_window.push("选择要丰收的资源:");
	UI_start_plenty_select();
};
use_dev["monopoly"]=function(){
	//当前行动记为"action_use_dev_monopoly"
	game_temp.action_now="action_use_dev_monopoly";
	his_window.push("选择要垄断的资源:");
	$(".src_selector").show();
	return src_cards.length-1;
};
use_dev["road_making"]=function(){
	//当前行动记为"action_use_dev_road_making"
	game_temp.action_now="action_use_dev_road_making";
	game_temp.selected_edge=[];
	//激活道路选择器,只激活可以建设道路的地方
	var edges=available_edges(user_index);
	for(var i in edges){
		var selector=$("edge_selector").filter("#"+edges[i]).addClass("active selector_available").show();
	}
};

//------------------额外事件--------------------
BasicExtendBase.new_turn = function{
	//清空所有玩家的发展卡限制(尽管对于某位玩家来说只需要清除自己的)
	for(player_index in $gamePlayers){
		let player=$gamePlayers[player_index];	
		for(let dev of dev_cards){
			player.dev_get_record(dev,0);
			player.dev_used=false;
			player.no_build_dev_used=false;
		}
	}	
}