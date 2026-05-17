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

global.owner = [['573102286030'], ['19025051093'], ['']]
global.dev1 = '573102286030'

global.botNames = [
  '𝐆𝐔𝐄𝐑𝐑𝐀 𝐁𝐎𝐓 ♛',       
  '𝒈𝒖𝒆𝒓𝒓𝒂 𝒃𝒐𝒕 ✰', 
  '⧫ ɢᴜᴇʀʀᴀ - ʙᴏᴛ ⧫',   
  '⌬ 🄶🅄🄴🅁🅁🄰 🄱🄾🅃 ⌬'       
]

global.my = {
    canal1: '120363427020147321@newsletter',
    canal2: '120363427020147321@newsletter'
};

global.botImages = [ 
  'https://cdn.dix.lat/me/92dbd94f-eb3d-40d8-ac61-fd42f95c73ff.jpg',
  'https://cdn.dix.lat/me/2e77962f-2cfb-4831-bc37-9a2af152380f.jpg',
  'https://cdn.dix.lat/me/d01987c8-d49f-4ea6-9afc-9fe670c75e05.jpg',
  'https://cdn.dix.lat/me/dc339f12-a4c3-4735-9269-4f28f21c0936.jpg'
]

global.botImages2 = [ 
  'https://cdn.dix.lat/me/1dcd8a62-8cbf-4d49-a18c-a5c0c0c956e8.jpg',
  'https://cdn.dix.lat/me/5e1a70ed-a5b0-4adf-b465-c8f0d14c2a9e.jpg',
  'https://cdn.dix.lat/me/e95afcb4-c242-4255-9163-74cab7135005.jpg',
  'https://cdn.dix.lat/me/de12636b-2e27-4bea-91cd-b7607cc58f6f.jpg',
  'https://cdn.dix.lat/me/81890b96-fe99-4034-a2fe-68a2a30eb1ef.jpg',
  'https://cdn.dix.lat/me/92dbd94f-eb3d-40d8-ac61-fd42f95c73ff.jpg'
]

const conf = {
  utils: { cheerio, fs, fetch, axios, moment },
  api: { url: 'https://api.dix.lat' },
  sessions: { main: 'sessions', sub: 'sessions_sub_assistant' },
  social: { channel: '120363427020147321@newsletter' }
}

var more = String.fromCharCode(8206)
Object.assign(global, conf.utils)

global.url_api = conf.api.url
global.sessions = conf.sessions.main
global.jadi = conf.sessions.sub
global.ch = conf.social.channel
global.rmr = more.repeat(850)
global.developer = 'Kevin Santiago Roncancio Guerra'

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
global.key = "anty3vbmbg5gf"

global.channelInfo = {
    forwardingScore: 1,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: global.ch, 
        newsletterName: `⚔️ GUERRA BOT CHANNEL` 
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

const hour = new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    hour12: false,
    timeZone: 'America/Bogota'
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
