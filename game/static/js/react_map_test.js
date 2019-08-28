map_info={};
places={};
edge_size=67;
xsize=0;
ysize=0;
order={
		0:"desert",
		1:"brick",
		2:"wood",
		3:"wool",
		4:"grain",
		5:"ore",
		6:"any_type"
	};
//--------------------------------------------------------
// 交互元素基本响应
//--------------------------------------------------------
$(document).ready(function(){
	//--------------------------------------------------------
	// 创建地图
	//--------------------------------------------------------
	$("#create_map").click(function(){
		create_map();
	});
	//--------------------------------------------------------
	// 检查图块
	//--------------------------------------------------------
	$("#places").on("click",".plc",function(){
		var place_id=$(this).attr("id");
		var place=places[place_id];
		alert("地块id："+place_id+"\n"+"产出数字："+place.create_num+"\n"+"产出类型："+order[place.create_type]);
	})
	//--------------------------------------------------------
	// UI：图块选择器
	//--------------------------------------------------------
	$("#places").on("mouseenter",".plc_selector",
	    function(){
	        var place_id=$(this).attr("id");
			var place=places[place_id];
			//无法选择的块不会被添加选中状态
			if($(this).hasClass("plc_cnt_select")==false)
			{
				$(this).addClass("plc_selected");
			}		
			$("#plc_info").text("地块id："+place_id+"产出数字："+place.create_num+"产出类型："+order[place.create_type]);
	    }
	);
	$("#places").on("mouseleave",".plc_selector",
	    function(){
			$(this).removeClass("plc_selected");	
	    }
	);
	//--------------------------------------------------------
	// UI：边选择器
	//--------------------------------------------------------
	$("#edges").on("mouseenter",".edge_selector",
	    function(){
			$(this).addClass("edge_selected");	
	    }
	);
	$("#edges").on("mouseleave",".edge_selector",
	    function(){
			$(this).removeClass("edge_selected");	
	    }
	);
	//--------------------------------------------------------
	// UI：点选择器
	//--------------------------------------------------------
	$("#points").on("mouseenter",".pt_selector",
	    function(){
			$(this).addClass("pt_selected");	
	    }
	);
	$("#points").on("mouseleave",".pt_selector",
	    function(){
			$(this).removeClass("pt_selected");	
	    }
	);
});
//--------------------------------------------------------
// 获取地图
//--------------------------------------------------------
function create_map(){
	$.ajax({
		async:false,
		url:"/ajax/t_create_map/",
		type:"get",
		dataType:"json",
		headers:{"X-CSRFToken":$.cookie("csrftoken")},
		success:function(info){
			map_info=info;
			load_map();
			init_ui();
		},
	});
}
//--------------------------------------------------------
// 地图数据加载
//--------------------------------------------------------
function load_map(){
	//alert(map_info.rand_seed);
	$("#seed_id").text(""+map_info.rand_seed);
	places=map_info.places;
	edges=map_info.edges;
	points=map_info.points;
	harbors=map_info.harbors;
	xsize=map_info.xsize;
	ysize=map_info.ysize;
	//将所有的六边形块放置于正确的位置
	for(var place_id in places){
		var xi=parseInt(place_id/ysize);
		var yi=place_id%ysize;
		var place=places[place_id];
		var x=Math.round(xi*edge_size*1.5);
		var y=Math.round(yi*edge_size*1.732+(xi%2)*0.5*1.732*edge_size);
		var dx=0,dy=0;
		$("#places").append("<img class='plc' id='"+place_id+"' src='/media/img/hexagon.png'/>");
		plc=$(".plc").filter("#"+place_id);
		//放置图块选择器
		plc.after("<div class='plc_selector' id='"+place_id+"'></div>");
		//放置背景图
		plc.after("<img class='backpic' id='"+place_id+"' src='/media/img/"+order[place.create_type]+".png'/>");
		//放置数字图
		if(place.create_num!=0){
			plc.after("<img class='numpic' id='"+place_id+"' src='/media/img/num_"+place.create_num+".png'/>");
		}
		//调整位置
		plc.css({"left":x+"px","top":y+"px","z-index":"1000"});
		$(".plc_selector").filter("#"+place_id).css({"left":x+"px","top":y+"px","z-index":"2000"});
		$(".backpic").filter("#"+place_id).css({"left":x+"px","top":y+"px","z-index":"200"});
		$(".numpic").filter("#"+place_id).css({"left":x+"px","top":y+"px","z-index":"300"});

	}
	//放置边选择器
	for(var edge_index in edges)
	{
		var edge_id=edges[edge_index];
		var place_id=parseInt(edge_id/3);
		var xi=parseInt(place_id/ysize);
		var yi=place_id%ysize;
		var place=places[place_id];
		var x=Math.round(xi*edge_size*1.5);
		var y=Math.round(yi*edge_size*1.732+(xi%2)*0.5*1.732*edge_size);
		var dx,dy;
		$("#edges").append("<div class='edge_selector dir_"+edge_id%3+"' id='"+edge_id+"'></div>");
		switch(edge_id%3)
		{
			case 0:
				dx=0;
				dy=0;
				break;
			case 1:
				dx=Math.round(0.5*edge_size);
				dy=-6;
				break;
			case 2:
				dx=Math.round(1.5*edge_size);
				dy=0;
				break;
		}
		//调整位置
		$(".edge_selector").filter("#"+edge_id).css({"left":(x+dx)+"px","top":(y+dy)+"px","z-index":"3000"})
	}
	//放置点选择器
	for(var pt_index in points)
	{
		var point_id=points[pt_index];
		//alert(point_id)
		var place_id=parseInt(point_id/2);
		var xi=parseInt(place_id/ysize);
		var yi=place_id%ysize;
		var place=places[place_id];
		var x=Math.round(xi*edge_size*1.5);
		var y=Math.round(yi*edge_size*1.732+(xi%2)*0.5*1.732*edge_size);
		var dx,dy;
		$("#points").append("<div class='pt_selector' id='"+point_id+"'></div>");
		switch(point_id%2)
		{
			case 0:
				dx=Math.round(0.5*edge_size)-29;
				dy=-30;
				break;
			case 1:
				dx=Math.round(1.5*edge_size)-28;
				dy=-30;
				break;
		}
		//alert(x+dx);
		//调整位置
		$(".pt_selector").filter("#"+point_id).css({"left":(x+dx)+"px","top":(y+dy)+"px","z-index":"3000"})
	}
	//放置海港层
	for(var i=0;i<harbors.length;i++)
	{
		var harbor=harbors[i];
		var place_id=harbor.place_id;
		var xi=parseInt(place_id/ysize);
		var yi=place_id%ysize;
		var place=places[place_id];
		var x=Math.round(xi*edge_size*1.5);
		var y=Math.round(yi*edge_size*1.732+(xi%2)*0.5*1.732*edge_size);
		var dx=0,dy=0;
		//放置海港
		$("#harbors").append("<img class='harbor' id='"+i+"' src='/media/img/harbor_"+harbor.direct+".png'/>");
		hbr=$(".harbor").filter("#"+i);
		var num;
		if(harbor.ex_type!=6){
			num=2;
		}
		else{
			num=3;
		}
		//放置数字
		hbr.after("<img class='hb_num' id='"+i+"' src='/media/img/harbor_num"+num+"_"+harbor.direct+".png'/>");
		//放置图标
		hbr.after("<img class='hb_icon' id='"+i+"' src='/media/img/harbor_icon_"+harbor.ex_type+".png'/>");
		switch(harbor.direct){
			case "up":
				dx=182;
				dy=5;
				break;
			case "dn":
				dx=175;
				dy=295;
				break;
			case "lu":
				dx=55;
				dy=73;
				break;
			case "ld":
				dx=52;
				dy=223;
				break;
			case "ru":
				dx=305;
				dy=78;
				break;
			case "rd":
				dx=301;
				dy=227;
				break;
		}
		//调整位置
		var hbx=x-2*edge_size;
		var hby=Math.round(y-1.732*edge_size);
		$(".harbor").filter("#"+i).css({"left":hbx+"px","top":hby+"px","z-index":"400"});
		$(".hb_num").filter("#"+i).css({"left":hbx+"px","top":hby+"px","z-index":"400"});
		$(".hb_icon").filter("#"+i).css({"left":(hbx+dx)+"px","top":(hby+dy)+"px","z-index":"500"});

	}
}
//--------------------------------------------------------
// UI初始化
//--------------------------------------------------------
function init_ui(){
	$(".plc_selector").hide();
	$(".edge_selector").hide();
	$(".pt_selector").hide();
}	