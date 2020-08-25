import { Editor, EditorChange, EditorConfiguration, ScrollInfo } from 'codemirror'
import 'codemirror/addon/comment/comment'
import 'codemirror/addon/dialog/dialog'
import 'codemirror/addon/display/autorefresh'
import 'codemirror/addon/display/fullscreen'
import 'codemirror/addon/display/placeholder'
import 'codemirror/addon/edit/closebrackets'
import 'codemirror/addon/edit/closetag'
import 'codemirror/addon/edit/continuelist'
import 'codemirror/addon/edit/matchbrackets'
import 'codemirror/addon/edit/matchtags'
import 'codemirror/addon/fold/foldcode'
import 'codemirror/addon/fold/foldgutter'
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/search/search'
import 'codemirror/addon/search/jump-to-line'
import 'codemirror/addon/search/match-highlighter'
import 'codemirror/addon/selection/active-line'
import 'codemirror/keymap/sublime'
import 'codemirror/keymap/emacs'
import 'codemirror/keymap/vim'
import 'codemirror/mode/gfm/gfm'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Controlled as ControlledCodeMirror } from 'react-codemirror2'
import { useTranslation } from 'react-i18next'
import './editor-pane.scss'
import { ShowIf } from '../../common/show-if/show-if'
import { ScrollProps, ScrollState } from '../scroll/scroll-props'
import { generateEmojiHints, emojiWordRegex, findWordAtCursor } from './hints/emoji'
import { defaultKeyMap } from './key-map'
import { createStatusInfo, defaultState, StatusBar, StatusBarInfo } from './status-bar/status-bar'
import { ToolBar } from './tool-bar/tool-bar'
import { AdditionalMarker } from './additional-marker/additional-marker'

export interface EditorPaneProps {
  onContentChange: (content: string) => void
  content: string
}

const hintOptions = {
  hint: generateEmojiHints,
  completeSingle: false,
  completeOnSingleClick: false,
  alignWithWord: true
}

const onChange = (editor: Editor) => {
  const searchTerm = findWordAtCursor(editor)
  if (emojiWordRegex.test(searchTerm.text)) {
    editor.showHint(hintOptions)
  }
}

export const EditorPane: React.FC<EditorPaneProps & ScrollProps> = ({ onContentChange, content, scrollState, onScroll, onMakeScrollSource }) => {
  const { t } = useTranslation()
  const [editor, setEditor] = useState<Editor>()
  const [statusBarInfo, setStatusBarInfo] = useState<StatusBarInfo>(defaultState)
  const [editorPreferences, setEditorPreferences] = useState<EditorConfiguration>({
    theme: 'one-dark',
    keyMap: 'sublime',
    indentUnit: 4,
    indentWithTabs: false
  })

  const lastScrollPosition = useRef<number>()

  const onEditorScroll = useCallback((editor: Editor, data: ScrollInfo) => {
    if (!editor || !onScroll) {
      return
    }
    const scrollEventValue = data.top as number
    const line = editor.lineAtHeight(scrollEventValue, 'local')
    const startYOfLine = editor.heightAtLine(line, 'local')
    const lineInfo = editor.lineInfo(line)
    if (lineInfo === null) {
      return
    }
    const heightOfLine = (lineInfo.handle as { height: number }).height
    const percentageRaw = (Math.max(scrollEventValue - startYOfLine, 0)) / heightOfLine
    const percentage = Math.floor(percentageRaw * 100)

    const newScrollState: ScrollState = { firstLineInView: line + 1, scrolledPercentage: percentage }
    onScroll(newScrollState)
  }, [onScroll])

  useEffect(() => {
    if (!editor || !scrollState) {
      return
    }
    const startYOfLine = editor.heightAtLine(scrollState.firstLineInView - 1, 'div')
    const heightOfLine = (editor.lineInfo(scrollState.firstLineInView - 1).handle as { height: number }).height
    const newPositionRaw = startYOfLine + (heightOfLine * scrollState.scrolledPercentage / 100)
    const newPosition = Math.floor(newPositionRaw)
    if (newPosition !== lastScrollPosition.current) {
      lastScrollPosition.current = newPosition
      editor.scrollTo(0, newPosition)
    }
  }, [editor, scrollState])

  const onBeforeChange = useCallback((editor: Editor, data: EditorChange, value: string) => {
    onContentChange(value)
  }, [onContentChange])
  const onEditorDidMount = useCallback(mountedEditor => {
    setStatusBarInfo(createStatusInfo(mountedEditor))
    setEditor(mountedEditor)
  }, [])
  const onCursorActivity = useCallback((editorWithActivity) => {
    setCursorPosition({ line: editorWithActivity.getCursor().line, ch: editorWithActivity.getCursor().ch + 1 })
    setStatusBarInfo(createStatusInfo(editorWithActivity))
  }, [])
  const codeMirrorOptions: EditorConfiguration = useMemo<EditorConfiguration>(() => ({
    ...editorPreferences,
    mode: 'gfm',
    viewportMargin: 20,
    styleActiveLine: true,
    lineNumbers: true,
    lineWrapping: true,
    showCursorWhenSelecting: true,
    highlightSelectionMatches: true,
    inputStyle: 'textarea',
    matchBrackets: true,
    autoCloseBrackets: true,
    matchTags: {
      bothTags: true
    },
    autoCloseTags: true,
    foldGutter: true,
    gutters: [
      'CodeMirror-linenumbers',
      'authorship-gutters',
      'CodeMirror-foldgutter'
    ],
    extraKeys: defaultKeyMap,
    flattenSpans: true,
    addModeClass: true,
    autoRefresh: true,
    // otherCursors: true,
    placeholder: t('editor.placeholder')
  }), [t, editorPreferences])

  const [cursorPosition, setCursorPosition] = useState<CodeMirror.Position>(() => ({ ch: 0, line: 0 }))

  return (
    <div className={'d-flex flex-column h-100'} onMouseEnter={onMakeScrollSource}>
      <ToolBar
        editor={editor}
        onPreferencesChange={config => setEditorPreferences(config)}
        editorPreferences={editorPreferences}
      />
      <ControlledCodeMirror
        className="overflow-hidden w-100 flex-fill"
        value={content}
        options={codeMirrorOptions}
        onChange={onChange}
        onCursorActivity={onCursorActivity}
        editorDidMount={onEditorDidMount}
        onBeforeChange={onBeforeChange}
        onScroll={onEditorScroll}
      />
      <ShowIf condition={!!editor}>
        <AdditionalMarker editor={editor as Editor} position={cursorPosition} color={'0000ff'} name={'asd'} />
      </ShowIf>

      <StatusBar {...statusBarInfo} />
    </div>
  )
}
