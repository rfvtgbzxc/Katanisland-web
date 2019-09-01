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
		}
	});
	$("#cancel_action").click(function(){
		//关闭窗口
		$("confirm_window").hide();
		cancel_selectors();
	});
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
	    	confirm_window.set("要在此处建立定居点吗?");
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
// 获取玩家可修路的边
//--------------------------------------------------------
function avaliable_edges(player_index){
	var roads=all_roads(player_index);
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
	var cities=all_cities(player_index);
	var available_edges_from_city=[];
	for(var base_pt in cities){
		available_edges_from_city=union(available_edges_from_city,pt_round_edges(cities[base_pt]));
	}
	available_edges_all=union(available_edges_all,available_edges_from_city);
	//删除已有道路的边
	for(var i in available_edges_all){
		if(game_info.roads.hasOwnProperty(available_edges_all[i])){
			delete available_edges_all[i];
			continue;
		}			
	}
	return available_edges_all;
}
//--------------------------------------------------------
// 获取玩家可定居的点
//--------------------------------------------------------
function avaliable_points(player_index){
	var roads=all_roads(player_index);
	var avaliable_points_all=[];
	//获取自己所有道路的端点
	for(var i in roads){
		avaliable_points_all=union(avaliable_points_all,edge_round_points(roads[i]));	
	}
	//alert(avaliable_points_all);
	//alert(pt_round_points(38))
	//删除自己或周围有其他城市的点
	var i=0;
	while(i<avaliable_points_all.length){
		//alert("1");
		var can_settle=true;
		if(game_info.cities.hasOwnProperty(avaliable_points_all[i])){
			avaliable_points_all.splice(i,1);
			continue;
		}
		var near_pts=pt_round_points(avaliable_points_all[i]);	
		for(var j in near_pts){
			if(game_info.cities.hasOwnProperty(near_pts[j])){
				avaliable_points_all.splice(i,1);
				//alert(avaliable_points_all)
				can_settle=false;
				break;
			}
		}
		if(can_settle){
			i++;
		}
		//alert("2");				
	}
	return avaliable_points_all;
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
	var xi=parseInt(place_id/ysize);
	var yi=place_id%ysize;
	places=[];
	for(i in need){
		switch(need[i]){
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
	var i=0;
	while(i<places.length){
		if(map_info.places.hasOwnProperty(places[i])==false){
			places.splice(i,1);
			continue;
		}
		i++;			
	}
	if(is_single){
		return places[0];
	}
	else
	{
		return places;
	}
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
			/*if(edge_id==44){
				alert(t_edges)
			}*/
			//alert(t_edges);
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
// 获取一条边端点的id
// edge_id：边id
//--------------------------------------------------------
function edge_round_points(edge_id){
	edge_id=parseInt(edge_id);
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
// 获取一个点周围所有点的id
// point_id：点id
//--------------------------------------------------------
function pt_round_points(point_id){
	point_id=parseInt(point_id);
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
// 取并集
//--------------------------------------------------------
function union(arr1,arr2){
	return arr1.concat(arr2.filter(function(v) {
        return arr1.indexOf(v) === -1}))
}