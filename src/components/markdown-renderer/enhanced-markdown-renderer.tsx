import markdownItTaskLists from '@hedgedoc/markdown-it-task-lists'
import yaml from 'js-yaml'
import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'
import markdownItContainer from 'markdown-it-container'
import frontmatter from 'markdown-it-front-matter'
import mathJax from 'markdown-it-mathjax'
import plantuml from 'markdown-it-plantuml'
import markdownItRegex from 'markdown-it-regex'
import toc from 'markdown-it-toc-done-right'
import React, { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert } from 'react-bootstrap'
import { Trans } from 'react-i18next'
import { useSelector } from 'react-redux'
import { TocAst } from '../../external-types/markdown-it-toc-done-right/interface'
import { ApplicationState } from '../../redux'
import { InternalLink } from '../common/links/internal-link'
import { ShowIf } from '../common/show-if/show-if'
import { slugify } from '../editor/table-of-contents/table-of-contents'
import { RawYAMLMetadata, YAMLMetaData } from '../editor/yaml-metadata/yaml-metadata'
import { BasicMarkdownRenderer } from './basic-markdown-renderer'
import { createRenderContainer, validAlertLevels } from './markdown-it-plugins/alert-container'
import { highlightedCode } from './markdown-it-plugins/highlighted-code'
import { plantumlError } from './markdown-it-plugins/plantuml-error'
import { replaceAsciinemaLink } from './regex-plugins/replace-asciinema-link'
import { replaceGistLink } from './regex-plugins/replace-gist-link'
import { replaceLegacyGistShortCode } from './regex-plugins/replace-legacy-gist-short-code'
import { replaceLegacySlideshareShortCode } from './regex-plugins/replace-legacy-slideshare-short-code'
import { replaceLegacySpeakerdeckShortCode } from './regex-plugins/replace-legacy-speakerdeck-short-code'
import { replaceLegacyVimeoShortCode } from './regex-plugins/replace-legacy-vimeo-short-code'
import { replaceLegacyYoutubeShortCode } from './regex-plugins/replace-legacy-youtube-short-code'
import { replacePdfShortCode } from './regex-plugins/replace-pdf-short-code'
import { replaceQuoteExtraAuthor } from './regex-plugins/replace-quote-extra-author'
import { replaceQuoteExtraColor } from './regex-plugins/replace-quote-extra-color'
import { replaceQuoteExtraTime } from './regex-plugins/replace-quote-extra-time'
import { replaceVimeoLink } from './regex-plugins/replace-vimeo-link'
import { replaceYouTubeLink } from './regex-plugins/replace-youtube-link'
import { AbcReplacer } from './replace-components/abc/abc-replacer'
import { AsciinemaReplacer } from './replace-components/asciinema/asciinema-replacer'
import { ComponentReplacer } from './replace-components/ComponentReplacer'
import { CsvReplacer } from './replace-components/csv/csv-replacer'
import { FlowchartReplacer } from './replace-components/flow/flowchart-replacer'
import { GistReplacer } from './replace-components/gist/gist-replacer'
import { GraphvizReplacer } from './replace-components/graphviz/graphviz-replacer'
import { HighlightedCodeReplacer } from './replace-components/highlighted-fence/highlighted-fence-replacer'
import { ImageReplacer } from './replace-components/image/image-replacer'
import { KatexReplacer } from './replace-components/katex/katex-replacer'
import { MarkmapReplacer } from './replace-components/markmap/markmap-replacer'
import { MermaidReplacer } from './replace-components/mermaid/mermaid-replacer'
import { PdfReplacer } from './replace-components/pdf/pdf-replacer'
import { PossibleWiderReplacer } from './replace-components/possible-wider/possible-wider-replacer'
import { QuoteOptionsReplacer } from './replace-components/quote-options/quote-options-replacer'
import { SequenceDiagramReplacer } from './replace-components/sequence-diagram/sequence-diagram-replacer'
import { TaskListReplacer } from './replace-components/task-list/task-list-replacer'
import { VegaReplacer } from './replace-components/vega-lite/vega-replacer'
import { VimeoReplacer } from './replace-components/vimeo/vimeo-replacer'
import { YoutubeReplacer } from './replace-components/youtube/youtube-replacer'
import { AdditionalMarkdownRendererProps } from './types'
import { usePostMetaDataOnChange } from './utils/use-post-meta-data-on-change'
import { usePostTocAstOnChange } from './utils/use-post-toc-ast-on-change'

export interface EnhancedMarkdownRendererProps {
  additionalReplacers?: ComponentReplacer[]
  documentReference?: RefObject<HTMLDivElement>
  onConfigureMarkdownIt?: (md: MarkdownIt) => void
  onFirstHeadingChange?: (firstHeading: string | undefined) => void
  onMetaDataChange?: (yamlMetaData: YAMLMetaData | undefined) => void
  onTaskCheckedChange: (lineInMarkdown: number, checked: boolean) => void
  onTocChange?: (ast: TocAst) => void
}

