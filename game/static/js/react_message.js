//用于处理websocket发送过来的消息
//只属于ws的封装函数
ws.sendmsg=function(typ,mes){
	var evt={type:typ,message:mes};
	//debug模式下不会发送到channels
	if(debug){
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
				//结束回合
				case 6:
					new_turn();
					break;
			}
			break;
	}
	//然后由房主更新game_info
	//暂不设计
	//最后更新画面，先设计为全局更新，以后如果画面刷新量过大考虑重构
	update_Graphic();

}

//--------------------------------------------------------
// 处理函数
//--------------------------------------------------------
//--------------------------------------------------------
// 设置骰子
//--------------------------------------------------------
function set_dice(num1,num2){
	//刷新game_info
	game_info.dice_num[0]=num1;
	game_info.dice_num[1]=num2;

}
//--------------------------------------------------------
// 新的回合
//--------------------------------------------------------
function new_turn()
{
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
	game_info.play_turns++;
	//emmm好像没什么要做的了= =||
}