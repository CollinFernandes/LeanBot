const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config')
const { Client, Enums } = require('fnbr')
const { FindCosmetic } = require('../../../class/Utils')

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('setsitin')
        .setDescription('Set the Sitting Out Status of your BOT to false!'),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const { options, channel } = interaction;
        const res = new EmbedBuilder()
        .setColor('#4b16ff')
        .setDescription(`*${interaction.user} | Set your bot to sit \`\`in\`\`*`);

        var bot = new Client;
        bot = config.bots[interaction.user.id];
        bot.party.me.setSittingOut(false);
        interaction.reply({embeds: [res]})
    }
};