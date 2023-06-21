const Discord = require("discord.js");

/*
Copyright 2023 Sayrix (github.com/Sayrix)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

module.exports = {
	/**
	 * @param {Discord.Interaction} interaction
	 * @param {Discord.Client} client
	 * @param {Object} ticketType
	 * @param {Object|string} reasons
	 */
	async createTicket(interaction, client, ticketType, reasons) {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async function (resolve, reject) {
			await interaction.deferReply({ ephemeral: true }).catch((e) => console.log(e));

			let reason = [];
			let allReasons;
			if (typeof reasons === "object") {
				reasons.forEach(async (r) => {
					reason.push(r.value);
				});

				allReasons = reason.map((r, i) => `Question ${i + 1}: ${r}`).join(", ");
			}
			let ticketName = new String();

			if (ticketType.ticketNameOption) {
				ticketName = ticketType.ticketNameOption
					.replace("USERNAME", interaction.user.username)
					.replace("USERID", interaction.user.id)
					.replace("TICKETCOUNT", (await client.db.get("temp.ticketCount")) || 0);
			} else {
				ticketName = client.config.ticketNameOption
					.replace("USERNAME", interaction.user.username)
					.replace("USERID", interaction.user.id)
					.replace("TICKETCOUNT", (await client.db.get("temp.ticketCount")) || 0);
			}

			const channel = await client.guilds.cache.get(client.config.guildId).channels.create({
				name: ticketName,
				parent: ticketType.categoryId,
				permissionOverwrites: [
					{
						id: interaction.guild.roles.everyone,
						deny: [Discord.PermissionFlagsBits.ViewChannel],
					},
				],
			});

			if (!channel) return reject("Couldn't create the ticket channel.");

			client.log(
				"ticketCreate",
				{
					user: {
						tag: interaction.user.tag,
						id: interaction.user.id,
						avatarURL: interaction.user.displayAvatarURL(),
					},
					reason: allReasons,
					ticketChannelId: channel.id,
				},
				client
			);

			await client.db.add("temp.ticketCount", 1);
			const ticketId = await client.db.get("temp.ticketCount");
			await client.db.set(`tickets_${channel.id}`, {
				id: ticketId - 1,
				category: ticketType,
				reason: allReasons,
				creator: interaction.user.id,
				invited: [],
				createdAt: Date.now(),
				claimed: false,
				claimedBy: null,
				claimedAt: null,
				closed: false,
				closedBy: null,
				closedAt: null,
			});

			channel.permissionOverwrites
				.edit(interaction.user, {
					SendMessages: true,
					AddReactions: true,
					ReadMessageHistory: true,
					AttachFiles: true,
					ViewChannel: true,
				})
				.catch((e) => console.log(e));

			if (client.config.rolesWhoHaveAccessToTheTickets.length > 0) {
				client.config.rolesWhoHaveAccessToTheTickets.forEach(async (role) => {
					channel.permissionOverwrites
						.edit(role, {
							SendMessages: true,
							AddReactions: true,
							ReadMessageHistory: true,
							AttachFiles: true,
							ViewChannel: true,
						})
						.catch((e) => console.log(e));
				});
			}

			const ticketOpenedEmbed = new Discord.EmbedBuilder()
				.setColor(ticketType.color ? ticketType.color : client.config.mainColor)
				.setTitle(client.embeds.ticketOpened.title.replace("CATEGORYNAME", ticketType.name))
				.setDescription(
					ticketType.customDescription
						? ticketType.customDescription
							.replace("CATEGORYNAME", ticketType.name)
							.replace("USERNAME", interaction.user.username)
							.replace("USERID", interaction.user.id)
							.replace("TICKETCOUNT", (await client.db.get("temp.ticketCount")) || 0)
							.replace("REASON1", reason[0])
							.replace("REASON2", reason[1])
							.replace("REASON3", reason[2])
							.replace("REASON4", reason[3])
							.replace("REASON5", reason[4])
							.replace("REASON6", reason[5])
							.replace("REASON7", reason[6])
							.replace("REASON8", reason[7])
							.replace("REASON9", reason[8])
						: client.embeds.ticketOpened.description
							.replace("CATEGORYNAME", ticketType.name)
							.replace("USERNAME", interaction.user.username)
							.replace("USERID", interaction.user.id)
							.replace("TICKETCOUNT", (await client.db.get("temp.ticketCount")) || 0)
							.replace("REASON1", reason[0])
							.replace("REASON2", reason[1])
							.replace("REASON3", reason[2])
							.replace("REASON4", reason[3])
							.replace("REASON5", reason[4])
							.replace("REASON6", reason[5])
							.replace("REASON7", reason[6])
							.replace("REASON8", reason[7])
							.replace("REASON9", reason[8])
				)
				/*
				Copyright 2023 Sayrix (github.com/Sayrix)

				Licensed under the Apache License, Version 2.0 (the "License");
				you may not use this file except in compliance with the License.
				You may obtain a copy of the License at

				    http://www.apache.org/licenses/LICENSE-2.0

				Unless required by applicable law or agreed to in writing, software
				distributed under the License is distributed on an "AS IS" BASIS,
				WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
				See the License for the specific language governing permissions and
				limitations under the License.
				*/
				.setFooter({
					// Please respect the project by keeping the credits, (if it is too disturbing you can credit me in the "about me" of the bot discord)
					text: "ticket.pm" + client.embeds.ticketOpened.footer.text.replace("ticket.pm", ""), // Please respect the LICENSE :D
					// Please respect the project by keeping the credits, (if it is too disturbing you can credit me in the "about me" of the bot discord)
					iconUrl: client.embeds.ticketOpened.footer.iconUrl,
				});
			/*
				Copyright 2023 Sayrix (github.com/Sayrix)

				Licensed under the Apache License, Version 2.0 (the "License");
				you may not use this file except in compliance with the License.
				You may obtain a copy of the License at

				    http://www.apache.org/licenses/LICENSE-2.0

				Unless required by applicable law or agreed to in writing, software
				distributed under the License is distributed on an "AS IS" BASIS,
				WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
				See the License for the specific language governing permissions and
				limitations under the License.
				*/
			const row = new Discord.ActionRowBuilder();

			if (client.config.closeButton) {
				if (client.config.askReasonWhenClosing) {
					row.addComponents(
						new Discord.ButtonBuilder()
							.setCustomId("close_askReason")
							.setLabel(client.locales.buttons.close.label)
							.setEmoji(client.locales.buttons.close.emoji)
							.setStyle(Discord.ButtonStyle.Danger)
					);
				} else {
					row.addComponents(
						new Discord.ButtonBuilder()
							.setCustomId("close")
							.setLabel(client.locales.buttons.close.label)
							.setEmoji(client.locales.buttons.close.emoji)
							.setStyle(Discord.ButtonStyle.Danger)
					);
				}
			}

			if (client.config.claimButton) {
				row.addComponents(
					new Discord.ButtonBuilder()
						.setCustomId("claim")
						.setLabel(client.locales.buttons.claim.label)
						.setEmoji(client.locales.buttons.claim.emoji)
						.setStyle(Discord.ButtonStyle.Primary)
				);
			}

			const body = {
				embeds: [ticketOpenedEmbed],
				content: `<@${interaction.user.id}> ${
					client.config.pingRoleWhenOpened ? client.config.roleToPingWhenOpenedId.map((x) => `<@&${x}>`).join(", ") : ""
				}`,
			};

			if (row.components.length > 0) body.components = [row];

			channel
				.send(body)
				.then((msg) => {
					client.db.set(`tickets_${channel.id}.messageId`, msg.id);
					msg.pin().then(() => {
						msg.channel.bulkDelete(1);
					});
					interaction
						.editReply({
							content: client.locales.ticketOpenedMessage.replace("TICKETCHANNEL", `<#${channel.id}>`),
							components: [],
							ephemeral: true,
						})
						.catch((e) => console.log(e));

					resolve(true);
				})
				.catch((e) => console.log(e));
		});
	},
};
