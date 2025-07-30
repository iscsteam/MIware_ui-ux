// "use client";
// import React, { FC, useState, KeyboardEvent } from "react";
// import { ArrowLeft, ArrowRight } from "lucide-react";

// interface FlipCardProps {
//   title: string;
//   frontImg?: string;
//   backText: string;
//   ctaText: string;
//   width?: number;
//   height?: number;
// }

// const FlipCard: FC<FlipCardProps> = ({
//   title,
//   frontImg,
//   backText,
//   ctaText,
//   width = 300,
//   height = 350,
// }) => {
//   const [flipped, setFlipped] = useState(false);
//   const toggle = () => setFlipped((f) => !f);
//   const onKey = (e: KeyboardEvent) => {
//     if (e.key === "Enter" || e.key === " ") {
//       e.preventDefault();
//       toggle();
//     }
//   };

//   return (
//     <div
//       className="group perspective inline-block cursor-pointer"
//       style={{ width, height }}
//       tabIndex={0}
//       onClick={toggle}
//       onKeyDown={onKey}
//     >
//       <div
//         className={`relative w-full h-full rounded-lg transition-transform duration-500 [transform-style:preserve-3d] ${
//           flipped ? "[transform:rotateY(180deg)]" : ""
//         }`}
//       >
//         {/* Front Side */}
//         <div className="absolute inset-0 bg-white rounded-lg shadow-lg flex flex-col backface-hidden">
//           {frontImg && (
//             <img
//               src={frontImg}
//               alt={title}
//               className="w-full h-[200px] rounded-t-lg object-cover"
//             />
//           )}
//           <div className="p-2 flex-1 flex flex-col items-center justify-center text-center">
//             <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
//             <p className="text-sm text-gray-500 mt-2">Tap to learn more</p>
//           </div>
//         </div>

//         {/* Back Side */}
//         <div className="absolute inset-0 p-4 bg-gray-50 rounded-lg shadow-lg flex flex-col justify-between backface-hidden [transform:rotateY(180deg)]">
//           <div className="flex items-start justify-between mb-4">
//             <ArrowLeft className="w-5 h-5 text-gray-500" />
//             <ArrowRight className="invisible w-4 h-4 text-gray-500" />
//           </div>
//           <p className="flex-1 text-gray-700 leading-relaxed mb-6">{backText}</p>
//           <div className="flex items-center justify-between">
//             <span className="text-sm font-medium text-blue-600">{ctaText}</span>
//             <ArrowRight className="w-4 h-4 text-blue-600" />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FlipCard;
