const Discord = require("discord.js")
const random = require("something-random-on-discord").Random;
const slapSchema = require('../../model/slap')


exports.run = async (client, message, args) => {
    let data = await random.getAnimeImgURL("slap")


    const member = await getMemberfromMention(args[0], message.guild);

    if (!member) {
      const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:'
      return message.inlineReply(`you can't just slap at the air ${sedEmoji} please mention somebody to slap pls`)
    };

    const target = member.user;

    if (target.id === client.user.id) return message.inlineReply('what did you say?');
    if (target.bot) return message.inlineReply("you can't slap that bot, sorry :(")

    const { guild } = message
    const guildId = guild.id
    const targetId = target.id
    const authorId = message.author.id
    const now = new Date()

    if (targetId === message.author.id) {
      message.inlineReply('are you in pain?')
      return
    }
    const result = await slapSchema.findOneAndUpdate(
      {
        userId: targetId,
        guildId,
      },
      {
        userId: targetId,
        guildId,
        $inc: {
          received: 1,
        },
      },
      {
        upsert: true,
        new: true,
      }
    )

    const amount = result.received

    const embed = new Discord.MessageEmbed() 
    .setColor("RANDOM") 
    .setAuthor(`${message.author.username} slap ${target.username} They now have been slapped ${amount} time(s)`, message.author.displayAvatarURL()) 
    .setImage(data)

    message.channel.send(embed)
}
exports.help = {
    name: "slap",
    description: "slap someone with your best",
    usage: "slap `<@mention>`",
    example: "slap `@bell`"
};

exports.conf = {
    aliases: [],
    cooldown: 4,
    guildOnly: true,
    userPerms: [],
    clientPerms: ["EMBED_LINKS", "SEND_MESSAGES"]
}