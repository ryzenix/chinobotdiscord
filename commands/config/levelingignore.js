exports.run = async(client, message, args) => {
    const db = client.guildsStorage.get(message.guild.id);
    if (message.flags[0] === "off") {
        db.ignoreLevelingsChannelID = undefined;
        await client.dbguilds.findOneAndUpdate({
            guildID: message.guild.id,
        }, {
            ignoreLevelingsChannelID: undefined
        });
    }

    let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
    if (!channel) channel = message.channel;
    db.ignoreLevelingsChannelID = channel.id;
    await client.dbguilds.findOneAndUpdate({
            guildID: message.guild.id,
        }, {
            ignoreLevelingsChannelID: channel.id
        })
        .catch(err => console.error(err));
    return message.channel.send({ embed: { color: "f3f3f3", description: `☑️ i will ignore levelings from ${channel} starting from now :(` } });


}

exports.help = {
    name: "levelingignore",
    description: "ignore levelings from a message channel",
    usage: ["levelingignore \`[#channel]\`", "levelingignore \`[channel id]\`"],
    example: ["levelingignore \`#spam\`", "levelingignore \`84487884448848\`"]
};

exports.conf = {
    aliases: ["ignorelevel", "iglevel"],
    cooldown: 5,
    guildOnly: true,
    userPerms: ["MANAGE_GUILD"],
    channelPerms: ["EMBED_LINKS"]
};