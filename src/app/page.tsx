import Header from "@/components/layout/Header";
import Hero from "@/components/home/Hero";
import Popular from "@/components/home/Popular"; // Importe aqui
import styles from "./page.module.css";
import Categories from "@/components/home/Categories";
import Benefits from "@/components/home/Benefits";
import CTA from "@/components/home/CTA";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className={styles.main}>
      <Header />
      <Hero />
      <Popular /> {/* Adicione aqui */}
      <Categories/>
      <Benefits/>
      <CTA/>
      <Footer/>
      {/* Próximas sessões... */}
    </main>
  );
}