const FLOOR = 0;
const WALL = 1;
const CRATE = 2;

ROT.RNG.setSeed(1234);
var map = {};
var screen_width = 40;
var screen_height = 40;
var passableCallback = function(x, y) {
    return (map[x+","+y] === FLOOR);
}
var arena = new ROT.Map.Digger(screen_width,screen_height);
var lightPasses = function(x, y) {
    var key = x+","+y;
    if (key in map) { return (map[key] == FLOOR); }
    return false;
}
var fov = new ROT.FOV.RecursiveShadowcasting(lightPasses);
var callback = function(x,y,value){
	map[x + "," + y] = value;
}
arena.create(callback);
var cont = new EntityContainer();
var character = cont.createEntity(29,20,"@");
var cart = cont.createCart(29,21,"H");
var crate = cont.createCrate(30,20,"H");
character.set_cart(cart);
var display = new ROT.Display({width:screen_width, height:screen_height, forceSquareRatio:true});
var debug = document.createElement("div");
display.getContainer().addEventListener("keypress", getClickPosition);
document.body.appendChild(display.getContainer());

var draw_screen = function(){
  for(i = 0; i < screen_width;i++){
    for(j = 0; j < screen_height;j++){
      var color = (map[i+","+j] ? "#aa0": "#660");
      display.draw(i, j, null,"#fff",color);
    }
  }
}

var getClickPosition = function(e) {
	var square_width = display.getContainer().width/screen_width;
	var square_height = display.getContainer().height/screen_height;
	var click_x = (e.clientX + 6)/square_width;
	var click_y = (e.clientY + 6)/square_height;
	var tile_x = Math.floor(click_x)-1;
	var tile_y = Math.floor(click_y)-1;
  if(!e.shiftKey){
  	display.draw(tile_x,tile_y,"X");
  	var dijkstra = new ROT.Path.Dijkstra(character.x,character.y, passableCallback);
  	dijkstra.compute(tile_x, tile_y, function(x, y) {
  	character.patharray.push([x,y]);
    if (character.cart != null) {
      character.cart.patharray.push([x,y]);
    }
     });
  	character.calcpath();
    }
  else if((map[tile_x+","+tile_y] == FLOOR) || (map[tile_x+","+tile_y] == CRATE)){
    if(tile_x <= (character.x+1) && tile_x >= (character.x-1)){
    if(tile_y <= (character.y+1) && tile_y >= (character.y-1)){
    if(!(tile_x == character.x && tile_y == character.y)){
    if(!(tile_x == cart.x && tile_y == cart.y)){
      if(cont.entity_map[tile_x+","+tile_y]){
        if(!cart.full)
        cont.removeCrate(tile_x,tile_y);
        cart.fill();
        }
        else{
          if(cart.full){
          cont.createCrate(tile_x,tile_y,"H");
          cart.empty();
        }
      }
      }
    }
    }
    }
  }
}
display.getContainer().addEventListener("click", getClickPosition);

function EntityContainer(){
  this.entity_map = {};
  this.createEntity = function(x,y,icon){
    var entity = new Entity(x,y,icon);
    this.entity_map[x+","+y] = entity;
    return entity;
  }
  this.createCart = function(x,y,icon){
    var cart = new Cart(x,y,icon);
    this.entity_map[x+","+y] = cart;
    return cart;
  }
  this.createCrate = function(x,y,icon){
    var crate = new Crate(x,y,icon);
    this.entity_map[x+","+y] = crate;
    return crate;
  }
  this.removeCrate = function(x,y){
    delete this.entity_map[x+","+y];
    map[x +","+y] = FLOOR;
  }
  this.drawEntities = function(){
    var entMap = this.entity_map;
    Object.keys(entMap).forEach(function(item) {entMap[item].draw_character()});
  }
  this.actEntities = function(){
    var entMap = this.entity_map;
    Object.keys(entMap).forEach(function(item) {entMap[item].act()});
  }
}
function Cart(startX, startY, icon){
  Entity.call(this,startX,startY,icon);
  this.full = Boolean(true);
  this.fill = function(){
    this.full = Boolean(true);
    this.icon = "H"
  }
  this.empty = function(){
    this.full = Boolean(false);
    this.icon = "X"
  }
}
function Crate(startX, startY, icon){
  map[startX +","+startY] = CRATE;
  Entity.call(this,startX,startY,icon);
}
function Entity(startX, startY,icon){
  this.icon = icon;
  this.x = startX;
  this.y = startY;
	this.patharray = [];
  var id = 0;
  var queue = new ROT.EventQueue();
  this.cart = null;

  this.getid = function(){
    return id;
  }

  this.set_array = function(array){
    this.patharray = array;
    return array;
  }
  this.set_cart = function(cart_entity){
    this.cart = cart_entity;
  }
  this.northwest = function(){
    if (!map[(this.x-1)+","+(this.y-1)]){
		this.x -= 1;
    this.y -= 1;
  }
}
  this.northeast = function(){
    if (!map[(this.x+1)+","+(this.y-1)]){
		this.x += 1;
    this.y -= 1;
  }
}
  this.southwest = function(){
    if (!map[(this.x-1)+","+(this.y+1)]){
		this.x -= 1;
    this.y += 1;
  }
}
  this.southeast = function(){
    if (!map[(this.x+1)+","+(this.y+1)]){
		this.x += 1;
    this.y += 1;
  }
}
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
	this.fovcomp = function(){
  		fov.compute(this.x, this.y, 10,function(x, y, r, visibility) {
  		var ch = null;
  		var color = (map[x+","+y] ? "#aa0": "#660");
  		display.draw(x, y, ch, "#fff", color);
  		 });
	}
  this.draw_character = function(){
    display.draw(this.x, this.y, this.icon,"#fff","#660");
  }
	this.act = function(){

    direction = queue.get();
    if(direction == null){
      return;
    }
    else if (direction[0] == -1 && direction[1] == -1){
      this.northwest();
    }
    else if (direction[0] == 1 && direction[1] == -1) {
      this.northeast();
    }
    else if (direction[0] == -1 && direction[1] == 1) {
      this.southwest();
    }
    else if (direction[0] == 1 && direction[1] == 1) {
      this.southeast();
    }
    else if (direction[0] == 0 && direction[1] == -1) {
      this.moveup();
    }
    else if (direction[0] == 0 && direction[1] == 1) {
      this.movedown();
    }
    else if (direction[0] == -1 && direction[1] == 0) {
      this.moveleft();
    }
    else if (direction[0] == 1 && direction[1] == 0) {
      this.moveright();
    }
	}
	this.calcpath = function(){
    queue.clear();
    if(this.cart != null){
      this.cart.patharray.shift();
      this.cart.patharray.push([this.cart.x,this.cart.y]);
      this.cart.calcpath();
    }
     for(var i = this.patharray.length-1; i > 0 ; i--){
			 queue.add([this.patharray[i-1][0] - this.patharray[i][0],
       this.patharray[i-1][1] - this.patharray[i][1]]);
		 }
     this.patharray = [];
	}
}
function place(entity){
  for(i = 0;i <screen_width; i++){
	for (j = 0; j <screen_height; j++){
		if(!map[i + "," + j]){
      entity.x = i;
      entity.y = j;
      map[i + "," + j] = 2;
      entity.fovcomp();
      return 1;
    }
	}
}
  return 0;
}

var debug = document.createElement("div");
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

});

setInterval(function(){

  cont.actEntities();
  display.clear();
	draw_screen();
  cont.drawEntities();

}, 100

);
