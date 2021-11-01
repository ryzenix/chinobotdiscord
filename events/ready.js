const web = require('../util/web.js');
const { purgeDbGuild } = require('../util/util');
const music = require('../util/music');

module.exports = async client => {
    logger.log('info', `[DISCORD] Logged in as ${client.user.tag}!`);
    client.finished = false;
    client.user.setPresence({ activities: [{ name: 'waking up' }], status: 'dnd' });
    logger.log('info', '[DISCORD] Fetching server...');
    const allServer = await client.dbguilds.find({});
    if (allServer.length) {
        for (const guild of allServer) {
            try {
                await client.guilds.fetch(guild.guildID);
                client.guildsStorage.set(guild.guildID, guild);
            } catch (err) {
                await purgeDbGuild(client, guild.guildID);
                client.config.logChannels.forEach(id => {
                    const channel = client.channels.cache.get(id);
                    if (channel) channel.send(`Kicked from an undefined server (id: ${guild.guildID}).`);
                });
                const owner = client.users.cache.get(client.config.ownerID);
                if (owner) owner.send(`Kicked from an undefined server (id: ${guild.guildID}).`);
                logger.log('info', `Kicked from an undefined server (id: ${guild.guildID}).`);
            };
        }
    };
    const staffsv = client.guilds.cache.get(client.config.emojiServerID);
    if (staffsv) {
        await staffsv.emojis.cache.forEach(async emoji => {
            client.customEmojis.set(emoji.name, emoji);
        });
        logger.log('info', `[DISCORD] Added ${client.customEmojis.size} custom emojis`);
    };
    logger.log('info', `[DISCORD] Fetching all unverified members..`)
    if (process.env.NO_WEB_SERVER !== 'true') {
        await client.verifytimers.fetchAll();
        web.init(client);
    };
    await client.initGiveaway();
    if (process.env.NOLAVA !== 'true') await music.init(client);
    client.finished = true;
    // const activity = randomStatus(client);
    client.user.setPresence({ activities: [{ name: ';-;', type: 'WATCHING' }], status: 'online' });
    // const timeout = setInterval(() => {
    //     const activity = randomStatus(client);
    //     client.user.setPresence({ activities: [{ name: activity.text, type: activity.type }], status: 'online' })
    // }, 120000);
    // timeout.unref();
};