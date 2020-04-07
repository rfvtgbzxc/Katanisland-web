//玩家的类
class Game_Player{
	//--------------------------------------------------------
	// 初始化,载入数据
	//--------------------------------------------------------
	constructor(static_player){
		for(let attr of Object.keys(static_player)){
			this[attr]=static_player[attr];
		}
		this.name=$gameSystem.player_list[this.index][1];
	}
	//--------------------------------------------------------
	// 获取资源数
	// 可以使用资源id或资源名来获取,且可以使用操作符进行数量修改
	// show:使用自动消息来提示
	//--------------------------------------------------------
	src(src_name,op="null",op_num="null",show=true){
		var src_id = null;
		if(/^[0-9]+$/.test(src_name)){
			src_id = src_name;
			src_name=order[src_name];
		}
		else{src_id = src_reflection[src_name];}
		if(typeof(op)=="number"){
			op_num=op;
			op="=";
		}
		if(op_num=="null"){
			return this[src_name+"_num"];
		}
		var src_change = 0;	
		switch(op){		
		case "null":
			src_change = op_num - this[src_name+"_num"];
			if(show){his_window.player_get_item(this,src_id,src_change);}
			this[src_name+"_num"]=op_num;
			break;
		case "=":
			src_change = op_num - this[src_name+"_num"];
			if(show){his_window.player_get_item(this,src_id,src_change);}
			this[src_name+"_num"]=op_num;
			break;
		case "+=":
			this[src_name+"_num"]+=op_num;
			if(show){his_window.player_get_item(this,src_id,op_num);}
			break;
		case "-=":
			this[src_name+"_num"]-=op_num;
			if(show){his_window.player_get_item(this,src_id,op_num);}
			break;
		}
		return this[src_name+"_num"];
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
	//--------------------------------------------------------
	// 获取未展示分数卡数
	// 可以使用名称来获取,且可以使用操作符进行数量修改
	//--------------------------------------------------------
	score_unshown(card_tag,op="null",op_num="null"){
		if(typeof(op)=="number"){
			op_num=op;
			op="=";
		}
		if(op_num=="null"){
			return this.own_score_unshown[card_tag];
		}
		switch(op){
			case "=":
				this.own_score_unshown[card_tag]=op_num;
				break;
			case "+=":
				this.own_score_unshown[card_tag]+=op_num;
				break;
			case "-=":
				this.own_score_unshown[card_tag]-=op_num;
				break;
		}
		return this.score_unshown[card_tag];
	}
	//--------------------------------------------------------
	// 获取已展示分数卡数
	// 可以使用名称来获取,且可以使用操作符进行数量修改
	//--------------------------------------------------------
	score_shown(card_tag,op="null",op_num="null"){
		if(typeof(op)=="number"){
			op_num=op;
			op="=";
		}
		if(op_num=="null"){
			return this.own_score_shown[card_tag];
		}
		switch(op){
			case "=":
				this.own_score_shown[card_tag]=op_num;
				break;
			case "+=":
				this.own_score_shown[card_tag]+=op_num;
				break;
			case "-=":
				this.own_score_shown[card_tag]-=op_num;
				break;
		}
		return this.own_score_shown[card_tag];
	}
	//--------------------------------------------------------
	// 获取总资源数
	//--------------------------------------------------------
	all_src_num(){
		let count = 0;
		for(let name of src_cards){
			count+=this.src(name);
		}
		return count;
	}
	//--------------------------------------------------------
	// 获取总发展卡数(包括未展示的分数卡)
	//--------------------------------------------------------
	all_dev_num(){
		let count = 0;
		for(let name of dev_cards){
			count+=this.dev(name);
		}
		count+=this.all_score_num("unshown");
		return count;
	}
	//--------------------------------------------------------
	// 获取总分数卡数
	// type:all 隐藏和展示的 ,unshown 隐藏的, shown 展示的
	//--------------------------------------------------------
	all_score_num(type="all"){
		let count = 0;
		if(type=="all" || type=="unshown"){
			for(let card of score_cards){
				count+=this.score_unshown(card);
			}
		}
		if(type=="all" || type=="shown"){
			for(let card of score_cards){
				count+=this.score_shown(card);
			}
		}
		return count;
	}
	//--------------------------------------------------------
	// 获取拥有的港口(交易能力)
	//--------------------------------------------------------
	all_harbours(){
		var harbours=[];
		for(let city of this.cities()){
			if(city.ex_type.length!=0){
				harbours=union(harbours,city.ex_type);
			}
		}
		return harbours;
	}
	//--------------------------------------------------------
	// 获取胜利点数
	// truth：包括隐藏的分数卡
	//--------------------------------------------------------
	vp(truth=false){
		var info=this.vp_info(truth);
		var vp_sum=0;
		for(var i in info){
			vp_sum+=info[i];
		}
		return vp_sum;
	}
	//--------------------------------------------------------
	// 获取胜利点数信息
	// truth：包括隐藏的分数卡
	//--------------------------------------------------------
	vp_info(truth=false){
		var info=[0,0,0,0,0];
		var all_cities=$gameCities;
		for(let city_id of this.own_cities){
			//仅适用于原版
			info[1-$gameCities[city_id].level]+=($gameCities[city_id].level+1);
		}
		if(this.index==$gameSystem.longest_road){
			info[2]+=2;
		}
		if(this.index==$gameSystem.max_minitory){
			info[3]+=2;
		}
		if(truth){
			info[4]+=this.all_score_num("all");
		}
		else{
			info[4]+=this.all_score_num("shown");
		}
		return info;
	}
	//--------------------------------------------------------
	// 展示分数卡
	//--------------------------------------------------------
	show_score_cards(target="all"){
		if(target=="all"){
			for(let card of score_cards){
				this.score_shown(card,"+=",this.score_unshown(card));
				this.score_unshown(card,"=",0);
			}
		}
		else{
			for(let card of target){
				this.score_shown(card,"+=",this.score_unshown(card));
				this.score_unshown(card,"=",0);
			}	
		}
	}
	//--------------------------------------------------------
	// 获取城市
	// lv:城市的等级
	//--------------------------------------------------------
	cities(lv="all"){
		var cities=[];
		for(let city_id of this.own_cities){
			if(lv=="all" || $gameCities[city_id].level==lv){
				cities.push($gameCities[city_id]);
			}
		}
		return cities;
	}
}