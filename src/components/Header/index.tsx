import React from "react";
import { Link, useLocation } from "react-router-dom";
import { navigationItems } from "../../config/routeConfig";
import styles from "./styles.module.css";

const Header: React.FC = () => {
  const location = useLocation();

  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <nav className={styles.navigation}>
          {navigationItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navLink} ${isActiveLink(item.path) ? styles.navLinkActive : ""}`}
              title={item.description}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
