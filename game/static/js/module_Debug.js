//用于处理DebugUI的模块
ready_list={};
$(document).ready(function(){
	//--------------------------------------------------------
	// 初始化
	//--------------------------------------------------------

	//--------------------------------------------------------
	// 切换加入模式
	//--------------------------------------------------------
	$("#type_create_room").change(function(){
		if($(this).val()=="on"){
			$("#cmd_join_room").hide();
			$("#cmd_create_room").show();
		}
	});
	$("#type_join_room").change(function(){
		if($(this).val()=="on"){
			$("#cmd_join_room").show();
			$("#cmd_create_room").hide();
		}
	});
	//--------------------------------------------------------
	// 加载游戏
	//--------------------------------------------------------
	$("#load_game").click(function(){
		load_ws_function_msg();
		request_game_info();
	});
	//--------------------------------------------------------
	// 以联机模式加载游戏
	// 将会进入一个测试房间,该房间由创建游戏按钮创建
	//--------------------------------------------------------
	$("#load_game_online").click(function(){
		user_index=parseInt($("#set_user_index").val());
		user_name=$("#set_user_name").val();
		room_pswd=$("#room_pswd").val();
		if(offline){
			console.log("将以离线模式加载游戏，不会保存游戏数据")
			load_game_offline();
			return;
		}
		//本地局域网1
		//ws = new WebSocket("ws://172.24.10.250:80/ws/game_test/"+room_pswd+"/"+user_index+"/");
		//本地局域网2
		ws = new WebSocket("ws://192.168.50.140:80/ws/game_test/"+room_pswd+"/"+user_index+"/");
		//阿里云服务器
		//ws = new WebSocket("ws://119.23.218.46:80/ws/game_test/"+room_pswd+"/"+user_index+"/");
		//腾讯云服务器
		//ws = new WebSocket("ws://122.51.21.190:80/ws/game_test/"+room_pswd+"/"+user_index+"/");
		load_ws_function_msg();
		load_ws_function_link();
		ws.onopen = function () {
            //当连接成功时，从数据库载入游戏信息
            ws.sendmsg("mes_member",{change:"relink",value:[user_index]});
            request_t_game_info();
        };	
	});
	//--------------------------------------------------------
	// 创建游戏
	//--------------------------------------------------------
	$("#create_game_online").click(function(){
		//获取房间人数
		var player_size=parseInt($("#room_size").val());
		var room_pswd=$("#room_pswd").val();
		var room_time_per_turn=parseInt($("#room_time_per_turn").val());
		var map_template=$("#map_template").val();
		//发起请求
		$.ajax({
	        async:false,
	        url:"/ajax/t_create_room/",
	        type:"get",
	        data:{
	        	room_pswd:room_pswd,
	        	room_size:player_size,
	        	time_per_turn:room_time_per_turn,
	        	map_template:map_template
	        },
	        headers:{"X-CSRFToken":$.cookie("csrftoken")},
	        success:function(info){
	        	alert(info);
	        }
	    });

	});
	//--------------------------------------------------------
	// DEBUG-UI：激活所有选择器
	//--------------------------------------------------------
	$("#debug_show_selectors").click(function(){
		if($(this).attr("on")=="off")
		{
			$(this).attr("on","on");
			$("plc_selector").addClass("active selector_available").show();
			$("edge_selector").addClass("active selector_available").show();
			$("pt_selector").addClass("active selector_available").show();
		}
		else
		{
			$(this).attr("on","off");
			$("plc_selector").removeClass("active selector_available").hide();
			$("edge_selector").removeClass("active selector_available").hide();
			$("pt_selector").removeClass("active selector_available").hide();
		}		
	});
	//--------------------------------------------------------
	// DEBUG-UI：显示数字
	//--------------------------------------------------------
	$("#debug_show_ids").click(function(){
		if($(this).attr("on")=="off")
		{
			$(this).attr("on","on");
			$("plc_selector").each(function(){
				$(this).attr("tip",$(this).attr("id"));
			});
			$("edge_selector").each(function(){
				$(this).attr("tip",$(this).attr("id"));
			});
			$("pt_selector").each(function(){
				$(this).attr("tip",$(this).attr("id"));
			});
		}
		else
		{
			$(this).attr("on","off");
			$("plc_selector").text("");
			$("edge_selector").text("");
			$("pt_selector").text("");
		}		
	});
});
//--------------------------------------------------------
// 以离线模式加载游戏
// 不会生成真实websocket
//--------------------------------------------------------
function load_game_offline(){
	load_ws_function_msg();
	request_t_game_info();
}
//--------------------------------------------------------
// 获取游戏数据
//--------------------------------------------------------
function request_t_game_info(){
	//加载游戏数据
	$.ajax({
		async:false,
		url:"/ajax/t_load_game/",
		type:"get",
		data:"&room_pswd=" + room_pswd,
		dataType:"json",
		headers:{"X-CSRFToken":$.cookie("csrftoken")},
		success:function(info){
			map_info=info.map_info;
			DataManager.extractSaveContents(info.game_info);
			//game_info=info.game_info;
		},
	});
	//初始化准备状态
	for(player_index in game_info.players){
		ready_list[player_index]=false;
	}
	load_map();
	load_UI();
	//在此处添加页面构造完成以后的代码
	load_game();
	init_t_ui();
	$("#basic_cmd").hide();
	if(!offline){
		//一切就绪后,发送ready消息
		ws.sendmsg("mes_member",{change:"ready",value:[user_index,user_name]});
	}
}
//--------------------------------------------------------
// 加载数据,确定当前状态
//--------------------------------------------------------
function load_game(){
	//这里以后会修改?
	user_id=game_info.player_list[user_index][0];
	//是不是自己的回合

	//初始化强盗位置
	if(game_info.occupying==0){
		game_info.occupying=map_info.basic_roober;
	}

	//更新计时器
	timer.reset();
}
//--------------------------------------------------------
// UI初始化
//--------------------------------------------------------
function init_t_ui(){
	$("dice").show();
	$("his_window").show();
	$("source_list").show();
	if(!debug){
		$("#debuging").hide();
		$("#debug_show_ids").hide();
		$("#debug_show_selectors").hide();
	}
	hide_special_actions();
	clear_selectors();
	update_static_Graphic();
	//截至以上,是一个空白的的游戏中的状态

	//初始化recive_list
	//$gameSystem.recive_list=[].concat(game_info.online_list);
	//检测当前游戏状态
	switch($gameSystem.game_process){
		//尚未开始
		case 0:
			//等待所有玩家加入完毕
			break;
		//投掷骰子
		case 1:
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
			break;
		//前期坐城
		case 2:
			create_step_list();
			//在自己的回合,进行判断
			if($gameSystem.is_own_turn()){
				var own_cities = $gameSystem.active_player().own_cities
				UI_start_set_home($gameSystem.active_player().home_step,own_cities[own_cities.length-1]);
			}
			break;
		//正常游戏
		case 3:
			create_step_list();
			UI_begin_turn();
			//是否已经投骰?
			if($gameSystem.dice_num[0]!=0){
				UI_set_dices($gameSystem.dice_num[0],$gameSystem.dice_num[1]);
				//查看投出7的进行状态
				if($gameSystem.dice_7_step==0){
					//由于非正交的层级设计,如果不是自己回合该函数没有任何作用= =
					UI_start_build();
				}
				else{
					if($gameSystem.dice_7_step==1 && $gameSystem.self_player().drop_required!=0){
						start_drop_select();
					}
					else if($gameSystem.dice_7_step==2 && $gameSystem.is_own_turn()){
						start_robber_set();
					}
					break;
				}			
				//检查交易并显示
				for(let trade_id of $gameSystem.active_trades){
					let trade = $gameTrades[trade_id];
					if(trade.accepter==user_index){
						his_window.push($gamePlayers[trade.starter].name+" 想要与你交易","important");
						show_special_actions("trade",trade.starter);
						break;
					}
				}		
			}
			break;		
	}
}
//--------------------------------------------------------
// 额外处理信息
//--------------------------------------------------------
function debug_handel_msg(msg){
	switch(msg.type){
		case "mes_member":
			switch(msg.message.change){
				//玩家就绪
				case "ready":
					t_player_ready(msg.message.value[0],msg.message.value[1]);
					break;
			}
		break;
	}
}

