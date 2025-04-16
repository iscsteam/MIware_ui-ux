// // // // node-palette.tsx(sidebar.tsx)
// import { useState } from "react";
// import {HelpCircle,Home,Plus,ChevronDown,} from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {Collapsible,CollapsibleContent,CollapsibleTrigger,} from "@/components/ui/collapsible";
// import {Tooltip,TooltipProvider,TooltipTrigger,} from "@/components/ui/tooltip";

// export function NodePalette() {
//   const [isHelpOpen, setIsHelpOpen] = useState(false);

//   return (
//     <div className="w-64 border-r bg-gradient-to-b from-background to-gray-50 flex flex-col h-full shadow-md">
//       {/* MI-WARE logo and plus button in sidebar header */}
//       <div className="flex items-center justify-between p-4 border-b bg-white">
//         <TooltipProvider>
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <div className="flex items-center gap-2">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="32"
//                   height="30"
//                   className="_logo_1x25c_123"
//                 >
//                   <path
//                     fill="#EA4B71"
//                     fillRule="evenodd"
//                     d="M27.2 16.4a3.2 3.2 0 0 1-3.1-2.4h-3.667a1.6 1.6 0 0 0-1.578 1.337l-.132.79A3.2 3.2 0 0 1 17.683 18a3.2 3.2 0 0 1 1.04 1.874l.132.789A1.6 1.6 0 0 0 20.433 22h.468a3.201 3.201 0 0 1 6.299.8 3.2 3.2 0 0 1-6.3.8h-.467a3.2 3.2 0 0 1-3.156-2.674l-.132-.789a1.6 1.6 0 0 0-1.578-1.337h-1.268a3.201 3.201 0 0 1-6.198 0H6.299A3.201 3.201 0 0 1 0 18a3.2 3.2 0 0 1 6.3-.8h1.8a3.201 3.201 0 0 1 6.2 0h1.267a1.6 1.6 0 0 0 1.578-1.337l.132-.79a3.2 3.2 0 0 1 3.156-2.673h3.668a3.201 3.201 0 0 1 6.299.8 3.2 3.2 0 0 1-3.2 3.2m0-1.6a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2m-24 4.8a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2m9.6-1.6a1.6 1.6 0 1 1-3.2 0 1.6 1.6 0 0 1 3.2 0m12.8 4.8a1.6 1.6 0 1 1-3.2 0 1.6 1.6 0 0 1 3.2 0"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//                 <span className="font-bold text-lg text-black-600 tracking-wide">
//                   MI-WARE
//                 </span>
//               </div>
//             </TooltipTrigger>
//           </Tooltip>
//         </TooltipProvider>

//         <TooltipProvider>
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button
//                 size="icon"
//                 variant="ghost"
//                 className=" bg-gray-50 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 shadow-sm"
//               >
//                 <Plus className="h-5 w-5" />
//               </Button>
//             </TooltipTrigger>
//           </Tooltip>
//         </TooltipProvider>
//       </div>

//       <div className="flex-grow overflow-y-auto">
//         {/* Navigation Section */}
//         <div className="pt-4 pb-2 px-3">
//           <Button
//             variant="ghost"
//             className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all duration-200 mb-1"
//           >
//             <Home className="h-5 w-5 text-rose-500" />
//             <span className="font-medium">Overview</span>
//           </Button>
//         </div>
//       </div>

