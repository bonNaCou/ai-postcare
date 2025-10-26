import {
    getAuth,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
  } from "firebase/auth";
  import { app, db } from "@/lib/firebaseConfig";
  import { doc, setDoc, serverTimestamp } from "firebase/firestore";
  
  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();
  const facebookProvider = new FacebookAuthProvider();
  
  async function saveUser(user: any, provider: string) {
    await setDoc(
      doc(db, "patients", user.uid),
      {
        email: user.email,
        name: user.displayName || "Anonymous",
        provider,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
  
  export const loginWithGoogle = async () => {
    const res = await signInWithPopup(auth, googleProvider);
    const user = res.user;
    await saveUser(user, "google");
    return user;
  };
  
  export const loginWithFacebook = async () => {
    const res = await signInWithPopup(auth, facebookProvider);
    const user = res.user;
    await saveUser(user, "facebook");
    return user;
  };
  
  export const loginWithEmail = async (email: string, password: string) => {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    await saveUser(user, "email");
    return user;
  };
  
  export const registerWithEmail = async (email: string, password: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await saveUser(user, "email");
    return user;
  };
  
  export const logout = async () => signOut(auth);