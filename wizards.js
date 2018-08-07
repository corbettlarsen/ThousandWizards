const FLOOR = 0;
const WALL = 1;
const CRATE = 2;

ROT.RNG.setSeed(1234);
var map = {};
var screen_width = 40;
var screen_height = 40;

var lightPasses = function(x, y) {
    var key = x+","+y;
    if (key in map) { return (map[key] == FLOOR); }
    return false;
}
var fov = new ROT.FOV.RecursiveShadowcasting(lightPasses);
var callback = function(x,y,value){
	map[x + "," + y] = value;
}
var arena = new ROT.Map.Digger(screen_width,screen_height);
arena.create(callback);
var cont = new EntityContainer();
var character = cont.createEntity(29,20,"@");
var cart = cont.createCart(29,21,"H");
var crate = cont.createCrate(30,20,"H");
character.setCart(cart);
var display = new ROT.Display({width:screen_width, height:screen_height, forceSquareRatio:true});
var debug = document.createElement("div");
display.getContainer().addEventListener("keypress", getClickPosition);
document.body.appendChild(display.getContainer());

var getClickPosition = function(e) {
	var square_width = display.getContainer().width/screen_width;
	var square_height = display.getContainer().height/screen_height;
	var click_x = (e.clientX + 6)/square_width;
	var click_y = (e.clientY + 6)/square_height;
	var tile_x = Math.floor(click_x)-1;
	var tile_y = Math.floor(click_y)-1;
  if(!e.shiftKey){
  	display.draw(tile_x,tile_y,"X");
  	var dijkstra = new ROT.Path.Dijkstra(character.x,character.y,
      function(x, y) {
          return (map[x+","+y] === FLOOR);
      }
    );
  	dijkstra.compute(tile_x, tile_y, function(x, y) {
  	character.path_array.push([x,y]);
    if (character.cart != null) {
      character.cart.path_array.push([x,y]);
    }
     });
  	character.calcPath();
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
    Object.keys(entMap).forEach(function(item) {entMap[item].drawCharacter()});
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
	this.path_array = [];
  var id = 0;
  var queue = new ROT.EventQueue();
  this.cart = null;

  this.getid = function(){
    return id;
  }

  this.setArray = function(array){
    this.path_array = array;
    return array;
  }
  this.setCart = function(cart_entity){
    this.cart = cart_entity;
  }
  this.northWest = function(){
    if (!map[(this.x-1)+","+(this.y-1)]){
		this.x -= 1;
    this.y -= 1;
  }
}
  this.northEast = function(){
    if (!map[(this.x+1)+","+(this.y-1)]){
		this.x += 1;
    this.y -= 1;
  }
}
  this.southWest = function(){
    if (!map[(this.x-1)+","+(this.y+1)]){
		this.x -= 1;
    this.y += 1;
  }
}
  this.southEast = function(){
    if (!map[(this.x+1)+","+(this.y+1)]){
		this.x += 1;
    this.y += 1;
  }
}
  this.moveUp = function(){
    if (!map[this.x+","+(this.y-1)]){
		this.y -= 1;
	}
  }
  this.moveDown = function(){
    if (!map[this.x+","+(this.y+1)]){
		this.y += 1;
	}
  }
  this.moveLeft = function(){
    if (!map[(this.x-1)+","+this.y]){
		this.x -= 1;
	}
  }
  this.moveRight = function(){
    if (!map[(this.x+1)+","+this.y]){
		this.x += 1;
	}
  }
	this.fovComp = function(){
  		fov.compute(this.x, this.y, 10,function(x, y, r, visibility) {
  		var ch = null;
  		var color = (map[x+","+y] ? "#aa0": "#660");
  		display.draw(x, y, ch, "#fff", color);
  		 });
	}
  this.drawCharacter = function(){
    display.draw(this.x, this.y, this.icon,"#fff","#660");
  }
	this.act = function(){

    direction = queue.get();
    if(direction == null){
      return;
    }
    else if (direction[0] == -1 && direction[1] == -1){
      this.northWest();
    }
    else if (direction[0] == 1 && direction[1] == -1) {
      this.northEast();
    }
    else if (direction[0] == -1 && direction[1] == 1) {
      this.southWest();
    }
    else if (direction[0] == 1 && direction[1] == 1) {
      this.southEast();
    }
    else if (direction[0] == 0 && direction[1] == -1) {
      this.moveUp();
    }
    else if (direction[0] == 0 && direction[1] == 1) {
      this.moveDown();
    }
    else if (direction[0] == -1 && direction[1] == 0) {
      this.moveLeft();
    }
    else if (direction[0] == 1 && direction[1] == 0) {
      this.moveRight();
    }
	}
	this.calcPath = function(){
    queue.clear();
    if(this.cart != null){
      this.cart.path_array.shift();
      this.cart.path_array.push([this.cart.x,this.cart.y]);
      this.cart.calcPath();
    }
     for(var i = this.path_array.length-1; i > 0 ; i--){
			 queue.add([this.path_array[i-1][0] - this.path_array[i][0],
       this.path_array[i-1][1] - this.path_array[i][1]]);
		 }
     this.path_array = [];
	}
}
function place(entity){
  for(i = 0;i <screen_width; i++){
	for (j = 0; j <screen_height; j++){
		if(!map[i + "," + j]){
      entity.x = i;
      entity.y = j;
      map[i + "," + j] = 2;
      entity.fovComp();
      return 1;
    }
	}
}
  return 0;
}

var drawScreen = function(){
  for(i = 0; i < screen_width;i++){
    for(j = 0; j < screen_height;j++){
      var color = (map[i+","+j] ? "#aa0": "#660");
      display.draw(i, j, null,"#fff",color);
    }
  }
}
setInterval(function(){

  cont.actEntities();
  display.clear();
	drawScreen();
  cont.drawEntities();

}, 100

);
