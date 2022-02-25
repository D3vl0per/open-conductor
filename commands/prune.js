const { SlashCommandBuilder } = require('@discordjs/builders');
const { roleGuardian, sendModerationLog } = require('../utils/protection');
const { roleGuardianOnlyModeratorsMessage, pruneDeletingErrorMessage, pruneAmountErrorMessage, pruneSuccesfulMessage, missingParametersErrorMessage } = require('../templates/messages');
const { pruneDescription, pruneAmount } = require('../templates/slashCommandParameters');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('prune')
		.setDescription(pruneDescription)
		.addIntegerOption(option => option.setName('amount').setDescription(pruneAmount)),
	permissions: ['ROOT_ROLE'],
	async execute(interaction) {
		if (await roleGuardian(interaction, this.permissions)) {
			return interaction.reply({ content: roleGuardianOnlyModeratorsMessage, ephemeral: true });
		}
		const amount = interaction.options.getInteger('amount');

		if (amount == null) {
			return interaction.editReply({ content: missingParametersErrorMessage, ephemeral: true });
		}

		if (amount <= 1 || amount > 99) {
			return interaction.reply({ content: pruneAmountErrorMessage, ephemeral: true });
		}

		await interaction.channel.bulkDelete(amount, true).catch(error => {
			console.error(error);
			interaction.reply({ content: pruneDeletingErrorMessage, ephemeral: true });
		});

		interaction.reply({ content: pruneSuccesfulMessage, ephemeral: true });
		return sendModerationLog(interaction);
	},
};