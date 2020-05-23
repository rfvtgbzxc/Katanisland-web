//--------------------------------------------------------
// module_ConstVars
// 用于声明常量,注意测试版本与发布版本部分参数的不同
//--------------------------------------------------------
//debug模式
debug=false;
//脱机模式
offline=false;
//测试版本
test_model=true;
//是否使用cdn
use_cdn=false;

//服务器websocket地址
if(test_model){
	websocket_url = "ws://192.168.50.140:80/ws/game_test";
}
else{
	websocket_url = "ws://122.51.21.190:80/ws/game_test";
}
//CDN加速地址
if(use_cdn){
	cdn_url = "http://cdn.newcenturyfans.cn";
}
else{
	cdn_url = "";
}
requesting = false;

//游戏数据
map_info={};
game_info={};
places={};
edge_size=67;
xsize=0;
ysize=0;
last_step_index=0;
src_size=5;
//临时数据
game_temp={
	home_step:0,
	"action_now":"",
	"set_option":"",
	activeMenuItem:[],
};
game_UI={
	"UI_count":0,
};
game_UI_list={
	drop_items:{
		selected:[],
		available:[]
	},
	trade_items:{
		_give:{
			selected:[],
			available:[]
		},
		_get:{
			selected:[],
			available:[]
		}		
	},
};
//个人标记（默认为第一位玩家）
user_id=1;
user_index=1;
//数据映射
load_process={
	"map":false,
	"game":false,
};
dev_cards=[];
src_cards=["brick","wood","wool","grain","ore"];
src_ch={
	"brick":"砖块",
	"wood":"木材",
	"wool":"羊毛",
	"grain":"粮食",
	"ore":"铁矿"
}
score_cards=[];
order={
		0:"desert",
		1:"brick",
		2:"wood",
		3:"wool",
		4:"grain",
		5:"ore",
		6:"any_type"
};
order_ch={
		0:"沙漠",
		1:"砖块",
		2:"木材",
		3:"羊毛",
		4:"粮食",
		5:"铁矿",
		6:"任意"
};
src_reflection={
	"desert":0,
	"brick":1,
	"wood":2,
	"wool":3,
	"grain":4,
	"ore":5,
};
dev_ch={};
score_ch={
	"artemis":"阿尔忒弥斯神庙",
	"oxford":"牛津大学",
	"panama":"巴拿马运河",
	"forbiddencity":"紫禁城",
	"vasili":"圣瓦西里大教堂"
};
color_reflection={
	1:"light-blue",
	2:"dark-green",
	3:"light-orange",
	4:"light-red",
	5:"light-purple",
	6:"light-green",
};
color_reflection_hex={
	"light-blue":"#029ed9",
	"dark-green":"#006602",
	"light-orange":"#ff9b38",
	"light-red":"#ff3738",
	"light-purple":"#a3159a",
	"light-green":"#81ff38"
};
dir_reflection={
	"up":0,
	"ru":1,
	"rd":2,
	"dn":3,
	"ld":4,
	"lu":5
};
vp_info_text=[
"拥有的城市：",
"拥有的定居点：",
"最长道路：",
"最大军队：",
"拥有的奇观："
];
//4x15x2
menu_lists={
	use_dev:{
		type:"use_dev",
		level:1,
		template:`<button type="button" class="use_dev list-group-item" action="{{key}}" help="{{dev_info.intro}}">{{dev_info.name}}<span class="dev_num"></span></button>`,
		items:{},
	},
	base_build:{
		type:"base_build",
		level:1,
		template:`<button type="button" class="base_build list-group-item" action={{key}} help="{{intro}}">{{name}}{% for cost in costlist %}<cost class="{{cost.type}}">{{cost.num}}</cost>{% endfor %}</button>`,
		items:{},
	}
};
dev_cards_intro={};
use_dev={};
menu_actions={};

var $dataDevCards={};
var $dataScoreCards={};
var window_configs={};

