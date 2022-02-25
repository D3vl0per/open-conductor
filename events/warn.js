module.exports = {
	name: 'warn',
	once: false,
	async execute(error, logger) {
		logger.log('warn', error);
	},
};