//--------------------------------------------------------
// 玩家就绪(debug模块专用)
//--------------------------------------------------------
function t_player_ready(player_index,player_name){
	if(game_info.game_process!=0){
		return;
	}
	//未曾收到过该人的信息,则额外发送自己的
	if(ready_list[player_index]==false){
		ws.sendmsg("mes_member",{change:"ready",value:[user_index,user_name]});
		//完善准备列表
		ready_list[player_index]=true;
		//一开始大家都没有名字,因此要将名字置入
		var player=game_info.players[player_index];
		player.name=player_name;
		game_info.player_list[player_index][1]=player_name;
		$("playername").filter("#"+player_index).text(""+player_name);
		$("button").filter(function(){
			return $(this).attr("trade_target")=="player" && $(this).attr("target_val")==player_index;
		}).text(""+player_name);

		his_window.push("序号"+player_index+", "+player_name+" 准备就绪");
		var all_ready=true;
		for(var t_player_index in ready_list){
			if(!ready_list[t_player_index]){
				all_ready=false;
				break;
			}
		}
		if(all_ready){
			$youziku.submit("playername_fst_update");
			his_window.push("所有玩家准备就绪,开始确定行动顺序,请投骰子：","important");
			//初始化recive_list
			$gameSystem.recive_list=[].concat(game_info.online_list);
			game_info.game_process=1;
			UI_start_dice();
		}
	}	
}
//--------------------------------------------------------
// 更新游戏数据(debug模块专用)
//--------------------------------------------------------
function upload_game_info(){
	var game_save = DataManager.makeSaveContents();
	$.ajax({ 
		type : "post", 
		url : "/ajax/t_update_game_info/", 
		data : {"room_pswd":room_pswd,game_info:JSON.stringify(game_save)}, 
		async : false, 
		headers:{"X-CSRFToken":$.cookie("csrftoken")},
		error : function(){ 
			alert("更新服务器数据失败!");
		} 
	}); 
}
