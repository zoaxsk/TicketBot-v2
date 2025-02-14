const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { ticketsCollection, serverConfigCollection } = require('../../mongodb');
const cmdIcons = require('../../UI/icons/commandicons');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setticketchannel')
        .setDescription('Set or view the ticket channel configuration for this server')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
        
        // Subcommand: Set ticket channel
        .addSubcommand(sub =>
            sub.setName('set')
                .setDescription('Set the ticket channel for the server')
                .addStringOption(option =>
                    option.setName('channelid')
                        .setDescription('The ID of the ticket channel')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('adminroleid')
                        .setDescription('The ID of the admin role for tickets')
                        .setRequired(true))
                .addBooleanOption(option =>
                    option.setName('status')
                        .setDescription('Enable or disable the ticket system')
                        .setRequired(true))
        )
        
        // Subcommand: View ticket channel configuration
        .addSubcommand(sub =>
            sub.setName('view')
                .setDescription('View the current ticket channel setup')
        ),

    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const subcommand = interaction.options.getSubcommand();
        const guild = interaction.guild;
        const serverId = guild.id;

        try {
            const configManagerData = await serverConfigCollection.findOne({ serverId });
            const botManagers = configManagerData ? configManagerData.botManagers || [] : [];

            if (!botManagers.includes(interaction.user.id) && interaction.user.id !== guild.ownerId) {
                return interaction.reply({ 
                    content: '❌ Only the **server owner** or **bot managers** can use this command.', 
                    ephemeral: true 
                });
            }

            if (subcommand === 'set') {
                const channelId = interaction.options.getString('channelid');
                const adminRoleId = interaction.options.getString('adminroleid');
                const status = interaction.options.getBoolean('status');

                await ticketsCollection.updateOne(
                    { serverId },
                    { $set: { serverId, ticketChannelId: channelId, adminRoleId, status, ownerId: guild.ownerId } },
                    { upsert: true }
                );

                return interaction.reply({ content: `✅ Ticket system updated successfully!`, ephemeral: true });

            } else if (subcommand === 'view') {
                const configData = await ticketsCollection.findOne({ serverId });

                if (!configData) {
                    return interaction.reply({ content: '❌ No ticket system configuration found for this server.', ephemeral: true });
                }

                const embed = new EmbedBuilder()
                    .setColor('#3498db')
                    .setTitle('Ticket System Configuration')
                    .setDescription(`
                        **Ticket Channel ID:** ${configData.ticketChannelId}
                        **Admin Role ID:** ${configData.adminRoleId}
                        **Status:** ${configData.status ? '✅ Enabled' : '❌ Disabled'}
                    `)
                    .setTimestamp();

                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
        } catch (error) {
            console.error('Error handling /setticketchannel command:', error);
            return interaction.reply({ content: '❌ An error occurred while processing your request.', ephemeral: true });
        }
    }
};