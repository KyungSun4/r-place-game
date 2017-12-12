
/*
 side means opposition so it will be a color
 */

 // health is defense
 // attack means physical attack -- modify health


 // Let's assume that blue is the left half of the grid, while red is the right half of the grid
 /* This would mean that blue will attack horizontally to the right, while red will attack horizontally to the left  */ss

var BlueSoldier = {
	side: "Blue";
	health: 3;
	attack: 1;
}
var Game = {
	done = false;
}

var RedSoldier = {
	side: "Red";
	health: 3;
	attack: 1;
}

var attack = function(soldier){
	soldier.health --;
}



var dead(){
	if(RedSoldier.health -= 0)
	{
		// insert blue soldier position to new position or change type of cell
	}
	if(BlueSoldier.health == 0)
	{
		// insert red soldier position to new position or change type of cell
	}
}

if(All Grid Cells are One Type) // super slang but just temp for now (essentially constant looping for each move)
{
	Game.done = true;
}
