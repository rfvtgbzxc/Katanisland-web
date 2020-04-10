//用于处理游戏的连接、重连等。
//模拟websocket
var ws={};
function load_ws_function_msg(){
	if(offline){
		ws.send=function(msg){
		$.get("/ajax/t_virtual_websocket/",msg,function(evt){
			//模拟接收到消息触发函数
			ws.onmessage(evt);},"json");
		}
	}
	//只属于ws的封装函数
	ws.sendmsg=function(typ,mes,async=false){
		if(!async){
			//打开等待窗口
			$("wait_window").show();
		}
		//添加消息序号
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
		//重置时间
		this.resetPing();
	};
}
function relink_game(){
	his_window.push("与服务器连接断开,正在重连···","important");
	setTimeout(()=>{$.cookie("relink_game","true");window.location.reload();},2000);
	
}
function load_ws_function_keepAlive(){
	ws.maxTimeout = 3000;    //设置ping最大超时等待时间
	//--------------------------------------------------------
	// 生成定时Promise,重点在于会给出一个超时时间和外部调用resetPing,
	// 超时时间过后websocketKeepAlive会进入下一阶段,
	// 而任何时间调用resetPing都会使websocketKeepAlive回到初始阶段。
	//--------------------------------------------------------
	ws.setPromise = function(timeout){
		return new Promise(
			(resolve)=>{
				//递出resolve
				const timer_id = setTimeout(()=>resolve(true),timeout);
				this.resetPing = ()=>{clearTimeout(timer_id);resolve(false)};
			})
		.then((timeout)=>timeout);
	}
	//--------------------------------------------------------
	// 一阶段,超时时间5s,超时后发送ping消息,并进入二阶段
	//--------------------------------------------------------
	ws.needPing = function(){
		return this.setPromise(5000);
	}
	//--------------------------------------------------------
	// 二阶段,超时时间3s,超时后开始重连
	//--------------------------------------------------------
	ws.needRelink = function(){
		return this.setPromise(this.maxTimeout);
	}
	//--------------------------------------------------------
	// 维护websocket
	//--------------------------------------------------------
	ws.websocketKeepAlive = async function(){
		while(true){
			//准备进入ping状态
			if(!await this.needPing()){continue;}
			//发送一条ping消息
			this.sendmsg("mes_connection","ping",true);
			//准备进入超时重连状态
			if(!await this.needRelink()){continue;}
			//超时重连
			console.log("ping已超时,准备重连。");
			relink_game();
			break;
		}
	};
}
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
	load_ws_function_keepAlive();
	ws.onopen = function () {
		//进行websocket数据维护
		this.websocketKeepAlive();
		//setInterval(websocketPing,2000);
		success();
    };	
}

function websocketKeepAlive(){
	ws.sendmsg()
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
		//his_window.push("与服务器连接断开","important");
		//alert("与服务器连接断开!");
		relink_game();
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
// 上传基础游戏状态数据
//--------------------------------------------------------
function upload_initial_game_info(){
	var game_save = DataManager.makeSaveContents();
	$.ajax({ 
		type : "post", 
		url : "/ajax/t_update_initial_game_info/", 
		data : {
			room_pswd:room_pswd,
			game_info:JSON.stringify(game_save),
		}, 
		async : false, 
		headers:{"X-CSRFToken":$.cookie("csrftoken")},
		error : function(){ 
			alert("更新服务器数据失败!");
		} 
	}); 
}
//--------------------------------------------------------
// 更新游戏数据(debug模块专用)
//--------------------------------------------------------
function upload_game_info(event,game_over=false){
	var game_save = DataManager.makeSaveContents();
	console.log(JSON.stringify(game_save));
	$.ajax({ 
		type : "post", 
		url : "/ajax/t_update_game_info/", 
		data : {
			room_pswd:room_pswd,
			game_info:JSON.stringify(game_save),
			event:JSON.stringify(event),
			game_over:game_over ? 1 : 0
		}, 
		async : false, 
		headers:{"X-CSRFToken":$.cookie("csrftoken")},
		error : function(){ 
			alert("更新服务器数据失败!");
		} 
	}); 
}
//--------------------------------------------------------
// 从外部(游戏扩展)加载js
//--------------------------------------------------------
function requestJs(extendName,jsName){
	return $.ajax({
		type:"get",
		url:`${cdn_url}/media/${extendName}/${jsName}`,
		dataType:"script"
	});
}
//--------------------------------------------------------
// 从外部(游戏扩展)加载css
//--------------------------------------------------------
function requestCss(extendName,cssName){
	var link = document.createElement('link');
	link.rel = "stylesheet";
	link.type = "text/css";
	link.href = `${cdn_url}/media/${extendName}/${cssName}`;
	var head = document.getElementsByTagName("head")[0];
	head.appendChild(link);
}