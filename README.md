# rPlaceGame
## Synopsis

The game largely resembles the famous r/Place project which was released on Reddit as an intriguing project that required teamwork and strategy.
In our version, the focus of the game is to allow players to communicate and think creatively with a large team to develop a game plan to
conquer the map. Once players join the webpage, they will sign in immediately and be randomly assigned to a team. Once players are settled
into teams, they will each be given an option to place an object - which can be a soldier or a wall. A timer will begin once the moves have been
played and will repeat until one's next turn. The game will officially end after a team conquers the entire map or after a
determined amount of time.

## Motivation

This project exists as a continuation of the r/Place game and as a way for fans of the game or anyone to spend time on a game which will
test their creativity as well as their algorithmic thinking skills. With collaborative efforts, our team proceeded to expand our knowledge
on backend and frontend work by utilizing languages such as Javascript, HTML/CSS, and other extensions as well as database software like 
MongoDB to come up with this product. 

## Game Specifics

Possible Actions Include:
- Only placing Objects in one's own territory (border-inclusive)
- Wall
   - When walls are placed together, it is harder for enemy to advance lines
   - More health than a soldier (3 HP)
- Soldier
   - Each soldier has 1 HP
   - More likely to be killed if soldier is by itself
   - In each turn, a player can decide which direction a soldier should move to

## UI Elements
- Timer
- Map

## Setup
Install node and clone the repository

mLab can be used as a mongodb database, the connection information for this should be put in a file called `mongoURL.js` that contains the text `module.exports = 'mongodb://<dbuser>:<dbpassword>@ds135966.mlab.com:35966/r-place-game';`

the server can then be run using from the terminal with `node app.js` the database can be reset on startup by changing the varible `resetMap = false` in the file `app.js` line 54

The server can also be run on heroku by importing the code from github. The config vars PROD_MONGODB and RESETMAP should be set to `mongodb://<dbuser>:<dbpassword>@ds135966.mlab.com:35966/r-place-game` and `true` or `false` respectively.

## How to play

## How it works
### Backend
#### Node.JS
#### Mongo DB
#### Express.JS
#### Socket.io
#### HTTP
### Front End
#### HTML5 Canvas
#### HTTP
#### Socket.IO
## API
## Authors
John Han - [KyungSun4](https://github.com/kyungsun4)
Sriram Rameshbabu - [itssriram98](https://github.com/itssriram98)
Chaitanya Jujjavarapu - [cnj3](https://github.com/cnj3)
Anooj Lal - [anoojlal](https://github.com/anoojlal)

## Acknowledgments
inspired by [reddit.com/r/place](https://reddit.com/r/place)
