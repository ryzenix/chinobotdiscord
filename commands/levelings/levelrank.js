const { Rank } = require('canvacord');
const { MessageAttachment } = require('discord.js');

exports.run = async(client, message, args, prefix) => {
    let mention = client.utils.parseMember(message, args[0]) || message.member;

    if (mention.user.id === client.user.id) return message.channel.send('that was me lmao');
    if (mention.user.bot) return message.channel.send({ embeds: [{ color: "#bee7f7", description: 'just to make this clear... bots can\'t level up :pensive:' }] })

    let target = await client.dbleveling.findOne({
        guildId: message.guild.id,
        userId: mention.user.id
    });

    if (!target) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `❌ you or that user doesn't have any leveling data yet!` }] });

    const res = client.leveling.getLevelBounds(target.level + 1);

    let neededXP = res.lowerBound;

    const result = await client.dbleveling.find({
        guildId: message.guild.id,
    }).sort({
        xp: -1
    });

    if (!result) return message.reply({ embeds: [{ color: "#bee7f7", description: `❌ this guild doesn't have any leveling data yet!\nto turn on the leveling system, do \`${prefix}leveling on\`!` }] });

    message.channel.sendTyping();
    let rank;
    for (let counter = 0; counter < result.length; ++counter) {
        let member = message.guild.members.cache.get(result[counter].userId);
        if (!member) {
            client.dbleveling.findOneAndDelete({
                userId: result[counter].userId,
                guildId: message.guild.id,
            }, (err) => {
                if (err) logger.log('error', err);
            });
        } else if (member.user.id === mention.user.id) {
            rank = counter + 1;
        };
    };
    const rankboard = new Rank()
        .renderEmojis(true)
        .setAvatar(mention.user.displayAvatarURL({ size: 1024, dynamic: false, format: 'png' }))
        .setCurrentXP(target.xp)
        .setRequiredXP(neededXP)
        .setStatus(mention.presence ? mention.presence.status || 'offline' : 'offline')
        .setLevel(target.level)
        .setRank(rank)
        .setDiscriminator(mention.user.discriminator)
        .setUsername(mention.user.username)
        .setProgressBar("#e6e6ff", "COLOR")
        .setBackground("IMAGE", 'https://i.ibb.co/yV1PRjr/shinjuku-tokyo-mimimal-4k-o8.jpg')

    rankboard.build().then(data => {
        return message.channel.send({
            content: `*behold, the rank card for* **${mention.user.username}**!`,
            files: [new MessageAttachment(data, 'rank.png')]
        })
    });
};

exports.help = {
    name: "levelrank",
    description: "show the current leveling rank of an user or yourself",
    usage: ["levelrank `[@member]`", "levelrank `[user ID]`"],
    example: ["levelrank `@bell`", "levelrank `661172574754545`"]
};

exports.conf = {
    aliases: ["rank", "level"],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["ATTACH_FILES", "EMBED_LINKS"]
};