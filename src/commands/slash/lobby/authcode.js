const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config')

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('getauth')
        .setDescription('Get the Auth for your BOT!'),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const { options, channel } = interaction;

        const res = new EmbedBuilder()
        .setColor('#4b16ff')
        .setImage("https://cdn.discordapp.com/attachments/890620618918215720/890620630670659624/unknown.png")
        .setTitle('Get your authorization code')
        .setDescription('Execute the Slash Command ``/createbot`` and Provide an **authorization code**, which you can obtain **[here](https://www.epicgames.com/id/login?redirectUrl=https%3A%2F%2Fwww.epicgames.com%2Fid%2Fapi%2Fredirect%3FclientId%3D3446cd72694c4a4485d81b77adbb2141%26responseType%3Dcode)**.\n\nTutorial:\n1. Log in with your alternative account, the one you want to use for the bot\n2. Copy what is shown in the image below\n3. Send the code here\n\n:warning: Make sure the account is an alternate account.\n\n\nSorry for any bugs. This bot is still in beta.');

        interaction.reply({embeds: [res]})
    }
};