const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
const { EmbedBuilder } = require('discord.js');
const config = require('../config'); 


module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('[ADMIN] Displays the statistics of a specified player based on their Steam ID.')
    .addStringOption(option =>
      option.setName('steam_id')
        .setDescription('The Steam ID of the player to display statistics for.')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.roles.cache.has(config.requiredRoleId)) {
        await interaction.reply({ content: "⛔ You do not have permission to use this command.", ephemeral: true });
        return;
      }
    const steamId = interaction.options.getString('steam_id');

    try {
        const connection = await mysql.createConnection(config.dbConfig);

     
      const statsQuery = 'SELECT name as namesteam, kills, assists, deaths, headshots, steam_id FROM k4stats WHERE steam_id = ?';
      const [statsRows] = await connection.execute(statsQuery, [steamId]);

      if (statsRows.length === 0) {
        await interaction.reply({ content: "No statistics found for the provided Steam ID.", ephemeral: false });
        await connection.end();
        return;
      }

      const playerStats = statsRows[0];

      function formatName(name) {
        if (name.length > 10) {
            return name.substring(0, 10);
        } else {
            return name;
        }
      }
      let description = `👤 **Name:** ${formatName(playerStats.namesteam)}\n` +
                        `💀 **Kills / Assists / Death :** ${playerStats.kills} | ${playerStats.assists} | ${playerStats.deaths}\n` +
                        `🔥 **K/D Ratio:** ${(playerStats.kills / playerStats.deaths).toFixed(2)}\n` +
                        `🤯 **Headshots:** ${playerStats.headshots}\n` +
                        `🎯 **HS %:** ${(playerStats.headshots / playerStats.kills * 100).toFixed(2)}%\n`;

      const embed = new EmbedBuilder()
        .setTitle('📊 **Player Statistics** 📊')
        .setDescription(description)
        .setColor('#0099ff')
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: false });
      await connection.end();
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: "An error occurred while fetching the statistics. Please try again later.", ephemeral: false });
    }
  }
};
