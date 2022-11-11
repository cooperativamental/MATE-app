import { createContext, useContext, useEffect, useState } from "react";

import { useAuth } from "./auth";

import {
  getDatabase,
  get,
  query,
  ref,
  onValue,
  orderByValue,
  update,
  limitToLast
} from "firebase/database";

const NotificationContext = createContext({
  notification: [],
  lastNotification: [],
});

const NotiProvider = ({ children }) => {
  const [notification, setNotification] = useState({});
  const [lastNotification, setLastNotification] = useState([]);
  const { user } = useAuth();
  const db = getDatabase();
  useEffect(() => {
    if (user) {
      const unsub = onValue(query(ref(db, `notifications/${user?.uid}/`), orderByValue("createdAt"), limitToLast(1)),
        (res => {
          if (res.hasChildren()) {
            if (Object.values(res.val()).find(noti => noti.showCard === false)) {
              setLastNotification(res.val())
            } else {
              setLastNotification()
            }
            setTimeout(() => {
              lastNotification &&
                Object.entries(res.val()).forEach(([key, value]) => {
                  if (!value.showCard) {
                    update(ref(db, `notifications/${user.uid}/${key}`), { showCard: true });
                  }
                },
                );
            }, 4000);
          }
        })
      )



      const unsubscribe = onValue(query(ref(db, `notifications/${user?.uid}/`)), (snapshot) => {
        const resValue = snapshot.val();
        if (snapshot.hasChildren()) {
          // let objLastNoti = {};
          // const filterNewNoti = Object.entries(resValue).filter((keyNewNoti, valueNewNoti) => {
          //     if(Object.keys(notification).find(noti => noti === keyNewNoti)){
          //         return {[keyNewNoti]: valueNewNoti}
          //     }
          // } )
          // Object.entries(resValue).forEach(([key, noti]) => {
          //   if (noti.showCard === false) {
          //     objLastNoti = { [key]: noti };
          //   }
          // });
          // setLastNotification(objLastNoti);
          // setTimeout(() => {
          //   Object.entries(objLastNoti).forEach(([key, value]) => {
          //     if (!value.showCard) {
          //       update(ref(db, `notifications/${user.uid}/${key}`), { showCard: true });
          //     }
          //   },
          //   );}, 5000);

          setNotification(resValue);
        } else {
          setNotification({});
        }
      });

      return () => {
        unsub()
        unsubscribe();
      };
    }
  }, [user]);
  return (
    <NotificationContext.Provider value={{ notification, lastNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

const useNotification = () => useContext(NotificationContext);

export { NotiProvider, useNotification };
