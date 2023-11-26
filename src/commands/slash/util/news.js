const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config')
const { Client, Enums } = require('fnbr')
const { FindCosmetic } = require('../../../class/Utils')
const axios = require('axios')

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('news')
        .setDescription('get current News via API!')
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Mode you want the News from.')
                .setRequired(true)
                .addChoices(
                    { name: 'Save The World', value: 'stw' },
                    { name: 'Battle Royale', value: 'br' },
                )),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const { options, channel } = interaction;
        const getNews = async (mode) => {
            try {
              const { data: cosmetic } = (await axios(`https://fortnite-api.com/v2/news/${mode}`)).data;
              return cosmetic;
            } catch (err) {
              return undefined;
            }
        };
        const mode = options.getString('mode')
        const news = await getNews(mode);
        const res = new EmbedBuilder()
        if (news.image == null) {
            res.setColor('#4b16ff')
            res.setDescription(`*${interaction.user} | There aren't any news right now.*`)
        } else {
            res.setColor('#4b16ff')
            res.setDescription(`*${interaction.user} | Current ${mode} news.*`)
            res.setImage(news.image);
        }
        interaction.reply({embeds: [res]})
    }
};