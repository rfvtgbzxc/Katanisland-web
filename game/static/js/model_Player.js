//玩家的类
class Player{
	constructor(static_player){
		for(let attr of Object.keys(static_player)){
			this[attr]=static_player[attr];
		}
		this.name=game_info.player_list[this.index][1];
		this.vp_update();
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
	vp_update(truth=false){
		var info=[0,0,0,0,0];
		var own_cities=this.own_cities;
		var all_cities=game_info.cities;
		for(i in own_cities){
			//仅适用于原版
			info[1-all_cities[own_cities[i]].level]+=(all_cities[own_cities[i]].level+1);
		}
		if(this.index==game_info.longest_road){
			info[2]+=2;
		}
		if(this.index==game_info.max_minitory){
			info[3]+=2;
		}
		if(truth){
			info[4]+=(this.score_shown.length+this.score_unshown.length);
		}
		else{
			info[4]+=this.score_shown.length;
		}
		var vp_sum=0;
		for(var i in info){
			vp_sum+=info[i];
		}
		this.vp=vp_sum;	
		return this.vp;
	}
	show_score_cards(target="all"){
		if(target=="all"){
			this.score_shown=this.score_shown.concat(this.score_unshown);
			this.score_unshown.length=0;
		}
		else{
			this.score_shown=this.score_shown.concat(target);
			for(let one of target){
				this.score_unshown.splice(this.score_unshown.indexOf(one),1);
			}		
		}
	}
}