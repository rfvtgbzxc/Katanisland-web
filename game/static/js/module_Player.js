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
		this.vp_update();
	}
	//--------------------------------------------------------
	// 获取资源数
	// 可以使用资源id或资源名来获取,且可以使用操作符进行数量修改
	//--------------------------------------------------------
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
	//--------------------------------------------------------
	// 获取总资源数
	//--------------------------------------------------------
	all_src_num(){
		return this.src("brick")+this.src("wood")+this.src("wool")+this.src("grain")+this.src("ore");
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
	// 更新胜利点数
	// truth：包括隐藏的分数卡
	//--------------------------------------------------------
	vp_update(truth=false){
		var info=[0,0,0,0,0];
		var own_cities=this.own_cities;
		var all_cities=$gameCities;
		for(i in own_cities){
			//仅适用于原版
			info[1-all_cities[own_cities[i]].level]+=(all_cities[own_cities[i]].level+1);
		}
		if(this.index==$gameSystem.longest_road){
			info[2]+=2;
		}
		if(this.index==$gameSystem.max_minitory){
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
	//--------------------------------------------------------
	// 展示分数卡
	//--------------------------------------------------------
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
	//--------------------------------------------------------
	// 获取城市数
	// lv:城市的等级 type:返回数量或数组
	//--------------------------------------------------------
	city_num(lv="all",type="count"){
		var cities=[];
		for(let city_id of this.own_cities){
			if(lv=="all" || $gameCities[city_id].level==lv){
				cities.push(city_id);
			}
		}
		if(type=="count"){
			return cities.length;
		}
		if(type=="all"){
			return cities;
		}
	}
	//--------------------------------------------------------
	// 检查资源的丢弃,如果没有丢出7不要
	//--------------------------------------------------------
}