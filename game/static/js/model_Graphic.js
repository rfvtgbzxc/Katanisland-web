//根据game_info处理画面的刷新，此部分只能对已经存在的DOM元素进行操作。
function update_Graphic(){
	//刷新骰子,其关联菜单的显示内容
	//清除所有class
	$("dice").removeClass();
	$("actions0").children().filter(".fst_action").children().removeClass("disabled");
	//根据dice_num来判断目前是否已经投完骰子
	//为0说明是新的回合,额外判断UI显示
	if(game_info.dice_num[0]==0)
	{
		//alert("新的回合");
		//如果不是玩家自己的回合,隐藏菜单
		if(game_info.step_list[game_info.step_index]==user_index){
			$("actions0").show();
		}
		else{
			$("actions0").hide();		
		}
		$("actions0").children().not(".fst_action").hide();
		//回合指示轮盘跳转
		turn_rounds();
	}
	else
	{
		$("dice").each(function(){
			$(this).addClass("num"+game_info.dice_num[$(this).attr("dice_id")]);
		});
		$("actions0").children().not(".fst_action").show();
		$("actions0").children().filter(".fst_action").children().addClass("disabled");
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
	//var end_first_step=false;
	//循环推进直到step_index同步
	while(true){
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
			//对于ownround右侧的元素,有额外的移位,大小变换
			if($(this).attr("pos")=="1"){
				$(this).animate({"left":"-=65px","top":"0","height":"60px","width":"60px"});
			}
			//对于ownround的元素,有额外的移位,大小变换
			else if($(this).attr("pos")=="0"){
				$(this).animate({"left":"-=45px","top":"12px","height":"40px","width":"40px"});
				//实际上ownround只在初始化的时候使用过,以后可以考虑初始化也直接用style
				$(this).removeClass("ownround");
			}
			//对于最右侧的(新)元素,有额外的大小变换
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
		//删除pos最小的元素
		/*$("steper").filter(function(){
			return $(this).attr("pos")==-(step_list_width+1);
		}).remove();*/
		last_step_index++;
		if(last_step_index==game_info.step_list.length){last_step_index=0;}
		//alert(last_step_index);
		if(last_step_index==game_info.step_index){break;}
	}

}