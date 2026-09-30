import Toaster from "@/components/feedback/Toaster/Toaster";
import Backdrop from "@/components/layout/Backdrop/Backdrop";
import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import Main from "@/components/layout/Main/Main";
import Sidebar from "@/components/layout/Sidebar/Sidebar";
import { usePointerLight } from "@/hooks/usePointerLight";
import { useThemeSync } from "@/hooks/useThemeSync";

import styles from "./App.module.scss";

const App = () => {
  usePointerLight();
  useThemeSync();

  return (
    <div className={styles.app}>
      <Backdrop />
      <Header />
      <div className={styles.body}>
        <Sidebar />
        <Main />
      </div>
      <Footer />
      <Toaster />
    </div>
  );
};

export default App;
