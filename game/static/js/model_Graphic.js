//根据game_info处理画面的刷新，此部分只能对已经存在的DOM元素进行操作,且不对动画进行处理。
function update_static_Graphic(){
	var self_player=game_info.players[user_index];
	//刷新骰子,其关联菜单的显示内容
	//alert("画面刷新");
	//清除选择器
	/*clear_selectors();
	//清除所有class
	$("dice").removeClass();
	$("actions0").children().filter(".fst_action").children().removeClass("disabled active");
	$("actions1").children().removeClass("active");
	$("player").removeClass("player_select_avaliable player_selected");
	//根据dice_num来判断目前是否已经投完骰子,以此对菜单UI的显示与否进行管理
	//一般不显示特殊选项
	$("special_actions").children().hide();
	//为0说明是新的回合,额外判断UI显示
	if(game_info.dice_num[0]==0)
	{
		//alert("新的回合");
		//如果不是玩家自己的回合,隐藏菜单
		/*
		if(game_info.step_list[game_info.step_index]==user_index || debug){
			$("actions0").show();
		}
		else{
			$("actions0").hide();		
		}
		$("actions0").children().not(".fst_action").hide();
		$("actions0").children().children().removeClass("disabled active");
		$("actions1").children().removeClass("part_disabled").hide();
		//刷新回合数
		$("#rounds").text(('00'+game_info.play_turns).slice(-2));
	}
	else
	{
		$("dice").each(function(){
			$(this).addClass("num"+game_info.dice_num[$(this).attr("dice_id")]);
		});		
		$("actions0").children().filter(".fst_action").children().addClass("disabled");
		//部分特殊行动会直接改变UI,如触发强盗设置UI,在此之前不能激活新的按钮
		//备注,除debugmodel,只会有本地玩家会触发设置
		if(game_temp.action_now=="action_set_robber_for_7"){
			start_robber_set();
		}
		else{
			$("actions0").children().not(".fst_action").show();
		}
	}*/
	//如果某种发展卡已使用完,不显示;或之前购买的已使用完,变灰
	for(var i=0;i<4;i++){
		if(self_player[devs[i]+"_num"]==0){
			$("#action_use_dev_"+devs[i]).hide();
		}
		else if(self_player[devs[i]+"_num"]<=self_player[devs[i]+"_get_before"]){
			$("#action_use_dev_"+devs[i]).addClass("part_disabled");
		}
	}
	//加载玩家自己所有资源的数字
	for(var i=1;i<6;i++){
		$(".src_"+order[i]).text(""+self_player[order[i]+"_num"]);
	}
	//刷新全玩家状态卡
	$("player").each(function(){
		var player_index=$(this).attr("id")
		var player=game_info.players[player_index];
		var attrs=$(this).children();
		attrs.filter("src_state").text(""+all_src_num(player));
		attrs.filter("vp_state").text(""+vp_num(player_index));
		attrs.filter("dev_state").text(""+all_dev_num(player))
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
	});
	//刷新选项中的发展卡数量
	$("#action_use_dev_soldier").children().filter(".dev_num").text(""+self_player.soldier_num);
	$("#action_use_dev_plenty").children().filter(".dev_num").text(""+self_player.plenty_num);
	$("#action_use_dev_monopoly").children().filter(".dev_num").text(""+self_player.monopoly_num);
	$("#action_use_dev_road_making").children().filter(".dev_num").text(""+self_player.road_making_num);
	$("#action_show_score_cards").children().filter(".dev_num").text(""+self_player.score_unshown.length);
	//城市形象更新
	$(".city").each(function(){
		var city=game_info.cities[$(this).attr("id")];
		$(this).attr("src","/media/img/city_lv"+city.level+"_"+color_reflection[city.owner]+".png");
	});
	//强盗地点更新
	set_robber(game_info.occupying);
	//最后如果是自己的回合,关闭等待窗口
	if((user_index==game_info.step_list[game_info.step_index] && game_temp.action_now!="action_drop_srcs_for_7") || offline){
		$("wait_window").hide();
	}	
}
//--------------------------------------------------------
// 清除选择器
//--------------------------------------------------------
function clear_selectors(){
	//alert("?");
	//清除块选择器
	$("plc_selector").attr("tip","").removeClass("active selector_avaliable selector_selected selector_disabled selector_displaying").hide();
	//清除边选择器
	$("edge_selector").attr("tip","").removeClass("active selector_avaliable selector_selected selector_disabled selector_displaying").hide();
	//清除边选择器
	$("pt_selector").attr("tip","").removeClass("active selector_avaliable selector_selected selector_disabled selector_displaying").hide();
	//清除玩家选择器
	$("player").removeClass("player_select_avaliable player_select_selected");
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
	var player_index=last_step_index+parseInt(new_steper.attr("pos"));
	if(player_index>game_info.step_list.length-1){player_index-=game_info.step_list.length;}
	//获取真·player_index
	player_index=step_list[player_index];
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
		$("#places").append("<img class='plc' id='"+place_id+"' src='/media/img/hexagon.png'/>");
		plc=$(".plc").filter("#"+place_id);
		//放置图块选择器
		plc.after("<plc_selector id='"+place_id+"'></plc_selector>");
		//放置背景图
		plc.after("<img class='backpic' id='"+place_id+"' src='/media/img/"+order[place.create_type]+".png'/>");
		//放置数字图
		if(place.create_num!=0){
			plc.after("<img class='numpic' id='"+place_id+"' src='/media/img/num_"+place.create_num+".png'/>");
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
			//road=roads[edge_id];
			//$("#roads").append("<img class='road' id='"+edge_id+"' src='/media/img/road_dir"+edge_id%3+"_"+color_reflection[road.owner]+".png'/>");
		}
		//调整位置
		$("edge_selector").filter("#"+edge_id).css({"left":(x+dx)+"px","top":(y+dy)+"px","z-index":"3000"})
		//$(".road").filter("#"+edge_id).css({"left":x+"px","top":y+"px","z-index":"600"})
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
			//city=cities[point_id];
			//$("#cities").append("<img class='city' id='"+point_id+"' src='/media/img/city_lv"+city.level+"_"+color_reflection[city.owner]+".png'/>");
		}
		//alert(x+dx);
		//调整位置
		$("pt_selector").filter("#"+point_id).css({"left":(x+dx)+"px","top":(y+dy)+"px","z-index":"3000"})
		//$(".city").filter("#"+point_id).css({"left":(x+dx+15)+"px","top":(y+dy+10)+"px","z-index":"800"})
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
	//加载交易/舍弃栏资源图标
	for(var i=1;i<1+src_size;i++){
		$("srcs_selected").append("<src_item num='0' class='"+order[i]+"'></src_item>");
		$("srcs_avaliable").append("<src_item num='0' class='"+order[i]+"'></src_item>");
	}
	//加载动态菜单：交易对象
	//加载港口
	for(var i=1;i<6;i++){
		$("actions2").append("<button trade_target='harbour' harbour_type='"+order[i]+"' type='button' class='action_prepare_trade list-group-item'>"+order_ch[i]+"港</button>");
	}
	//加载文字
	$youziku.submit("playername_update");
}
//--------------------------------------------------------
// 设置强盗
//--------------------------------------------------------
function set_robber(place_id){
	if($("robber").children().length==0){
		$("robber").append("<img src='/media/img/robber.png' style='position:absolute;'>");
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
	$("#roads").append("<img class='road' id='"+edge_id+"' src='/media/img/road_dir"+edge_id%3+"_"+color_reflection[road.owner]+".png'/>");
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
	$("#cities").append("<img class='city' id='"+point_id+"' src='/media/img/city_lv"+city.level+"_"+color_reflection[city.owner]+".png'/>");
	//调整位置
	$(".city").filter("#"+point_id).css({"left":(x+dx+15)+"px","top":(y+dy+10)+"px","z-index":"999"});
}