//--------------------------------------------------------
// 游戏逻辑模版
//--------------------------------------------------------
class PromiseLineBase{
	constructor(diy_attrs){
		for(let key in diy_attrs){
			this[key]=diy_attrs[key];
		}
	}
	async run(){
		try{
			await this.promiseLine();
		}
		catch(e){
			//使用trycatch来以更直接的方式结束等待闭环
			if(e.message=="breakPromiseLine"){
				return;
			}
			throw e;
		}
	}
	final(){
		console.error("The function final is undefined!");
	}
}
var promiseLineTemplates = {
	SelectPlaceAndRobPlayer:class extends PromiseLineBase{
		constructor(diy_attrs={}){
			super(diy_attrs);
			this.selected_place=0;
			this.selected_player=0;
		}		
		async promiseLine(){
			game_temp.action_now="action_promise";
			his_window.push("由你设置强盗:");
			while(true){
				//启动强盗选择
				UI_start_robber_set();
				let result=await this.handle_select_place();
				if(result){
					clear_selectors();
					hide_special_actions();
					this.final();
					return;
				}
			}		
		}
		async handle_select_place(){
			var selector,place_id,action;
			while(true){
				[selector,place_id] = await GameUI.next_step();
				if(this.select_place(place_id)){
					//进入下一个闭环：选择玩家
					//直接反馈闭环结果,不在此层停留
					return await this.handle_select_player();
				}
				else{
					//确认窗口
					[selector,action] = await GameUI.next_step();
					if(action=="confirm"){return true;}
				}
			}
		}
		async handle_select_player(){
			var selector,prop,action;
			while(true){
				[selector,prop] = await GameUI.next_step();
				if(selector=="special" && prop=="to_start"){
					//退出闭环(但继续更外层的闭环)
					return false;
				}
				this.select_player(prop);
				[selector,action] = await GameUI.next_step();
				if(action=="confirm"){return true;}
			}
		}
		select_place(place_id){
			this.selected_place=place_id;
			//获取选择地块附近的玩家
			var cities = sQuery("place",place_id).near_points()
			.filter((point_id)=>$gameCities.hasOwnProperty(point_id))
			.not((point_id)=>$gameCities[point_id].owner==user_index)
			.each((point_id)=>{
				$("player").filter("#"+$gameCities[point_id].owner).addClass("active player_select_available");
			}).get_list();
			if(cities.length>0){
				his_window.push("请选择要掠夺的玩家:");
				$("plc_selector").not(`#${place_id}`).removeClass("active selector_available").hide();
				//显示撤销按钮
				show_special_actions("to_before_action");		
				return true;
			}
			else{
				this.selected_player = 0;
				confirm_window.set("此处没有可以掠夺的城市,要将强盗放在这里吗?");
				confirm_window.show();
				return false;
			}
		}
		select_player(player_index){
			this.selected_player=player_index;
			confirm_window.set("要掠夺该玩家吗?");
			confirm_window.show();
		}
	},
	BuildTwoRoads:class extends PromiseLineBase{
		constructor(diy_attrs={}){
			super(diy_attrs);
			this.selected_edge=[];
		}
		async promiseLine(){
			game_temp.action_now="action_promise";
			his_window.push("请选择要修建的第一条道路:");
			while(true){
				this.start();
				var selector,edge_id,action;
				[selector,edge_id] = await GameUI.next_step();
				this.select_edge(edge_id);
				result=await this.handle_select_next_road();
				if(result){
					this.final();
					return;
				}
			}
		}
		async handle_select_next_road(){
			while(true){
				[selector,prop] = await GameUI.next_step();
				if(selector=="special" && prop=="to_start"){
					//退出闭环(但继续更外层的闭环)
					return false;
				}
				this.select_edge(prop);
				[selector,action] = await GameUI.next_step();
				if(action=="confirm"){return true;}
			}
		}
		start(){
			this.selected_edge.length=0;
			//激活道路选择器,只激活可以建设道路的地方
			var edges=available_edges(user_index);
			for(var i in edges){
				var selector=$("edge_selector").filter("#"+edges[i]).addClass("active selector_available").show();
			}
		}
		select_edge(edge_id){
			if(this.selected_edge.length==0){
				this.selected_edge.push(edge_id);
				//显示撤销按钮
				show_special_actions("to_before_action");
				//再激活道路选择器,这次包含上次选择的边
				let edges=available_edges(user_index,edge_id);
				for(let v_edge_id of edges){
					var selector=$("edge_selector").filter("#"+v_edge_id).addClass("active selector_available").show();
				}
				his_window.push("请选择要修建的第二条道路:");
			}
			else{
				this.selected_edge.push(edge_id);
				//打开确认窗口
				confirm_window.set("要在这两处建造道路吗?");
				confirm_window.show();
			}
		}
	},
};
GameUI=function(){};
GameUI.next_step=function(){
	game_temp.promise=new Promise((resolve,reject)=>{
		game_temp.action_resolve=(...props)=>resolve(props);
		game_temp.action_reject=()=>reject();
	}).then((props)=>props,()=>{throw new Error("breakPromiseLine");});
	return game_temp.promise;	
};
GameUI.get_confirm=async function(){
	while(true){
		[selector,action] = await GameUI.next_step();
		if(action=="confirm"){return true;}
	}
};
//--------------------------------------------------------
// 模版渲染器
// 支持一层深度for循环
//--------------------------------------------------------
DynamicMenu = function(){};
DynamicMenu.add_menu_item = function(menu_type,menu_item){
	menu_lists[menu_type].items[menu_item.key]=menu_item;
}
DynamicMenu.func_init = function(){
	this.render = function(template,data){
		var flat_for_structure = function(template,data){
			return template.replace(/{%\s*(for.*?)\s*?%}(.*){%\s*endfor\s*%}/g,function(match, forhead,forbody) {
				var fordata={};
				forhead.replace(/for\s*(.*?)\s*in\s*(.*)/,function(match,item,list){
				  fordata.item_name=item;
				  fordata.list_name=list;
				  fordata.list_length=load_value(list,data).length;
				});
				var result="";
				for(let i=0;i<fordata.list_length;i++){
				  result+=forbody.replace(new RegExp("(?<=\\{\\{.*)("+fordata.item_name+")(?=.*?\\}\\})","g"),function(match) {
				    return fordata.list_name+"."+i;
				  });
				}
				return result;
			});
		}
		var load_value = function(key,data){
			//检查是否有多级引用
			var key_list=key.split(/\./);
			var value=data;
			try{
				for(let base_key of key_list){
					value=value[base_key];
				}
			}
			catch(e){
			value="";
			}
			return value;
		}
		return function(template,data){
			//先解析for循环
			var result=flat_for_structure(template,data);
			return result.replace(/\{\{(.+?)\}\}/g, function(match, key) {
				//检查是否有多级引用
				return load_value(key,data);
			});
		}
	}();
}
DynamicMenu.func_init();