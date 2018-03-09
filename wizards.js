ROT.RNG.setSeed(1234);

var getClickPosition = function(e) {
	var square_width = display.getContainer().width/screen_width;
	var square_height = display.getContainer().height/screen_height;
	var click_x = (e.clientX + 6)/square_width;
	var click_y = (e.clientY + 6)/square_height;
	var tile_x = Math.floor(click_x)-1;
	var tile_y = Math.floor(click_y)-1;
	//alert(tile_x + "," + tile_y);
	display.draw(tile_x,tile_y,"C");
}

var callback = function(x,y,value){
	map[x + "," + y] = value;
}

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

function place(entity){
  for(i = 0;i <screen_width; i++){
	for (j = 0; j <screen_height; j++){
		if(!map[i + "," + j]){
      entity.x = i;
      entity.y= j;
      return 1;
    }
	}
}
  return 0;
}

var debug = document.createElement("div");

ROT.RNG.setSeed(1234);
var map = {};
var screen_width = 40;
var screen_height = 40;
var arena = new ROT.Map.Digger(screen_width,screen_height);
arena.create(callback);
var character = new Entity(7,5);
var monster = new Entity(7,4);
place(character);
place(monster);

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

	for(i = 0;i <screen_width; i++){
	for (j = 0; j < screen_height; j++){
		display.draw(i,j,map[i + "," + j] ? "#" : " ");
	}
	display.draw(character.x,character.y,"@");
  display.draw(monster.x,monster.y,"!");
}
});
var display = new ROT.Display({width:screen_width, height:screen_height, forceSquareRatio:true});
var debug = document.createElement("div");
display.getContainer().addEventListener("click", getClickPosition);
document.body.appendChild(display.getContainer());
