//--------------------------------------------------------
// SaberExtend.js
// 卡坦岛骑士拓展
//--------------------------------------------------------
function SaberExtend(){
	throw new Error('This is a static class');
}
SaberExtend.alias={};
//------------------基础参数--------------------
SaberExtend.extraData        = true;
SaberExtend.extraGameEvent   = true;
ExtendManager.registExtend(SaberExtend);
console.trace();
console.log("SaberExtend load success!");
//---------------------------------------------
//------------------新的数据--------------------
var $gameSabers = null;
src_cards.push("coin","paper","crystal");
dev_cards.push(
	"irrigation","alchemist","crane","engineer","inventor","medicine","mining","road_building","smith",
	"bishop","diplomat","deserter","intrigue","saboteur","spy","warlord","wedding",
	"commercial_harbor","master_merchant","merchant","merchant_fleet","resource_monopoly","trade_monopoly");
src_ch["coin"]="钱币";
src_ch["paper"]="纸张";
src_ch["crystal"]="宝石";
var extra_create={
	2:"paper",
	3:"coin",
	5:"crystal"
}
var develop_types=["commerce","science","politic"];
var develop_names={
	"commerce":["商业","市场","账房","商会","银行","贸易中心"],
	"science":["科技","修道院","图书馆","工场","大学","皇家学会"],
	"politic":["政治","祠堂","市政厅","要塞","外交部","卡坦议会"]
}
var dev_type_to_src={
	"commerce":"coin",
	"science":"paper",
	"politic":"crystal"
}
window_configs["drop_window"]={
	key:"drop",
	selected_item_class:Selected_Drop_item,
	availale_item_class:Available_Drop_item,
	controller:{
		close_button:false,
		window_head_text:"丢弃资源",
		inner_head_text:"需要舍弃的资源",
		confirm_button_text:"舍弃资源",
		top_limit:0
	},
	item_num:function(key){return $gameSystem.self_player().src(key);},
	final:function(selected_list){ws.sendmsg("mes_action",{"starter":user_index,"val":[10,selected_list]});}
}
menu_lists.use_dev.template=`<button type="button" class="use_dev list-group-item" action="{{key}}" help="{{dev_info.intro}}"><span class="field_tag" field={{dev_info.field}}></span>{{dev_info.name}}<span class="dev_num"></span></button>`;
//--------------------------------------------------------
// 覆写建造内容
// 将基础建设移至第二层,第一层是两个选项,基础建设和城市发展
//--------------------------------------------------------
//--------------------------------------------------------
// 额外建造内容
//--------------------------------------------------------
//--------------------------------------------------------
// 建造城墙
//--------------------------------------------------------
/*DynamicMenu.add_menu_item("base_build",{
	key:"build_wall",
	name:"建造城墙",
	intro:"为一座城市添加城墙,每座城墙可以提高两张手牌上限。每个城市只能有一座城墙,每位玩家只能有三座城墙。",
	costlist:[{type:"brick",num:2}],
	on_active:{
		selected_point:0,
		run:async function(){
			try{
				var selector,point_id,action;
				if(this.start()){
					while(true){
						[selector,point_id] = await GameUI.next_step();
						//打开确认窗口
						this.selected_point=point_id;
						confirm_window.set("要在这里建造城墙吗?");
						confirm_window.show();
						[selector,action] = await GameUI.next_step();
						if(action=="confirm"){
							this.final();
							break;
						}
					}
				}					
			}
			catch(e){
				//使用trycatch来以更直接的方式结束等待闭环
				if(e.message=="breakPromiseLine"){return;}
				throw e;
			}
		},
		start:function(){
			//资源消耗提示
			var player=$gameSystem.self_player();
			//激活点选择器,只激活可以升级的地方
			var points=city_num(player,1,"all");
			for(var i in points){
				var selector=$("pt_selector").filter("#"+points[i])
				selector.addClass("active").show();
				//资源不足则改变样式
				if(player.src("brick")<2){
					selector.attr("tip","资源不足").addClass("selector_disabled");
				}
				else{
					selector.addClass("selector_available");
				}
			}
			return !(player.src("brick")<2);
		},
		final:function(){
			ws.sendmsg("mes_action",{"starter":user_index,"val":[1,3,this.selected_point]});
		}
	}
});*/

