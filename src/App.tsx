import Header from "./components/layout/Header/Header";
import Main from "./components/layout/Main/Main";
import Footer from "./components/layout/Footer/Footer";
import styles from "./App.module.scss";

const App = () => {
  return (
    <div className={styles.layout}>
      <Header />
      <Main />
      <Footer />
    </div>
  );
};

export default App;
