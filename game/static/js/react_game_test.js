//初始化全局数据
//debug模式
debug=false;
//脱机模式
offline=false;
//提示窗口
info_window={
	"set":function(text){
		$("info_window").empty();
		$("info_window").append("<div>"+text+"</div>");
	}
}
//历史消息
his_window={
	"push":function(text,type="normal"){
		$("his_text").append("<his_text_line class='"+type+"'>"+text+"</his_text_line>");
	},
	"clear":function(){$("his_text").empty();}
};
//确认窗口
confirm_window={
	"set":function(text){$("alert_text").text(""+text);},
	"clear":function(){$("alert_text").text("");},
	"show":function(){$("confirm_window").show();},
	"hide":function(){$("confirm_window").hide();}
};
//计时器
timer={
	"reset":function(){
		//$("timer").children().removeClass("active").removeClass("play");
	},
	"start":function(){
        $("timer").children().addClass("active").show();
        $("timer").children().addClass("active").addClass("play");
        if(game_info.step_list[game_info.step_index]==user_index){
        	this.timer_id=setTimeout(timer.finished,60000);
        }        
	},
	"stop":function(){
        $("timer").children().removeClass("active play").hide();
        if(game_info.step_list[game_info.step_index]==user_index){
        	clearTimeout(this.timer_id);
        }     
	},
	"finished":function(){
		//发送消息
		ws.sendmsg("mes_action",{"val":[6]});
	},
}
//游戏数据
map_info={};
game_info={};
places={};
edge_size=67;
xsize=0;
ysize=0;
last_step_index=0;
src_size=5;
//临时数据
game_temp={
	home_step:0,
	"action_now":"",
	"set_option":"",
	"recive_list":[],
	dev_used:false,
	no_build_dev_used:false,
	fst_dices:{"0":0},
};
game_UI={
	"UI_count":0,
};
game_UI_list={
	drop_items:{
		selected:[],
		avaliable:[]
	},
	trade_items:{
		_give:{
			selected:[],
			avaliable:[]
		},
		_get:{
			selected:[],
			avaliable:[]
		}		
	},
};
//个人标记（测试版本默认为第一位玩家）
user_id=1;
user_index=1;
//数据映射
load_process={
	"map":false,
	"game":false,
};
devs=["soldier","plenty","monopoly","road_making"];
order={
		0:"desert",
		1:"brick",
		2:"wood",
		3:"wool",
		4:"grain",
		5:"ore",
		6:"any_type"
};
order_ch={
		0:"沙漠",
		1:"砖块",
		2:"木材",
		3:"羊毛",
		4:"粮食",
		5:"铁矿",
		6:"任意"
};
src_reflection={
	"desert":0,
	"brick":1,
	"wood":2,
	"wool":3,
	"grain":4,
	"ore":5,
};
color_reflection={
	1:"light-blue",
	2:"dark-green",
	3:"light-orange",
	4:"light-red",
	5:"light-purple",
	6:"light-green",
};
color_reflection_hex={
	"light-blue":"#029ed9",
	"dark-green":"#006602",
	"light-orange":"#ff9b38",
	"light-red":"#ff3738",
	"light-purple":"#a3159a",
	"light-green":"#81ff38"
};
dir_reflection={
	"up":0,
	"ru":1,
	"rd":2,
	"dn":3,
	"ld":4,
	"lu":5
};
unknown_cards={
	"brick_num":99,
	"wood_num":99,
	"wool_num":99,
	"grain_num":99,
	"ore_num":99,
}
vp_info_text=[
"拥有的城市：",
"拥有的定居点：",
"最长道路：",
"最大军队：",
"拥有的奇观："
];
//--------------------------------------------------------
// 交互元素基本响应
//--------------------------------------------------------
$(document).ready(function(){
	//ws.sendmsg("user","test");
	//隐藏UI
	$("actions0").hide();
	$("actions1").children().not("actions2").hide();
	$("button").filter(function(){
		return $(this).attr("action_lv")==1;
	}).filter("#1").hide();
	$("dice").hide();
	$("confirm_window").hide();
	$("source_list").hide();
	$("special_actions").children().hide();
	
	//--------------------------------------------------------
	// UI：确认窗口
	//--------------------------------------------------------
	$("#confirm_action").click(function(){
		//关闭窗口
		$("confirm_window").hide();
		//如果game_temp的setting_option不为空,视为追加设置
		if(game_temp.set_option!=""){
			switch(game_temp.set_option){
				case "setting_no_robbing":
					game_temp.selected_player=0;
					break;
			}
			game_temp.setting_option="";
		}
		//如果game_temp含有"end_confirm"则立刻返回
		if(game_temp.end_confirm==true){
			game_temp.end_confirm=false;
			return;
		}
		//alert("?");
		//发送消息
		switch(game_temp.action_now){
			case "action_build_road":
				ws.sendmsg("mes_action",{"starter":user_index,"val":[1,1,game_temp.selected_edge]});
				break;
			case "action_build_city0":
				ws.sendmsg("mes_action",{"starter":user_index,"val":[1,2,game_temp.selected_point]});
				break;
			case "action_build_city1":
				ws.sendmsg("mes_action",{"starter":user_index,"val":[1,3,game_temp.selected_point]});
				break;
			case "action_buy_dev_card":
				if(game_temp.bank_dev_cards==0){
					his_window.push("发展卡已经被抽完了,需要等待其他玩家使用。");
					break;
				}
				ws.sendmsg("mes_action",{"starter":user_index,"val":[1,4,0,game_temp.bank_dev_cards]});
				break;
			case "action_set_robber_for_7":
			    if(game_temp.selected_player==0){
			    	ws.sendmsg("mes_action",{"starter":user_index,"val":[4,game_temp.selected_place,game_temp.selected_player,0,1]});
			    }
			    else{
			    	ws.sendmsg("mes_action",{"starter":user_index,"val":[4,game_temp.selected_place,game_temp.selected_player,0,all_src_num(game_info.players[game_temp.selected_player])]});
			    }
				break;
			case "action_use_dev_soldier":
				if(game_temp.selected_player==0){
			    	ws.sendmsg("mes_action",{"starter":user_index,"val":[3,1,game_temp.selected_place,game_temp.selected_player,0,1]});
			    }
			    else{
			    	ws.sendmsg("mes_action",{"starter":user_index,"val":[3,1,game_temp.selected_place,game_temp.selected_player,0,all_src_num(game_info.players[game_temp.selected_player])]});
			    }
			    break;
		    case "action_use_dev_plenty":
				ws.sendmsg("mes_action",{"starter":user_index,"val":[3,2,game_temp.selected_src]});
				break;
			case "action_use_dev_monopoly":
				ws.sendmsg("mes_action",{"starter":user_index,"val":[3,3,game_temp.selected_src]});
				break;
			case "action_use_dev_road_making":
				ws.sendmsg("mes_action",{"starter":user_index,"val":[3,4,game_temp.selected_edge[0],game_temp.selected_edge[1]]});
				break;
			case "fst_set_home":
				if(game_temp.home_step%2==0){
					ws.sendmsg("mes_action",{"starter":user_index,"val":[8,game_temp.home_step,game_temp.selected_point]});
				}
				else{
					ws.sendmsg("mes_action",{"starter":user_index,"val":[8,game_temp.home_step,game_temp.selected_edge]});
				}
				break;
			case "alert":
				$("wait_window").hide();
				break;
		}
		//临时消息清空
		//game_temp.action_now="";
		game_temp.set_option="";
	});
	$("#cancel_action").click(function(){
		//关闭窗口
		$("confirm_window").hide();
		if(game_temp.action_now=="action_use_dev_road_making"){
			$("edge_selector").filter("#"+game_temp.selected_edge[1]).removeClass("selector_selected");
			game_temp.selected_edge.splice(1,1);
		}
		else{
			cancel_selectors();
		}	
	});
	//--------------------------------------------------------
	// UI：不掠夺
	//--------------------------------------------------------
	$("#cancel_robbing").click(function(){
		game_temp.set_option="setting_no_robbing";
		confirm_window.set("确定不掠夺任何玩家?");
		confirm_window.show();
	});
	//--------------------------------------------------------
	// UI：回到最开始选项
	//--------------------------------------------------------
	$("#to_before_action").click(function(){
		//设置UI
		clear_selectors();	
		switch(game_temp.action_now){
			case "action_set_robber_for_7":
				start_robber_set();
				break;
			case "action_use_dev_soldier":
				start_robber_set();
				break;
			case "action_use_dev_road_making":
				//再激活道路选择器
    			clear_selectors();
				var edges=avaliable_edges(user_index);
				game_temp.selected_edge=[];
				for(var i in edges){
					var selector=$("edge_selector").filter("#"+edges[i]).addClass("active selector_avaliable").show();
				}
				break;
		}
		$("special_actions").children().hide();
		//game_temp.action_now=game_temp.action_base;
	});
	//--------------------------------------------------------
	// UI：消息固定最新
	//--------------------------------------------------------
	$("#his_latest_button").click(function(){
		if($("his_text").hasClass("latest")){
			$(this).attr("src","/media/img/latest_button.png");
			$("his_text").removeClass("latest");
		}
		else
		{
			$(this).attr("src","/media/img/latest_button_down.png");
			$("his_text").addClass("latest");
		}		
	});
	//--------------------------------------------------------
	// UI：无效提示
	//--------------------------------------------------------
	$("actions1").on("mouseenter",".part_disabled",
		function(){
			if(!!$(this).attr("tip")){
				info_window.set($(this).attr("tip"));
			}
			$("info_window").show();
	});
	$("actions1").on("mouseleave",".part_disabled",
		function(){
			$("info_window").hide();
	});
	//--------------------------------------------------------
	// UI：图块选择器
	//--------------------------------------------------------
	$("#places").on("mouseenter","plc_selector",
	    function(){
	    	if(debug){
	    		var place_id=$(this).attr("id");
		    	var place=map_info.places[place_id];
				$("#plc_info").text("地块id："+place_id+"产出数字："+place.create_num+"产出类型："+order[place.create_type]);
				if($(this).attr("tip")!=""){
					$("info_window").empty();
					$("info_window").append("<div>"+$(this).attr("tip")+"</div>");
					$("info_window").show();
				}
		    }
	    		
	    }
	);
	$("#places").on("click","plc_selector",
	    function(){
	    	//无效的边无法确认
	    	if($(this).hasClass("selector_avaliable")==false){
	    		return;
	    	}   	
	    	$(this).addClass("selector_selected");
	    	confirm_window.clear(); 
	    	//处于强盗设置时,再触发玩家选择
	    	if(game_temp.action_now=="action_set_robber_for_7" || game_temp.action_now=="action_use_dev_soldier"){
	    		game_temp.selected_place=parseInt($(this).attr("id"));
	    		var ever_find_city=false;
	    		//获取地块附近的玩家
	    		var points=plc_round_points($(this).attr("id"));
	    		for(var i in points){
	    			if(game_info.cities.hasOwnProperty(points[i])){
	    				var city=game_info.cities[points[i]];
	    				//激活非自己的玩家选框
	    				if(user_index!=city.owner){
	    					ever_find_city=true;
	    					$("player").filter("#"+city.owner).addClass("active player_select_avaliable");
	    				}			
	    			}
	    		}
	    		//如果附近没有可以掠夺的玩家,则设置确认内容
	    		if(ever_find_city)
	    		{
	    			his_window.push("请选择要掠夺的玩家:");
	    			$("plc_selector").not($(this)).removeClass("selector_avaliable");
	    			//显示"不掠夺"、"重新选择"按钮
	    			show_special_actions("cancel_robbing","to_before_action");
	    			return;
	    		}
	    		confirm_window.set("此处没有可以掠夺的城市,要将强盗放在这里吗?");
	    		game_temp.selected_player=0;
	    	}
	    	confirm_window.show();
	    }
	);
	$("#places").on("mouseleave","plc_selector",
	    function(){
			//$(this).removeClass("selected");
			$("info_window").hide();	
	    }
	);
	//--------------------------------------------------------
	// UI：边选择器
	//--------------------------------------------------------
	$("#edges").on("mouseenter","edge_selector",
	    function(){
	    	if(debug){
	    		$("#plc_info").text("边id："+$(this).attr("id"));
				if($(this).attr("tip")!=""){
					$("info_window").empty();
					$("info_window").append("<div>"+$(this).attr("tip")+"</div>");
					$("info_window").show();
				}	
	    	}
	    }
	);
	$("#edges").on("click","edge_selector",
	    function(){
	    	//无效的边无法确认
	    	if($(this).hasClass("selector_disabled")||$(this).hasClass("selector_selected")){
	    		return;
	    	}
	    	$(this).addClass("selector_selected"); 
	    	//打开确认窗口
		    confirm_window.clear();
	    	if(game_temp.action_now=="action_build_road" || game_temp.action_now=="fst_set_home"){
	    		game_temp.selected_edge=parseInt($(this).attr("id"));
		    	confirm_window.set("要在此处建造道路吗?");
		    	confirm_window.show();
	    	}
	    	else if(game_temp.action_now=="action_use_dev_road_making"){
	    		game_temp.selected_edge.push(parseInt($(this).attr("id")));
	    		if(game_temp.selected_edge.length==1){	    			
	    			show_special_actions("to_before_action");
	    			//再激活道路选择器,基于上一次已修建道路的边
					var edges=avaliable_edges(user_index,game_temp.selected_edge);
					for(var i in edges){
						var selector=$("edge_selector").filter("#"+edges[i]).addClass("active selector_avaliable").show();
					}
	    		}
	    		else{
			    	confirm_window.set("要在这两处建造道路吗?");
			    	confirm_window.show();
	    		} 		
	    	}
	    	
	    	
	    }
	);
	$("#edges").on("mouseleave","edge_selector",
	    function(){
			//$(this).removeClass("selected");
			$("info_window").hide();	
	    }
	);
	//--------------------------------------------------------
	// UI：点选择器
	//--------------------------------------------------------
	$("#points").on("mouseenter","pt_selector",
	    function(){	
	    	if(debug){
		    	$("#plc_info").text("点id："+$(this).attr("id"));	
				if($(this).attr("tip")!=""){
					$("info_window").empty();
					$("info_window").append("<div>"+$(this).attr("tip")+"</div>");
					$("info_window").show();
				}
		    }
	    }					
	);
	$("#points").on("click","pt_selector",
	    function(){
	    	//无效的点无法确认
	    	if($(this).hasClass("selector_disabled")){
	    		return;
	    	}
	    	game_temp.selected_point=parseInt($(this).attr("id"));
	    	//打开确认窗口
	    	confirm_window.clear();
	    	if(game_temp.action_now=="action_build_city0" || game_temp.action_now=="fst_set_home"){
	    		confirm_window.set("要在此处建立定居点吗?");
	    	}
	    	else if(game_temp.action_now=="action_build_city1"){
	    		confirm_window.set("要将该定居点升级成城市吗?");
	    	}	
	    	$(this).addClass("selector_selected"); 
	    	confirm_window.show();
	    }
	);
	$("#points").on("mouseleave","pt_selector",
	    function(){
			//$(this).removeClass("pt_selected");	
			$("info_window").hide();
	    }
	);
	//--------------------------------------------------------
	// UI：玩家选择器
	//--------------------------------------------------------
	$("#players").on("click","player",
	    function(){
	    	if($(this).hasClass("active")==false){return;}
	    	game_temp.selected_player=parseInt($(this).attr("id"));
	    	//打开确认窗口
	    	confirm_window.clear();
	    	if(game_temp.action_now=="action_set_robber_for_7" || game_temp.action_now=="action_use_dev_soldier"){
	    		//选择玩家没有资源卡则提示
	    		if(all_src_num(game_info.players[game_temp.selected_player])==0)
	    		{
	    			confirm_window.set("该玩家没有资源卡可以掠夺。");
	    			game_temp.end_confirm=true;
	    		}
	    		else{
	    			game_temp.selected_player=parseInt($(this).attr("id"));
	    			confirm_window.set("要掠夺该玩家吗?");
	    		}
	    	}	
	    	$(this).addClass("player_select_selected"); 
	    	confirm_window.show();
	    }
	);
	//--------------------------------------------------------
	// UI：交易/丢弃资源界面
	//--------------------------------------------------------
	//--------------------------------------------------------
	// UI：选择资源
	//--------------------------------------------------------
	$("src_select_window").on("click","src_item",function(){
		//已经发起交易请求则不无返回
		if(game_temp.action_now=="action_trade" && game_temp.trade_now.trade_state!="prepare"){
			return;
		}
		//进行资源的转移
		var UI_id=$(this).attr("id");
		var item=game_UI[UI_id];
		var item_rlt=item.rlt_item;
		if(item.can_reduce()){
			item.reduce();
			item_rlt.increase();
		}
		if(game_temp.action_now=="action_drop_srcs_for_7"){
			if(game_temp.dropped==game_temp.drop_required){
				$("#action_drop_items").removeClass("disabled");
			}
			else{
				$("#action_drop_items").addClass("disabled");
			}	
			$("#dropped").text(""+game_temp.dropped);
		}	
		if(game_temp.action_now=="action_trade"){
			if((game_temp.trade_basic_get_num==game_temp.trade_basic_give_num || game_temp.trade_target=="player") && game_temp.trade_basic_give_num!=0){
				$("#action_trade_items").removeClass("disabled");
			}
			else{
				$("#action_trade_items").addClass("disabled");
			}
		}
			
	});
	//--------------------------------------------------------
	// UI：关闭窗口
	//--------------------------------------------------------
	$("#close").click(function(){
		if(game_temp.trade_step=="requesting_trade"){
			return;
		}
		close_trade_window();
	});
	//--------------------------------------------------------
	// UI：丢弃资源
	//--------------------------------------------------------
	$("#action_drop_items").click(function(){
		//无效则不响应
		if($(this).hasClass("disabled")){
			return;
		}
		//获取丢弃栏的所有资源
		var drop_list={};
		var items=game_UI_list.drop_items.selected;
		for(var i in items){
			var UI_id=items[i];
			var item=game_UI[UI_id];
			if(item.own_num==0){continue;}
			drop_list[src_reflection[item.item_type]]=item.own_num;
		}
		//发送消息
		ws.sendmsg("mes_action",{"starter":user_index,"val":[5,drop_list]});
	});
	//--------------------------------------------------------
	// UI：交易资源
	//--------------------------------------------------------
	$("#action_trade_items").click(function(){
		//无效则不响应
		if($(this).hasClass("disabled")){
			return;
		}
		//依据当前功能执行对应函数
		game_temp.action_trade_items_function();
	});
	//--------------------------------------------------------
	// UI：拒绝交易
	//--------------------------------------------------------
	$("#action_refuse_trade_items").click(function(){
		//依据当前功能执行对应函数
		refuse_trade();
	});
	//--------------------------------------------------------
	// UI：菜单
	//--------------------------------------------------------
	//--------------------------------------------------------
	// UI：投掷
	// 层级：0  值：0
	//--------------------------------------------------------
	$("#action_dice").click(function(){
		//已投掷的情况下不能触发
		if(game_info.dice_num[0]!=0){
			return;
		}
		//发送消息
		if(game_info.game_process==1){
			ws.sendmsg("mes_action",{"starter":user_index,"val":[9,0]});
		}
		else{
			ws.sendmsg("mes_action",{"val":[0,0]});
		}	
	});
	//--------------------------------------------------------
	// UI：建设选项
	// 层级：0  值：1
	//--------------------------------------------------------
	$("#action_contribute").click(function(){
		//设置菜单级数为0
		if(init_menu_lv(0,$(this))==false){return;}
		//激活自己
		$(this).addClass("active");
		var next_action=["#action_build_road","#action_build_city0","#action_build_city1","#action_buy_dev_card"];
		//激活下一级窗口：四项建设
		for(let action of next_action){
			$(action).show();
			if(game_temp.no_build_dev_used){
				$(action).attr("tip","本回合使用过垄断等使用后禁止建设的发展卡").addClass("part_disabled");
			}
		}
		//安置按钮组位置
		$("actions1").css("top",$(this).position().top-3*25);
	});
	//--------------------------------------------------------
	// UI：交易
	// 层级：0  值：2
	//--------------------------------------------------------
	$("#action_trade").click(function(){
		//设置菜单级数为0
		if(init_menu_lv(0,$(this))==false){return;}
		//激活自己
		$(this).addClass("active");
		//激活下一级窗口：初步交易目标
		$("#action_trade_with_bank").show();
		$("#action_trade_with_harbours").show();
		$("#action_trade_with_players").show();
		//安置按钮组位置
		$("actions1").css("top",$(this).position().top-2*25);
	});
	//--------------------------------------------------------
	// UI：选择交易目标(港口)
	// 层级：1  值：2
	//--------------------------------------------------------
	$("#action_trade_with_harbours").click(function(){
		//设置菜单级数为1
		if(init_menu_lv(1,$(this))==false){return;}
		//激活自己
		$(this).addClass("active");
		//激活下一级窗口：拥有的港口类型
		var harbours=all_harbours(user_index);
		var count=-1;
		for(var i in harbours){
			//var a=$("actions2").children().filter(function(){return $(this).attr("harbour_type")=="wool";});
			$("actions2").children().filter(function(){return $(this).attr("trade_target")=="harbour" && $(this).attr("target_val")==harbours[i];}).show();
			count++;
		}
		//安置按钮组位置
		$("actions2").css("top",$(this).position().top-count*25);
	});
	//--------------------------------------------------------
	// UI：选择交易目标(玩家)
	// 层级：1  值：2
	//--------------------------------------------------------
	$("#action_trade_with_players").click(function(){
		//设置菜单级数为1
		if(init_menu_lv(1,$(this))==false){return;}
		//激活自己
		$(this).addClass("active");
		//激活下一级窗口：所有的玩家
		var count=0;
		for(var player_index in game_info.players){
			if(player_index==user_index){continue;}
			//var a=$("actions2").children().filter(function(){return $(this).attr("harbour_type")=="wool";});
			var item_player=$("actions2").children().filter(function(){return $(this).attr("trade_target")=="player" && $(this).attr("target_val")==player_index;});
			if(game_info.online_list.indexOf(parseInt(player_index))==-1){
				item_player.addClass("disabled");
			}
			else{
				item_player.removeClass("disabled");
			}
			item_player.show();
			count++;
		}
		var item_player=$("actions2").children().filter(function(){return $(this).attr("trade_target")=="player" && $(this).attr("target_val")=="0";});
		item_player.show();
		//安置按钮组位置
		$("actions2").css("top",$(this).position().top-count*25);
	});
	//--------------------------------------------------------
	// UI：准备交易
	// 交易类型非常多,这是一次尝试
	//--------------------------------------------------------
	$("actions1").on("click",".action_prepare_trade",function(){
		if($(this).hasClass("disabled")){
			return;
		}
		//根据所在层设置菜单级数
		if($(this).parent().is("actions1")){
			if(init_menu_lv(1,$(this))==false){return;}
		}
		else{
			if(init_menu_lv(2,$(this))==false){return;}
		}
		//激活自己
		$(this).addClass("active");
		//启动交易选择
		start_trade_window($(this).attr("trade_target"),$(this).attr("target_val"));
	});
	//--------------------------------------------------------
	// UI：准备交易
	// 适用于非自己回合的适配版
	//--------------------------------------------------------
	$("special_actions").on("click",".action_prepare_trade",function(){
		//激活自己
		$(this).addClass("active");
		//启动交易选择
		start_trade_window($(this).attr("trade_target"),$(this).attr("target_val"));
	});
	//--------------------------------------------------------
	// UI：使用发展卡
	// 层级：0  值：3
	//--------------------------------------------------------
	$("#action_develop").click(function(){
		//设置菜单级数为0
		if(init_menu_lv(0,$(this))==false){return;}
		//如果有卡则激活下一级窗口：五种发展卡
		var count=0;
		var self_player=game_info.players[user_index];
		for(var i=0;i<4;i++){
			$("#action_use_dev_"+devs[i]).show();
		}
		count=UI_use_dev_update();
		if(count==0){
			return;
		}
		//激活自己
		$(this).addClass("active");
	});
	//--------------------------------------------------------
	// UI：建设道路
	// 层级：1  值：1
	//--------------------------------------------------------
	$("#action_build_road").click(function(){
		//设置菜单级数为1
		if(init_menu_lv(1,$(this))==false){return;}
		//当前行动记为"action_build_road"
		game_temp.action_now="action_build_road";
		//激活道路选择器,只激活可以建设道路的地方
		var edges=avaliable_edges(user_index);
		//资源消耗提示
		var player=game_info.players[user_index];
		for(var i in edges){
			var selector=$("edge_selector").filter("#"+edges[i])
			selector.addClass("active").show();
			//资源不足则改变样式
			if(player.brick_num==0 || player.wood_num==0){
				selector.attr("tip","资源不足").addClass("selector_disabled");
			}
			else
			{
				selector.addClass("selector_avaliable");
			}
		}
		//激活自己
		$(this).addClass("active");

	});
	//--------------------------------------------------------
	// UI：建立定居点
	// 层级：1  值：2
	//--------------------------------------------------------
	$("#action_build_city0").click(function(){
		//设置菜单级数为1
		if(init_menu_lv(1,$(this))==false){return;}
		//当前行动记为"action_build_city0"
		game_temp.action_now="action_build_city0";
		//激活点选择器,只激活可以定居的地方
		var points=avaliable_points(user_index);
		//资源消耗提示
		var player=game_info.players[user_index];
		for(var i in points){
			var selector=$("pt_selector").filter("#"+points[i])
			selector.addClass("active").show();
			//资源不足则改变样式
			if(player.brick_num==0 || player.wood_num==0 || player.wool_num==0 || player.grain_num==0){
				selector.attr("tip","资源不足").addClass("selector_disabled");
			}
			else
			{
				selector.addClass("selector_avaliable");
			}
		}
		//激活自己
		$(this).addClass("active");
	});
	//--------------------------------------------------------
	// UI：建设新城市
	// 层级：1  值：3
	//--------------------------------------------------------
	$("#action_build_city1").click(function(){
		//设置菜单级数为1
		if(init_menu_lv(1,$(this))==false){return;}
		//当前行动记为"action_build_city1"
		game_temp.action_now="action_build_city1";
		//资源消耗提示
		var player=game_info.players[user_index];
		//激活点选择器,只激活可以升级的地方
		var points=city_num(player,0,"all");
		for(var i in points){
			var selector=$("pt_selector").filter("#"+points[i])
			selector.addClass("active").show();
			//资源不足则改变样式
			if(player.grain_num<2 || player.ore_num<3){
				selector.attr("tip","资源不足").addClass("selector_disabled");
			}
			else{
				selector.addClass("selector_avaliable");
			}
		}
		//激活自己
		$(this).addClass("active");
	});
	//--------------------------------------------------------
	// UI：购买发展卡
	// 层级：1  值：4
	//--------------------------------------------------------
	$("#action_buy_dev_card").click(function(){
		//设置菜单级数为1
		if(init_menu_lv(1,$(this))==false){return;}
		//如果资源不足,则提示后返回
		var player=game_info.players[user_index];
		if(player.wool_num==0 || player.grain_num==0 || player.ore_num==0){
			game_temp.action_now="alert";
			confirm_window.set("资源不足！");
			confirm_window.show();
			return;
		}
		//当前行动记为"action_buy_dev_card"
		game_temp.action_now="action_buy_dev_card";
		game_temp.bank_dev_cards=game_info.cards.soldier_num+game_info.cards.plenty_num+game_info.cards.monopoly_num+game_info.cards.road_making_num+game_info.cards.score_cards.length;
		confirm_window.set("要抽取发展卡吗?");
		confirm_window.show();
	});

	//--------------------------------------------------------
	// UI：士兵卡
	// 层级：1  值：1
	//--------------------------------------------------------
	$("#action_use_dev_soldier").click(function(){
		//如果处于无效状态则无反馈
		if($(this).hasClass("part_disabled")){
			return;
		}
		//设置菜单级数为1
		if(init_menu_lv(1,$(this))==false){return;}
		//设置基础行动
		game_temp.action_base="action_use_dev_soldier";
		//当前行动记为"action_use_dev_soldier"
		game_temp.action_now="action_use_dev_soldier";
		his_window.push("由你设置强盗:");
		//启动强盗选择
		start_robber_set();
		//激活自己
		$(this).addClass("active");
	});
	//--------------------------------------------------------
	// UI：丰收卡
	// 层级：1  值：2
	//--------------------------------------------------------
	$("#action_use_dev_plenty").click(function(){
		//如果处于无效状态则无反馈
		if($(this).hasClass("part_disabled")){
			return;
		}
		//设置菜单级数为1
		if(init_menu_lv(1,$(this))==false){return;}
		//当前行动记为"action_use_dev_plenty"
		game_temp.action_now="action_use_dev_plenty";
		his_window.push("选择要丰收的资源:");
		$(".src_selector").show();
		//激活自己
		$(this).addClass("active");
		//安置按钮组位置
		$("actions2").css("top",$(this).position().top-4*25);
	});
	//--------------------------------------------------------
	// UI：垄断卡
	// 层级：1  值：3
	//--------------------------------------------------------
	$("#action_use_dev_monopoly").click(function(){
		//如果处于无效状态则无反馈
		if($(this).hasClass("part_disabled")){
			return;
		}
		//设置菜单级数为1
		if(init_menu_lv(1,$(this))==false){return;}
		//当前行动记为"action_use_dev_monopoly"
		game_temp.action_now="action_use_dev_monopoly";
		his_window.push("选择要垄断的资源:");
		$(".src_selector").show();
		//激活自己
		$(this).addClass("active");
		//安置按钮组位置
		$("actions2").css("top",$(this).position().top-4*25);
	});	
	//--------------------------------------------------------
	// UI：发起垄断、丰收
	//--------------------------------------------------------
	$("actions1").on("click",".src_selector",function(){
		if($(this).hasClass("disabled")){
			return;
		}
		//设置菜单级数为2
		if(init_menu_lv(2,$(this))==false){return;}
		//激活自己
		$(this).addClass("active");

		game_temp.selected_src=$(this).attr("src_id");
		if(game_temp.action_now=="action_use_dev_monopoly"){	
			confirm_window.set("要垄断"+order_ch[game_temp.selected_src]+"吗?");
		}
		else if(game_temp.action_now=="action_use_dev_plenty"){
			confirm_window.set("要丰收"+order_ch[game_temp.selected_src]+"吗?");
		}
		confirm_window.show();
	});
	//--------------------------------------------------------
	// UI：修路卡
	// 层级：1  值：4
	//--------------------------------------------------------
	$("#action_use_dev_road_making").click(function(){
		//如果处于无效状态则无反馈
		if($(this).hasClass("part_disabled")){
			return;
		}
		//设置菜单级数为1
		if(init_menu_lv(1,$(this))==false){return;}
		//激活自己
		$(this).addClass("active");
		//当前行动记为"action_use_dev_road_making"
		game_temp.action_now="action_use_dev_road_making";
		game_temp.selected_edge=[];
		//激活道路选择器,只激活可以建设道路的地方
		var edges=avaliable_edges(user_index);
		for(var i in edges){
			var selector=$("edge_selector").filter("#"+edges[i]).addClass("active selector_avaliable").show();
		}
	});
	//--------------------------------------------------------
	// UI：结束回合
	// 层级：0  值：1
	//--------------------------------------------------------
	$("#action_end_turn").click(function(){
		//结束计时
		timer.stop();
		//发送消息
		ws.sendmsg("mes_action",{"val":[6]});
	});
	//--------------------------------------------------------
	// UI：vp详细信息
	//--------------------------------------------------------
	$("#players").on("mouseenter","vp_state",
	    function(event){
			$("info_window").css({
				"left":event.pageX + 10,
				"top":event.pageY - 20
			});
			//设置内容
			$("info_window").empty();
			var info=vp_info(game_info.players[$(this).attr("id")],$(this).attr("id"));
			for(var i in info){
				if(info[i]!=0)
				{
					$("info_window").append("<div>"+vp_info_text[i]+info[i]+"</div>");
				}	
			}
			$("info_window").fadeIn("fast");
	    }
	);
	$("#players").on("mouseleave","vp_state",
	    function(event){
			$("info_window").hide();
	    }
	);
	//--------------------------------------------------------
	// UI：最长道路详细信息
	//--------------------------------------------------------
	$("#players").on("mouseenter","longest_road",
	    function(event){
	    	$("info_window").css({
				"left":event.pageX + 10,
				"top":event.pageY - 20
			});
			//设置内容
			$("info_window").empty();
			var player_index=$(this).attr("id");
			var roads=game_info.players[player_index].road_longest;
			if(game_info.longest_road==player_index){
				$("info_window").append("<div>已建成最长道路:"+roads.length+"</div>");
			}
			else{
				$("info_window").append("<div>目前的最长道路:"+roads.length+"</div>");
			}
			//显示对应的道路
			$("edge_selector").filter(function(){
				return roads.indexOf(parseInt(($(this).attr("id"))))!=-1;
			}).css({"color":color_reflection_hex[color_reflection[$(this).attr("id")]]}).addClass("selector_displaying").show();
			$("info_window").fadeIn("fast");
	    }
	);
	$("#players").on("mouseleave","longest_road",
	    function(event){
			//取消显示对应的道路
			$("edge_selector").css("color","").removeClass("displaying");
			//如果处于道路选择中,则不隐藏UI
			$("edge_selector").each(function(){
				if($(this).hasClass("active")==false){
					$(this).hide();
				}
			});
			$("info_window").hide();
	    }
	);
	//--------------------------------------------------------
	// UI：最大军队详细信息
	//--------------------------------------------------------
	$("#players").on("mouseenter","max_minitory",
	    function(event){
	    	$("info_window").css({
				"left":event.pageX + 10,
				"top":event.pageY - 20
			});
			//设置内容
			$("info_window").empty();
			var player_index=$(this).attr("id");
			if(game_info.max_minitory==player_index){
				$("info_window").append("<div>已拥有最大军队:"+game_info.players[player_index].soldier_used+"</div>");
			}
			else{
				$("info_window").append("<div>目前的军队:"+game_info.players[player_index].soldier_used+"</div>");
			}
			$("info_window").fadeIn("fast");
	    }
	);
	$("#players").on("mouseleave","max_minitory",
	    function(event){
			$("info_window").hide();
	    }
	);
	//--------------------------------------------------------
	// UI：奇观详细信息
	//--------------------------------------------------------
	$("#players").on("mouseenter","score_card",
	    function(event){
	    	$("info_window").css({
				"left":event.pageX + 10,
				"top":event.pageY - 20
			});
			//设置内容
			$("info_window").empty();
			var player_index=$(this).attr("id");
			var score_shown=game_info.players[player_index].score_shown;
			if(score_shown.length==0){
				$("info_window").append("<div>尚未拥有奇观</div>");
			}
			else{
				$("info_window").append("<div>已建成的奇观:</div>");
				for(var i in score_shown)
				{
					$("info_window").append("<div>"+score_shown[i]+"</div>");
				}
			}
			$("info_window").fadeIn("fast");
	    }
	);
	$("#players").on("mouseleave","score_card",
	    function(event){
			$("info_window").hide();
	    }
	);
	//--------------------------------------------------------
	// UI：信息窗口
	//--------------------------------------------------------
	$("body").mousemove(function(event){
		if($("info_window").css("display")=="none"){return};
		$("info_window").css({
			"left":event.pageX + 10,
			"top":event.pageY - 20
		});
	});
	//范围外消除
	$("body").click(
	    function(){
			$("info_window").hide();
	    }
	);
	//--------------------------------------------------------
	// UI：拖动
	//--------------------------------------------------------
	$(document).mousemove(function(e) {
		if (!!this.move) {
			var posix = !document.move_target ? {'x': 0, 'y': 0} : document.move_target.posix,
				callback = document.call_down || function() {
					$(this.move_target).css({
						'top': e.pageY - posix.y,
						'left': e.pageX - posix.x
					});
				};
 
			callback.call(this, e, posix);
		}
	}).mouseup(function(e) {
		if (!!this.move) {
			var callback = document.call_up || function(){};
			callback.call(this, e);
			$.extend(this, {
				'move': false,
				'move_target': null,
				'call_down': false,
				'call_up': false
			});
		}
	});
	var $box = $('.flex_window').mousedown(function(e) {
	    var offset = $(this).offset();	    
	    this.posix = {'x': e.pageX - offset.left, 'y': e.pageY - offset.top};
	    $.extend(document, {'move': true, 'move_target': this});
	}).on('mousedown', '#resize', function(e) {
			var fBox = $(this).parent().parent();
		
	    	var posix = {
	            'w': fBox.width(), 
	            'h': fBox.height(), 
	            'top':fBox.offset().top,
	            'x': e.pageX, 
	            'y': e.pageY
	        };
	    
	    $.extend(document, {'move': true, 'call_down': function(e) {
	    	fBox.css({
	    		'top': Math.min(posix.top + posix.h - 380,e.pageY-posix.y+posix.top),
	            'width': Math.max(150, e.pageX - posix.x + posix.w),
	            'height': Math.max(380, -e.pageY + posix.y + posix.h)
	        });
	    }});
	    return false;
	});
});
//--------------------------------------------------------
// 获取地图数据与游戏数据
//--------------------------------------------------------
function request_game_info(){
	$.ajax({
		async:false,
		url:"/ajax/t_create_map/",
		type:"get",
		dataType:"json",
		headers:{"X-CSRFToken":$.cookie("csrftoken")},
		success:function(info){
			map_info=info;
			load_process.map=true;
		},
	});
	//加载game_info数据
	$.ajax({
		async:false,
		url:"/ajax/t_load_game/",
		type:"get",
		dataType:"json",
		headers:{"X-CSRFToken":$.cookie("csrftoken")},
		success:function(info){
			game_info=info;	
			load_process.game=true;	
		},
	});
	for(var item in load_process){
		if(load_process[item]==false){
			alert(item+"加载失败！");
			for(var _item in load_process){
				load_process[_item]=false;
			}
			return false;
		}
	}
	load_map();
	load_UI();
	//在此处添加页面构造完成以后的代码
	load_game();
	init_ui();
	if(!offline){
		//一切就绪后,发送ready消息
		ws.sendmsg("mes_member",{change:"ready",value:[user_id]});
	}
}
//--------------------------------------------------------
// 加载数据,确定当前状态
//--------------------------------------------------------
function load_game(){
	//这里以后会修改?
	user_id=game_info.player_list[user_index][0];
	//生成玩家
	for(var player_index in game_info.players){
		game_info.players[player_index]=new Player(game_info.players[player_index])
	}
	//生成交易,共生成i^2+i项
	for(var trade_id in game_info.trades){
		game_info.trades[trade_id]=new Transaction(game_info.trades[trade_id]);
	}
	//初始化强盗位置
	game_info.occupying=map_info.basic_roober;
}
//--------------------------------------------------------
// UI初始化
//--------------------------------------------------------
function init_ui(){
	$("dice").show();
	$("his_window").show();
	$("source_list").show();
	if(!debug){
		$("#debuging").hide();
		$("#debug_show_ids").hide();
		$("#debug_show_selectors").hide();
	}
	UI_new_turn();
	update_static_Graphic();
	//截至以上,是一个正常的游戏中的状态

	//初始化recive_list
	game_temp.recive_list=[].concat(game_info.online_list);
	//检测当前游戏状态
	switch(game_info.game_process){
		//尚未开始
		case 0:
			//等待所有玩家加入完毕
			break;
		//投掷骰子
		case 1:
			break;
		//前期坐城
		case 2:
			if(game_info.step_list[game_info.step_index]==user_index || offline){
				//开始前期坐城设置
				//还是状态机法好啊
				start_set_home(0);
			}
			break;
			
	}
}
//--------------------------------------------------------
// UI控制类函数
//--------------------------------------------------------
//--------------------------------------------------------
// 菜单层级初始化
//--------------------------------------------------------
function init_menu_lv(menu_level,menu_item){
	//如果本身处于无效状态不作任何响应
	if(menu_item.hasClass("disabled") || menu_item.hasClass("part_disabled")){return false;}
	//清除选择器
	clear_selectors();
	//关闭特殊选项
	hide_special_actions();
	var returnfalse=false;
	switch(menu_level){
		//0级菜单
		case 0:
			//如果已处于激活状态则关闭(随之更低级的窗口也会被隐藏)
			if(menu_item.hasClass("active"))
			{
				$("actions1").children().not("actions2").hide();
				menu_item.removeClass("active");
				returnfalse=true;
				
			}
			//关闭所有1级选项,取消激活所有的0级选项
			$("actions1").children().not("actions2").removeClass("active").hide();
			$("actions0").children().not("actions1").children().removeClass("active");
		//1级菜单
		case 1:
			//如果已处于激活状态则关闭(随之更低级的窗口也会被隐藏)
			if(menu_item.hasClass("active"))
			{
				$("actions2").children().hide();
				menu_item.removeClass("active");
				returnfalse=true;
			}
			//关闭所有2级选项,取消激活所有的1级选项
			$("actions2").children().removeClass("active").hide();
			$("actions1").children().not("actions1").removeClass("active");
		case 2:
			//如果已处于激活状态则关闭(随之更低级的窗口也会被隐藏)
			if(menu_item.hasClass("active"))
			{
				//$("actions2").children().hide();
				menu_item.removeClass("active");
				returnfalse=true;
			}
			//取消激活所有的2级选项
			$("actions2").children().removeClass("active");
	}
	if(returnfalse){
		return false;
	}
}
//--------------------------------------------------------
// 更新可用发展卡
//--------------------------------------------------------
function UI_use_dev_update(){
	var self_player=game_info.players[user_index];
	var count=-1;
	//如果某种发展卡已使用完,不显示;或之前购买的已使用完,变灰
	for(var i=0;i<4;i++){
		if(self_player[devs[i]+"_num"]==0){
			$("#action_use_dev_"+devs[i]).hide();
			continue;
		}
		else if(game_temp.dev_used){
			$("#action_use_dev_"+devs[i]).attr("tip","本回合已使用发展卡").addClass("part_disabled");
		}
		else if(self_player[devs[i]+"_num"]<=self_player[devs[i]+"_get_before"]){
			$("#action_use_dev_"+devs[i]).attr("tip","本回合获得的发展卡不能使用").addClass("part_disabled");
		}
		count+=1;
	}
	//安置按钮组位置
	$("actions1").css("top",$("#action_develop").position().top-count*25);
	return count+1;

}
//--------------------------------------------------------
// 展开特殊选项
//--------------------------------------------------------
function show_special_actions(...actions){
	if(actions[0]=="trade"){
		for(var i=1;i<actions.length;i++){
			$("special_actions").children().filter(function(){
				return parseInt($(this).attr("target_val"))==actions[i];
			}).show();
		}
		//安置按钮组位置
		$("special_actions").css({"top":100,"left":$("actions0").position().left+123});
	}
	else{
		for(var i in actions){
			$("#"+actions[i]).show();
		}
		//安置按钮组位置
		$("special_actions").css({"top":$("actions0").position().top,"left":$("actions0").position().left+123});
	}
	
	
}
//--------------------------------------------------------
// 隐藏特殊选项
//--------------------------------------------------------
function hide_special_actions(){
	$("special_actions").children().hide();
}
//--------------------------------------------------------
// 新的回合
//--------------------------------------------------------
function UI_new_turn(force=false){
	//将UI重置到回合开始的状态
	//清除selectors
	clear_selectors();
	hide_special_actions();
	//当处于前期坐城状态,必定为要求建设新定居点
	if(game_info.game_process==2 && user_index==game_info.step_list[game_info.step_index]){
		if(game_temp.home_step%2==0){
			start_set_home(game_temp.home_step);
		}
		else{
			start_set_home(game_temp.home_step+1);
		}
		
	}
	if(game_info.game_process!=2 || force){
		//清空所有状态类
		$("dice").removeClass();
		$("actions0").children().children().removeClass("disabled active part_disabled");
		//隐藏除投骰子以外的按钮,如果本回合不是你行动,则隐藏所有按钮
		//此处应有拉长历史消息窗口的动作
		if(game_info.step_list[game_info.step_index]==user_index || offline || game_info.game_process==1)
		{
			$("actions0").show();
			$("actions0").children().not(".fst_action").hide();
			$("actions1").children().not("actions2").hide();
			$("actions2").children().hide();
			$("special_actions").children().hide();
		}
		else{
			$("actions0").hide();
		}
		//刷新回合数
		$("#rounds").text(('00'+game_info.play_turns).slice(-2));
	}	
}
//--------------------------------------------------------
// 设置骰子
//--------------------------------------------------------
function UI_set_dices(...dices){
	$("dice").each(function(){
		$(this).addClass("num"+dices[$(this).attr("dice_id")]);
	});	
	//禁用投掷骰子
	$("actions0").children().filter(".fst_action").children().addClass("disabled");
}
//--------------------------------------------------------
// 开始正常行动
//--------------------------------------------------------
function UI_start_build(){
	if(game_info.step_list[game_info.step_index]==user_index){
		//启用其他0级选项
		if(game_info.game_process!=1){
			$("actions0").children().not(".fst_action").show();
		}
	}
	//启动计时器
	timer.reset();
	timer.start();
}
//--------------------------------------------------------
// 开始选择前期坐城点
// step:0 第一座定居点,1 第一条路,2 第二座定居点,3 第二条路
//--------------------------------------------------------
function start_set_home(step,point_id=0){
	game_temp.action_now="fst_set_home";
	game_temp.home_step=step;
	switch(step%2){
		case 0:
			//展示所有的可坐城点			
			var points=avaliable_points_st(user_index);
			for(var i in points){
				$("pt_selector").filter("#"+points[i]).addClass("selector_avaliable active").show();
			}
			break;
		case 1:
			//展示第一座定居点周围的所有边
			var edges=pt_round_edges(point_id);
			for(var i in edges){
				$("edge_selector").filter("#"+edges[i]).addClass("selector_avaliable active").show();
			}
			break;
	}
}
//--------------------------------------------------------
// 开始选择资源丢弃
//--------------------------------------------------------
function UI_start_drop_select(){
	//显示资源丢弃窗口
	$("drop_window").show();
	$("#action_drop_items").addClass("disabled");
	var self_player=game_info.players[user_index];
	//没有打开过交易窗口则先生成UI
	if(game_UI.hasOwnProperty("drop_items_created")==false){
		for(var src_id=1;src_id<6;src_id++){
			var src_name=order[src_id];

			var jqitem=$("drop_window").children().filter("src_select_window").children().filter("srcs_selected").children().filter("."+src_name);
			var a_selected_item=new Selected_Drop_item(jqitem,null,src_name);
			a_selected_item.ratio_num=1;
			jqitem.attr("id",game_UI.UI_count);
			game_UI[game_UI.UI_count]=a_selected_item;
			game_UI_list.drop_items.selected.push(game_UI.UI_count);
			game_UI.UI_count++;

			jqitem=$("drop_window").children().filter("src_select_window").children().filter("srcs_avaliable").children().filter("."+src_name);
			var a_avaliable_item=new Avaliable_Drop_item(jqitem,a_selected_item,src_name);
			a_avaliable_item.ratio_num=1;
			jqitem.attr("id",game_UI.UI_count);
			game_UI[game_UI.UI_count]=a_avaliable_item;
			game_UI_list.drop_items.avaliable.push(game_UI.UI_count);
			game_UI.UI_count++;

			a_selected_item.rlt_item=a_avaliable_item;
		}
		game_UI.drop_items_created=true;
	}
	var items=game_UI_list.drop_items.selected;
	for(var i=0;i<items.length;i++){
		var UI_id=items[i];
		var item=game_UI[UI_id];
		item.own_num=0;
		item.jqdom_init();
	}
	var items=game_UI_list.drop_items.avaliable;
	for(var i=0;i<items.length;i++){
		var UI_id=items[i];
		var item=game_UI[UI_id];
		var src_num=self_player[item.item_type+"_num"];
		item.own_num=src_num;
		item.jqdom_init();
	}
	//设置丢弃数
	game_temp.dropped=0;
	$("#dropped").text("0");
	$("#need_drop").text(""+game_temp.drop_required);
}
//--------------------------------------------------------
// 启动设置强盗
//--------------------------------------------------------
function start_robber_set(){
	//准备可选择的地块
	var places=avaliable_places();
	for(var i in places){
		$("plc_selector").filter("#"+places[i]).addClass("active selector_avaliable").show();
	}
}

