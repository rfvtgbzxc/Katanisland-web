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
			return this.own_sources[src_name];
		}
		switch(op){
			case "=":
				this.own_sources[src_name];
				break;
			case "+=":
				this.own_sources[src_name];
				break;
			case "-=":
				this.own_sources[src_name];
				break;
		}
		return this.own_sources[src_name];
	}
	//--------------------------------------------------------
	// 获取发展卡数
	// 可以使用发展卡名称来获取,且可以使用操作符进行数量修改
	//--------------------------------------------------------
	dev(dev_name,op="null",op_num="null"){
		if(typeof(op)=="number"){
			op_num=op;
			op="=";
		}
		if(op_num=="null"){
			return this.own_dev_cards[dev_name];
		}
		switch(op){
			case "null":
				this.own_dev_cards[dev_name]=op_num;
				break;
			case "=":
				this.own_dev_cards[dev_name]=op_num;
				break;
			case "+=":
				this.own_dev_cards[dev_name]+=op_num;
				break;
			case "-=":
				this.own_dev_cards[dev_name]-=op_num;
				break;
		}
		return this.own_dev_cards[dev_name];
	}
	//--------------------------------------------------------
	// 获取分数卡数
	// 可以使用发展卡名称来获取,且可以使用操作符进行数量修改
	//--------------------------------------------------------
	score(card_tag,op="null",op_num="null"){
		if(typeof(op)=="number"){
			op_num=op;
			op="=";
		}
		if(op_num=="null"){
			return this.own_score_cards[card_tag];
		}
		switch(op){
			case "=":
				this.own_score_cards[card_tag]=op_num;
				break;
			case "+=":
				this.own_score_cards[card_tag]+=op_num;
				break;
			case "-=":
				this.own_score_cards[card_tag]-=op_num;
				break;
		}
		return this.own_score_cards[card_tag];
	}
	//--------------------------------------------------------
	// 获取总发展卡数(包括分数卡)
	//--------------------------------------------------------
	all_dev_num(){
		let count = 0;
		for(let card of dev_cards){
			count+=this.dev(card);
		}
		count+=this.all_score_num();
		return count;
	}
	//--------------------------------------------------------
	// 获取总分数卡数
	//--------------------------------------------------------
	all_score_num(){
		let count = 0;
		for(let card of score_cards){
			count+=this.score(card);
		}
		return count;
	}
}