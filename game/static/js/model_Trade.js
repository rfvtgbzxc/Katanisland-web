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
	constructor(id,starter=0,accepter=0,starter_list={},accepter_list={}){
		if(typeof(id)=="object"){
			this.id=id.id;
			this.starter=id.starter;
			this.accepter=id.accepter;
			this.trade_state=id.trade_state;
			this.starter_list=id.starter_list;
			this.accepter_list=id.accepter_list;
		}
		else{
			this.id=id;
			this.starter=starter;
			this.accepter=accepter;
			this.trade_state="prepare";
			this.starter_list=starter_list;
			this.accepter_list=accepter_list;
		}		
	}
	//用新相同对象替代原对象
	refresh(new_transcation){
		this.trade_state=new_transcation.trade_state;
		this.starter_list=new_transcation.starter_list;
		this.accepter_list=new_transcation.accepter_list;
	}
	//用新不同对象替代原对象
	reload(new_transcation){
		this.starter_list=new_transcation.starter_list;
		this.accepter_list=new_transcation.accepter_list;
	}
	//清空交易栏
	clear(){
		this.trade_state="prepare";
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
function start_trade_window(target="bank",target_val=0){
	var init_give_items_avaliable=[];
	var init_wonder_items_avaliable=[];
	var self_player=game_info.players[user_index];
	var starter_cards=self_player;
	var accepter_cards=game_info.cards;
	var action_text;
	var head_text;
	var trade_state="";
	var person="你";
	var trade_ratio=1;
	var trades=game_info.trades;
	target_val=parseInt(target_val);
	game_temp.action_now="action_trade";
	game_temp.trade_target=target;
	game_temp.trade_basic_give_num=0;
	game_temp.trade_basic_get_num=0;
	game_temp.trade_target_value=target_val;
	game_temp.action_trade_items_function=trade_items;
	$("#action_refuse_trade_items").hide();
	//设置交易目标与可用资源
	switch(target){
		//银行,目标可以是任何银行还有的资源,给予栏只显示有的
		case "bank":
			game_temp.trade_now_id=0;
			trade_ratio=4;
			action_text="发起交易";
			head_text="与银行交易 4:1";
			init_wonder_items_avaliable.push(1,2,3,4,5);
			init_give_items_avaliable.push(1,2,3,4,5);
			break;
		//港口,实际交易目标还是银行
		case "harbour":
			game_temp.trade_now_id=0;
			game_temp.trade_target="bank";
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
			var recive_trade_id=target_val*(Object.keys(game_info.players).length+1)+user_index;
			if(game_info.active_trades.indexOf(recive_trade_id)==-1){
				//没有则认为是在向target发起交易
				game_temp.trade_now_id=user_index*(Object.keys(game_info.players).length+1)+target_val;
				starter_cards=game_info.players[user_index];
				accepter_cards=game_info.players[target_val].src_secret?unknown_cards:game_info.players[target_val];
			}
			else{
				game_temp.trade_now_id=recive_trade_id;
				starter_cards=game_info.players[target_val].src_secret?unknown_cards:game_info.players[target_val];
				accepter_cards=game_info.players[user_index];
				person="他";
			}				
			action_text="发起交易";
			trade_ratio=1;
			init_give_items_avaliable.push(1,2,3,4,5);
			init_wonder_items_avaliable.push(1,2,3,4,5);
			head_text="与 "+game_info.player_list[target_val][1]+" 交易";
			break;
	}
	//设置已选择资源
	var trade=game_temp.trade_now_id==0?game_temp.bank_trade:trades[game_temp.trade_now_id];
	//如果并非正在进行的交易,对交易内容进行初始化(对于银行的交易一定生效)	
	if(game_info.active_trades.indexOf(game_temp.trade_now_id)==-1){		
		trade.clear();
	}
	else{
		if(trade.starter==user_index){
			trade_state="等待对方响应...";
			action_text="取消交易";
		}
		else{
			trade_state="请作出回应...";
			action_text="接受交易";
			game_temp.action_trade_items_function=accept_trade;
			$("#action_refuse_trade_items").show();
		}
		
	}
	game_temp.trade_now=trade;
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
		//如果目标玩家选择保密自己的资源数,则应用secret属性
		item.secret=(game_temp.trade_target=="player" && person=="他")?game_info.players[target_val].src_secret:false;
		if(init_give_items_avaliable.indexOf(src_reflection[item.item_type])==-1){
			var src_num=0;
		}
		else{
			var src_num=starter_cards[item.item_type+"_num"];
		}
		item.ratio_num=trade_ratio;
		item.own_num=src_num;
		item.jqdom_init();
		//扣除已置于列表中的资源
		item.own_num-=item.rlt_item.own_num;
		item.jqdom_update();
	}
	items=game_UI_list.trade_items._get.avaliable;
	for(var i=0;i<items.length;i++){
		var UI_id=items[i];
		var item=game_UI[UI_id];
		item.ratio_num=1;
		//如果目标玩家选择保密自己的资源数,则应用secret属性
		item.secret=(game_temp.trade_target=="player" && person=="你")?game_info.players[target_val].src_secret:false;
		if(init_wonder_items_avaliable.indexOf(src_reflection[item.item_type])==-1){
			var src_num=0;
		}
		else{
			var src_num=accepter_cards[item.item_type+"_num"];
		}
		item.own_num=src_num;
		item.jqdom_init();
		//扣除已置于列表中的资源
		item.own_num-=item.rlt_item.own_num;
		//如果资源不足,不允许接受交易
		if(item.own_num<0){$("#action_trade_items").addClass("disabled");}
		item.jqdom_update();
	}
	if(game_info.active_trades.indexOf(game_temp.trade_now_id)==-1){		
		$("#action_trade_items").addClass("disabled");
	}
	else{
		$("#action_trade_items").text("取消交易").removeClass("disabled");
	}	
	$("trade_window").children().filter("window_head").children().filter("head_text").text(head_text);
	$("trade_window").children().filter("src_select_window").children().filter("head_text").children().filter("person").text(person);
	$("#action_trade_items").text(action_text);
	$("trade_state").text(trade_state);
	$("trade_window").show();
}

