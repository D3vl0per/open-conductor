const successfulUserCreateMessage = function(teamId, code) {
	return `✅ Sikeresen létrehozta a felhasználót!\nCsapat ID: **\`${teamId}\`** \nHitelesítési kód: **\`${code}\`**`;
};

const successfulTeamCreateMessage = function(teamId) {
	return `✅ Sikeresen létrehozta a csapatot! \nCsapat ID:** \`${teamId}\`**`;
};

const successfulAutheticatonMessage = function(firstName, lastName) {
	return `✅ Sikeres hitelesítés! ✅\n\nÜdvözöllek **${lastName} ${firstName}**!\nMár van jogod, hogy lásd a szerveren a csatornákat!`;
};

const successfulTicketOpeningMessage = function(message, ticketId) {
	return `✅ Sikeresen megkaptuk a bejelentésedet!\n\nAz általad bekülött hibajegy: \n**${message}**\n\nA hibajegy azonosítója: \n\`${ticketId}\`\n\nHamarosan felveszi a kapcsolatot veled az egyik kollégánk! 😊`;
};

const nrkContent = function(userId) {
	return `**Kedves <@${userId}> játékos!**\n\nA verseny moderátorai megítélése szerint a megnyitott hibajegy nem tartozott az esemény tárgykörébe, ezért automatikusan lezárásra került.\n\nAmennyiben indokolatlannak tartja ezt a moderátori tevékenységet, keresse fel a szervezőket az alábbi email címen keresztül: **admin@admin.hu**`;
};

const validFlag = function(flagScore, teamScore) {
	return `✅ Érvényes flag!\nEz a flag **${flagScore}** pontot ért.\nÖsszesen **${teamScore}** pontja van a csapatodnak!`;
};

const bannedUserErrorMessage = function(userId) {
	return `❌ Az interakciók blokkolva permanensen a sok sikertelen hitelesítés miatt!\n\nAz ön egyedi felhasználói azonosítója: \`${userId}\`\n\nAmennyiben nem tartja jogosnak a kitiltást, kérem keresse fel a **admin@admin.hu** email címen kersztül a szervezőket!`;
};

const successfulCodeRegen = function(newCode) {
	return `✅ Sikeres újragenerálás!\nAz új kód: \`${newCode}\``;
};

