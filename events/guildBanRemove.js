require('dotenv').config();
const { sendEventLog } = require('../utils/protection');
module.exports = {
	name: 'guildBanRemove',
	once: false,
	async execute(ban) {
		sendEventLog(ban, `Guild ban removed: <@${ban.user.id}>`);
	},
};