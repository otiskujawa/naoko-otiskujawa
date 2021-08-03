import { ICommand } from "../types";
import anime from "./anime.sakuria";
import ask from "./ask.sakuria";
import clear from "./clear.sakuria";
import decode from "./decode.sakuria";
import dicksize from "./dicksize.sakuria";
import help from "./help.sakuria";
import invite from "./invite.sakuria";
import kick from "./kick.sakuria";
import mors from "./mors.sakuria";
import say from "./say.sakuria";
import traceAnime from "./traceAnime.sakuria";
import uwuify from "./uwuify.sakuria";
import invert from "./invert.sakuria";

export const commands: ICommand[] = [anime, invert, ask, clear, decode, dicksize, help, invite, mors, say, traceAnime, uwuify, kick];