"use client";

import { addHousePhotoAction } from "@/app/actions/addHousePhotoAction";
import { setErrorToast, setSuccessToast } from "@/app/components/common/Toast";
import { Houses } from "@/types/houses";
import { useTranslations } from "next-intl";
import type { FormEvent } from "react";
import { useState } from "react";
import { FileUpload, Form, FormButton } from "../form";
import HousePhotoSlider from "./HousePhotoSlider";

export default function HousePopup({ house }: { house: Houses }) {
  const t = useTranslations("HousePopup");
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFiles || selectedFiles.length === 0) {
      setErrorToast(t("selectPhotoError"));
      return;
    }

    setUploading(true);

    try {
      await addHousePhotoAction(house.id, Array.from(selectedFiles));
      setSuccessToast(t("uploadSuccess"));
      setSelectedFiles(null);
    } catch {
      setErrorToast(t("uploadError"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-lg">
      <HousePhotoSlider images={house.images} />

      <div className="p-2">
        <h3 className="font-halloween text-lg">{t("houseAddress")}:</h3>
        <span className="text-sm text-gray-500 block mt-1">
          {house.address} {house.number}
        </span>
        <h3 className="font-halloween text-lg mt-2">{t("startDate")}:</h3>
        <span className="text-sm text-gray-500 block mt-1">
          {house.start_date.toLocaleString()}
        </span>

        <Form onSubmit={handleUpload} className="mt-3 border-t pt-2 space-y-2">
          <FileUpload
            label={t("uploadPhoto")}
            icon="📸"
            accept="image/*"
            onFileChange={setSelectedFiles}
          />
          <FormButton isLoading={uploading} disabled={uploading}>
            {t("uploadPhoto")}
          </FormButton>
        </Form>
      </div>
    </div>
  );
}
