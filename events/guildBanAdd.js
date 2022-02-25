require('dotenv').config();
require('dotenv').config();
const { sendEventLog } = require('../utils/protection');
module.exports = {
	name: 'guildBanAdd',
	once: false,
	async execute(ban) {
		sendEventLog(ban, `Guild ban add: <@${ban.user.id}>`);
	},
};