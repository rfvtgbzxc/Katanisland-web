//初始化全局游戏信息
game_info={
};
user_id=0;
user_index=0;
$(document).ready(function(){
	game_info.room_id=$("#leave_room").attr("room_id");
	user_id=$.cookie("user_id")
	//建立信道，实时刷新玩家
	if ("WebSocket" in window) {
        //alert("您的浏览器支持 WebSocket!");
        // 打开一个 web socket
        ws = new WebSocket("ws://127.0.0.1:8000/ws/room/"+game_info.room_id+"/");
        //ws = new WebSocket("ws://192.168.43.12:80/ws/room/"+game_info.room_id+"/");
        ws.onopen = function () {
            //当连接成功时，从数据库载入游戏信息
		    $.ajax({
		        async:false,
		        url:"/ajax/get_room_info/",
		        type:"post",
		        dataType:"json",
		        data:"&room_id=" + game_info.room_id,
		        headers:{"X-CSRFToken":$.cookie("csrftoken")},
		        success:function(info){
		            if(info=='false')
		            {
		            	alert("房间信息获取失败！");
		            	window.location.href="/hall/";
		            }
		            else
		            {
		            	game_info=info;
		            	game_info.room_id=$("#leave_room").attr("room_id");
		            	user_index=game_info.user_list[user_id];
		            	var list=game_info.player_list;
		            	var owner=game_info.user_list[game_info.owner];	
		            	//alert(owner);
		            	for (var player_index in list) {
		            		//alert(player_index)
		            		if(player_index==owner){
		            			$("#player"+player_index).text("房主 "+"玩家"+player_index+"："+list[player_index][1]);
		            			$("#start_game").show();
		            		}
		            		else
		            		{
		            			$("#player"+player_index).text("玩家"+player_index+"："+list[player_index][1]);
		            		}
		            		$("#player"+player_index).show();
		            	}
		            }
		        },
		    });
        };
        ws.onmessage = function (evt) {
            var mes = JSON.parse(evt.data);
            //确定消息类型
            switch(mes.type){
            	case "mes_member":
            		handle_member(mes.message);
            		break;
        		case "mes_game":
        			handle_game(mes.message);
            		break;
            }
        };
        ws.onclose = function () {
            // 关闭 websocket
            alert("连接已关闭...请不要重复打开网页！");
        };
    }
    else {
        // 浏览器不支持 WebSocket
        alert("您的浏览器不支持 WebSocket!");
    }
    $("#start_game").click(function(){
    	//检查玩家数量是否正确
    	$.ajax({
    		async:false,
		    url:"/ajax/ready_to_start/",
		    type:"post",
	        data:"&room_id=" + game_info.room_id,
	        headers:{"X-CSRFToken":$.cookie("csrftoken")},
	        success:function(result){
	        	if(result=="OK")
	        	{
	        		alert("ok");
	        		mes={type:"mes_game",message:"start"};
	        		ws.send(JSON.stringify(mes));
	        	}
	        	else{
	        		alert("玩家数量不足！");
	        	}
	        },
    	});
    })
});
//处理玩家信息变更
function handle_member(content){
	player_id = content.value[0]
	player_index = game_info.user_list[player_id];
	player_name = content.value[1];
	switch(content.change){
		//玩家加入
		case "add":
			//更新玩家
			//玩家列表更新
			player_list=game_info.player_list
			user_list=game_info.user_list
			//alert(player_id)
			if(user_list.hasOwnProperty(player_id)){break;}
			else{
				//alert("new");
				for(var i=1;i<20;i++)
				{
					if(player_list.hasOwnProperty(i)==false){
						player_index=i;
						player_list[player_index]=[player_id,player_name];
						user_list[player_id]=player_index;
						break;
					}
				}
			}
			$("#player"+player_index).text("玩家"+player_index+"："+player_name);
			$("#player"+player_index).show();
			break;
		//玩家离开
		case "leave":
			//更新玩家
			delete player_list[player_index];
			delete user_list[player_id];
			$("#player"+player_index).hide();
			break;
		//成为房主
		case "owner":
			if(player_index==user_index)
			{
				$("#start_game").show();
			}
			else{
				$("#start_game").hide();
			}		
			$("#player"+player_index).text("房主 玩家"+player_index+"："+player_list[player_index][1]);
			break;
	}
}

function handle_game(content){
	switch(content){
		case "start":
			//刷新并重载
			location.reload();
			break;
	}
}