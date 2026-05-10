import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'
import path from 'path'
import { jidNormalizedUser } from '@whiskeysockets/baileys'

global.owner = [['50432955554'], ['5493772455367'], ['584228028583']]
global.dev1 = '50432955554'

global.botNames = [
  '𝐊𝐈𝐑𝐈𝐓𝐎 ♛',       
  '𝒌𝒂𝒛𝒖𝒕𝒐 𝒌𝒊𝒓𝒊𝒈𝒂𝒚 ✰', 
  '⧫ ᴋɪʀɪᴛᴏ - ᴋᴀ🇿ᴜᴛᴏ ᴋɪʀɪɢᴀʏ ⧫',   
  '⌬ 🄺🄸🅁🄸🅃🄾 ⌬'       
]

global.my = {
    canal1: '120363406846602793@newsletter',
    canal2: '120363427487466660@newsletter'
};

global.botImages = [ 
  'https://cdn.dix.lat/me/1773637276760.jpg',
  'https://cdn.dix.lat/me/1773637265253.jpg',
  'https://cdn.dix.lat/me/1773637270663.jpg',
  'https://cdn.dix.lat/me/1773637244306.jpg'
]

global.botImages2 = [ 
  'https://cdn.dix.lat/me/1773638458604.jpg',
  'https://cdn.dix.lat/me/1773638453930.jpg',
  'https://cdn.dix.lat/me/1773638443955.jpg',
  'https://cdn.dix.lat/me/1773638448409.jpg',
  'https://cdn.dix.lat/me/1773638462741.jpg',
  'https://cdn.dix.lat/me/1773638468052.jpg'
]

const conf = {
  utils: { cheerio, fs, fetch, axios, moment },
  api: { url: 'https://api.dix.lat' },
  sessions: { main: 'sessions', sub: 'sessions_sub_assistant' },
  social: { channel: '120363406846602793@newsletter' }
}

var more = String.fromCharCode(8206)
Object.assign(global, conf.utils)

global.url_api = conf.api.url
global.sessions = conf.sessions.main
global.jadi = conf.sessions.sub
global.ch = conf.social.channel
global.rmr = more.repeat(850)
global.developer = '𝙳𝚎𝚢𝚕𝚒𝚗 𝙴𝚕𝚒𝚊𝚌'

global.name = (c) => {
  const connection = c || global.conn;
  if (!connection?.user) return global.botNames[0];
  const id = jidNormalizedUser(connection.user.id);
  if (connection.settings?.botName) return connection.settings.botName;
  if (global.subbotConfig && global.subbotConfig[id]) {
    return global.subbotConfig[id].botName || global.botNames[0];
  }
  return global.botNames[Math.floor(Math.random() * global.botNames.length)];
};

global.img = (c) => {
  const connection = c || global.conn;
  const id = connection?.user ? jidNormalizedUser(connection.user.id) : null;
  let url = global.botImages[0];
  if (connection?.settings?.botImage) url = connection.settings.botImage;
  else if (id && global.subbotConfig && global.subbotConfig[id]) url = global.subbotConfig[id].botImage || global.botImages[0];
  else url = global.botImages[Math.floor(Math.random() * global.botImages.length)];
  return url;
};

global.img2 = (c) => {
  const connection = c || global.conn;
  const id = connection?.user ? jidNormalizedUser(connection.user.id) : null;
  let url = global.botImages2[0];
  if (connection?.settings?.botImage) url = connection.settings.botImage;
  else if (id && global.subbotConfig && global.subbotConfig[id]) url = global.subbotConfig[id].botImage || global.botImages2[0];
  else url = global.botImages2[Math.floor(Math.random() * global.botImages2.length)];
  return url;
};

global.v = JSON.parse(fs.readFileSync('./package.json', 'utf-8')).version
global.key = "kirito-bot-oficial"

global.channelInfo = {
    forwardingScore: 1,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: global.ch, 
        newsletterName: `بوت KIRITO CHANNEL` 
    }
};

global.bufferCache = global.bufferCache || new Map();

global.getBuffer = async (url, options = {}) => {
  if (global.bufferCache.has(url)) return global.bufferCache.get(url);
  
  if (global.bufferCache.size > 20) {
    const firstKey = global.bufferCache.keys().next().value;
    global.bufferCache.delete(firstKey);
  }

  try {
    const res = await axios({
      method: "get",
      url,
      headers: { 
        'DNT': 1, 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
      },
      ...options,
      responseType: 'arraybuffer'
    })
    
    if (res.status === 200 && res.data) {
      global.bufferCache.set(url, res.data);
      return res.data;
    }
    return null;
  } catch (e) { 
    return null; 
  }
}

const d = new Date(new Date().getTime() + 3600000)
global.fecha = d.toLocaleDateString('es', { day: 'numeric', month: 'numeric', year: 'numeric' })
global.tiempo = d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })

const hour = new Intl.DateTimeFormat('es-HN', {
    hour: '2-digit',
    hour12: false,
    timeZone: 'America/Tegucigalpa'
}).format(new Date());

global.saludo = hour >= 6 && hour < 12 ? 'Lɪɴᴅᴀ Mᴀɴ̃ᴀɴᴀ 🌅' : 
                 hour >= 12 && hour < 19 ? 'Lɪɴᴅᴀ Tᴀʀᴅᴇ 🌆' : 
                 'Lɪɴᴅᴀ Nᴏᴄʜᴇ 🌃';

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
