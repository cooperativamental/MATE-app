import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../context/auth";

export const RouteGuard = ({ children }) => {

  const { user } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // on initial load - run auth check
    authCheck(router.pathname);
    // on route change start - hide page content by setting authorized to false
    const hideContent = () => setAuthorized(false);
    router.events.on("routeChangeStart", hideContent);

    // on route change complete - run auth check
    router.events.on("routeChangeComplete", authCheck);

    // unsubscribe from events in useEffect return function
    return () => {
      router.events.off("routeChangeStart", hideContent);
      router.events.off("routeChangeComplete", authCheck);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router]);

  const authCheck = (url) => {
    // redirect to login page if accessing a private page and not logged in
    const publicPaths = ["/login", "/register", "/", "/resetPass", "/example", "/checkout/[prjID]", "/ejemplo-pago/qr"];
    // const privatesPaths = ["/admin/transferences", "/admin/project", "/admin/createclient",  "/admin/currencyconversion"];
    const path = url.split("?")[0];
    if (!user) {
      if (path === "/") {
        setAuthorized(true);
      } 
      else if (publicPaths.includes(router.route)) {
        setAuthorized(true);

      } 
      else {
        
        setAuthorized(false);
        router.push({
          pathname: "/login",
          query: { returnUrl: url },
        });
      }
    } else {
      if (path?.split("/")[1] === "login" || path?.split("/")[1] === "register") {
        setAuthorized(false);
        router.push({
          pathname: "/teams",
        });
      }
      // else if (path.split("/")[1] === "admin") {
      //   if (user?.priority !== "ADMIN") {
      //     setAuthorized(false);
      //     router.push({
      //       pathname: "/groups",
      //     });
      //   } else {
      //     setAuthorized(true);
      //   }
      // } 
      else if (publicPaths?.includes(router.route) && router.query.returnUrl) {
        setAuthorized(false);
        router.push(router.query.returnUrl);
      }

      else {
        setAuthorized(true);
      }
    }

  };

  return (authorized && children);
};
