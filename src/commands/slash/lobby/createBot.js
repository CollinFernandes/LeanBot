const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ButtonStyle, ButtonBuilder, ComponentType, ActionRowBuilder, Embed, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config')
const { Client, Enums } = require('fnbr');
const { fstat } = require('fs');
const fs = require("fs");
let BotClient = null;
let BotAuth = null;

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('bot')
        .setDescription('manage your lean bot')
        .addSubcommand(subcommand =>
            subcommand.setName('create')
            .setDescription('Create your Lean Lobby Bot'))
        .addSubcommand(subcommand =>
            subcommand.setName('status')
            .setDescription('Check the status of your Lean Lobby Bot')),
                
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        var reply = null;
        const { options, channel } = interaction;
        var authCode = options.getString('authcode');
        if (authCode != undefined) 
        {
            if (authCode.includes('?code=')) {
                authCode = authCode.split('=')[1].split('"')[0];
            } else {
                authCode = authCode;
            }
            BotClient = new Client({
                "defaultStatus": "Lean Bot by FrostChanger.de",
                "platform": "WIN",
                "cachePresences": false,
                "auth": {
                    "authorizationCode": authCode,
                },
                "partyConfig": {
                    "privacy": Enums.PartyPrivacy.PRIVATE,
                    "joinConfirmation": false,
                    "joinability": "INVITE_AND_FORMER",
                    "maxSize": 16,
                    "chatEnabled": true
              },
                "debug": false
            })
        }
        const res = new EmbedBuilder()
        .setColor('#4b16ff')
        .setDescription(`${interaction.user} | Creating BOT...`);
        if (interaction.options.getSubcommand() === "create") 
        {
            if (fs.existsSync(`${process.cwd()}/temp/accounts/${interaction.user.id}.json`)) {
                const accountsRes = new EmbedBuilder()
                        .setColor('#4b16ff')
                        .setDescription(`*${interaction.user} | You already have some accounts stored!\nselect one if you want. if not click on the Button 'Add Another'.*`);
                
                var data = JSON.parse(fs.readFileSync(`${process.cwd()}/temp/accounts/${interaction.user.id}.json`))
                const components = new ActionRowBuilder()
                for(var account in data) {
                    const component = new ButtonBuilder()
                    .setCustomId(`${data[account].accountId}`)
                    .setLabel(`${account}`)
                    .setStyle(ButtonStyle.Success)

                    components.addComponents(component)
                }
                const newAcc = new ButtonBuilder()
                .setCustomId(`newaccount`)
                .setLabel(`Add Another`)
                .setStyle(ButtonStyle.Secondary)
                components.addComponents(newAcc)
                reply = await interaction.reply({embeds: [accountsRes], components: [components]})
                const collector = (await reply).createMessageComponentCollector({ componentType: ComponentType.Button });
            
                collector.on('collect', async (buttonInteraction) => {
                    if (buttonInteraction.customId === 'newaccount') {
                        const modal = new ModalBuilder()
                        .setCustomId('newaccountmodal')
                        .setTitle('new Account.');

                        const authCode = new TextInputBuilder()
                        .setCustomId('newaccountid')
                        .setLabel("your Auth Code.")
                        .setStyle(TextInputStyle.Short);

                        const authCodeBuilder = new ActionRowBuilder().addComponents(authCode);
                        modal.addComponents(authCodeBuilder);
                        const modalResponse = await buttonInteraction.showModal(modal);
                        
                    }
                })
            }
        }
        
        if (interaction.options.getSubcommand() === "status") {
            const res = new EmbedBuilder().setColor('#4b16ff');

            // Check if BotClient is defined and ready
            if (BotClient && BotClient.isReady) {
                const userStatus = BotClient.user ? `Logged in as ${BotClient.user.displayName}` : 'User not set';
                res.setDescription(`*Bot Status: Ready*\n${userStatus}`);
            } else {
                res.setDescription('*Bot Status: Not Ready*');
            }

            await interaction.reply({ embeds: [res], ephemeral: true });
        }
    }
};