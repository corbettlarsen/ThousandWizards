function Entity(startX, startY){
  this.x = startX;
  this.y = startY;
  this.moveup = function(){
    if (!map[this.x+","+(this.y-1)]){
		this.y -= 1;
	}
  }
  this.movedown = function(){
    if (!map[this.x+","+(this.y+1)]){
		this.y += 1;
	}
  }
  this.moveleft = function(){
    if (!map[(this.x-1)+","+this.y]){
		this.x -= 1;
	}
  }
  this.moveright = function(){
    if (!map[(this.x+1)+","+this.y]){
		this.x += 1;
	}
  }
}

var debug = document.createElement("div");

ROT.RNG.setSeed(1234);
var map = {};
var arena = new ROT.Map.Digger(49,49);
var x = 7;
var y = 5;
var character = new Entity(7,5);
var monster = new Entity(7,4);

document.addEventListener("keydown", function(e) {
    var code = e.keyCode;

    var vk = "?";
    for (var name in ROT) {
        if (ROT[name] == code && name.indexOf("VK_") == 0) { vk = name; }
    }

    if (vk == "VK_UP"){
		character.moveup();
	}
	if (vk == "VK_DOWN"){
		character.movedown();
	}
	if (vk == "VK_RIGHT"){
		character.moveright();
	}
	if (vk == "VK_LEFT"){
		character.moveleft();
	}

  var direction = Math.floor((Math.random() * 4) + 1);
  debug.innerHTML = direction;
  if (direction == 1){
  monster.moveup();
}
if (direction == 2){
  monster.movedown();
}
if (direction == 3){
  monster.moveright();
}
if (direction == 4){
  monster.moveleft();
}

	for(i = 0;i <49; i++){
	for (j = 0; j < 49; j++){
		display.draw(i,j,map[i + "," + j] ? "#" : " ");
	}
	display.draw(character.x,character.y,"@");
  display.draw(monster.x,monster.y,"!");
}
});

var callback = function(x,y,value){
	map[x + "," + y] = value;
}
arena.create(callback);
var display = new ROT.Display({width:49, height:49, forceSquareRatio:true});
var debug = document.createElement("div");
debug.innerHTML = "bug";
document.body.appendChild(display.getContainer());
document.body.appendChild(debug);