//--------------------------------------------------------
// game_info对象函数
//--------------------------------------------------------
//--------------------------------------------------------
// 获取总点数
//--------------------------------------------------------
function dice_sum(){
	return game_info.dice_num[0]+game_info.dice_num[1];
}
//--------------------------------------------------------
// 获取所有资源的数量
//--------------------------------------------------------
function all_src_num(player){
	if(typeof(player)!="object"){
		player=game_info.players[player];
	}
	return player.brick_num+player.wood_num+player.wool_num+player.grain_num+player.ore_num;
}
//--------------------------------------------------------
// 获取所有发展卡的数量
//--------------------------------------------------------
function all_dev_num(player){
	return player.soldier_num+player.plenty_num+player.monopoly_num+player.road_making_num+player.score_unshown.length;
}
//--------------------------------------------------------
// 获取所有城市(的数量)
// lv:城市的等级 type:返回数量或数组
//--------------------------------------------------------
function city_num(player,lv="all",type="count"){
	var own_cities=player.own_cities;
	var all_cities=game_info.cities;
	var cities=[];
	for(var i in own_cities){
		if(lv=="all" || all_cities[own_cities[i]].level==lv){
			cities.push(own_cities[i]);
		}
	}
	//alert(cities);
	if(type=="count"){
		return cities.length;
	}
	if(type=="all"){
		return cities;
	}
}
//--------------------------------------------------------
// 获取玩家胜利点数
// 实质上为vp_info函数的封装
//--------------------------------------------------------
function vp_num(index)
{
	var info=vp_info(game_info.players[index],index);
	var vp_sum=0;
	for(var i in info){
		vp_sum+=info[i];
	}
	return vp_sum;
}
//--------------------------------------------------------
// 获取玩家胜利点数的具体组成
// 依次为城市、定居点、最长道路、最大军队、奇观
// index：玩家的index
// truth：包括未公开的分数卡
//--------------------------------------------------------
function vp_info(player,index,truth=false){
	var info=[0,0,0,0,0];
	var own_cities=player.own_cities;
	var all_cities=game_info.cities;
	for(i in own_cities){
		//很难理解，以后可以考虑优化
		info[1-all_cities[own_cities[i]].level]+=(all_cities[own_cities[i]].level+1);
	}
	if(index==game_info.longest_road){
		info[2]+=2;
	}
	if(index==game_info.max_minitory){
		info[3]+=2;
	}
	if(truth){
		info[4]+=(player.score_shown.length+player.score_unshown.length);
	}
	else{
		info[4]+=player.score_shown.length;
	}
	
	return info;
}
//--------------------------------------------------------
// 获取玩家所有道路
//--------------------------------------------------------
function all_roads(player_index){
	var roads=[];
	for(var road_id in game_info.roads){
		if(game_info.roads[road_id].owner==player_index){
			roads.push(parseInt(road_id));
		}
	}
	return roads;
}
//--------------------------------------------------------
// 获取玩家所有港口
//--------------------------------------------------------
function all_harbours(player_index){
	var harbours=[];
	var own_cities=game_info.players[player_index].own_cities;
	for(var i in own_cities){
		var city=game_info.cities[own_cities[i]];
		if(city.ex_type!=0){
			harbours=union(harbours,[city.ex_type]);
		}
	}
	return harbours;
}
//--------------------------------------------------------
// 取并集
//--------------------------------------------------------
function union(arr1,arr2){
	return arr1.concat(arr2.filter(function(v) {
        return arr1.indexOf(v) === -1}))
}

