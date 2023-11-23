const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config')
const { Client, Enums } = require('fnbr')
const { FindCosmetic } = require('../../../class/Utils')

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('setready')
        .setDescription('Set the Ready Status of your BOT to true!'),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const { options, channel } = interaction;
        const res = new EmbedBuilder()
        .setColor('#4b16ff')
        .setDescription(`*${interaction.user} | Set your bot to \`\`ready\`\`*`);

        var bot = new Client;
        bot = config.bots[interaction.user.id];
        bot.party.me.setReadiness(true);
        interaction.reply({embeds: [res]})
    }
};