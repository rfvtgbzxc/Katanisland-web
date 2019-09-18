//初始化全局数据
//debug模式
debug=false;
//脱机模式
offline=true;
//提示窗口
info_window={
	"set":function(text){
		$("info_window").empty();
		$("info_window").append("<div>"+text+"</div>");
	}
}
//历史消息
his_window={
	"push":function(text){$("his_text").append("<div>"+text+"</div>");},
	"clear":function(){$("his_text").empty();}
};
//确认窗口
confirm_window={
	"set":function(text){$("alert_text").text(""+text);},
	"clear":function(){$("alert_text").text("");},
	"show":function(){$("confirm_window").show();},
	"hide":function(){$("confirm_window").hide();}
};
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
	"action_now":"",
	"set_option":"",
	"recive_list":[]
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
//个人标记（测试版本默认为第二位玩家）
user_id=666;
user_index=2;
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
	2:"dark-green"
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
	$("actions1").children().hide();
	$("button").filter(function(){
		return $(this).attr("action_lv")==1;
	}).filter("#1").hide();
	$("dice").hide();
	$("confirm_window").hide();
	$("source_list").hide();
	//--------------------------------------------------------
	// 加载游戏
	//--------------------------------------------------------
	$("#load_game").click(function(){
		load_ws_function();
		create_map();
	});
	//--------------------------------------------------------
	// 以联机模式加载游戏
	// 将会进入一个测试房间,房间数据固定,该房间只会有两名玩家,后进入的玩家会成为第二位玩家。
	//--------------------------------------------------------
	$("#load_game_online").click(function(){
		if(offline){
			alert("请先关闭脱机模式！")
			return;
		}
		user_index=parseInt($("#set_user_index").val());
		//本地局域网1
		//ws = new WebSocket("ws://172.24.10.250:80/ws/game_test/"+user_index+"/");
		//本地局域网2
		ws = new WebSocket("ws://192.168.50.50:80/ws/game_test/"+user_index+"/");
		//阿里云服务器
		//ws = new WebSocket("ws://119.23.218.46:80/ws/game_test/"+user_index+"/");
		load_ws_function();
		ws.onopen = function () {
            //当连接成功时，从数据库载入游戏信息
            create_map();
        };	
	});
	//--------------------------------------------------------
	// 检查图块
	//--------------------------------------------------------
	/*$("#places").on("click",".plc",function(){
		var place_id=$(this).attr("id");
		var place=places[place_id];
		alert("地块id："+place_id+"\n"+"产出数字："+place.create_num+"\n"+"产出类型："+order[place.create_type]);
	})*/

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
		cancel_selectors();
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
		switch(game_temp.action_base){
			case "action_set_robber_for_7":
				clear_selectors();
				$("special_actions").children().hide();
				start_robber_set();
				break;
		}
		game_temp.action_now=game_temp.action_base;
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
	// UI：图块选择器
	//--------------------------------------------------------
	$("#places").on("mouseenter","plc_selector",
	    function(){
	    	var place_id=$(this).attr("id");
	    	var place=map_info.places[place_id];
			$("#plc_info").text("地块id："+place_id+"产出数字："+place.create_num+"产出类型："+order[place.create_type]);
			if($(this).attr("tip")!=""){
				$("info_window").empty();
				$("info_window").append("<div>"+$(this).attr("tip")+"</div>");
				$("info_window").show();
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
	    					$("player").filter("#"+city.owner).addClass("player_select_avaliable");
	    				}			
	    			}
	    		}
	    		//如果附近没有可以掠夺的玩家,则设置确认内容
	    		if(ever_find_city)
	    		{
	    			his_window.push("请选择要掠夺的玩家:");
	    			$("plc_selector").not($(this)).removeClass("selector_avaliable");
	    			//显示"不掠夺"、"重新选择"按钮
	    			$("special_actions").show();
	    			$("#cancel_robbing").show();
	    			$("#to_before_action").show();
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
			$("#plc_info").text("边id："+$(this).attr("id"));
			if($(this).attr("tip")!=""){
				$("info_window").empty();
				$("info_window").append("<div>"+$(this).attr("tip")+"</div>");
				$("info_window").show();
			}	
	    }
	);
	$("#edges").on("click","edge_selector",
	    function(){
	    	//无效的边无法确认
	    	if($(this).hasClass("selector_disabled")){
	    		return;
	    	}
	    	game_temp.selected_edge=parseInt($(this).attr("id"));
	    	//打开确认窗口
	    	confirm_window.clear();
	    	confirm_window.set("要在此处建造道路吗?");
	    	$(this).addClass("selector_selected"); 
	    	confirm_window.show();
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
			$("#plc_info").text("点id："+$(this).attr("id"));	
			if($(this).attr("tip")!=""){
				$("info_window").empty();
				$("info_window").append("<div>"+$(this).attr("tip")+"</div>");
				$("info_window").show();
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
	    	if(game_temp.action_now=="action_build_city0"){
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
			if(game_temp.trade_basic_get_num==game_temp.trade_basic_give_num && game_temp.trade_basic_give_num!=0){
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
		//获取交易栏的所有资源
		var give_list={};
		var get_list={};
		var items1=game_UI_list.trade_items._give.selected;
		var items2=game_UI_list.trade_items._get.selected;
		for(var i in items1){
			var UI_id=items1[i];
			var item=game_UI[UI_id];
			if(item.own_num==0){continue;}
			give_list[src_reflection[item.item_type]]=item.own_num;
		}
		for(var i in items2){
			var UI_id=items2[i];
			var item=game_UI[UI_id];
			if(item.own_num==0){continue;}
			get_list[src_reflection[item.item_type]]=item.own_num;
		}
		//根据交易类型,有不同的处理
		switch(game_temp.trade_target){
			case "bank":
				//发送消息
				ws.sendmsg("mes_action",{"starter":user_index,"val":[2,1,give_list,get_list]});
				break;
		}
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
		//重置recive_list
		game_temp.recive_list=[].concat(game_info.online_list);
		//发送消息
		ws.sendmsg("mes_action",{"val":[0,0]});
	});
	//--------------------------------------------------------
	// UI：建设选项
	// 层级：0  值：1
	//--------------------------------------------------------
	$("#action_contribute").click(function(){
		//设置菜单级数为0
		init_menu_lv(0,$(this));
		//激活自己
		$(this).addClass("active");
		//激活下一级窗口：四项建设
		$("#action_build_road").show();
		$("#action_build_city0").show();
		$("#action_build_city1").show();
		$("#action_buy_dev_card").show();
		//安置按钮组位置
		$("actions1").css("top",$(this).position().top-3*25);
	});
	//--------------------------------------------------------
	// UI：交易
	// 层级：0  值：2
	//--------------------------------------------------------
	$("#action_trade").click(function(){
		//设置菜单级数为0
		init_menu_lv(0,$(this));
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
	// 层级：0  值：2
	//--------------------------------------------------------
	$("#action_trade_with_harbours").click(function(){
		//设置菜单级数为1
		init_menu_lv(1,$(this));
		//激活自己
		$(this).addClass("active");
		//激活下一级窗口：拥有的港口类型
		var harbours=all_harbours(user_index);
		var count=-1;
		for(var i in harbours){
			$("actions2").filter(function(){return $(this).attr("harbour_type")==order[harbours[i]]}).show();
			count++;
		}
		//安置按钮组位置
		$("actions2").css("top",$(this).position().top-count*25);
	});
	//--------------------------------------------------------
	// UI：准备交易
	// 交易类型非常多,这是一次尝试
	//--------------------------------------------------------
	$("actions1").on("click",".action_prepare_trade",function(){
		//激活自己
		$(this).addClass("active");
		//启动交易选择
		start_trade($(this).attr("trade_target"));
	});
	//--------------------------------------------------------
	// UI：使用发展卡
	// 层级：0  值：3
	//--------------------------------------------------------
	$("#action_develop").click(function(){
		//设置菜单级数为0
		init_menu_lv(0,$(this));
		//如果有卡则激活下一级窗口：五种发展卡
		var count=0;
		var self_player=game_info.players[user_index];
		for(var i=0;i<4;i++){
			if(self_player[devs[i]+"_num"]>0){
				count++;
				$("#action_use_dev_"+devs[i]).show();
				if(self_player[devs[i]+"_num"]<=self_player[devs[i]+"_get_before"]){
					$("#action_use_dev_"+devs[i]).addClass("part_disabled");
				}
			}
		}
		if(count==0){
			return;
		}
		//$("#action_show_score_cards").show();
		//安置按钮组位置
		$("actions1").css("top",$(this).position().top-(count-1)*25);
		//激活自己
		$(this).addClass("active");
	});
	//--------------------------------------------------------
	// UI：建设道路
	// 层级：1  值：1
	//--------------------------------------------------------
	$("#action_build_road").click(function(){
		//清除选择器
		clear_selectors();
		//如果处于已激活状态则取消激活
		if($(this).hasClass("active")){
			$(this).removeClass("active");
			return;
		}
		//取消激活其他的1级选项
		$("actions1").children().removeClass("active");
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
		//清除选择器
		clear_selectors();
		//如果处于已激活状态则取消激活
		if($(this).hasClass("active")){
			$(this).removeClass("active");
			return;
		}
		//取消激活其他的0级选项
		$("actions1").children().removeClass("active");
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
		//清除选择器
		clear_selectors();
		//如果处于已激活状态则取消激活
		if($(this).hasClass("active")){
			$(this).removeClass("active");
			return;
		}
		//取消激活其他的0级选项
		$("actions1").children().removeClass("active");
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
		//清除选择器
		clear_selectors();
		//如果处于已激活状态则取消激活
		if($(this).hasClass("active")){
			$(this).removeClass("active");
			return;
		}
		//取消激活其他的0级选项
		$("actions1").children().removeClass("active");
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
	// 层级：1  值：4
	//--------------------------------------------------------
	$("#action_use_dev_soldier").click(function(){
		//如果处于无效状态则无反馈
		if($(this).hasClass("part_disabled")){
			return;
		}
		//清除选择器
		clear_selectors();
		//如果处于已激活状态则取消激活
		if($(this).hasClass("active")){
			$(this).removeClass("active");
			return;
		}
		//取消激活其他的0级选项
		$("actions1").children().removeClass("active");
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
	// UI：无法使用卡片提示
	//--------------------------------------------------------
	$("actions1").on("mouseenter",".part_disabled",
		function(){
			info_window.set("你已使用完之前获得的卡片,剩余的卡片需要等一回合才能使用");
			$("info_window").show();
	});
	$("actions1").on("mouseleave",".part_disabled",
		function(){
			$("info_window").hide();
	});
	//--------------------------------------------------------
	// UI：结束回合
	// 层级：0  值：1
	//--------------------------------------------------------
	$("#action_end_turn").click(function(){
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
// 获取地图
//--------------------------------------------------------
function create_map(){
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
	load_game();
	//在此处添加页面构造完成以后的代码
	init_ui();
}
//--------------------------------------------------------
// UI初始化
//--------------------------------------------------------
function init_ui(){
	$("plc_selector").hide();
	$("edge_selector").hide();
	$("pt_selector").hide();
	$("dice").show();
	$("his_window").show();
	$("drop_window").hide();
	$("source_list").show();
	$("special_actions").children().hide();
	if(!debug){
		$("#debuging").hide();
	}
	//非自己回合不显示菜单(除非offline模式)
	if(game_info.step_list[game_info.step_index]==user_index || offline){
		$("actions0").show();
		//根据dice_num来判断目前是否已经投完骰子
		if(game_info.dice_num[0]==0)
		{
			$("actions0").children().not(".fst_action").hide();
		}
		else
		{
			$("dice").each(function(){
				$(this).addClass("num"+game_info.dice_num[$(this).attr("dice_id")]);
			});
			$("actions0").children().filter(".fst_action").children().addClass("disabled");
		}	
	}	
}
//--------------------------------------------------------
// UI控制类函数
//--------------------------------------------------------
//--------------------------------------------------------
// 菜单层级初始化
//--------------------------------------------------------
function init_menu_lv(menu_level,menu_item){
	//清除选择器
	clear_selectors();
	switch(menu_level){
		//0级菜单
		case 0:
			//如果已处于激活状态则关闭(随之更低级的窗口也会被隐藏)
			if(menu_item.hasClass("active"))
			{
				$("actions1").children().hide();
				menu_item.removeClass("active");
				break;
			}
			//关闭所有1级选项,取消激活所有的0级选项
			$("actions1").children().removeClass("active").hide();
			$("actions0").children().not("actions1").children().removeClass("active");
		//1级菜单
		case 1:
			//如果已处于激活状态则关闭(随之更低级的窗口也会被隐藏)
			if(menu_item.hasClass("active"))
			{
				$("actions2").children().hide();
				menu_item.removeClass("active");
				break;
			}
			//关闭所有2级选项,取消激活所有的1级选项
			$("actions2").children().removeClass("active").hide();
			$("actions1").children().removeClass("active");
		case 2:
			//如果已处于激活状态则关闭(随之更低级的窗口也会被隐藏)
			if(menu_item.hasClass("active"))
			{
				//$("actions2").children().hide();
				menu_item.removeClass("active");
				break;
			}
			//取消激活所有的2级选项
			$("actions2").children().removeClass("active");
	}
}
//--------------------------------------------------------
// 新的回合
//--------------------------------------------------------
function UI_new_turn(){
	//将UI重置到回合开始的状态
	//清除selectors
	clear_selectors();
	//清空所有状态类
	$("dice").removeClass();
	$("actions0").children().children().removeClass("disabled active part_disabled");
	//$("actions1").children().removeClass("active part_disabled");
	//隐藏除投骰子以外的按钮,如果本回合不是你行动,则隐藏所有按钮
	//此处应有拉长历史消息窗口的动作
	if(game_info.step_list[game_info.step_index]==user_index || offline)
	{
		$("actions0").show();
		$("actions0").children().not(".fst_action").hide();
		$("actions1").children().hide();
		$("special_actions").children().hide();
	}
	else{
		$("actions0").hide();
	}
	//刷新回合数
	$("#rounds").text(('00'+game_info.play_turns).slice(-2));
}
//--------------------------------------------------------
// 设置骰子
//--------------------------------------------------------
function UI_set_dices(){
	$("dice").each(function(){
			$(this).addClass("num"+game_info.dice_num[$(this).attr("dice_id")]);
	});	
	//禁用投掷骰子,启用其他0级选项	
	$("actions0").children().filter(".fst_action").children().addClass("disabled");
	$("actions0").children().not(".fst_action").show();
}
//--------------------------------------------------------
// 开始选择资源丢弃
//--------------------------------------------------------
function UI_start_drop_select(){
	//显示资源丢弃窗口
	$("drop_window").show();
	$("#action_drop_items").addClass("disabled");
	var self_player=game_info.players[user_index];
	if(game_UI.hasOwnProperty("drop_items_created")==false){
		for(var src_id=1;src_id<6;src_id++){
			var src_name=order[src_id];
			var src_num=self_player[src_name+"_num"];

			var jqitem=$("drop_window").children().filter("src_select_window").children().filter("srcs_selected").children().filter("."+src_name);
			var a_selected_item=new Selected_Drop_item(jqitem,null,src_name,0,1);
			jqitem.attr("id",game_UI.UI_count);
			game_UI[game_UI.UI_count]=a_selected_item;
			game_UI_list.drop_items.selected.push(game_UI.UI_count);
			game_UI.UI_count++;

			jqitem=$("drop_window").children().filter("src_select_window").children().filter("srcs_avaliable").children().filter("."+src_name);
			var a_avaliable_item=new Avaliable_Drop_item(jqitem,a_selected_item,src_name,src_num,1);
			jqitem.attr("id",game_UI.UI_count);
			game_UI[game_UI.UI_count]=a_avaliable_item;
			game_UI_list.drop_items.avaliable.push(game_UI.UI_count);
			game_UI.UI_count++;

			a_selected_item.rlt_item=a_avaliable_item;
		}
		game_UI.drop_items_created=true;
	}
	else{
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
// 启动交易窗口
//--------------------------------------------------------
function start_trade(target="bank"){
	var init_give_items_avaliable=[];
	var init_wonder_items_avaliable=[];
	var self_player=game_info.players[user_index];
	var action_text;
	var head_text;
	var trade_ratio=1;
	game_temp.action_now="action_trade";
	game_temp.trade_basic_give_num=0;
	game_temp.trade_basic_get_num=0;
	switch(target){
		//银行,目标可以是任何银行还有的资源,给予栏只显示有的
		//即使银行已经没有这种资源了也会列入,但随后判定中会为其附加不可更改
		case "bank":
			game_temp.trade_target="bank";
			game_temp.trade_ratio=4;
			action_text="发起交易";
			head_text="与银行交易 4:1";
			init_wonder_items_avaliable.push(1,2,3,4,5);
			for(var i=1;i<6;i++){
				if(self_player[order[i]+"_num"]>0){
					init_give_items_avaliable.push(i);
				}
			}	
			break;

	}
	if(game_UI.hasOwnProperty("trade_items_created")==false){
		for(var src_id=1;src_id<6;src_id++){
			var src_name=order[src_id];
			var src_num=0;

			var menu1=["give","get"];
			var menu2=["selected","avaliable"];

			for(var v1 in menu1){
				for(var v2 in menu2){
					//0,0:给予栏选中 0,1：给予栏备选 1,0:索取栏选中 1,1:索取栏备选
					var jqitem=$("trade_window").children().filter("src_select_window."+menu1[v1]).children().filter("srcs_"+menu2[v2]).children().filter("."+src_name);
					if(v2==0){
						src_num=0;
						if(v1==0){
							trade_ratio=game_temp.trade_ratio;
						}
						else if(v1==1){
							trade_ratio=1;
						}
						var a_selected_item=new Selected_Trade_item(jqitem,null,src_name,src_num,trade_ratio,menu1[v1]);
						var item=a_selected_item;
					}
					else{
						if(v1==0){
							src_num=self_player[src_name+"_num"];
							trade_ratio=game_temp.trade_ratio;
						}
						else if(v1==1){
							src_num=game_info.cards[src_name+"_num"];
							trade_ratio=1;
						}
						var a_avaliable_item_item=new Avaliable_Trade_item(jqitem,a_selected_item,src_name,src_num,trade_ratio,menu1[v1]);
						a_selected_item.rlt_item=a_avaliable_item_item;
						var item=a_avaliable_item_item;
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
	else{
		var items=game_UI_list.trade_items._give.selected;
		for(var i=0;i<items.length;i++){
			var UI_id=items[i];
			var item=game_UI[UI_id];
			item.own_num=0;
			item.jqdom_init();
		}
		items=game_UI_list.trade_items._get.selected;
		for(var i=0;i<items.length;i++){
			var UI_id=items[i];
			var item=game_UI[UI_id];
			item.own_num=0;
			item.jqdom_init();
		}
		items=game_UI_list.trade_items._give.avaliable;
		for(var i=0;i<items.length;i++){
			var UI_id=items[i];
			var item=game_UI[UI_id];
			var src_num=self_player[item.item_type+"_num"];
			item.own_num=src_num;
			item.jqdom_init();
		}
		items=game_UI_list.trade_items._get.avaliable;
		for(var i=0;i<items.length;i++){
			var UI_id=items[i];
			var item=game_UI[UI_id];
			var src_num=game_info.cards[item.item_type+"_num"];
			item.own_num=src_num;
			item.jqdom_init();
		}
	}
	$("#action_trade_items").addClass("disabled");
	$("trade_window").children().filter("window_head").children().filter("head_text").text(head_text);
	$("#action_trade_items").text(action_text);
	$("trade_window").show();
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
//--------------------------------------------------------
function vp_info(player,index){
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
	info[4]+=player.score_shown.length;
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
    constructor(jq_object,relative_object,item_type,own_num,exchange_ratio){
        this.jqdom=jq_object;
		this.rlt_item=relative_object;
		this.item_type=item_type;
		this.ratio_num=exchange_ratio;
		this.own_num=own_num;
    }
    reduce(){
		this.own_num-=this.ratio_num;	
		this.jqdom_update();	
	}
	increase(){
		this.own_num+=this.ratio_num;
		this.jqdom_update();	
	}
}
class Selected_item extends Src_item{
	constructor(jq_object,relative_object,item_type,own_num,exchange_ratio){
		super(jq_object,relative_object,item_type,own_num,exchange_ratio);
	}
	can_reduce(){
		return this.own_num>=this.ratio_num;
	}
	jqdom_update(){
		this.jqdom.attr("num",this.own_num);	
		if(this.own_num==0){
			this.jqdom.hide();
		}
		else{
			this.jqdom.show();
		}
	}
	jqdom_init(){
		this.jqdom.attr("num",this.own_num);	
		if(this.own_num==0){
			this.jqdom.hide();
		}
		else{
			this.jqdom.show();
		}
	}
}
class Avaliable_item extends Src_item{
	constructor(jq_object,relative_object,item_type,own_num,exchange_ratio){
		super(jq_object,relative_object,item_type,own_num,exchange_ratio);
	}
	can_reduce(){
		if(this.own_num<this.ratio_num){
			return false;
		}
		return true;
	}
	jqdom_update(){
		this.jqdom.attr("num",this.own_num);	
		if(this.own_num<this.ratio_num){
			this.jqdom.addClass("disabled");
		}
		else{
			this.jqdom.removeClass("disabled");
		}
	}
	jqdom_init(){
		this.jqdom.attr("num",this.own_num);	
		if(this.own_num==0){
			this.jqdom.hide();
		}
		else{
			this.jqdom.show();
			if(this.own_num<this.ratio_num){
				this.jqdom.addClass("disabled");
			}
			else{
				this.jqdom.removeClass("disabled");
			}
		}
	}
}
class Selected_Drop_item extends Selected_item{
	constructor(jq_object,relative_object,item_type,own_num,exchange_ratio){
		super(jq_object,relative_object,item_type,own_num,exchange_ratio);
		this.jqdom_init();
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
	constructor(jq_object,relative_object,item_type,own_num,exchange_ratio){
		super(jq_object,relative_object,item_type,own_num,exchange_ratio);
		this.jqdom_init();
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
	constructor(jq_object,relative_object,item_type,own_num,exchange_ratio,own_type){
		super(jq_object,relative_object,item_type,own_num,exchange_ratio);
		this.own_type=own_type;
		this.jqdom_init();
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
	constructor(jq_object,relative_object,item_type,own_num,exchange_ratio,own_type){
		super(jq_object,relative_object,item_type,own_num,exchange_ratio);
		this.own_type=own_type;
		this.jqdom_init();
	}
	can_reduce(){
		if(super.can_reduce()==false){
			return false;
		}
		if(this.own_type=="give"){
			if(game_temp.trade_basic_give_num>=game_temp.trade_basic_get_num){
				return false;
			}	
		}	
		return true;
	}
}


