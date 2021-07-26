import React from "react";
import Head from "next/head";
import { Theme, makeStyles, createStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Typography from "@material-ui/core/Typography";
import Link from "../components/Link";
import axios from "axios";
import jsPDF from "jspdf";
import { Volumen, Volumenes, MangadexHome, Manga, Cover } from "../components/Manga";

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

  const doc = new jsPDF();
  const baseUrl: string = "https://api.mangadex.org";
  let nombreVolumenes: string[] = [];

  async function getBase64(url: string): Promise<string> {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
    });
    return Buffer.from(response.data, "binary").toString("base64");
  }

  async function obtenerVolumen(volumen: string, idManga: string): Promise<Volumen | void> {
    const v: Volumen = await (await axios.get(baseUrl + `/chapter?manga=${idManga}&translatedLanguage[]=en&volume[]=${volumen}&limit=100`)).data;
    console.log(v.results[0].data.attributes.hash);
    return v;
  }

  async function obtenerNumeroVolumenes(idManga: string): Promise<number | void> {
    const v: Volumenes = await (await axios.get(baseUrl + `/manga/${idManga}/aggregate?&translatedLanguage[]=en`)).data;
    nombreVolumenes = Object.keys(v.volumes);
    console.log(Object.keys(v.volumes).toString());
    return Object.keys(v.volumes).length;
  }

  async function addImageToPDF(url: string) {
    const imgData: string = "data:image/jpeg;base64" + (await getBase64(url));
    doc.addImage(imgData, "JPEG", 0, 0, 210, 297);
  }

  async function addCoverToPDF(mangaId: string, coverName: string) {
    const imgData: string = "data:image/jpeg;base64," + (await getBase64(`https://uploads.mangadex.org/covers/${mangaId}/${coverName}`));
    doc.addImage(imgData, "JPEG", 0, 0, 210, 297);
  }

  async function getImgUrl(chaperId: number, chapeterHash: string, data: string): Promise<string> {
    const v: MangadexHome = await axios.get(baseUrl + `/at-home/server/${chaperId}`);
    return `${v.baseUrl}/data/${chapeterHash}/${data}`;
  }

  async function getMangaCoverName(mangaId: string): Promise<string> {
    const v: Manga = await (await axios.get(baseUrl + `/manga/${mangaId}`)).data;
    const coverId = v.relationships.find((e) => e.type === "cover_art")?.id;
    const vv: Cover = await (await axios.get(baseUrl + `/cover/${coverId}`)).data;
    return vv.data.attributes.fileName;
  }

  async function getMangaName(mangaId: string): Promise<string> {
    const v: Manga = await (await axios.get(baseUrl + `/manga/${mangaId}`)).data;
    console.log(Object.values(v.data.attributes.title)[0]);
    return Object.values(v.data.attributes.title)[0];
  }

  async function Descargar(idManga: string) {
    addCoverToPDF(idManga, await getMangaCoverName(idManga));
    for (let index = 0; index < (await obtenerNumeroVolumenes(idManga)); index++) {}

    doc.save((await getMangaName(idManga)) + ".pdf");
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
          <button type="submit" onClick={(e) => Descargar("62b74aa6-24df-4b91-b76d-39e7ab3c3ca5")}>
            Descargar
          </button>
        </div>
      </main>
    </React.Fragment>
  );
}

export default Home;
