import ListNav from "@/components/todo/ListNav/ListNav";
import Overview from "@/components/todo/Overview/Overview";

import styles from "./Sidebar.module.scss";

const Sidebar = () => (
  <aside className={styles.sidebar}>
    <ListNav />
    <Overview />
  </aside>
);

export default Sidebar;
