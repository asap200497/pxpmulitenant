"use client";

import { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { getCookieClient } from "@/lib/cookieClient";
import Image from 'next/image' 
pdfjsLib.GlobalWorkerOptions.workerSrc =  "/pdf.worker.min.mjs";
//pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

interface Props {
    url: string | undefined;
}

export default function PdfThumbnail({ url }: Props) {
    const [thumb, setThumb] = useState<string | null>(null);

    useEffect(() => {
        if (!url) return;

        const generateThumbnail = async () => {
            try {
                      const token = await getCookieClient();
                const loadingTask = pdfjsLib.getDocument({
                    url,
              httpHeaders: {
                 Authorization: `Bearer ${token}`,
                 },
                });
                const pdf = await loadingTask.promise;
                const page = await pdf.getPage(1);
                const viewport = page.getViewport({ scale: 1.2 });

                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d")!;
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({
                canvas,                 // ⬅️ new required field in v4 types
                canvasContext: context,
                viewport,
                }).promise;

                const imageUrl = canvas.toDataURL("image/jpeg", 0.9);
                setThumb(imageUrl);
            } catch (err) {
                console.error("Failed to generate PDF thumbnail", err);
            }
        };

        generateThumbnail();
    }, [url]);

    return thumb ? (
<Image
    src={thumb}
    alt="PDF Cover"
    width="100"
    height="180"
    style={{
        width: "100%",
        height: "180px", // force a consistent cover height
        objectFit: "cover", // prevent distortion
        borderBottom: "1px solid #eee",
        borderRadius: "8px 8px 0 0", // match card border radius if needed
    }}
/>
    ) : (
        <p>Loading preview...</p>
    );
}
