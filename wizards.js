ROT.RNG.setSeed(1234);
var map = {};
var screen_width = 40;
var screen_height = 40;
var passableCallback = function(x, y) {
    return (map[x+","+y] === 0);
}
var arena = new ROT.Map.Digger(screen_width,screen_height);
var lightPasses = function(x, y) {
    var key = x+","+y;
    if (key in map) { return (map[key] == 0); }
    return false;
}
var fov = new ROT.FOV.RecursiveShadowcasting(lightPasses);
var callback = function(x,y,value){
	map[x + "," + y] = value;
}
arena.create(callback);
var character = new Entity(7,5,"@");
var monster = new Entity(7,4,"!");
place(character);
place(monster);
var display = new ROT.Display({width:screen_width, height:screen_height, forceSquareRatio:true});
var debug = document.createElement("div");
display.getContainer().addEventListener("click", getClickPosition);
document.body.appendChild(display.getContainer());

var getClickPosition = function(e) {
	var square_width = display.getContainer().width/screen_width;
	var square_height = display.getContainer().height/screen_height;
	var click_x = (e.clientX + 6)/square_width;
	var click_y = (e.clientY + 6)/square_height;
	var tile_x = Math.floor(click_x)-1;
	var tile_y = Math.floor(click_y)-1;
	display.draw(tile_x,tile_y,"C");
	var dijkstra = new ROT.Path.Dijkstra(character.x,character.y, passableCallback);
	dijkstra.compute(tile_x, tile_y, function(x, y) {
	display.draw(x, y, "", "", "#800");
	character.patharray.push(x + ',' + y);
   });
	character.calcpath();

}
display.getContainer().addEventListener("click", getClickPosition);

function Entity(startX, startY,icon){
  this.x = startX;
  this.y = startY;
	this.patharray = [];
	this.path = [];
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
		var ch = (r ? " " : icon);
		var color = (map[x+","+y] ? "#aa0": "#660");
		display.draw(x, y, ch, "#fff", color);
		 });
	}
	this.act = function(){
    /* to do */
	}
	this.calcpath = function(){
		alert(character.path);/*
     for(var i = 0; i < this.patharray.length; i++){
			 this.path.push(this.patharray[i+1][0]-this.patharray[i][0]);
		 }
		 */

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
	display.clear();
	character.fovcomp();

});
/*
setInterval(function(){

}, 100

);
*/
