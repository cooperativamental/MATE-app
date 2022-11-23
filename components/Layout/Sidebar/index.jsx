import { useEffect, useState, useRef } from "react";
import Link from "next/link"
import { useRouter } from "next/router";

import { useAuth } from "../../../context/auth"
import { motion } from "framer-motion"
import { Bars3Icon } from "@heroicons/react/20/solid"
import { useMediaQuery } from "../../../hooks/useMediaQuery";

import LogoMate from "../../../public/mate.svg"
import LogoMateJS from "../../../public/mate.js"


const Menu = ({ openMenu, closeSideBar }) => {
  const router = useRouter()
  const isMedium = useMediaQuery("(min-width:600px)")
  const refContainer = useRef()

  const {
    user,
    logout
  } = useAuth();
  const [open, setOpen] = useState(false)

  const logOut = async () => {
    await logout();
    console.log("logged out");
  }


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (refContainer.current && !refContainer.current.contains(event.target)) {
        setOpen(false)
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [refContainer]);

  const sidebar =
  {
    openContainer: {
      width: "15rem",
      height: "90vh",
      top: 0,
      backgroundColor: ["#3BB89F", "#131128"],
      borderRadius: "0 0 1rem 0",
      transition: {
        duration: 1,
      },
    },
    closedContainer: {
      width: "3rem",
      height: "1.5rem",
      transition: {
        duration: 1,
      },
    },
    open: {
      display: "flex",
      opacity: 1,
      transition: {
        duration: 1
      }
    },
    closed: {
      opacity: 0,
      transition: {
        duration: 1,
        opacity: {
          duration: 0.5
        }
      },
      transitionEnd: {
        display: "none",
      },
    },
    openIcon: {
      color: "rgb(255,255,255)",
      right: 0,
      rotate: 360,
      transition: {
        duration: 1,
        right: 2
      }
    },
    closeIcon: {
      color: "#7e22ce",
      rotate: 180,
      transition: {
        duration: 1
      }
    }
  };


  return (
    <motion.div
      variants={sidebar}
      // initial={false}

      initial={window.matchMedia("(min-width:600px)").matches ? { height: "100vh", width: "15%", backgroundColor: "#1A1735" } : { height: "1.5rem", width: "3rem", backgroundColor: "#3BB89F" }}
      animate={!window.matchMedia("(min-width:600px)").matches ? (open ? "openContainer" : "closedContainer") : { height: "100vh", width: "15%", backgroundColor: "#1A1735" }}
      // custom={whidth}
      ref={refContainer}
      className={`${(window.matchMedia("(min-width:600px)").matches && isMedium) ? "static" : "fixed"}  z-30 left-0 top-3 shadow-sm shadow-[#000000] `}
    >
      <motion.div
        variants={sidebar}

        initial={window.matchMedia("(min-width:600px)").matches && { display: "flex", rotate: 180, top: ".25rem" }}
        animate={(open ? "openIcon" : "closeIcon")}
        className="flex items-center text-white right-1/4 rotate-180 absolute h-max w-max max-w-max z-10 "
      >
        <Bars3Icon
          onClick={() => { setOpen(!open) }}
          alt="menu open"
          className="md:hidden h-5"
        />
      </motion.div>
      <motion.div
        variants={sidebar}
        initial={window.matchMedia("(min-width:600px)").matches || isMedium ? { display: "flex", opacity: 1 } : { display: "none", opacity: 0 }}
        animate={!window.matchMedia("(min-width:600px)").matches ? (open ? "open" : "closed") : "open"}
        className=" flex  flex-col h-full left-0 overflow-hidden rounded-br-2xl mr-[1px] mb-[1px] w-full "
      >
        {
          user &&
          <div className="flex items-center justify-center h-20 w-full rounded-b-full bg-back-color gap-9">
            <LogoMateJS rightLogo="white"/>
            {/* <p className="flex items-start text-sm font-semibold pl-2">Welcome  {`${user?.displayName}`}</p> */}
          </div>
        }
        <ul className="flex h-full flex-col items-start mt-5 overflow-y-auto overflow-x-hidden scrollbar">
          <hr className=" h-[1px] bg-back-color border-[1px] w-full border-rose-color" />
          <Link href="/teams" passHref>
            <li className={` cursor-pointer flex w-full h-12 text-[1rem] font-medium items-center pl-4 hover:bg-rose-color
            ${router.asPath.split("?")[0] === "/teams" ? "bg-rose-color text-back-color" : null}`}>
              <a>Teams</a>
            </li>
          </Link>
          <Link href="/projects" passHref>
            <li className={`cursor-pointer flex w-full h-12 text-[1rem] font-medium items-center pl-4 hover:bg-rose-color
            ${router.asPath.split("?")[0] === "/projects" ? "bg-rose-color text-back-color" : null}`} >
              <a>Projects</a>
            </li>
          </Link>

          <li className={`cursor-pointer flex w-full h-12 text-[1rem] font-medium items-center pl-4 hover:bg-rose-color
          ${router.asPath.split("?")[0] === "/setting" ? "bg-rose-color text-back-color" : null}`}>
            <button
              onClick={() => { router.push("/setting") }}
            >
              Setting
            </button>
          </li>

          <li className="flex h-12 text-[1rem] font-medium items-center pl-4">
            <button
              onClick={() => {
                logOut()
              }}>Sign Out</button>
          </li>
        </ul>
        <p className=" flex items-end justify-center text-sm border-b-[1px] h-10 bg-back-color mb-5 font-bold text-white" >Mate Protocol</p>
      </motion.div>
    </motion.div>

  );
};

export default Menu;
