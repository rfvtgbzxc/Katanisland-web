//用于处理websocket发送过来的消息
//只属于ws的封装函数
ws.sendmsg=function(typ,mes){
	evt={type:typ,message:mes};
	//debug模式下不会发送到channels
	if(debug){
		this.send("data="+JSON.stringify(evt));
	}
	else{
		this.send(JSON.stringify(evt));
	}
}
ws.onmessage=function(evt){

};