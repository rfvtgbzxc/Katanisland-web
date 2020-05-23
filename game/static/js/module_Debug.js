//用于处理DebugUI的模块
ready_list={};
//UI：开始界面
var UI_start_menu={
	index:null,
	dom:null,
	window_body:null,
	index_items:null,
	content_pages:null,
	window_linker:null,
	child_UI:{},
	initialize:function(root_dom,index) {
		//检索并绑定dom
		this.dom = root_dom;
		this.window_body = document.querySelectorAll("#start_menu .window_body")[0];
		this.window_linker = document.getElementById("window_linker");
		this.index_items = document.getElementsByClassName("head_item");
		this.content_pages = document.getElementsByClassName("content_page");
		this.content_fix_page = document.getElementsByClassName("content_fix_page")[0];
		this.room_pswd_inputer = document.getElementById("room_pswd");
		//隐藏页面
		for(let page of this.content_pages){
			page.style.display = "none";
		}
		//设置页面UI
		this.child_UI[0]=UI_page_createRoom;
		this.child_UI[1]=UI_page_joinRoom;
		UI_page_createRoom.initialize(this.content_pages[0]);
		UI_page_joinRoom.initialize(this.content_pages[1]);
		
		//绑定事件
		for(let i=0;i<this.index_items.length;i++){
			this.index_items[i].index = i;
			this.index_items[i].addEventListener("click",function(){
				UI_start_menu.setMenuIndex(this.index);
			});
		}

		//设置界面
		this.setMenuIndex(index,true);
	},
	setMenuIndex:function(index,initial){
		if(this.index==index){return;}
		this.resetMenu();
		//移除之前的激活状态
		if(!initial){
			this.index_items[this.index].classList.remove("active");
			$(this.content_pages[this.index]).hide();	
		}				
		//设置index
		this.index = index;
		this.index_items[index].classList.add("active");
		//有自己的UI则调用onSelect自行处理
		if(!!this.child_UI[index]){
			this.child_UI[index].onSelect();
		}
		else{
			$(this.content_pages[this.index]).fadeIn("fast");
		}
		this.window_linker.style.left = this.index_items[index].offsetLeft + this.index_items[index].offsetWidth / 2 - 20 + "px";
	},
	resetMenu:function(){
		this.unshrinkMenu();
	},
	unshrinkMenu:function(){
		this.window_body.style.height = "";
	},
	shrinkMenu:function(){
		requestAnimationFrame(()=>this.window_body.style.height = this.content_fix_page.scrollHeight+"px");
	},
	requestRoomInfoAndUpdate:function(){
		if(this.room_pswd_inputer.value==""){return;}
		if(this.room_pswd_inputer.disabled){return;}
		//请求期间禁止输入
		this.room_pswd_inputer.disabled=true;
		$("#room_checking_state").text("请求房间信息中...");
		$.get("/ajax/request_room_state/",{room_pswd:this.room_pswd_inputer.value},(info)=>this.child_UI[this.index].updateRoomInfo(info),"json");
	},
	updateRoomInfo:function(info){
		this.room_pswd_inputer.disabled=false;
	},
	hidePage:function(){
		this.shrinkMenu();
		this.child_UI[this.index].hidePage();
	},
	fitPage:function(){
		//存疑,使用这行计算高度时,最后的高度会略高,但下断点后就会恢复正常
		//this.window_body.style.height=this.window_body.scrollHeight+"px";
		requestAnimationFrame(()=>this.window_body.style.height=this.content_fix_page.scrollHeight+this.content_pages[this.index].scrollHeight+"px");
	}
}
var UI_page_createRoom={
	dom:null,
	initialize:function(dom){
		this.dom=dom;
	},
	onSelect:function(){
		UI_start_menu.hidePage();
		UI_start_menu.requestRoomInfoAndUpdate();
	},
	hidePage:function(){
		this.dom.style.display="none";
	},
	showPage:function(){
		$(this.dom).fadeIn("fast");
		UI_start_menu.fitPage();
	},	
	updateRoomInfo:function(info){
		UI_start_menu.updateRoomInfo(info);
		if(info.state!="none"){
			$("#room_checking_state").text("房间已存在！");
			UI_start_menu.hidePage();
		}
		else{
			$("#room_checking_state").text("");
			this.showPage();
			document.getElementById("room_size").focus();	
		}
		
	}
}
var UI_page_joinRoom={
	dom:null,
	initialize:function(dom){
		this.dom=dom;
		this.extendList=document.getElementById("extend_using_state");
	},
	onSelect:function(){
		UI_start_menu.hidePage();
		UI_start_menu.requestRoomInfoAndUpdate();
	},
	hidePage:function(){
		this.dom.style.display="none";
	},
	showPage:function(){
		$(this.dom).fadeIn("fast");
		UI_start_menu.fitPage();
	},
	
	updateRoomInfo:function(info){
		UI_start_menu.updateRoomInfo(info);	
		game_temp.replay_model=false;
		switch(info.state){
		case "none":
			$("#room_checking_state").text("没有这个房间！");
			UI_start_menu.hidePage();
			return;
			break;
		case "exist":
			$("#room_checking_state").text("");
			$("#set_user_index").empty();
			$("#set_user_index").append("<label class='index_setter'><input id='type_create_room' name='user_index' type='radio' value='0'>观众</label>");
			for(let i=1;i<=info.member_max;i++){
				$("#set_user_index").append("<label style='color:"+ color_reflection_hex[color_reflection[i]] +"' class='index_setter'><input id='type_create_room' name='user_index' type='radio' value='"+i+"'>玩家"+i+"</label>");
			}
			break;
		case "over":
			$("#room_checking_state").text("游戏已经结束！");
			game_temp.replay_model=true;
			$("#set_user_index").empty();
			$("#set_user_index").append("<label class='index_setter'><input id='type_create_room' name='user_index' type='radio' value='0'>查看回放</label>");
			break;
		}
		//设置extend列表
		ExtendManager.extendList = info.extend_list;
		var text = "";
		//显示extend列表
		for(let extendInfo of info.extend_list){
			text+=extendInfo.name_Ch+" "
		}
		$(this.extendList).text(text);

		//通过,展示更大的界面
		this.showPage();
		//自动填充	
		$("input[name='user_index']").first().prop("checked",true);	
		if($.cookie("room_pswd")==UI_start_menu.room_pswd_inputer.value){
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
		//重载游戏
		if(!!$.cookie("relink_game")){
			$.cookie("relink_game","");
			if(!game_temp.replay_model){$("#load_game_online").click();}	
		}

	}
}
$(document).ready(function(){
	UI_start_menu.initialize(document.getElementById("start_menu"),1);
	$("#room_pswd").blur(function(){
		UI_start_menu.requestRoomInfoAndUpdate();
	})
	$("#room_pswd").focus(function(){
		UI_start_menu.hidePage();
	})
	$("#room_pswd").keydown(function(e){
		if(e.keyCode==13){
			this.blur();
		}	
	});


	//--------------------------------------------------------
	// 切换信息输入(开始界面)
	//--------------------------------------------------------
	$(".content_page input").keydown(function(e){
		if(e.keyCode==13){
			if($(this).attr("id")=="set_user_name"){
				$("#load_game_online").click();
			}
			else if($(this).attr("id")=="room_time_per_turn"){
				$("#create_game_online").click();
			}
			else{
				$(this).parent().nextAll("label").get(0).focus();
			}	
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
		var extend_list=[];
		extend_list.push($("input[name='setExtend']:checked").val())
		if(isNaN(player_size)){
			alert("请输入玩家数！");
			return;
		}
		extend_list=JSON.stringify(extend_list);
		//发起请求	
		$.ajax({
	        async:false,
	        url:"/ajax/t_create_room/",
	        type:"get",
	        data:{
	        	room_pswd:room_pswd,
	        	room_size:player_size,
	        	time_per_turn:room_time_per_turn,
	        	map_template:map_template,
	        	extend_list:extend_list
	        },
	        headers:{"X-CSRFToken":$.cookie("csrftoken")},
	        success:function(info){	        	
	        	alert(info);
	        	if(info=="创建成功!"){
	        		UI_start_menu.setMenuIndex(1);
	        	}
	        }
	    });
	    //UI_start_menu.setMenuIndex(1);

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
	// 自动填充
	if(!!$.cookie("room_pswd")){
		$("#room_pswd").val($.cookie("room_pswd"));
		UI_start_menu.requestRoomInfoAndUpdate();
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
// 进入游戏
//--------------------------------------------------------
function request_t_game_info(){
	//加载拓展数据
	ExtendManager.loadExtend(()=>{
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
	reload_game();
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
				//玩家掉线
				case "lost":
					player_lost(msg.message.value[0])
			}
		break;
	}
}
//--------------------------------------------------------
// 玩家掉线(debug模块专用)
//--------------------------------------------------------
function player_lost(player_index){
	his_window.push(`序号 ${player_index} ,${$gamePlayers[player_index].name} 掉线`,"important");
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
		$("player").filter("#"+player_index).children().filter("playername").text(""+player_name);
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
