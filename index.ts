import makeWASocket, { DisconnectReason, useMultiFileAuthState,  } from '@adiwajshing/baileys'
import { Boom } from '@hapi/boom'
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import moment from 'moment-timezone';
async function connectToWhatsApp () {
    const {state, saveCreds} = await useMultiFileAuthState('auth')
    const sock = makeWASocket({
        // can provide additional config here
        printQRInTerminal: true,
        auth: state
    })
    sock.ev.on('creds.update', saveCreds )
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect)
            // reconnect if not logged out
            if(shouldReconnect) {
                connectToWhatsApp()
            }
        } else if(connection === 'open') {
            console.log('opened connection')
        }
    })
    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];

        if (!msg.key.fromMe && m.type === 'notify' ){
            if (msg.message?.locationMessage){
                 const latitude = msg.message?.locationMessage?.degreesLatitude
                 const longutide = msg.message?.locationMessage?.degreesLongitude
                 
                 const coordinates = new Coordinates(latitude!, longutide!);
                 const params = CalculationMethod.MoonsightingCommittee();
                 const date = new Date() ;
                 const prayerTimes = new PrayerTimes(coordinates, date, params);
                 console.log(prayerTimes);
                 await sock.sendMessage(msg.key.remoteJid!, { text: processData(prayerTimes)})
            } else if (msg.message?.conversation === '/islam') {
                const quote_islam = [
                    "don't forget to read Al-Qur'an minimum 1 verses/day",
                    '“Worldly life is short, so turn to Allah before you return to Allah.” – Anonymous',
                    'Do not lose hope, nor be sad.” Quran 3:139',
                    'Never underestimate the power of Dua (supplication).” – Anonymous',
                    '“Allah makes the impossible possible.” -Anonymous',
                    '“Be like a diamond, precious and rare, not like a stone, found everywhere.” –Anonymous',
                    '“No one will reap except what they sow.” -Quran 6:164',
                    '“For indeed, with hardship ease.” -Quran 94:5',
                    '“Allah is with the doers of good.” –Quran 29:69',
                    '“Before going to sleep every night, forgive everyone and sleep with a clean heart.” –Anonymous',
                    '“The heart that beats for Allah is always a stranger among the hearts that beat for the Dunya (world).” – Anonymous',
                    '“Dua (supplication) has the power to turn your dreams into reality.” –Anonymous',
                    '"Once prayer becomes a habit, success becomes a lifestyle.” –Anonymous',
                    '“Call upon Me, I will respond to you.” –Quran 40:60',
                    '“Allah makes the impossible possible.” –Anonymous',
                    '“Be like a diamond, precious and rare, not like a stone, found everywhere.” –Unknown',
                    '“Speak only when your words are more beautiful than the silence.” –Anonymous',
                    '“The more you let go, the higher you rise.” –Anonymous',
                    '“Allah tests us with what we love.” –Anonymous',
                    '“And it is He who created the night and day, and the sun and moon.” –Quran 21:33',
                    '“Taking pains to remove the pains of others is the true essence of generosity.” – Abu Bakr (R.A)',
                    '“A busy life makes prayer harder, but prayer makes a busy life easier.” -Anonymous',
                    '“Forgive others as quickly as you expect Allah to forgive you.” -Anonymous',
                ]
                const randomQuote_islam = quote_islam[Math.floor(Math.random() * quote_islam.length)]
                await sock.sendMessage(msg.key.remoteJid!, { text: randomQuote_islam})

            } else if (msg.message?.conversation === '/kristen'){
                const quote_kristen = [
                    "don' forget to read al-kitab",
                    '"God loves each of us as if there were only one of us." - Saint Augustine',
                    '"I can do all things through him who strengthens me." - PHILIPPIANS 4:13',
                    '“Worry does not empty tomorrow of its sorrows; it empties today of its strength.” - CORRIE TEN BOOM',
                    '“Religion says, ‘I obey; therefore I am accepted.’ Christianity says, ‘I’m accepted, therefore I obey." - TIMOTHY KELLER',
                    '“The will of God will never take you to where the grace of God will not protect you.” - BERNADETTE DEVLIN',
                    '“Relying on God has to start all over everyday, as if nothing has yet been done.” - C.S. LEWIS',
                    '“God is looking for those with whom He can do the impossible — what a pity that we plan only the things that we can do by ourselves.” - A.W. TOZER',
                    '“Only when we are brave enough to explore the darkness will we discover the infinite power of our light.” - BRENÉ BROWN', 
                ]

                const randomQuote_kristen = quote_kristen[Math.floor(Math.random() * quote_kristen.length)]
                await sock.sendMessage(msg.key.remoteJid!, { text: randomQuote_kristen})
            } else {
                await sock.sendMessage(msg.key.remoteJid!, { text: `This is bot for rermind the time of worship 
                                                                   \n\n you can share your *current*  location for get shalat schedule in your area
                                                                   \n\n and you can also type : /"your_religion"\n to get some quotes and motivation
                                                                   \n example : /islam, /kristen
                                                                   \n\n if you interesting for this bot you can donate for support developer to develop this bot
                                                                   \n\n https://saweria.co/hamaay`})
            }
 
            
         } 

      
        
    })
}

function processData(data: any){
    return `time for shalat, today \n\n 
            
            subuh : ${processTime(data.fajr)}\n 
            Duha : ${processTime(data.sunrise)}\n 
            Dzuhur : ${processTime(data.dhuhr)}\n 
            ashar : ${processTime(data.asr)}\n 
            maghrib : ${processTime(data.maghrib)}\n 
            isha : ${processTime(data.isha)} `
}

function processTime(time: any){
    return moment(time)
            .tz('Asia/Jakarta')
            .format('HH:mm')
}
connectToWhatsApp()