import { useEffect, useState, useRef } from "react";
import Link from "next/link"
import { useRouter } from "next/router";
import { useAuth } from "../../../context/auth"
import SettingsIcon from '@mui/icons-material/Settings';
import { motion, useTransform, useMotionValue } from "framer-motion"
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { Bars3Icon } from "@heroicons/react/20/solid"
import { useMediaQuery } from "../../../hooks/useMediaQuery";

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
  // isMedium ?
  // {
  //   openContainer: {
  //     position: "initial",
  //     width: "calc(100% / 6)",
  //     height: "100vh",
  //     backgroundColor: ["#7e22ce", "#000"],
  //     borderRadius: "0 0 1rem 0",
  //   },
  //   closedContainer: {
  //     position: "initial",
  //     width: "calc(100% / 6)",
  //     height: "100vh",
  //     borderRadius: "0 0 1rem 0",

  //   },
  //   open: {
  //     display: "flex",
  //     opacity: 1,
  //     transition: {
  //       duration: 1
  //     }
  // },
  // }
  // :
  {
    openContainer: {
      width: "15rem",
      height: "90vh",
      backgroundColor: ["#BA30E5", "#131128"],
      borderRadius: "0 0 1rem 0",
      transition: {
        duration: 1
      },
    },
    closedContainer: {
      width: "3rem",
      height: "3rem",
      borderRadius: "0 0 1rem 0",
      transition: {
        duration: 1,
        borderRadius: {
          duration: 1
        }
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
      color: "#7e22ce",
      rotate: 360,
      transition: {
        duration: 1
      }
    },
    closeIcon: {
      color: "rgb(255,255,255)",
      rotate: 180,
      right: ".25rem",
      transition: {
        duration: 1
      }
    }
  };


  return (
    <motion.div
      variants={sidebar}
      // initial={false}

      initial={window.matchMedia("(min-width:600px)").matches ? { height: "100vh", width: "15%", backgroundColor: "#1A1735" } : { height: "3rem", width: "3rem", backgroundColor: "#BA30E5" } }
      animate={!window.matchMedia("(min-width:600px)").matches ?  (open ? "openContainer" : "closedContainer") : { height: "100vh", width: "15%", backgroundColor: "#1A1735" }}
      // custom={whidth}
      ref={refContainer}
      className={`fixed z-30 rounded-[0_0_1rem_0] left-0 top-0 shadow-sm shadow-[#000000] `}
    >
      <motion.div
        variants={sidebar}

        initial={ window.matchMedia("(min-width:600px)").matches && { display: "flex", rotate: 180, right: ".25rem", top: ".25rem" }}
        animate={(open  ? "openIcon" : "closeIcon")}
        className="origin-center text-white rotate-180 absolute h-max w-max max-w-max z-10 "
      >
        <Bars3Icon 
          onClick={() => { setOpen(!open) }}
          alt="menu open"
          className="md:hidden h-10"
        />
      </motion.div>
      <motion.div
        variants={sidebar}
        initial={window.matchMedia("(min-width:600px)").matches || isMedium ?  { display: "flex", opacity: 1 } :{ display: "none", opacity: 0 } }
        animate={!window.matchMedia("(min-width:600px)").matches ? (open  ? "open" : "closed") : "open"}
        className=" flex  flex-col h-full left-0 overflow-hidden rounded-br-2xl mr-[1px] mb-[1px] pt-10 w-full "
      >
        {user &&
          <div className="flex gap-9">
            <p className="flex items-start text-sm font-semibold pl-2">Welcome  {`${user?.displayName}`}</p>
          </div>
        }
        <ul className="flex h-full flex-col items-start mt-5 overflow-y-auto overflow-x-hidden scrollbar">

          <hr className=" h-[1px] bg-slate-300 border-[1px] w-full" />
          <Link href="/teams" passHref>
            <li className={` cursor-pointer flex w-full h-12 text-[1rem] font-medium items-center pl-4 ${router.asPath.split("?")[0] === "/teams" ? "bg-[#F2EBFE] text-[#7e22ce]" : null}`}>
              <a>Teams</a>
            </li>
          </Link>
            <Link href="/projects" passHref>
              <li className={`cursor-pointer flex w-full h-12 text-[1rem] font-medium items-center pl-4 ${router.asPath.split("?")[0] === "/projects" ? "bg-[#F2EBFE] text-[#7e22ce]" : null}`} >
                <a>Projects</a>
              </li>
            </Link>

          <li className={`cursor-pointer flex w-full h-12 text-[1rem] font-medium items-center pl-4 ${router.asPath.split("?")[0] === "/setting" ? "bg-[#F2EBFE] text-[#7e22ce]" : null}`}>
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
        <p className=" flex items-end justify-center text-sm border-b-[1px] mb-5 font-bold text-white" >Mate Protocol</p>
      </motion.div>
    </motion.div>

  );
};

export default Menu;
