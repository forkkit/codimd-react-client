import MarkdownIt from 'markdown-it'
import React, { useCallback, useMemo, useRef } from 'react'
import { TocAst } from '../../external-types/markdown-it-toc-done-right/interface'
import { YAMLMetaData } from '../editor/yaml-metadata/yaml-metadata'
import { EnhancedMarkdownRenderer } from './enhanced-markdown-renderer'
import { LineMarkers, lineNumberMarker } from './markdown-it-plugins/line-number-marker'
import { LinemarkerReplacer } from './replace-components/linemarker/linemarker-replacer'
import { AdditionalMarkdownRendererProps, LineMarkerPosition } from './types'
import { useCalculateLineMarkerPosition } from './utils/calculate-line-marker-positions'

export interface FullMarkdownRendererProps {
  onLineMarkerPositionChanged?: (lineMarkerPosition: LineMarkerPosition[]) => void
  onFirstHeadingChange?: (firstHeading: string | undefined) => void
  onMetaDataChange?: (yamlMetaData: YAMLMetaData | undefined) => void
  onTaskCheckedChange: (lineInMarkdown: number, checked: boolean) => void
  onTocChange?: (ast: TocAst) => void
}

export const FullMarkdownRenderer: React.FC<FullMarkdownRendererProps & AdditionalMarkdownRendererProps> = ({
  onLineMarkerPositionChanged,
  onTaskCheckedChange,
  onTocChange,
  onMetaDataChange,
  onFirstHeadingChange,
  content,
  className,
  wide
}) => {
  const documentElement = useRef<HTMLDivElement>(null)
  const currentLineMarkers = useRef<LineMarkers[]>()

  useCalculateLineMarkerPosition(documentElement, currentLineMarkers.current, onLineMarkerPositionChanged, documentElement.current?.offsetTop ?? 0)

  const configureMarkdownIt = useCallback((md: MarkdownIt) => {
    md.use(lineNumberMarker(), {
      postLineMarkers: (lineMarkers) => {
        currentLineMarkers.current = lineMarkers
      }
    })
  }, [])

  const additionalReplacers = useMemo(() => {
    return [
      new LinemarkerReplacer()
    ]
  }, [])

  return (
    <EnhancedMarkdownRenderer
      content={content}
      className={className}
      documentReference={documentElement}
      wide={wide}
      additionalReplacers={additionalReplacers}
      onTaskCheckedChange={onTaskCheckedChange}
      onFirstHeadingChange={onFirstHeadingChange}
      onMetaDataChange={onMetaDataChange}
      onTocChange={onTocChange}
      onConfigureMarkdownIt={configureMarkdownIt}/>
  )
}
