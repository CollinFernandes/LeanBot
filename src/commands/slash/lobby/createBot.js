const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ButtonStyle, ButtonBuilder, ComponentType, ActionRowBuilder, Embed, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config')
const { Client, Enums } = require('fnbr');
const { fstat } = require('fs');
const fs = require('fs').promises;
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
            const filePath = `${process.cwd()}/temp/accounts/${interaction.user.id}.json`;
            try
            {
                let data = await fs.readFile(filePath, 'utf8'); 
                data = JSON.parse(data);

                const accountsRes = new EmbedBuilder()
                    .setColor('#4b16ff')
                    .setDescription(`*${interaction.user} | You already have some accounts stored! Select one if you want. If not, click on the Button 'Add Another'.*`);

                const components = new ActionRowBuilder();
                for (var account in data) {
                    const component = new ButtonBuilder()
                        .setCustomId(`${data[account].accountId}`)
                        .setLabel(`${account}`)
                        .setStyle(ButtonStyle.Success);

                    components.addComponents(component);
                }

                const newAcc = new ButtonBuilder()
                    .setCustomId(`newaccount`)
                    .setLabel(`Add Another`)
                    .setStyle(ButtonStyle.Secondary);

                components.addComponents(newAcc);

                reply = await interaction.reply({ embeds: [accountsRes], components: [components] });
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
            catch (error) {
                if (error.code === 'ENOENT') {
                    const modal = new ModalBuilder()
                        .setCustomId('newaccountmodal')
                        .setTitle('Enter Your Auth Code');
        
                    const authInput = new TextInputBuilder()
                        .setCustomId('authcodeinput')
                        .setLabel("Auth Code")
                        .setStyle(TextInputStyle.Short);
        
                    const actionRow = new ActionRowBuilder().addComponents(authInput);
                    modal.addComponents(actionRow);
        
                    await interaction.showModal(modal);
        
                    client.on('modalSubmit', async (modalInteraction) => {
                        if (modalInteraction.customId === 'newaccountmodal') {
                            const enteredAuthCode = modalInteraction.fields.getTextInputValue('authcodeinput');
                    
                            try {
                                BotClient = new Client({
                                    "defaultStatus": "Lean Bot by FrostChanger.de",
                                    "platform": "WIN",
                                    "cachePresences": false,
                                    "auth": {
                                        "authorizationCode": enteredAuthCode,
                                    },
                                    "partyConfig": {
                                        "privacy": Enums.PartyPrivacy.PRIVATE,
                                        "joinConfirmation": false,
                                        "joinability": "INVITE_AND_FORMER",
                                        "maxSize": 16,
                                        "chatEnabled": true
                                    },
                                    "debug": false
                                });
                    
                                await BotClient.login();
                    
                                BotClient.on('ready', async () => {
                                    BotClient.isReady = true;
                                    BotClient.user.displayName = BotClient.user.displayName;
                    
                                    const accountData = {
                                        [BotClient.user.displayName]: {
                                            "accountId": BotClient.user.displayName, 
                                            "deviceId": "exampleDeviceId",  
                                            "secret": "exampleSecret"
                                        }
                                    };
                                    await fs.writeFile(filePath, JSON.stringify(accountData, null, 2));
                    
                                    // Respond to the user
                                    const creationSuccess = new EmbedBuilder()
                                        .setColor('#4b16ff')
                                        .setDescription(`*Bot created successfully as ${BotClient.user.displayName}!*`);
                                    await modalInteraction.reply({ embeds: [creationSuccess] });
                                });
                    
                            } catch (err) {
                                console.error('Login failed:', err);
                                const failLogin = new EmbedBuilder()
                                    .setColor('#ffffff')
                                    .setTitle(`${config.emojis.wrong} You entered an invalid or expired authorization code. Support: https://discord.gg/frostchanger`);
                                await modalInteraction.reply({embeds: [failLogin]});
                            }
                        }
                    });
                } 
                else 
                {
                    console.error("Error reading or parsing the accounts file:", error);
                    await interaction.reply({ content: "An error occurred while processing your request. Please try again.", ephemeral: true });
                }
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