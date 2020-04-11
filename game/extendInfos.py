import copy
def extendInfo(extndName):
	return copy.deepcopy(extends[extndName])
extends={
	"BasicExtend":{
		"name":"BasicExtend",
		"name_Ch":"原版",
		"fileList":{
			"js":["BasicExtend.js"],
			"css":[]
		}
	},
	"SaberExtend":{
		"name":"SaberExtend",
		"name_Ch":"骑士拓",
		"fileList":{
			"js":["SaberExtend.js"],
			"css":["SaberExtend.css"]
		}
	}
}