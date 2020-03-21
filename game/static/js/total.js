//--------------------------------------------------------
// class Game_Bank
// 处理游戏卡片数据
//--------------------------------------------------------
class Game_Bank{
	//--------------------------------------------------------
	// 初始化,载入数据
	//--------------------------------------------------------
	constructor(static_bank){
		for(let attr of Object.keys(static_bank)){
			this[attr]=static_bank[attr];
		}
	}
	//--------------------------------------------------------
	// 获取资源数
	// 可以使用资源id或资源名来获取,且可以使用操作符进行数量修改
	//--------------------------------------------------------
	src(src_name,op="null",op_num="null"){
		if(/^[0-9]+$/.test(src_name)){
			var src_id = src_name;
			src_name=order[src_name];
		}
		else{var src_id = src_reflection[src_name];}
		if(typeof(op)=="number"){
			op_num=op;
			op="=";
		}
		if(op_num=="null"){
			return this[src_name+"_num"];
		}
		switch(op){
			case "null":
				this[src_name+"_num"]=op_num;
				break;
			case "=":
				this[src_name+"_num"]=op_num;
				break;
			case "+=":
				this[src_name+"_num"]+=op_num;
				break;
			case "-=":
				this[src_name+"_num"]-=op_num;
				break;
		}
		return this[src_name+"_num"];
	}
}
//用于处理游戏的连接、重连等。
//--------------------------------------------------------
// 初始化websocket
//--------------------------------------------------------
function init_webscoket(success){
	//本地局域网1
	//ws = new WebSocket("ws://172.24.10.250:80/ws/game_test/"+room_pswd+"/"+user_index+"/");
	//本地局域网2
	ws = new WebSocket(websocket_url+"/"+room_pswd+"/"+user_index+"/");
	//阿里云服务器
	//ws = new WebSocket("ws://119.23.218.46:80/ws/game_test/"+room_pswd+"/"+user_index+"/");
	//腾讯云服务器
	//ws = new WebSocket("ws://122.51.21.190:80/ws/game_test/"+room_pswd+"/"+user_index+"/");
	load_ws_function_msg();
	load_ws_function_link();
	ws.onopen = function () {
		success();
    };	
}
//--------------------------------------------------------
// 处理连接信息
//--------------------------------------------------------
function member_handle_msg(message){
	switch(message.change){
		//玩家重连
		case "relink":
			player_relink(message.value[0]);
			break;
		//玩家就绪
		case "ready":
			player_ready(message.value[0]);
			break;
		//观众加入
		case "audience_join":
			audience_join(message.value[0]);
			break;
	}
}
//--------------------------------------------------------
// 玩家重连
//--------------------------------------------------------
function player_relink(relinker_id){
	//暂不设置游戏进度为0时的操作
	if(game_info.game_process==0){return;}
	//获取玩家
	var relinker_index=game_info.user_list[relinker_id];
	var relinker=game_info.players[relinker_index];
	//发出提示,并打开等待窗口等待其加载完毕
	his_window.push(relinker.name+" 重新连接","important");
	his_window.push("等待玩家加载游戏...");
	$("wait_window").show();

}
//--------------------------------------------------------
// 玩家就绪
//--------------------------------------------------------
function player_ready(readyer_id){
	//暂不设置游戏进度为0时的操作
	if(game_info.game_process==0){
		return;
	}
	var readyer_index=game_info.user_list[readyer_id];
	var readyer=game_info.players[readyer_index];
	his_window.push(readyer.name+" 加载完成","important");
	$("wait_window").hide();
}

function load_ws_function_link(){
	ws.onclose=function(){
		his_window.push("与服务器连接断开","important");
		alert("与服务器连接断开!");
	}
}
//--------------------------------------------------------
// 观众加入
//--------------------------------------------------------
function audience_join(audience_name){
	//发出提示
	if(!$("#hide_audience_mes input").is(":checked")){
		his_window.push(audience_name+" 加入观战","important");
	}
}
//--------------------------------------------------------
// module_ConstVars
// 用于声明常量,注意测试版本与发布版本部分参数的不同
//--------------------------------------------------------
//debug模式
debug=false;
//脱机模式
offline=false;
//测试版本
test_model=false;
//是否使用cdn
use_cdn=true;

//服务器websocket地址
if(test_model){
	websocket_url = "ws://192.168.50.140:80/ws/game_test";
}
else{
	websocket_url = "ws://122.51.21.190:80/ws/game_test";
}
//CDN加速地址
if(use_cdn){
	cdn_url = "http://cdn.newcenturyfans.cn";
}
else{
	cdn_url = "";
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
		available:[]
	},
	trade_items:{
		_give:{
			selected:[],
			available:[]
		},
		_get:{
			selected:[],
			available:[]
		}		
	},
};
//个人标记（默认为第一位玩家）
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
};
score_cards=[
"阿尔忒弥斯神庙",
"牛津大学",
"巴拿马运河",
"紫禁城",
"圣瓦西里大教堂",
];
vp_info_text=[
"拥有的城市：",
"拥有的定居点：",
"最长道路：",
"最大军队：",
"拥有的奇观："
];
//--------------------------------------------------------
// class DataManager
// 统筹游戏数据的载入与解析的模块
//--------------------------------------------------------
function DataManager() {
    throw new Error('This is a static class');
}
//--------------------------------------------------------
// 初始化全局变量
//--------------------------------------------------------
var $gameSystem = null;
var $gamePlayers = null;
var $gameCities = null;
var $gameRoads = null;
var $gameTrades = null;
var $gameBank = null;
//--------------------------------------------------------
// 初始化全局变量
//--------------------------------------------------------
// 以下为旧的全局数据变量,会逐步替代
DataManager.load_old_data = function() {
	game_info=$gameSystem;
	game_info.players          = $gamePlayers;
	game_info.cities           = $gameCities;
	game_info.roads            = $gameRoads;
	game_info.trades           = $gameTrades;
	game_info.cards            = $gameBank;
}
//--------------------------------------------------------
// 将部分不仅限于数据结构的全局变量实例化
//--------------------------------------------------------
DataManager.applyObject = function() {
	//实例化玩家
	for(var player_index in $gamePlayers){
		$gamePlayers[player_index] = new Game_Player($gamePlayers[player_index]);
	}
	//实例化交易
	for(var trade_id in $gameTrades){
		$gameTrades[trade_id] = new Transaction($gameTrades[trade_id]);
	}
	//实例化银行
	$gameBank = new Game_Bank($gameBank);
	//实例化系统
	$gameSystem = new Game_System($gameSystem);
}
//--------------------------------------------------------
// 载入游戏数据
//--------------------------------------------------------
DataManager.extractSaveContents = function(contents) {
	$gameSystem        = contents.system;
    $gamePlayers       = contents.players;
    $gameCities        = contents.cities;
    $gameRoads         = contents.roads;
    $gameTrades        = contents.trades;
    $gameBank          = contents.bank;
    this.applyObject();
    this.load_old_data();
}

