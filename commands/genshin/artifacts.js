const { Colors, createTable, sendMessage, simplePaginator } = require('../../features/genshin/utils');
const { MessageEmbed } = require("discord.js");

exports.run = async (client, message, args, prefix) => {
    const { genshinData } = client;

    const sed = client.customEmojis.get("sed");
    const set = args.join(" ")
    if (!set) {
        const pages = getArtiSetsPages()
        if (pages.length == 0) return sendMessage(message, `no artifacts data was loaded! you should join my support server via \`${prefix}invite\` ${sed}`)

        await simplePaginator(message, (relativePage, currentPage, maxPages) => getArtiSets(pages, relativePage, currentPage, maxPages), pages.length)
        return undefined
    }

    const arti = genshinData.getArtifactByName(set)
    if (arti == undefined)
        return sendMessage(message, `i couldn't find that character, sorry ${sed}`)

    await simplePaginator(message, (relativePage, currentPage, maxPages) => getArti(arti, relativePage, currentPage, maxPages), 1 + arti.artis.length)
    return undefined

    function getArtiSetsPages() {
        const artis = Object.entries(genshinData.artifacts)
            .sort(([an, a],  [bn, b]) => Math.max(...b.levels) - Math.max(...a.levels) || Math.min(...a.levels) - Math.min(...b.levels) || an.localeCompare(bn))
            .map(([name, info]) => `**${name}**: ${Math.min(...info.levels)} :star: ~ ${Math.max(...info.levels)} :star:`)

        const pages = [];
        let paging = "", c = 0
        for (const arti of artis) {
            if (paging.length + arti.length > 1800 || ++c > 15) {
                pages.push(paging.trim())
                paging = arti
                c = 1
            } else
                paging += "\n" + arti
        }
        if (paging.trim().length > 0) pages.push(paging)
        return pages
    };
    function getArtiSets(pages, relativePage, currentPage, maxPages) {
        if (relativePage >= pages.length)
            return undefined

        const embed = new MessageEmbed()
            .setTitle("Artifact sets")
            .setDescription(pages[relativePage])
            .setFooter(`page ${currentPage} of ${maxPages}`)
            .setColor(Colors.GREEN)

        return embed
    };
    function getArti(set, relativePage, currentPage, maxPages) {
        const embed = new MessageEmbed()
            .setColor(Colors.AQUA)
            .setThumbnail(set.icon)
            .setFooter(`page ${currentPage} of ${maxPages}`)

        if (relativePage == 0) {
            for (const bonus of set.bonuses)
                embed.addField(`${bonus.count}-Set Bonus`, bonus.desc)

            embed.setTitle(`${set.name}: Set info`)
                .addField("Possible levels", set.levels.map(k => k + ":star:").join(", "))
                .setDescription(`This set contains ${set.artis.length} artifacts`)

            return embed
        }

        if (relativePage <= set.artis.length) {
            const arti = set.artis[relativePage - 1]
            const mainStats = genshinData.artifactMainStats[arti.type]
            const total = mainStats.map(m => m.weight).reduce((a, b) => a+b, 0)

            embed.setTitle(`${arti.name}`)
                .setDescription(arti.desc)
                .addField("Possible main stats", `\`\`\`
${createTable(
        ["Rate", "Stat"],
        mainStats.sort((a, b) => b.weight - a.weight).map(am => [`${(am.weight / total * 100).toFixed(1)}%`, am.name])
    )}
\`\`\``)
                .setThumbnail(arti.icon)

            return embed
        }
        return undefined
    }
}

exports.help = {
    name: "artifacts",
    description: "displays artifact set information. if no name is provided, a list of all sets will be displayed.",
    usage: ["artifacts \`[name]\`"],
    example: ["artifacts `Archaic Petra`"]
};

exports.conf = {
    aliases: ['artifact'],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"],
}