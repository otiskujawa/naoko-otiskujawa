import Waifu from "./Waifu.sakuria";
import Discord from "discord.js";
import waifus from "../assets/waifus.json";
import { IJSONWaifu, IWaifu, IWaifuRarity } from "../types";
import { randomChoice } from "../logic/logic.sakuria";

const COMMON: IWaifuRarity = {
  relativeFrequency: 10,
  name: "common",
};

const UNCOMMON: IWaifuRarity = {
  relativeFrequency: 5,
  name: "uncommon",
};

const RARE: IWaifuRarity = {
  relativeFrequency: 3,
  name: "rare",
};

const LEGENDARY: IWaifuRarity = {
  relativeFrequency: 2,
  name: "legendary",
};

/**
 * This manages a waifu battle, randomly picking enemy waifus,
 * creating threads and deleting them and
 * rewarding players and keeping track of them
 * @author Cimok, Geoxor, azur1s, N1kO23
 */
export default class WaifuBattle {
  private lastBossbarMessage: Discord.Message | null;
  public chosenWaifu: IWaifu;
  public waifu: Waifu;
  public participants: Discord.User[];
  public startUser: Discord.User;
  public channel: Discord.TextChannel;
  public thread: Discord.ThreadChannel | null;
  public collector: Discord.MessageCollector | null;
  public bossbar: NodeJS.Timer | null;
  public battleDuration: number;
  public aftermathTime: number;
  public threadName: string;
  public ended: boolean;
  public battleStart: number;
  public battleEnd: number;

  constructor(startUser: Discord.User, channel: Discord.TextChannel) {
    this.chosenWaifu = this.chooseWaifu([COMMON, UNCOMMON, RARE, LEGENDARY]);
    this.waifu = new Waifu(this.chosenWaifu);
    this.participants = [];
    this.startUser = startUser;
    this.channel = channel;
    this.bossbar = null;
    this.thread = null;
    this.collector = null;
    this.battleDuration = 60000;
    this.aftermathTime = 20000;
    this.threadName = `waifu battle!`;
    this.ended = false;
    this.lastBossbarMessage = null;
    this.battleStart = 0;
    this.battleEnd = 0;
  }

  /**
   * Returns a random waifu based on rarities
   * @returns {Waifu} the waifu JSON
   * @author MaidMarija
   */
  chooseWaifu(rarities: IWaifuRarity[]): IWaifu {
    // sum up all these relative frequencies to generate a maximum for our random number generation
    let maximum = 0;
    rarities.forEach((w) => {
      maximum += w.relativeFrequency;
    });

    let choiceValue = Math.random() * maximum;

    // next we iterate through our rarities to determine which this choice refers to
    // we use < instead of <= because Math.random() is in the range [0,1)
    for (let rarity of rarities) {
      if (choiceValue < rarity.relativeFrequency) {
        // We make the IJSONWaifu into an IWaifu because we wanna add the rarity
        // even tho the rarity isn't part of the waifu itself rather its the key
        // for a group of waifus, someone make this a lot better kthx - geoxor
        const waifu = randomChoice<IJSONWaifu>(waifus[rarity.name]) as IWaifu;
        waifu.rarity = rarity;
        return waifu;
      } else {
        choiceValue -= rarity.relativeFrequency;
      }
    }

    // If for some reason we can't get a waifu just return a common one
    const waifu = randomChoice(waifus["common"]) as IWaifu;
    waifu.rarity = COMMON;
    return waifu;
  }

  /**
   * Returns the waifu embed
   * @returns {Discord.MessageOptions} of the waifu
   * @author Geoxor, Cimok
   */
  getWaifu(): Discord.MessageOptions {
    return { content: "type !attack to kill her!", files: [this.waifu.attachment], embeds: [this.waifu.ui] };
  }

  /**
   * Starts the battle
   * @author Geoxor, Cimok
   */
  async startBattle() {
    // Create thread
    await this.initThread();

    // Update the bossbar every second if it changes
    this.bossbar = setInterval(() => this.updateBossbar(), 5000);

    // End the battle if its been more than the battle duration
    setTimeout(async () => {
      !this.ended && (await this.endBattle());
    }, this.battleDuration);
  }

  /**
   * Creates the thread for the battle
   * @author Geoxor, Cimok
   */
  async initThread() {
    this.thread = await this.channel.threads.create({
      name: this.threadName,
      autoArchiveDuration: 60,
    });

    await this.thread.join();
    await this.thread.members.add(this.startUser);
    await this.thread.send(this.getWaifu());
    this.initCollector();
  }

  /**
   * Initializes the message collector
   * @author Geoxor, Cimok
   */
  async initCollector() {
    // Create the collector on the thread
    this.collector = new Discord.MessageCollector(this.thread!);

    // Collect messages
    this.collector.on("collect", async (message) => {
      if (message.content === "!attack") {
        // Keep track of when the battle started
        if (this.battleStart == 0) this.battleStart = Date.now();

        // Add the user to the participants who participated
        // in the battle so we can reward them
        !this.participants.includes(message.author) && this.participants.push(message.author);

        this.waifu.dealDamage(100);
        if (this.waifu.isDead) await this.endBattle();
      }
    });
  }

  /**
   * Updates the bossbar with the current battle stats
   * @author Geoxor, Cimok
   */
  async updateBossbar() {
    const newBossbar = `${this.waifu.name} still has *${this.waifu.currentHp}* HP!`;
    if (!this.ended && this.lastBossbarMessage?.content !== newBossbar) {
      this.lastBossbarMessage = await this.thread!.send(newBossbar);
    }
  }

  /**
   * Calculate how long the battle lasted
   * @author N1kO23, Geoxor
   */
  calculateBattleDuration() {
    return (this.battleEnd - this.battleStart) / 1000;
  }

  /**
   * The total DPS of the battle
   * @author N1kO23, Geoxor
   */
  calculateDPS() {
    return this.waifu.maxHp / this.calculateBattleDuration();
  }

  /**
   * Gets a list of all the participants who took part in the battle
   * Returning their tags and sorted by their DPS
   * @author N1kO23, Geoxor
   */
  getParticipants() {
    return this.participants.map((user) => `<@${user.id}>`).join("\n");
  }

  /**
   * Returns the reward info string for the embed
   * @author N1kO23, Geoxor
   */
  getRewards() {
    return `
      Prisms: ${this.waifu.rewards.currency}
      XP: ${this.waifu.rewards.xp}
    `;
  }

  /**
   * Creates the reward embed to display when the battle ends
   * @author N1kO23, Geoxor
   */
  createRewardEmbed() {
    return new Discord.MessageEmbed()
      .setColor("#ff00b6")
      .setTitle(`${this.waifu.name} has been defeated!`)
      .addField("Rewards", this.getRewards(), false)
      .addField("Participants", this.getParticipants(), false)
      .setFooter(`${this.calculateBattleDuration().toFixed(2)} seconds - ${this.calculateDPS().toFixed(2)}DPS`);
  }

  /**
   * Ends the battle
   * @author Geoxor, Cimok
   */
  async endBattle() {
    if (this.ended) return;
    this.ended = true;
    this.battleEnd = Date.now();
    this.collector!.stop();
    clearInterval(this.bossbar as NodeJS.Timeout);
    await this.thread!.setName(`${this.threadName} victory`);
    await this.thread!.send({
      content: `Battle ended, here's your rewards - deleting thread in ${this.aftermathTime / 1000} seconds`,
      embeds: [this.createRewardEmbed()],
    });
    setTimeout(() => {
      this.thread?.delete();
    }, this.aftermathTime);
  }
}