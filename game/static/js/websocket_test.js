$(document).ready(function () {
	$("#try_link").click(function(){
		if ("WebSocket" in window) {
	        //alert("您的浏览器支持 WebSocket!");
	        var user_name="tester";
	        // 打开一个 web socket
	        ws = new WebSocket("ws://192.168.50.140:80/ws/game_test/"+user_name+"/");

	        ws.onopen = function () {
	            // Web Socket 已连接上，使用 send() 方法发送数据
	            //ws.send("发送数据");
	            //alert("数据发送中...");
	            virtual_delay_request();
	        };

	        ws.onmessage = function (evt) {
	            var received_msg = evt.data;
	            message_window.push(received_msg);
	            if(!onajax){
	            	handel_messages();
	            }
	        };

	        ws.onclose = function () {
	            // 关闭 websocket
	            alert("连接已关闭...");
	        };
	    }
	    else {
	        // 浏览器不支持 WebSocket
	        alert("您的浏览器不支持 WebSocket!");
	    }
	});	
});
onajax=false;
message_window=[];
game_info=null;
function virtual_delay_request(){
	onajax=true;
	$.get("/ajax/websocket_test_give_delay/",function(e){
		onajax=false;
		game_info=JSON.parse(e);
		if(message_window.length>0){
			handel_messages();
		}
	});
}
function virtual_request_lost_frames(){
	onajax=true;
	$.get("/ajax/websocket_test_give_delay/",function(e){
		onajax=false;
		game_info=JSON.parse(e);
		if(message_window.length>0){
			handel_messages();
		}
	});
}
function handel_messages(){
	for(let mes_text of message_window){
		mes=JSON.parse(mes_text);
		if(mes.index<=game_info.latest_message_index){continue;}
		if(mes.index>game_info.latest_message_index+1){
			let miss_frames=[];
			for(let lost_index=game_info.latest_message_index+1;lost_index<mes.index;lost_index++){
				miss_frames.push(lost_index);
			}
			alert("丢失了这些帧:"+miss_frames);
		}
		alert("收到帧:"+mes.index);
	}
	message_window.length=0;
}