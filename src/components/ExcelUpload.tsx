import React, { useCallback } from 'react';
import { read, utils } from 'xlsx';
import type { WHODataPoint } from '../types/who';
import { Upload } from 'lucide-react';

interface ExcelUploadProps {
  onDataLoaded: (data: WHODataPoint[]) => void;
}

export const ExcelUpload: React.FC<ExcelUploadProps> = ({ onDataLoaded }) => {
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = utils.sheet_to_json(worksheet);

        const processedData: WHODataPoint[] = jsonData
          .filter((row: any) => 
            row.country && 
            row.year && 
            !isNaN(Number(row.value))
          )
          .map((row: any, index: number) => ({
            id: `upload-${index}`,
            country: String(row.country),
            year: parseInt(String(row.year)),
            value: parseFloat(String(row.value)),
            indicator: String(row.indicator || 'Custom Indicator')
          }));

        onDataLoaded(processedData);
      } catch (error) {
        console.error('Error processing Excel file:', error);
        alert('Error processing Excel file. Please check the format.');
      }
    };
    reader.readAsArrayBuffer(file);
  }, [onDataLoaded]);

  return (
    <div className="mb-6">
      <label
        htmlFor="excel-upload"
        className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
      >
        <div className="flex items-center space-x-2 text-gray-600 hover:text-blue-500">
          <Upload className="h-5 w-5" />
          <span>Upload Excel Data (Optional)</span>
        </div>
        <input
          id="excel-upload"
          type="file"
          className="hidden"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
        />
      </label>
    </div>
  );
};