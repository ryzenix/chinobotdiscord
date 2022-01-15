const { MessageEmbed } = require("discord.js")
const request = require('node-superfetch');

exports.run = async(client, interaction) => {
    const member = interaction.options.getMember('target');
    const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:';
    const deadEmoji = client.customEmojis.get('dead') ? client.customEmojis.get('dead') : ':pensive:'


    const target = member.user;

    if (target.id === client.user.id) return interaction.reply("you don't know how bad it will be, do you?")
    if (target.bot) return interaction.reply(`you can't tickle that bot, sorry ${sedEmoji}`)
    const targetId = target.id
    const authorId = interaction.user.id

    if (targetId === authorId) {
        interaction.reply(`have you lost your mind ${deadEmoji}`)
        return
    };
    await interaction.deferReply();
    const { body } = await request.get('https://nekos.best/api/v1/tickle');
    const embed = new MessageEmbed()
        .setColor("#7DBBEB")
        .setAuthor({name: `${interaction.user.username} tickled ${target.username}!`, iconURL: interaction.user.displayAvatarURL()})
        .setImage(body.url)
    return interaction.editReply({ embeds: [embed] })
};