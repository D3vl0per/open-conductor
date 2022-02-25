const { SlashCommandBuilder } = require('@discordjs/builders');
const { roleGuardian, sendModerationLog, isUUID } = require('../utils/protection');
const db = require('../utils/db');
const redis = require('../utils/redis');
const { queryDeleteTeam, queryDeleteUserByEmail } = require('../utils/sqls');
const { setCommandPermission } = require('../utils/stfr');
const { roleGuardianOnlyModeratorsMessage, replyInteractionQueryInProgressMessage, successfulUserRemoveMessage, databaseProblemPrivateErrorMessage, successfulTeamRemoveMessage, successfulCommandRemoveMessage, successfulKvFlushMessage, successfulKvChannelsCacheFlushMessage, successfulKvRolessCacheFlushMessage, notAValidDataMessage, successfulKvTicketRemoveMessage, successfulAuthBanRemoveMessage, stfr, missingParametersErrorMessage } = require('../templates/messages');
const { removeDescription, removeUserDescription, removeUserUser, removeTeamDescription, removeTeamTeam, removeKvDescription, removeKvChannelsDescription, removeKvRolesDescription, removeKvTicketDescription, removeKvTicketTicket, removeAuthUnbanDescription, removeAuthUnbanUser, removeSlashDescription } = require('../templates/slashCommandParameters');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription(removeDescription)
		.addSubcommand(subcommand =>
			subcommand
				.setName('user')
				.setDescription(removeUserDescription)
				.addStringOption(option => option.setName('email').setDescription(removeUserUser)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('team')
				.setDescription(removeTeamDescription)
				.addStringOption(option => option.setName('team').setDescription(removeTeamTeam)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('kv')
				.setDescription(removeKvDescription),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('kv-channels')
				.setDescription(removeKvChannelsDescription),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('kv-roles')
				.setDescription(removeKvRolesDescription),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('kv-ticket')
				.setDescription(removeKvTicketDescription)
				.addStringOption(option => option.setName('ticket').setDescription(removeKvTicketTicket)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('auth-unban')
				.setDescription(removeAuthUnbanDescription)
				.addStringOption(option => option.setName('user').setDescription(removeAuthUnbanUser)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('slash')
				.setDescription(removeSlashDescription),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('stfr')
				.setDescription('Set the f*cking role'),
		),
	permissions: ['ROOT_ROLE'],
	async execute(interaction, logger) {

		if (await roleGuardian(interaction, ['ROOT_ROLE'])) {
			return interaction.reply({ content: roleGuardianOnlyModeratorsMessage, ephemeral: true });
		}
		await interaction.reply({ content: replyInteractionQueryInProgressMessage, ephemeral: true });

		switch (interaction.options.getSubcommand()) {
		case 'user': {
			const email = interaction.options.getString('email');
			if (email == null) {
				return interaction.editReply({ content: missingParametersErrorMessage, ephemeral: true });
			}
			const client = await db.getClient(logger);
			try {
				await client.query('BEGIN');
				await client.query(queryDeleteUserByEmail, [email]);
				await client.query('COMMIT');
				interaction.editReply({ content: successfulUserRemoveMessage, ephemeral: true });
			}
			catch (e) {
				await client.query('ROLLBACK');
				interaction.editReply({ content: databaseProblemPrivateErrorMessage, ephemeral: true });
				throw e;
			}
			finally {
				client.release();
			}

			break;
		}
		case 'team': {
			const team = interaction.options.getString('team');
			if (team == null) {
				return interaction.editReply({ content: missingParametersErrorMessage, ephemeral: true });
			}

			const client = await db.getClient(logger);
			try {
				await client.query('BEGIN');
				await client.query(queryDeleteTeam, [team]);

				await client.query('COMMIT');
				interaction.editReply({ content: successfulTeamRemoveMessage, ephemeral: true });
			}
			catch (e) {
				await client.query('ROLLBACK');
				interaction.editReply({ content: databaseProblemPrivateErrorMessage, ephemeral: true });
				throw e;
			}
			finally {
				client.release();
			}

			break;
		}
		case 'slash': {
			const allCommand = await interaction.client.application.commands.fetch();
			const allCommandId = allCommand.map(r => r.id);
			for (const commandId of allCommandId) {
				await interaction.client.application.commands.delete(commandId);
			}

			const allCommandGuild = await interaction.guild.commands.fetch();
			const allCommandIdGuild = allCommandGuild.map(r => r.id);

			for (const commandIdGuild of allCommandIdGuild) {

				await interaction.guild.commands.delete(commandIdGuild, [interaction.guild.id]);

			}

			interaction.editReply({ content: successfulCommandRemoveMessage, ephemeral: true });
			break;
		}
		case 'kv': {
			const kv = await redis.getClient();
			await kv.send_command('FLUSHDB');
			await kv.send_command('FLUSHALL');
			await kv.disconnect();
			interaction.editReply({ content: successfulKvFlushMessage, ephemeral: true });
			break;
		}
		case 'kv-channels': {
			const kv = await redis.getClient();
			const channels = await kv.keys('cha-support-*');
			for (const channel of channels) {
				await kv.del(channel);
			}
			await kv.disconnect();
			interaction.editReply({ content: successfulKvChannelsCacheFlushMessage, ephemeral: true });
			break;
		}
		case 'kv-roles': {
			const kv = await redis.getClient();
			const roles = await kv.keys('rol-support-*');
			for (const role of roles) {
				await kv.del(role);
			}
			await kv.disconnect();
			interaction.editReply({ content: successfulKvRolessCacheFlushMessage, ephemeral: true });
			break;
		}
		case 'kv-ticket': {
			const ticket = interaction.options.getString('ticket');

			if (ticket == null) {
				return interaction.editReply({ content: missingParametersErrorMessage, ephemeral: true });
			}

			if (!isUUID(ticket)) {
				interaction.editReply({ content: notAValidDataMessage, ephemeral: true });
				return sendModerationLog(interaction);
			}

			const kv = await redis.getClient();
			const ticketDetails = JSON.parse(await kv.get(`ticket-${ticket}`));
			await kv.del(`ticket-${ticket}`);
			await kv.del(`ticket-opener-${ticketDetails['userId']}`);
			await kv.disconnect();
			interaction.editReply({ content: successfulKvTicketRemoveMessage, ephemeral: true });
			break;
		}
		case 'auth-unban': {
			const user = interaction.options.getString('user');

			if (user == null) {
				return interaction.editReply({ content: missingParametersErrorMessage, ephemeral: true });
			}

			const kv = await redis.getClient();
			await kv.del(`denylist-${user}`);
			interaction.editReply({ content: successfulAuthBanRemoveMessage, ephemeral: true });
			break;
		}
		case 'stfr': {
			await setCommandPermission(interaction, ['ROOT_ROLE']);
			interaction.editReply({ content: stfr, ephemeral: true });
			break;
		}
		}

		return sendModerationLog(interaction);
	},
};