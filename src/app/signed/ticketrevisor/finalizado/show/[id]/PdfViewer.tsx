"use client";

import { useEffect, useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import HTMLFlipBook from "react-pageflip";
import Image from 'next/image' 
import { getCookieClient } from "@/lib/cookieClient";

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc =  "/pdf.worker.min.js";

interface PdfViewerProps {
    url: string;
}

export default function PdfViewer({ url }: PdfViewerProps) {
    const [pages, setPages] = useState<string[]>([]);
    const bookRef = useRef<any>(null);

    useEffect(() => {
        const loadPdf = async () => {
        const token = await getCookieClient();
        const loadingTask = pdfjsLib.getDocument({
               url,
              httpHeaders: {
                 Authorization: `Bearer ${token}`,
                 },
             });
            const pdf = await loadingTask.promise;
            const pageImages: string[] = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 0.8 });

                const canvas = document.createElement("canvas");
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                const context = canvas.getContext("2d");
                if (!context) continue;

await page.render({
  canvas,                 // ⬅️ new required field in v4 types
  canvasContext: context,
  viewport,
}).promise;
                pageImages.push(canvas.toDataURL("image/png"));
            }

            setPages(pageImages);
        };

        loadPdf();
    }, [url]);
    const [scale, setScale] = useState(1);
    const flipBookRef = useRef<React.ElementRef<typeof HTMLFlipBook>>(null);
    return (
//        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
<HTMLFlipBook
  width={600}
  height={800}
  size="stretch"
  minWidth={300}
  maxWidth={1200}
  minHeight={400}
  maxHeight={1600}
  drawShadow={true}
  flippingTime={1000}
  usePortrait={true}
  startZIndex={0}
  autoSize={true}
  maxShadowOpacity={0.5}
  showCover={false}
  mobileScrollSupport={true}
  clickEventForward={true}
  useMouseEvents={true}
  swipeDistance={30}
  showPageCorners={true}
  disableFlipByClick={false}
  startPage={0}
  className=""
  style={{ boxShadow: "0 0 10px rgba(0,0,0,0.3)" }}
  ref={flipBookRef}
>
                {pages.map((img, idx) => (
//                    <div style={{ width: "100%", height: "100%" }}>
                        <Image
                            key={idx}
                            width={200}
                            height={300}
                            src={img}
                            alt="page"
                          //  fill
                            style={{ objectFit: "contain" }}
                            unoptimized
                        />
  //                      </div>
                ))}
            </HTMLFlipBook>
  //      </div>
    );
}
