//--------------------------------------------------------
// SaberExtend.js
// 卡坦岛骑士拓展
//--------------------------------------------------------
function SaberExtendBase(){
	throw new Error('This is a static class');
}
//------------------基础参数--------------------
SaberExtendBase.extraData = true;
ExtendManager.registExtend(SaberExtendBase);
console.log("SaberExtend load success!");
//---------------------------------------------
//------------------新的数据--------------------
var $gameSabers = null;
src_cards.push("coin","paper","crystal");
dev_cards.push("irrigation");
dev_ch["irrigation"]="灌溉";
dev_cards_intro["irrigation"]="农田附近如果有你的城市或定居点，每有一块这样的农田，你收获2份麦子。";
use_dev["irrigation"]=function(){
	//当前行动记为"action_use_dev_plenty"
	game_temp.action_now="action_use_dev_plenty";
	//计算可以丰收麦子的地块,点亮其selector
	var avaliable_places=sQuery("place",$gameSystem.all_palces()).filter((place_id)=>map_info.places[place_id].create_type==4)
	.filter((place_id)=>sQuery("place",place_id).near_points().filter((point_id)=>$gameSystem.self_player().own_cities.indexOf(point_id)>-1).get_list().length>0)
	.get_list();
	for(let i of avaliable_places){
		$("plc_selector").filter("#"+i).addClass("active selector_available").show();
	}
	confirm_window.set(`一共可以收获${avaliable_places.length*2}份麦子,要使用灌溉吗?`);
	confirm_window.show();
}
//---------------------------------------------
SaberExtendBase.loadExtraData = function(contents){
	$gameSabers = contents.sabers;
}
SaberExtendBase.saveExtraData = function(contents){
	contents.sabers = $gameSabers;
}
function extract_dev_card(randomint,player_index){
	//设置抽取发展卡的UI回调函数,只需要清除active
	$("#action_buy_dev_card").removeClass("active");
	var player=$gamePlayers[player_index];
	//扣除资源
	/*player.src("wool","-=",1);
	player.src("grain","-=",1);
	player.src("ore","-=",1);*/
	his_window.push(player.name+" 抽取了一张发展卡");
	//根据随机数判断发展卡的类型
	var count=randomint;
	for(let dev of dev_cards){
		if(count<$gameBank.dev(dev)){
			player.dev(dev,"+=",1);
			$gameBank.dev(dev,"-=",1);
			his_window.push(`(你获得了发展卡:${dev_ch[dev]})`);
			return;
		}
		count-=$gameBank.dev(dev);
	}
}