//--------------------------------------------------------
// class Game_Bank
// 处理游戏卡片数据
//--------------------------------------------------------
class Game_Bank{
	//--------------------------------------------------------
	// 初始化,载入数据
	//--------------------------------------------------------
	constructor(static_bank){
		for(let attr of Object.keys(static_bank)){
			this[attr]=static_bank[attr];
		}
	}
	//--------------------------------------------------------
	// 获取资源数
	// 可以使用资源id或资源名来获取,且可以使用操作符进行数量修改
	//--------------------------------------------------------
	src(src_name,op="null",op_num="null"){
		if(/^[0-9]+$/.test(src_name)){
			var src_id = src_name;
			src_name=order[src_name];
		}
		else{var src_id = src_reflection[src_name];}
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
}