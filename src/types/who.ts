export interface WHODataPoint {
  id: string;
  country: string;
  year: number;
  value: number;
  indicator: string;
}

export interface WHOResponse {
  value: Array<{
    SpatialDim: string;
    TimeDim: string;
    Value: string;
    Dim1?: string;
  }>;
}