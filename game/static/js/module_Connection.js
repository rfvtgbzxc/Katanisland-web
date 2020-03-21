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
