const { SlashCommandBuilder } = require('@discordjs/builders');
const { prePingEmbed, pingEmbed, wsPing } = require('../utils/embedRenderer');
const { roleGuardian } = require('../utils/protection');
const { roleGuardianOnlyModeratorsMessage } = require('../templates/messages');
const { pingDescription, pingWsDescription, pingFullDescription } = require('../templates/slashCommandParameters');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription(pingDescription)
		.addSubcommand(subcommand =>
			subcommand
				.setName('ws')
				.setDescription(pingWsDescription),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('full')
				.setDescription(pingFullDescription),
		),
	permissions: [],
	async execute(interaction) {

		if (await roleGuardian(interaction, ['ROOT_ROLE', 'SUPPORT_ROLE', 'COMPETITORS_ROLE', 'FINALISTS_ROLE'])) {
			return interaction.reply({ content: roleGuardianOnlyModeratorsMessage, ephemeral: true });
		}

		const ws = interaction.client.ws.ping;
		switch (interaction.options.getSubcommand()) {
		case 'ws': {
			return interaction.reply({ embeds: [wsPing(ws).embed], ephemeral: true });
		}
		case 'full': {
			if (await roleGuardian(interaction, ['ROOT_ROLE', 'SUPPORT_ROLE'])) {
				return interaction.reply({ content: roleGuardianOnlyModeratorsMessage, ephemeral: true });
			}

			const sent = await interaction.reply({ embeds: [prePingEmbed(ws).embed], ephemeral: false, fetchReply: true });
			const delay = sent.createdTimestamp - interaction.createdTimestamp;
			return interaction.editReply({ embeds: [pingEmbed(ws, delay).embed] });
		}
		}
	},
};