//--------------------------------------------------------
// 发起交易
//--------------------------------------------------------
trade_items = function(){
	//更新交易信息
	$("trade_state").text("等待对方响应...");
	$("#action_trade_items").text("取消交易");
	game_temp.action_trade_items_function=cancel_trade;
	//获取交易栏的所有资源,更新交易对象
	var items1=game_UI_list.trade_items._give.selected;
	var items2=game_UI_list.trade_items._get.selected;
	for(var i in items1){
		var UI_id=items1[i];
		var item=game_UI[UI_id];
		if(item.own_num==0){continue;}
		game_temp.trade_now.starter_list[src_reflection[item.item_type]]=item.own_num;
	}
	for(var i in items2){
		var UI_id=items2[i];
		var item=game_UI[UI_id];
		if(item.own_num==0){continue;}
		game_temp.trade_now.accepter_list[src_reflection[item.item_type]]=item.own_num;
	}
	//更新交易状态
	game_temp.trade_now.trade_state="requesting";
	game_info.active_trades.push(game_temp.trade_now.id);

	//根据交易类型,有不同的处理
	switch(game_temp.trade_target){
		case "bank":
			//发送消息
			ws.sendmsg("mes_action",{"starter":user_index,"val":[2,1,game_temp.trade_now.starter_list,game_temp.trade_now.accepter_list]});
			break;
		case "player":
			//发送消息
			ws.sendmsg("mes_action",{"val":[2,3,game_temp.trade_now]});
			break;
	}
	//手动关闭等待页面,以此让玩家有取消交易的机会
	if(game_temp.trade_now_id!=0){
		$("wait_window").hide();
	}
}
//--------------------------------------------------------
// 接受交易
//--------------------------------------------------------
accept_trade=function(){
	var trade=game_temp.trade_now;
	//发送消息
	ws.sendmsg("mes_action",{"starter":trade.accepter,"accepter":trade.starter,"val":[2,4,1,trade.id]});
}
//--------------------------------------------------------
// 拒绝交易
//--------------------------------------------------------
refuse_trade=function(){
	var trade=game_temp.trade_now;
	//发送消息 
	ws.sendmsg("mes_action",{"starter":trade.accepter,"val":[2,4,2,trade.id]});
}
//--------------------------------------------------------
// 取消交易
//--------------------------------------------------------
cancel_trade=function(){
	//已不是活动交易,则什么也不做
	if(game_info.active_trades.indexOf(trade_now_id)==-1){return;}
	var trade=game_temp.trade_now;
	trade.trade_state="canceled";
	game_info.active_trades.splice(game_info.active_trades.indexOf(trade.id),1);
	window_finish_trade(trade);
	//发送消息
	ws.sendmsg("mes_action",{"val":[2,4,3,trade.id]});
}
//--------------------------------------------------------
// 结束交易窗口
//--------------------------------------------------------
window_finish_trade=function(trade){
	//更新交易信息
	var person;
	//无关者
	var neither=trade.starter!=user_index && trade.final_accepter!=user_index && trade.accepter!=user_index ;
	switch(trade.trade_state){
		case "success":
			if(neither){
				his_window.push(game_info.player_list[trade.starter][1]+" 与 "+game_info.player_list[trade.accepter][1]+" 达成了交易！",'important');
			}
			else{
				person=trade.accepter==user_index?"你":game_info.player_list[trade.accepter][1];
				his_window.push(person+" 接受了交易!",'important');
			}		
			break;
		case "refused":
			if(neither){break;}
		    person=trade.accepter==user_index?"你":game_info.player_list[trade.accepter][1];
			his_window.push(person+" 拒绝了交易!","important");
			break;
		case "canceled":
			if(neither && trade.accepter!=0){break;}
			person=trade.starter==user_index?"你":game_info.player_list[trade.starter][1];
			his_window.push("交易被 "+person+" 取消!","important");
			break;
	}
	//如果正在查看与结束的交易无关的窗口,不会刷新窗口内容
	if(game_temp.trade_now_id==trade.id)
	{
		switch(trade.trade_state){
			case "success":
				$("trade_state").text("交易成功!");
				break;
			case "refused":
				person=trade.accepter==user_index?"":"对方";
				$("trade_state").text(person+"拒绝交易!");
				break;
			case "canceled":
				$("trade_state").text("交易被取消!");
				break;
		}
		$("#action_trade_items").text("关闭窗口");
		game_temp.action_trade_items_function=close_trade_window;
	}
	$("#action_refuse_trade_items").hide();
	//关闭特殊选项中的快捷交易
	$("special_actions").children().filter(function(){
		return parseInt($(this).attr("target_val"))==trade.starter;
	}).hide();		
}
//--------------------------------------------------------
// 关闭交易窗口
//--------------------------------------------------------
function close_trade_window(){
	//关闭窗口,并取消激活状态
	$("trade_window").hide();
	//可优化,定位之前的UI
	$(".action_prepare_trade").removeClass("active");
}