//--------------------------------------------------------
// 封装游戏数据
//--------------------------------------------------------
DataManager.makeSaveContents = function() {
	var contents = {}
	contents.system    = $gameSystem;
	contents.players   = $gamePlayers;
	contents.cities    = $gameCities;
	contents.roads     = $gameRoads;
	contents.trades    = $gameTrades;
	contents.bank      = $gameBank;
	return contents;
}
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
		init_webscoket(function(){
			//连接成功后通报全场
			if(user_index==0){
	        	ws.sendmsg("mes_member",{change:"audience_join",value:[user_name]});
			}
			else{
				ws.sendmsg("mes_member",{change:"relink",value:[user_index]});
				
			}
	        //从数据库载入游戏信息
	        request_t_game_info();
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
			//初始化准备状态
			for(player_index in game_info.players){
				ready_list[player_index]=false;
			}
			//创建必要的页面元素
			load_map();
			load_UI();
			//在此处添加页面构造完成以后的代码
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
//根据game_info处理画面的刷新，此部分只能对已经存在的DOM元素进行操作,且不对动画进行处理。
function update_static_Graphic(){
	if(!$gameSystem.is_audience()){
		var self_player=game_info.players[user_index];
		//加载玩家自己所有资源的数字
		for(var i=1;i<6;i++){
			$(".src_"+order[i]).children().filter("truely_own").text(""+self_player[order[i]+"_num"]);
		}
		//刷新选项中的发展卡数量
		$("#action_use_dev_soldier").children().filter(".dev_num").text(""+self_player.soldier_num);
		$("#action_use_dev_plenty").children().filter(".dev_num").text(""+self_player.plenty_num);
		$("#action_use_dev_monopoly").children().filter(".dev_num").text(""+self_player.monopoly_num);
		$("#action_use_dev_road_making").children().filter(".dev_num").text(""+self_player.road_making_num);
		$("#action_show_score_cards").children().filter(".dev_num").text(""+self_player.score_unshown.length);
	}
	//刷新全玩家状态卡
	$("player").each(function(){
		var player_index=$(this).attr("id")
		var player=game_info.players[player_index];
		var attrs=$(this).children();
		attrs.filter("src_state").text(""+all_src_num(player));
		attrs.filter("vp_state").text(""+vp_num(player_index));
		attrs.filter("dev_state").text(""+all_dev_num(player))
		attrs.filter("city0_state").text(""+player.city_num(0))
		attrs.filter("city1_state").text(""+player.city_num(1))
		if(game_info.longest_road==player_index){
			attrs.filter("longest_road").addClass("active");
		}
		else{
			attrs.filter("longest_road").removeClass("active");
		}	
		if(game_info.max_minitory==player_index){
			attrs.filter("max_minitory").addClass("active");
		}
		else{
			attrs.filter("max_minitory").removeClass("active");
		}
		if(player.score_shown.length>0){
			attrs.filter("score_card").addClass("active");
		}
		else{
			attrs.filter("score_card").removeClass("active");
		}	
	});
	//城市形象更新
	$(".city").each(function(){
		var city=game_info.cities[$(this).attr("id")];
		$(this).attr("src","/media/img/city_lv"+city.level+"_"+color_reflection[city.owner]+".png");
	});
	//强盗地点更新
	set_robber(game_info.occupying);
	//最后关闭等待窗口
	if((game_temp.action_now!="action_drop_srcs_for_7") || offline){
		$("wait_window").hide();
	}	
}
//--------------------------------------------------------
// 清除选择器
//--------------------------------------------------------
function clear_selectors(){
	//alert("?");
	//清除块选择器
	$("plc_selector").attr("tip","").removeClass("active selector_available selector_selected selector_disabled selector_displaying").hide();
	//清除边选择器
	$("edge_selector").attr("tip","").removeClass("active selector_available selector_selected selector_disabled selector_displaying").hide();
	//清除边选择器
	$("pt_selector").attr("tip","").removeClass("active selector_available selector_selected selector_disabled selector_displaying").hide();
	//清除玩家选择器
	$("player").removeClass("active player_select_available player_select_selected");
}
//--------------------------------------------------------
// 取消选择器
//--------------------------------------------------------
function cancel_selectors(){
	//清除块选择器
	$("plc_selector").removeClass("selector_selected");
	//清除边选择器
	$("edge_selector").removeClass("selector_selected");
	//清除边选择器
	$("pt_selector").removeClass("selector_selected");
	//清除玩家选择器
	$("player").removeClass("player_select_selected");
}
//--------------------------------------------------------
// 回合轮盘跳转(反复运行直到step_index同步)
// 参数：game_info.step_index
//--------------------------------------------------------
function turn_rounds(){
	var player_list=game_info.player_list;
	var players=game_info.players;
	//加载行动列表
	//确定行动列表宽度
	var step_list=game_info.step_list;
	var step_list_width=parseInt(game_info.step_list.length/2);
	//新建序列元素
	$("step_list").append("<steper pos='"+(step_list_width+1)+"'></steper>");
	//为元素附加基本属性,设置颜色与自我标记
	var new_steper=$("steper").filter(function(){return $(this).attr("pos")==step_list_width+1});
	//alert(new_steper.attr("pos"));
	//alert(last_step_index);
	var step_index=last_step_index+parseInt(new_steper.attr("pos"));
	if(step_index>game_info.step_list.length-1){step_index-=game_info.step_list.length;}
	//获取真·player_index
	player_index=step_list[step_index];
	//alert(user_index);
	if(player_index==user_index){
		new_steper.addClass("self");
	}
	new_steper.css("color",color_reflection_hex[color_reflection[player_index]]);
	new_steper.css({
		"left":45*step_list.length+65,
		"height":"1px",
		"width":"1px"
	});
	//全元素移位(左移、变形)
	$("steper").each(function(){
		//对于ownround右侧的元素,有额外的移位,大小变换,且结束后如果未与step_index同步则再调用一次
		if($(this).attr("pos")=="1"){
			$(this).animate({"left":"-=65px","top":"0","height":"60px","width":"60px"},function(){
				last_step_index++;
				if(last_step_index==game_info.step_list.length){last_step_index=0;}
				//alert(last_step_index);
				if(last_step_index!=game_info.step_index){turn_rounds();}
			});
		}
		//对于ownround的元素,有额外的移位,大小变换
		else if($(this).attr("pos")=="0"){
			$(this).animate({"left":"-=45px","top":"12px","height":"40px","width":"40px"});
			//实际上ownround只在初始化的时候使用过,以后可以考虑初始化也直接用style
			$(this).removeClass("ownround");
		}
		//对于最右侧的(新)元素,有额外的大小变换,边框变换
		else if($(this).attr("pos")==step_list_width+1){
			$(this).animate({"left":"-=45px","height":"40px","width":"40px"});
		}
		//对于最左侧的元素,有额外的大小变换,动画完成后删除自己
		else if($(this).attr("pos")==-(step_list_width)){
			$(this).animate({"left":"-=45px","height":"1px","width":"1px"},function(){$(this).remove()});
		}
		//其余元素仅移位
		else{
			$(this).animate({"left":"-=45px"});
		}
		$(this).attr("pos",parseInt($(this).attr("pos"))-1);
	});
}
//--------------------------------------------------------
// 地图数据加载(含地图UI)
//--------------------------------------------------------
function load_map(){
	//alert(map_info.rand_seed);
	$("#seed_id").text(""+map_info.rand_seed);
	places=map_info.places;
	edges=map_info.edges;
	points=map_info.points;
	harbors=map_info.harbors;
	cities=game_info.cities;
	roads=game_info.roads;
	xsize=map_info.xsize;
	ysize=map_info.ysize;
	set_robber(game_info.occupying);
	//将所有的六边形块放置于正确的位置
	for(var place_id in places){
		var xi=parseInt(place_id/ysize);
		var yi=place_id%ysize;
		var place=places[place_id];
		var x=Math.round(xi*edge_size*1.5);
		var y=Math.round(yi*edge_size*1.732+(xi%2)*0.5*1.732*edge_size);
		var dx=0,dy=0;
		$("#places").append("<img class='plc' id='"+place_id+"' src='"+cdn_url+"/media/img/hexagon.png'/>");
		plc=$(".plc").filter("#"+place_id);
		//放置图块选择器
		plc.after("<plc_selector id='"+place_id+"'></plc_selector>");
		//放置背景图
		plc.after("<img class='backpic' id='"+place_id+"' src='"+cdn_url+"/media/img/"+order[place.create_type]+".png'/>");
		//放置数字图
		if(place.create_num!=0){
			plc.after("<img class='numpic' id='"+place_id+"' src='"+cdn_url+"/media/img/num_"+place.create_num+".png'/>");
		}
		//调整位置
		plc.css({"left":x+"px","top":y+"px","z-index":"500"});
		$("plc_selector").filter("#"+place_id).css({"left":x+"px","top":y+"px","z-index":"2000"});
		$(".backpic").filter("#"+place_id).css({"left":x+"px","top":y+"px","z-index":"200"});
		$(".numpic").filter("#"+place_id).css({"left":x+"px","top":y+"px","z-index":"300"});

	}
	//放置边选择器与道路
	for(var edge_index in edges)
	{
		var edge_id=edges[edge_index];
		var place_id=parseInt(edge_id/3);
		var xi=parseInt(place_id/ysize);
		var yi=place_id%ysize;
		var place=places[place_id];
		var x=Math.round(xi*edge_size*1.5);
		var y=Math.round(yi*edge_size*1.732+(xi%2)*0.5*1.732*edge_size);
		var dx,dy;
		$("#edges").append("<edge_selector class='dir_"+edge_id%3+"' id='"+edge_id+"'></edge_selector>");
		switch(edge_id%3)
		{
			case 0:
				dx=0;
				dy=0;
				break;
			case 1:
				dx=Math.round(0.5*edge_size);
				dy=-6;
				break;
			case 2:
				dx=Math.round(1.5*edge_size);
				dy=0;
				break;
		}
		//放置道路
		if(roads.hasOwnProperty(edge_id))
		{
			add_road(edge_id);
		}
		//调整位置
		$("edge_selector").filter("#"+edge_id).css({"left":(x+dx)+"px","top":(y+dy)+"px","z-index":"3000"})
	}
	//放置点选择器与城市
	for(var pt_index in points)
	{
		var point_id=points[pt_index];
		//alert(point_id)
		var place_id=parseInt(point_id/2);
		var xi=parseInt(place_id/ysize);
		var yi=place_id%ysize;
		var place=places[place_id];
		var x=Math.round(xi*edge_size*1.5);
		var y=Math.round(yi*edge_size*1.732+(xi%2)*0.5*1.732*edge_size);
		var dx,dy;
		$("#points").append("<pt_selector id='"+point_id+"'></pt_selector>");
		switch(point_id%2)
		{
			case 0:
				dx=Math.round(0.5*edge_size)-29;
				dy=-30;
				break;
			case 1:
				dx=Math.round(1.5*edge_size)-28;
				dy=-30;
				break;
		}
		//放置城市
		if(cities.hasOwnProperty(point_id))
		{
			add_city(point_id);
		}
		//调整位置
		$("pt_selector").filter("#"+point_id).css({"left":(x+dx)+"px","top":(y+dy)+"px","z-index":"3000"})
	}
	//放置海港层
	for(var i=0;i<harbors.length;i++)
	{
		var harbor=harbors[i];
		var place_id=harbor.place_id;
		var xi=parseInt(place_id/ysize);
		var yi=place_id%ysize;
		var place=places[place_id];
		var x=Math.round(xi*edge_size*1.5);
		var y=Math.round(yi*edge_size*1.732+(xi%2)*0.5*1.732*edge_size);
		var dx=0,dy=0;
		//放置海港
		$("#harbors").append("<img class='harbor' id='"+i+"' src='"+cdn_url+"/media/img/harbor_"+harbor.direct+".png'/>");
		hbr=$(".harbor").filter("#"+i);
		var num;
		if(harbor.ex_type!=6){
			num=2;
		}
		else{
			num=3;
		}
		//放置数字
		hbr.after("<img class='hb_num' id='"+i+"' src='"+cdn_url+"/media/img/harbor_num"+num+"_"+harbor.direct+".png'/>");
		//放置图标
		hbr.after("<img class='hb_icon' id='"+i+"' src='"+cdn_url+"/media/img/harbor_icon_"+harbor.ex_type+".png'/>");
		switch(harbor.direct){
			case "up":
				dx=182;
				dy=5;
				break;
			case "dn":
				dx=175;
				dy=295;
				break;
			case "lu":
				dx=55;
				dy=73;
				break;
			case "ld":
				dx=52;
				dy=223;
				break;
			case "ru":
				dx=305;
				dy=78;
				break;
			case "rd":
				dx=301;
				dy=227;
				break;
		}
		//调整位置
		var hbx=x-2*edge_size;
		var hby=Math.round(y-1.732*edge_size);
		$(".harbor").filter("#"+i).css({"left":hbx+"px","top":hby+"px","z-index":"400"});
		$(".hb_num").filter("#"+i).css({"left":hbx+"px","top":hby+"px","z-index":"400"});
		$(".hb_icon").filter("#"+i).css({"left":(hbx+dx)+"px","top":(hby+dy)+"px","z-index":"400"});

	}
}
//--------------------------------------------------------
// 游戏数据加载(非地图UI)
//--------------------------------------------------------
function load_UI(){
	var player_list=game_info.player_list;
	var players=game_info.players;
	var self_player=players[user_index];
	//显示回合数
	set_rounds();
	//加载玩家状态栏
	var dy=0;
	if(!$gameSystem.is_audience()){
		dy+=205;
	}	
	for(var player_index in player_list){
		$("#players").append("<player id='"+player_index+"'></player>");
		var player_state=$("player").filter("#"+player_index);
		player_state.append("<img class='player_back' id='"+player_index+"' src='"+cdn_url+"/media/img/player_back_"+color_reflection[player_index]+".png'/>");	
		player_state.append("<playername id='"+player_index+"'>"+player_list[player_index][1]+"</playername>");
		player_state.append("<vp_state id='"+player_index+"'>"+vp_num(player_index)+"</vp_state>");
		player_state.append("<src_state>"+all_src_num(players[player_index])+"</src_state>")
		player_state.append("<dev_state>"+all_dev_num(players[player_index])+"</dev_state>")
		player_state.append("<city0_state>"+city_num(players[player_index],0)+"</city0_state>")
		player_state.append("<city1_state>"+city_num(players[player_index],1)+"</city1_state>")
		player_state.append("<longest_road id='"+player_index+"'></longest_road>")
		player_state.append("<max_minitory id='"+player_index+"'></max_minitory>")
		player_state.append("<score_card id='"+player_index+"'></score_card>")
		//调整位置
		if(player_index==user_index){
			player_state.addClass("self")
			player_state.children().addClass("self");
		}
		else
		{
			player_state.css({"top":dy+"px"});
			dy+=158;
		}	
		//调整颜色
		player_state.css({
			"color":color_reflection_hex[color_reflection[player_index]]
		});	
		//设置激活标记
		if(game_info.longest_road==player_index){$("longest_road").filter("#"+player_index).addClass("active")};
		if(game_info.max_minitory==player_index){$("max_minitory").filter("#"+player_index).addClass("active")};
		if(players[player_index].score_shown!=0){$("score_card").filter("#"+player_index).addClass("active")};	
	}
	//加载交易/舍弃栏资源图标
	for(var i=1;i<1+src_size;i++){
		$("srcs_selected").append("<src_item num='0' class='"+order[i]+"'></src_item>");
		$("srcs_available").append("<src_item num='0' class='"+order[i]+"'></src_item>");
	}
	//加载动态菜单
	//加载港口
	for(var i=1;i<7;i++){
		$("actions2").append("<button trade_target='harbour' target_val='"+i+"' type='button' class='action_prepare_trade list-group-item'>"+order_ch[i]+"港</button>");
	}
	//加载垄断/丰收资源
	for(var i=1;i<6;i++){
		$("actions2").append("<button src_id='"+i+"' type='button' class='src_selector list-group-item'>"+order_ch[i]+"</button>");
	}
	//加载分数卡(在展示分数栏)
	for(let card_name of score_cards){
		$("actions2").append("<button src_id='"+i+"' type='button' class='score_card_selector list-group-item'>"+card_name+"</button>");
	}
	//加载交易玩家
	$("actions2").append("<button trade_target='player' target_val='0' type='button' class='action_prepare_trade list-group-item'>公开交易</button>");
	$("special_actions").append("<button trade_target='player' target_val='0' type='button' class='action_prepare_trade list-group-item'>公开交易</button>");
	for(var player_index in game_info.player_list){
		$("actions2").append("<button trade_target='player' target_val='"+player_index+"' type='button' class='action_prepare_trade list-group-item'>"+game_info.player_list[player_index][1]+"</button>");
		$("special_actions").append("<button trade_target='player' target_val='"+player_index+"' type='button' class='action_prepare_trade list-group-item'>"+game_info.player_list[player_index][1]+"</button>");
	}
	//加载资源栏对象
	create_trade_items();
	//加载文字
	$youziku.submit("playername_update");
}
//--------------------------------------------------------
// 设置强盗
//--------------------------------------------------------
function set_robber(place_id){
	if($("robber").children().length==0){
		$("robber").append("<img src='"+cdn_url+"/media/img/robber.png' style='position:absolute;'>");
	}
	var xi=parseInt(place_id/ysize);
	var yi=place_id%ysize;
	var place=places[place_id];
	var x=Math.round(xi*edge_size*1.5)+45;
	var y=Math.round(yi*edge_size*1.732+(xi%2)*0.5*1.732*edge_size);
	$("robber").children().css({"left":x,"top":y,"z-index":800});
}
//--------------------------------------------------------
// 地图元素增添函数
//--------------------------------------------------------
//--------------------------------------------------------
// 添加道路
//--------------------------------------------------------
function add_road(edge_id){
	var place_id=parseInt(edge_id/3);
	var xi=parseInt(place_id/ysize);
	var yi=place_id%ysize;
	var place=places[place_id];
	var x=Math.round(xi*edge_size*1.5);
	var y=Math.round(yi*edge_size*1.732+(xi%2)*0.5*1.732*edge_size);
	var dx,dy;
	switch(edge_id%3)
	{
		case 0:
			dx=0;
			dy=0;
			break;
		case 1:
			dx=Math.round(0.5*edge_size);
			dy=-6;
			break;
		case 2:
			dx=Math.round(1.5*edge_size);
			dy=0;
			break;
	}
	road=roads[edge_id];
	$("#roads").append("<img class='road' id='"+edge_id+"' src='"+cdn_url+"/media/img/road_dir"+edge_id%3+"_"+color_reflection[road.owner]+".png'/>");
	$(".road").filter("#"+edge_id).css({"left":x+"px","top":y+"px","z-index":"600"});
}
//--------------------------------------------------------
// 添加城市
//--------------------------------------------------------
function add_city(point_id){
	var place_id=parseInt(point_id/2);
	var xi=parseInt(place_id/ysize);
	var yi=place_id%ysize;
	var place=places[place_id];
	var x=Math.round(xi*edge_size*1.5);
	var y=Math.round(yi*edge_size*1.732+(xi%2)*0.5*1.732*edge_size);
	var dx,dy;
	switch(point_id%2)
	{
		case 0:
			dx=Math.round(0.5*edge_size)-29;
			dy=-30;
			break;
		case 1:
			dx=Math.round(1.5*edge_size)-28;
			dy=-30;
			break;
	}
	city=cities[point_id];
	if(city.level==1){
		dx-=10;
	}
	$("#cities").append("<img class='city' id='"+point_id+"' src='"+cdn_url+"/media/img/city_lv"+city.level+"_"+color_reflection[city.owner]+".png'/>");
	//调整位置
	$(".city").filter("#"+point_id).css({"left":(x+dx+15)+"px","top":(y+dy+10)+"px","z-index":"999"});
}

function create_step_list(){
	if(game_UI.hasOwnProperty("step_list_created")){return;}
	//加载行动列表
	//确定行动列表宽度
	var step_list=game_info.step_list;
	var step_list_width=parseInt(game_info.step_list.length/2);
	var dx=0;
	for(var i=-1*step_list_width;i<step_list_width+1;i++)
	{
		$("step_list").append("<steper pos='"+i+"'></steper>");
		$("steper").filter(function(){return $(this).attr("pos")==i}).css({
			"left":dx
		});
		if(i==0){
			//设置计时器
			var this_seteper=$("steper").filter(function(){return $(this).attr("pos")==i})
			$("timer-container").css({"left":this_seteper.position().left,"top":0});
			this_seteper.addClass("ownround");
			dx+=65;
		}
		else{
			dx+=45;
		}
	}
	//设置颜色与自我标记
	$("steper").each(function(){
		var player_index=game_info.step_index+parseInt($(this).attr("pos"));
		if(player_index<0){player_index+=game_info.step_list.length;}
		if(player_index>game_info.step_list.length-1){player_index-=game_info.step_list.length;}
		//干得漂亮(无视我的疯言疯语)
		player_index=step_list[player_index];
		if(player_index==user_index){
			$(this).addClass("self");
		}
		$(this).css("color",color_reflection_hex[color_reflection[player_index]]);
	});	
	game_UI.step_list_created=true;
}
//--------------------------------------------------------
// 添加交易/丢弃单元
//--------------------------------------------------------

function create_trade_items(){
	if(game_UI.hasOwnProperty("trade_items_created")){return;}
	for(var src_id=1;src_id<6;src_id++){
		var src_name=order[src_id];
		var src_num=0;

		var menu1=["give","get"];
		var menu2=["selected","available"];

		for(var v1 in menu1){
			for(var v2 in menu2){
				//0,0:给予栏选中 0,1：给予栏备选 1,0:索取栏选中 1,1:索取栏备选
				var jqitem=$("trade_window src_select_window."+menu1[v1]+" srcs_"+menu2[v2]+" ."+src_name);
				if(v2==0){
					var a_selected_item=new Selected_Trade_item(jqitem,null,src_name,menu1[v1]);
					var item=a_selected_item;
				}
				else{
					var a_available_item_item=new Available_Trade_item(jqitem,a_selected_item,src_name,menu1[v1]);
					a_selected_item.rlt_item=a_available_item_item;
					var item=a_available_item_item;
				}				
				jqitem.attr("id",game_UI.UI_count);
				game_UI[game_UI.UI_count]=item;
				game_UI_list.trade_items["_"+menu1[v1]][menu2[v2]].push(game_UI.UI_count);
				game_UI.UI_count++;
			}
		}
	}
	game_UI.trade_items_created=true;
}

//--------------------------------------------------------
// 设置回合数
//--------------------------------------------------------
function set_rounds(){
	if($gameSystem.play_turns<100){
		$("#rounds").text(('00'+$gameSystem.play_turns).slice(-2));
	}
	else{
		$("#rounds").text(''+$gameSystem.play_turns);
	}
	
}
//用于处理地图的点、边、块的抽象关系的模块。
//--------------------------------------------------------
// 计算最长道路
// 算法：dfs搜索以每条边为起点的最长路径,再在里面选最长。
//--------------------------------------------------------
function cal_longest_road(player_index){
	var roads=all_roads(player_index);
	var pathes=[];
	//第一遍
	for(road_index in roads){
		var road_id=roads[road_index];
		var path=[road_id];
		//his_window.push("初始搜索"+road_id)
		path=dp_search_road(path,player_index);
		pathes.push(path.concat());
	}
	var max_index=0;
	var max_length=0;
	for(var path_index in pathes){
		if(pathes[path_index].length>max_length){
			max_length=pathes[path_index].length;
			max_index=path_index;
		}
	}
	//his_window.push("-------搜索结束---------")
	if(pathes[max_index]==null){
		return [];
	}
	else{
		return pathes[max_index];
	}
}
//--------------------------------------------------------
// 深度搜索
// 特殊1：游戏规则中,道路的连接点如果有其他人的城市的话就会断开。
// 骑士拓展中,有其他玩家的骑士一样。
// 特殊2：除第一条边,其他边寻找相邻边时，不能找来路那条边(Y字形不能从左上往下经过一竖后再去右上)
//--------------------------------------------------------
function dp_search_road(path_now,player_index,from_pt=null){
	var edge_now=path_now[path_now.length-1];
	var edges_round=edge_round_edges_with_pt(edge_now,"road_self");
	var pathes=[];
	var ever_searched=false;
	//不记录被其他玩家占据的节点以及来路的交点
	//his_window.push("---新的搜索,目前路径："+JSON.stringify(path_now)+"---");
	//his_window.push("边"+edge_now+"有以下两个点：");
	for(var point_id in edges_round){
		if(game_info.cities.hasOwnProperty(point_id)){
			if(game_info.cities[point_id].owner!=player_index){
				//his_window.push("点"+point_id+"被放弃,因为被占据");
				continue;
			}
		}
		if(point_id==from_pt){
			//his_window.push("点"+point_id+"被放弃,因为从这里来");
			continue;
		}
		//除已经过的边,进行深度搜索
		var edges_next=edges_round[point_id];
		//his_window.push("点"+point_id+"有以下可用边：");
		for(edge_index in edges_next){
			var edge_id=edges_next[edge_index];
			if(path_now.indexOf(edge_id)==-1){
				ever_searched=true;
				//his_window.push("从"+point_id+"节点向"+edge_id+"搜索")
				pathes.push(dp_search_road(path_now.concat(edge_id),player_index,point_id));
			}
		}
	}
	//已没有可以探寻的边,则返回当前的道路
	if(ever_searched==false){
		//his_window.push("没有可以走的道路,返回")
		return path_now;
	}
	//从遍历的道路中选择最长的一条返回
	var max_index=0;
	var max_length=0;
	for(var path_index in pathes){
		if(pathes[path_index].length>max_length){
			max_length=pathes[path_index].length;
			max_index=path_index;
		}
	}
	if(pathes[max_index]==null){
		return [];
	}
	else{
		return pathes[max_index];
	}
}
//--------------------------------------------------------
// 获取玩家可设置强盗的地块
//--------------------------------------------------------
function available_places(){
	//只需要删除有强盗的地块即可
	var places=[];
	for(var place_id in map_info.places){
		if(place_id!=game_info.occupying){
			places.push(parseInt(place_id));
		}
	}
	return places;
}
//--------------------------------------------------------
// 获取玩家可修路的边
// 要求：玩家所有的道路附近的边+玩家所有定居点、城市附近的边
// temp_edge:额外考虑temp_edge
//--------------------------------------------------------
function available_edges(player_index,temp_edge=[]){
	return sQuery("edge",$gamePlayers[player_index].own_roads).union(temp_edge).near_points()
	.not(function(point_id){
		return $gameCities.hasOwnProperty(point_id);
	}).near_edges().union(sQuery("point",$gamePlayers[player_index].own_cities).near_edges())
	.not($gamePlayers[player_index].own_roads).get_list();
}
//--------------------------------------------------------
// 获取玩家可定居的点
// 要求：玩家所有的道路附近的点,且这些点以及附近不能有任何人的定居点、城市
//--------------------------------------------------------
function available_points(player_index){
	return sQuery("edge",$gamePlayers[player_index].own_roads).near_points()
	.not(function(point_id){
		if($gameCities.hasOwnProperty(point_id)){
			return true;
		}
		for(let pt_id of sQuery("point",point_id).near_points().get_list()){
			if($gameCities.hasOwnProperty(pt_id)){
				return true;
			}
		}
		return false;
	}).get_list();
}
//--------------------------------------------------------
// 获取玩家可定居的点(开局时)
// 要求：所有点,但这些点以及附近不能有任何人的定居点、城市
//--------------------------------------------------------
function available_points_st(player_index){
	return sQuery("point",$gameSystem.all_points()).not(function(point_id){
		if($gameCities.hasOwnProperty(point_id)){
			return true;
		}
		for(let pt_id of sQuery("point",point_id).near_points().get_list()){
			if($gameCities.hasOwnProperty(pt_id)){
				return true;
			}
		}
		return false;
	}).get_list();
}
//--------------------------------------------------------
// 获取骑士能够移动的地方
// 没有实装,就爽爽sQuery
//--------------------------------------------------------
function available_saber_move_points(player_index,saber_id,initiative=false){
	return sQuery("edge",$gamePlayers[player_index].own_roads).near_points()
	.not(function(point_id){
		return $gameCities.hasOwnProperty(point_id);
	}).not($gameSabers[saber_id].occupying)
	.not(function(point_id){
			if($gameSabers.map.hasOwnProperty(point_id)){
				if(initiative && $gameSabers[saber_id].level > $gameSabers.map[point_id].level){
					return false;
				}
			}
			return true;
	}).get_list();
}
//--------------------------------------------------------
// 获取商队能够放置的地方
// 没有实装,就爽爽sQuery
//--------------------------------------------------------
function available_merchant_set_points(player){
	return sQuery("points",player.own_cities).near_places().get_list();
}
//--------------------------------------------------------
// 获取玩家所有城市
//--------------------------------------------------------
function all_cities(player_index){
	var cities=[];
	for(var city_id in game_info.cities){
		if(game_info.cities[city_id].owner==player_index){
			cities.push(city_id);
		}
	}
	return cities;
}
//--------------------------------------------------------
// 获取地块对应方向的地块id
// place_id：地块id ,dir：方向 0~5从上顺时针计数
//--------------------------------------------------------
function plc_near_places(place_id,dir=[0,1,2,3,4,5]){
	place_id=parseInt(place_id);
	var is_single=false;
	//非str视为数组
	if(typeof(dir)!="object"){
		is_single=true;
		need=[dir];
	}
	else{
		need=dir;
	}
	//输入检查
	if(isNaN(place_id)){
		if(is_single){
			return null;
		}
		else{
			return [];
		}	
	}
	var xi=parseInt(place_id/ysize);
	var yi=place_id%ysize;
	var places=[];
	for(i in need){
		switch(parseInt(need[i])){
			case 0:
				places.push(place_id-1);
				break;
			case 1:
				places.push((xi+1)*ysize+yi+xi%2-1);
				break;
			case 2:
				places.push((xi+1)*ysize+yi+xi%2);
				break;
			case 3:
				places.push(place_id+1);
				break;
			case 4:
				places.push((xi-1)*ysize+yi+xi%2);
				break;
			case 5:
				places.push((xi-1)*ysize+yi+xi%2-1);
				break;
		}
	}
	//删除不存在的地块
	//因为代码的特殊性,即使不存在的地块也可以调用,逻辑为单地块则不删除
	if(is_single){
		return places[0];
	}
	var i=0;
	while(i<places.length){
		if(map_info.places.hasOwnProperty(places[i])==false){
			places.splice(i,1);
			continue;
		}
		i++;			
	}
	return places;
}
//--------------------------------------------------------
// 获取地块对应方向的边id
// place_id：地块id ,dir：方向 0~5从上顺时针计数
//--------------------------------------------------------
function plc_round_edges(place_id,dir=[0,1,2,3,4,5]){
	place_id=parseInt(place_id);
	var is_single=false;
	//非str视为数组
	if(typeof(dir)!="object"){
		is_single=true;
		need=[dir];
	}
	else{
		need=dir;
	}
	//输入检查
	if(isNaN(place_id)){
		if(is_single){
			return null;
		}
		else{
			return [];
		}	
	}
	var xi=parseInt(place_id/ysize);
	var yi=place_id%ysize;
	var edges=[];
	for(i in need){
		switch(parseInt(need[i])){
			case 0:
				edges.push(3*place_id+1);
				break;
			case 1:
				edges.push(3*place_id+2);
				break;
			case 2:
				edges.push(3*plc_near_places(place_id,2));
				break;
			case 3:
				edges.push(3*(place_id+1)+1);
				break;
			case 4:
				//alert("?");
				//alert(place_id);
				//alert(plc_near_places(place_id,4));
				//alert(3*plc_near_places(place_id,4)+2);
				edges.push(3*plc_near_places(place_id,4)+2);
				break;
			case 5:
				edges.push(3*place_id);
				break;
		}
	}
	//删除不存在的边
	var i=0;
	while(i<edges.length){
		if(map_info.edges.indexOf(edges[i])==-1){
			edges.splice(i,1);
			continue;
		}
		i++;			
	}
	if(is_single){
		return edges[0];
	}
	else
	{
		return edges;
	}
}
//--------------------------------------------------------
// 获取地块对应的所有点的id
// place_id：地块id
//--------------------------------------------------------
function plc_round_points(place_id){
	var x=parseInt(place_id/ysize);
	//输入检查
	if(isNaN(place_id)){
		return [];
	}
	var y=place_id%ysize;
	var place_id=parseInt(place_id);
	var points=[place_id*2,place_id*2+1,place_id*2+2,place_id*2+3,(place_id-ysize+x%2)*2+1,(place_id+ysize+x%2)*2]
	//删除不存在的点
	var i=0;
	while(i<points.length){
		if(map_info.points.indexOf(points[i])==-1){
			points.splice(i,1);
			continue;
		}
		i++;			
	}
	//alert(points);
	return points;
}
//--------------------------------------------------------
// 获取一条边周围所有边的id
// edge_id：边id
// type：边的类型：edge 默认值所有边,blank_edge 未有道路的边,road 有道路的边,road_self 有自己的道路的边
//--------------------------------------------------------
function edge_round_edges(edge_id,type="edge"){
	var need;
	switch(type){
		case "edge":
			need=3;
			break;
		case "blank_edge":
			need=2;
			break;
		case "road":
			need=1;
			break;
		case "road_self":
			need=0;
			break;
	}
	//输入检查
	edge_id=parseInt(edge_id);
	if(isNaN(edge_id)){
		return [];
	}
	var place_id=parseInt(edge_id/3);
	var xi=parseInt(place_id/ysize);
	var yi=place_id%ysize;
	var dir=edge_id%3;
	var edges;
	if(dir==0){
	edges=[edge_id+1,3*((xi-1)*ysize+yi+xi%2-1)+2,3*((xi-1)*ysize+yi+xi%2)+1,3*((xi-1)*ysize+yi+xi%2)+1];
	}
	else if(dir==1){
		edges=[edge_id-1,edge_id+1,3*((xi-1)*ysize+yi+xi%2-1)+2,3*((xi+1)*ysize+yi+xi%2-1)];
	}
	else{
		edges=[edge_id-1,3*((xi+1)*ysize+yi+xi%2-1),3*((xi+1)*ysize+yi+xi%2),3*((xi+1)*ysize+yi+xi%2)+1];
	}
	//删除不存在的边
	var i=0;
	while(i<edges.length){
		if(map_info.edges.indexOf(edges[i])==-1){
			edges.splice(i,1);
			continue;
		}
		i++;			
	}
	if(need==3){return edges;}
	var self_edge_owner;
	if(game_info.roads.hasOwnProperty(edge_id)){
		self_edge_owner=game_info.roads[edge_id].owner;
	}
	else if(need==0){need=2;}
	//删除不符合要求的边
	while(i<edges.length){
		if(game_info.roads.hasOwnProperty(edges[i])){
			if(need==2)
			{
				edges.splice(i,1);
				continue;
			}
			else if(game_info.roads[edges[i]].owner!=self_edge_owner && need==0){
				edges.splice(i,1);
				continue;
			}	
		}
		else if(need==0 || need==1){
			kid_edges.splice(i,1);
			continue;
		}
		i++;			
	}
	return edges;
}
//--------------------------------------------------------
// 以节点为基础,获取一条边周围所有边的id
// edge_id：边id
// type：边的类型：edge 默认值 所有边,blank_edge 未有道路的边,road 有道路的边,road_self 有自己的道路的边
//--------------------------------------------------------
function edge_round_edges_with_pt(edge_id,type="edge"){
	var need;
	switch(type){
		case "edge":
			need=3;
			break;
		case "blank_edge":
			need=2;
			break;
		case "road":
			need=1;
			break;
		case "road_self":
			need=0;
			break;
	}
	//输入检查
	edge_id=parseInt(edge_id);
	if(isNaN(edge_id)){
		return [];
	}
	var place_id=parseInt(edge_id/3);
	var xi=parseInt(place_id/ysize);
	var yi=place_id%ysize;
	var dir=edge_id%3;
	var edges;
	edges={};
	if(dir==0){
		edges[2*place_id]=[edge_id+1,3*((xi-1)*ysize+yi+xi%2-1)+2];
		edges[2*((xi-1)*ysize+yi+xi%2)+1]=[3*((xi-1)*ysize+yi+xi%2)+1,3*((xi-1)*ysize+yi+xi%2)+2];
	}
	else if(dir==1){
		edges[2*place_id]=[edge_id-1,3*((xi-1)*ysize+yi+xi%2-1)+2];
		edges[2*place_id+1]=[edge_id+1,3*((xi+1)*ysize+yi+xi%2-1)];
	}
	else{
		edges[2*place_id+1]=[edge_id-1,3*((xi+1)*ysize+yi+xi%2-1)];
		edges[2*((xi+1)*ysize+yi+xi%2)]=[3*((xi+1)*ysize+yi+xi%2),3*((xi+1)*ysize+yi+xi%2)+1];
	}
	//删除不存在的边
	for(var edges_index in edges)
	{
		var i=0;
		var t_edges=edges[edges_index];
		while(i<t_edges.length){
			if(map_info.edges.indexOf(t_edges[i])==-1){
				t_edges.splice(i,1);
				continue;
			}
			i++;			
		}
	}
	if(need==3){return edges;}
	var self_edge_owner;
	if(game_info.roads.hasOwnProperty(edge_id)){
		self_edge_owner=game_info.roads[edge_id].owner;
	}
	else if(need==0){need=2;}
	//删除不符合要求的边
	for(point_id in edges){
		var kid_edges=edges[point_id];
		var i=0;
		while(i<kid_edges.length){
			if(game_info.roads.hasOwnProperty(kid_edges[i])){
				if(need==2)
				{
					kid_edges.splice(i,1);
					continue;
				}
				else if(game_info.roads[kid_edges[i]].owner!=self_edge_owner && need==0){
					kid_edges.splice(i,1);
					continue;
				}	
			}
			else if(need==0 || need==1){
				kid_edges.splice(i,1);
				continue;
			}
			i++;	
		}			
	}
	return edges;
}

//--------------------------------------------------------
// 获取一条边端点的id
// edge_id：边id
//--------------------------------------------------------
function edge_round_points(edge_id){
	//输入检查
	edge_id=parseInt(edge_id);
	if(isNaN(edge_id)){
		return [];
	}
	var place_id=parseInt(edge_id/3);
	var points;
	switch(edge_id%3){
		case 0:
			points=[2*place_id,2*plc_near_places(place_id,4)+1];
			break;
		case 1:
			points=[2*place_id,2*place_id+1];
			break;
		case 2:
			points=[2*place_id+1,2*plc_near_places(place_id,2)];
	}
	//his_window.push("边"+edge_id+"周围的点id："+JSON.stringify(points));
	//删除不存在的点
	var i=0;
	while(i<points.length){
		if(map_info.points.indexOf(points[i])==-1){
			points.splice(i,1);
			continue;
		}
		i++;			
	}
	return points;
}
//--------------------------------------------------------
// 获取一个点周围所有地块的id
// point_id：点id
//--------------------------------------------------------
function pt_round_places(point_id){
	point_id=parseInt(point_id);
	//检查输入
	if(isNaN(point_id)){
		return [];
	}
	var place_id=parseInt(point_id/2);
	var xi=parseInt(place_id/ysize);
	var yi=place_id%ysize;
	var pos=point_id%2;
	var places;
	if(pos==0){
		places=union([place_id],plc_near_places(place_id,[0,5]));
	}
	else{
		places=union([place_id],plc_near_places(place_id,[0,1]));
	}
	//删除不存在的块
	var i=0;
	while(i<places.length){
		if(map_info.places.hasOwnProperty(places[i])==-1){
			places.splice(i,1);
			continue;
		}
		i++;			
	}
	return places;
}
//--------------------------------------------------------
// 获取一个点周围所有边的id
// point_id：点id
//--------------------------------------------------------
function pt_round_edges(point_id){
	point_id=parseInt(point_id);
	//检查输入
	if(isNaN(point_id)){
		return [];
	}
	var place_id=parseInt(point_id/2);
	var xi=parseInt(place_id/ysize);
	var yi=place_id%ysize;
	var pos=point_id%2;
	var edges;
	if(pos==0){
		edges=[3*place_id,3*place_id+1,3*((xi-1)*ysize+yi-1+xi%2)+2];
	}
	else{
		edges=[3*place_id+1,3*place_id+2,3*((xi+1)*ysize+yi-1+xi%2)];
	}
	//删除不存在的边
	var i=0;
	while(i<edges.length){
		if(map_info.edges.indexOf(edges[i])==-1){
			edges.splice(i,1);
			continue;
		}
		i++;			
	}
	return edges;
}
//--------------------------------------------------------
// 获取一个点周围所有点的id
// point_id：点id
//--------------------------------------------------------
function pt_round_points(point_id){
	point_id=parseInt(point_id);
	//检查输入
	if(isNaN(point_id)){
		return [];
	}
	var place_id=parseInt(point_id/2);
	var points;
	if(point_id%2==0){
		points=[point_id+1,2*plc_near_places(place_id,5)+1,2*plc_near_places(place_id,4)+1];
	}
	else{
		points=[point_id-1,2*plc_near_places(place_id,1),2*plc_near_places(place_id,2)];
	}
	//删除不存在的点
	var i=0;
	while(i<points.length){
		if(map_info.points.indexOf(points[i])==-1){
			points.splice(i,1);
			continue;
		}
		i++;			
	}
	return points;
}
//--------------------------------------------------------
// 地图选择器集合
// 用于为快速筛选合适的选择器提供解决方案
//--------------------------------------------------------
function sQuery(type,input_id_list=[]){
	//检查输入
	var id_list = SelectorQuery.prototype.check_input(input_id_list);
	//去除重复
	var vis={};
	var new_id_list=[];
	for(let i of id_list){
		if(!vis.hasOwnProperty(i)){
			new_id_list.push(i);
			vis[i]=true;
		}
	}
	//生成并返回对象
	return new SelectorQuery(type,new_id_list);
}
function SelectorQuery(type,id_list){
	this.type = type;
	this.id_list = id_list;
}
//--------------------------------------------------------
// 获取列表
//--------------------------------------------------------
SelectorQuery.prototype.get_list =function(){
	return this.id_list;
}
//--------------------------------------------------------
// 检查输入,并转化为Array
// 支持输入：数字、数组、SQ对象
//--------------------------------------------------------
SelectorQuery.prototype.check_input = function(obj){
	var new_list;
	if(typeof(obj) == "number"){
		new_list=[obj];
	}
	else if(obj instanceof SelectorQuery){
		new_list=obj.get_list();
	}
	else{
		new_list=obj;
	}
	return new_list;
};
//--------------------------------------------------------
// 并入SQ
// 支持输入：数字、数组、SQ对象
//--------------------------------------------------------
SelectorQuery.prototype.union = function(input_list){
	//检查输入
	var other_list = this.check_input(input_list);
	this.id_list = this.id_list.concat(other_list.filter(function(v) {
        return this.id_list.indexOf(v) === -1},this));
	return this;
};
//--------------------------------------------------------
// 条件筛选函数
// 支持输入：数字、数组、SQ对象、函数
//--------------------------------------------------------
SelectorQuery.prototype.filter = function(input_request){
	//检查输入
	//函数的话,遍历并根据返回值进行筛选
	if(typeof(input_request) == "function"){
		this.id_list=this.id_list.filter(function(v){
			return input_request(v);
		});
	}
	//其他的,转换为列表后使用
	else{
		var other_list = this.check_input(input_request);
		this.id_list = this.id_list.filter(function(v){
			return other_list.indexOf(v)!=-1;
		});
	}
	return this;	
};
//--------------------------------------------------------
// 条件反筛函数
// 支持输入：数字、数组、SQ对象、函数
//--------------------------------------------------------
SelectorQuery.prototype.not = function(input_request){
	//检查输入
	//函数的话,遍历并根据返回值进行筛选
	if(typeof(input_request) == "function"){
		this.id_list=this.id_list.filter(function(v){
			return !input_request.call(this,v);
		},this);
	}
	//其他的,转换为列表后使用
	else{
		var other_list = this.check_input(input_request);
		this.id_list = this.id_list.filter(function(v){
			return other_list.indexOf(v)==-1;
		});
	}
	return this;	
};
//--------------------------------------------------------
// 获取周围的地块
//--------------------------------------------------------
SelectorQuery.prototype.near_places = function(){
	//不同的SQ有不同的获取方式
	var places = [];
	switch(this.type){
	case "place":
		for(let place_id of this.id_list){
			places = union(places,plc_near_places(place_id));
		}
		break;
	case "edge":
		for(let edge_id of this.id_list){
			places = union(places,edge_round_places(edge_id));
		}
		break;
	case "point":
		for(let point_id of this.id_list){
			places = union(places,pt_round_places(point_id));
		}
		break;
	}
	this.type = "place";
	this.id_list=places;
	return this;
};
//--------------------------------------------------------
// 获取周围的边
//--------------------------------------------------------
SelectorQuery.prototype.near_edges = function(){
	//不同的SQ有不同的获取方式
	var edges = [];
	switch(this.type){
	case "place":
		for(let place_id of this.id_list){
			edges = union(edges,plc_round_edges(place_id));
		}
		break;
	case "edge":
		for(let edge_id of this.id_list){
			edges = union(edges,edge_round_edges(edge_id));
		}
		break;
	case "point":
		for(let point_id of this.id_list){
			edges = union(edges,pt_round_edges(point_id));
		}
		break;
	}
	this.type = "edge";
	this.id_list=edges;
	return this;
};
//--------------------------------------------------------
// 获取周围的点
//--------------------------------------------------------
SelectorQuery.prototype.near_points = function(){
	//不同的SQ有不同的获取方式
	var points = [];
	switch(this.type){
	case "place":
		for(let place_id of this.id_list){
			points = union(points,plc_round_points(place_id));
		}
		break;
	case "edge":
		for(let edge_id of this.id_list){
			points = union(points,edge_round_points(edge_id));
		}
		break;
	case "point":
		for(let point_id of this.id_list){
			points = union(points,pt_round_points(point_id));
		}
		break;
	}
	this.type = "point";
	this.id_list=points;
	return this;
};
//玩家的类
class Game_Player{
	//--------------------------------------------------------
	// 初始化,载入数据
	//--------------------------------------------------------
	constructor(static_player){
		for(let attr of Object.keys(static_player)){
			this[attr]=static_player[attr];
		}
		this.name=$gameSystem.player_list[this.index][1];
		this.vp_update();
	}
	//--------------------------------------------------------
	// 获取资源数
	// 可以使用资源id或资源名来获取,且可以使用操作符进行数量修改
	// show:使用自动消息来提示
	//--------------------------------------------------------
	src(src_name,op="null",op_num="null",show=true){
		var src_id = null;
		if(/^[0-9]+$/.test(src_name)){
			src_id = src_name;
			src_name=order[src_name];
		}
		else{src_id = src_reflection[src_name];}
		if(typeof(op)=="number"){
			op_num=op;
			op="=";
		}
		if(op_num=="null"){
			return this[src_name+"_num"];
		}
		var src_change = 0;	
		switch(op){		
		case "null":
			src_change = op_num - this[src_name+"_num"];
			if(show){his_window.player_get_item(this,src_id,src_change);}
			this[src_name+"_num"]=op_num;
			break;
		case "=":
			src_change = op_num - this[src_name+"_num"];
			if(show){his_window.player_get_item(this,src_id,src_change);}
			this[src_name+"_num"]=op_num;
			break;
		case "+=":
			this[src_name+"_num"]+=op_num;
			if(show){his_window.player_get_item(this,src_id,op_num);}
			break;
		case "-=":
			this[src_name+"_num"]-=op_num;
			if(show){his_window.player_get_item(this,src_id,op_num);}
			break;
		}
		return this[src_name+"_num"];
	}
	//--------------------------------------------------------
	// 获取总资源数
	//--------------------------------------------------------
	all_src_num(){
		return this.src("brick")+this.src("wood")+this.src("wool")+this.src("grain")+this.src("ore");
	}
	//--------------------------------------------------------
	// 获取发展卡数
	// 可以使用发展卡名称来获取,且可以使用操作符进行数量修改
	//--------------------------------------------------------
	dev(dev_name,op="null",op_num="null"){
		if(typeof(op)=="number"){
			op_num=op;
			op="=";
		}
		if(op_num=="null"){
			return this[dev_name+"_num"];
		}
		switch(op){
			case "null":
				this[dev_name+"_num"]=op_num;
				break;
			case "=":
				this[dev_name+"_num"]=op_num;
				break;
			case "+=":
				this[dev_name+"_num"]+=op_num;
				break;
			case "-=":
				this[dev_name+"_num"]-=op_num;
				break;
		}
		return this[dev_name+"_num"];
	}
	//--------------------------------------------------------
	// 更新胜利点数
	// truth：包括隐藏的分数卡
	//--------------------------------------------------------
	vp_update(truth=false){
		var info=[0,0,0,0,0];
		var all_cities=$gameCities;
		for(let city_id of this.own_cities){
			//仅适用于原版
			info[1-$gameCities[city_id].level]+=($gameCities[city_id].level+1);
		}
		if(this.index==$gameSystem.longest_road){
			info[2]+=2;
		}
		if(this.index==$gameSystem.max_minitory){
			info[3]+=2;
		}
		if(truth){
			info[4]+=(this.score_shown.length+this.score_unshown.length);
		}
		else{
			info[4]+=this.score_shown.length;
		}
		var vp_sum=0;
		for(var i in info){
			vp_sum+=info[i];
		}
		this.vp=vp_sum;	
		return this.vp;
	}
	//--------------------------------------------------------
	// 展示分数卡
	//--------------------------------------------------------
	show_score_cards(target="all"){
		if(target=="all"){
			this.score_shown=this.score_shown.concat(this.score_unshown);
			this.score_unshown.length=0;
		}
		else{
			this.score_shown=this.score_shown.concat(target);
			for(let one of target){
				this.score_unshown.splice(this.score_unshown.indexOf(one));
			}		
		}
	}
	//--------------------------------------------------------
	// 获取城市数
	// lv:城市的等级 type:返回数量或数组
	//--------------------------------------------------------
	city_num(lv="all",type="count"){
		var cities=[];
		for(let city_id of this.own_cities){
			if(lv=="all" || $gameCities[city_id].level==lv){
				cities.push(city_id);
			}
		}
		if(type=="count"){
			return cities.length;
		}
		if(type=="all"){
			return cities;
		}
	}
	//--------------------------------------------------------
	// 检查资源的丢弃,如果没有丢出7不要
	//--------------------------------------------------------
}
//--------------------------------------------------------
// class Game_System
// 处理游戏整体数据
//--------------------------------------------------------
class Game_System{
	//--------------------------------------------------------
	// 初始化,载入数据
	//--------------------------------------------------------
	constructor(static_system){
		for(let attr of Object.keys(static_system)){
			this[attr]=static_system[attr];
		}
	}
	//--------------------------------------------------------
	// 判定是否是自己的回合
	//--------------------------------------------------------
	is_own_turn(){
		if(this.is_audience()){return false;}
		return user_index == this.step_list[this.step_index];
	}
	//--------------------------------------------------------
	// 判定是否是观众
	//--------------------------------------------------------
	is_audience(){
		return user_index == 0;
	}
	//--------------------------------------------------------
	// 判定是否是房主
	//--------------------------------------------------------
	is_room_owner(){
		return user_index == 1;
	}
	//--------------------------------------------------------
	// 获取本人对应的玩家
	//--------------------------------------------------------
	self_player(){
		return $gamePlayers[user_index];
	}
	//--------------------------------------------------------
	// 获取当前行动中的玩家
	//--------------------------------------------------------
	active_player(){
		return $gamePlayers[this.step_list[this.step_index]];
	}
	//--------------------------------------------------------
	// 获取所有城市的数组
	//--------------------------------------------------------
	all_cities(){
		return Object.keys($gameCities).map(Number);
	}
	//--------------------------------------------------------
	// 获取所有道路的数组
	//--------------------------------------------------------
	all_roads(){
		return Object.keys($gameRoads).map(Number);
	}
	//--------------------------------------------------------
	// 获取所有点的数组
	//--------------------------------------------------------
	all_points(){
		return map_info.points;
	}
	//--------------------------------------------------------
	// 获取所有边的数组
	//--------------------------------------------------------
	all_edges(){
		return map_info.edges;
	}
	//--------------------------------------------------------
	// 获取所有地块的数组
	//--------------------------------------------------------
	all_palces(){
		return Object.keys(map_info.places).map(Number);
	}
	//--------------------------------------------------------
	// 同步操作完成人数
	//--------------------------------------------------------
	msg_recive(player_index){
		//每次删除一个已经确认了行动的玩家,如果列表清空,则说明全部行动完成
		var index = this.recive_list.indexOf(player_index);
		//已删除则无视
		if(index!=-1){
			this.recive_list.splice(index,1);
		}		
		return this.recive_list.length==0 || offline;
	}
}
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
	var init_give_items_available=[];
	var init_wonder_items_available=[];
	var self_player=game_info.players[user_index];
	var starter_cards=self_player;
	var accepter_cards=game_info.cards;
	var action_text;
	var head_text;
	var trade_state="";
	var person="你";
	var trade_ratio=1;
	var trades=game_info.trades;
	var can_trade=true;
	var secret;
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
			init_wonder_items_available.push(1,2,3,4,5);
			init_give_items_available.push(1,2,3,4,5);
			break;
		//港口,实际交易目标还是银行
		case "harbour":
			game_temp.trade_now_id=0;
			game_temp.trade_target="bank";
			action_text="发起交易";
			if(target_val=="6"){
				trade_ratio=3;
				init_give_items_available.push(1,2,3,4,5);
				head_text="与"+order_ch[target_val]+"港交易 3:1";
			}
			else{
				trade_ratio=2;
				init_give_items_available.push(parseInt(target_val));
				head_text="与"+order_ch[target_val]+"港交易 2:1";
			}
			init_wonder_items_available.push(1,2,3,4,5);
			break;
		//玩家,交易的各个选项都不受限制,且出于资源保密,会设置不显示资源数
		case "player":
		    secret=target_val==0?true:game_info.players[target_val].src_secret;
			//检查是否有target玩家发起给本机玩家的进行中交易
			var recive_trade_id=target_val*(Object.keys(game_info.players).length+1)+user_index;
			if(game_info.active_trades.indexOf(recive_trade_id)==-1){
				//没有则认为是在向target发起交易
				game_temp.trade_now_id=user_index*(Object.keys(game_info.players).length+1)+target_val;
				starter_cards=game_info.players[user_index];
				accepter_cards=secret?unknown_cards:game_info.players[target_val];
			}
			else{
				game_temp.trade_now_id=recive_trade_id;
				starter_cards=secret?unknown_cards:game_info.players[target_val];
				accepter_cards=game_info.players[user_index];
				person="他";
			}				
			action_text="发起交易";
			trade_ratio=1;
			init_give_items_available.push(1,2,3,4,5);
			init_wonder_items_available.push(1,2,3,4,5);
			if(target_val=="0"){
				head_text=game_info.players[target_val].name+" 的公开交易"
			}
			else{
				head_text="与 "+game_info.player_list[target_val][1]+" 交易";
			}	
			break;
	}
	//设置已选择资源
	var trade=trades[game_temp.trade_now_id];
	//如果并非正在进行的交易,对交易内容进行初始化(对于银行的交易一定生效)	
	if(game_info.active_trades.indexOf(game_temp.trade_now_id)==-1){		
		trade.clear();
	}
	else{
		if(trade.starter==user_index){
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
	items=game_UI_list.trade_items._give.available;
	for(var i=0;i<items.length;i++){
		var UI_id=items[i];
		var item=game_UI[UI_id];
		//如果目标玩家选择保密自己的资源数,则应用secret属性
		item.secret=(game_temp.trade_target=="player" && person=="他")?secret:false;
		if(init_give_items_available.indexOf(src_reflection[item.item_type])==-1){
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
	items=game_UI_list.trade_items._get.available;
	for(var i=0;i<items.length;i++){
		var UI_id=items[i];
		var item=game_UI[UI_id];
		item.ratio_num=1;
		//如果目标玩家选择保密自己的资源数,则应用secret属性
		item.secret=(game_temp.trade_target=="player" && person=="你")?secret:false;
		if(init_wonder_items_available.indexOf(src_reflection[item.item_type])==-1){
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
		if(item.own_num<0){can_trade=false;}
		item.jqdom_update();
	}
	if(game_info.active_trades.indexOf(game_temp.trade_now_id)==-1){
		can_trade=false;			
	}
	else{
		$("#action_trade_items").text("取消交易");
	}
	can_trade?$("#action_trade_items").removeClass("disabled"):$("#action_trade_items").addClass("disabled");	
	$("trade_window window_head head_text").text(head_text);
	$("trade_window person").text(person);
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
	var neither=trade.starter!=user_index && trade.final_accepter!=user_index; //&& trade.accepter!=user_index ;
	switch(trade.trade_state){
		case "success":
			if(neither){
				his_window.push(game_info.player_list[trade.starter][1]+" 与 "+game_info.player_list[trade.accepter][1]+" 达成了交易！",'important');
			}
			else{
				person=trade.final_accepter==user_index?"你":game_info.player_list[trade.final_accepter][1];
				his_window.push(person+" 接受了交易!",'important');
			}		
			break;
		case "refused":
			if(neither && trade.accepter!=0){break;}
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
	if(game_temp.trade_now_id==trade.id && (trade.accepter==0?trade.trade_state!="refused":true))
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
				person=trade.accepter==user_index?"":"对方";
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
		return parseInt($(this).attr("target_val"))==trade.starter;
	}).hide();	
	if(trade.accepter==0){
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
	"player_get_item":function(player,src_id,num){
		if(num==0){return;}
		let change = num > 0 ? "获得" : "失去";
		num = num > 0 ? num : -num;
		this.push(player.name+" "+change+" "+order_ch[src_id]+" x "+num);
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
	$("actions0").on("mouseenter","button",
		function(){
			if(!!$(this).attr("help")){
				info_window.set($(this).attr("help"));
				$("info_window").show();
			}
			if(!!$(this).attr("tip") && $(this).hasClass("part_disabled")){
				info_window.set_addition($(this).attr("tip"));
				$("info_window").show();
			}		
	});
	$("actions0").on("mouseleave","button",
		function(){
			$("info_window").hide();
	});
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
	    	if($(this).hasClass("selector_available")==false){
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
		}			
	});
	//--------------------------------------------------------
	// UI：关闭窗口
	//--------------------------------------------------------
	$("confirm_window").on("click","#close",function(){
		close_confirm_window();
	})
	$("simple_item_select_window").on("click","#close",function(){
		close_simple_item_select_window();
	});
	$("trade_window").on("click","#close",function(){
		if(game_temp.trade_step=="requesting_trade"){
			return;
		}
		close_trade_window();
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
		}
		for(let UI_id of items){
			let item=game_UI[UI_id];
			if(item.own_num==0){continue;}
			selected_list[src_reflection[item.item_type]]=item.own_num;
		}
		//发送消息
		switch(game_temp.action_now){
		case "action_drop_srcs_for_7":
			ws.sendmsg("mes_action",{"starter":user_index,"val":[5,selected_list]});
			break;
		case "action_use_dev_plenty":
			ws.sendmsg("mes_action",{"starter":user_index,"val":[3,2,selected_list]});;
			break;
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
			if($gameSystem.self_player().no_build_dev_used){
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
		//如果有卡则激活下一级窗口：五种发展卡
		var self_player=game_info.players[user_index];
		for(var i=0;i<4;i++){
			$("#action_use_dev_"+devs[i]).show();
		}
		var count=UI_use_dev_update();
		if(count==-1){
			return;
		}
		//激活自己
		$(this).addClass("active");
		//安置按钮组位置
		$("actions1").css("top",$(this).position().top-count*25);
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
		var edges=available_edges(user_index);
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
				selector.addClass("selector_available");
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
		var points=available_points(user_index);
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
				selector.addClass("selector_available");
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
				selector.addClass("selector_available");
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
		UI_start_robber_set();
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
		game_temp.item_top_limit = 2;
		his_window.push("选择要丰收的资源:");
		UI_start_plenty_select();
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
	// UI：展示分数卡
	// 层级：1  值：3
	//--------------------------------------------------------
	$("#action_show_score_cards").click(function(){
		//如果处于无效状态则无反馈
		if($(this).hasClass("part_disabled")){
			return;
		}
		//设置菜单级数为1
		if(init_menu_lv(1,$(this))==false){return;}
		//当前行动记为"action_show_score_cards"
		game_temp.action_now="action_show_score_cards";
		his_window.push("选择要展示的分数卡:");
		//激活自己
		$(this).addClass("active");
		var jqdoms = $(".score_card_selector").filter(function(){return $gameSystem.self_player().score_unshown.indexOf($(this).text())!=-1});
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

		game_temp.selected_score_card=$(this).text();
		confirm_window.set("要展示"+$(this).text()+"吗?");
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
		var edges=available_edges(user_index);
		for(var i in edges){
			var selector=$("edge_selector").filter("#"+edges[i]).addClass("active selector_available").show();
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
			//设置内容
			info_window.empty();
			var info=vp_info(game_info.players[$(this).attr("id")],$(this).attr("id"));
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
			var player_index=$(this).attr("id");
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
			//设置内容
			info_window.empty();
			var player_index=$(this).attr("id");
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
			var player_index=$(this).attr("id");
			var score_shown=game_info.players[player_index].score_shown;
			if(score_shown.length==0){
				info_window.push("尚未拥有奇观");
			}
			else{
				info_window.push("已建成的奇观:");
				for(var i in score_shown)
				{
					info_window.push(score_shown[i]);
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
// 已弃用，参见model_Debug代码
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
	if(occupying==0){
		game_info.occupying=map_info.basic_roober;
	}
}
//--------------------------------------------------------
// UI初始化
// 已弃用,详见module_Debug.js
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
			/*if(game_info.active_player_index()==user_index || offline){
				//开始前期坐城设置
				//还是状态机法好啊
				start_set_home(0);
			}*/
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
		else if(self_player.dev_used){
			$("#action_use_dev_"+devs[i]).attr("tip","本回合已使用发展卡").addClass("part_disabled");
		}
		else if(self_player[devs[i]+"_num"]<=self_player[devs[i]+"_get_before"]){
			$("#action_use_dev_"+devs[i]).attr("tip","本回合获得的发展卡不能使用").addClass("part_disabled");
		}
		count+=1;
	}
	//如果有分数卡,显示激活分数卡
	if($gameSystem.self_player().score_unshown.length>0){
		count+=1;
		$("#action_show_score_cards").show();
	}
	else{
		$("#action_show_score_cards").hide();
	}
	//安置按钮组位置
	$("actions1").css("top",$("#action_develop").position().top-count*25);
	return count;
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
		}
	}
	//启动计时器
	if($gameSystem.time_per_turn!=0){
		//timer.reset();
		timer.start();
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
function create_simple_items(type){
	var selected_item_class = null;
	var availale_item_class = null;
	switch(type){
		case "drop":
			selected_item_class = Selected_Drop_item;
			availale_item_class = Available_Drop_item;
			break;
		case "plenty":
			selected_item_class = Selected_Plenty_item;	
			availale_item_class = Available_Plenty_item;
			break;
	}
	game_UI_list[type+"_items"]={
		selected:[],
		available:[]
	};
	for(var src_id=1;src_id<6;src_id++){
		var src_name=order[src_id];

		var jqitem=$("simple_item_select_window").children().filter("src_select_window").children().filter("srcs_selected").children().filter("."+src_name);
		var a_selected_item=new selected_item_class(jqitem,null,src_name);
		a_selected_item.ratio_num=1;
		game_UI[game_UI.UI_count]=a_selected_item;
		game_UI_list[type+"_items"].selected.push(game_UI.UI_count);
		game_UI.UI_count++;

		jqitem=$("simple_item_select_window").children().filter("src_select_window").children().filter("srcs_available").children().filter("."+src_name);
		var a_available_item=new availale_item_class(jqitem,a_selected_item,src_name);
		a_available_item.ratio_num=1;
		game_UI[game_UI.UI_count]=a_available_item;
		game_UI_list[type+"_items"].available.push(game_UI.UI_count);
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
		var src_num=self_player[item.item_type+"_num"];
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
	switch(game_temp.action_now){
	case "action_use_dev_plenty":
		init_menu_lv(1,$("#action_use_dev_plenty"));
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
	//关闭窗口
	$("confirm_window").hide();
	if(game_temp.action_now=="action_use_dev_road_making"){
		$("edge_selector").filter("#"+game_temp.selected_edge[1]).removeClass("selector_selected");
		game_temp.selected_edge.splice(1,1);
	}
	else{
		cancel_selectors();
	}	
	UI_cancel_menu_active();

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
		game_temp.dropped--;
	}
	increase(){
		super.increase();
		game_temp.dropped++;
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
		if(game_temp.dropped==game_temp.drop_required){
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
		game_temp.plenty_count--;
	}
	increase(){
		super.increase();
		game_temp.plenty_count++;
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
		if(game_temp.plenty_count==game_temp.item_top_limit){
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
//用于处理websocket发送过来的消息
//模拟websocket
ws={};
function load_ws_function_msg(){
	if(offline){
		ws.send=function(msg){
		$.get("/ajax/t_virtual_websocket/",msg,function(evt){
			//模拟接收到消息触发函数
			ws.onmessage(evt);},"json");
		}
	}
	//只属于ws的封装函数
	ws.sendmsg=function(typ,mes){
		//打开等待窗口
		$("wait_window").show();
		var evt={"type":typ,"message":mes};
		if(offline){
			this.send("data="+JSON.stringify(evt));
		}
		else{
			this.send(JSON.stringify(evt));
		}
	}
	//只属于ws的解读函数
	ws.onmessage=function(evt){
		//evt是js对象，然而evt.data不是(尽管格式是json)
		var data;
		if(typeof(evt.data)=="object"){
			data=evt.data
		}
		else
		{
			data=JSON.parse(evt.data)
		}	
		handle_msg(data);
	};
}
//不管,肯定不是多此一举
//解读信息
function handle_msg(msg){
	//alert(msg.message.val);
	switch(msg.type){
		case "mes_action":
			var val=msg.message.val;
			switch(val[0]){
				//骰子,一定是获取点数
				case 0:
					set_dice(val[2],val[3]);
					break;
				//建造
				case 1:
					switch(val[1]){
						//建造道路
						case 1:
							build_road(val[2],msg.message.starter);
							break;
						//建立定居点
						case 2:
							build_city0(val[2],msg.message.starter);
							break;
						//建设新城市
						case 3:
							build_city1(val[2],msg.message.starter);
							break;
						//抽取发展卡
						case 4 :
							extract_dev_card(val[3],msg.message.starter);
					}
					break;
				//交易
				case 2:
					switch(val[1]){
					    //与银行交易
					 	case 1:
					 		trade_with_bank(val[2],val[3],msg.message.starter);
					 		break;
				 		//与港口交易,本质还是与银行交易
				 		case 2:
				 			trade_with_bank(val[2],val[3],msg.message.starter);
				 			break;
				 		//与玩家交易(请求)
				 		case 3:
				 			give_trade_with_player(val[2])
				 			break;
				 		//响应玩家交易
				 		case 4:
				 			switch(val[2]){
				 				//尝试接受交易
				 				case 1:
				 					response_trade_with_player(val[3],msg.message.starter);
				 					break;
				 				//拒绝交易
				 				case 2:
				 					msg_refuse_trade(val[3],msg.message.starter);
				 					break;
				 				//取消交易
				 				case 3:
				 					msg_cancel_trade(val[3]);
				 					break;
				 			}
				 			break;
				 		//执行交易
				 		case 5:
				 			trade_with_player(val[2],val[3]);
				 			break;		
					}
				    break;
				//发展
				case 3:
					switch(val[1]){
						//士兵卡
						case 1:
							set_robber_info(val[2],msg.message.starter,val[3],val[5],true);
							break;
						//丰收卡
						case 2:
							dev_plenty(val[2],msg.message.starter);
							break;
						//垄断卡
						case 3:
							dev_monopoly(val[2],msg.message.starter);
							break;
						//修路卡
						case 4:
							dev_road_making(val[2],val[3],msg.message.starter);
							break;
						//展示分数卡
						case 5:
							show_score_card(val[2],msg.message.starter);
							break;
					}
					break;
				//设置强盗(因7)
				case 4:
				    set_robber_info(val[1],msg.message.starter,val[2],val[4]);
					break;
				//丢弃卡片(因7)
				case 5:
					drop_srcs(val[1],msg.message.starter);
					break;
				//结束回合
				case 6:
					new_turn();
					break;
				//初始坐城内容
				case 8:
					set_home(val[1],val[2],msg.message.starter);
					break;
				//初始投骰
				case 9:
					fst_dice(val[2],val[3],msg.message.starter);
					break;
				//聊天
				case 19:
					new_talk_message(val[1],msg.message.starter);
					break;
			}
			break;
		case "mes_member":
			member_handle_msg(msg.message);
			break;		
	}
	//由model_Debug进行额外解读
	try{
		debug_handel_msg(msg);
	}
	catch(err){

	};
	//然后由房主更新game_info
	//离线模式不更新
	if(!offline && $gameSystem.is_room_owner()){
		upload_game_info();
	}
	//暂不设计
	//再然后检查胜利条件
	update_vp_infos();
	//最后更新画面，先设计为全局更新，以后如果画面刷新量过大考虑重构
	update_static_Graphic();
}

//--------------------------------------------------------
// 处理函数
//--------------------------------------------------------
//--------------------------------------------------------
// 设置骰子
//--------------------------------------------------------
function set_dice(num1,num2){
	if(debug){
		num1=3;
		num2=3;
	}
	var can_start_build=true;
	$gameSystem.dice_7_step=0;
	//刷新game_info
	game_info.dice_num[0]=num1;
	game_info.dice_num[1]=num2;
	UI_set_dices(num1,num2);
	//根据数字和收取资源
	var num_sum=num1+num2;
	var places=map_info.places;
	//添加消息
	his_window.push("掷出点数: "+ num_sum);
	//七点,所有玩家检查自己的资源数,大于七则触发丢弃选择,如果未大于7则丢弃一个空的丢弃列表。
	if(num_sum==7){
		//更新数据
		$gameSystem.recive_list=[].concat($gameSystem.online_list);
		$gameSystem.dice_7_step=1;
		for(let player of Object.values($gamePlayers)){
			if(player.all_src_num()>7){
				player.drop_required = parseInt(player.all_src_num()/2);
			}
			else{
				player.drop_required = 0;
			}
		}
		//依照自己是否需要丢弃资源来打开UI
		start_drop_select();
		return;
	}
	for(var place_id in places){
		var place=places[place_id];
		if(place.create_num==num_sum){
			if(game_info.occupying==place_id){
				his_window.push("地块被占据,无法产出");
				continue;
			}
			//alert(order[place.create_type]+" "+place.create_num);
			var points=plc_round_points(place_id);
			//alert(points);
			for(var pt_index in points){
				var pt_id=points[pt_index];
				//alert(pt_id);
				if(game_info.cities.hasOwnProperty(pt_id)){
					var city=game_info.cities[pt_id];
					var player=game_info.players[city.owner];
					var add_num;
					if(city.level==0){
						add_num=1;
					}
					else{
						add_num=2;
					}
					player[order[place.create_type]+"_num"]+=add_num;
					//添加消息	
					his_window.push(game_info.player_list[city.owner][1]+"获得 "+order_ch[place.create_type]+" x "+add_num);
				}
			}
		}
	}
	if(can_start_build){
		UI_start_build();
	}
	//alert("end");
}
//--------------------------------------------------------
// 启动资源丢弃
//--------------------------------------------------------
function start_drop_select(){
	if($gameSystem.self_player().drop_required>0){
		game_temp.drop_required=$gameSystem.self_player().drop_required;
		his_window.push("你需要丢弃 "+game_temp.drop_required+" 份资源");
		game_temp.action_base="action_drop_srcs_for_7";
		game_temp.action_now="action_drop_srcs_for_7";
		can_start_build=false;
		//打开丢弃窗口
		UI_start_drop_select();
		//手动关闭等待窗口
		$("wait_window").hide();
	}
	else{
		//如果不需要丢弃资源(或已经丢弃过),发送一条空的丢弃消息,然后进入等待状态
		ws.sendmsg("mes_action",{"starter":user_index,"val":[5,{}]});
	}
}
//--------------------------------------------------------
// 建造道路
//--------------------------------------------------------
function build_road(edge_id,player_index,cost=true){
	//建造道路的UI回调函数,只需要清除selectors和active
	clear_selectors();
	$("#action_build_road").removeClass("active");
	var player=game_info.players[player_index];
	//扣除资源
	if(cost){
		player.brick_num--;
		player.wood_num--;
	}
	//安置道路(更新game_info)
	game_info.roads[edge_id]=new Road(player_index);
	player.own_roads.push(edge_id);
	his_window.push(game_info.player_list[player_index][1]+" 建造了一条道路");
	//此处可以添加动画
	//安置道路(更新画面)
	add_road(edge_id);
}
//--------------------------------------------------------
// 建立定居点
//--------------------------------------------------------
function build_city0(point_id,player_index,cost=true){
	//建造定居点的UI回调函数,只需要清除selectors和active
	clear_selectors();
	$("#action_build_city0").removeClass("active");

	var player=game_info.players[player_index];
	//扣除资源
	if(cost){
		player.brick_num--;
		player.wood_num--;
		player.wool_num--;
		player.grain_num--;
	}
	//建立新定居点(更新game_info)
	var ex_type=0;
	//检查该点附近是否有港口
	for(var harbor_index in map_info.harbors){
		var harbor=map_info.harbors[harbor_index];
		var about_points=edge_round_points(plc_round_edges(harbor.place_id,dir_reflection[harbor.direct]));
		if(about_points.indexOf(point_id)==-1){continue;}
		//添加交易能力
		ex_type=harbor.ex_type;
	}
	game_info.cities[point_id]=new City(player_index,ex_type);
	game_info.players[player_index].own_cities.push(point_id);
	his_window.push(game_info.player_list[player_index][1]+" 建立了一个新定居点");
	//此处可以添加动画
	//建立新定居点(更新画面)
	add_city(point_id);
}
//--------------------------------------------------------
// 建设新城市
//--------------------------------------------------------
function build_city1(point_id,player_index){
	//建造城市的UI回调函数,只需要清除selectors和active
	clear_selectors();
	$("#action_build_city1").removeClass("active");
	var player=game_info.players[player_index];
	//扣除资源
	player.grain_num-=2;
	player.ore_num-=3;
	//升级城市(更新game_info)
	game_info.cities[point_id].level=1;
	his_window.push(game_info.player_list[player_index][1]+" 建成了一座新城市");
}
//--------------------------------------------------------
// 抽取发展卡
//--------------------------------------------------------
function extract_dev_card(randomint,player_index){
	//设置抽取发展卡的UI回调函数,只需要清除active
	$("#action_buy_dev_card").removeClass("active");
	var cards=game_info.cards;
	var player=game_info.players[player_index];
	//扣除资源
	player.grain_num-=1;
	player.wool_num-=1;
	player.ore_num-=1;
	his_window.push(game_info.player_list[player_index][1]+" 抽取了一张发展卡");
	//根据随机数判断发展卡的类型
	if(randomint<cards.soldier_num){
		if(user_index==player_index){
			his_window.push("(你获得了士兵卡)");
		}
		//获得士兵卡
		cards.soldier_num--;
		player.soldier_num++;
		player.soldier_get_before++;
		return;
	}
	randomint-=cards.soldier_num;
	if(randomint<cards.plenty_num){
		if(user_index==player_index){
			his_window.push("(你获得了丰收卡)");
		}
		//获得丰收卡
		cards.plenty_num--;
		player.plenty_num++;
		player.plenty_get_before++;
		return;
	}
	randomint-=cards.plenty_num;
	if(randomint<cards.monopoly_num){
		if(user_index==player_index){
			his_window.push("(你获得了垄断卡)");
		}
		//获得垄断卡
		cards.monopoly_num--;
		player.monopoly_num++;
		player.monopoly_get_before++;
		return;
	}
	randomint-=cards.monopoly_num;
	if(randomint<cards.road_making_num){
		if(user_index==player_index){
			his_window.push("(你获得了修路卡)");
		}
		//获得修路卡
		cards.road_making_num--;
		player.road_making_num++;
		player.road_making_get_before++;
		return;
	}
	randomint-=cards.road_making_num;
	if(randomint<cards.score_cards.length){
		if(user_index==player_index){
			his_window.push("(你获得了分数卡:"+cards.score_cards[randomint]+")");
		}
		//获得分数卡
		player.score_unshown.push(cards.score_cards[randomint]);
		cards.score_cards.splice(randomint,1);	
		return;
	}
}
//--------------------------------------------------------
// 与银行交易
//--------------------------------------------------------
function trade_with_bank(give_list,get_list,trader_index){
	//UI回调,关闭交易窗口
	close_trade_window();

	var trader=game_info.players[trader_index];
	var bank=game_info.cards;
	game_info.active_trades.splice(game_info.active_trades.indexOf(0),1);
	//进行资源转移
	for(var src_id in give_list){
		var src_num=order[src_id]+"_num";
		trader[src_num]-=give_list[src_id];
		bank[src_num]+=give_list[src_id];
		his_window.push(game_info.player_list[trader_index][1]+" 给了银行 "+order_ch[src_id]+" x "+give_list[src_id]);
	}
	for(var src_id in get_list){
		var src_num=order[src_id]+"_num";
		trader[src_num]+=get_list[src_id];
		bank[src_num]-=get_list[src_id];
		his_window.push("银行给了 "+game_info.player_list[trader_index][1]+" "+order_ch[src_id]+" x "+get_list[src_id]);
	}

}
//--------------------------------------------------------
// (被)生成交易
//--------------------------------------------------------
function give_trade_with_player(new_trade){
	//更新交易状态
	//如果是交易发起者则不需要
	if(new_trade.starter!=user_index){
		game_info.trades[new_trade.id].refresh(new_trade);
		game_info.active_trades.push(new_trade.id);
		if(new_trade.accepter==user_index){
			his_window.push(game_info.player_list[new_trade.starter][1]+" 想要与你交易","important");
			show_special_actions("trade",new_trade.starter);
		}
		else if(new_trade.accepter==0){
			his_window.push(game_info.player_list[new_trade.starter][1]+" 发起了公开交易","important");	
			show_special_actions("trade","0");	
		}	
		
	}	
	if(offline && new_trade.accepter!=0){
		ws.sendmsg("mes_action",{"starter":new_trade.accepter,"accepter":new_trade.starter,"val":[2,4,1,new_trade.id]});
	}
}
//--------------------------------------------------------
// (被)拒绝交易
//--------------------------------------------------------
function msg_refuse_trade(trade_id,refuser_index){
	//更新交易状态
	//交易已被移除则不做任何事
	if(game_info.active_trades.indexOf(trade_id)==-1){return;}
	var trade=game_info.trades[trade_id];
	//公开交易在各自玩家的状态中显示不同
	trade.trade_state="refused";
	game_info.active_trades.splice(game_info.active_trades.indexOf(trade.id),1);
	window_finish_trade(trade,refuser_index);
}
//--------------------------------------------------------
// (被)取消交易
//--------------------------------------------------------
function msg_cancel_trade(trade_id){
	//更新交易状态
	//交易已被移除则不做任何事
	if(game_info.active_trades.indexOf(trade_id)==-1){return;}
	var trade=game_info.trades[trade_id];
	//如果是交易发起者则不需要
	if(trade.starter!=user_index){	
		trade.trade_state="canceled";
		game_info.active_trades.splice(game_info.active_trades.indexOf(trade.id),1);
		window_finish_trade(trade);
	}
}
//--------------------------------------------------------
// 与玩家交易
//--------------------------------------------------------
function response_trade_with_player(trade_id,accepter_index){
	//检查交易状态
	var trade=game_info.trades[trade_id];
	if(trade.trade_state=="requesting"){
		//达成交易
		trade.trade_state="success";
		trade.final_accepter=accepter_index;
		ws.sendmsg("mes_action",{"val":[2,5,trade_id,accepter_index]});
	}
}
//--------------------------------------------------------
// 执行与玩家交易
//--------------------------------------------------------
function trade_with_player(trade_id,accepter_index){
	var trade=game_info.trades[trade_id];
	//更新交易状态
	trade.final_accepter=accepter_index;
	trade.trade_state="success";
	game_info.active_trades.splice(game_info.active_trades.indexOf(trade_id),1);
	//执行交易
	var trade_starter=game_info.players[trade.starter];
	var trade_accepter=game_info.players[trade.final_accepter];
	var names=game_info.player_list
	//进行资源转移
	for(var src_id in trade.starter_list){
		var src_name=order[src_id]+"_num";
		var src_num=trade.starter_list[src_id];
		trade_starter[src_name]-=src_num;
		trade_accepter[src_name]+=src_num;
		his_window.push(names[trade.starter][1]+" 给了 "+names[trade.final_accepter][1]+" "+order_ch[src_id]+" x "+src_num);
	}
	for(var src_id in trade.accepter_list){
		var src_name=order[src_id]+"_num";
		var src_num=trade.accepter_list[src_id];
		trade_starter[src_name]+=src_num;
		trade_accepter[src_name]-=src_num;
		his_window.push(names[trade.final_accepter][1]+" 给了 "+names[trade.starter][1]+" "+order_ch[src_id]+" x "+src_num);
	}
	//UI回调,结束交易
	window_finish_trade(trade);
}
//--------------------------------------------------------
// 设置强盗
//--------------------------------------------------------
function set_robber_info(place_id,robber_index,victim_index,randomint,cost=false)
{
	//设置强盗的UI回调函数
	clear_selectors();
	$("#action_use_dev_soldier").removeClass("active");
	$("#cancel_robbing").hide();
	$("#to_before_action").hide();
	//如果是因为丢出七,额外打开建设界面,并设置步骤
	if(!cost){
		$gameSystem.dice_7_step=0;
		UI_start_build();
	}	
	if(cost){
		game_info.players[robber_index].soldier_num--;
		game_info.players[robber_index].soldier_used++;
		$gamePlayers[robber_index].dev_used=true;
		//UI回调,设置菜单级数为1
		init_menu_lv(1,$("#action_use_dev_soldier"));
		UI_use_dev_update();
	}
	game_info.occupying=place_id;
	var place=map_info.places[place_id];
	his_window.push("强盗被放置在数字为 "+place.create_num+" 的 "+order_ch[place.create_type]+" 地块上");
	rob_player(robber_index,victim_index,randomint);
	//临时消息清空
	game_temp.action_now="";
}
//--------------------------------------------------------
// 掠夺资源
//--------------------------------------------------------
function rob_player(robber_index,victim_index,randomint){
	//如果没有受害者,则返回
	if(victim_index==0){
		return;
	}
	var names=game_info.player_list;
	var victim=game_info.players[victim_index]
	var count=randomint;
	for(var i=1;count>=0;i++){
		if(count<victim[order[i]+"_num"]){
			victim[order[i]+"_num"]--;
			game_info.players[robber_index][order[i]+"_num"]++;
			his_window.push(names[robber_index][1]+" 掠夺了 "+names[victim_index][1]+" 的一份 "+order_ch[i]);
			break;
		}
		count-=victim[order[i]+"_num"];
	}
}
//--------------------------------------------------------
// 丢弃资源(因为丢出7)
//--------------------------------------------------------
function drop_srcs(drop_list,dropper_index){
	//遍历丢弃列表,舍弃对应数字
	var dropper=game_info.players[dropper_index];
	for(var src_id in drop_list){
		dropper[order[src_id]+"_num"]-=drop_list[src_id];
		his_window.push(game_info.player_list[dropper_index][1]+" 丢弃了 "+order_ch[src_id]+" x "+drop_list[src_id]);
	}
	//更新该玩家的数据
	$gamePlayers[dropper_index].drop_required=0;
	//如果是自己所为,进行回调关闭窗口
	if(dropper_index==user_index){
		//回调,关闭丢弃资源窗口
		$("simple_item_select_window").hide();
	}
	//完成丢弃后,检查recive_list,释放操作权或保持等待。
	if($gameSystem.msg_recive(dropper_index)==true){
		//更新数据
		$gameSystem.dice_7_step=2;
		for(let player of Object.values($gamePlayers)){
			player.drop_required=0;
		}
		$("wait_window").hide();
		//由掷出者设置强盗
		if($gameSystem.is_own_turn()){
			start_robber_set();
		}
		else{
			his_window.push("由 "+game_info.player_list[game_info.step_list[game_info.step_index]][1]+" 设置强盗");
		}
	}
	else if(game_info.step_list[game_info.step_index]==user_index && dropper_index==user_index){
		his_window.push("等待其他玩家选择丢弃资源...");
		$("wait_window").show();
	}
}
//--------------------------------------------------------
// 准备设置强盗
//--------------------------------------------------------
function start_robber_set(){
	his_window.push("由你设置强盗:");
	//当前行动记为action_set_robber_for_7
	//设置最初行动
	game_temp.action_base="action_set_robber_for_7";
	game_temp.action_now="action_set_robber_for_7";
	UI_start_robber_set();
}
//--------------------------------------------------------
// 丰收
//--------------------------------------------------------
function dev_plenty(src_list,player_index){
	var player=$gamePlayers[player_index];
	player.dev_used=true;
	his_window.push(player.name+" 使用了 "+"丰收卡");
	for(let src_id in src_list){
		player.src(src_id,"+=",src_list[src_id]);
	}
	player.dev("plenty","-=",1);
	//UI回调,设置菜单级数为1
	close_simple_item_select_window();
	init_menu_lv(1,$("#action_use_dev_plenty"));
	UI_use_dev_update();
}
//--------------------------------------------------------
// 垄断
//--------------------------------------------------------
function dev_monopoly(src_id,starter_index){
	var starter=game_info.players[starter_index];
	starter.dev_used=true;
	//垄断卡使用后,本回合无法再进行建设
	starter.no_build_dev_used=true;
	his_window.push(starter.name+" 使用了 "+"垄断卡");
	starter.dev("monopoly","-=",1);
	for(var player_index in game_info.players){
		//自己是垄断者则不受影响
		if(starter_index==player_index){
			continue;
		}
		var player=game_info.players[player_index];	
		starter.src(src_id,"+=",player.src(src_id),false);
		his_window.push(player.name+" 交出了 "+player.src(src_id)+" 份 "+order_ch[src_id]);
		player.src(src_id,0,false);
	}	
	//UI回调,设置菜单级数为1
	init_menu_lv(1,$("#action_use_dev_monopoly"));
	UI_use_dev_update();
}
//--------------------------------------------------------
// 修路
//--------------------------------------------------------
function dev_road_making(road_id1,road_id2,builder_index){
	var builder=game_info.players[builder_index];
	builder.dev_used=true;
	builder.dev("road_making","-=",1);
	his_window.push(builder.name+" 使用了 "+"道路建设卡");
	build_road(road_id1,builder_index,false);
	build_road(road_id2,builder_index,false);
	//UI回调,设置菜单级数为1
	init_menu_lv(1,$("#action_use_dev_road_making"));
	UI_use_dev_update();
}
//--------------------------------------------------------
// 展示分数卡
//--------------------------------------------------------
function show_score_card(card_name,player_index){
	var player=$gamePlayers[player_index];
	player.show_score_cards([card_name]);
	his_window.push(player.name+" 展示了分数卡 "+card_name);
	//UI回调,设置菜单级数为1
	init_menu_lv(1,$("#action_show_score_cards"));
	UI_use_dev_update();
}
//--------------------------------------------------------
// 新的回合
//--------------------------------------------------------
function new_turn()
{
	if(game_info.step_list==[]){
		alert("出现死循环!");
		return;
	}
	timer.stop();
	close_trade_window();
	//记录当前值
	last_step_index=game_info.step_index;
	//寻找没有掉线的下一位玩家
	//最差也能找到自己吧
	var index=game_info.step_index+1;
	var player_index;
	while(true)
	{
		if(index==Object.keys(game_info.player_list).length){
			index=0;
		}
		player_index=game_info.step_list[index];
		if(game_info.online_list.indexOf(player_index)!=-1){
			break;
		}
		index++;
	}
	game_info.step_index=index;
	//清空骰子值
	game_info.dice_num=[0,0];
	if(game_info.game_process==3){
		game_info.play_turns++;
	}
	//重置recive_list
	$gameSystem.recive_list=[].concat(game_info.online_list);
	//清空所有玩家的发展卡get_before限制(尽管对于某位玩家来说只需要清除自己的)
	for(player_index in $gamePlayers){
		var player=$gamePlayers[player_index];	
		for(var i=0;i<4;i++){
			player[devs[i]+"_get_before"]=0;
			player.dev_used=false;
			player.no_build_dev_used=false;
		}
	}	
	//清空所有交易
	game_info.active_trades.length=0;
	//offline模式下,核心角色移交
	if(offline){
		user_index=game_info.step_list[game_info.step_index];
	}
	//动画：回合指示轮盘跳转
	turn_rounds();
	//添加消息
	his_window.push("----------回合结束----------");
	his_window.push("第 "+game_info.play_turns+" 回合,轮到 "+game_info.player_list[game_info.step_list[game_info.step_index]][1]+" 行动");
	//emmm好像没什么要做的了= =||
	//UI更新
	UI_begin_turn();
}
//--------------------------------------------------------
// 初始坐城
//--------------------------------------------------------
function set_home(step,val,setter_index){
	var setter=game_info.players[setter_index];
	//更新坐城状态
	setter.home_step=step+1;
	switch(step%2){
		//建立定居点
		case 0:
			build_city0(val,setter_index,false);
			//判断轮数
			if(step>1){
				//收获资源
				var places=pt_round_places(val);
				for(i in places){
					var place=map_info.places[places[i]];
					if(place==null){continue;}
					setter.src(place.create_type,"+=",1);
				}				
			}
			his_window.push("由 "+setter.name+" 建设道路");
			if(setter_index==user_index){
				//接着请求修建道路
				UI_start_set_home(setter.home_step,val);
			}	
			break;
		//修建道路
		case 1:
			build_road(val,setter_index,false);
			//判断是否所有玩家都完成了一轮坐城
			if(game_info.step_index==game_info.step_list.length-1){
				//逆序行动列表
				game_info.step_list.reverse();
				//判断轮数
				if(step>2){
					if(!offline || step>Object.keys(game_info.player_list).length*4-2){
						//更改游戏状态,正式游戏开始
						game_info.game_process=3;
					}					
				}

			}
			//结束回合,移交行动权
			new_turn();
			//如果接下来是自己的回合,且没有进入下一个游戏阶段,请求修建定居点
			if($gameSystem.is_own_turn() && game_info.game_process!=3){		
				UI_start_set_home($gameSystem.active_player().home_step);
			}
			break;
	}


}
//--------------------------------------------------------
// 初始投骰
//--------------------------------------------------------
function fst_dice(num1,num2,dicer_index){
	var player=game_info.players[dicer_index];
	//更新数据
	player.first_dice[0] = num1;
	player.first_dice[1] = num2;
	if(user_index==dicer_index){
		//显示骰子数
		UI_set_dices(num1,num2);
	}	
	var num_sum=num1+num2;
	//添加消息
	his_window.push(player.name+" 掷出点数: "+num1+","+num2+" ,共计 "+num_sum,"important");	
	var player_ranks=[];
	if($gameSystem.msg_recive(dicer_index)){
		//整合骰子数据
		var dices=[0];
		for(let index in $gamePlayers){
			dices[index]=$gamePlayers[index].first_dice[0]+$gamePlayers[index].first_dice[1];
		}
		//对所有玩家投出的值进行排序:选择排序
		var count=0;
		while(Object.keys(dices).length>1){
			let max_index=0;
			for(let player_index in dices){
				if(dices[player_index]>dices[max_index]){
					max_index=player_index;
				}
			}
			player_ranks.push(parseInt(max_index));
			delete dices[max_index];
			count++;
			if(count>100){
				alert("循环次数过多!");
				return;
			}
		}
		//应用该行动列表,进入前期坐城阶段
		game_info.step_list=player_ranks;
		game_info.step_index=-1;
		game_info.game_process=2;
		var text="";
		for(let i in $gameSystem.step_list){
			text += $gamePlayers[$gameSystem.step_list[i]].name
			if(i!=$gameSystem.step_list.length-1){
				text+="->";
			}
		}
		his_window.push("行动顺序为:"+text,"important");
		his_window.push("----开始安放前期定居点----");
		create_step_list();
		new_turn();
		//如果是自己的回合,开始设置第一个定居点
		if($gameSystem.is_own_turn()){
			UI_start_set_home(0);
		}
	}
}
//--------------------------------------------------------
// 新的聊天消息
//--------------------------------------------------------
function new_talk_message(text,player_index){
	his_window.push($gamePlayers[player_index].name+"："+text,"important");
	//清空发送者的输入内容
	if(user_index==player_index){
		$("#talk_msg_input_window").val("");
	}
}
//--------------------------------------------------------
// 检查胜利条件
//--------------------------------------------------------
function update_vp_infos(){
	var players=game_info.players;
	var names=game_info.player_list;
	//检查最长道路
    var max_length=0;
	for(var player_index in game_info.player_list){
		var player=game_info.players[player_index]
		player.road_longest=cal_longest_road(player_index);
		max_length=Math.max(player.road_longest.length,max_length);
	}
	if(max_length<5){max_length=5;}
	if(game_info.longest_road!=0 && game_info.players[game_info.longest_road].road_longest.length<max_length){		
		his_window.push(game_info.player_list[game_info.longest_road][1]+" 不再是 最长道路 的修建者。");
		game_info.longest_road=0;
	}
	var max_list=[];
	for(var player_index in game_info.player_list){
		var player=game_info.players[player_index]
		if(player.road_longest.length==max_length){
			max_list.push(player_index);
		}
	}
	if(max_list.length==1){
		if(game_info.longest_road==0){
			his_window.push(game_info.player_list[max_list[0]][1]+"成为 最长道路 的修建者！");
			game_info.longest_road=max_list[0];
		}		
	}

	//检查最大军队
	if(game_info.max_minitory==0){
		var max_minitory=2;
	}
	else{
		var max_minitory=players[game_info.max_minitory].soldier_used;
	}
	for(var player_index in players){
		if(players[player_index].soldier_used>max_minitory){
			if(game_info.max_minitory==0){
				his_window.push(names[player_index][1]+"成为了 最大军队 的建立者！");
			}
			else{
				his_window.push(names[player_index][1]+" 取代 "+names[game_info.max_minitory][1]+"成为了 最大军队 的建立者！");
			}
			game_info.max_minitory=player_index;
		}
	}

	//计算总胜利点
	for(var player_index in players){
		var player=players[player_index];
		if(player.vp_update(true)>=10){
			if(player.index==game_info.step_list[game_info.step_index]){
				player.show_score_cards();
				his_window.push(player.name+"取得了胜利！","important");
			}		
		}
	}

}
//--------------------------------------------------------
// 数据构造函数
//--------------------------------------------------------
//--------------------------------------------------------
// 新的道路
//--------------------------------------------------------
function Road(owner_index) {
	this.owner = owner_index;
}
//--------------------------------------------------------
// 新的定居点
//--------------------------------------------------------
function City(owner_index,ex_type) {
	this.ex_type=ex_type;
	this.level=0;
	this.owner=owner_index;
}

