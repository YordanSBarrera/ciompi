import dbconnect from './db/dbconnect';

export default function Home() {
  dbconnect();
  return <>Hola</>;
}
