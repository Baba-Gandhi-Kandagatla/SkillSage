import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Resizable } from "re-resizable"
import { useState, useRef } from "react"
import AceEditor from "react-ace"
import { X } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import "ace-builds/src-noconflict/ace"
import "ace-builds/src-noconflict/ext-language_tools"
import "ace-builds/src-noconflict/mode-c_cpp"
import "ace-builds/src-noconflict/mode-csharp"
import "ace-builds/src-noconflict/mode-java"
import "ace-builds/src-noconflict/mode-javascript"
import "ace-builds/src-noconflict/mode-python"
import "ace-builds/src-noconflict/mode-yaml"
import "ace-builds/src-noconflict/theme-monokai"

const programmingLanguages = [
  "javascript",
  "python",
  "java",
  "c_cpp",
  "csharp",
  "yaml",
]

const fontSizes = [12, 14, 16, 18, 20, 22, 24, 26, 28, 30]

type CodeEditorProps = {
  showCodeDialog: boolean
  setShowCodeDialog: (show: boolean) => void
  codeLanguage: string
  setCodeLanguage: (language: string) => void
  codeContent: string
  setCodeContent: (content: string) => void
  handleCodeSubmit: () => void
  isEditingCode: boolean
  isCanvas?: boolean // New prop to determine render mode
  onCancel?: () => void // New prop for canvas mode cancel
  onPaste?: () => void   // <-- new prop to handle paste action
}

export function CodeEditor({
  showCodeDialog,
  setShowCodeDialog,
  codeLanguage,
  setCodeLanguage,
  codeContent,
  setCodeContent,
  handleCodeSubmit,
  isEditingCode,
  isCanvas = false,
  onCancel,
  onPaste // <-- add onPaste prop
}: CodeEditorProps) {
  const aceEditorRef = useRef<AceEditor>(null)
  const [fontSize, setFontSize] = useState(16)

  const editorContent = (
    <div className="h-full flex flex-col">
      <div className="flex-grow flex flex-col space-y-4 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <p className="text-sm font-medium text-gray-500">Language</p>
            <Select value={codeLanguage} onValueChange={setCodeLanguage}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {programmingLanguages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <p className="text-sm font-medium text-gray-500">Font Size</p>
            <Select value={fontSize.toString()} onValueChange={(value) => setFontSize(Number(value))}>
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Font size" />
              </SelectTrigger>
              <SelectContent>
                {fontSizes.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}px
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isCanvas && (
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={onPaste}
                      className="bg-blue-50 hover:bg-blue-100">
                      Paste Code
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Paste code copied from the question</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={onCancel} className="bg-red-50 hover:bg-red-100">
                      Cancel
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Discard changes and close the code editor</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Button variant="ghost" onClick={() => setShowCodeDialog(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex-grow relative border rounded-md overflow-hidden">
          <AceEditor
            ref={aceEditorRef}
            mode={codeLanguage}
            theme="monokai"
            onChange={setCodeContent}
            value={codeContent}
            name="code-editor"
            fontSize={fontSize}
            editorProps={{ $blockScrolling: true }}
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: true,
              showLineNumbers: true,
              tabSize: 2,
            }}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        
        {!isCanvas && (
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setShowCodeDialog(false)} variant="outline">
              Close
            </Button>
            <Button onClick={handleCodeSubmit}>Ok</Button>
          </div>
        )}
      </div>
    </div>
  )

  if (isCanvas) {
    return editorContent
  }

  return (
    <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
      <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] overflow-hidden">
        <Resizable
          defaultSize={{
            width: "100%",
            height: "80vh",
          }}
          minHeight="300px"
          minWidth="300px"
        >
          {editorContent}
        </Resizable>
      </DialogContent>
    </Dialog>
  )
}
