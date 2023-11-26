const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config')
const { Client, Enums } = require('fnbr')
const { FindCosmetic } = require('../../../class/Utils')
const axios = require('axios')

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('get stats of a player via API!')
        .addStringOption(option => option.setName('username')
            .setDescription('name of the user you want the stats from.')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('platform')
                .setDescription('stats from the selected input.')
                .setRequired(true)
                .addChoices(
                    { name: 'All', value: 'all' },
                    { name: 'Keyboard & Mouse', value: 'keyboardMouse' },
                    { name: 'Gamepad', value: 'gamepad' },
                    { name: 'Touch', value: 'touch' },
                )),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const { options, channel } = interaction;
        const getStats = async (username, platform) => {
            try {
                const cosmetic = await axios({
                    url: `https://fortnite-api.com/v2/stats/br/v2?name=${username}&image=${platform}`,
                    headers: { Authorization: "ea1e2e92-3bef-4c2c-97d4-201e6f62e62f" },
                  });
              return cosmetic.data;
            } catch (err) {
              console.log(err)  
              return undefined;
            }
        };
        const username = options.getString('username')
        const platform = options.getString('platform')
        const stats = await getStats(username, platform);
        const res = new EmbedBuilder()
        res.setColor('#4b16ff')
        res.setDescription(`*${interaction.user} | The user \`\`${username}\`\` doesnt exist or has his profile private.*`)
        if(!stats)
            return interaction.reply({embeds: [res]});
        
        res.setColor('#4b16ff')
        res.setDescription(`*${interaction.user} | stats of the player \`\`${username}\`\` on \`\`${platform}\`\`*`)
        res.setImage(stats.data.image);
        interaction.reply({embeds: [res]})
    }
};