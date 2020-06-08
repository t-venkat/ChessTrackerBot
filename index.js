const Discord = require('discord.js');
const Sequelize = require('sequelize');

const client = new Discord.Client();
const PREFIX = '!';

//connection information to the sqlite database
const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const Scores = sequelize.define('scores', {
	name: {
		type: Sequelize.STRING,
		unique: true,
	},
	wins: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
	},
	losses: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
	},
	draws: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
	},
});

const Matches = sequelize.define('matches', {
	white: {
		type: Sequelize.STRING,
	},
	black: {
		type: Sequelize.STRING,
	},
	date: {
		type: Sequelize.DATE,
	},
	outcome: {
		type: Sequelize.STRING,
	},
});

async function checkName (nameP) {
	const nameC = await Scores.findOne({ where: { name: nameP } });
	if (nameC) {
		console.log(nameC);
		return true;
	}
	console.log("Didnt Find Name");
	return false;
}

client.once('ready', () => {
	console.log('Ready!');
	Scores.sync({ force: true });
	Matches.sync({ force: true });
});

client.on('message' , async message => {

	if(!message.content.startsWith(PREFIX) || message.author.bot) {
		return;
	}
	
	const args = message.content.slice(PREFIX.length).split(' ');
	const command = args.shift().toLowerCase();
	if (command === 'help') { //Outputs a message about how to use the bot
		message.channel.send("Here is a list of commands:\n!register playerName - registers a player into the bot, must be unique, and 1 word for ease of use\n!leaderbord - Displays each players wins and losses\n!playername history - Displays that players match history\n!record WhitePlayerName BlackPlayerName Outcome(Winner PlayerName or Draw) - Records a match, can only be used by a chess admin\n!delete PlayerName MatchNumber - Deletes a match from a players match history, can only be used by a chess admin");
	}
	if (command === 'register') {

		const newName = args.shift();
		try {
			const input = await Scores.create({
				name: newName,
			});

			//const nameAdded = await Scores.findOne({ where: { name: newName } });
			return message.reply(`Player ${input.name} added.`);
		} catch (e) {
			if (e.name === 'SequelizeUniqueConstraintError') {
				return message.reply('That player name already exists.');
			}
			return message.reply('Something went wrong when adding that player');
		}

	}

	if (command === 'record') {
		const whiteP = args.shift();
		const blackP = args.shift();
		const outcome = args.shift().toLowerCase();
		//const test  = checkName(whiteP);
		//console.log(test);

		if(!checkName(whiteP) || !checkName(blackP)) {
			return message.reply('One of the players entered is not in the database');
		}

		//const matchInput = await Matches.create({


		//});
		console.log("Both Names are in the database");


	}
});

client.login('NzE4OTk5OTUyNDgyODkzODU0.Xt55Cw.Xczf7VukLs3RAHdecYvTb8gpzmE');