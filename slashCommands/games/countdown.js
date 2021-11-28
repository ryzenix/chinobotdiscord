const fetch = require('node-fetch');
const { SlashCommandBuilder } = require('@discordjs/builders');

class Game {
    constructor(interaction, client) {
        this.vowels = ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'U', 'U', 'U', 'U', 'U'];
        this.consenants = ['B', 'B', 'C', 'C', 'C', 'D', 'D', 'D', 'D', 'D', 'D', 'F', 'F', 'G', 'G', 'G', 'H', 'H', 'J', 'K', 'L', 'L', 'L', 'L', 'L', 'M', 'M', 'M', 'M', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'P', 'P', 'P', 'P', 'Q', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'V', 'W', 'X', 'Y', 'Z'];
        this.interaction = interaction;
        this.client = client;
        this.letters = '';
        this.text = '**countdown anagrams:** you must choose nine letters by pressing either the vowel or constenant button. i recomend at least 3 vowels. you will then have 30 seconds to find the largest word you can.\n**your letters:**';
    };

    async init() {
        this.msg = await this.interaction.channel.send(this.text);
        await this.msg.react('🇻');
        await this.msg.react('🇨');
        this.run();
    };

    async run() {
        const filter = (reaction, user) => ['🇻', '🇨'].includes(reaction.emoji.name) && user.id === this.interaction.user.id;
        const collected = await this.msg.awaitReactions({
            filter,
            max: 1,
            time: 60000
        });
        if (!collected.size) {
            this.msg.edit('this game has timed out lmao');
            return this.client.games.delete(this.interaction.channel.id);
        }
        const reaction = collected.first().emoji.name;
        if (reaction === '🇻') this.letters += this.vowels[Math.round(Math.random() * this.vowels.length | 0)];
        if (reaction === '🇨') this.letters += this.consenants[Math.round(Math.random() * this.consenants.length | 0)];
        this.msg.edit(`${this.text} ${this.letters}`);
        const userReactions = this.msg.reactions.cache
            .filter(e => e.users.cache.has(this.interaction.user.id));
        for (const e of userReactions.values()) {
            await e.users.remove(this.interaction.user.id);
        }
        if (this.letters.length === 9) {
            this.msg.reactions.removeAll();
            this.msg.edit(`${this.text} your 30 seconds starts now: ${this.letters}`);
            setTimeout(async() => {
                this.msg.edit(`${this.text} please enter the longest word you came up with.`);
                let responses = await this.interaction.channel.awaitMessages({
                    filter: m => m.author.id === this.interaction.user.id,
                    max: 1,
                    time: 30000
                });
                if (!responses.size) {
                    this.msg.edit('this game has timed out lmao');
                    return this.client.games.delete(this.interaction.channel.id);
                };
                const response = responses.first().content;
                await fetch(`http://www.anagramica.com/all/:${this.letters}`)
                    .then(res => res.json())
                    .then(json => { this.solved = json; })
                    .catch(err => {
                        this.interaction.channel.send('there was a problem while solving that anagram :(');
                        logger.log('error', err);
                    });
                if (this.solved.all.includes(response.toLowerCase())) { this.winMessage = `${response} is a valid and has ${response.letters} letters.`; } else {
                    this.winMessage = `${response} is not valid.`;
                };
                this.top = '';
                for (let i = 0; i <= 4; i++) {
                    if (i < 3) this.top += `${this.solved.all[i]}, `;
                    else if (i === 3) this.top += `${this.solved.all[i]} and `;
                    else this.top += this.solved.all[i];
                };
                this.client.games.delete(this.interaction.channel.id);
                this.msg.edit(`${this.text} ${this.letters}. your choice of ${this.winMessage} the top five solutions are ${this.top}. for a full list of solutions go to https://word.tips/words-for/${this.letters}/?dictionary=wwf`);
            }, 30000);
        } else {
            this.run();
        };
    };
};

exports.run = async(client, interaction) => {
    const current = client.games.get(interaction.channel.id);
    if (current) return interaction.reply({ content: current.prompt, ephemeral: true });
    client.games.set(interaction.channel.id, { prompt: `you should wait until **${interaction.user.username}** is finished first :(` });
    const game = new Game(interaction, client);
    interaction.reply({ content: 'beginning the Countdown game...', ephemeral: true });
    game.init();
};


exports.help = {
    name: "anagram",
    description: "play a countdown style anagram game",
    usage: ["anagram"],
    example: ["anagram"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description),
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["MANAGE_MESSAGES"]
};