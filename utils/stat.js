require('dotenv').config();

const updatePlayerStat = async function(interaction, number) {
	const channel = await interaction.guild.channels.fetch(process.env.PLAYERS_STAT);
	await channel.setName(`Players: ${number}`);
};

const updateTeamStat = async function(interaction, number) {
	const channel = await interaction.guild.channels.fetch(process.env.TEAMS_STAT);
	await channel.setName(`Teams: ${number}`);
};

const updateTeamAndPlayerStat = async function(interaction, teamsNumber, playersNumber) {
	await updatePlayerStat(interaction, playersNumber);
	await updateTeamStat(interaction, teamsNumber);
};

const updateDiscordStat = async function(member, number) {
	const channel = await member.guild.channels.fetch(process.env.DISCORD_USERS_STAT);
	await channel.setName(`Discord users: ${number}`);
};


module.exports = {
	updatePlayerStat: updatePlayerStat,
	updateTeamStat: updateTeamStat,
	updateDiscordStat: updateDiscordStat,
	updateTeamAndPlayerStat: updateTeamAndPlayerStat,
};

