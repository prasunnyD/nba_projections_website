// import React, { useState } from 'react';

// const GameHistoryForm = ({ onSubmit }) => {
//     const [gameCount, setGameCount] = useState(10);
//     const handleSubmit = (e) => {
//         e.preventDefault();
//         if (!gameCount || isNaN(gameCount)) {
//             console.error('Invalid gameCount value. Skipping submission.');
//             return;
//         }
//         onSubmit(gameCount); // Pass only the game count
//     };

//     return (
//         <form onSubmit={handleSubmit} className="flex flex-col items-center mb-4">
//             <div className="flex items-center gap-4">
//                 <div className="flex items-center gap-2">
//                     <label htmlFor="gameCount" className="block text-sm font-medium text-white">
//                         Number of Games:
//                     </label>
//                     <select
//                         id="gameCount"
//                         value={gameCount}
//                         onChange={(e) => {
//                             const value = Number(e.target.value) || 10;
//                             console.log('Selected gameCount:', value);
//                             setGameCount(value);
//                         }}
//                         className="px-3 py-2 border rounded-md"
//                     >
//                         <option value={5}>5 games</option>
//                         <option value={10}>10 games</option>
//                         <option value={15}>15 games</option>
//                         <option value={20}>20 games</option>
//                         <option value={30}>30 games</option>
//                     </select>
//                 </div>
//                 <button
//                     type="submit"
//                     className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
//                 >
//                     Show History
//                 </button>
//             </div>
//         </form>
//     );
// };

// export default GameHistoryForm;