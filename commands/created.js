const { SlashCommandBuilder } = require('@discordjs/builders');
const { roleGuardian } = require('../utils/protection');
const { roleGuardianAuthenticatedUsersOnlyMessage, createdByMessage } = require('../templates/messages');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('created')
		.setDescription('Created by...'),
	permissions: ['ROOT_ROLE', 'COMPETITORS_ROLE', 'FINALISTS_ROLE'],
	async execute(interaction) {

		if (await roleGuardian(interaction, this.permissions)) {
			return interaction.reply({ content: roleGuardianAuthenticatedUsersOnlyMessage, ephemeral: true });
		}
		return interaction.reply({ content: createdByMessage, ephemeral: true });
	},
};