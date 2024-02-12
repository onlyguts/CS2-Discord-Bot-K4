const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bot-info')
    .setDescription('Information Bot discord'),
  async execute(interaction) {
    const server = interaction.guild;
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('CS2 DISCORD BOT K4')
      .setDescription('__Version :__ 1.0.0 \n__Github repo :__ https://github.com/onlyguts/CS2-Discord-Bot-K4\n__K4-System :__ https://github.com/K4ryuu/K4-System')

    await interaction.reply({ embeds: [embed] });
  },
};