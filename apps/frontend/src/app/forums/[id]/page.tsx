'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useDropzone } from 'react-dropzone';
import { Upload as UploadIcon, File, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function UploadPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: files } = useQuery({
    queryKey: ['my-files'],
    queryFn: async () => {
      const response = await api.get('/upload/my');
      return response.data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-files'] });
      toast.success('Archivo subido exitosamente');
    },
    onError: () => {
      toast.error('Error al subir archivo');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/upload/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-files'] });
      toast.success('Archivo eliminado');
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        uploadMutation.mutate(file);
      });
    },
  });

  const handleDownload = async (fileId: string) => {
    const response = await api.get(`/upload/${fileId}/download`);
    window.open(response.data.url, '_blank');
  };

  const roleBasedLayout = user?.role === 'student' ? 'student' : user?.role === 'teacher' ? 'teacher' : user?.role === 'admin' ? 'admin' : 'parent';

  return (
    <DashboardLayout role={roleBasedLayout as any}>
      <div>
        <h1 className="text-3xl font-bold mb-6">Mis Archivos</h1>

        {/* Upload Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition ${
            isDragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
          }`}
        >
          <input {...getInputProps()} />
          <UploadIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          {isDragActive ? (
            <p className="text-lg">Suelta los archivos aquí...</p>
          ) : (
            <div>
              <p className="text-lg mb-2">
                Arrastra archivos aquí o haz clic para seleccionar
              </p>
              <p className="text-sm text-gray-500">
                Soporta cualquier tipo de archivo
              </p>
            </div>
          )}
        </div>

        {/* Files List */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Archivos Subidos</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Archivo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tamaño
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {files?.map((file: any) => (
                  <tr key={file.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <File className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">{file.original_filename}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{file.file_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {(file.file_size / 1024).toFixed(2)} KB
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(file.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownload(file.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(file.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
