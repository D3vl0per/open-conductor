require('dotenv').config();
const { goodbyeLobby } = require('../utils/embedRenderer');
const { updateDiscordStat } = require('../utils/stat');
module.exports = {
	name: 'guildMemberRemove',
	once: false,
	async execute(member) {
		// Send new joined user profile details to lobby channel
		const guild = member.guild;
		// Checking if it's not null
		if (guild.systemChannel) {
			const avatarUrl = await member.user.displayAvatarURL({ format: 'png' });
			guild.systemChannel.send({ embeds: [goodbyeLobby(avatarUrl, member).embed] });
		}
		await updateDiscordStat(member, guild['memberCount']);
	},
};