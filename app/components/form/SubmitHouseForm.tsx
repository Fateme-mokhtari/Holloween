"use client";

import { submitHouseAction } from "@/app/actions/submitHouseAction";
import { setErrorToast, setSuccsessToast } from "@/app/components/common/Toast";
import { SubmitHouseFormData, submitHouseSchema } from "@/types/submitHouse";
import { geocodeHouseLocation } from "@/util/geocodeHouseLocation";
import { CameraIcon, VideoCameraIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import FileUpload from "./FileUpload";
import Form from "./Form";
import FormButton from "./FormButton";
import TextField from "./TextField";

interface SubmitHouseFormProps {
  center: { lat: number; lng: number };
  onSuccess: () => void;
}

export default function SubmitHouseForm({
  center,
  onSuccess,
}: SubmitHouseFormProps) {
  const t = useTranslations("SubmitHouseForm");
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
    reset,
  } = useForm<SubmitHouseFormData>({
    resolver: zodResolver(submitHouseSchema),
    defaultValues: {
      house_number: "15",
      house_address: "Tielensstraat",
      start_date: new Date().toISOString().slice(0, 16),
      house_latitude: "",
      house_longitude: "",
      photo: [],
      video: [],
    },
  });

  const fillCoordinatesFromAddress = async () => {
    const houseNumber = getValues("house_number");
    const houseAddress = getValues("house_address");

    if (!houseNumber?.trim() || !houseAddress?.trim()) {
      return;
    }

    try {
      const result = await geocodeHouseLocation(houseNumber, houseAddress);
      if (!result) {
        return;
      }
      setValue("house_latitude", String(result.lat), { shouldDirty: true });
      setValue("house_longitude", String(result.lng), { shouldDirty: true });
    } catch (_error) {
      setErrorToast(t("geocodingError"));
    }
  };

  const formatDate = (dateTimeLocal: string) => {
    if (!dateTimeLocal) return "";
    if (dateTimeLocal.includes("/")) return dateTimeLocal;
    const d = new Date(dateTimeLocal);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const onSubmit = async (formData: SubmitHouseFormData) => {
    try {
      setIsLoading(true);

      const files: File[] = formData.photo ?? [];
      if (files.length === 0) {
        setErrorToast(t("selectPhotoError"));
        return;
      }

      const response = await submitHouseAction({
        house_number: formData.house_number,
        house_address: formData.house_address,
        start_date: formatDate(formData.start_date),
        house_latitude: formData.house_latitude
          ? parseFloat(formData.house_latitude)
          : center.lat,
        house_longitude: formData.house_longitude
          ? parseFloat(formData.house_longitude)
          : center.lng,
        media: files,
      });

      if (response.result) {
        setSuccsessToast(t("submitSuccess"));
        reset();
        onSuccess();
      } else {
        setErrorToast(response.message || t("submissionError"));
      }
    } catch (error) {
      setErrorToast(
        error instanceof Error ? error.message : t("submissionError"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          label={t("houseNumber")}
          placeholder={t("houseNumberPlaceholder")}
          error={errors.house_number}
          {...register("house_number", {
            onBlur: () => {
              void fillCoordinatesFromAddress();
            },
          })}
        />
        <TextField
          label={t("houseAddress")}
          placeholder={t("houseAddressPlaceholder")}
          error={errors.house_address}
          {...register("house_address", {
            onBlur: () => {
              void fillCoordinatesFromAddress();
            },
          })}
        />
        <TextField
          label={t("startDate")}
          type="datetime-local"
          error={errors.start_date}
          {...register("start_date")}
          onClick={(e) => e.currentTarget.showPicker()}
        />
        <input type="hidden" {...register("house_latitude")} />
        <input type="hidden" {...register("house_longitude")} />
        <FileUpload
          label={t("uploadPhoto")}
          icon={<CameraIcon className="w-5 h-5" />}
          accept="image/*"
          error={errors.photo}
          onFileChange={(files) => {
            const arr = files ? Array.from(files) : [];
            setValue("photo", arr, { shouldValidate: true });
          }}
        />
        <FileUpload
          label={t("uploadVideo")}
          icon={<VideoCameraIcon className="w-5 h-5" />}
          accept="video/*"
          error={errors.video}
          onFileChange={(files) => {
            const arr = files ? Array.from(files) : [];
            setValue("video", arr, { shouldValidate: true });
          }}
        />
        <FormButton isLoading={isLoading}>{t("placeOnMap")}</FormButton>
      </Form>
    </>
  );
}
