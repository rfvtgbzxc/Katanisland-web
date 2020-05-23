//根据game_info处理画面的刷新，此部分只能对已经存在的DOM元素进行操作,且不对动画进行处理。
function update_static_Graphic(){
	if(!$gameSystem.is_audience()){
		var self_player=$gameSystem.self_player();
		//加载玩家自己所有资源的数字
		for(let src of src_cards){
			$(`.src_${src} > truely_own`).text(self_player.src(src));
		}
	}
	//刷新全玩家状态卡
	$("player").each(function(){
		var player=$gamePlayers[$(this).attr("id")];
		var attrs=$(this).children();
		attrs.filter("src_state").text(player.all_src_num());
		attrs.filter("vp_state").text(player.vp());
		attrs.filter("dev_state").text(player.all_dev_num());
		attrs.filter("city0_state").text(""+player.cities(0).length);
		attrs.filter("city1_state").text(""+player.cities(1).length);
	});
}
//--------------------------------------------------------
// 清除选择器
//--------------------------------------------------------
function clear_selectors(){
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
function cancel_selector(jqfn){
	//真是粗糙的写法
	if(!!game_temp.activeMenuItem[1] && jqfn.get(0)===game_temp.activeMenuItem[1].get(0)){
		init_menu_lv(...game_temp.activeMenuItem);
	}
	else{
		jqfn.removeClass("selector_selected player_select_selected");
	}
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
		"left":45*(step_list.length-step_list.length%2)+65,
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
	for(let place_id in harbors){
		let harbor_place = harbors[place_id];
		for(let harbor_direction in harbor_place){
			let ex_type = harbor_place[harbor_direction].ex_type;
			add_harbour(place_id,harbor_direction,ex_type);
		}
	}
}
//--------------------------------------------------------
// 游戏UI生成(不包含地图UI)
//--------------------------------------------------------
function load_UI(){
	//加载资源栏
	create_source_list();
	//加载骰子
	create_dices();
	//显示回合数
	set_rounds();
	//加载玩家状态栏
	create_player_list();
	//加载交易/舍弃/丰收栏资源图标
	for(let src of src_cards){
		$("srcs_selected").append("<src_item num='0' class='"+src+"'></src_item>");
		$("srcs_available").append("<src_item num='0' class='"+src+"'></src_item>");
	}
	//加载动态菜单
	create_menu();
	//加载资源栏对象
	create_trade_items();
	//加载文字
	$youziku.submit("playername_update");
}
//--------------------------------------------------------
// 创建骰子
//--------------------------------------------------------
function create_dices(){
	/*$("dice_list").append(`<dice dice_id="0"></dice>`);
	$("dice_list").append(`<dice dice_id="1"></dice>`);*/
}
//--------------------------------------------------------
// 创建玩家列表
//--------------------------------------------------------
function create_player_list(){
	var dy=0;
	//是观众则不需要为其预留一个位置
	if(!$gameSystem.is_audience()){dy+=205;}	
	for(let player of Object.values($gamePlayers)){
		$("#players").append("<player id='"+player.index+"'></player>");
		let player_state=$("player").filter("#"+player.index);
		//加载内部UI
		create_player_info(player_state,player);
		//调整位置
		if(player.index==user_index){
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
			"color":color_reflection_hex[color_reflection[player.index]]
		});	
	}
	$("#players").css("height",(dy+40)+"px");
}
//--------------------------------------------------------
// 加载单个玩家的信息表
//--------------------------------------------------------
function create_player_info(player_state,player){
	player_state.append("<img class='player_back' src='"+cdn_url+"/media/img/player_back_"+color_reflection[player.index]+".png'/>");	
	player_state.append("<playername>"+player.name+"</playername>");
	player_state.append("<vp_state></vp_state>");
	player_state.append("<src_state></src_state>")
	player_state.append("<dev_state></dev_state>")
	player_state.append("<city0_state></city0_state>")
	player_state.append("<city1_state></city1_state>")
	player_state.append("<longest_road></longest_road>")	
	player_state.append("<score_card></score_card>")
	//设置激活标记
	if($gameSystem.longest_road==player.index){add_player_tag(player.index,"longest_road");}
	if(player.all_score_num("shown")>0){add_player_tag(player.index,"score_card");}	
}
//--------------------------------------------------------
// 加载动态菜单
//--------------------------------------------------------
function create_menu(){
	for(let menu_list of Object.values(menu_lists)){
		if(!menu_actions.hasOwnProperty(menu_list.type)){menu_actions[menu_list.type]={};}
		for(let item of Object.values(menu_list.items)){
			let text = DynamicMenu.render(menu_list.template,item)
			$(`actions${menu_list.level}`).append(text);
			menu_actions[menu_list.type][item.key]=item;	
		}
	}
	//加载港口
	for(var i=1;i<7;i++){
		$("actions2").append("<button trade_target='harbour' target_val='"+i+"' type='button' class='action_prepare_trade list-group-item'>"+order_ch[i]+"港</button>");
	}
	//加载垄断资源按钮
	for(var i=1;i<6;i++){
		$("actions2").append("<button src_id='"+i+"' type='button' class='src_selector list-group-item'>"+order_ch[i]+"</button>");
	}
	//加载分数卡(在展示分数栏)
	for(let card of score_cards){
		$("actions2").append("<button id='"+card+"' type='button' class='score_card_selector list-group-item'>"+score_ch[card]+"</button>");
	}
	//加载交易玩家
	$("actions2").append("<button trade_target='player' target_val='0' type='button' class='action_prepare_trade list-group-item'>公开交易</button>");
	$("special_actions").append("<button trade_target='player' target_val='0' type='button' class='action_prepare_trade list-group-item'>公开交易</button>");
	for(var player_index in game_info.player_list){
		$("actions2").append("<button trade_target='player' target_val='"+player_index+"' type='button' class='action_prepare_trade list-group-item'>"+game_info.player_list[player_index][1]+"</button>");
		$("special_actions").append("<button trade_target='player' target_val='"+player_index+"' type='button' class='action_prepare_trade list-group-item'>"+game_info.player_list[player_index][1]+"</button>");
	}
}
//--------------------------------------------------------
// 创建资源栏
//--------------------------------------------------------
function create_source_list(){
	for(let src of src_cards){
		$("source_list").append(`<img class="src_list_item" src="${cdn_url}/media/img/src_icon_${src}_withborder.png" width="25px"><span class="src_${src}"><truely_own>0</truely_own><pre_pay></pre_pay></span>`)
	}
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
// 移除道路
//--------------------------------------------------------
function remove_road(edge_id){
	$(`#roads > #${edge_id}`).remove();
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
			dy=-25;
			break;
		case 1:
			dx=Math.round(1.5*edge_size)-28;
			dy=-25;
			break;
	}
	city=cities[point_id];
	//由于城市图案的不对称性,将其针对不同位置再优化一下x坐标
	if(city.level==1){
		switch(point_id%2){
		case 0:
			dx-=10;
			break;
		case 1:
			dx-=5;
			break;
		}
	}
	$("#cities").append("<img class='city' id='"+point_id+"' src='"+cdn_url+"/media/img/city_lv"+city.level+"_"+color_reflection[city.owner]+".png'/>");
	//调整位置
	$(".city").filter("#"+point_id).css({"left":(x+dx+15)+"px","top":(y+dy+10)+"px","z-index":"999"});
}
//--------------------------------------------------------
// 移除城市
//--------------------------------------------------------
function remove_city(point_id){
	$(`#cities > #${point_id}`).remove();
}
//--------------------------------------------------------
// 添加海港
//--------------------------------------------------------
function add_harbour(place_id,harbor_direction,ex_type){
	let xi=parseInt(place_id/ysize);
	let yi=place_id%ysize;
	let place=places[place_id];
	let x=Math.round(xi*edge_size*1.5);
	let y=Math.round(yi*edge_size*1.732+(xi%2)*0.5*1.732*edge_size);
	let dx=0,dy=0;
	let id=place_id+harbor_direction;
	//放置海港
	$("#harbors").append("<img class='harbor' id='"+id+"' src='"+cdn_url+"/media/img/harbor_"+harbor_direction+".png'/>");
	hbr=$(".harbor").filter("#"+id);
	let num;
	if(ex_type!=6){
		num=2;
	}
	else{
		num=3;
	}
	//放置数字
	hbr.after("<img class='hb_num' id='"+id+"' src='"+cdn_url+"/media/img/harbor_num"+num+"_"+harbor_direction+".png'/>");
	//放置图标
	hbr.after("<img class='hb_icon' id='"+id+"' src='"+cdn_url+"/media/img/harbor_icon_"+ex_type+".png'/>");
	switch(harbor_direction){
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
	let hbx=x-2*edge_size;
	let hby=Math.round(y-1.732*edge_size);
	$(".harbor").filter("#"+id).css({"left":hbx+"px","top":hby+"px","z-index":"400"});
	$(".hb_num").filter("#"+id).css({"left":hbx+"px","top":hby+"px","z-index":"400"});
	$(".hb_icon").filter("#"+id).css({"left":(hbx+dx)+"px","top":(hby+dy)+"px","z-index":"400"});
}
//--------------------------------------------------------
// 添加玩家标记
//--------------------------------------------------------
function add_player_tag(player_index,tag){
	$(`#players > #${player_index} > ${tag}`).addClass("active");
}
//--------------------------------------------------------
// 移除玩家标记
//--------------------------------------------------------
function remove_player_tag(player_index,tag){
	$(`#players > #${player_index} > ${tag}`).removeClass("active");
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
// 添加交易单元
//--------------------------------------------------------
function create_trade_items(){
	if(game_UI.hasOwnProperty("trade_items_created")){return;}
	for(let src of src_cards){
		var menu1=["give","get"];
		var menu2=["selected","available"];

		for(var v1 in menu1){
			for(var v2 in menu2){
				//0,0:给予栏选中 0,1：给予栏备选 1,0:索取栏选中 1,1:索取栏备选
				var jqitem=$("trade_window src_select_window."+menu1[v1]+" srcs_"+menu2[v2]+" ."+src);
				if(v2==0){
					var a_selected_item=new Selected_Trade_item(jqitem,null,src,menu1[v1]);
					var item=a_selected_item;
				}
				else{
					var a_available_item_item=new Available_Trade_item(jqitem,a_selected_item,src,menu1[v1]);
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

GameGraphic = function(){
	throw new Error('This is a static class');
}
GameGraphic.set_city_development = function(player_index,develop_type,develop_level){
	var develop_state = $("player").filter("#"+player_index).children("dev_process_list").children("."+develop_type);
	if(develop_level!=0){develop_state.removeClass("initial");}
	else{develop_state.addClass("initial");}
	develop_state.text(develop_level);
}