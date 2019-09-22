/*复杂的交易逻辑的控制模块
	成员：
	id：这笔交易的唯一序号
	stater：交易发起者
	accepter：交易目标(对于与银行交易,0为银行,1-5为资源港，6为任意港)
	trade_state：交易状态
	final_accepter：最终与交易发起者达成交易者
	give_list：发起者给予物资
	get_list：接受者给予物资

  
*/
class Transaction{
	constructor(accepter=0){
		//已默认创建交易者一定是本地玩家,交易对象是所有人
		this.id=trade_count;
		this.stater=user_index;
		this.accepter=accepter;
		this.trade_state="prepare";
		stater_list={};
		accepter_list={};
		trade_count++;
		game.trades[this.id]=this;
	}
	//交易列表更新
	item_refresh(){
		//获取交易栏的所有资源
		this.stater_list={};
		this.accepter_list={};
		var items1=game_UI_list.trade_items._give.selected;
		var items2=game_UI_list.trade_items._get.selected;
		for(var i in items1){
			var UI_id=items1[i];
			var item=game_UI[UI_id];
			if(item.own_num==0){continue;}
			this.stater_list[src_reflection[item.item_type]]=item.own_num;
		}
		for(var i in items2){
			var UI_id=items2[i];
			var item=game_UI[UI_id];
			if(item.own_num==0){continue;}
			this.accepter_list[src_reflection[item.item_type]]=item.own_num;
		}
	}



}