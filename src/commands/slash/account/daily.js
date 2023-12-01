const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRow, ActionRowBuilder, ButtonStyle } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config')
const { Client, Enums } = require('fnbr')
const { FindCosmetic } = require('../../../class/Utils')
const axios = require('axios')

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your Daily STW reward!'),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const { options, channel } = interaction;
        ClaimStwForUser(interaction, interaction.user.id)
        
    }
};

async function ClaimStwForUser(interaction, discordid) {
    await GetTokenFromDevice(String(discordid));

    const f = require('fs').promises;
    const usersJson = await f.readFile(`${process.cwd()}/temp/users.json`, "utf8");
    const t = JSON.parse(usersJson);

    if (t[`${discordid}_TOKEN`]) {
        const id = t[`${discordid}_id`];
        const tokenn = t[`${discordid}_TOKEN`];

        try {
            const response = await axios.post(`https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/game/v2/profile/${id}/client/ClaimLoginReward?profileId=campaign`, {}, {
                headers: {
                    'Authorization': `bearer ${tokenn}`,
                    'Content-Type': 'application/json'
                }
            });

            const user = interaction.user;

            if (response.status === 200) {
                console.log(response)
                const days = response.data.notifications[0].daysLoggedIn;
                const fer = require('../../../../temp/stwdata.json');
                const vvv = fer[days];

                const embed = new MessageEmbed()
                    .setTitle(`Claimed | Day ${days}!`)
                    .setDescription(`Claimed ${vvv}!`)
                    .setColor('BLUE')
                    .setFooter(footertext);

                await user.send({ embeds: [embed] });

                const dict = { [discordid]: '' };
                const dailyJson = await f.readFile(`${process.cwd()}/temp/daily.json`, 'utf8');
                const dailyT = JSON.parse(dailyJson);
                Object.assign(dailyT, dict);

                await f.writeFile(`${process.cwd()}/temp/daily.json`, JSON.stringify(dailyT, null, 4));
            } else {
                const embed = new MessageEmbed()
                    .setTitle('Failed')
                    .setDescription('Failed claiming')
                    .setColor('RED')
                    .setFooter(footertext);

                await user.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error(error);
        }
    }
}

async function GetTokenFromDevice(discordid) {
    const f = require('fs').promises;
    const deviceJson = await f.readFile(`${process.cwd()}/temp/device.json`, 'utf8');
    const r = JSON.parse(deviceJson);
    const id = r[`${discordid}_AcountId`];
    const did = r[`${discordid}_deviceID`];
    const sec = r[`${discordid}_Secret`];

    try {
        const response = await axios.post('https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token', `grant_type=device_auth&account_id=${id}&device_id=${did}&secret=${sec}`, {
            headers: {
                'Authorization': 'Basic MzQ0NmNkNzI2OTRjNGE0NDg1ZDgxYjc3YWRiYjIxNDE6OTIwOWQ0YTVlMjVhNDU3ZmI5YjA3NDg5ZDMxM2I0MWE=',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const g = require('fs').promises;
        const usersJson = await g.readFile(`${process.cwd()}/temp/users.json`, 'utf8');
        const v = JSON.parse(usersJson);
        v[`${discordid}_TOKEN`] = response.data.access_token;

        await g.writeFile(`${process.cwd()}/temp/users.json`, JSON.stringify(v, null, 4));
    } catch (error) {
        console.error(error);
    }
}