//--------------------------------------------------------
// 招募骑士
//--------------------------------------------------------
DynamicMenu.add_menu_item("base_build",{
	key:"recruit_knight",
	name:"招募骑士",
	intro:"招募一名新的初级骑士为你服务,骑士可以为你驱赶强盗,占据地形,以及抵抗蛮族的入侵。骑士有初级、中级、高级三种,每位玩家每种等级的骑士只能存在两名。",
	costlist:[{type:"wool",num:1},{type:"ore",num:1}],
	on_active:{
		run:async function(){
			try{
				var valid = this.start();
				[selector,action] = await GameUI.next_step();
				if(action=="confirm" && valid){this.final();}
			}
			catch(e){
				//使用trycatch来以更直接的方式结束等待闭环
				if(e.message=="breakPromiseLine"){return;}
				throw e;
			}
		},
		start:function(){
			var player=$gameSystem.self_player();
			if(player.src("wool")==0 || player.src("ore")==0){
				confirm_window.set("资源不足！");
				confirm_window.show();
				return false;
			}
			else{
				confirm_window.set(`要招募新的初级骑士吗？`);
				confirm_window.show();
				return true;
			}	
		},
		final:function(){
			ws.sendmsg("mes_action",{"starter":user_index,"val":[1,4,0,$gameBank.all_dev_num()]});
		}
	}
});
//--------------------------------------------------------
// 城市发展：统一状态机
//--------------------------------------------------------
promiseLineTemplates.ActionCityDevelop = class extends PromiseLineBase{
	constructor(diy_attrs={}){
		super(diy_attrs);
		this.develop_type=diy_attrs.develop_type;
		this.develop_level=diy_attrs.develop_level;
		this.src_require={type:dev_type_to_src[diy_attrs.develop_type],num:diy_attrs.develop_level}
	}
	async promiseLine(){
		var valid = this.start();
		[selector,action] = await GameUI.next_step();
		if(action=="confirm" && valid){this.final();}
	}
	start(){
		var player=$gameSystem.self_player();
		if(player.src(this.src_require.type)<this.src_require.num){
			confirm_window.set("资源不足！");
			confirm_window.show();
			return false;
		}
		else{
			confirm_window.set(`要将${develop_names[this.develop_type][0]}发展至第${this.develop_level}级：${develop_names[this.develop_type][this.develop_level]}吗？`);
			confirm_window.show();
			return true;
		}	
	}
	final(){
		ws.sendmsg("mes_action",{"starter":user_index,"val":[1,5,this.develop_type,this.develop_level]});
	}
}
//--------------------------------------------------------
// 城市发展
//--------------------------------------------------------
DynamicMenu.add_city_develop_action = function(develop_type,develop_level){
	DynamicMenu.add_menu_item("base_build",{
		key:`develop_cities${develop_type}${develop_level}`,
		disable_when_affordless:true,
		name:`${develop_names[develop_type][0]}:${develop_names[develop_type][develop_level]}`,
		intro:`将${develop_names[develop_type][0]}领域发展到第${develop_level}级:${develop_names[develop_type][develop_level]}。领域等级越高,获得对应类型的发展卡概率越高；领域发展到三级后可以解锁特殊效果；领域发展到四级后可以角逐对应领域的荣誉:大都会。`,
		costlist:[{type:dev_type_to_src[develop_type],num:develop_level}],
		develop_type:develop_type,
		develop_level:develop_level,
		on_active:new promiseLineTemplates.ActionCityDevelop({
			develop_type:develop_type,
			develop_level:develop_level
		})
	});
}
for(let dev_type of develop_types){
	for(let i=1;i<6;i++){
		DynamicMenu.add_city_develop_action(dev_type,i);
	}
}

