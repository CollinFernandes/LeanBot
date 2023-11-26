const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config')
const { Client, Enums } = require('fnbr')
const { FindCosmetic } = require('../../../class/Utils')
const axios = require('axios')

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('aes')
        .setDescription('get current AES Keys via API!'),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const { options, channel } = interaction;
        const getAES = async () => {
            try {
              const { data: cosmetic } = (await axios(`https://fortnite-api.com/v2/aes`)).data;
              return cosmetic;
            } catch (err) {
              return undefined;
            }
        };
        const aes = await getAES();
        const res = new EmbedBuilder()
        .setColor('#4b16ff')
        .setDescription(`*${interaction.user} | Current AES Keys*`);
        res.addFields(
            { name: "Build", value: `\`\`\`${aes.build}\`\`\`` },
            { name: "Main Key", value: `\`\`\`0x${aes.mainKey}\`\`\`` })

        aes.dynamicKeys.forEach(pak => {
            res.addFields({
                name: pak.pakFilename, value: `\`\`\`0x${pak.key}\`\`\``
            })
        });
        interaction.reply({embeds: [res]})
    }
};