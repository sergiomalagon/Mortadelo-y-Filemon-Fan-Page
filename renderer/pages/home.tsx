import React from "react";
import Head from "next/head";
import { Theme, makeStyles, createStyles } from "@material-ui/core/styles";
import axios from "axios";
import jsPDF from "jspdf";
import MFA from "mangadex-full-api";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      textAlign: "center",
      paddingTop: theme.spacing(4),
    },
    main: {
      backgroundImage: "url(/images/bg.jpg)",
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundRepeat: "true",
    },
    dowloader: {
      display: "flex",
      position: "absolute",
      flexDirection: "column",
      alignItems: "center",
    },
    text: {
      color: "blue",
      fontWeight: 900,
      textDecoration: "underline",
    },
  })
);

function Home() {
  const classes = useStyles({});
  let doc = null;
  let lasChapterFetched: number = 0;
  let numChapterFetched: number = 0;
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  async function getBase64(url: string): Promise<string> {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
    });
    return Buffer.from(response.data, "binary").toString("base64");
  }

  async function obtenerVolumen(volumen: string, idManga: string): Promise<MFA.Chapter[]> {
    const v: MFA.Chapter[] = await MFA.Chapter.search({ manga: idManga, limit: 100, translatedLanguage: ["en"], volume: `${volumen}` });
    console.log("obtenerVolumen", v);
    return v;
  }

  async function obtenerNombreVolumenes(idManga: string): Promise<string[]> {
    const manga: Object = await (await MFA.Manga.get(idManga)).getAggregate("en");
    console.log("obtenerNombreVolumenes", manga);
    return Object.keys(manga);
  }

  async function addImageToPDF(url: string) {
    const imgData: string = "data:image/jpeg;base64," + (await getBase64(url));
    doc.addImage(imgData, "PNG", 0, 0, 210, 297);
    doc.addPage();
  }

  async function getChapterImgUrls(chaperts: MFA.Chapter[], numeroCap: number): Promise<string[]> {
    return await chaperts[numeroCap].getReadablePages(false);
  }

  async function getMangaCoverName(mangaId: string): Promise<string> {
    const cover: MFA.Cover = await MFA.Cover.get((await MFA.Manga.get(mangaId)).mainCover.id);
    console.log("getMangaCoverName", cover.imageSource);
    return cover.imageSource;
  }

  async function getMangaName(mangaId: string): Promise<string> {
    const manga: MFA.Manga = await MFA.Manga.get(mangaId);
    console.log("getMangaName", manga);
    return manga.title;
  }

  async function Descargar(idManga: string) {
    new Notification("MORTADELO Y FILEMON", { body: "LA DESCARGA A COMENZADO" });
    const nombreVolumenes: string[] = await obtenerNombreVolumenes(idManga);
    const mangaName: string = await getMangaName(idManga);
    console.log("ENTRA EN EL BUCLE");
    for (let i = 0; i < nombreVolumenes.length; i++) {
      doc = new jsPDF();
      await addImageToPDF(await getMangaCoverName(idManga));
      const volumen: MFA.Chapter[] = await obtenerVolumen(nombreVolumenes[i], idManga);
      console.log("ARRAY CAPITULOS", volumen);
      console.log("OBTENTO UN VOLUMEN DE SIZE", nombreVolumenes.length);

      for (let k = 0; k < volumen.length; k++) {
        if (volumen[k].chapter === lasChapterFetched) {
          continue;
        } else {
          lasChapterFetched = volumen[k].chapter;
        }
        const imgURL: string[] = await getChapterImgUrls(volumen, k);
        console.log("SIZE VOLUMEN", volumen.length);
        console.log("ARRAY URL", imgURL);
        for (let j = 0; j < imgURL.length; j++) {
          await addImageToPDF(imgURL[j]);
          console.log("ADD IMAGEN TO PDF");
        }
        if (numChapterFetched <= 59) {
          numChapterFetched++;
        } else {
          console.log('LIMITE FETCHED ALCANZADO, ESPERANDO');
          await delay(60000);
          numChapterFetched = 0;
        }
      }
      doc.save(`${mangaName} | Volumen - ${i} |.pdf`);
    }
    new Notification("MORTADELO Y FILEMON", { body: "LA DESCARGA A FINALIZADO" });
  }

  return (
    <React.Fragment>
      <Head>
        <title>Mortadelo y Filemon Fan Page</title>
      </Head>
      <main className={classes.main}>
        <div className={classes.dowloader}>
          <label htmlFor="name" className={classes.text}>
            URL de mangadex
          </label>
          <input type="text" name="name" id="name" required />
          <button type="submit" onClick={(e) => Descargar("0aea9f43-d4a9-4bf7-bebc-550a512f9b95")}>
            Descargar
          </button>
        </div>
      </main>
    </React.Fragment>
  );
}

export default Home;
