//--------------------------------------------------------
// 交互元素基本响应
//--------------------------------------------------------
//提示窗口
info_window={
	"set":function(text){
		$("info_window").children().empty();
		$("info_window help_text").text(text);
	},
	"set_addition":function(text){
		$("info_window alert_text").text(text);
	},
	"clear":function(){
		$("info_window").children().empty();
	},
	"empty":function(){
		this.clear();
	},
	"push":function(text,type="help"){
		if(type=="help"){
			type="help_text";
		}
		else{
			type="alert_text";
		}
		$("info_window "+type).append("<div>"+text+"</div>");
	}
}
//历史消息
his_window={
	"push":function(text,type="normal"){
		$("his_text").append("<his_text_line class='"+type+"'>"+text+"</his_text_line>");
	},
	"player_get_item":function(player,src_name,num){
		if(num==0){return;}
		this.push(player.name+" 获得 "+src_ch[src_name]+" x "+num);
	},
	"player_lose_item":function(player,src_name,num){
		if(num==0){return;}
		this.push(player.name+" 失去 "+src_ch[src_name]+" x "+num);
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
		if($gameSystem.time_per_turn==0){
			$("timer-container").hide();
		}
		else{
			$("timer-container").show();
		}
		//重设timer的时长
		var time_text = ($gameSystem.time_per_turn / 2) + "s";
		$("timer.right content").attr("style","transition-duration:"+time_text);
		$("timer.left content").attr("style","transition-duration:"+time_text+";"
			+ "transition-delay:"+time_text+";");
	},
	"start":function(){
        $("timer").children().addClass("active").show();
        $("timer").children().addClass("active").addClass("play");
        if($gameSystem.is_own_turn()){
        	this.timer_id=setTimeout(timer.finished,$gameSystem.time_per_turn*1000);
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
//回放控制器UI
replay_controller={
	timer_id:null,
	timer_f:null,
	controller:null,
	timer_updater:null,
	initialize:function(){
		this.timer_f=2;
		this.controller=document.getElementsByTagName("action_play")[0];
		this.timer_updater=document.getElementsByTagName("timer_updater")[0];
		document.querySelectorAll("auto_play_speed set_speed")[1].classList.add("active");
	},
	//css启动
	timer_css_play:function(){
		this.timer_updater.classList.add("play");
		this.timer_updater.style.transitionDuration = this.timer_f + "s";
	},
	//css停止
	timer_css_stop:function(){
		this.timer_updater.classList.remove("play");
		this.timer_updater.style.transitionDuration = "";
		
	},
	//启动
	play:function(){
		if(!!this.timer_id){return;}
		this.timer_css_play();
		this.controller.classList.remove("play");
		this.controller.classList.add("pause");
		//设置循环定时器
		//启动循环
		this.timer_id = setInterval(function(){			
			//处理事件
			if(!GameEvent.replay_next_event()){
				his_window.push("回放结束！","important");
				replay_controller.stop();
				return;
			}
			replay_controller.timer_css_stop();
			//应用以上刷新以后再执行
			requestAnimationFrame(function(){
				replay_controller.timer_css_play();			
			});
		},this.timer_f*1000);
	},
	//停止
	stop:function(){
		this.timer_css_stop();
		this.controller.classList.remove("pause");
		this.controller.classList.add("play");
		clearInterval(this.timer_id);
		this.timer_id=null;
	},
	//重启
	reset:function(){
		if(!!this.timer_id){this.stop();}
		//应用以上刷新以后再执行
		requestAnimationFrame(()=>replay_controller.play());
	},
	//变更
	change:function(){
		//播放中
		if(!!this.timer_id){
			this.stop();	
		}
		//暂停中
		else{
			this.play();
		}
	}
}
$(document).ready(function(){
	//ws.sendmsg("user","test");
	//隐藏UI
	$("actions0").hide();
	$("actions1").children().not("actions2").hide();
	$("button").filter(function(){
		return $(this).attr("action_lv")==1;
	}).filter("#1").hide();
	$("dice").hide();
	//$("confirm_window").hide();
	$("source_list").hide();
	$("special_actions").children().hide();
	//载入一些初始参数
	$(".flex_window").each(function(){
		this.flex_min_width = $(this).attr("flex_min_width");
		this.flex_min_height = $(this).attr("flex_min_height");
	});
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
					his_window.push("发展卡已经被抽完了。");
					break;
				}
				ws.sendmsg("mes_action",{"starter":user_index,"val":[1,4,0,game_temp.bank_dev_cards]});
				break;
			case "action_set_robber_for_7":
			    if(game_temp.selected_player==0){
			    	ws.sendmsg("mes_action",{"starter":user_index,"val":[4,game_temp.selected_place,game_temp.selected_player,0,1]});
			    }
			    else{
			    	ws.sendmsg("mes_action",{"starter":user_index,"val":[4,game_temp.selected_place,game_temp.selected_player,0,$gamePlayers[game_temp.selected_player].all_src_num()]});
			    }
				break;
			case "action_use_dev_soldier":
				if(game_temp.selected_player==0){
			    	ws.sendmsg("mes_action",{"starter":user_index,"val":[3,1,game_temp.selected_place,game_temp.selected_player,0,1]});
			    }
			    else{
			    	ws.sendmsg("mes_action",{"starter":user_index,"val":[3,1,game_temp.selected_place,game_temp.selected_player,0,$gamePlayers[game_temp.selected_player].all_src_num()]});
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
			case "action_show_score_cards":
				ws.sendmsg("mes_action",{"starter":user_index,"val":[3,5,game_temp.selected_score_card]});
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
			case "action_promise":
				game_temp.action_resolve("confirm","confirm");
		}
		//临时消息清空
		//game_temp.action_now="";
		game_temp.set_option="";
	});
	$("#cancel_action").click(function(){
		close_confirm_window();
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
				UI_start_robber_set();
				break;
			case "action_use_dev_soldier":
				UI_start_robber_set();
				break;
			case "action_use_dev_road_making":
				//再激活道路选择器
    			clear_selectors();
				var edges=available_edges(user_index);
				game_temp.selected_edge=[];
				for(var i in edges){
					var selector=$("edge_selector").filter("#"+edges[i]).addClass("active selector_available").show();
				}
				break;
			case "action_promise":
				game_temp.action_resolve("special","to_start");
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
	// UI：菜单提示
	//--------------------------------------------------------
	$("actions0").on("mouseenter","button",show_help_text_menu);
	$("actions0").on("touchstart","button",show_help_text_menu);
	$("actions0").on("mouseleave","button",
		function(){
			$("info_window").hide();
	});
	function show_help_text_menu(){
		if(!!$(this).attr("help")){
			info_window.set($(this).attr("help"));
			$("info_window").show();
		}
		if(!!$(this).attr("tip") && $(this).hasClass("part_disabled")){
			info_window.set_addition($(this).attr("tip"));
			$("info_window").show();
		}
	}	
	//--------------------------------------------------------
	// UI：地图提示
	//--------------------------------------------------------
	$("map").on("mouseenter",".selector_disabled",
		function(){
			if($(this).hasClass("part_disabled")){return;}
			if(!!$(this).attr("tip")){
				info_window.set($(this).attr("tip"));
				$("info_window").show();
			}		
	});
	$("map").on("mouseleave",".selector_disabled",
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
					info_window.empty();
					info_window.push($(this).attr("tip"));
					$("info_window").show();
				}
		    }
	    		
	    }
	);
	$("#places").on("click","plc_selector",
	    function(){
	    	//无效的边无法确认
	    	if($(this).hasClass("selector_disabled")||$(this).hasClass("selector_selected")){
	    		return;
	    	}   	
	    	$(this).addClass("selector_selected");
	    	game_temp.top_active_UI=$(this);
	    	if(game_temp.action_now=="action_promise"){
    			game_temp.action_resolve("place",parseInt($(this).attr("id")));
    		}
    		else{
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
		    					$("player").filter("#"+city.owner).addClass("active player_select_available");
		    				}			
		    			}
		    		}
		    		//如果附近没有可以掠夺的玩家,则设置确认内容
		    		if(ever_find_city)
		    		{
		    			his_window.push("请选择要掠夺的玩家:");
		    			$("plc_selector").not($(this)).removeClass("selector_available");
		    			//显示"不掠夺"、"重新选择"按钮
		    			show_special_actions("cancel_robbing","to_before_action");
		    			return;
		    		}
		    		confirm_window.set("此处没有可以掠夺的城市,要将强盗放在这里吗?");
		    		game_temp.selected_player=0;
		    	}
		    	confirm_window.show();
    		}
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
					info_window.set($(this).attr("tip"));
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
	    	game_temp.top_active_UI=$(this);
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
					var edges=available_edges(user_index,game_temp.selected_edge);
					for(var i in edges){
						var selector=$("edge_selector").filter("#"+edges[i]).addClass("active selector_available").show();
					}
	    		}
	    		else{
			    	confirm_window.set("要在这两处建造道路吗?");
			    	confirm_window.show();
	    		} 		
	    	}
	    	if(game_temp.action_now=="action_promise"){
	    		game_temp.action_resolve("edge",parseInt($(this).attr("id")));
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
					info_window.set($(this).attr("tip"));
					$("info_window").show();
				}
		    }
	    }					
	);
	$("#points").on("click","pt_selector",
	    function(){
	    	//无效的点无法确认
	    	if($(this).hasClass("selector_disabled")||$(this).hasClass("selector_selected")){return;}	    	
	    	$(this).addClass("selector_selected");  	
	    	game_temp.top_active_UI=$(this);
	    	game_temp.selected_point=parseInt($(this).attr("id"));
	    	//打开确认窗口
	    	if(game_temp.action_now=="action_promise"){
    			game_temp.action_resolve("point",parseInt($(this).attr("id")));
    		}
    		else{
    			if(game_temp.action_now=="action_build_city0" || game_temp.action_now=="fst_set_home"){
	    			confirm_window.set("要在此处建立定居点吗?");
		    	}
		    	else if(game_temp.action_now=="action_build_city1"){
		    		confirm_window.set("要将该定居点升级成城市吗?");
		    	}	
		    	
		    	confirm_window.show();
    		} 	
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
	    	$(this).addClass("player_select_selected"); 
	    	game_temp.top_active_UI=$(this);
	    	//打开确认窗口
	    	if(game_temp.action_now=="action_promise"){
    			game_temp.action_resolve("player",parseInt($(this).attr("id")));
    		}
    		else{
    			if(game_temp.action_now=="action_set_robber_for_7" || game_temp.action_now=="action_use_dev_soldier"){
		    		//选择玩家没有资源卡则提示
		    		if($gamePlayers[game_temp.selected_player].all_src_num()==0)
		    		{
		    			confirm_window.set("该玩家没有资源卡可以掠夺。");
		    			game_temp.end_confirm=true;
		    		}
		    		else{
		    			game_temp.selected_player=parseInt($(this).attr("id"));
		    			confirm_window.set("要掠夺该玩家吗?");
		    		}
		    	}			    	
		    	confirm_window.show();
    		}	
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
		//检查确认按钮可用性
		switch(game_temp.action_now){
		case "action_drop_srcs_for_7":
			if(game_temp.dropped==game_temp.drop_required){
				$("#action_confirm_selected_items").removeClass("disabled");
			}
			else{
				$("#action_confirm_selected_items").addClass("disabled");
			}	
			$("#item_count").text(""+game_temp.dropped);
			break;
		case "action_trade":
			if((game_temp.trade_basic_get_num==game_temp.trade_basic_give_num || game_temp.trade_target=="player") && game_temp.trade_basic_give_num!=0){
				$("#action_trade_items").removeClass("disabled");
			}
			else{
				$("#action_trade_items").addClass("disabled");
			}
			break;
		case "action_use_dev_plenty":
			if(game_temp.plenty_count==game_temp.item_top_limit){
				$("#action_confirm_selected_items").removeClass("disabled");
			}
			else{
				$("#action_confirm_selected_items").addClass("disabled");
			}	
			$("#item_count").text(""+game_temp.plenty_count);
			break;
		case "action_in_config":
			if(game_temp.item_select_count==game_temp.item_top_limit){
				$("#action_confirm_selected_items").removeClass("disabled");
			}
			else{
				$("#action_confirm_selected_items").addClass("disabled");
			}	
			$("#item_count").text(""+game_temp.item_select_count);
		}			
	});
	//--------------------------------------------------------
	// UI：确认资源选择
	//--------------------------------------------------------
	$("#action_confirm_selected_items").click(function(){
		//无效则不响应
		if($(this).hasClass("disabled")){
			return;
		}
		//获取资源选择栏的所有资源
		var selected_list={};
		var items = null;
		switch(game_temp.action_now){
		case "action_drop_srcs_for_7":
			items = game_UI_list.drop_items.selected;
			break;	
		case "action_use_dev_plenty":
			items = game_UI_list.plenty_items.selected;
			break;
		case "action_in_config":
			items = game_UI_list[game_temp.active_window.key+"_items"].selected;
		}
		for(let UI_id of items){
			let item=game_UI[UI_id];
			if(item.own_num==0){continue;}
			selected_list[item.item_type]=item.own_num;
		}
		//发送消息
		switch(game_temp.action_now){
		case "action_drop_srcs_for_7":
			ws.sendmsg("mes_action",{"starter":user_index,"val":[5,selected_list]});
			break;
		case "action_use_dev_plenty":
			ws.sendmsg("mes_action",{"starter":user_index,"val":[3,2,selected_list]});
			break;
		case "action_in_config":
			game_temp.active_window.final(selected_list);
		}
		
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
		if($(this).hasClass("disabled")){return;}
		drop_dice();	
	});
	//--------------------------------------------------------
	// UI：建设选项
	// 层级：0  值：1
	//--------------------------------------------------------
	$("#action_contribute").click(function(){
		//设置菜单级数为0
		if(init_menu_lv(0,$(this))==false){return;}
		//激活下一级窗口：各种建设
		UI_base_build_update();
		//var count = $("actions1 > *:visible").length;
		//激活自己
		$(this).addClass("active");
		//安置按钮组位置
		/*if(!!count){
			$("actions2").css("top",$(this).position().top-(count-1)*25);
		}
		//安置按钮组位置
		$("actions1").css("top",$(this).position().top-3*25);*/
	});
	//--------------------------------------------------------
	// UI：交易
	// 层级：0  值：2
	//--------------------------------------------------------
	$("#action_trade").click(function(){
		//设置菜单级数为0
		if(init_menu_lv(0,$(this))==false){return;}
		//激活下一级窗口：初步交易目标
		$("#action_trade_with_bank").show();
		$("#action_trade_with_harbours").show();
		$("#action_trade_with_players").show();
		if($gameSystem.self_player().all_harbours().length==0){
			$("#action_trade_with_harbours").attr("tip","尚未在港口附近建立城市").addClass("part_disabled");
		}
		else{
			$("#action_trade_with_harbours").attr("tip","").removeClass("part_disabled");
		}
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
		//激活下一级窗口：拥有的港口类型
		var harbours=$gameSystem.self_player().all_harbours();
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
		//激活下一级窗口：所有的玩家
		var count=-1;
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
		//暂时屏蔽公开交易选项
		//var item_player=$("actions2").children().filter(function(){return $(this).attr("trade_target")=="player" && $(this).attr("target_val")=="0";});
		//item_player.show();
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
		//激活下一级窗口：五种发展卡
		UI_use_dev_update();
		var count = $("actions1 > *:visible").length;
		//激活自己
		$(this).addClass("active");
		//安置按钮组位置
		if(!!count){
			$("actions2").css("top",$(this).position().top-(count-1)*25);
		}	
	});
	//--------------------------------------------------------
	// UI：发起建设
	// 层级：1
	//--------------------------------------------------------
	$("actions1").on("click",".base_build",function(){
		//设置菜单级数为1
		if(init_menu_lv(1,$(this))==false){return;}
		//设置UI记录
		[...game_temp.activeMenuItem] = [1,$(this)];
		game_temp.top_active_UI=$(this);
		//调用处理函数
		if(!!menu_actions.base_build[$(this).attr("action")].on_active.run)
			{game_temp.action_now="action_promise";menu_actions.base_build[$(this).attr("action")].on_active.run();}
		else{menu_actions.base_build[$(this).attr("action")].on_active()}
		var count = $("actions1 > *:visible").length;
		//激活自己
		$(this).addClass("active");
		//安置按钮组位置
		if(!!count){
			$("actions2").css("top",$(this).position().top-(count-1)*25);
		}		
	});
	//--------------------------------------------------------
	// UI：使用发展卡
	// 层级：1
	//--------------------------------------------------------
	$("actions1").on("click",".use_dev",function(){
		//设置菜单级数为1
		if(init_menu_lv(1,$(this))==false){return;}
		//设置UI记录
		[...game_temp.activeMenuItem] = [1,$(this)];
		game_temp.top_active_UI=$(this);
		//调用处理函数
		if(!!menu_actions.use_dev[$(this).attr("action")].on_active.run)
			{game_temp.action_now="action_promise";menu_actions.use_dev[$(this).attr("action")].on_active.run();}
		else{menu_actions.use_dev[$(this).attr("action")].on_active()}
		var count = $("actions1 > *:visible").length;
		//激活自己
		$(this).addClass("active");
		//安置按钮组位置
		if(!!count){
			$("actions2").css("top",$(this).position().top-(count-1)*25);
		}		
	});
	//--------------------------------------------------------
	// UI：展示分数卡
	// 层级：1  值：3
	//--------------------------------------------------------
	$("#action_show_score_cards").click(function(){
		//设置菜单级数为1
		if(init_menu_lv(1,$(this))==false){return;}
		//当前行动记为"action_show_score_cards"
		game_temp.action_now="action_show_score_cards";
		his_window.push("选择要展示的分数卡:");
		//激活自己
		$(this).addClass("active");
		var jqdoms = $(".score_card_selector").filter(function(){return $gameSystem.self_player().score_unshown($(this).attr("id"))>0});
		var count = jqdoms.length-1;
		jqdoms.show();
		//安置按钮组位置
		$("actions2").css("top",$(this).position().top-count*25);
	});	
	//--------------------------------------------------------
	// UI：发起垄断、丰收
	// 层级：2
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
	// UI：展示分数卡
	// 层级：2
	//--------------------------------------------------------
	$("actions1").on("click",".score_card_selector",function(){
		if($(this).hasClass("disabled")){
			return;
		}
		//设置菜单级数为2
		if(init_menu_lv(2,$(this))==false){return;}
		//激活自己
		$(this).addClass("active");

		game_temp.selected_score_card=$(this).attr("id");
		confirm_window.set("要展示"+$(this).text()+"吗?");
		confirm_window.show();
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
			//设置内容
			info_window.empty();
			var info=$gamePlayers[$(this).parent().attr("id")].vp_info(false);
			for(var i in info){
				if(info[i]!=0)
				{
					info_window.push(vp_info_text[i]+info[i]);
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
			//设置内容
			info_window.empty();
			var player_index=$(this).parent().attr("id");
			var roads=game_info.players[player_index].road_longest;
			if(game_info.longest_road==player_index){
				info_window.push("已建成最长道路:"+roads.length);
			}
			else{
				info_window.push("目前的最长道路:"+roads.length);
			}
			//显示对应的道路
			$("edge_selector").filter(function(){
				return roads.indexOf(parseInt(($(this).attr("id"))))!=-1;
			}).css({"color":color_reflection_hex[color_reflection[player_index]]}).addClass("selector_displaying").show();
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
			//设置内容
			info_window.empty();
			var player_index=$(this).parent().attr("id");
			if(game_info.max_minitory==player_index){
				info_window.push("已拥有最大军队:"+game_info.players[player_index].soldier_used);
			}
			else{
				info_window.push("目前的军队:"+game_info.players[player_index].soldier_used);
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
			//设置内容
			info_window.empty();
			var player=$gamePlayers[$(this).parent().attr("id")];
			if(player.all_score_num("shown")==0){
				info_window.push("尚未拥有奇观");
			}
			else{
				info_window.push("已建成的奇观:");
				for(let card of score_cards){
					if(player.score_shown(card)>1){
						info_window.push(score_ch[card]+" x "+player.score_shown(card));
					}
					else if(player.score_shown(card)>0){
						info_window.push(score_ch[card]);
					}
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
	$("body").mousemove(update_help_window,event);
	$("body").on("touchmove",touch_update_help_window,event);
	$("body").on("touchend",function(){
		$("info_window").hide();
	});
	function touch_update_help_window(event){
		update_help_window(event.originalEvent.touches[0],50);
	}
	function update_help_window(event,dx=10){
		dx=dx;
		event=event;
		if($("info_window").css("display")=="none"){return;};
		$("info_window").css({
			"left":event.pageX + dx,
			"top":event.pageY - 20
		});
	}

	//范围外消除
	$("body").click(
	    function(){
			$("info_window").hide();
	    }
	);
	//--------------------------------------------------------
	// 提交信息输入
	//--------------------------------------------------------
	$("#talk_msg_input_window").keydown(function(e){
		send_talk_msg(e);
	});
	$("#talk_msg_input_window_send").click(function(){
		send_talk_msg({keyCode:13});
	});
	function send_talk_msg(e){
		if(e.keyCode==13){
			var text=$("#talk_msg_input_window").val();
			if(text!=""){
				ws.sendmsg("mes_action",{"starter":user_index,"val":[19,text]});
			}
		}
	}
	//--------------------------------------------------------
	// UI：拖动
	//--------------------------------------------------------
	$(document).mousemove(function(e) {
		if (!!this.move) {
			var posix = !document.move_target ? {'x': 0, 'y': 0} : document.move_target.posix,
				callback = document.call_down || function() {
					var a = e.scrollY;
					$(this.move_target).css({
						'top':  e.clientY - posix.y,//e.pageY, //- e.clientY ,
						'left':  e.clientX - posix.x//e.pageX //- e.clientX 
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
	var $box = $('.flex_window > window_head').on("mousedown",function(e) {
		var window_content = this.parentElement;
	    var offset = $(window_content).offset();	    
	    window_content.posix = {'x': e.pageX - offset.left, 'y': e.pageY - offset.top};
	    $.extend(document, {'move': true, 'move_target': window_content});
	}).on('mousedown', '#resize', function(e) {
			var fBox = $(this).parent().parent();
		
	    	var posix = {
	            'w': fBox.width(), 
	            'h': fBox.height(), 
	            'top':fBox.offset().top,
	            'x': e.pageX, 
	            'y': e.pageY,
	            "min_width": fBox.get(0).flex_min_width,
	            "min_height": fBox.get(0).flex_min_height
	        };
		    $.extend(document, {'move': true, 'call_down': function(e) {
		    	fBox.css({
		    		'top': Math.min(posix.top + posix.h - posix.min_height,e.pageY-posix.y+posix.top),
		            'width': Math.max(posix.min_width, e.pageX - posix.x + posix.w),
		            'height': Math.max(posix.min_height, -e.pageY + posix.y + posix.h)
		        });
		    }});
	    return false;
	});
	//--------------------------------------------------------
	// UI：关闭窗口
	//--------------------------------------------------------
	$("confirm_window").on("click","#close",function(e){
		close_confirm_window();
	});
	$("confirm_window").on("mousedown","#close",function(e){
		//清空拖动项,避免拖动
		$.extend(document, {
			'move': false,
			'move_target': null,
			'call_down': false,
			'call_up': false
		});
	});
	$("simple_item_select_window").on("click","#close",function(e){
		close_simple_item_select_window();
	});
	$("simple_item_select_window").on("mousedown","#close",function(e){
		//清空拖动项,避免拖动
		$.extend(document, {
			'move': false,
			'move_target': null,
			'call_down': false,
			'call_up': false
		});
	});
	$("trade_window").on("click","#close",function(e){
		if(game_temp.trade_step=="requesting_trade"){
			return;
		}
		close_trade_window();
	});
	$("trade_window").on("mousedown","#close",function(e){
		//清空拖动项,避免拖动
		$.extend(document, {
			'move': false,
			'move_target': null,
			'call_down': false,
			'call_up': false
		});
	});
	//--------------------------------------------------------
	// UI:回放控制器
	//--------------------------------------------------------
	$("replay_controller action_play").click(function(){
		replay_controller.change();
	});
	$("replay_controller action_step_next").click(function(){
		GameEvent.replay_next_event();
	});
	$("auto_play_speed set_speed").click(function(){
		var controller=document.getElementsByTagName("replay_controller")[0];
		$("auto_play_speed set_speed").removeClass("active");
		$(this).addClass("active");
		replay_controller.timer_f=parseInt($(this).attr("fq"));
		replay_controller.reset();
	});

});
//--------------------------------------------------------
// 投骰子
//--------------------------------------------------------
function drop_dice(){
	//发送消息
	if(game_info.game_process==1){
		ws.sendmsg("mes_action",{"starter":user_index,"val":[9,0]});
	}
	else{
		ws.sendmsg("mes_action",{"val":[0,0]});
	}
}
//--------------------------------------------------------
// UI控制类函数
//--------------------------------------------------------
//--------------------------------------------------------
// 菜单层级初始化
//--------------------------------------------------------
function init_menu_lv(menu_level,menu_item){
	//终止可能的promiseLine
	if(!!game_temp.action_reject){game_temp.action_reject()};
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
	else{
		menu_item.addClass("active");
		return true;
	}
}
//--------------------------------------------------------
// 更新基本建设菜单
//--------------------------------------------------------
function UI_base_build_update(){
	var count = -1;
	$(".base_build").each(function(){
		let action = menu_lists.base_build.items[$(this).attr("action")];
		if(!$gameSystem.visible_base_build(action)){
			$(this).hide();
		}
		else{
			$(this).show();
			let [result,reason] = $gameSystem.usable_base_build(action);
			if(!result){
				$(this).attr("tip",reason).addClass("part_disabled");
			}
			count+=1;
		}
	});
	//安置按钮组位置
	$("actions1").css("top",$("#action_contribute").position().top-count*25);
}
//--------------------------------------------------------
// 更新可用发展卡
//--------------------------------------------------------
function UI_use_dev_update(){
	var self_player=$gameSystem.self_player();
	var count=-1;
	$(".use_dev").each(function(){
		let action = menu_lists.use_dev.items[$(this).attr("action")];
		//如果某种发展卡已使用完,不显示;或之前购买的已使用完,变灰
		if(!$gameSystem.visible_use_dev(action)){
			$(this).hide();
		}
		else{
			$(this).show();
			$(this).children(".dev_num").text(self_player.dev(action.key));
			let [result,reason] = $gameSystem.usable_use_dev(action);
			if(!result){
				$(this).attr("tip",reason).addClass("part_disabled");
			}
			count+=1;
		}
	});
	//如果有分数卡,显示激活分数卡
	if($gameSystem.self_player().all_score_num("unshown")>0){
		count+=1;
		$("#action_show_score_cards").show();
	}
	else{
		$("#action_show_score_cards").hide();
	}
	//安置按钮组位置
	$("actions1").css("top",$("#action_develop").position().top-count*25);
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
// 设置所有UI至回合开始的状态
//--------------------------------------------------------
function UI_begin_turn(force=false){
	//将UI重置到回合开始的状态(仅限游戏进度3:正常游戏时)
	//清除selectors
	clear_selectors();
	hide_special_actions();
	if(game_info.game_process!=2 || force){
		//清空所有状态类
		$("dice").removeClass();
		$("actions0").children().removeClass("disabled active part_disabled");
		$("actions0").children().children().removeClass("disabled active part_disabled");
		//隐藏除投骰子以外的按钮,如果本回合不是本人行动,则隐藏所有按钮
		//此处应有拉长历史消息窗口的动作
		if(game_info.step_list[game_info.step_index]==user_index || offline)
		{
			UI_start_dice();	
		}
		else{
			UI_hide_basic_menu();		
		}
		//刷新回合数
		set_rounds();
	}	
}
//--------------------------------------------------------
// 隐藏所有基础菜单
//--------------------------------------------------------
function UI_hide_basic_menu(){
	$("actions0").hide();
}
//--------------------------------------------------------
// 打开投骰界面(同时隐藏其他选项)
//--------------------------------------------------------
function UI_start_dice(){
	$("actions0").show();
	$("actions0").children().not(".fst_action").hide();
	$("actions1").children().not("actions2").hide();
	$("actions2").children().hide();
	$("special_actions").children().hide();
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
	if($gameSystem.is_own_turn()){
		//启用其他0级选项
		if(game_info.game_process!=1){
			$("actions0").children().not(".fst_action").show();
			UI_basic_action_udpate();
		}
	}
	//启动计时器
	if($gameSystem.time_per_turn!=0){
		//timer.reset();
		timer.start();
	}	
}
//--------------------------------------------------------
// 刷新正常行动选项按钮的可用性
//--------------------------------------------------------
function UI_basic_action_udpate(){
	$("actions0").children().not(".fst_action").not("actions1").children().removeClass("disabled part_disabled");
	if($gameSystem.self_player().all_dev_num()==0){
		$("#action_develop").attr("tip","尚未获得发展卡").addClass("part_disabled");
	}
}
//--------------------------------------------------------
// 开始选择前期坐城点
// step:0 第一座定居点,1 第一条路,2 第二座定居点,3 第二条路
//--------------------------------------------------------
function UI_start_set_home(step,point_id=0){
	game_temp.action_now="fst_set_home";
	game_temp.home_step=step;
	switch(step%2){
		case 0:
			//展示所有的可坐城点			
			var points=available_points_st(user_index);
			for(var i in points){
				$("pt_selector").filter("#"+points[i]).addClass("selector_available active").show();
			}
			break;
		case 1:
			//展示第一座定居点周围的所有边
			var edges=pt_round_edges(point_id);
			for(var i in edges){
				$("edge_selector").filter("#"+edges[i]).addClass("selector_available active").show();
			}
			break;
	}
}
//--------------------------------------------------------
// 创建简单UI,以在简单资源选择栏中使用
//--------------------------------------------------------
function create_simple_items(window_config){
	var selected_item_class = null;
	var availale_item_class = null;
	selected_item_class = window_config.selected_item_class;
	availale_item_class = window_config.availale_item_class;
	game_UI_list[window_config.key+"_items"]={
		selected:[],
		available:[]
	};
	for(let src_name of src_cards){

		var jqitem=$("simple_item_select_window").children().filter("src_select_window").children().filter("srcs_selected").children().filter("."+src_name);
		var a_selected_item=new selected_item_class(jqitem,null,src_name);
		a_selected_item.ratio_num=1;
		game_UI[game_UI.UI_count]=a_selected_item;
		game_UI_list[window_config.key+"_items"].selected.push(game_UI.UI_count);
		game_UI.UI_count++;

		jqitem=$("simple_item_select_window").children().filter("src_select_window").children().filter("srcs_available").children().filter("."+src_name);
		var a_available_item=new availale_item_class(jqitem,a_selected_item,src_name);
		a_available_item.ratio_num=1;
		game_UI[game_UI.UI_count]=a_available_item;
		game_UI_list[window_config.key+"_items"].available.push(game_UI.UI_count);
		game_UI.UI_count++;

		a_selected_item.rlt_item=a_available_item;
	}
}
//--------------------------------------------------------
// 开始选择资源(收获)
//--------------------------------------------------------
function UI_start_plenty_select(){
	//显示资源丢弃窗口
	$("simple_item_select_window").show();
	$("#action_confirm_selected_items").addClass("disabled");
	//显示关闭按钮
	$("simple_item_select_window #close").show();
	//没有打开过交易窗口则先生成UI
	if(game_UI.hasOwnProperty("plenty_items_created")==false){
		create_simple_items("plenty");
		game_UI.plenty_items_created=true;
	}
	//反查,重设按钮对应UI的id
	for(let UI_id of game_UI_list.plenty_items.selected.concat(game_UI_list.plenty_items.available)){
		let item = game_UI[UI_id];
		item.jqdom.attr("id",UI_id);
	}
	var items=game_UI_list.plenty_items.selected;
	for(var i=0;i<items.length;i++){
		var UI_id=items[i];
		var item=game_UI[UI_id];
		item.own_num=0;
		item.jqdom_init();
	}
	var items=game_UI_list.plenty_items.available;
	for(var i=0;i<items.length;i++){
		var UI_id=items[i];
		var item=game_UI[UI_id];
		var src_num=$gameBank.src(item.item_type);
		item.own_num=src_num;
		item.jqdom_init();
	}
	//设置收获数
	game_temp.plenty_count=0;
	$("#item_count").text("0");
	$("#item_top_limit").text(""+game_temp.item_top_limit);
	//设置文字
	$("simple_item_select_window").children().filter("window_head").children().filter("head_text").text("收获资源");
	$("simple_item_select_window").children().filter("src_select_window").children().filter("head_text").children().filter("content").text("可收获资源数");
	$("#action_confirm_selected_items").text("收获资源");
}
//--------------------------------------------------------
// 开始选择资源(丢弃)
//--------------------------------------------------------
function UI_start_drop_select(){
	//显示资源丢弃窗口
	$("simple_item_select_window").show();
	$("#action_confirm_selected_items").addClass("disabled");
	//隐藏关闭按钮
	$("simple_item_select_window #close").hide();
	var self_player=game_info.players[user_index];
	//没有打开过交易窗口则先生成UI
	if(game_UI.hasOwnProperty("drop_items_created")==false){
		create_simple_items("drop");
		game_UI.drop_items_created=true;
	}
	//反查,重设按钮对应UI的id
	for(let UI_id of game_UI_list.drop_items.selected.concat(game_UI_list.drop_items.available)){
		let item = game_UI[UI_id];
		item.jqdom.attr("id",UI_id);
	}
	var items=game_UI_list.drop_items.selected;
	for(var i=0;i<items.length;i++){
		var UI_id=items[i];
		var item=game_UI[UI_id];
		item.own_num=0;
		item.jqdom_init();
	}
	var items=game_UI_list.drop_items.available;
	for(var i=0;i<items.length;i++){
		var UI_id=items[i];
		var item=game_UI[UI_id];
		var src_num=self_player.src(item.item_type);
		item.own_num=src_num;
		item.jqdom_init();
	}
	//设置丢弃数
	game_temp.dropped=0;
	$("#item_count").text("0");
	$("#item_top_limit").text(""+game_temp.drop_required);
	//设置文字
	$("simple_item_select_window").children().filter("window_head").children().filter("head_text").text("舍弃资源");
	$("simple_item_select_window").children().filter("src_select_window").children().filter("head_text").children().filter("content").text("需要舍弃的资源");
	$("#action_confirm_selected_items").text("舍弃资源");
}
//--------------------------------------------------------
// 开始选择资源(统一化)
//--------------------------------------------------------
function UI_start_simple_item_select_window(type){
	//获取窗口相关信息
	var config=window_configs[type];
	//设置窗口
	game_temp.active_window=config;
	//显示资源窗口
	$("simple_item_select_window").show();
	$("#action_confirm_selected_items").addClass("disabled");
	//按需显示关闭按钮
	if(config.controller.close_button){
		$("simple_item_select_window #close").show();
	}
	else{
		$("simple_item_select_window #close").hide();
	}
	//没有打开过窗口则先生成UI
	if(game_UI.hasOwnProperty(config.key+"_items_created")==false){
		create_simple_items(config);
		game_UI[config.key+"_items_created"]=true;
	}
	//反查,重设按钮对应UI的id
	for(let UI_id of game_UI_list[config.key+"_items"].selected.concat(game_UI_list[config.key+"_items"].available)){
		let item = game_UI[UI_id];
		item.jqdom.attr("id",UI_id);
	}
	var items=game_UI_list[config.key+"_items"].selected;
	for(var i=0;i<items.length;i++){
		var UI_id=items[i];
		var item=game_UI[UI_id];
		item.own_num=0;
		item.jqdom_init();
	}
	var items=game_UI_list[config.key+"_items"].available;
	for(var i=0;i<items.length;i++){
		var UI_id=items[i];
		var item=game_UI[UI_id];
		var src_num=config.item_num(item.item_type);
		item.own_num=src_num;
		item.jqdom_init();
	}
	//额外初始化
	!!config.initial?config.initial():null;
	game_temp.item_select_count=0;
	game_temp.item_top_limit=config.controller.top_limit;
	$("#item_count").text("0");
	$("#item_top_limit").text(""+game_temp.item_top_limit);
	//设置文字
	$("simple_item_select_window").children().filter("window_head").children().filter("head_text").text(config.controller.window_head_text);
	$("simple_item_select_window").children().filter("src_select_window").children().filter("head_text").children().filter("content").text(config.controller.inner_head_text);
	$("#action_confirm_selected_items").text(config.controller.confirm_button_text);
}
//--------------------------------------------------------
// 启动设置强盗
//--------------------------------------------------------
function UI_start_robber_set(){
	//准备可选择的地块
	var places=available_places();
	for(var i in places){
		$("plc_selector").filter("#"+places[i]).addClass("active selector_available").show();
	}
}
//--------------------------------------------------------
// 清除菜单的活跃性
//--------------------------------------------------------
function UI_cancel_menu_active(){
	if(!!game_temp.activeMenuItem[1]){
		init_menu_lv(game_temp.activeMenuItem[0],game_temp.activeMenuItem[1]);
		game_temp.activeMenuItem[1]=null;
		return;
	}
	switch(game_temp.action_now){
	case "action_use_dev_plenty":
		init_menu_lv(1,$(`.use_dev[dev='plenty']`));
		break;
	case "action_show_score_cards":
		init_menu_lv(1,$("#action_show_score_cards"));
		break;
	}
}
//--------------------------------------------------------
// 关闭简单物品选择窗口
//--------------------------------------------------------
function close_simple_item_select_window(){
	$("simple_item_select_window").hide();
	UI_cancel_menu_active();
}
//--------------------------------------------------------
// 关闭确认窗口
//--------------------------------------------------------
function close_confirm_window(){
	if(game_temp.action_now=="action_promise"){
		game_temp.action_resolve("cofirm","cancel");
	}
	//关闭窗口
	$("confirm_window").hide();
	if(game_temp.action_now=="action_use_dev_road_making"){
		$("edge_selector").filter("#"+game_temp.selected_edge[1]).removeClass("selector_selected");
		game_temp.selected_edge.splice(1,1);
	}
	else{
		cancel_selector(game_temp.top_active_UI);
		game_temp.top_active_UI=null;
	}	
	//UI_cancel_menu_active();

}
//--------------------------------------------------------
// 打开回放控制器
//--------------------------------------------------------
function UI_show_replay_controller(){	
	$("replay_controller").show();
	replay_controller.initialize();
	replay_controller.play();
}
//--------------------------------------------------------
// 游戏结束
//--------------------------------------------------------
function UI_game_over(){
	clear_selectors();
	hide_special_actions();
	$("actions0").hide();
	$("his_input_window").hide();
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
// 取并集
//--------------------------------------------------------
function union(arr1,arr2){
	return arr1.concat(arr2.filter(function(v) {
        return arr1.indexOf(v) === -1}))
}
//--------------------------------------------------------
// 三种基础建设
//--------------------------------------------------------
//--------------------------------------------------------
// 建造道路
//--------------------------------------------------------
DynamicMenu.add_menu_item("base_build",{
	key:"build_road",
	name:"建设道路",
	intro:"建设一条道路,必须沿着你的道路、定居点或城市修建。",
	costlist:[{type:"brick",num:1},{type:"wood",num:1}],
	on_active:{
		selected_edge:0,
		run:async function(){
			try{
				var selector,edge_id,action;
				if(this.start()){
					while(true){
						[selector,edge_id] = await GameUI.next_step();
						this.select_edge(edge_id);
						[selector,action] = await GameUI.next_step();
						if(action=="confirm"){
							this.final();
							break;
						}
					}
				}	
			}
			catch(e){
				//使用trycatch来以更直接的方式结束等待闭环
				if(e.message=="breakPromiseLine"){return;}
				throw e;
			}
		},
		start:function(){
			//激活道路选择器,只激活可以建设道路的地方
			var edges=available_edges(user_index);
			//资源消耗提示
			var player=$gameSystem.self_player();
			for(var edge_id of edges){
				var selector=$("edge_selector").filter("#"+edge_id)
				selector.addClass("active").show();
				//资源不足则改变样式
				if(player.src("brick")==0 || player.src("wood")==0){
					selector.attr("tip","资源不足").addClass("selector_disabled");
				}
				else
				{
					selector.addClass("selector_available");
				}
			}
			return !(player.src("brick")==0 || player.src("wood")==0);
		},
		select_edge:function(edge_id){
			this.selected_edge=edge_id;
			//打开确认窗口
			confirm_window.set("要在这里建造道路吗?");
			confirm_window.show();
		},
		final:function(){
			ws.sendmsg("mes_action",{"starter":user_index,"val":[1,1,this.selected_edge]});	
		}
	}
});
//--------------------------------------------------------
// 建立定居点
//--------------------------------------------------------
DynamicMenu.add_menu_item("base_build",{
	key:"build_city0",
	name:"建立定居点",
	intro:"建设一个新的定居点,需要有你的道路相连,且附近没有任何人的定居点。骰子的总值与该定居点附近地块上的数字相同时,可以收获该地块类型产出的资源一份。",
	costlist:[{type:"brick",num:1},{type:"wood",num:1},{type:"wool",num:1},{type:"grain",num:1}],
	on_active:new PromiseLineBase({
		selected_point:0,
		promiseLine:async function(){
			var selector,point_id,action;
			if(this.start()){
				while(true){
					[selector,point_id] = await GameUI.next_step();
					//打开确认窗口
					this.selected_point=point_id;
					confirm_window.set("要在这里建造定居点吗?");
					confirm_window.show();
					[selector,action] = await GameUI.next_step();
					if(action=="confirm"){
						this.final();
						break;
					}
				}
			}
		},
		start:function(){
			//激活点选择器,只激活可以定居的地方
			var points=available_points(user_index);
			//资源消耗提示
			var player=$gameSystem.self_player();
			for(var point_id of points){
				var selector=$("pt_selector").filter("#"+point_id)
				selector.addClass("active").show();
				//资源不足则改变样式
				if(player.src("brick")==0 || player.src("wood")==0 || player.src("wool")==0 || player.src("grain")==0){
					selector.attr("tip","资源不足").addClass("selector_disabled");
				}
				else
				{
					selector.addClass("selector_available");
				}
			}
			return !(player.src("brick")==0 || player.src("wood")==0 || player.src("wool")==0 || player.src("grain")==0);
		},
		final:function(){
			ws.sendmsg("mes_action",{"starter":user_index,"val":[1,2,this.selected_point]});
		}
	})
});/*
//--------------------------------------------------------
// 建设新城市
//--------------------------------------------------------
DynamicMenu.add_menu_item("base_build",{
	key:"build_city1",
	name:"建设新城市",
	intro:"将定居点升级为城市,每次从对应骰子点数收获资源时,城市可以获得双倍的资源。",
	costlist:[{type:"grain",num:2},{type:"ore",num:3}],
	on_active:{
		selected_point:0,
		run:async function(){
			try{
				var selector,point_id,action;
				if(this.start()){
					while(true){
						[selector,point_id] = await GameUI.next_step();
						//打开确认窗口
						this.selected_point=point_id;
						confirm_window.set("要在这里建造新城市吗?");
						confirm_window.show();
						[selector,action] = await GameUI.next_step();
						if(action=="confirm"){
							this.final();
							break;
						}
					}
				}					
			}
			catch(e){
				//使用trycatch来以更直接的方式结束等待闭环
				if(e.message=="breakPromiseLine"){return;}
				throw e;
			}
		},
		start:function(){
			//资源消耗提示
			var player=$gameSystem.self_player();
			//激活点选择器,只激活可以升级的地方
			var points=city_num(player,0,"all");
			for(var i in points){
				var selector=$("pt_selector").filter("#"+points[i])
				selector.addClass("active").show();
				//资源不足则改变样式
				if(player.src("grain")<2 || player.src("ore")<3){
					selector.attr("tip","资源不足").addClass("selector_disabled");
				}
				else{
					selector.addClass("selector_available");
				}
			}
			return !(player.src("grain")<2 || player.src("ore")<3);
		},
		final:function(){
			ws.sendmsg("mes_action",{"starter":user_index,"val":[1,3,this.selected_point]});
		}
	}
});*/
//--------------------------------------------------------
// 交易资源的UI对象,用于处理复杂的前置判断和资源交换
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
class Available_item extends Src_item{
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
		game_temp.item_select_count--;
	}
	increase(){
		super.increase();
		game_temp.item_select_count++;
	}
}
class Available_Drop_item extends Available_item{
	constructor(jq_object,relative_object,item_type){
		super(jq_object,relative_object,item_type);
	}
	can_reduce(){
		if(super.can_reduce()==false){
			return false;
		}
		if(game_temp.item_select_count==game_temp.item_top_limit){
			return false;
		}
		return true;
	}
}
class Selected_Plenty_item extends Selected_item{
	constructor(jq_object,relative_object,item_type){
		super(jq_object,relative_object,item_type);
	}
	reduce(){
		super.reduce();
		game_temp.item_select_count--;
	}
	increase(){
		super.increase();
		game_temp.item_select_count++;
	}
}
class Available_Plenty_item extends Available_item{
	constructor(jq_object,relative_object,item_type){
		super(jq_object,relative_object,item_type);
	}
	can_reduce(){
		if(super.can_reduce()==false){
			return false;
		}
		if(game_temp.item_select_count==game_temp.item_top_limit){
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
class Available_Trade_item extends Available_item{
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




