// // // High-performance Data Table component with memoized row rendering
// 'use client';
// import React from 'react';

// export default function DataTable({ columns, data, keyField = 'id' }) {
//   if (!data || data.length === 0) {
//     return (
//       <div className="p-8 text-center text-slate-500 text-xs bg-slate-900 border border-slate-800 rounded-xl">
//         No records found in current data stream.
//       </div>
//     );
//   }

//   return (
//     <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
//       <div className="overflow-x-auto">
//         <table className="w-full text-left border-collapse text-xs">
//           <thead>
//             <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
//               {columns.map((col, idx) => (
//                 <th key={idx} className="p-4 font-semibold">{col.header}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-800 text-slate-300">
//             {data.map((row) => (
//               <tr key={row[keyField]} className="hover:bg-slate-850 transition-colors">
//                 {columns.map((col, idx) => (
//                   <td key={idx} className="p-4">
//                     {col.render ? col.render(row) : row[col.accessor]}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }