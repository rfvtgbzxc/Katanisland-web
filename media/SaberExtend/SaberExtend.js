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

var $gameSabers = null;
src_cards.push("coin");

SaberExtendBase.loadExtraData = function(contents){
	$gameSabers = contents.sabers;
}
SaberExtendBase.saveExtraData = function(contents){
	contents.sabers = $gameSabers;
}