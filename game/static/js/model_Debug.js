//用于处理DebugUI的模块
ready_list={};
$(document).ready(function(){

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
		if(offline){
			alert("请先关闭脱机模式！")
			return;
		}
		user_index=parseInt($("#set_user_index").val());
		user_name=$("#set_user_name").val();
		//本地局域网1
		//ws = new WebSocket("ws://172.24.10.250:80/ws/game_test/"+user_index+"/");
		//本地局域网2
		//ws = new WebSocket("ws://192.168.50.50:80/ws/game_test/"+user_index+"/");
		//阿里云服务器
		ws = new WebSocket("ws://119.23.218.46:80/ws/game_test/"+user_index+"/");
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
		//发起请求
		$.ajax({
	        async:false,
	        url:"/ajax/t_create_room/",
	        type:"get",
	        data:"&room_size=" + player_size,
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
			$("plc_selector").addClass("active selector_avaliable").show();
			$("edge_selector").addClass("active selector_avaliable").show();
			$("pt_selector").addClass("active selector_avaliable").show();
		}
		else
		{
			$(this).attr("on","off");
			$("plc_selector").removeClass("active selector_avaliable").hide();
			$("edge_selector").removeClass("active selector_avaliable").hide();
			$("pt_selector").removeClass("active selector_avaliable").hide();
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
// 获取游戏数据
//--------------------------------------------------------
function request_t_game_info(){
	//加载游戏数据
	$.ajax({
		async:false,
		url:"/ajax/t_load_game/",
		type:"get",
		data:"&player_index=" + user_index,
		dataType:"json",
		headers:{"X-CSRFToken":$.cookie("csrftoken")},
		success:function(info){
			map_info=info.map_info;
			game_info=info.game_info;
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
	if(!offline){
		//一切就绪后,发送ready消息
		ws.sendmsg("mes_member",{change:"ready",value:[user_index,user_name]});
	}
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
			game_info.game_process=1;
			UI_new_turn();
		}
	}	
}
//--------------------------------------------------------
// 更新游戏数据(debug模块专用)
//--------------------------------------------------------
function upload_game_info(){
	$.ajax({ 
		type : "post", 
		url : "/ajax/t_update_game_info/", 
		data : {game_info:JSON.stringify(game_info)}, 
		async : false, 
		headers:{"X-CSRFToken":$.cookie("csrftoken")},
		error : function(){ 
			alert("更新服务器数据失败!");
		} 
	}); 
}
