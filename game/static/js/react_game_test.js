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
action_now=false;
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
	// UI：确认窗口
	//--------------------------------------------------------
	
	//--------------------------------------------------------
	// UI：图块选择器
	//--------------------------------------------------------
	$("#places").on("mouseenter",".plc_selector",
	    function(){
	        var place_id=$(this).attr("id");
			var place=places[place_id];
			//无法选择的块不会被添加选中状态
			if($(this).hasClass("plc_cnt_select")==false)
			{
				$(this).addClass("plc_selected");
			}		
			$("#plc_info").text("地块id："+place_id+"产出数字："+place.create_num+"产出类型："+order[place.create_type]);
	    }
	);
	$("#places").on("mouseleave",".plc_selector",
	    function(){
			$(this).removeClass("plc_selected");	
	    }
	);
	//--------------------------------------------------------
	// UI：边选择器
	//--------------------------------------------------------
	$("#edges").on("mouseenter","edge_selector",
	    function(){
			$(this).addClass("selected");
			$("#plc_info").text("边id："+$(this).attr("id"));
			if($(this).hasClass("disabled")){
				$("info_window").empty();
				$("info_window").append("<div>资源不足</div>");
				$("info_window").show();
			}	
	    }
	);
	$("#edges").on("click","edge_selector",
	    function(){
	    	//打开确认窗口
	    	confirm_window.clear();
	    	confirm_window.set("要在此处建造道路吗?");
	    	$(this).addClass("selected"); 
	    	confirm_window.show();
	    }
	);
	$("#edges").on("mouseleave","edge_selector",
	    function(){
			$(this).removeClass("selected");
			$("info_window").hide();	
	    }
	);
	//--------------------------------------------------------
	// UI：点选择器
	//--------------------------------------------------------
	$("#points").on("mouseenter",".pt_selector",
	    function(){
			$(this).addClass("pt_selected");
			$("#plc_info").text("点id："+$(this).attr("id"));	
	    }
	);
	$("#points").on("mouseleave",".pt_selector",
	    function(){
			$(this).removeClass("pt_selected");	
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
		//首先关闭其他可能的1级选项,取消其他可能的0级选项
		$("actions1").children().hide();
		$("actions0").children().not("actions1").children().removeClass("active");
		//发送消息
		ws.sendmsg("mes_action",{"val":[0,0]});
	});
	//--------------------------------------------------------
	// UI：建设选项
	// 层级：0  值：1
	//--------------------------------------------------------
	$("#action_contribute").click(function(){
		//如果已处于激活状态则关闭
		if($(this).hasClass("active"))
		{
			$("actions1").children().hide();
			$(this).removeClass("active");
			return;
		}
		//首先关闭其他可能的1级选项,取消其他可能的0级选项
		$("actions1").children().hide();
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
		//当前行动记为"action_build_road"
		action_now="action_build_road";
		//激活道路选择器,只激活可以建设道路的地方
		var roads=all_roads(user_index);
		var available_edges_from_road={};
		var available_edges_all=[];
		for(var base_road_index in roads){
			var base_road_id=roads[base_road_index];
			available_edges_from_road[base_road_id]=edge_round_edges(base_road_id,"edge_with_pt");
		}
		//无视有其他玩家已坐城点的备选道路
		for(var base_road_id in available_edges_from_road){
			for(var available_pt in available_edges_from_road[base_road_id]){
				if(game_info.cities.hasOwnProperty(available_pt) && game_info.cities[available_pt].owner!=user_index){
					//delete available_edges[available_pt];
					continue;
				}
				else{
					var t_edges=available_edges_from_road[base_road_id][available_pt];
					available_edges_all=union(available_edges_all,t_edges);
					/*for(i in t_edges){
						//已有道路的边无法选择
						if(game_info.roads.hasOwnProperty(t_edges[i])){continue;}
						$("edge_selector").filter("#"+t_edges[i]).addClass("active").show();
					}*/
				}
			}			
		}
		//自己城市周边的三条边可以放置道路,已有道路的边无法选择
		var cities=all_cities(user_index);
		var available_edges_from_city=[];
		for(var base_pt in cities){
			available_edges_from_city=union(available_edges_from_city,pt_round_edges(cities[base_pt]));
		}
		available_edges_all=union(available_edges_all,available_edges_from_city);
		//资源消耗提示
		var player=game_info.players[user_index];
		for(var i in available_edges_all){
			//已有道路的边无法选择,资源不够显示红色
			if(game_info.roads.hasOwnProperty(available_edges_all[i])){continue;}
			var selector=$("edge_selector").filter("#"+available_edges_all[i])
			selector.addClass("active").show();
			if(player.brick_num==0 || player.wood_num==0){
				selector.addClass("disabled");
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
		//清除选择器
		clear_selectors();
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
			}).css({"color":color_reflection_hex[color_reflection[$(this).attr("id")]]}).addClass("displaying").show();
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
	//将所有的六边形块放置于正确的位置
	for(var place_id in places){
		var xi=parseInt(place_id/ysize);
		var yi=place_id%ysize;
		var place=places[place_id];
		var x=Math.round(xi*edge_size*1.5);
		var y=Math.round(yi*edge_size*1.732+(xi%2)*0.5*1.732*edge_size);
		var dx=0,dy=0;
		$("#places").append("<img class='plc' id='"+place_id+"' src='/media/img/hexagon.png'/>");
		plc=$(".plc").filter("#"+place_id);
		//放置图块选择器
		plc.after("<div class='plc_selector' id='"+place_id+"'></div>");
		//放置背景图
		plc.after("<img class='backpic' id='"+place_id+"' src='/media/img/"+order[place.create_type]+".png'/>");
		//放置数字图
		if(place.create_num!=0){
			plc.after("<img class='numpic' id='"+place_id+"' src='/media/img/num_"+place.create_num+".png'/>");
		}
		//调整位置
		plc.css({"left":x+"px","top":y+"px","z-index":"500"});
		$(".plc_selector").filter("#"+place_id).css({"left":x+"px","top":y+"px","z-index":"2000"});
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
		//放置道路
		if(roads.hasOwnProperty(edge_id))
		{
			road=roads[edge_id];
			$("#roads").append("<img class='road' id='"+edge_id+"' src='/media/img/road_dir"+edge_id%3+"_"+color_reflection[road.owner]+".png'/>");
		}
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
		//调整位置
		$("edge_selector").filter("#"+edge_id).css({"left":(x+dx)+"px","top":(y+dy)+"px","z-index":"3000"})
		$(".road").filter("#"+edge_id).css({"left":x+"px","top":y+"px","z-index":"600"})
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
		$("#points").append("<div class='pt_selector' id='"+point_id+"'></div>");
		//放置城市
		if(cities.hasOwnProperty(point_id))
		{
			city=cities[point_id];
			$("#cities").append("<img class='city' id='"+point_id+"' src='/media/img/city_lv"+city.level+"_"+color_reflection[city.owner]+".png'/>");
		}
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
		//alert(x+dx);
		//调整位置
		$(".pt_selector").filter("#"+point_id).css({"left":(x+dx)+"px","top":(y+dy)+"px","z-index":"3000"})
		$(".city").filter("#"+point_id).css({"left":(x+dx+15)+"px","top":(y+dy+10)+"px","z-index":"800"})
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
		$("#harbors").append("<img class='harbor' id='"+i+"' src='/media/img/harbor_"+harbor.direct+".png'/>");
		hbr=$(".harbor").filter("#"+i);
		var num;
		if(harbor.ex_type!=6){
			num=2;
		}
		else{
			num=3;
		}
		//放置数字
		hbr.after("<img class='hb_num' id='"+i+"' src='/media/img/harbor_num"+num+"_"+harbor.direct+".png'/>");
		//放置图标
		hbr.after("<img class='hb_icon' id='"+i+"' src='/media/img/harbor_icon_"+harbor.ex_type+".png'/>");
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
function load_game(){
	var player_list=game_info.player_list;
	var players=game_info.players;
	var self_player=players[user_index];
	//加载所有资源的数字
	for(var i=1;i<5;i++){
		$(".src_"+order[i]).text(""+self_player[order[i]+"_num"]);
	}
	//显示回合数
	$("#rounds").text(('00'+game_info.play_turns).slice(-2));
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
			$("steper").filter(function(){return $(this).attr("pos")==i}).addClass("ownround");
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
	//加载玩家状态栏
	var dy=0;
	dy+=205;
	for(var player_index in player_list){
		$("#players").append("<player id='"+player_index+"'></player>");
		var player_state=$("player").filter("#"+player_index);
		player_state.append("<img class='player_back' id='"+player_index+"' src='/media/img/player_back_"+color_reflection[player_index]+".png'/>");	
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

	//加载文字
	$youziku.submit("playername_update");
}
//--------------------------------------------------------
// UI初始化
//--------------------------------------------------------
function init_ui(){
	$(".plc_selector").hide();
	$("edge_selector").hide();
	$(".pt_selector").hide();
	$("dice").show();
	$("his_window").show();
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
// 获取所有城市的数量
// lv:城市的等级
//--------------------------------------------------------
function city_num(player,lv){
	var own_cities=player.own_cities;
	var all_cities=game_info.cities;
	count=0;
	for(i in own_cities){
		if(all_cities[own_cities[i]].level==lv){
			count+=1;
		}
	}
	return count;
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
			roads.push(road_id);
		}
	}
	return roads;
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
// 获取地块对应的所有点的id
// place_id：地块id
//--------------------------------------------------------
function plc_round_points(place_id){
	var x=parseInt(place_id/ysize);
	var y=place_id%ysize;
	var place_id=parseInt(place_id);
	var points=[place_id*2,place_id*2+1,place_id*2+2,place_id*2+3,(place_id-ysize+x%2)*2+1,(place_id+ysize+x%2)*2]
	//删除不存在的
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
// 获取一个点周围所有边的id
// point_id：点id
//--------------------------------------------------------
function pt_round_edges(point_id){
	point_id=parseInt(point_id);
	var place_id=parseInt(point_id/2);
	var xi=parseInt(place_id/ysize);
	var yi=place_id%ysize;
	var pos=point_id%2;
	var edges;
	if(pos==0){
		edges=[3*place_id,3*place_id+1,3*((xi-1)*ysize+ysize-1+xi%2)+2];
	}
	else{
		edges=[3*place_id+1,3*place_id+2,3*((xi+1)*ysize+ysize-1+xi%2)];
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
// 获取一条边周围所有边的id
// edge_id：边id
// type：边的类型：edge 默认值所有边,blank_edge 未有道路的边,road 有道路的边,road_self 有自己的道路的边 edge_with_pt：以点为基础对应的边集
//--------------------------------------------------------
function edge_round_edges(edge_id,type="edge"){
	var need;
	switch(type){
		case "edge_with_pt":
			need=4;
			break;
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
	//获取所有边
	edge_id=parseInt(edge_id);
	var place_id=parseInt(edge_id/3);
	var xi=parseInt(place_id/ysize);
	var yi=place_id%ysize;
	var dir=edge_id%3;
	var edges;
	if(need==4){
		edges={};
		if(dir==0){
			edges[2*place_id]=[edge_id+1,3*((xi-1)*ysize+yi+xi%2-1)+2];
			edges[3*((xi-1)*ysize+yi+xi%2)+1]=[3*((xi-1)*ysize+yi+xi%2)+1,3*((xi-1)*ysize+yi+xi%2)+1];
		}
		else if(dir==1){
			edges[2*place_id]=[edge_id-1,3*((xi-1)*ysize+yi+xi%2-1)+2];
			edges[2*place_id+1]=[edge_id+1,3*((xi+1)*ysize+yi+xi%2-1)];
		}
		else{
			edges[2*place_id]=[edge_id-1,3*((xi+1)*ysize+yi+xi%2-1)];
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
		return edges;	
	}
	else{
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
			else if(game_info.roads[edges[i]].owner==self_edge_owner && need==1){
				edges.splice(i,1);
				continue;
			}	
		}
		i++;			
	}
	return edges;
}
//--------------------------------------------------------
// 取并集
//--------------------------------------------------------
function union(arr1,arr2){
	return arr1.concat(arr2.filter(function(v) {
        return arr1.indexOf(v) === -1}))
}