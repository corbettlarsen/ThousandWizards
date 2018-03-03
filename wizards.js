ROT.RNG.setSeed(1234);
var map = {};
var arena = new ROT.Map.Digger(49,49);
var x = 7;
var y = 5;


document.addEventListener("keydown", function(e) {
    var code = e.keyCode;

    var vk = "?"; 
    for (var name in ROT) {
        if (ROT[name] == code && name.indexOf("VK_") == 0) { vk = name; }
    }

    if (vk == "VK_UP" && !map[x+","+(y-1)]){
		y -= 1;
	}
	if (vk == "VK_DOWN" && !map[x+","+(y+1)]){
		y += 1;
	}
	if (vk == "VK_RIGHT" && !map[(x+1)+","+y]){
		x += 1;
	}
	if (vk == "VK_LEFT" && !map[(x-1)+","+y]){
		x -= 1;
	}
	
	for(i = 0;i <49; i++){
	for (j = 0; j < 49; j++){
		display.draw(i,j,map[i + "," + j] ? "#" : " ");
	}
	display.draw(x,y,"@");
}
});

var callback = function(x,y,value){
	map[x + "," + y] = value;
}
arena.create(callback);
var display = new ROT.Display({width:49, height:49, forceSquareRatio:true});
document.body.appendChild(display.getContainer());
