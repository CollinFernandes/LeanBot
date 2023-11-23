const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config')
const { Client, Enums } = require('fnbr')
const { FindCosmetic } = require('../../../class/Utils')

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('setplaying')
        .setDescription('Set the Playing Status of your BOT!')
        .addBooleanOption(option => 
            option.setName('isplaying')
            .setDescription('status whether the bot is in game')
            .setRequired(true))
        .addIntegerOption(option => 
            option.setName('playercount')
            .setDescription('set the player count of the lobby')
            .setRequired(true)),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const { options, channel } = interaction;
        const isPlaying = options.getBoolean('isplaying')
        const playerCount = options.getInteger('playercount')
        const res = new EmbedBuilder()
        .setColor('#4b16ff')
        .setDescription(`*${interaction.user} | Set playing status to \`\`${isPlaying}\`\`*`);

        var bot = new Client;
        bot = config.bots[interaction.user.id];
        bot.party.me.setPlaying(isPlaying, playerCount);
        interaction.reply({embeds: [res]})
    }
};