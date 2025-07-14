const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason, delay } = require("@whiskeysockets/baileys");
const P = require('pino');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');

  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`Using WA vversion.join('.'), isLatest:{isLatest}`);

  const sock = makeWASocket({
    version,
    printQRInTerminal: true,
    auth: state,
    logger: P({ level: 'silent' }),
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if(connection === 'close') {
      if(lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        startBot();
      } else {
        console.log('Logged out. Re-run the bot and scan QR.');
      }
    }
    if(connection === 'open') {
      console.log('Connected to WhatsApp');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if(type !== 'notify') return;
    const msg = messages[0];
    if(!msg.message || msg.key.fromMe) return;
    const from = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

    if(text.toLowerCase() === '.menu') {
      const menuText = `
🤖 *AI MENU*
.analyze
.blackbox
.dalle
.gemini
.generate
.deepseek
.deepseekr1
.doppleai
.gpt
.gpt2
.imagen
.imagine
.llama
.metaai
.mistral
.photoai

🎵 *AUDIO MENU*
.bass
.blown
.deep
.earrape
.reverse
.robot
.volaudio
.tomp3
.toptt

⬇️ *DOWNLOAD MENU*
.apk
.download
.facebook
.gdrive
.gitclone
.image
.instagram
.itunes
.mediafire
.pinterest
.song
.song2
.play
.play2
.savestatus
.telesticker
.tiktok
.tiktokaudio
.video
.videodoc
.xvideos
.ytmp3
.ytmp3doc
.ytmp4
.ytmp4doc

🖼️ *PHOTO MENU*
.1917style
.advancedglow
.blackpinklogo
.blackpinkstyle
.cartoonstyle
.deletingtext
.dragonball
.effectclouds
.flag3dtext
.flagtext
.freecreate
.galaxystyle
.galaxywallpaper
.glitchtext
.glowingtext
.gradienttext
.graffiti
.incandescent
.lighteffects
.logomaker
.luxurygold
.makingneon
.matrix
.multicoloredneon
.neonglitch
.papercutstyle
.pixelglitch
.royaltext
.sand
.summerbeach
.topography
.typography
.watercolortext
.writetext

😂 *FUN MENU*
.dare
.fact
.jokes
.memes
.quotes
.trivia
.truth
.truthdetector
.xxqc

👥 *GROUP MENU*
.add
.antibot
.antitag
.antitagadmin
.antigroupmention
.antilink
.antilinkgc
.allow
.delallowed
.listallowed
.announcements
.antidemote
.antiforeign
.addcode
.delcode
.listcode
.listactive
.listinactive
.kickinactive
.kickall
.cancelkick
.antipromote
.welcome
.approveall
.close
.delppgroup
.demote
.disapproveall
.getgrouppp
.editsettings
.link
.hidetag
.invite
.kick
.listonline
.listrequests
.mediatag
.open
.closetime
.opentime
.poll
.promote
.resetlink
.setdesc
.setgroupname
.setppgroup
.tagadmin
.tagall
.totalmembers
.userid
.vcf

🖼️ *IMAGE MENU*
.remini
.wallpaper

🔄 *MULTISESSION MENU*
(Coming soon)

⚙️ *OTHER MENU*
.botstatus
.pair
.ping
.runtime
.repo
.time
      `;
      await sock.sendMessage(from, { text: menuText }, { quoted: msg });
    }
  });
}

startBot();
