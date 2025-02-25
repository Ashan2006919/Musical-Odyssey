import React from 'react';
import Link from 'next/link';
import styles from './Home.module.css';

const Home = () => {
  return (
    <div className={styles.home}>
      <h1 className={styles.title}>Welcome to Album Ratings</h1>
      <p className={styles.description}>
        Manage your album ratings and discover new music!
      </p>
      <div className={styles.links}>
        <Link href="/login" className={styles.link}>
          Login
        </Link>
        <Link href="/register" className={styles.link}>
          Register
        </Link>
      </div>
    </div>
  );
};

export default Home;