//--------------------------------------------------------
// class ExtendManager
// 统筹游戏插件的模块
//--------------------------------------------------------
function ExtendManager() {
    throw new Error('This is a static class');
}
ExtendManager.extendList=null;         //extend信息列表
ExtendManager.extends=[];            //extend实例列表
ExtendManager.extendDataList=[];     //extend游戏数据注册表
ExtendManager.extendGameEventList=[];//extend游戏事件注册表
//--------------------------------------------------------
// 加载列表中的所有插件
//--------------------------------------------------------
ExtendManager.loadExtend = async function(callback){
	for(let extendInfo of this.extendList){
		let extendName = extendInfo.name;
		for(let extendjsName of extendInfo.fileList.js){
			await requestJs(extendName,extendjsName).catch(()=>console.error(`获取扩展${extendName}的${extendjsName}失败！`));
		}
		for(let extendcssName of extendInfo.fileList.css){
			//css不需要阻塞加载
			requestCss(extendName,extendcssName)//.catch(()=>console.error(`获取扩展${extendInfo.name}的${extendcssName}失败！`));
		}
	}
	//完成后callback
	callback();
}

//--------------------------------------------------------
// 插件将自己注册到插件管理器中
//--------------------------------------------------------
ExtendManager.registExtend = function(extend){
	//包含额外数据
	if(!!extend.extraData){
		this.extendDataList.push(extend);
	}
	//包含额外事件
	if(!!extend.extraGameEvent){
		this.extendGameEventList.push(extend);
	}
}

//--------------------------------------------------------
// 读取数据
//--------------------------------------------------------
ExtendManager.extractSaveContents = function(contents){
	for(let extend of this.extendDataList){
		extend.loadExtraData(contents);
	}
}

//--------------------------------------------------------
// 保存数据
//--------------------------------------------------------
ExtendManager.makeSaveContents = function(contents){
	for(let extend of this.extendDataList){
		extend.saveExtraData(contents);
	}
}

//--------------------------------------------------------
// 处理事件
//--------------------------------------------------------
ExtendManager.execute_event = function(event){
	for(let extend of this.extendGameEventList){
		extend.execute_event(event);
	}
}