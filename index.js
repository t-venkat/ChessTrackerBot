const Discord = require('discord.js');
const Sequelize = require('sequelize');

const client = new Discord.Client();
const PREFIX = '!';
const { Op } = require("sequelize");

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
	match: {
		type: Sequelize.STRING,
	}
});

async function checkName (nameP) {
	const nameC = await Scores.findOne({ where: { name: nameP } });
	if (nameC) {
		return true;
	}
	return false;
}

async function updateWinLoss (winner, loser) {
	const wEntry = await Scores.findOne({ where: {name: winner} });
	wEntry.increment('wins');

	const lEntry = await Scores.findOne({ where: {name: loser} });
	lEntry.increment('losses');
}

async function updateDraw (player1, player2) {
	const p1Entry = await Scores.findOne({ where: {name: player1} });
	wEntry.increment('draws');

	const p2Entry = await Scores.findOne({ where: {name: player2} });
	p2Entry.increment('draws');
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
		message.channel.send("Here is a list of commands:\n!register playerName - registers a player into the bot, must be unique, and 1 word for ease of use\n!leaderbord - Displays each players wins and losses\n!history playerName - Displays that players match history\n!record WhitePlayerName BlackPlayerName Outcome(Winner PlayerName or Draw) - Records a match, can only be used by a chess admin\n!delete PlayerName MatchNumber - Deletes a match from a players match history, can only be used by a chess admin");
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
		const outcome = args.shift();
		const matchLink = args.shift();
		//const test  = checkName(whiteP);
		//console.log(test);

		if (!(await checkName(whiteP)) || !(await checkName(blackP))) { //To see if the name is in the database 
			return message.reply('At least one of the players entered is not in the database');
		}

		if (whiteP === blackP) { //To see whether the names are different
			return message.reply('You played yourself smh');
		}

		if (whiteP.toLowerCase() != outcome.toLowerCase() && blackP.toLowerCase() != outcome.toLowerCase() && outcome.toLowerCase() != "draw") { //To ensure outome is correct
			return message.reply('Outcome field is invalid');
		}

		
		if (matchLink == null) {
			return message.reply('ERROR must enter something for fourth feild, if not, then enter NONE');
		}


		if (matchLink.indexOf("lichess") == -1 && (matchLink.toLowerCase() != "none")) {
			return message.reply('ERROR, Must send a link from lichess to store, if not, enter NONE in the field');
		}

		const currentDate = Date.now();

		try {
			const input = await Matches.create({
				white: whiteP,
				black: blackP,
				date: currentDate,
				outcome: outcome,
				match: matchLink,
			});

			if (outcome === whiteP.toLowerCase()) {
				await updateWinLoss(whiteP, blackP);
			}

			if (outcome === blackP.toLowerCase()) {
				await updateWinLoss(blackP, whiteP);
				const added = await Scores.findOne({ where: { name: blackP } });
				console.log(added);
			}

			if (outcome === "draw") {
				await updateDraw(whiteP, blackP);
			}
			
			return message.reply('Match has been added');

		} catch (e) {
			return message.reply('Something went wrong when trying to record this match');
		}
	}

	if (command === 'leaderbord') {
		try{
			var finalString = "Name\t   Wins\t   Losses\t   Draws\n";
			const players = await Scores.findAll({
				order: [['wins', 'DESC']]
			});
			var x = 0;
			while (x < players.length) {
				const name = players[x].name;
				const wins = players[x].wins;
				const losses = players[x].losses;
				const draws = players[x].draws;
				finalString = finalString + name + '\t\t' + wins + '\t\t' + losses + '\t\t' + draws
				if (x != players.length-1) {
					finalString = finalString + '\n';
				}
				x++;
			}
			message.channel.send(finalString);
		} catch (e) {
			console.log(e);
			return message.reply("Error when printing out leaderbord")
		}
		

	}



	if (command === 'history') { //Not working
		const playerName = args.shift();
		if (!(await checkName(playerName))) {
			return message.reply(`ERROR ${playerName} is not in the database`);
		}
		try {
		const matchList = await Matches.findAll({
		 where: {
			[Op.or]: 
				[
				{ white: playerName },
				{ black: playerName }
				] 
			},
			order: [['date', 'ASC']]
		 }); 
		var finalString = `${playerName} Match History\nDate\tWhite\tBlack\tOutcome\tLink to Game\n`;
		var x = 0;
			while (x < matchList.length) {
				const date = matchList[x].date;
				const white = matchList[x].white;
				const black = matchList[x].black;
				const outcome = matchList[x].outcome;
				const gameLink = matchList[x].match;
				finalString = finalString + date + '\t\t' + white + '\t\t' + black + '\t\t' + outcome + '\t\t' + gameLink;
				if (x != matchList.length-1) {
					finalString = finalString + '\n';
				}
				x++;
			}
			message.channel.send(finalString);
		
		}
		catch (e) {
			console.log(e);
			return message.reply('Something went wrong when trying to get this players match history');
		}
	}

});

client.login('NzE4OTk5OTUyNDgyODkzODU0.XuLDZA.zV22AlQvpyDXbHRmHDhS47tw8n8');