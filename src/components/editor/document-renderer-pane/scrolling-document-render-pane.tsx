import React, { useCallback, useEffect, useRef, useState } from 'react'
import { LineMarkerPosition } from '../../markdown-renderer/types'
import { ScrollProps, ScrollState } from '../scroll/scroll-props'
import { findLineMarks } from '../scroll/utils'
import { DocumentRenderPane, DocumentRenderPaneProps } from './document-render-pane'

export const ScrollingDocumentRenderPane: React.FC<DocumentRenderPaneProps & ScrollProps> = ({
  content,
  extraClasses,
  scrollState,
  wide,
  onFirstHeadingChange,
  onMakeScrollSource,
  onMetadataChange,
  onScroll,
  onTaskCheckedChange
}) => {
  const lastScrollPosition = useRef<number>()
  const renderer = useRef<HTMLDivElement>(null)
  const [lineMarks, setLineMarks] = useState<LineMarkerPosition[]>()

  const scrollTo = useCallback((targetPosition: number): void => {
    if (!renderer.current || targetPosition === lastScrollPosition.current) {
      return
    }
    lastScrollPosition.current = targetPosition
    renderer.current.scrollTo({
      top: targetPosition
    })
  }, [renderer])

  useEffect(() => {
    if (!renderer.current || !lineMarks || lineMarks.length === 0 || !scrollState) {
      return
    }
    if (scrollState.firstLineInView < lineMarks[0].line) {
      scrollTo(0)
      return
    }
    if (scrollState.firstLineInView > lineMarks[lineMarks.length - 1].line) {
      scrollTo(renderer.current.offsetHeight)
      return
    }
    const { lastMarkBefore, firstMarkAfter } = findLineMarks(lineMarks, scrollState.firstLineInView)
    const positionBefore = lastMarkBefore ? lastMarkBefore.position : lineMarks[0].position
    const positionAfter = firstMarkAfter ? firstMarkAfter.position : renderer.current.offsetHeight
    const lastMarkBeforeLine = lastMarkBefore ? lastMarkBefore.line : 1
    const firstMarkAfterLine = firstMarkAfter ? firstMarkAfter.line : content.split('\n').length
    const lineCount = firstMarkAfterLine - lastMarkBeforeLine
    const blockHeight = positionAfter - positionBefore
    const lineHeight = blockHeight / lineCount
    const position = positionBefore + (scrollState.firstLineInView - lastMarkBeforeLine) * lineHeight + scrollState.scrolledPercentage / 100 * lineHeight
    const correctedPosition = Math.floor(position)
    scrollTo(correctedPosition)
  }, [content, lineMarks, renderer, scrollState, scrollTo])

  const userScroll = useCallback(() => {
    if (!renderer.current || !lineMarks || lineMarks.length === 0 || !onScroll) {
      return
    }

    const scrollTop = renderer.current.scrollTop

    const lineMarksBeforeScrollTop = lineMarks.filter(lineMark => lineMark.position <= scrollTop)
    if (lineMarksBeforeScrollTop.length === 0) {
      return
    }

    const lineMarksAfterScrollTop = lineMarks.filter(lineMark => lineMark.position > scrollTop)
    if (lineMarksAfterScrollTop.length === 0) {
      return
    }

    const beforeLineMark = lineMarksBeforeScrollTop
      .reduce((prevLineMark, currentLineMark) =>
        prevLineMark.line >= currentLineMark.line ? prevLineMark : currentLineMark)

    const afterLineMark = lineMarksAfterScrollTop
      .reduce((prevLineMark, currentLineMark) =>
        prevLineMark.line < currentLineMark.line ? prevLineMark : currentLineMark)

    const blockHeight = afterLineMark.position - beforeLineMark.position
    const distanceToBefore = scrollTop - beforeLineMark.position
    const percentageRaw = (distanceToBefore / blockHeight)
    const percentage = Math.floor(percentageRaw * 100)
    const newScrollState: ScrollState = { firstLineInView: beforeLineMark.line, scrolledPercentage: percentage }
    onScroll(newScrollState)
  }, [lineMarks, onScroll, renderer])
  return (
    <DocumentRenderPane
      content={content}
      extraClasses={`overflow-y-scroll ${extraClasses ?? ''}`}
      rendererReference={renderer}
      wide={wide}
      onFirstHeadingChange={onFirstHeadingChange}
      onLineMarkerPositionChanged={setLineMarks}
      onMetadataChange={onMetadataChange}
      onMouseEnterRenderer={onMakeScrollSource}
      onScrollRenderer={userScroll}
      onTaskCheckedChange={onTaskCheckedChange}
    />
  )
}