//--------------------------------------------------------
// 交易资源的对象,用于处理复杂的前置判断和资源交换
//--------------------------------------------------------
class Src_item {
    constructor(jq_object,relative_object,item_type){
        this.jqdom=jq_object;
		this.rlt_item=relative_object;
		this.item_type=item_type;
		this.ratio_num=0;
		this.own_num=0;
    }
    reduce(){
		this.own_num-=this.ratio_num;	
		this.jqdom_update();	
	}
	increase(){
		this.own_num+=this.ratio_num;
		this.jqdom_update();	
	}
	jqdom_update(){
		this.jqdom.attr("num",this.own_num);
	}
	jqdom_init(){	
		if(this.own_num==0){
			this.jqdom.hide();
		}
		else{
			this.jqdom.show();
		}
		this.jqdom_update();
	}	
}
class Selected_item extends Src_item{
	constructor(jq_object,relative_object,item_type){
		super(jq_object,relative_object,item_type);
	}
	can_reduce(){
		return this.own_num>=this.ratio_num;
	}
	jqdom_update(){
		super.jqdom_update();
		if(this.own_num==0){
			this.jqdom.hide();
		}
		else{
			this.jqdom.show();
		}
	}
}
class Avaliable_item extends Src_item{
	constructor(jq_object,relative_object,item_type){
		super(jq_object,relative_object,item_type);
	}
	can_reduce(){
		if(this.own_num<this.ratio_num){
			return false;
		}
		return true;
	}
	jqdom_update(){
		super.jqdom_update();	
		if(this.own_num<this.ratio_num){
			this.jqdom.addClass("disabled");
		}
		else{
			this.jqdom.removeClass("disabled");
		}
	}
}
class Selected_Drop_item extends Selected_item{
	constructor(jq_object,relative_object,item_type){
		super(jq_object,relative_object,item_type);
	}
	reduce(){
		super.reduce();
		game_temp.dropped--;
	}
	increase(){
		super.increase();
		game_temp.dropped++;
	}
}
class Avaliable_Drop_item extends Avaliable_item{
	constructor(jq_object,relative_object,item_type){
		super(jq_object,relative_object,item_type);
	}
	can_reduce(){
		if(super.can_reduce()==false){
			return false;
		}
		if(game_temp.dropped==game_temp.drop_required){
				return false;
		}
		return true;
	}
}
class Selected_Trade_item extends Selected_item{
	constructor(jq_object,relative_object,item_type,own_type){
		super(jq_object,relative_object,item_type);
		this.own_type=own_type;
		this.secret=false;
	}
	reduce(){
		super.reduce();
		if(this.own_type=="get"){
			game_temp.trade_basic_get_num--;
		}
		else if(this.own_type=="give"){
			game_temp.trade_basic_give_num--;
		}
	}
	increase(){
		super.increase();
		if(this.own_type=="get"){
			game_temp.trade_basic_get_num++;
		}
		else if(this.own_type=="give"){
			game_temp.trade_basic_give_num++;
		}
	}
}
class Avaliable_Trade_item extends Avaliable_item{
	constructor(jq_object,relative_object,item_type,own_type){
		super(jq_object,relative_object,item_type);
		this.own_type=own_type;
		this.secret=false;
	}
	can_reduce(){
		if(super.can_reduce()==false){
			return false;
		}
		if(this.own_type=="give"){
			if(game_temp.trade_basic_give_num>=game_temp.trade_basic_get_num && game_temp.trade_target!="player"){
				return false;
			}	
		}	
		return true;
	}
	jqdom_update(){
		super.jqdom_update();
		if(this.secret){
			this.jqdom.attr("num","--");
		}
		this.own_num<0?this.jqdom.addClass("tooless"):this.jqdom.removeClass("tooless");
	}
}


