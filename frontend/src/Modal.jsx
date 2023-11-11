import { useState, useRef, useEffect } from "react"
import { useNavigate } from 'react-router-dom';
import { AiOutlineHome, AiOutlineClose } from "react-icons/ai"

const IconButton = ({children, onClick}) => (
  <div onClick={onClick} className="p-4 cursor-pointer hover:scale-105 transition-transform">
    {children}
  </div>
)


export default function Modal ({isOpen, onClose, routes}) {
  if (!isOpen) return null;

  const navigate = useNavigate();
  const goTo = route => () => {
    navigate(route);
    onClose();
  }

  // handling closing on outside clic
  const outerDivRef = useRef(null);
  const innerDivRef = useRef(null);
  const outerClick = () => onClose();
  useEffect(() => {
    const handleClick = event => {
      if (innerDivRef.current && innerDivRef.current.contains(event.target)) 
        return
      if (outerDivRef.current && outerDivRef.current.contains(event.target))
        outerClick()
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div 
      ref={outerDivRef}
      className="z-50 absolute w-screen h-screen m-auto flex justify-center bg-gray-900 bg-opacity-90"
    >
      <div 
        ref={innerDivRef}
        className={`
          h-full w-full max-w-screen-lg bg-indigo-950 text-white 
          flex flex-col align-center
          p-12
        `}
      >
        {/* Navigation */}
        <div className="w-full flex flex-row justify-between items-center mb-8">
          <IconButton onClick={goTo("/")}>
            <AiOutlineHome size={24}/>
          </IconButton>
          <IconButton onClick={onClose}>
            <AiOutlineClose size={24} />
          </IconButton>
        </div>
        
        {/* Galery */}
        <div className="w-full text-center p-12">
          {
            routes.map(({path, name, description}, idx) => (
              <div className="m-auto" key={idx}>
                <p 
                  className="py-2 my-12 mx-8 border-b text-xl cursor-pointer"
                  onClick={goTo("/" + path)}
                >{name}</p>
              </div>
            )) 
          }
        </div>

      </div>
    </div>
  );
} 