module.exports = {
	roleGuardianOnlyModeratorsMessage: '❌ A parancs jogosultság hiányában nem lett lefuttatva!',
	replyInteractionQueryInProgressMessage: ':mag: Lekérdezés folyamatban... :mag_right:',
	teamNotExistErrorMessage: '❌ Ez a csapatnév nem létezik',
	teamIsExistErrorMessage: '❌ Ez a csapatnév már létezik',
	userNotExistErrorMessage: '❌ Ez a felhasználó nem létezik',
	succesfulUserDeleteMessage: '✅ Sikeresen törölte a játékost!',
	succesfulTeamDeleteMessage: '✅ Sikeresen törölte a csapatot!',
	succesfulSlashCommandPruge: '✅ Sikeresen letörölted az összes parancsot!',
	roleGuardianAuthenticatedUsersOnlyMessage: '❌ Ezt a parancsot csak hitelesített játékosok tudják futtatni!',
	roleGuardianNonAuthenticatedUsersOnlyMessage: '❌ Ezt a parancsot csak nem hitelesített játékosok tudják futtatni!',
	replyInteractionCheckMessage: ':arrows_counterclockwise:  Ellenőrzés folyamatban... ',
	inputErrorNonUUIDMessage: '❌ Helytelen formátumú azonosítási adatok!',
	authenticationFailedMessage: '❌ Sikertelen hitelesítés!',
	multipleAccountAuthenticationUserMessage: '⚠️ Többszöri hitelesítés detektálva!\nEset jelzésre került a szervezők felé!\nIdeiglenes rangot kapsz a karanténhez, ahol kapcsolatba tudnak veled lépni az elérhető szervező!\n⚠️',
	databaseProblemPublicErrorMessage: '❌ Probléma lépett fel az adatbázis lekérdezés futtatásánál!\nKérem azonnal vegye fel a szervezőkkel a kapcsolatot!',
	databaseProblemPrivateErrorMessage: '❌ Probléma lépett fel az adatbázis lekérdezés futtatásánál, ezért vissza kellett állítani az előző állapotot!\nKérem azonnal vegye fel a fejlesztővel a kapcsolatot!',
	authenticationDisabledErrorMessage: '❌ A hitelesítés funkció ideiglenesen ki van kapcsolva! 🔒',
	nonRegistedUserMessage: '❌ Nem regisztrált felhasználó!',
	bannedSupportUserErrorMessage: '❌ Sajnos ezen funkciót nem veheted igénybe többet már!:confused: \nTovábbiakban technikai segítségnyújtásért az alábbi email címen fordulhatsz kollégáinkhoz:\n**admin@admin.hu**',
	onlyOneTicketErrorMessage: '❌ Egyszerre csak 1 nyitott hibajegyed lehet!',
	tooShortErrorMessage: '❌ Meg kell adnod egy rövid leírást a problémával kapcsolatban!',
	tooLongErrorMessage: '❌ Túl hosszú üzenet! Kérlek tarsd magada a 150 karakteres limithez!',
	supportDisabledErrorMessage: '❌ A support funkció ideiglenesen ki van kapcsolva! 🔒',
	nonExistingUserErrorMessage: '❌ Ezen felhasználó nincsen nyilvántartva az adatbázisban!',
	stfr: '✅ Sikeresen beállítottad a jogot!',
	succesfulSupportLockMessage: '✅ Sikeresen zárolta a support funkciót!',
	succesfulAuthLockMessage: '✅ Sikeresen zárolta az auth funkciót!',
	succesfulSupportUnlockMessage: '✅ Sikeresen feloldotta a support funkciót!',
	successfulAuthUnlockMessage: '✅ Sikeresen feloldotta az auth funkciót!',
	pruneDeletingErrorMessage: '❌ Probléma lépett fel az üzenetek törlésével ezen a csatornán!',
	pruneAmountErrorMessage: '❌ Meg kell adnod egy számot 1 és 99 között!',
	pruneSuccesfulMessage: '✅ Sikeresen kitörölted az üzeneteket!',
	successfulSupportBanMessage: '✅ Sikeresen letiltottad!',
	successfulSupportUnbanMessage: '✅ Sikeresen feloldottad a tiltást!',
	bannedUserIsNotExistErrorMessage: '❌ Nincsen ilyen tiltott felhasználó!',
	succesfulTicketCloseMessage: '😊 Sikeres hibajegy zárás!',
	ticketIsNotExistMessageErrorMessage: '❌ Nincsen ilyen ticket!',
	succesfulTicketClaimingMessage: '✅ Sikeres hibajegy felvétel',
	ticketIsNotExistMessage: '✅ Nincsen nyitott hibajegyed!',
	replyInteractionQuerySubmitTicket: ':arrows_counterclockwise: Hibajegy rögzítése folyamatban...',
	slotIsNotExistMessage: '❌ Nincsen ilyen slot!',
	notAValidDataMessage: '❌ Helytelen formátumú adatok!',
	succesfulUserWarnMessage: '✅ Sikeresen figyelmeztette a felhasználót!',
	successfulTeamWarnMessage: '✅ Sikeresen figyelmeztette a csapatot!',
	nonMemberOfGuild: 'Kérlek csatlakozzál először a közösségünkhöz: https://discord.gg/XXXXXXXX',
	generalErrorMessage: '❌ Probléma volt a parancs futtatása közben!',
	successfulUserRemoveMessage: '✅ Sikeresen törölte a játékost!',
	successfulTeamRemoveMessage: '✅ Sikeresen törölte a csapatot!',
	successfulCommandRemoveMessage: '✅ Sikeresen letörölted az összes parancsot!',
	successfulKvFlushMessage: '✅ Sikeresen letörölted a teljes KV store-t!',
	successfulKvChannelsCacheFlushMessage: '✅ Sikeresen törölte a channels cache-t!',
	successfulKvRolessCacheFlushMessage: '✅ Sikeresen törölte a roles cache-t!',
	successfulKvTicketRemoveMessage: '✅ Sikeresen törölte a hibajegyet!',
	successfulAuthBanRemoveMessage: '✅ Sikeresen törölte a tiltást!',
	successfulSupportChannelContentPurgeMessage: '✅ Sikeresen törölte a kiválaszott support csatorna tartalmát!',
	ticketIsNotClaimedErrorMessage: '❌ Nem lett felvéve a ticket!',
	wrongFlagErrorMessage: '😕 Sajnos nem jó a flag!',
	alreadySubmittedFlagErrorMessage: '❌ Ez a flag után már megkaptad a jutalmat!',
	replyInteractionFlagCheckingInProgressMessage: ':arrows_counterclockwise: Flag ellenőrzése folyamatban...',
	promotedAsFinalistMessage: 'Te és a csapatod promótálva lett a döntőre!\nMost már van jogod elérni a flag submit parancsot és a döntősök csatornáját!',
	successfulPromotingMessage: '✅ Sikeres promótálás!',
	successfulCompetitorsSupportLockingMessage: '✅ Sikeresen zárolta a support funkciót a selejtezősöknél!',
	successfulCompetitorsSupportUnlockingMessage: '✅ Sikeresen feloldotta a support funkció zárolását a selejtezősöknél!',
	createdByMessage: 'Az XXXX-XXX megbízásából a botot D3v készítette. \nNév: `Conductor`\nVerzió: `1.0.0`\nEnv: `Prod`',
	successfulSubmitLockingMessage: '✅ Sikeresen zárolta a submit funkciót!',
	successfulSubmitUnlockingMessage: '✅ Sikeresen feloldotta a submit funkciót!',
	submitDisabledErrorMessage: '❌ A verseny vagy nem kezdődött még el vagy már befejeződött! 🔒',
	successfulTeamNameChangeMessage: '✅ Sikeresen módosította a csapatnevet!',
	missingParametersErrorMessage: '❌ Hiányzó paraméter!',
	invisibleSpaceErrorMessage: '❌ A csapat azonosító vagy a hitelesítő kód tartalmazhat nem látható karaktereket!\nÉrdemes kitörlni az utolsó karaktereket, amelyek a csapat azonosítóban vagy a hitelesítési kódban vannak és visszaírni a őket kézzel.',
	validFlag: validFlag,
	successfulUserCreateMessage: successfulUserCreateMessage,
	successfulTeamCreateMessage: successfulTeamCreateMessage,
	successfulAutheticatonMessage: successfulAutheticatonMessage,
	successfulTicketOpeningMessage: successfulTicketOpeningMessage,
	nrkContent: nrkContent,
	bannedUserErrorMessage: bannedUserErrorMessage,
	successfulCodeRegen: successfulCodeRegen,
};