"use client";

import { addHousePhotoAction } from "@/app/actions/addHousePhotoAction";
import { setErrorToast, setSuccessToast } from "@/app/components/common/Toast";
import { Houses } from "@/types/houses";
import { CameraIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import type { SyntheticEvent } from "react";
import { useState } from "react";
import { FileUpload, Form, FormButton } from "../form";
import HousePhotoSlider from "./HousePhotoSlider";

export default function HousePopup({ house }: { house: Houses }) {
  const t = useTranslations("HousePopup");
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  async function handleUpload(event: SyntheticEvent<HTMLFormElement>) {
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
    <div className="relative overflow-hidden rounded-2xl border-2 border-purple-600 bg-gray-900 shadow-[0_0_50px_rgba(147,51,234,0.3)]">
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-purple-600/20 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-orange-600/20 blur-3xl" />

      <div className="relative z-10">
        <HousePhotoSlider images={house.images} />
      </div>

      <div className="relative z-10 p-3">
        <h3 className="font-halloween text-lg text-purple-300">
          {t("houseAddress")}:
        </h3>
        <span className="mt-1 block text-sm text-gray-300">
          {house.address} {house.number}
        </span>
        <h3 className="mt-2 font-halloween text-lg text-purple-300">
          {t("startDate")}:
        </h3>
        <span className="mt-1 block text-sm text-gray-300">
          {house.start_date.toLocaleString()}
        </span>

        <Form
          onSubmit={handleUpload}
          className="mt-3 space-y-2 border-t border-purple-700/60 pt-2"
        >
          <FileUpload
            label={t("choosePhoto")}
            icon={<CameraIcon className="w-5 h-5" />}
            accept="image/*"
            onFileChange={setSelectedFiles}
          />
          <FormButton
            variant="primary"
            isLoading={uploading}
            disabled={uploading}
          >
            {t("uploadPhoto")}
          </FormButton>
        </Form>
      </div>
    </div>
  );
}