//       {/* Help button at the bottom of sidebar */}
//       <div className="border-t bg-white mt-auto">
//         <Collapsible open={isHelpOpen} onOpenChange={setIsHelpOpen}>
//           <CollapsibleTrigger asChild>
//             <Button
//               variant="ghost"
//               className="w-full flex items-center justify-between px-5 py-4 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
//             >
//               <div className="flex items-center gap-3">
//                 <HelpCircle className="h-5 w-5 text-amber-500" />
//                 <span className="font-medium">Help & Support</span>
//               </div>
//               <ChevronDown
//                 className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
//                   isHelpOpen ? "rotate-180" : ""
//                 }`}
//               />
//             </Button>
//           </CollapsibleTrigger>
//           <CollapsibleContent className="animate-slide-down">
//             <div className="px-3 py-2 bg-gray-50 text-sm text-gray-600 space-y-1">
//               <Button
//                 variant="ghost"
//                 className="w-full justify-start text-left pl-10 py-2 hover:bg-white hover:shadow-sm rounded-lg transition-all duration-200"
//               >
//                 Documentation
//               </Button>
//               <Button
//                 variant="ghost"
//                 className="w-full justify-start text-left pl-10 py-2 hover:bg-white hover:shadow-sm rounded-lg transition-all duration-200 text-rose-500 font-medium"
//               >
//                 Contact Support
//               </Button>
//             </div>
//           </CollapsibleContent>
//         </Collapsible>
//       </div>
//     </div>
//   );
// }
import { useState } from "react";
import {
  HelpCircle,
  Plus,
  ChevronDown,
  FileText,
  Folder,
  Layers,
  Shield,
  Settings,
  Plug,
  Puzzle,
  Variable,
  Boxes,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function NodePalette() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSampleOpen, setIsSampleOpen] = useState(true);
  const [isModuleOpen, setIsModuleOpen] = useState(false);

  return (
    <div className="w-64 border-r bg-gradient-to-b from-background to-gray-50 flex flex-col h-full shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="30"
                  className="_logo_1x25c_123"
                >
                  <path
                    fill="#EA4B71"
                    fillRule="evenodd"
                    d="M27.2 16.4a3.2 3.2 0 0 1-3.1-2.4h-3.667a1.6 1.6 0 0 0-1.578 1.337l-.132.79A3.2 3.2 0 0 1 17.683 18a3.2 3.2 0 0 1 1.04 1.874l.132.789A1.6 1.6 0 0 0 20.433 22h.468a3.201 3.201 0 0 1 6.299.8 3.2 3.2 0 0 1-6.3.8h-.467a3.2 3.2 0 0 1-3.156-2.674l-.132-.789a1.6 1.6 0 0 0-1.578-1.337h-1.268a3.201 3.201 0 0 1-6.198 0H6.299A3.201 3.201 0 0 1 0 18a3.2 3.2 0 0 1 6.3-.8h1.8a3.201 3.201 0 0 1 6.2 0h1.267a1.6 1.6 0 0 0 1.578-1.337l.132-.79a3.2 3.2 0 0 1 3.156-2.673h3.668a3.201 3.201 0 0 1 6.299.8 3.2 3.2 0 0 1-3.2 3.2m0-1.6a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2m-24 4.8a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2m9.6-1.6a1.6 1.6 0 1 1-3.2 0 1.6 1.6 0 0 1 3.2 0m12.8 4.8a1.6 1.6 0 1 1-3.2 0 1.6 1.6 0 0 1 3.2 0"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-bold text-lg text-black-600 tracking-wide">
                  MI-WARE
                </span>
              </div>
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

      {/* Sidebar Body */}
      <div className="flex-grow overflow-y-auto">
        <div className="pt-4 pb-2 px-3 space-y-1">
          <Button
            variant="ghost"
            onClick={() => setIsSampleOpen(!isSampleOpen)}
            className="w-full flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all duration-200 font-semibold"
          >
            <span className="flex items-center gap-2">
              <Boxes className="h-4 w-4 text-rose-500" />
            Project Structure
            </span>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                isSampleOpen ? "rotate-180" : ""
              }`}
            />
          </Button>

          {isSampleOpen && (
            <div className="pl-6 space-y-1">
              {[
                { label: "Service Descriptors", icon: FileText },
                { label: "Resources", icon: Folder },
                { label: "Schemas", icon: Layers },
                { label: "Policies", icon: Shield },
              ].map((item, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className="w-full flex items-center gap-3 px-4 py-1 text-gray-700 hover:bg-white hover:shadow-sm rounded-lg"
                >
                  <item.icon className="h-4 w-4 text-rose-500" />
                  {item.label}
                </Button>
              ))}

              {/* Module Descriptors Collapsible */}
              <div className="pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setIsModuleOpen(!isModuleOpen)}
                  className="w-full flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-white hover:shadow-sm rounded-lg font-medium"
                >
                  <span className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-rose-500" />
                    Module Descriptors
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                      isModuleOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>

                {isModuleOpen && (
                  <div className="pl-6 pt-1 space-y-1">
                    {[
                      { label: "Module Properties", icon: Settings },
                      { label: "Dependencies", icon: Plug },
                      { label: "Components", icon: Puzzle },
                      { label: "Shared Variables", icon: Variable },
                    ].map((item, idx) => (
                      <Button
                        key={idx}
                        variant="ghost"
                        className="w-full flex items-center gap-3 px-4 py-1 text-gray-700 hover:bg-white hover:shadow-sm rounded-lg"
                      >
                        <item.icon className="h-4 w-4 text-rose-500" />
                        {item.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Help Section */}
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
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                  isHelpOpen ? "rotate-180" : ""
                }`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="animate-slide-down">
            <div className="px-3 py-2 bg-gray-50 text-sm text-gray-600 space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start text-left pl-10 py-2 hover:bg-white hover:shadow-sm rounded-lg"
              >
                Documentation
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-left pl-10 py-2 hover:bg-white hover:shadow-sm text-rose-500 font-medium"
              >
                Contact Support
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
