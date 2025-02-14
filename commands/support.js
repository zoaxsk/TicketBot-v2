const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('support')
        .setDescription('Come ottenere supporto per il bot'),
    async execute(interaction) {
        const supportServerLink = "https://discord.gg/A7JyBDFA";

        const embed = new EmbedBuilder()
            .setColor('#b300ff')
            .setTitle('Supporto Bot')
            .setDescription(`📩 **Per ricevere supporto, contatta in DM** \`zoaxsk155k\` **o l'owner del server.**\n🔗 **Puoi anche entrare nel nostro server di supporto:**\n[Entra nel server](${supportServerLink})`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};