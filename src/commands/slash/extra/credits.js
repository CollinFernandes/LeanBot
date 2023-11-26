const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config')
const { Client, Enums } = require('fnbr')
const { FindCosmetic } = require('../../../class/Utils')
const axios = require('axios')

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('get info about the bot!'),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const { options, channel } = interaction;
        const res = new EmbedBuilder()
        res.setColor('#4b16ff')
        res.setDescription(`*${interaction.user} | info about the bot.

        \`LeanBot\` is a BOT developed by <@749233228996673536> and <@343695572961853441>.
        with this bot you can retrieve fortnite information or create lobby bot's without much effort! 
        to get info about the commands execute the command \`\`/help\`\`.*`)
        res.addFields(
            { name: "Libraries & API's", value: `\`\`discord.js v14, node.js v18, Fortnite-API.com, fnbr.js, axios, dotenv, fs\`\``}
        )
        interaction.reply({embeds: [res]})
    }
};