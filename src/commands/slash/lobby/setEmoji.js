const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config')
const { Client, Enums } = require('fnbr')
const { FindCosmetic } = require('../../../class/Utils')

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('setemoji')
        .setDescription('Set the Emoji of your BOT!')
        .addStringOption(option => option.setName('emoji')
        .setDescription('Id or Name of the Emoji!')
        .setRequired(true)),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const { options, channel } = interaction;
        const skinId = options.getString('emoji')
        const skin = await FindCosmetic(config.cosmetics, skinId, "emoji")
        const res = new EmbedBuilder()
        .setColor('#4b16ff')
        .setDescription(`*${interaction.user} | Set emoji to \`\`${skinId}\`\`*`);
        if (!skin) {
            res.setDescription(`*Could not find a emoji named \`\`${skinId}\`\`*`)
            return interaction.reply({embeds: [res]});
        }

        var bot = new Client;
        bot = config.bots[interaction.user.id];
        bot.party.me.setEmoji(skin.id);
        interaction.reply({embeds: [res]})
    }
};