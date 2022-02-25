require('dotenv').config();
const { sendEventLog } = require('../utils/protection');
module.exports = {
	name: 'channelCreate',
	once: false,
	async execute(channel) {
		sendEventLog(channel, `Channel created: **${channel.name}**`);
	},
};