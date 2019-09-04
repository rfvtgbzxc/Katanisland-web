//初始化全局数据
//debug模式
debug=true;
//模拟websocket
ws={"send":function(msg){
	$.get("/ajax/t_virtual_websocket/",msg,function(evt){
		//模拟接收到消息触发函数
		ws.onmessage(evt);},"json");
}};
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
//临时数据
game_temp={
	"action_now":false
};
//个人标记（测试版本默认为第二位玩家）
user_id=666;
user_index=2;
//数据映射
load_process={
	"map":false,
	"game":false,
};
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
color_reflection={
	1:"light-blue",
	2:"dark-green"
}
color_reflection_hex={
	"light-blue":"#029ed9",
	"dark-green":"#006602",
	"light-orange":"#ff9b38",
	"light-red":"#ff3738",
	"light-purple":"#a3159a",
	"light-green":"#81ff38"
}
dir_reflection={
	"up":0,
	"ru":1,
	"rd":2,
	"dn":3,
	"ld":4,
	"lu":5
}
vp_info_text=[
"拥有的城市：",
"拥有的定居点：",
"最长道路：",
"最大军队：",
"拥有的奇观："
]
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
		create_map();
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
		}
	});
	$("#cancel_action").click(function(){
		//关闭窗口
		$("confirm_window").hide();
		cancel_selectors();
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
	    	if($(this).hasClass("selector_disabled")){
	    		return;
	    	}
	    	//game_temp.selected_edge=parseInt($(this).attr("id"));
	    	//打开确认窗口
	    	confirm_window.clear();
	    	//confirm_window.set("要在此处建造道路吗?");
	    	$(this).addClass("selector_selected"); 
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
	// UI：菜单
	//--------------------------------------------------------
	//--------------------------------------------------------
	// UI：投掷
	// 层级：0  值：0
	//--------------------------------------------------------
	$("#action_dice").click(function(){
		//发送消息
		ws.sendmsg("mes_action",{"val":[0,0]});
	});
	//--------------------------------------------------------
	// UI：建设选项
	// 层级：0  值：1
	//--------------------------------------------------------
	$("#action_contribute").click(function(){
		//清除选择器
		clear_selectors();
		//如果已处于激活状态则关闭
		if($(this).hasClass("active"))
		{
			$("actions1").children().hide();
			$(this).removeClass("active");
			return;
		}
		//首先关闭其他可能的1级选项,取消其他可能的0级选项
		$("actions1").children().removeClass("active").hide();
		$("actions0").children().not("actions1").children().removeClass("active");
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
		//取消激活其他的0级选项
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
	$(".plc_selector").hide();
	$("edge_selector").hide();
	$("pt_selector").hide();
	$("dice").show();
	$("his_window").show();
	$("source_list").show();
	if(!debug){
		$("#debuging").hide();
	}
	//非自己回合不显示菜单(除非debug模式)
	if(game_info.step_index==user_index || debug){
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
	return player.brick_num+player.wood_num+player.wool_num+player.grain_num+player.ore_num;
}
//--------------------------------------------------------
// 获取所有发展卡的数量
//--------------------------------------------------------
function all_dev_num(player){
	return player.soldier_num+player.plenty_num+player.monopoly_num+player.road_maker_num+player.score_unshown.length;
}
//--------------------------------------------------------
// 获取所有城市(的数量)
// lv:城市的等级 type:返回数量或数组
//--------------------------------------------------------
function city_num(player,lv,type="count"){
	var own_cities=player.own_cities;
	var all_cities=game_info.cities;
	var cities=[];
	for(var i in own_cities){
		if(all_cities[own_cities[i]].level==lv){
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
// 取并集
//--------------------------------------------------------
function union(arr1,arr2){
	return arr1.concat(arr2.filter(function(v) {
        return arr1.indexOf(v) === -1}))
}