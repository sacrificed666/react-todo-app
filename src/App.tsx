import Toaster from "@/components/feedback/Toaster/Toaster";
import Backdrop from "@/components/layout/Backdrop/Backdrop";
import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import Main from "@/components/layout/Main/Main";
import { usePointerLight } from "@/hooks/usePointerLight";

import styles from "./App.module.scss";

const App = () => {
  usePointerLight();

  return (
    <div className={styles.app}>
      <Backdrop />
      <Header />
      <Main />
      <Footer />
      <Toaster />
    </div>
  );
};

export default App;
