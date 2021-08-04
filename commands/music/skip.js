const { canModifyQueue } = require("../../util/musicutil");
const { reactIfAble } = require("../../util/util");
const { MessageCollector } = require('discord.js');

exports.run = async(client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send({ embed: { color: "f3f3f3", description: `:x: there isn't any ongoing music queue` } });
    if (!canModifyQueue(message.member)) return message.channel.send({ embed: { color: "f3f3f3", description: `you have to be in ${queue.channel} to do this command :(` } });
    const playerListening = queue.channel.members.flatMap(members => members);
    let listening = playerListening.filter(x => !x.user.bot).size;
    if (listening >= 2 && queue.songs[0].requestedby.id !== message.author.id) {
        let leftMembers = listening - 1;
        let vote = 0;
        let voted = [];
        await message.channel.send(`there are **${leftMembers}** people listening as well! to skip, type \`skip\` ⏭`);
        const collector = new MessageCollector(message.channel, msg => {
            if (msg.content.toLowerCase() === 'skip' && msg.author.id !== message.author.id && !msg.author.bot && !voted.includes(msg.author.id)) return true;
        }, { time: 15000 });
        collector.on('collect', async msg => {
            voted.push(msg.author.id);
            vote = vote + 1;
            if (vote === leftMembers) {
                collector.stop();
                return skip(queue, message, client);
            }
            message.channel.send(`**${vote}** member voted to skip the current song ⏭ only **${leftMembers - vote}** member left!`)
        });
        collector.on('end', async() => {
            if (vote !== leftMembers) return message.channel.send(`not enough people to skip song!`);
        });
    } else {
        return skip(queue, message, client);
    }
}
async function skip(queue, message, client) {
    queue.playing = true;
    queue.player.stop();
    return reactIfAble(message, client.user, '👌')
}
exports.help = {
    name: "skip",
    description: "skip the currently playing song",
    usage: "skip",
    example: "skip"
}

exports.conf = {
    aliases: ["s"],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}
