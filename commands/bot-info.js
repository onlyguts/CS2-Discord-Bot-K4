const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bot-info')
    .setDescription('CS2 Stats'),
  async execute(interaction) {
    const server = interaction.guild;
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('CS2 Stats')
      .setDescription('connect tirgo.ggwp.cc:26563')

    await interaction.reply({ embeds: [embed] });
  },
};