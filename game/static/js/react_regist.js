$(document).ready(function(){
	//提交注册信息
	$("#step_2").click(function(){
		if ("WebSocket" in window) {
            alert("您的浏览器支持 WebSocket!");

            // 打开一个 web socket
            ws = new WebSocket("ws://127.0.0.1:8000/chat/");

            ws.onopen = function () {
                // Web Socket 已连接上，使用 send() 方法发送数据
                ws.send("发送数据");
                alert("数据发送中...");
            };

            ws.onmessage = function (evt) {
                var received_msg = evt.data;
                alert("数据已接收...");
                alert("数据:" + received_msg)
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
		alert("再动");
	});

	$("#submit").click(function(){
		var psin=document.getElementById('psin');
		var psre=document.getElementById('psre');
		var username=document.getElementById('usnme');
		if(username.value=="")
		{
			alert("请输入用户名！");
		}
		else if(psin.value=="")
		{
			alert("请输入密码！");
		}
		else if(psin.value.length<6)
		{
			alert("密码太短，长度不应小于6位！")
		}
		else if(psre.value=="")
		{
			alert("请再次输入密码！")
		}
		else if(psin.value==psre.value)
		{
			username=username.value;
			psin=psin.value;
			//alert("注册成功！");
			$.ajax({
	            async:true,
	            url:"/regist/",
	            type:"post",
	            data:"&user_name=" + username + "&pswd=" + psin,
	            headers:{"X-CSRFToken":$.cookie("csrftoken")},
	            success:function(result){
	                if(result=='true')
	                {
	                	alert("注册成功！");
	                	window.location.href="/login/?username="+username;
	                }
	                else
	                {
	                	alert(result);
	                }
	            },
	        });
	        //alert("test");
			//return true
		}
		else
		{
			alert("两次密码不一致！");
		}
		//return false
	});
});