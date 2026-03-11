"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { submitHouseSchema, SubmitHouseFormData } from '@/types/submitHouse';
import { submitHouseAction } from '@/app/actions/submitHouseAction';
import { geocodeHouseLocation } from '@/util/geocodeHouseLocation';
import Form from './Form';
import TextField from './TextField';
import FileUpload from './FileUpload';
import FormButton from './FormButton';
import {
  setSuccsessToast,
} from "@/app/components/Toast";
interface SubmitHouseFormProps {
  center: { lat: number; lng: number };
  onSuccess: () => void;
}

export default function SubmitHouseForm({ center, onSuccess }: SubmitHouseFormProps) {
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
      house_number: '15',
      house_address: 'Tielensstraat',
      start_date: new Date().toISOString().slice(0, 16),
      house_latitude: '',
      house_longitude: '',
      photo: [],
      video: [],
    },
  });

  const fillCoordinatesFromAddress = async () => {
    const houseNumber = getValues('house_number');
    const houseAddress = getValues('house_address');

    if (!houseNumber?.trim() || !houseAddress?.trim()) {
      return;
    }

    try {
      const result = await geocodeHouseLocation(houseNumber, houseAddress);
      if (!result) {
        return;
      }
console.log(result)
      setValue('house_latitude', String(result.lat), { shouldDirty: true });
      setValue('house_longitude', String(result.lng), { shouldDirty: true });
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const formatDate = (dateTimeLocal: string) => {
    if (!dateTimeLocal) return '';
    if (dateTimeLocal.includes('/')) return dateTimeLocal;
    const d = new Date(dateTimeLocal);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const onSubmit = async (formData: SubmitHouseFormData) => {
    try {
      setIsLoading(true);

      const files: File[] = formData.photo ?? [];
      if (files.length === 0) {
        alert('Please select at least one photo');
        return;
      }

      const response = await submitHouseAction({
        house_number: formData.house_number,
        house_address: formData.house_address,
        start_date: formatDate(formData.start_date),
        house_latitude: formData.house_latitude ? parseFloat(formData.house_latitude) : center.lat,
        house_longitude: formData.house_longitude ? parseFloat(formData.house_longitude) : center.lng,
        media: files,
      });

      if (response.result) {
     
        setSuccsessToast('House submitted successfully!');
        reset();
        onSuccess();
      } else {
        alert(`Error: ${response.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert(`Failed to submit house: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        label="House Number"
        placeholder="e.g., 15"
        error={errors.house_number}
        {...register('house_number', {
          onBlur: () => {
            void fillCoordinatesFromAddress();
          },
        })}
      />
      <TextField
        label="House Address"
        placeholder="e.g., Tielensstraat"
        error={errors.house_address}
        {...register('house_address', {
          onBlur: () => {
            void fillCoordinatesFromAddress();
          },
        })}
      />
      <TextField
        label="Start Date"
        type="datetime-local"
        error={errors.start_date}
        {...register('start_date')}
      />
      <input type="hidden" {...register('house_latitude')} />
      <input type="hidden" {...register('house_longitude')} />
      <FileUpload
        label="Upload Photo"
        icon="+"
        accept="image/*"
        error={errors.photo}
        onFileChange={(files) => {
          const arr = files ? Array.from(files) : [];
          setValue('photo', arr, { shouldValidate: true });
        }}
      />
      <FileUpload
        label="Upload Video"
        icon="+"
        accept="video/*"
        error={errors.video}
        onFileChange={(files) => {
          const arr = files ? Array.from(files) : [];
          setValue('video', arr, { shouldValidate: true });
        }}
      />
      <FormButton isLoading={isLoading}>
        Place on map
      </FormButton>
    </Form>
  );
}
