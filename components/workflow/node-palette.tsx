// // // node-palette.tsx(sidebar.tsx)
import { useState } from "react"
import { HelpCircle, Home, Plus, ChevronDown, Layers, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function NodePalette() {
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  return (
    <div className="w-64 border-r bg-gradient-to-b from-background to-gray-50 flex flex-col h-full shadow-md">
      {/* MI-WARE logo and plus button in sidebar header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 transition-all duration-200 shadow-sm">
                <span className="font-bold tracking-wide">MI-WARE</span>
              </Button>
            </TooltipTrigger>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost" 
                className=" bg-gray-50 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 shadow-sm"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex-grow overflow-y-auto">
        {/* Navigation Section */}
        <div className="pt-4 pb-2 px-3">
          {/* <p className="text-xs font-medium text-gray-500 uppercase tracking-wider ml-3 mb-2">Navigation</p> */}
          
          <Button 
            variant="ghost" 
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all duration-200 mb-1"
          >
            <Home className="h-5 w-5 text-rose-500" />
            <span className="font-medium">Overview</span>
          </Button>
        </div>
        
        {/* Divider */}
        {/* <div className="px-6 py-2">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        </div>
         */}

      </div>

      {/* Help button at the bottom of sidebar */}
      <div className="border-t bg-white mt-auto">
        <Collapsible open={isHelpOpen} onOpenChange={setIsHelpOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full flex items-center justify-between px-5 py-4 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-amber-500" />
                <span className="font-medium">Help & Support</span>
              </div>
              <ChevronDown 
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isHelpOpen ? 'rotate-180' : ''}`} 
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="animate-slide-down">
            <div className="px-3 py-2 bg-gray-50 text-sm text-gray-600 space-y-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-left pl-10 py-2 hover:bg-white hover:shadow-sm rounded-lg transition-all duration-200"
              >
                Documentation
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-left pl-10 py-2 hover:bg-white hover:shadow-sm rounded-lg transition-all duration-200 text-rose-500 font-medium"
              >
                Contact Support
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}