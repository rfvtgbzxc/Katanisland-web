//用于处理DebugUI的模块
ready_list={};
$(document).ready(function(){
	//--------------------------------------------------------
	// 切换加入模式
	//--------------------------------------------------------
	$("#type_create_room").change(function(){
		$("#cmd_join_room").hide();
		$("#cmd_create_room").show();
	});
	$("#type_join_room").change(function(){
		if(this.available){$("#cmd_join_room").show();}
		$("#cmd_create_room").hide();
		$("#room_pswd").blur();
	});
	//--------------------------------------------------------
	// 切换信息输入(开始界面)
	//--------------------------------------------------------
	$("#room_pswd").keydown(function(e){
		if(e.keyCode==13){
			if($("#type_create_room").prop("checked")){
				document.getElementById("room_size").focus();
			}
			else{
				$("#room_pswd").blur();
			}
		}	
	});
	$("#cmd_join_room input,#cmd_create_room input").keydown(function(e){
		if(e.keyCode==13){
			if($(this).attr("id")=="set_user_name"){
				$("#load_game_online").click();
			}
			else if($(this).attr("id")=="room_time_per_turn"){
				$("#create_game_online").click();
			}
			else{
				$(this).nextAll("input").get(0).focus();
			}	
		}	
	});
	//--------------------------------------------------------
	// 检查房间信息
	//--------------------------------------------------------
	$("#room_pswd").blur(function(){
		if($("#type_create_room").prop("checked")){return;}
		if(this.room_pswd==$(this).val()){return;}
		this.room_pswd=$(this).val();
		$("#room_checking_state").text("请求房间信息中...");
		$("#room_pswd").attr("disabled",true);
		$("#cmd_join_room").hide();
		requestAnimationFrame(function(){
			$.ajax({
		        url:"/ajax/request_room_state/",
		        type:"get",
		        dataType:"json",
		        data:{
		        	room_pswd:$("#room_pswd").val()
		        },
		        headers:{"X-CSRFToken":$.cookie("csrftoken")},
		        success:function(info){
		        	update_room_info(info);	
		        }
	    	});
		});	
	});
	//--------------------------------------------------------
	// 获取房间数据
	//--------------------------------------------------------
	function update_room_info(info){
		$("#room_pswd").attr("disabled",false);
		document.getElementById("type_join_room").available=false;
		game_temp.replay_model=false;	
		switch(info.state){
		case "none":
			$("#room_checking_state").text("没有这个房间！");
			return;
			break;
		case "exist":
			$("#room_checking_state").text("");
			$("#set_user_index").empty();
			$("#set_user_index").append("<label class='index_setter'><input id='type_create_room' name='user_index' type='radio' value='0'>观众</label>");
			for(let i=1;i<=info.member_max;i++){
				$("#set_user_index").append("<label class='index_setter'><input id='type_create_room' name='user_index' type='radio' value='"+i+"'>玩家"+i+"</label>");
			}
			break;
		case "over":
			$("#room_checking_state").text("游戏已经结束！");
			$("#set_user_index").empty();
			$("#set_user_index").append("<label class='index_setter'><input id='type_create_room' name='user_index' type='radio' value='0'>查看回放</label>");
			game_temp.replay_model=true;
			break;
		}
		$("input[name='user_index']").first().prop("checked",true);
		$("#cmd_join_room").show();
		document.getElementById("type_join_room").available=true;
		//自动填充
		if($.cookie("room_pswd")==document.getElementById("room_pswd").room_pswd){
			if($.cookie("user_index")!=null){$("input[name='user_index']").eq(parseInt($.cookie("user_index"))).prop("checked",true);}
			if($.cookie("user_name")!=null){$("#set_user_name").val($.cookie("user_name"));}
			document.getElementById("set_user_name").focus();			
		}
		else if(!!$.cookie("remember_user_name")){
			if($.cookie("user_name")!=null){$("#set_user_name").val($.cookie("user_name"));}
		}
		else{
			$("#set_user_name").val("");
		}
	}
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
		room_pswd=$("#room_pswd").val();
		user_index=parseInt($("input[name='user_index']:checked").val());
		user_name=$("#set_user_name").val();
		if(offline){
			console.log("将以离线模式加载游戏，不会保存游戏数据")
			load_game_offline();
			return;
		}
		init_webscoket(function(){
			//连接成功后通报全场
			if(user_index==0){
	        	ws.sendmsg("mes_member",{change:"audience_join",value:[user_name]});
			}
			else{
				ws.sendmsg("mes_member",{change:"relink",value:[user_index]});
				
			}
	        //从数据库载入游戏信息
	        request_t_game_info(false);
		});
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
	        	if(info=="创建成功!"){
	        		$("#type_join_room").prop("checked",true);
	        		$("#type_join_room").change();
	        	}
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
	//--------------------------------------------------------
	// 初始化
	//--------------------------------------------------------
	document.getElementById("room_pswd").room_pswd="";
	document.getElementById("type_join_room").available=false;
	// 自动填充
	if(!!$.cookie("room_pswd")){
		$("#room_pswd").val($.cookie("room_pswd"));
		$("#room_pswd").blur();
	}
	if(!!$.cookie("remember_user_name")){
		$("input[name=remember_user_name]").prop("checked",true);
	}
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
			map_info=JSON.parse(info.map_info);
			DataManager.extractSaveContents(JSON.parse(info.game_info));
			//初始化准备状态
			for(let player_index in game_info.players){
				ready_list[player_index]=false;
			}
			//创建必要的页面元素
			load_map();
			load_UI();
			//保存当前的房间密码、玩家序号、名称
			$.cookie("room_pswd",room_pswd);
			$.cookie("user_index",user_index);
			$.cookie("user_name",user_name);
			if($("input[name='remember_user_name']").prop("checked")){$.cookie("remember_user_name",true);}
			else{$.removeCookie("remember_user_name");}
			//在此处添加页面构造完成以后的代码
			//回放模式
			if(!!game_temp.replay_model){
				GameEvent.initial_replay_event_queue(JSON.parse(info.event_list));
				UI_show_replay_controller();
			}
			init_t_ui();
			$("#basic_cmd").hide();
			if(!offline && !$gameSystem.is_audience()){
				//一切就绪后,发送ready消息
				ws.sendmsg("mes_member",{change:"ready",value:[user_index,user_name]});
			}
		},
	});
}
//--------------------------------------------------------
// UI初始化,确定当前状态
//--------------------------------------------------------
function init_t_ui(){	
	if(!debug){
		$("#debuging").hide();
		$("#debug_show_ids").hide();
		$("#debug_show_selectors").hide();
	}
	if($gameSystem.is_audience()){
		$("his_input_window").hide();		
	}
	else{
		$("source_list").show();
	}
	$("#players").show();
	$("dice").show();
	$("his_window").show();
	hide_special_actions();
	clear_selectors();
	update_static_Graphic();
	//更新计时器
	timer.reset();
	//截至以上,是一个空白的的游戏中的状态

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
			UI_set_dices($gameSystem.dice_num[0],$gameSystem.dice_num[1]);
			//查看投出7的进行状态
			if($gameSystem.dice_7_step==0){
				//由于非正交的层级设计,如果不是自己回合该函数没有任何作用= =,不过会打开计时器
				UI_start_build();
			}
			else{
				if(!$gameSystem.is_audience()){
					if($gameSystem.dice_7_step==1 && $gameSystem.self_player().drop_required!=0){
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
					if(trade.accepter==user_index){
						his_window.push($gamePlayers[trade.starter].name+" 想要与你交易","important");
						show_special_actions("trade",trade.starter);
						break;
					}
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
		if(!$gameSystem.is_audience()){
			ws.sendmsg("mes_member",{change:"ready",value:[user_index,user_name]});
		}	
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
			//上传该基础游戏状态数据
			upload_initial_game_info();
			UI_start_dice();
		}
	}
}	
//--------------------------------------------------------
// 上传基础游戏状态数据
//--------------------------------------------------------
function upload_initial_game_info(){
	var game_save = DataManager.makeSaveContents();
	$.ajax({ 
		type : "post", 
		url : "/ajax/t_update_initial_game_info/", 
		data : {
			room_pswd:room_pswd,
			game_info:JSON.stringify(game_save),
		}, 
		async : false, 
		headers:{"X-CSRFToken":$.cookie("csrftoken")},
		error : function(){ 
			alert("更新服务器数据失败!");
		} 
	}); 
}
//--------------------------------------------------------
// 更新游戏数据(debug模块专用)
//--------------------------------------------------------
function upload_game_info(message){
	var game_save = DataManager.makeSaveContents();
	var event=message.message;
	$.ajax({ 
		type : "post", 
		url : "/ajax/t_update_game_info/", 
		data : {
			room_pswd:room_pswd,
			game_info:JSON.stringify(game_save),
			event:JSON.stringify(event)
		}, 
		async : false, 
		headers:{"X-CSRFToken":$.cookie("csrftoken")},
		error : function(){ 
			alert("更新服务器数据失败!");
		} 
	}); 
}
