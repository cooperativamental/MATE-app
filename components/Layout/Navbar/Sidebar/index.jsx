import { useEffect, useState, useRef } from "react";
import Link from "next/link"
import { useRouter } from "next/router";
import { useAuth } from "../../../../context/auth"
import SettingsIcon from '@mui/icons-material/Settings';
import { motion, useTransform, useMotionValue } from "framer-motion"
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { width } from "@mui/system";

const Menu = ({ openMenu, closeSideBar }) => {
  const router = useRouter()
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

  const sidebar = {
    openContainer: {
      width: "15rem",
      height: "75vh",
      backgroundColor: ["#7e22ce", "#000"],
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
    open: (width) => {
      return ({
        display: "flex",
        opacity: 1,
        transition: {
          duration: 1
        }
      })
    },
    closed: () => {
      return ({
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
      })
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
      initial={{ height: "3rem", width: "3rem" }}
      animate={open ? "openContainer" : "closedContainer"}
      // custom={whidth}
      ref={refContainer}
      className="fixed z-30 rounded-[0_0_1rem_0] left-0 top-0 shadow-sm shadow-[#000000] bg-[#7e22ce]"
    >
      <motion.div
        variants={sidebar}
        initial={{ display: "flex", rotate: 180, right: ".25rem", top: ".25rem" }}
        animate={open ? "openIcon" : "closeIcon"}
        className="origin-center text-white rotate-180 absolute h-max w-max max-w-max z-10 "
      >

        <MenuOpenIcon onClick={() => { setOpen(!open) }} alt="menu open" sx={{ fontSize: "2.5rem" }} />
      </motion.div>
      <motion.div
        variants={sidebar}
        initial={{ display: "none", opacity: 0 }}
        animate={open ? "open" : "closed"}
        className=" flex  flex-col h-full left-0 overflow-hidden rounded-br-2xl mr-[1px] mb-[1px] pt-10 w-full "
      >
        {user &&
          <div className="flex gap-9">
            <p className="whitespace-nowrap flex items-start text-lg font-semibold pl-4">Welcome  {`${user?.displayName}`}</p>
            <div className="flex  items-end">

              <SettingsIcon onClick={() => { router.push("/updateUser") }} alt="menu open" color="white" />
            </div>
          </div>
        }
        <ul className="flex h-full flex-col items-start mt-5 overflow-y-auto overflow-x-hidden scrollbar">

          <hr className=" h-[1px] bg-slate-300 border-[1px] w-full" />
          <Link href="/teams" passHref>
            <li className={` cursor-pointer flex w-full h-12 text-[1rem] font-medium items-center pl-4 ${router.asPath.split("?")[0] === "/teams" ? "bg-[#F2EBFE] text-[#7e22ce]" : null}`}>
              <a>Teams</a>
            </li>
          </Link>
          {/* <Link href="/wallet" passHref>
            <li className={`cursor-pointer flex w-full h-12 text-[1rem] font-medium items-center pl-4 ${router.asPath.split("?")[0] === "/wallet" ? "bg-[#F2EBFE] text-[#7e22ce]" : null}`}>
              <a>Wallet</a>
            </li>
          </Link> */}
          {/* <Link href="/createproject" passHref>
            <li className={`cursor-pointer flex w-full h-12 text-[1rem] font-medium items-center pl-4 ${router.asPath.split("?")[0] === "/createproject" ? "bg-[#F2EBFE] text-[#5A31E1]" : null}`}>
              <a>Create Project</a>
            </li>
          </Link> */}
          {/* { */}

            {/* //cambiar nombres de transferencia a liquidacion */}
            {/* user?.projectsOwner && Object.entries(user?.projectsOwner).length && */}
            <Link href="/adminprojects" passHref>
              <li className={`cursor-pointer flex w-full h-12 text-[1rem] font-medium items-center pl-4 ${router.asPath.split("?")[0] === "/adminprojects" ? "bg-[#F2EBFE] text-[#7e22ce]" : null}`} >
                <a>Admin Projects</a>
              </li>
            </Link>
          {/* } */}
          {/* {
            user?.priority === "ADMIN" &&
            <Link href="/admin/generalbalance" passHref>
              <li className={`cursor-pointer flex w-full h-12 text-[1rem] font-medium items-center pl-4 ${router.asPath.split("?", 1).join().split("/")[1] === "admin" ? "bg-[#F2EBFE] text-[#7e22ce]" : null}`} >
                <a>Administration</a>
              </li>
            </Link>
          } */}
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
