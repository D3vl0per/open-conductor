require('dotenv').config();
const { sendEventLog } = require('../utils/protection');
module.exports = {
	name: 'roleCreate',
	once: false,
	async execute(role) {
		sendEventLog(role, 'Role created');
	},
};