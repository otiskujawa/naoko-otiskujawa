import { uwufy } from "../../logic/logic.shaii";
import { defineCommand } from "../../types";

export default defineCommand({
  name: "uwufy",
  aliases: [],
  description: "Transforms your sentence to uwu",
  requiresProcessing: false,
  execute: async (message) => {
    if (message.args.length === 0) return "b-baka!! you need to give me s-something! uwu";
    return uwufy(message.args.join(" "));
  },
});
