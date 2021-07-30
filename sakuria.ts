// Documentation
// https://deploy-preview-680--discordjs-guide.netlify.app/additional-info/changes-in-v13.html
require("dotenv").config();

// Imports
import Sakuria from "./classes/Sakuria.sakuria";
import chalk from "chalk";
import {version} from "./package.json";
import quotes from "./assets/quotes.json";

console.clear();
console.log(chalk.hex('#FF33A7')(`              
          -%#-          
         *@@@@*         
        -@@%%@@-        
  :====:-@@@@@@=:====:  
*@@@@@@@@*+##@#+@@@@@@@*
 #@@@#@%##%.++=#%@*@@@#  by Geoxor 🌸                v${version}
  -*@@%***-  :%@@@@@*-  .▄▄ ·  ▄▄▄· ▄ •▄ ▄• ▄▌▄▄▄  ▪   ▄▄▄· 
     :#@@%+-%+****:     ▐█ ▀. ▐█ ▀█ █▌▄▌▪█▪██▌▀▄ █·██ ▐█ ▀█ 
    -@@@@%@-@@%@@@@-    ▄▀▀▀█▄▄█▀▀█ ▐▀▀▄·█▌▐█▌▐▀▀▄ ▐█·▄█▀▀█ 
    #@@%%@@=+@@@%@@#    ▐█▄▪▐█▐█ ▪▐▌▐█.█▌▐█▄█▌▐█•█▌▐█▌▐█ ▪▐▌ 
    #@@@@*:  :#@@@@#     ▀▀▀▀  ▀  ▀ ·▀  ▀ ▀▀▀ .▀  ▀▀▀▀ ▀  ▀  \n
`));

// Say inspirational anime quote
console.log(chalk.hex('#32343F')(`  ${quotes[~~(Math.random() * quotes.length - 1)]}\n`));

// Create sakuria
console.log(chalk.hex('#FF90E0')(`  🌸   Creating new Sakuria instance...`));
new Sakuria();  
console.log(chalk.hex('#FF90E0')(`  🌸   Sakuria created`));