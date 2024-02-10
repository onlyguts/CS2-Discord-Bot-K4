const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');
const mysql = require('mysql2/promise');
const config = require('../config'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checkcheater')
        .setDescription('[ADMIN] Detects suspicious players based on advanced game statistics.'),
    async execute(interaction) {
        if (!interaction.member.roles.cache.some(role => role.id === config.requiredRoleId)) {
            await interaction.reply({
                content: "⛔ You do not have permission to use this command.",
                ephemeral: true
            });
            return;
        }
        const players = await getPlayersStats();
        if (players.length === 0) {
            await interaction.reply({
                content: "No suspicious players found.",
                ephemeral: false
            });
            return;
        }
        await interaction.reply({
            content: `🔍 **Suspicious players detected:** ${players.length}`,
            ephemeral: false
        });

        function formatName(name) {
            if (name.length > 10) {
                return name.substring(0, 10);
            } else {
                return name;
            }
          }
        players.forEach(async (player) => { 
            const playerEmbed = new EmbedBuilder()
                .setColor('#FF5555')
                .setTitle(`🚨 **Suspect Name:** ${formatName(player.name)}`)
                .setDescription(` `)
                .addFields(
                    {
                        name: '💀 **Total Kills**',
                        value: `${player.kills}`,
                        inline: true
                    }, {
                        name: '🤝 **Assists**',
                        value: `${player.assists}`,
                        inline: true
                    }, {
                        name: '☠️ **Total Deaths**',
                        value: `${player.deaths}`,
                        inline: true
                    },
                    {
                        name: '🔫 **Accuracy %**',
                        value: `${player.accuracy_percent}%`,
                        inline: true
                    }, {
                        name: '🎯 **Headshots %**',
                        value: `${player.hs_percent}%`,
                        inline: true
                    }, {
                        name: '🔥 **K/D Ratio**',
                        value: `${player.kd_ratio}`,
                        inline: true
                    },
                    {
                        name: '🔪 **Hits Given**',
                        value: `${player.hits_given}`,
                        inline: true
                    }, {
                        name: '🎯 **Headshots**',
                        value: `${player.headshots}`,
                        inline: true
                    }, {
                        name: '⚔️ **Total Shoots**',
                        value: `${player.shoots}`,
                        inline: true
                    },
                    {
                        name: '💡 **Cheat Probability**',
                        value: `${player.cheatProbability}%`,
                        inline: true
                    }, {
                        name: '👤 **Steam ID**',
                        value: `${player.steam_id}`,
                        inline: true
                    }
                )
                .setFooter({
                    text: `Last Seen: ${player.lastseen}`
                });

            await interaction.followUp({
                embeds: [playerEmbed],
                ephemeral: false
            });
        });
    }
};

async function getPlayersStats() {
    const connection = await mysql.createConnection(config.dbConfig);
    const query = `SELECT steam_id, name, lastseen, kills, deaths, ROUND((kills / deaths), 2) as kd_ratio, assists, headshots, shoots, hits_given, ROUND((headshots / kills * 100), 0) AS hs_percent, ROUND((hits_given / shoots * 100), 0) AS accuracy_percent FROM k4stats 
    WHERE kills > 30 AND (headshots / kills * 100) > 75 AND (kills / deaths) > 1.5 AND (hits_given / shoots * 100) > 15
    ORDER BY (headshots / kills * 100) DESC, (hits_given / shoots * 100) DESC, (kills / deaths) DESC
    LIMIT 50;`;
    try {
        const [players] = await connection.execute(query);
        await connection.end();
        return players.map(player => ({
            ...player,
            cheatProbability: calculateCheatProbability(player)
        }));
    } catch (error) {
        console.error('Failed to fetch player data:', error);
        return [];
    }
}
function calculateCheatProbability(player) {
    let hsProbability = 0;
    let kdProbability = 0;
    let accuracyProbability = 0;

    if (player.hs_percent >= 100) {
        hsProbability = 100; 
    } else if (player.hs_percent >= 90) {
        hsProbability = 90; 
    } else if (player.hs_percent >= 75) {
        hsProbability = 50; 
    } else if (player.hs_percent > 50) {
        hsProbability = (player.hs_percent - 30) * 2; 
    }

    if (player.accuracy_percent >= 100) {
        accuracyProbability = 100; 
    } else if (player.accuracy_percent > 50) {
        accuracyProbability = 90 + (player.accuracy_percent - 50) * 0.8; 
    } else if (player.accuracy_percent > 20) {
        accuracyProbability = 40 + (player.accuracy_percent - 50) * 0.8; 
    }

    let finalProbability = Math.max(hsProbability, kdProbability, accuracyProbability);
    return Math.min(finalProbability, 100);
}

