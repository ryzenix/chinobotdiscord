const { canModifyQueue } = require("../../util/musicutil");

exports.run = async(client, message, args, prefix) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }] });
    if (queue.pending) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }] });
    if (!canModifyQueue(message.member)) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }] });

    let cooldownStorage = await client.cooldowns.findOne({
        userId: message.author.id,
        guildId: message.guild.id
    });
    if (!cooldownStorage) {
        const model = client.cooldowns;
        cooldownStorage = new model({
            userId: message.author.id,
            guildId: message.guild.id
        });
    };
    let expire = cooldownStorage.ticketExpire;
    if (!expire || expire < Date.now()) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `your 🎫 **Effect Ticket** was expired, or you don't have one! obtain one with \`${prefix}ticket\`!` }] });


    const body = {
        rotation: { rotationHz: 0.2 }
    }
    queue.player.node.send({
        op: 'filters',
        guildId: queue.guildId,
        ...body,
    });
    const sayoriEmoji = client.customEmojis.get("sayori");
    message.channel.send({ embeds: [{ color: "#bee7f7", description: `applied 8D effect to the current queue! ${sayoriEmoji}` }], content: `to reset all effect, use \`${prefix}reset\`` })
    if (queue.textChannel.id !== message.channel.id && !queue.textChannel.deleted) queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${message.author} applied 8D effect to the current queue! ${sayoriEmoji}` }], content: `to reset all effect, use \`${prefix}reset\`` });
    if (queue.textChannel.deleted) queue.textChannel = message.channel;
};
exports.help = {
    name: "8d",
    description: "generate 8d effect for the current music queue",
    usage: ["8d"],
    example: ["8d"]
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};