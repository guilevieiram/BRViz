export default function Home({openModal}){
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-bold text-8xl py-10">View Brazil</h1>
      <h2 className="text-2xl pb-4">Visualizing import/export data from the country from 1970 to today.</h2>
      <button 
        onClick={openModal}
        className="w-fit my-20 text-2xl py-4 px-8 rounded-lg bg-indigo-400 hover:scale-105 transition-transform"
      >Explore</button>
    </div>
  )
}
