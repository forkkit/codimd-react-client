import { Editor, Hint, Hints, Pos } from 'codemirror'
import { findWordAtCursor, Hinter } from './index'

const wordRegExp = /^(<d(?:e|et|eta|etai|etail|etails)?)$/

const collapsableBlockHint = (editor: Editor): Promise< Hints| null > => {
  return new Promise((resolve) => {
    const searchTerm = findWordAtCursor(editor)
    const searchResult = wordRegExp.exec(searchTerm.text)
    if (searchResult === null) {
      resolve(null)
      return
    }
    const suggestions = ['<details>\n  <summary>Toggle label</summary>\n  Toggled content\n</details>']
    const cursor = editor.getCursor()
    if (!suggestions) {
      resolve(null)
    } else {
      resolve({
        list: suggestions.map((suggestion: string): Hint => ({
          text: suggestion
        })),
        from: Pos(cursor.line, searchTerm.start),
        to: Pos(cursor.line, searchTerm.end + 1)
      })
    }
  })
}

export const CollapsableBlockHinter: Hinter = {
  wordRegExp,
  hint: collapsableBlockHint
}
