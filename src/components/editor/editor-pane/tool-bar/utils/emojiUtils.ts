import { EmojiClickEventDetail, NativeEmoji } from 'emoji-picker-element/shared'

export const getEmojiIcon = (emoji: EmojiClickEventDetail): string => {
  if (emoji.unicode) {
    return emoji.unicode
  }
  if (emoji.name) {
    // noinspection CheckTagEmptyBody
    return `<i class="fa ${emoji.name}"></i>`
  }
  return ''
}

export const getEmojiShortCode = (emoji: EmojiClickEventDetail): string => {
  let skinToneModifier = ''
  if ((emoji.emoji as NativeEmoji).skins && emoji.skinTone !== 0) {
    skinToneModifier = `:skin-tone-${emoji.skinTone + 1}:`
  }
  return `:${emoji.emoji.shortcodes[0]}:${skinToneModifier}`
}
