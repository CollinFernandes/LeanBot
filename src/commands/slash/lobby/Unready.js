const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config')
const { Client, Enums } = require('fnbr')
const { FindCosmeticByType } = require('../../../class/Utils')

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('setunready')
        .setDescription('Set the Ready Status of your BOT to false!'),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const { options, channel } = interaction;
        const res = new EmbedBuilder()
        .setColor('#4b16ff')
        .setDescription(`*${interaction.user} | Set your bot to \`\`unready\`\`*`);

        var bot = new Client;
        bot = config.bots[interaction.user.id];
        bot.party.me.setReadiness(false);
        interaction.reply({embeds: [res]})
    }
};