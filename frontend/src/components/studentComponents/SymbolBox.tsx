import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"


const latexSymbols = [
    { symbol: "\\alpha", display: "α" },
    { symbol: "\\beta", display: "β" },
    { symbol: "\\gamma", display: "γ" },
    { symbol: "\\delta", display: "δ" },
    { symbol: "\\epsilon", display: "ε" },
    { symbol: "\\theta", display: "θ" },
    { symbol: "\\pi", display: "π" },
    { symbol: "\\sigma", display: "σ" },
    { symbol: "\\omega", display: "ω" },
    { symbol: "\\sum", display: "Σ" },
    { symbol: "\\prod", display: "Π" },
    { symbol: "\\int", display: "∫" },
    { symbol: "\\infty", display: "∞" },
    { symbol: "\\partial", display: "∂" },
    { symbol: "\\nabla", display: "∇" },
  ]
  
type SymbolBoxProps = {
  showSymbolDialog: boolean
  setShowSymbolDialog: (show: boolean) => void
  handleSymbolClick: (display: string) => void
}

export function SymbolBox({ showSymbolDialog, setShowSymbolDialog, handleSymbolClick }: SymbolBoxProps) {
  return (
    <Dialog open={showSymbolDialog} onOpenChange={setShowSymbolDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Insert Symbol</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-5 gap-2">
          {latexSymbols.map((item) => (
            <Button
              key={item.symbol}
              variant="outline"
              onClick={() => handleSymbolClick(item.display)}
              className="text-lg font-mono"
            >
              {item.display}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
