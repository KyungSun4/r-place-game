var i,j, wall;

x = wall.length
y = wall[x].length
// assuming walls are huge squares (x by x grids basically)

counterBlue = 0 // checks how many of the cells are of blue territory
counterRed = 0 // checks how many of the cells are of red territory
wall = new Wall()

//rough pseudocode which will be modified as things are linked!
var AllGrids(){
	for(i = 0; i < x; i++)
	{
		for(j = 0; j < y; j++)
		{
			if(cell.contains(blue)){
				counterBlue++;
			}
			if(cell.contains(red)){
				counterRed++;
			}
		}
	}
	if(counterRed == 0)
	{
		// Blue wins! teriminate game
	}
	if(counterBlue == 0)
	{
		// Red wins! terminate game 
	}
}
