import { DomElement } from 'domhandler'
import React from 'react'
import { ComponentReplacer } from '../ComponentReplacer'
import { MarkmapFrame } from './markmap-frame'

export class MarkmapReplacer implements ComponentReplacer {
  getReplacement (codeNode: DomElement): React.ReactElement | undefined {
    if (codeNode.name !== 'code' || !codeNode.attribs || !codeNode.attribs['data-highlight-language'] || codeNode.attribs['data-highlight-language'] !== 'markmap' || !codeNode.children || !codeNode.children[0]) {
      return
    }

    const code = codeNode.children[0].data as string

    return <MarkmapFrame code={code}/>
  }
}
