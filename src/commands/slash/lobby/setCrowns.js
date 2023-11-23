const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config')
const { Client, Enums } = require('fnbr')
const { FindCosmetic } = require('../../../class/Utils')

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('setcrowns')
        .setDescription('Set the Crowns of your BOT!')
        .addIntegerOption(option => option.setName('crowns')
        .setDescription('Id or Name of the Crowns!')
        .setRequired(true)),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const { options, channel } = interaction;
        const skinId = options.getString('crowns')
        const res = new EmbedBuilder()
        .setColor('#4b16ff')
        .setDescription(`*${interaction.user} | Set crowns to \`\`${skinId}\`\`*`);

        var bot = new Client;
        bot = config.bots[interaction.user.id];
        bot.party.me.setCrowns(skinId);
        interaction.reply({embeds: [res]})
    }
};