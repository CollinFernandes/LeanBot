const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config')
const { Client, Enums } = require('fnbr')
const { FindCosmeticByType } = require('../../../class/Utils')

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('setlevel')
        .setDescription('Set the Level of your BOT!')
        .addIntegerOption(option => option.setName('level')
        .setDescription('Level you want to Set!')
        .setRequired(true)),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const { options, channel } = interaction;
        const level = options.getInteger('level')
        const res = new EmbedBuilder()
        .setColor('#4b16ff')
        .setDescription(`*${interaction.user} | Set level to \`\`${level}\`\`*`);

        var bot = new Client;
        bot = config.bots[interaction.user.id];
        bot.party.me.setLevel(level);
        interaction.reply({embeds: [res]})
    }
};