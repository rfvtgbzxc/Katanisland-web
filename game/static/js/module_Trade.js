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
	constructor(id,starter_index=0,accepter_index=0,starter_list={},accepter_list={}){
		if(typeof(id)=="object"){
			this.id=id.id;
			this.starter_index=id.starter_index;
			this.accepter_index=id.accepter_index;
			this.trade_state=id.trade_state;
			this.starter_list=id.starter_list;
			this.accepter_list=id.accepter_list;
		}
		else{
			this.id=id;
			this.starter_index=starter_index;
			this.accepter_index=accepter_index;
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
	/*
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
	}*/
}
//--------------------------------------------------------
// 初始化交易数据与可用资源
//--------------------------------------------------------
function initialize_trade_config(target,target_val){
	var starter_available=[];
	var accepter_available=[];
	var starter=$gameSystem.self_player();
	var accepter=$gameBank;
	var action_text;
	var head_text;
	var trade_state="";
	var person="你";
	var trade_ratio=1;
	var trades=game_info.trades;
	var can_trade=true;
	var secret;
	var trade_now_id;
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
			trade_now_id=0;
			trade_ratio=4;
			action_text="发起交易";
			head_text="与银行交易 4:1";
			accepter_available.push(...src_cards);
			starter_available.push(...src_cards);
			break;
		//港口,实际交易目标还是银行
		case "harbour":
			trade_now_id=0;
			game_temp.trade_target="bank";
			action_text="发起交易";
			if(target_val=="6"){
				trade_ratio=3;
				starter_available.push(...src_cards);
				head_text="与"+order_ch[target_val]+"港交易 3:1";
			}
			else{
				trade_ratio=2;
				starter_available.push(order[target_val]);
				head_text="与"+order_ch[target_val]+"港交易 2:1";
			}
			accepter_available.push(...src_cards);
			break;
		//玩家,交易的各个选项都不受限制,且出于资源保密,会设置不显示资源数
		case "player":
			//检查是否有target玩家发起到本机玩家的进行中交易
			var recive_trade_id=target_val*(Object.keys($gamePlayers).length+1)+user_index;
			if(!$gameSystem.active_trades.includes(recive_trade_id)){
				//没有则认为是在向target发起交易
				trade_now_id=user_index*(Object.keys($gamePlayers).length+1)+target_val;
				starter=$gamePlayers[user_index];
				accepter=$gamePlayers[target_val];
			}
			else{
				trade_now_id=recive_trade_id;
				starter=$gamePlayers[target_val];
				accepter=$gamePlayers[user_index];
				person="他";
			}				
			action_text="发起交易";
			trade_ratio=1;
			starter_available.push(...src_cards);
			accepter_available.push(...src_cards);
			head_text=target_val=="0"?`${$gamePlayers[target_val].name} 的公开交易`:`与 ${$gamePlayers[target_val].name} 交易`;	
			break;
	}
	//设置已选择资源
	var trade=trades[trade_now_id];
	//如果并非正在进行的交易,对交易内容进行初始化(对于银行的交易一定生效)	
	if(!$gameSystem.active_trades.includes(trade.id)){		
		trade.clear();
		can_trade=false;
	}
	else{
		if(trade.starter_index==user_index){
			trade_state="等待对方响应...";
			action_text="取消交易";
			game_temp.action_trade_items_function=cancel_trade;
		}
		else{
			trade_state="请作出回应...";
			action_text="接受交易";
			game_temp.action_trade_items_function=accept_trade;
			$("#action_refuse_trade_items").show();
		}
	}
	var src_secret_starter = (game_temp.trade_target=="player" && trade.accepter_index==user_index)?$gamePlayers[trade.starter_index].src_secret:false;
	var src_secret_accepter = (game_temp.trade_target=="player" && trade.starter_index==user_index)?$gamePlayers[trade.accepter_index].src_secret:false;
	var starter_selected=trade.starter_list;
	var accepter_selected=trade.accepter_list;
	game_temp.trade_now=trade;
	game_temp.trade_now_id=trade_now_id;
	$("trade_window window_head head_text").text(head_text);
	$("trade_window person").text(person);
	$("#action_trade_items").text(action_text);
	$("trade_state").text(trade_state);
	$("trade_window").show();

	return [trade_ratio,starter_available,accepter_available,starter_selected,accepter_selected,src_secret_starter,src_secret_accepter,starter,accepter,can_trade];
}
//--------------------------------------------------------
// 启动交易窗口
//--------------------------------------------------------
function start_trade_window(target="bank",target_val=0){
	var [trade_ratio,starter_available,accepter_available,starter_selected,accepter_selected,src_secret_starter,src_secret_accepter,starter,accepter,can_trade]=initialize_trade_config(target,target_val);
	//遍历UI并设置参数
	//交易发起方想要资源
	var items=game_UI_list.trade_items._give.selected;	
	for(var i=0;i<items.length;i++){
		var UI_id=items[i];
		var item=game_UI[UI_id];
		var src_key=item.item_type;
		item.ratio_num=trade_ratio;
		item.own_num=!!starter_selected[src_key]?starter_selected[src_key]:0;
		item.jqdom_init();
	}
	//交易接收方想要资源
	items=game_UI_list.trade_items._get.selected;
	for(var i=0;i<items.length;i++){
		var UI_id=items[i];
		var item=game_UI[UI_id];
		var src_key=item.item_type;
		item.ratio_num=1;
		item.own_num=!!accepter_selected[src_key]?accepter_selected[src_key]:0;
		item.jqdom_init();
	}
	//拥有的资源
	//交易发起方拥有的资源
	items=game_UI_list.trade_items._give.available;
	for(var i=0;i<items.length;i++){
		var UI_id=items[i];
		var item=game_UI[UI_id];
		//如果与玩家交易,交易接收方能否看见资源数与发起方设置有关
		item.secret=src_secret_starter;
		item.ratio_num=trade_ratio;
		item.own_num=starter_available.includes(item.item_type) ? (src_secret_starter ? 99 : starter.src(item.item_type)) : 0;
		item.jqdom_init();
		//扣除已置于列表中的资源
		item.own_num-=item.rlt_item.own_num;
		item.jqdom_update();
	}
	//交易接收方拥有的资源	
	items=game_UI_list.trade_items._get.available;
	for(var i=0;i<items.length;i++){
		var UI_id=items[i];
		var item=game_UI[UI_id];
		item.ratio_num=1;
		//如果与玩家交易,交易发起方能否看见资源数与接收方设置有关
		item.secret=src_secret_accepter;
		item.own_num=accepter_available.includes(item.item_type) ? (src_secret_accepter ? 99 : accepter.src(item.item_type)) : 0;
		item.jqdom_init();
		//扣除已置于列表中的资源
		item.own_num-=item.rlt_item.own_num;
		//如果资源不足,不允许接受交易
		if(item.own_num<0){can_trade=false;}
		item.jqdom_update();
	}
	can_trade?$("#action_trade_items").removeClass("disabled"):$("#action_trade_items").addClass("disabled");	
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
		game_temp.trade_now.starter_list[item.item_type]=item.own_num;
	}
	for(var i in items2){
		var UI_id=items2[i];
		var item=game_UI[UI_id];
		if(item.own_num==0){continue;}
		game_temp.trade_now.accepter_list[item.item_type]=item.own_num;
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
	ws.sendmsg("mes_action",{"starter":trade.accepter_index,"accepter":trade.starter_index,"val":[2,4,1,trade.id]});
}
//--------------------------------------------------------
// 拒绝交易
//--------------------------------------------------------
refuse_trade=function(){
	var trade=game_temp.trade_now;
	//发送消息 
	ws.sendmsg("mes_action",{"starter":trade.accepter_index,"val":[2,4,2,trade.id]});
}
//--------------------------------------------------------
// 取消交易
//--------------------------------------------------------
cancel_trade=function(){
	//已不是活动交易,则什么也不做
	if(game_info.active_trades.indexOf(game_temp.trade_now_id)==-1){return;}
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
window_finish_trade=function(trade,excutor=user_index){
	//更新交易信息
	var person;
	//无关者
	var neither=trade.starter_index!=user_index && trade.final_accepter!=user_index; //&& trade.accepter!=user_index ;
	switch(trade.trade_state){
		case "success":
			if(neither){
				his_window.push(game_info.player_list[trade.starter_index][1]+" 与 "+game_info.player_list[trade.accepter_index][1]+" 达成了交易！",'important');
			}
			else{
				person=trade.final_accepter==user_index?"你":game_info.player_list[trade.final_accepter][1];
				his_window.push(person+" 接受了交易!",'important');
			}		
			break;
		case "refused":
			if(neither && trade.accepter_index!=0){break;}
		    person=trade.accepter_index==user_index?"你":game_info.player_list[trade.accepter_index][1];
			his_window.push(person+" 拒绝了交易!","important");
			break;
		case "canceled":
			if(neither && trade.accepter_index!=0){break;}
			person=trade.starter_index==user_index?"你":game_info.player_list[trade.starter_index][1];
			his_window.push("交易被 "+person+" 取消!","important");
			break;
	}
	//如果正在查看与结束的交易无关的窗口,不会刷新窗口内容
	if(game_temp.trade_now_id==trade.id && (trade.accepter_index==0?trade.trade_state!="refused":true))
	{
		switch(trade.trade_state){
			case "success":
			    if(neither){
			    	$("trade_state").text("交易被抢先!");
			    }
			    else{
			    	$("trade_state").text("交易成功!");
			    }	
				break;
			case "refused":
				person=trade.accepter_index==user_index?"":"对方";
				$("trade_state").text(person+"拒绝交易!");
				break;
			case "canceled":
				$("trade_state").text("交易被取消!");
				break;
		}
		$("#action_trade_items").text("关闭窗口").removeClass("disabled");
		game_temp.action_trade_items_function=close_trade_window;
	}
	$("#action_refuse_trade_items").hide();
	//关闭特殊选项中的快捷交易
	$("special_actions").children().filter(function(){
		return parseInt($(this).attr("target_val"))==trade.starter_index;
	}).hide();	
	if(trade.accepter_index==0){
		$("special_actions").children().filter(function(){
			return parseInt($(this).attr("target_val"))=="0";
		}).hide();	
	}		
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