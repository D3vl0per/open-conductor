require('dotenv').config();
const { welcomeUser, welcomeLobby } = require('../utils/embedRenderer');
const { updateDiscordStat } = require('../utils/stat');
module.exports = {
	name: 'guildMemberAdd',
	once: false,
	async execute(member) {
		await member.roles.add(process.env.GUEST_ROLE).catch(console.error);

		// Send welcome message to user
		const welcome = welcomeUser();
		await member.user.send({ content: welcome.content, embeds: [welcome.embed] });

		// Send new joined user profile details to lobby channel
		const guild = member.guild;
		// Checking if it's not null
		if (guild.systemChannel) {
			const avatarUrl = await member.user.displayAvatarURL({ format: 'png' });
			guild.systemChannel.send({ embeds: [welcomeLobby(avatarUrl, member).embed] });
		}
		await updateDiscordStat(member, guild['memberCount']);
	},
};