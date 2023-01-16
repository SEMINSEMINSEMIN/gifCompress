// https://github.com/jnordberg/gif.js/issues/115
import { useEffect, useState } from "react";
import GIF from "gif.js.optimized";
import "gifler";
import QQ from "./assets/gif/run.gif";

function App() {
    const [output, setOutput] = useState();

    useEffect(() => {
        const gif = new GIF({
            workers: 2,
            workerScript: process.env.PUBLIC_URL + "/gif.worker.js",
            quality: 10,
        });

        window.gifler(QQ).get((a) => {
            const res = a["_frames"].map((frame) => {
                const canvas = window.gifler.createBufferCanvas(frame, frame.width, frame.height);
                document.body.append(canvas);
                return canvas;
            });

            const exportCuts = async () => {
                const cuts = res;

                cuts.forEach((canvas) => {
                    gif.addFrame(canvas, { delay: 100 });
                });

                gif.on("finished", async (blob) => {
                    console.log("blob:")
                    console.log(blob);
                    console.log("---------------");

                    const url = URL.createObjectURL(blob);
                    const file = new File([blob], "흑흑.gif", {
                        type: "image/gif",
                    });

                    console.log("blob to file:")
                    console.log(file);
                    console.log("---------------");
                    setOutput(url);

                    const formData = new FormData();
                    formData.append("image", file);

                    // https://velog.io/@josworks27/formData-console.log
                    for (let value of formData.values()) {
                        console.log("formdata에 file이 제대로 담겼는지 확인:")
                        console.log(value);
                        console.log("---------------");
                    }

                    const requestUrl = "https://mandarin.api.weniv.co.kr/";

                    const res = await fetch(requestUrl + "image/uploadfile", {
                        method: "POST",
                        body: formData
                    });
                    console.log("res:")
                    console.log(res);
                    console.log("---------------");

                    const json = await res.json();
                    console.log("res.json:")
                    console.log(json);
                });

                gif.render();
            };

            exportCuts();
        });
    }, []);

    return <img src={output} alt="rendering" />;
}
export default App;
