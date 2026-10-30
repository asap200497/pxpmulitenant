"use client";

import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Button, Upload, Progress, message, Spin, Typography } from "antd";
import { UploadOutlined, LoadingOutlined } from "@ant-design/icons";
import { useRef, useState } from "react";
import axios from "axios";
import { api } from "@/services/api";
import { getCookieClient } from "@/lib/cookieClient";
import { createSHA256 } from "hash-wasm";

type SignedResp = string | { url: string; contentType?: string };

const { Text } = Typography;

// Stream a File in chunks and compute SHA-256 without loading it all in memory
async function hashLargeFile(
  file: File,
  opts?: { chunkSize?: number; onProgress?: (pct: number) => void; signal?: AbortSignal }
): Promise<string> {
  const chunkSize = opts?.chunkSize ?? 8 * 1024 * 1024;
  const hasher = await createSHA256();
  let offset = 0;

  while (offset < file.size) {
    if (opts?.signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const chunk = file.slice(offset, offset + chunkSize);
    const buf = await chunk.arrayBuffer();
    hasher.update(new Uint8Array(buf));
    offset += chunkSize;
    opts?.onProgress?.(Math.floor((offset / file.size) * 100));
  }
  return hasher.digest("hex");
}

// PUT to presigned URL with progress (browser/XHR)
async function putToPresignedUrl(
  url: string,
  file: File,
  opts?: { contentType?: string; signal?: AbortSignal; onProgress?: (pct: number) => void }) {
      const headers: Record<string, string> = {};
      if (opts?.contentType) headers["Content-Type"] = opts.contentType; // only if signed with it

      await axios.put(url, file, {
        headers,
        signal: opts?.signal,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        onUploadProgress: (e) => {
          if (!e.total) return;
          const pct = Math.min(100, Math.round((e.loaded / e.total) * 100));
          opts?.onProgress?.(pct);
        },
        transformRequest: [(d) => d], // send raw, no transforms
      });
}

export default function TicketCreate() {
  const { formProps, form, saveButtonProps, redirect } = useForm({
    submitOnEnter: true,
    redirect: false,
    onMutationSuccess: () => redirect("list", "ticket"),
  });

  const [uploading, setUploading] = useState(false);
  const [compactando, setCompactando] = useState(false);
  const [calchash, setCalcHash] = useState(false);

  // NEW: only-current-file UI
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const [currentUploadPct, setCurrentUploadPct] = useState<number>(0);
  const [currentHashPct, setCurrentHashPct] = useState<number>(0);

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleCancelUpload = () => {
    abortControllerRef.current?.abort();
    setUploading(false);
    setCurrentUploadPct(0);
    setCurrentHashPct(0);
    setCurrentFileName("");
    message.warning("Upload cancelado.");
  };

  const handleSubmit = async (values: any) => {
    const token = await getCookieClient();
    const list: any[] = values.files || [];
    if (!list.length) {
      message.warning("Selecione ao menos um arquivo.");
      return;
    }

    setUploading(true);
    setCompactando(false);
    setCurrentUploadPct(0);
    setCurrentHashPct(0);
    abortControllerRef.current = new AbortController();


    const uploadedIds: string[] = [];

    try {
      // Sequential upload to keep UI focused on the current file
      const files: File[] = list.map((it: any) => it.originFileObj as File);


      for (const f of files) {
        setCurrentFileName(f.name);

        // 1) HASH (streaming)
        setCalcHash(true);
        setCurrentHashPct(0);
        let sha256: string;
        try {
          sha256 = await hashLargeFile(f, {
            signal: abortControllerRef.current.signal,
            onProgress: (pct) => setCurrentHashPct(pct),
          });
          setCurrentHashPct(100);
        } catch (e: any) {
          if (e?.name === "AbortError") throw e;
          console.error("Hash failed:", e);
          message.error(`Falha ao calcular hash de ${f.name}`);
          throw e;
        } finally {
          setCalcHash(false);
        }
        
        // 2) PRESIGN (send hash + size if you want)
        const signedResp = await api.post(
          "/repositorio",
          { file: f.name, hash: sha256, size: f.size },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        uploadedIds.push(signedResp.data.id);
        const payload = signedResp.data as SignedResp;
        const url = typeof payload === "string" ? payload : payload.url;
        const contentType = typeof payload === "string" ? undefined : payload.contentType;
        
        // 3) UPLOAD (PUT raw bytes) with progress
        setCurrentUploadPct(0);
        await putToPresignedUrl(url, f, {
          contentType,
          signal: abortControllerRef.current.signal,
          onProgress: (pct) => setCurrentUploadPct(pct),
        });

        // ensure it ends at 100 for this file before moving on
        setCurrentUploadPct(100);
      }

      message.success("Upload concluído!");
      redirect("list", "ticket");
    } catch (err: any) {
      if (axios.isCancel(err) || err?.name === "CanceledError") {
        // cancelled
      } else {
        console.error(err);
        message.error(`Falha no upload: ${err?.message || "erro desconhecido"}`);
      }
    } finally {
      setUploading(false);
      abortControllerRef.current = null;

        const createticket = await api.post(
          "/ticket",
          { descricao: values.descricao, uploadedIds },
          { headers: { Authorization: `Bearer ${token}` } }
        );

      // reset current file UI if you prefer:
      // setCurrentFileName(""); setCurrentUploadPct(0); setCurrentHashPct(0);
    }
  };

  return (
    <Create saveButtonProps={{ ...saveButtonProps, disabled: uploading || compactando }}>
      <Form {...formProps} form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="Descrição" name="descricao">
          <Input />
        </Form.Item>

        <Form.Item
          label="Upload de Arquivos"
          name="files"
          valuePropName="fileList"
          getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
        >
          <Upload multiple beforeUpload={() => false}>
            <Button icon={<UploadOutlined />}>Selecionar Arquivos</Button>
          </Upload>
        </Form.Item>

        {uploading && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <Text type="secondary" ellipsis={{ tooltip: currentFileName }} style={{ maxWidth: 420 }}>
                {currentFileName || "Preparando..."}
              </Text>
              <Text>{currentUploadPct}%</Text>
            </div>
            <Progress percent={currentUploadPct} />

            <Form.Item style={{ marginTop: 12 }}>
              <Button danger onClick={handleCancelUpload}>
                Cancelar Upload
              </Button>
            </Form.Item>
          </>
        )}

        {calchash && (
          <div style={{ display: "flex", alignItems: "center", marginTop: 16, gap: 8 }}>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />} />
            <span>Calculando HASH ({currentHashPct}%), aguarde…</span>
          </div>
        )}

        {compactando && (
          <div style={{ display: "flex", alignItems: "center", marginTop: 16, gap: 8 }}>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />} />
            <span>Compactando arquivos, aguarde…</span>
          </div>
        )}
      </Form>
    </Create>
  );
}
