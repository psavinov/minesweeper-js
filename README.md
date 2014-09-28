minesweeper-js
==============

Client-server minesweeper in JavaScript using Node.JS and MongoDB
to store the results (player's score).

To start playing it's necessary to start MongoDB server and specify
MongoDB host and port and game server port in the miner.node.js file. 
Then just start it through the command line, like that: node miner.node.js 
and enter the game in your web-browser via url http://localhost:8080/
(if you didn't specified game server port, it's 8080 by default).

You can provide the game link to your friends and play together ;) 

Required Node.JS modules:
    * http
    * fs
    * url
    * mongodb