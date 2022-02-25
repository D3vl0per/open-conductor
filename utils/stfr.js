require('dotenv').config();


const setCommandPermission = async function(interaction, roles) {
	const rolesName = ['GUEST_ROLE', 'COMPETITORS_ROLE', 'SUPPORT_ROLE', 'ROOT_ROLE'];
	const rolesId = [process.env.GUEST_ROLE, process.env.COMPETITORS_ROLE, process.env.SUPPORT_ROLE, process.env.ROOT_ROLE];

	const defaultPermission = [];

	defaultPermission[0] = {};
	defaultPermission[0]['id'] = interaction.commandId;
	defaultPermission[0]['permissions'] = [];
	for (let i = 0; i < rolesId.length; i++) {
		defaultPermission[0]['permissions'][i] = {};
		defaultPermission[0]['permissions'][i]['id'] = rolesId[i];
		defaultPermission[0]['permissions'][i]['type'] = 1;
		defaultPermission[0]['permissions'][i]['permission'] = false;
	}
	for (let i = 0; i < roles.length; i++) {
		for (let j = 0; j < rolesName.length; j++) {
			if (roles[i] == rolesName[j]) {
				const pos = defaultPermission[0]['permissions'].findIndex(o => o['id'] == rolesId[j]);
				defaultPermission[0]['permissions'][pos]['permission'] = true;
			}
		}
	}
	// await interaction.guild.commands.permissions.add({command: defaultPermission[0]["id"], permissions: defaultPermission[0]["permissions"]})

	await interaction.guild.commands.permissions.set({ fullPermissions: defaultPermission });
	await interaction.client.application.commands.permissions.set({ fullPermissions: defaultPermission });
};


module.exports = {
	setCommandPermission: setCommandPermission,
};