import {VK} from 'vk-io'
import fs from 'fs'
import {Telegraf} from 'telegraf'
import {asyncSleep, randomNumber} from './funcs.js'
import {TG_ADMIN_CHAT_ID, TG_BOT_TOKEN, TG_CHAT_TO_POST_ID, VK_ACCESS_TOKEN, VK_WALLS_IDS} from './config.js'

// Initiate telegram bot
const bot = new Telegraf(TG_BOT_TOKEN)
await bot.telegram.getMe()

// Initiate VK agent
const vk = new VK({
  token: VK_ACCESS_TOKEN
})
await vk.api.account.getInfo({})

// Check if lastPostedPostsIds.json file exists
const lastPostedPostIds: {
  [key: number]: number
} = JSON.parse(await fs.promises.readFile('./src/lastPostedPostsIds.json', {encoding: 'utf-8'}))

console.log('Всё заебись. Бот и агент VK запущены')

// Run infinite loop
while(true) {

  try {

    // Get walls
    for(const wallId of VK_WALLS_IDS) {

      const ms = (() => {

        const date = new Date()

        if(date.getHours() > 6 || date.getHours() < 22) {
          return randomNumber(3 * 60 * 1000, 8 * 60 * 1000)
        }
        return randomNumber(15 * 60 * 1000, 45 * 60 * 1000)
      })()

      console.log(`Waiting for ${ms/1000} seconds...`)
      await asyncSleep(ms)

      // Get last 5 posts
      let {items: posts} = (await vk.api.wall.get({
        owner_id: wallId,
        count: 5
      }))
      posts = posts
        .filter((post) => !post.is_pinned)
        .filter((post) => post && (post.id && post.id > (lastPostedPostIds[wallId] || 0))).reverse()

      console.log('Grabbed', wallId, posts.map(post => post.id))

      for(const post of posts) {

        console.log('Preparing', wallId, post.id)

        await asyncSleep(randomNumber(60000, 180000))

        console.log('Prepared', wallId, post.id)

        // Give photos urls array
        const photos: string[] = (post.attachments || [])
          .filter((attachment) => attachment.type === 'photo').map((photo) => (photo.photo.sizes.slice(-1)[0].url))

        // If post has photos
        if(photos.length) {

          await bot.telegram.sendMediaGroup(TG_CHAT_TO_POST_ID, photos.map((photo, i) => ({
            media: {url: photo},
            type: 'photo',
            caption: i ? undefined : post.text
          })))
        }

        // If post has no photos
        else {

          if(post.text) {
            await bot.telegram.sendMessage(TG_CHAT_TO_POST_ID, post.text)
          }
        }

        // Save last posted post id
        if(post.id) lastPostedPostIds[wallId] = post.id

        console.log('Sent', wallId, post.id)
      }

      fs.writeFileSync('./src/lastPostedPostsIds.json', JSON.stringify(lastPostedPostIds))
    }
  }
  catch(error: any) {
    console.error(error)

    await asyncSleep(1000)
    await bot.telegram.sendMessage(TG_ADMIN_CHAT_ID, `

      ❌ <b>На граббере возникла ошибка:</b>
      
      <code>${error.stack}</code>
    `.replace(/^ +/gm, '').replace(/<\/?(?!(?:em|i|strong|b|a|code)\b)[a-z](?:[^>"']|"[^"]*"|'[^']*')*>/gm, ''), {
      parse_mode: 'HTML'
    })
  }
}
