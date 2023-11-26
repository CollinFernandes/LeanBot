const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRow, ActionRowBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config')
const { Client, Enums } = require('fnbr')
const { FindCosmetic } = require('../../../class/Utils')
const axios = require('axios')

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('help')
        .setDescription('get information about all commands!'),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const { options, channel } = interaction;
        const res = new EmbedBuilder()
        res.setColor('#4b16ff')
        res.setDescription(`*${interaction.user} | select a category from the menu below.*`)

        const menu = new StringSelectMenuBuilder()
        .setCustomId('helpmenu')
        .setPlaceholder('make a selection!')
        .addOptions(
            new StringSelectMenuOptionBuilder()
            .setLabel('Lobby Bot')
            .setDescription('get all lobby bot commands!')
            .setValue('lobbybothelp'),
            new StringSelectMenuOptionBuilder()
            .setLabel('Utils')
            .setDescription('get all util commands!')
            .setValue('utilshelp'),
            new StringSelectMenuOptionBuilder()
            .setLabel('Extra')
            .setDescription('get all extra commands!')
            .setValue('extrahelp')
        )

        const row = new ActionRowBuilder()
        .addComponents(menu);
        interaction.reply({embeds: [res], components: [row]})
    }
};