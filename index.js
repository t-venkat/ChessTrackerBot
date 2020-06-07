const Discord = require('discord.js');
const client = new Discord.Client();

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message' , message => {
	
	if (message.content === '!help') { //Outputs a message about how to use the bot
		message.channel.send("Here is a list of commands:\n!leaderbord - Displays each players wins and losses\n!playername history - Displays that players match history\n!record WhitePlayerName BlackPlayerName WinnerPlayerName - Records a match, can only be used by a chess admin\n!delete PlayerName MatchNumber - Deletes a match from a players match history, can only be used by a chess admin");
	}
	if (message.content === '')
});

client.login('NzE4OTk5OTUyNDgyODkzODU0.XtxcbQ.TjfYYR8o_y20r3NRrYwsxjDhgA8');