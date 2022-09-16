
import { initializeApp } from "firebase/app";
import { getFirestore,doc,setDoc,addDoc } from "firebase/firestore";


export const addRow = function(collection,data) {
    const fireStore = getFirestore();
    if (!collection) return;
    addDoc(collection,data)
      .then(function(docRef) {
          console.log("Insights have been sent to firebase.", docRef.id);
      })
      .catch(function(error) {
          console.error("There was an error while storing insights in db.", error);
      });

}

export const fireMeUp = function(config) {
    const firebaseConfig = {
        apiKey: "AIzaSyB4c2MpnoiZhJizIvFOtUx51bLsYzvfwEg",
        authDomain: "pagespeed-1661338628005.firebaseapp.com",
        projectId: "pagespeed-1661338628005",
        storageBucket: "pagespeed-1661338628005.appspot.com",
        messagingSenderId: "688588910702",
        appId: "1:688588910702:web:dd7837c5c1deb880a4767f",
        measurementId: "G-RHGWN57WZ2"
      };
      let app = initializeApp(firebaseConfig);
      return app;
}