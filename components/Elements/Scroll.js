import { ref } from "firebase/database";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import ComponentButton from "../Elements/ComponentButton"
import useWindowDimensions from "../../hooks/useMediaQuery"


const ScrollButtons = ({ children }) => {
  const [scroll, setScroll] = useState(0)
  const { width } = useWindowDimensions()
  const [scrollLeft, setScrollLeft] = useState()
  const [scrollRight, setScrollRight] = useState()
  const refBox = useRef()
  const refContainer = useRef()
  const handlerScroll = () => {
    if (refContainer.current.scrollLeft > 0) {
      setScrollLeft(true)
    } else {
      setScrollLeft(false)
    }
    if (Math.round(refContainer?.current?.scrollLeft) == refContainer.current.scrollWidth - refContainer.current.clientWidth) {
      setScrollRight(false)
    } else {
      setScrollRight(true)
    }
  }


  return (
    <div className="flex w-full px-2 justify-center gap-4">
      {
        width <= refContainer?.current?.offsetWidth &&
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-l-lg ${scrollLeft ? "bg-slate-400" : "bg-slate-200"}`}
          onClick={() => {
            refContainer.current.scrollLeft = refContainer?.current?.scrollLeft - refContainer?.current?.offsetWidth
          }}

        >
          <ComponentButton
            isBack
            buttonStyle={`border-none rounded`}
          />
        </div>
      }


      <motion.div
        ref={refContainer}
        onScroll={() => {
          handlerScroll()
        }}
        animate={{
          scroll: scroll
        }}
        className="flex py-1 w-max gap-4 overflow-auto scrollbar"
      >
        {
          children.map(button => button)
        }
      </motion.div>
      {
        width <= refContainer?.current?.offsetWidth &&
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-r-lg ${scrollRight ? "bg-slate-400" : "bg-slate-200"} w-min`}
          onClick={() => {
            refContainer.current.scrollLeft = refContainer.current.scrollLeft + refContainer.current.offsetWidth
          }}
        >
          <ComponentButton
            isBack
            buttonStyle="w-8 rotate-180 border-none"
          />
        </div>
      }
    </div>

  );
};

export default ScrollButtons;