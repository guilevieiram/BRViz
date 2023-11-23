export default function Home({openModal}){
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center text-center bg-center bg-[url('../background.jpg')]">
      <h1 className="text-bold text-8xl py-10 text-gray-700">BRAZIL</h1>
      <h2 className="text-2xl italic text-gray-500">Visualizing export data from the country from 1997 til today</h2>
      <button 
        onClick={openModal}
        className="w-fit my-20 text-2xl py-4 px-8 rounded-lg text-white bg-indigo-700 hover:scale-105 transition-transform"
      >Explore</button>
    </div>
  )
}
