const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
const { EmbedBuilder } = require('discord.js');
const config = require('../config'); 

module.exports = {
  data: new SlashCommandBuilder()
    .setName('myrank')
    .setDescription('Displays your rank and points.'),
  async execute(interaction, client) {
    const userId = interaction.user.id; 
    try {
      const connection = await mysql.createConnection(config.dbConfig);
      const query = 'SELECT steam_id FROM user_discord WHERE discord_id = ?';
      const [rows] = await connection.execute(query, [userId]);

      if (rows.length === 0) {
        await interaction.reply({ content: "Your Steam ID is not found in the database. 🕵️‍♂️", ephemeral: true });
        await connection.end();
        return;
      }

      const steamId = rows[0].steam_id;
      const rankQuery = 'SELECT * FROM k4ranks WHERE steam_id = ?';
      const [rankRows] = await connection.execute(rankQuery, [steamId]);

      if (rankRows.length === 0) {
        await interaction.reply({ content: "No rank found for your Steam ID. 📉", ephemeral: true });
        await connection.end();
        return;
      }

      const userRank = rankRows[0];

      const description = `**🏆 Rank:** ${userRank.rank}\n**🧮 Points:** ${userRank.points}`;
      const embed = new EmbedBuilder()
        .setTitle('Your Rank and Points')
        .setDescription(description)
        .setColor('#0099ff')
        .setTimestamp();
      await interaction.reply({ embeds: [embed], ephemeral: false });
      await connection.end();
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: "An error occurred while fetching your rank and points. Please try again later.", ephemeral: true });
    }
  }
};