//--------------------------------------------------------
// 新的发展卡
//--------------------------------------------------------
DynamicMenu.add_use_dev_item = function(key,on_active){
	DynamicMenu.add_menu_item("use_dev",{
		key:key,
		dev_info:$dataDevCards[key],
		on_active:on_active
	});
}
//--------------------------------------------------------
// 灌溉
//--------------------------------------------------------
$dataDevCards["irrigation"]={
	name:"灌溉",
	field:"science",
	intro:"农田附近如果有你的城市或定居点，每有一块这样的农田，你收获2份麦子。",
}
DynamicMenu.add_use_dev_item("irrigation",{
	run:async function(){
		this.start();
		try{
			[selector,action] = await GameUI.next_step();
			if(action=="confirm"){this.final();}
		}
		catch(e){
			//使用trycatch来以更直接的方式结束等待闭环
			if(e.message=="breakPromiseLine"){return;}
			throw e;
		}
	},
	start:function(){
		//计算可以丰收麦子的地块,点亮其selector
		var avaliable_places=sQuery("place",$gameSystem.all_palces()).filter((place_id)=>map_info.places[place_id].create_type==4)
		.filter((place_id)=>sQuery("place",place_id).near_points().filter((point_id)=>$gameSystem.self_player().own_cities.indexOf(point_id)>-1).get_list().length>0)
		.show_selectors().get_list();
		confirm_window.set(`一共可以收获${avaliable_places.length*2}份麦子,要使用灌溉吗?`);
		confirm_window.show();
	},
	final:function(){
		ws.sendmsg("mes_action",{"starter":user_index,"val":[3,6]});
	}
});
//--------------------------------------------------------
// 术士
//--------------------------------------------------------
$dataDevCards["alchemist"]={
	name:"术士",
	field:"science",
	intro:"在投骰子前使用，你可以决定两个数字骰的数字。",
}
DynamicMenu.add_use_dev_item("alchemist",()=>console.log("dev card undefined"));
//--------------------------------------------------------
// 起重机
//--------------------------------------------------------
$dataDevCards["crane"]={
	name:"起重机",
	field:"science",
	intro:"使用该发展卡进行城市发展时，可以少消耗一份商品。",
}
DynamicMenu.add_use_dev_item("crane",()=>console.log("dev card undefined"));
//--------------------------------------------------------
// 工程师
//--------------------------------------------------------
$dataDevCards["engineer"]={
	name:"工程师",
	field:"science",
	intro:"你可以免费建造一座城墙。",
}
DynamicMenu.add_use_dev_item("engineer",()=>console.log("dev card undefined"));
//--------------------------------------------------------
// 发明家
//--------------------------------------------------------
$dataDevCards["inventor"]={
	name:"发明家",
	field:"science",
	intro:"你可以交换任意两个数字圆片，但其中不能有2,12,6,8。",
}
DynamicMenu.add_use_dev_item("inventor",()=>console.log("dev card undefined"));
//--------------------------------------------------------
// 医学
//--------------------------------------------------------
$dataDevCards["medicine"]={
	name:"医学",
	field:"science",
	intro:"使用该发展卡升级城市时，可以少消耗一份麦子和一份铁矿。",
}
DynamicMenu.add_use_dev_item("medicine",()=>console.log("dev card undefined"));
//--------------------------------------------------------
// 采矿
//--------------------------------------------------------
$dataDevCards["mining"]={
	name:"采矿",
	field:"science",
	intro:"矿山附近如果有你的城市或定居点，每有一块这样的矿山，你收获2份铁矿。",
}
DynamicMenu.add_use_dev_item("mining",()=>console.log("dev card undefined"));
//--------------------------------------------------------
// 修路
//--------------------------------------------------------
$dataDevCards["road_building"]={
	name:"修路",
	field:"science",
	intro:"立刻无消耗修建两条道路，只要满足修建的基本规则即可。",
}
DynamicMenu.add_use_dev_item("road_building",()=>console.log("dev card undefined"));
//--------------------------------------------------------
// 铁匠
//--------------------------------------------------------
$dataDevCards["smith"]={
	name:"铁匠",
	field:"science",
	intro:"立刻无消耗升级你的两个骑士，只要满足基本的升级规则即可。",
}
DynamicMenu.add_use_dev_item("smith",()=>console.log("dev card undefined"));
//--------------------------------------------------------
// 主教
//--------------------------------------------------------
$dataDevCards["bishop"]={
	name:"主教",
	field:"politic",
	intro:"使用后，按照正常规则移动强盗，并从强盗新的占据地块周围所有的有定居点或城市坐落的玩家那里掠夺一份资源。",
}
DynamicMenu.add_use_dev_item("bishop",()=>console.log("dev card undefined"));
//--------------------------------------------------------
// 外交官
//--------------------------------------------------------
$dataDevCards["diplomat"]={
	name:"外交官",
	field:"politic",
	intro:"选择一条末端没有其他道路、定居点、城市以及骑士的道路，将其移除，如果这条道路是你的，你可以立刻免费再修一条道路。",
}
DynamicMenu.add_use_dev_item("diplomat",()=>console.log("dev card undefined"));
//--------------------------------------------------------
// 叛徒
//--------------------------------------------------------
$dataDevCards["deserter"]={
	name:"叛徒",
	field:"politic",
	intro:"选择一名拥有骑士对手，该对手必须选择自己的一个骑士移除，之后你可以立刻无消耗招募一个与该骑士等级相同的骑士，即使这个骑士是三级骑士，而你没有发展政治到堡垒。但依然遵循每个等级只能有两名骑士的规则。",
}
DynamicMenu.add_use_dev_item("deserter",()=>console.log("dev card undefined"));
//--------------------------------------------------------
// 阴谋
//--------------------------------------------------------
$dataDevCards["intrigue"]={
	name:"阴谋",
	field:"politic",
	intro:"你可以直接驱逐一位占据在你道路末端的骑士。",
}
DynamicMenu.add_use_dev_item("intrigue",()=>console.log("dev card undefined"));
//--------------------------------------------------------
// 破坏
//--------------------------------------------------------
$dataDevCards["saboteur"]={
	name:"破坏",
	field:"politic",
	intro:"选择一个对手的城市，将其破坏，破坏后的城市除了不能收获资源、不能成为大都会的载体以外没有其他影响，只有消耗一份铁矿和一份木头才能恢复正常。",
}
DynamicMenu.add_use_dev_item("saboteur",()=>console.log("dev card undefined"));
//--------------------------------------------------------
// 间谍
//--------------------------------------------------------
$dataDevCards["spy"]={
	name:"间谍",
	field:"politic",
	intro:"选择一个对手，查看他的所有发展卡，之后可以选择一张发展卡归为己有。",
}
DynamicMenu.add_use_dev_item("spy",()=>console.log("dev card undefined"));
//--------------------------------------------------------
// 军阀
//--------------------------------------------------------
$dataDevCards["warlord"]={
	name:"军阀",
	field:"politic",
	intro:"立刻无消耗激活你的所有骑士。",
}
DynamicMenu.add_use_dev_item("warlord",()=>console.log("dev card undefined"));
//--------------------------------------------------------
// 婚礼
//--------------------------------------------------------
$dataDevCards["wedding"]={
	name:"婚礼",
	field:"politic",
	intro:"使用后，所有胜利点比你高的对手都要选择两份资源/商品赠送给你。",
}
DynamicMenu.add_use_dev_item("wedding",()=>console.log("dev card undefined"));
//--------------------------------------------------------
// 商业码头
//--------------------------------------------------------
$dataDevCards["commercial_harbor"]={
	name:"商业码头",
	field:"commerce",
	intro:"使用后，以任意顺序对每一位有至少一份商品的玩家发起强制交易：你给某位玩家一份资源，该玩家给你一份商品。",
}
DynamicMenu.add_use_dev_item("commercial_harbor",()=>console.log("dev card undefined"));
//--------------------------------------------------------
// 奸商
//--------------------------------------------------------
$dataDevCards["master_merchant"]={
	name:"奸商",
	field:"commerce",
	intro:"选择一个胜利点比你高的对手，查看他的所有资源和商品，之后可以选择其中两份归为己有。",
}
DynamicMenu.add_use_dev_item("master_merchant",()=>console.log("dev card undefined"));
//--------------------------------------------------------
// 商人
//--------------------------------------------------------
$dataDevCards["merchant"]={
	name:"商人",
	field:"commerce",
	intro:"将商人放置在你的定居点或城市周围的地块上，并获得商人的控制权，在商人控制权被别人抢走前，你将拥有一点胜利点，以及商人所在地块对应类型资源和商品的2:1交易能力。",
}
DynamicMenu.add_use_dev_item("merchant",()=>console.log("dev card undefined"));
//--------------------------------------------------------
// 商船队
//--------------------------------------------------------
$dataDevCards["merchant_fleet"]={
	name:"商船队",
	field:"commerce",
	intro:"使用后，你本回合可以任意次使用任意资源/商品在银行进行2:1交易。",
}
DynamicMenu.add_use_dev_item("merchant_fleet",()=>console.log("dev card undefined"));
//--------------------------------------------------------
// 资源垄断
//--------------------------------------------------------
$dataDevCards["resource_monopoly"]={
	name:"资源垄断",
	field:"commerce",
	intro:"选择一种资源，所有玩家将最多两份该资源交给你。",
}
DynamicMenu.add_use_dev_item("resource_monopoly",()=>console.log("dev card undefined"));
//--------------------------------------------------------
// 贸易垄断
//--------------------------------------------------------
$dataDevCards["trade_monopoly"]={
	name:"贸易垄断",
	field:"commerce",
	intro:"选择一种商品，所有玩家将最多一份该商品交给你。",
}
DynamicMenu.add_use_dev_item("trade_monopoly",()=>console.log("dev card undefined"));
//---------------------------------------------
SaberExtend.loadExtraData = function(contents){
	$gameSabers = contents.sabers;
}
SaberExtend.saveExtraData = function(contents){
	contents.sabers = $gameSabers;
}
//--------------------------------------------------------
// UI拓展
//--------------------------------------------------------
//--------------------------------------------------------
// UI：城市发展详细信息
//--------------------------------------------------------
$("#players").on("mouseenter","dev_process",
    function(event){
		//设置内容
		info_window.empty();
		var player_index=$(this).parent().parent().attr("id");
		var dev_type=$(this).attr("dev_type");
		var dev_process=$gamePlayers[player_index].dev_process[dev_type];
		if(dev_process==0){
			info_window.push(`尚未发展${develop_names[dev_type][0]}`);
		}
		else{
			info_window.push(`${develop_names[dev_type][0]}发展进度：${dev_process} ${develop_names[dev_type][dev_process]}`);
		}		
		$("info_window").show();
    }
);
$("#players").on("mouseleave","dev_process",
    function(event){
		$("info_window").hide();
    }
);
//--------------------------------------------------------
// 函数覆写
//--------------------------------------------------------
//--------------------------------------------------------
// 重载游戏
//--------------------------------------------------------
function reload_game(){
	//检测当前游戏状态
	switch($gameSystem.game_process){
	//尚未开始
	case 0:
		//等待所有玩家加入完毕
		break;
	//投掷骰子
	case 1:
		if(!$gameSystem.is_audience()){		
			UI_start_dice();
			if($gameSystem.self_player().first_dice[0]!=0){
				var nums = $gameSystem.self_player().first_dice;
				var num_sum = nums[0] + nums[1];
				his_window.push("正在确定行动顺序,你已投骰,共计 "+num_sum,"important");
				UI_set_dices(nums[0],nums[1]);
			}
			else{
				his_window.push("所有玩家准备就绪,开始确定行动顺序,请投骰子：","important");
			}
		}
		break;
	//前期坐城
	case 2:
		create_step_list();
		if(!$gameSystem.is_audience()){
			//在自己的回合,进行判断
			if($gameSystem.is_own_turn()){
				var own_cities = $gameSystem.active_player().own_cities
				UI_start_set_home($gameSystem.active_player().home_step,own_cities[own_cities.length-1]);
			}		
		}
		break;
	//正常游戏
	case 3:
		create_step_list();
		UI_begin_turn();
		//是否已经投骰?
		if($gameSystem.dice_num[0]!=0){
			UI_set_dices(...$gameSystem.dice_num);
			//查看投出7的进行状态
			if($gameSystem.dice_step==0){
				//由于非正交的层级设计,如果不是自己回合该函数没有任何作用= =,不过会打开计时器
				UI_start_build();
			}
			else{
				if(!$gameSystem.is_audience()){
					switch($gameSystem.dice_step){
					case 1:
						GameEvent.resolve_dice.setup_step_1();
						break;
					case 4:
						GameEvent.resolve_dice.setup_step_4();
						break;
					case 5:
						GameEvent.resolve_dice.setup_step_5();
						break;
					}
				}
				break;
			}
			if(!$gameSystem.is_audience()){
				//检查交易并显示
				for(let trade_id of $gameSystem.active_trades){
					let trade = $gameTrades[trade_id];
					if(trade.accepter_index==user_index){
						his_window.push($gamePlayers[trade.starter_index].name+" 想要与你交易","important");
						show_special_actions("trade",trade.starter_index);
						break;
					}
				}	
			}			
		}
		break;	
	}
}
//--------------------------------------------------------
// 投骰子
//--------------------------------------------------------
function drop_dice(){
	//发送消息
	if(game_info.game_process==1){
		ws.sendmsg("mes_action",{"starter":user_index,"val":[9,0]});
	}
	else{
		ws.sendmsg("mes_action",{"val":[10],"randoms":[6,6,6]});
	}
}
//--------------------------------------------------------
// 获取总发展卡数(包括分数卡)
// field:对应领域
//--------------------------------------------------------
Game_Bank.prototype.all_dev_num = function(field){
	var count = 0;
	for(let dev of dev_cards){
		if(field==$dataDevCards[dev].field){
			count+=this.dev(dev);
		}
	}
	for(let score of score_cards){
		if(field==$dataScoreCards[score].field){
			count+=this.score(score);
		}
	}
	return count;
}
//--------------------------------------------------------
// 获取一张随机的发展卡（包括分数卡）
// field:对应领域
//--------------------------------------------------------
Game_Bank.prototype.random_dev_card = function(field,randomint){
	//根据随机数判断发展卡的类型
	var count=randomint;
	var radom_list=[];
	for(let dev of dev_cards){
		if(field==$dataDevCards[dev].field){
			radom_list.push(["dev",dev]);
		}
	}
	for(let score of score_cards){
		if(field==$dataScoreCards[score].field){
			radom_list.push(["score",dev]);
		}
	}
	for(let [itemtype,itemkey] of radom_list){
		if(count<this[itemtype](itemkey)){
			return [itemtype,itemkey];
		}
		count-=this[itemtype](itemkey);
	}
	console.error("error:unvalid randomint");
	return false;
}
//--------------------------------------------------------
// 函数拓展
//--------------------------------------------------------
//--------------------------------------------------------
// 加载骰子
//--------------------------------------------------------
SaberExtend.alias.create_dices = create_dices;
create_dices = function(){
	SaberExtend.alias.create_dices();
	$("dice_list").append(`<dice dice_id="0"></dice>`);
	$("dice_list").append(`<dice type="red" dice_id="1"></dice>`);
	$("dice_list").append(`<dice type="dev" dice_id="2"></dice>`);
};
//--------------------------------------------------------
// 额外玩家标记：发展进度
//--------------------------------------------------------
SaberExtend.alias.create_player_info = create_player_info;
create_player_info = function(player_state,player){
	SaberExtend.alias.create_player_info(player_state,player);
	player_state.append(`
	<dev_process_list>
		<dev_process class="commerce" dev_type="commerce"></dev_process>	
		<dev_process class="science" dev_type="science"></dev_process>	
		<dev_process class="politic" dev_type="politic"></dev_process>
	</dev_process_list>
	`)
	var dev_process_list = player_state.children().filter("dev_process_list");
	if(player.index==user_index){
		dev_process_list.children().addClass("self");
	}
	for(let type of develop_types){
		let develop_state=dev_process_list.children().filter(`.${type}`);
		develop_state.text(player.dev_process[type]);
		if(player.dev_process[type]==0){
			develop_state.addClass("initial");
		}
	}
};
//--------------------------------------------------------
// 筛选合适的城市发展按钮
//--------------------------------------------------------
SaberExtend.alias.visible_base_build = Game_System.prototype.visible_base_build;
Game_System.prototype.visible_base_build = function(action){
	var result = SaberExtend.alias.visible_base_build(action);
	if(!result){return false;}
	if(action.hasOwnProperty("develop_type")){
		if((action.develop_level-1)!=this.self_player().dev_process[action.develop_type]){
			return false;
		}
	}
	return true;
}
//--------------------------------------------------------
// 资源不足禁用
//--------------------------------------------------------
SaberExtend.alias.usable_base_build = Game_System.prototype.usable_base_build;
Game_System.prototype.usable_base_build = function(action){
	let [result,reason] = SaberExtend.alias.usable_base_build(action);
	if(!result){return [result,reason];}
	for(let cost of action.costlist){
		if(this.self_player().src(cost.type)<cost.num && !!action.disable_when_affordless){
			result = false;
			reason = "资源不足";
			return [result,reason];
		}
	}
	return [result,reason];
}
//--------------------------------------------------------
// 前期坐城：额外城市升级
//--------------------------------------------------------
SaberExtend.alias.set_home = GameEvent.set_home;
GameEvent.set_home = function(step,val,setter_index){
	SaberExtend.alias.set_home(step,val,setter_index);
	if(step==2){
		this.set_city_level(val,1);
	}
};
//--------------------------------------------------------
// 港口额外的交易项
//--------------------------------------------------------
SaberExtend.alias.initialize_trade_config = initialize_trade_config;
initialize_trade_config = function(target,target_val){
	var [trade_ratio,starter_available,accepter_available,starter_selected,accepter_selected,src_secret_starter,src_secret_accepter,starter,accepter,can_trade]=SaberExtend.alias.initialize_trade_config(target,target_val);
	if(target=="harbour"){
		starter_available.push(extra_create[target_val]);
	}
	return [trade_ratio,starter_available,accepter_available,starter_selected,accepter_selected,src_secret_starter,src_secret_accepter,starter,accepter,can_trade];
}
//--------------------------------------------------------
// 额外事件
//--------------------------------------------------------
//--------------------------------------------------------
// 主处理
//--------------------------------------------------------
SaberExtend.execute_event = function(event){
	var val=event.val;
	switch(val[0]){
	//建造
	case 1:
		switch(val[1]){
		//城市发展
		case 5:
			GameEvent.city_develop(event.starter,val[2],val[3]);
			break;
		}
		break;
	//骰子相关
	case 10:
		GameEvent.resolve_dice(event);
		break;
	}
}
//--------------------------------------------------------
// 设置骰子,以及对应的一系列事件
//--------------------------------------------------------
GameEvent.resolve_dice = function(event){
	switch($gameSystem.dice_step){
	case 0:{
		let [num1,num2,num3] = [event.randoms[0]+1,event.randoms[1]+1,event.randoms[2]%2*parseInt((event.randoms[2]+1)/2)];
		let field = develop_types[num3-1];
		//设置骰子数字,处理事件骰
		$gameSystem.dice_num = [num1,num2,num3];
		UI_set_dices(num1,num2,num3);
		his_window.push(`掷出点数：${num1+num2}`);
		if(num3==0){
			his_window.push(`蛮族更近了一步……`);
			GameEvent.resolve_dice.event_dice_finish();
		}
		else{
			//请求抽取发展卡结果,并进入下一步
			//GameEvent.resolve_dice.event_dice_finish();
			GameEvent.resolve_dice.setup_step_1(field,num2);	
		}
	}	
	break;
	//等待抽取发展卡结果中,收到随机数
	case 1:{
		let num2 = $gameSystem.dice_num[1];
		let field = develop_types[$gameSystem.dice_num[2]-1];
		let randoms = event.randoms;
		//顺序回归
		for(let player_index of $gameSystem.make_player_list_by_order()){
			let player = $gamePlayers[player_index];
			//该玩家的对应领域发展程度大于等于骰子数即可获得发展卡
			if(player.dev_process[field]>=num2){
				let [type,key]=$gameBank.random_dev_card(field,randoms.shift());
				if(player_index==user_index){
					his_window.push(`你获得了一张发展卡：${$dataDevCards[key].name}`);
				}
				else{
					his_window.push(`${player.name}获得了一张发展卡`);
				}
				player[type](key,"+=",1);
			}
		}
		GameEvent.resolve_dice.event_dice_finish();
	}
	break;
	//丢弃资源中,有玩家丢弃资源
	case 4:
		//遍历丢弃列表,舍弃对应数字
		let dropper_index = event.starter;
		let drop_list = event.val[1];	
		let dropper=$gamePlayers[dropper_index];
		for(var src in drop_list){
			dropper.src(src,"-=",drop_list[src],false);
			his_window.push(dropper.name+" 丢弃了 "+src_ch[src]+" x "+drop_list[src]);
		}
		//如果是自己所为,进行回调关闭窗口
		if(dropper_index==user_index){
			$("simple_item_select_window").hide();
		}
		//完成丢弃后,检查recive_list,如果recive_list被清空,进入阶段5：设置强盗
		if($gameSystem.msg_recive(dropper_index)){
			GameEvent.resolve_dice.setup_step_5();
		}
		else if(dropper_index==user_index){
			his_window.push("等待其他玩家选择丢弃资源...");
		}
		break;
	//设置强盗中,最终决定强盗
	case 5:
		//体验一下解构赋值,不过好像有点乱,中间的两个逗号不要删
		let [robber_index,,place_id,victim_index,randomint] = [event.starter,...event.val,event.randoms[0]];
		GameEvent.set_robber(place_id);
		rob_player(robber_index,victim_index,randomint);
		GameEvent.resolve_dice.setup_step_0();
		break;
	}
}
//--------------------------------------------------------
// 骰子处理：开始处理事件骰之后的内容
//--------------------------------------------------------
GameEvent.resolve_dice.event_dice_finish = function(){
	//丢出7,生成资源丢弃表,尝试丢弃资源
	let [num1,num2,] = $gameSystem.dice_num;
	if(7==num1+num2){
		let recive_list = [];
		//生成recive_list：所有玩家检查自己的资源数,大于七则触发丢弃选择,如果未大于7则不处于recive_list。
		for(let player_index of $gameSystem.make_player_list_by_order()){
			let player = $gamePlayers[player_index];
			if(player.all_src_num()>7){
				recive_list.push(player_index);
			}
		}
		$gameSystem.recive_list = recive_list;
		//如果recive_list为空,直接进入下一步：等待设置强盗
		if($gameSystem.recive_list.length==0){
			GameEvent.resolve_dice.setup_step_5();
		}
		else{
			GameEvent.resolve_dice.setup_step_4();
		}
	}
	else{
		//收获资源
		GameEvent.harvest_by_dice(num1+num2);
		GameEvent.resolve_dice.setup_step_0();
	}
}
//--------------------------------------------------------
// 骰子处理：进入步骤0：回归正常状态
//--------------------------------------------------------
GameEvent.resolve_dice.setup_step_0 = function(){
	$gameSystem.dice_step = 0;
	//开始建设
	UI_start_build();
}
//--------------------------------------------------------
// 骰子处理：进入步骤1：抽取发展卡
//--------------------------------------------------------
GameEvent.resolve_dice.setup_step_1 = function(field,num2){
	$gameSystem.dice_step = 1;
	his_window.push(`${develop_names[field][0]} 领域有了新的成果！`);
	his_window.push(`将 ${develop_names[field][0]} 发展到第 ${num2} 级及以上的玩家可以获得对应领域的发展卡！`);
	//由房主去获取抽取发展卡的随机数
	let count = 0,randoms = [];
	for(let player_index of $gameSystem.make_player_list_by_order()){
		let player = $gamePlayers[player_index];
		//该玩家的对应领域发展程度大于等于骰子数即可获得发展卡
		if(player.dev_process[field]>=num2){
			if($gameBank.all_dev_num(field)-count>0){
				randoms.push($gameBank.all_dev_num(field)-count);
				count++;
			}
			else{
				his_window.push(`发展卡数量不足`,"important");
			}				
		}
	}
	if(randoms.length==0){
		GameEvent.resolve_dice.event_dice_finish();
	}
	else{
		if($gameSystem.is_room_owner()){
			ws.sendmsg("mes_action",{"val":[10],"randoms":randoms});
		}
	}		
}
//--------------------------------------------------------
// 骰子处理：进入步骤4：丢弃资源
//--------------------------------------------------------
GameEvent.resolve_dice.setup_step_4 = function(){
	$gameSystem.dice_step = 4;
	//UI更新,启动可能的资源丢弃
	if($gameSystem.is_in_recive()){GameEvent.start_drop_select();}
}
//--------------------------------------------------------
// 骰子处理：进入步骤5：设置强盗
//--------------------------------------------------------
GameEvent.resolve_dice.setup_step_5 = function(){
	$gameSystem.dice_step = 5;
	//UI更新,由投掷者发起设置强盗
	if($gameSystem.is_own_turn()){
		//启动新的状态机
		var stater = new promiseLineTemplates.SelectPlaceAndRobPlayer({
			final:function(){
				ws.sendmsg("mes_action",{"starter":user_index,"val":[10,this.selected_place,this.selected_player],"randoms":[this.selected_player==0 ? 1 : $gamePlayers[this.selected_player].all_src_num()]});
			}
		});
		stater.run();
	}
	else{
		his_window.push(`由${$gameSystem.active_player().name}设置强盗：`);
	}
}
//--------------------------------------------------------
// 启动资源丢弃
//--------------------------------------------------------
GameEvent.start_drop_select = function(){
	game_temp.drop_required=Math.floor($gameSystem.self_player().all_src_num()/2);
	his_window.push("你需要丢弃 "+game_temp.drop_required+" 份资源");
	game_temp.action_now="action_in_config";
	//打开丢弃窗口
	window_configs.drop_window.controller.top_limit = game_temp.drop_required;
	UI_start_simple_item_select_window("drop_window");
}
//--------------------------------------------------------
// 收获资源
//--------------------------------------------------------
GameEvent.harvest_by_dice = function(num_sum){
	sQuery("place",$gameSystem.all_palces()).filter((place_id)=>map_info.places[place_id].create_num==num_sum).each((place_id)=>{
		if($gameSystem.occupying==place_id && sQuery("place",place_id).near_points().filter((point_id)=>$gameCities.hasOwnProperty(point_id)).get_list.length>0){
			his_window.push("地块被占据,无法产出");
			return;
		}
		sQuery("place",place_id).near_points().filter((point_id)=>$gameCities.hasOwnProperty(point_id)).each((point_id)=>{
			var create_type = map_info.places[place_id].create_type;
			var city = $gameCities[point_id];
			var city_owner = $gamePlayers[$gameCities[point_id].owner];
			if(city.level==0){
				city_owner.src(order[create_type],"+=",1);
			}
			else{
				if(extra_create.hasOwnProperty(create_type)){
					city_owner.src(order[create_type],"+=",1);
					city_owner.src(extra_create[create_type],"+=",1);
				}
				else{
					city_owner.src(order[create_type],"+=",2);
				}
			}
			
		});
	});
}
//--------------------------------------------------------
// 城市发展
//--------------------------------------------------------
GameEvent.city_develop = function(player_index,develop_type,develop_level){
	var player = $gamePlayers[player_index];
	//扣除资源
	player.src(dev_type_to_src[develop_type],"-=",develop_level);
	//对应等级提升
	player.dev_process[develop_type] = develop_level;
	his_window.push(`${player.name} 将 ${develop_names[develop_type][0]} 发展到了进度${develop_level}：${develop_names[develop_type][develop_level]}！`);
	//画面更新
	GameGraphic.set_city_development(player_index,develop_type,develop_level);
	//菜单更新
	if($gameSystem.is_own_turn()){
		UI_base_build_update();
	}
}