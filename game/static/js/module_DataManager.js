//--------------------------------------------------------
// class DataManager
// 统筹游戏数据的载入与解析的模块
//--------------------------------------------------------
function DataManager() {
    throw new Error('This is a static class');
}
//--------------------------------------------------------
// 初始化全局变量
//--------------------------------------------------------
var $gameSystem = null;
var $gamePlayers = null;
var $gameCities = null;
var $gameRoads = null;
var $gameTrades = null;
var $gameBank = null;

var $dataSources = null;
//--------------------------------------------------------
// 初始化全局变量
//--------------------------------------------------------
// 以下为旧的全局数据变量,会逐步替代
DataManager.load_old_data = function() {
	game_info=$gameSystem;
	game_info.players          = $gamePlayers;
	game_info.cities           = $gameCities;
	game_info.roads            = $gameRoads;
	game_info.trades           = $gameTrades;
	game_info.cards            = $gameBank;
}
//--------------------------------------------------------
// 将部分不仅限于数据结构的全局变量实例化
//--------------------------------------------------------
DataManager.applyObject = function() {
	//实例化玩家
	for(var player_index in $gamePlayers){
		$gamePlayers[player_index] = new Game_Player($gamePlayers[player_index]);
	}
	//实例化交易
	for(var trade_id in $gameTrades){
		$gameTrades[trade_id] = new Transaction($gameTrades[trade_id]);
	}
	//实例化银行
	$gameBank = new Game_Bank($gameBank);
	//实例化系统
	$gameSystem = new Game_System($gameSystem);
}
//--------------------------------------------------------
// 载入游戏数据
//--------------------------------------------------------
DataManager.extractSaveContents = function(contents) {
	$gameSystem        = contents.system;
    $gamePlayers       = contents.players;
    $gameCities        = contents.cities;
    $gameRoads         = contents.roads;
    $gameTrades        = contents.trades;
    $gameBank          = contents.bank;
    this.applyObject();
    this.load_old_data();
}

//--------------------------------------------------------
// 封装游戏数据
//--------------------------------------------------------
DataManager.makeSaveContents = function() {
	var contents = {}
	contents.system    = $gameSystem;
	contents.players   = $gamePlayers;
	contents.cities    = $gameCities;
	contents.roads     = $gameRoads;
	contents.trades    = $gameTrades;
	contents.bank      = $gameBank;
	return contents;
}

//--------------------------------------------------------
// 初始化静态数据：资源
//--------------------------------------------------------
DataManager.initialStaticSource = function(){
}