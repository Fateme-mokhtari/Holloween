import { getAllHouses } from "@/lib/apiHouses";
import styles from "./page.module.css";


export default async function Home() {
  const houses = await getAllHouses();
  console.log({ houses });

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        test
        {/* <ul>
        {houses.map((house) => {
          return (
            <li key={house.id}>
              <h2>{house.number} - {house.address}</h2>
            </li>
          );
        })}
     </ul> */}
      </main>
    </div>
  );
}
