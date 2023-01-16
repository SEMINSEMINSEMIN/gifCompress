// https://github.com/jnordberg/gif.js/issues/115
import { useEffect, useState, useRef } from "react";
import GIF from "gif.js.optimized";
import "gifler";
import QQ from "./assets/gif/giphy.gif";

function App() {
    const [output, setOutput] = useState();
    const [isAlluploaded, setIsAlluploaded] = useState(false);
    const compCanv = useRef([]);
    useEffect(() => {
        window.gifler(QQ).get((a) => {
            const lastFrameIndex = a["_frames"].length - 1;
            a["_frames"].forEach((frame, i) => {
                const canvas = window.gifler.createBufferCanvas(
                    frame,
                    frame.width,
                    frame.height
                );
                let resizedCanvas;

                const img = new Image();
                img.addEventListener(
                    "load",
                    () => {
                        resizedCanvas = document.createElement("canvas");
                        const MAX_WIDTH = 200;
                        const scaleSize = MAX_WIDTH / frame.width;
                        resizedCanvas.width = MAX_WIDTH;
                        resizedCanvas.height = frame.height * scaleSize;

                        const ctx = resizedCanvas.getContext("2d");
                        ctx.drawImage(
                            img,
                            0,
                            0,
                            resizedCanvas.width,
                            resizedCanvas.height
                        );
                        compCanv.current = [...compCanv.current, resizedCanvas];
                        if (i === lastFrameIndex) {
                            setIsAlluploaded(true);
                        }
                        document.body.append(resizedCanvas);
                    },
                    false
                );
                img.src = canvas.toDataURL();
            });
        });
    }, []);

    useEffect(() => {
        if (isAlluploaded) {
            const gif = new GIF({
                workers: 2,
                workerScript: process.env.PUBLIC_URL + "/gif.worker.js",
                quality: 10,
                // background: "#fff",
                transparent: 0x00000000
            });

            const exportCuts = async () => {
                const resizedCanvas = compCanv.current;
                resizedCanvas.forEach((canvas) => {
                    gif.addFrame(canvas, { delay: 150, copy: true });
                });

                gif.on("finished", async (blob) => {
                    const url = URL.createObjectURL(blob);
                    setOutput(url);
                    const file = new File([blob], "흑흑.gif", {
                        type: "image/gif",
                    });
                    const formData = new FormData();
                    formData.append("image", file);

                    const serverUrl = "https://mandarin.api.weniv.co.kr/";
                    const res = await fetch(serverUrl + "image/uploadfile", {
                        method: "POST",
                        body: formData
                    });
                    const json = await res.json();
                    console.log(json);
                });

                gif.render();
            };

            exportCuts();
        }
    }, [isAlluploaded]);

    return <img style={{width: "480px", height: "480px", objectFit: "contain"}} src={output} alt="gif 재합성" />;
}
export default App;
