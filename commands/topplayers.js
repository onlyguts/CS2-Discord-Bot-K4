const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
const { EmbedBuilder } = require('discord.js');
const config = require('../config'); 

module.exports = {
  data: new SlashCommandBuilder()
    .setName('topplayers')
    .setDescription('Displays the top 10 players in k4ranks.'),
  async execute(interaction) {
    try {
      const connection = await mysql.createConnection(config.dbConfig);
      const query = 'SELECT * FROM `k4ranks` ORDER BY points DESC LIMIT 10';
      const [rows] = await connection.execute(query);

      if (rows.length === 0) {
        await interaction.reply({ content: "No players found in the database. 📉", ephemeral: false });
        await connection.end();
        return;
      }
      function formatName(name) {
        if (name.length > 10) {
            return name.substring(0, 10);
        } else {
            return name;
        }
      }

      let description = rows.map((row, index) => 
        `**#${index + 1} - ${formatName(row.name)}**\n**Points**: ${row.points}\n**Rank**: ${row.rank}\n`
      ).join('\n');

      const embed = new EmbedBuilder()
        .setTitle('🏆 **Top 10 Players in k4ranks** 🏆')
        .setDescription(description)
        .setColor('#0099ff')
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: false });
      await connection.end();
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: "An error occurred while fetching the top players. Please try again later. ❌", ephemeral: false });
    }
  }
};
