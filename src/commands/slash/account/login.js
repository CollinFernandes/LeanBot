const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRow, ActionRowBuilder, ButtonStyle } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config')
const { Client, Enums } = require('fnbr')
const { FindCosmetic } = require('../../../class/Utils')
const axios = require('axios')

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('login')
        .setDescription('Login into your Epic Games Account!'),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const { options, channel } = interaction;
        const url = "https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token";
        const payload = 'grant_type=client_credentials';
        const headers = {
            'Authorization': 'Basic OThmN2U0MmMyZTNhNGY4NmE3NGViNDNmYmI0MWVkMzk6MGEyNDQ5YTItMDAxYS00NTFlLWFmZWMtM2U4MTI5MDFjNGQ3',
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        try {
            const response = await axios.post(url, payload, { headers });

            const deviceAuthResponse = await axios.post("https://account-public-service-prod03.ol.epicgames.com/account/api/oauth/deviceAuthorization", '{"prompt": "login"}', {
                headers: {
                    'Authorization': `bearer ${response.data.access_token}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const verificationUri = deviceAuthResponse.data.verification_uri_complete;

            const embed = new EmbedBuilder()
                .setTitle("📲 Log in to your Epic Games account")
                .setURL(verificationUri)
                .setColor(0x00aaff)
                .addFields({name: "Please Login Using The Info Below", value: "1. Visit the link above and click confirm.\n2. Click authorize below\n3. Yay you are logged in!", inline: true});

            const button = new ButtonBuilder()
                .setLabel("Authorize")
                .setStyle(ButtonStyle.Primary)
                .setCustomId('authorize_button');

            const row = new ActionRowBuilder()
                .addComponents(button);
            
            const message = await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

            const filter = i => i.customId === 'authorize_button' && i.user.id === interaction.user.id;

            const collector = message.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async (interaction) => {
                await interaction.deferUpdate();
                await ScuffedLoginLmao(deviceAuthResponse.data.device_code, interaction);
            });

            collector.on('end', () => {
                row.components[0].setDisabled(true);
                message.edit({ components: [row] });
            });
        } catch (error) {
            console.error(error);
        }
    }
};

async function ScuffedLoginLmao(devicecode, interaction) {
    let status = 0;

    if (status === 0) {
        try {
            const response = await axios.post("https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token", `grant_type=device_code&device_code=${devicecode}`, {
                headers: {
                    'Authorization': 'Basic OThmN2U0MmMyZTNhNGY4NmE3NGViNDNmYmI0MWVkMzk6MGEyNDQ5YTItMDAxYS00NTFlLWFmZWMtM2U4MTI5MDFjNGQ3',
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            if (response.status === 200) {
                const displayName = response.data.displayName;
                const embed = new EmbedBuilder()
                    .setTitle('Logged in As ' + displayName)
                    .setColor(0x64fffb);

                await interaction.followUp({embeds: [embed]});

                const DnName = interaction.user.displayName;
                const data = response.data;

                const exchangeResponse = await axios.get("https://account-public-service-prod.ol.epicgames.com/account/api/oauth/exchange", {
                    headers: {
                        'Authorization': `bearer ${response.data.access_token}`
                    }
                });

                const exchangeCode = exchangeResponse.data.code;

                const tkk = await axios.post("https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token", `grant_type=exchange_code&exchange_code=${exchangeCode}`, {
                    headers: {
                        'Authorization': 'basic MzQ0NmNkNzI2OTRjNGE0NDg1ZDgxYjc3YWRiYjIxNDE6OTIwOWQ0YTVlMjVhNDU3ZmI5YjA3NDg5ZDMxM2I0MWE=',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });

                const device = await axios.post(`https://account-public-service-prod.ol.epicgames.com/account/api/public/account/${tkk.data.account_id}/deviceAuth`, {}, {
                    headers: {
                        'content-type': 'application/json',
                        'Authorization': `bearer ${tkk.data.access_token}`
                    }
                });

                console.log('Device Auth Was Requested');
                const accountId = device.data.accountId;
                const secret = device.data.secret;
                const deviceId = device.data.deviceId;
                console.log(accountId, secret, deviceId);
                console.log('Device Auth Got! Requesting Token..');

                const tk = await axios.post("https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token", `grant_type=device_auth&account_id=${accountId}&device_id=${deviceId}&secret=${secret}`, {
                    headers: {
                        'Authorization': 'Basic MzQ0NmNkNzI2OTRjNGE0NDg1ZDgxYjc3YWRiYjIxNDE6OTIwOWQ0YTVlMjVhNDU3ZmI5YjA3NDg5ZDMxM2I0MWE=',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });

                console.log(tk.data);
                console.log("Device Token Was Got!");

                const userDict = {
                    [`${interaction.user.id}_DN`]: response.data.displayName,
                    [`${interaction.user.id}_id`]: response.data.account_id,
                    [`${interaction.user.id}_TOKEN`]: tk.data.access_token
                };

                const deviceDict = {
                    [`${interaction.user.id}_deviceID`]: deviceId,
                    [`${interaction.user.id}_AcountId`]: accountId,
                    [`${interaction.user.id}_Secret`]: secret
                };

                // Update device.json
                let dbd = require("../../../../temp/device.json");
                dbd = { ...dbd, ...deviceDict };
                await require('fs').promises.writeFile(`${process.cwd()}/temp/device.json`, JSON.stringify(dbd, null, 4));

                // Update users.json
                let db = require("../../../../temp/users.json");
                db = { ...db, ...userDict };
                await require('fs').promises.writeFile(`${process.cwd()}/temp/users.json`, JSON.stringify(db, null, 4));
            }
        } catch (error) {
            console.error(error);
        }
    }
}