export const EnhancedMarkdownRenderer: React.FC<EnhancedMarkdownRendererProps & AdditionalMarkdownRendererProps> = ({
  additionalReplacers,
  documentReference,
  onConfigureMarkdownIt,
  onFirstHeadingChange,
  onMetaDataChange,
  onTaskCheckedChange,
  onTocChange,
  content,
  className,
  wide
}) => {
  const allReplacers = useMemo(() => {
    const replacers: ComponentReplacer[] = [
      new PossibleWiderReplacer(),
      new GistReplacer(),
      new YoutubeReplacer(),
      new VimeoReplacer(),
      new AsciinemaReplacer(),
      new AbcReplacer(),
      new PdfReplacer(),
      new ImageReplacer(),
      new SequenceDiagramReplacer(),
      new CsvReplacer(),
      new FlowchartReplacer(),
      new MermaidReplacer(),
      new MarkmapReplacer(),
      new VegaReplacer(),
      new GraphvizReplacer(),
      new HighlightedCodeReplacer(),
      new QuoteOptionsReplacer(),
      new KatexReplacer(),
      new TaskListReplacer(onTaskCheckedChange)
    ]
    if (additionalReplacers) {
      replacers.unshift(...additionalReplacers)
    }
    return replacers
  }, [onTaskCheckedChange, additionalReplacers])

  const [yamlError, setYamlError] = useState(false)

  const plantumlServer = useSelector((state: ApplicationState) => state.config.plantumlServer)

  const rawMetaRef = useRef<RawYAMLMetadata>()
  const firstHeadingRef = useRef<string>()
  usePostMetaDataOnChange(rawMetaRef.current, firstHeadingRef.current, onMetaDataChange, onFirstHeadingChange)

  const tocAst = useRef<TocAst>()
  usePostTocAstOnChange(tocAst, onTocChange)

  const extractInnerText = useCallback((node: ChildNode) => {
    let innerText = ''
    if (node.childNodes && node.childNodes.length > 0) {
      node.childNodes.forEach((child) => { innerText += extractInnerText(child) })
    } else if (node.nodeName === 'IMG') {
      innerText += (node as HTMLImageElement).getAttribute('alt')
    } else {
      innerText += node.textContent
    }
    return innerText
  }, [])

  useEffect(() => {
    if (onFirstHeadingChange && documentReference?.current) {
      const firstHeading = documentReference.current.getElementsByTagName('h1').item(0)
      if (firstHeading) {
        onFirstHeadingChange(extractInnerText(firstHeading))
      }
    }
  }, [content, extractInnerText, onFirstHeadingChange, documentReference])

  const configureMarkdownIt = useCallback((md: MarkdownIt): void => {
    if (onMetaDataChange) {
      md.use(frontmatter, (rawMeta: string) => {
        try {
          const meta: RawYAMLMetadata = yaml.safeLoad(rawMeta) as RawYAMLMetadata
          setYamlError(false)
          rawMetaRef.current = meta
        } catch (e) {
          console.error(e)
          setYamlError(true)
        }
      })
    }
    md.use(markdownItTaskLists, { lineNumber: true })
    if (plantumlServer) {
      md.use(plantuml, {
        openMarker: '```plantuml',
        closeMarker: '```',
        server: plantumlServer
      })
    } else {
      md.use(plantumlError)
    }

    if (onMetaDataChange) {
      md.use(frontmatter, (rawMeta: string) => {
        try {
          const meta: RawYAMLMetadata = yaml.safeLoad(rawMeta) as RawYAMLMetadata
          setYamlError(false)
          rawMetaRef.current = meta
        } catch (e) {
          console.error(e)
          setYamlError(true)
          rawMetaRef.current = ({} as RawYAMLMetadata)
        }
      })
    }
    // noinspection CheckTagEmptyBody
    md.use(anchor, {
      permalink: true,
      permalinkBefore: true,
      permalinkClass: 'heading-anchor text-dark',
      permalinkSymbol: '<i class="fa fa-link"></i>'
    })
    md.use(mathJax({
      beforeMath: '<app-katex>',
      afterMath: '</app-katex>',
      beforeInlineMath: '<app-katex inline>',
      afterInlineMath: '</app-katex>',
      beforeDisplayMath: '<app-katex>',
      afterDisplayMath: '</app-katex>'
    }))
    md.use(markdownItRegex, replaceLegacyYoutubeShortCode)
    md.use(markdownItRegex, replaceLegacyVimeoShortCode)
    md.use(markdownItRegex, replaceLegacyGistShortCode)
    md.use(markdownItRegex, replaceLegacySlideshareShortCode)
    md.use(markdownItRegex, replaceLegacySpeakerdeckShortCode)
    md.use(markdownItRegex, replacePdfShortCode)
    md.use(markdownItRegex, replaceAsciinemaLink)
    md.use(markdownItRegex, replaceYouTubeLink)
    md.use(markdownItRegex, replaceVimeoLink)
    md.use(markdownItRegex, replaceGistLink)
    md.use(highlightedCode)
    md.use(markdownItRegex, replaceQuoteExtraAuthor)
    md.use(markdownItRegex, replaceQuoteExtraColor)
    md.use(markdownItRegex, replaceQuoteExtraTime)
    md.use(toc, {
      placeholder: '(\\[TOC\\]|\\[toc\\])',
      listType: 'ul',
      level: [1, 2, 3],
      callback: (code: string, ast: TocAst): void => {
        tocAst.current = ast
      },
      slugify: slugify
    })
    validAlertLevels.forEach(level => {
      md.use(markdownItContainer, level, { render: createRenderContainer(level) })
    })
    if (onConfigureMarkdownIt) {
      onConfigureMarkdownIt(md)
    }
  }, [onConfigureMarkdownIt, onMetaDataChange, plantumlServer])

  const clearMetadata = useCallback(() => {
    rawMetaRef.current = undefined
  }, [])

  return (
    <div className={'position-relative'}>
      <ShowIf condition={yamlError}>
        <Alert variant='warning' dir='auto'>
          <Trans i18nKey='editor.invalidYaml'>
            <InternalLink text='yaml-metadata' href='/n/yaml-metadata' className='text-dark'/>
          </Trans>
        </Alert>
      </ShowIf>
      <BasicMarkdownRenderer className={className} wide={wide} content={content} componentReplacers={allReplacers}
        onConfigureMarkdownIt={configureMarkdownIt} documentReference={documentReference}
        onBeforeRendering={clearMetadata}/>
    </div>
  )
}
