/*复杂的交易逻辑的控制模块
	成员：
	id：这笔交易的唯一序号
	starter：交易发起者
	accepter：交易目标(对于与银行交易,0为银行,1-5为资源港，6为任意港)
	trade_state：交易状态(prepare,requesting,finished)
	final_accepter：最终与交易发起者达成交易者
	give_list：发起者给予物资
	get_list：接受者给予物资

  
*/
//game_info.trades={};
//game.active_trades=[];

class Transaction{
	constructor(id,starter,accepter){
		this.id=id;
		this.starter=starter;
		this.accepter=accepter;
		this.trade_starte="prepare";
		this.starter_list={};
		this.accepter_list={};
	}
	//用新对象替代原对象
	refresh(new_transcation){
		this.trade_starte=new_transcation.trade_starte;
		this.starter_list=new_transcation.starter_list;
		this.accepter_list=new_transcation.accepter_list;
	}
	//清空交易栏
	clear(){
		this.trade_starte="prepare";
		this.starter_list={};
		this.accepter_list={};
	}
	//交易列表更新
	item_refresh(){
		//获取交易栏的所有资源
		this.starter_list={};
		this.accepter_list={};
		var items1=game_UI_list.trade_items._give.selected;
		var items2=game_UI_list.trade_items._get.selected;
		for(var i in items1){
			var UI_id=items1[i];
			var item=game_UI[UI_id];
			if(item.own_num==0){continue;}
			this.starter_list[src_reflection[item.item_type]]=item.own_num;
		}
		for(var i in items2){
			var UI_id=items2[i];
			var item=game_UI[UI_id];
			if(item.own_num==0){continue;}
			this.accepter_list[src_reflection[item.item_type]]=item.own_num;
		}
	}
}

//--------------------------------------------------------
// 启动交易窗口
//--------------------------------------------------------
function start_trade_window(target="bank",target_val="bank"){
	var init_give_items_avaliable=[];
	var init_wonder_items_avaliable=[];
	var self_player=game_info.players[user_index];
	var action_text;
	var head_text;
	var trade_ratio=1;
	var trades=game_info.trades;
	game_temp.action_now="action_trade";
	game_temp.trade_basic_give_num=0;
	game_temp.trade_basic_get_num=0;
	game_temp.trade_target_value=target_val;
	game_temp.action_trade_items_function=trade_items;
	//设置交易目标与可用资源
	switch(target){
		//银行,目标可以是任何银行还有的资源,给予栏只显示有的
		case "bank":
			game_temp.trade_now_id=0;
			var accepter_cards=game_info.cards;
			trade_ratio=4;
			action_text="发起交易";
			head_text="与银行交易 4:1";
			init_wonder_items_avaliable.push(1,2,3,4,5);
			init_give_items_avaliable.push(1,2,3,4,5);
			break;
		//港口,实际交易目标还是银行
		case "harbour":
			game_temp.trade_now_id=0;
			var accepter_cards=game_info.cards;
			action_text="发起交易";
			if(target_val=="6"){
				trade_ratio=3;
				init_give_items_avaliable.push(1,2,3,4,5);
				head_text="与"+order_ch[target_val]+"港交易 3:1";
			}
			else{
				trade_ratio=2;
				init_give_items_avaliable.push(parseInt(target_val));
				head_text="与"+order_ch[target_val]+"港交易 2:1";
			}
			init_wonder_items_avaliable.push(1,2,3,4,5);
			break;
		//玩家,交易的各个选项都不受限制,且出于资源保密,会设置不显示资源数
		case "player":
			//检查是否有target玩家发起给本机玩家的进行中交易
			var recive_trade_id=target_val*(game_info.players.length+1)+user_index;
			if(game_info.active_trades.indexOf(recive_trade_id)==-1){
				//没有则认为是在向target发起交易
				game_temp.trade_now_id=user_index*(game_info.players.length+1)+target_val;
				var starter_cards=game_info.players[user_index];
				var accepter_cards=game_info.players[target_val].src_secret?unknown_cards:game_info.players[target_val];
			}
			else{
				game_temp.trade_now_id=recive_trade_id;
				var starter_cards=game_info.players[target_val].src_secret?unknown_cards:game_info.players[target_val];
				var accepter_cards=game_info.players[user_index];
			}				
			action_text="发起交易";
			trade_ratio=1;
			init_give_items_avaliable.push(1,2,3,4,5);
			init_wonder_items_avaliable.push(1,2,3,4,5);
			head_text="与 "+game_info.player_list[target_val][1]+" 交易";
			break;
	}
	//设置已选择资源
	var trade=trades[game_temp.trade_now_id];
	//如果并非正在进行的交易,对交易内容进行初始化	
	if(game_info.active_trades.indexOf(game_temp.trade_now_id)==-1){		
		trade.clear();
	}
	var starter_selected=trade.starter_list;
	var accepter_selected=trade.accepter_list;
	var items=game_UI_list.trade_items._give.selected;
	for(var i=0;i<items.length;i++){
		var UI_id=items[i];
		var item=game_UI[UI_id];
		var src_id=src_reflection[item.item_type];
		item.ratio_num=trade_ratio;
		item.own_num=starter_selected.hasOwnProperty(src_id)?starter_selected[src_id]:0;
		item.jqdom_init();
	}
	items=game_UI_list.trade_items._get.selected;
	for(var i=0;i<items.length;i++){
		var UI_id=items[i];
		var item=game_UI[UI_id];
		var src_id=src_reflection[item.item_type];
		item.ratio_num=1;
		item.own_num=accepter_selected.hasOwnProperty(src_id)?accepter_selected[src_id]:0;
		item.jqdom_init();
	}
	items=game_UI_list.trade_items._give.avaliable;
	for(var i=0;i<items.length;i++){
		var UI_id=items[i];
		var item=game_UI[UI_id];
		if(init_give_items_avaliable.indexOf(src_reflection[item.item_type])==-1){
			var src_num=0;
		}
		else{
			var src_num=self_player[item.item_type+"_num"];
		}
		item.ratio_num=trade_ratio;
		item.own_num=src_num;
		item.jqdom_init();
	}
	items=game_UI_list.trade_items._get.avaliable;
	for(var i=0;i<items.length;i++){
		var UI_id=items[i];
		var item=game_UI[UI_id];
		item.ratio_num=1;
		//如果玩家选择保密自己的资源数,则应用secret属性
		item.secret=game_temp.trade_target=="player"?game_info.players[target_val].src_secret:false;
		if(init_wonder_items_avaliable.indexOf(src_reflection[item.item_type])==-1){
			var src_num=0;
		}
		else{
			var src_num=accepter_cards[item.item_type+"_num"];
		}
		item.own_num=src_num;
		item.jqdom_init();
	}
	$("#action_trade_items").addClass("disabled");
	$("trade_window").children().filter("window_head").children().filter("head_text").text(head_text);
	$("#action_trade_items").text(action_text);
	$("trade_state").text("");
	$("trade_window").show();
}