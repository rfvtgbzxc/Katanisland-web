//玩家的类
class Player{
	constructor(static_player){
		for(let attr of Object.keys(static_player)){
			this[attr]=static_player[attr];
		}
		this.name=game_info.player_list[this.index][1];
	}
	src(src_name,op="null",op_num="null"){
		if(/^[0-9]+$/.test(src_name)){
			src_name=order[src_name];
		}
		if(typeof(op)=="number"){
			op_num=op;
			op="=";
		}
		if(op_num=="null"){
			return this[src_name+"_num"];
		}
		switch(op){
			case "null":
				this[src_name+"_num"]=op_num;
				break;
			case "=":
				this[src_name+"_num"]=op_num;
				break;
			case "+=":
				this[src_name+"_num"]+=op_num;
				break;
			case "-=":
				this[src_name+"_num"]-=op_num;
				break;
		}
		return this[src_name+"_num"];
	}
	dev(dev_name,op="null",op_num="null"){
		if(typeof(op)=="number"){
			op_num=op;
			op="=";
		}
		if(op_num=="null"){
			return this[dev_name+"_num"];
		}
		switch(op){
			case "null":
				this[dev_name+"_num"]=op_num;
				break;
			case "=":
				this[dev_name+"_num"]=op_num;
				break;
			case "+=":
				this[dev_name+"_num"]+=op_num;
				break;
			case "-=":
				this[dev_name+"_num"]-=op_num;
				break;
		}
		return this[dev_name+"_num"];
	}
}