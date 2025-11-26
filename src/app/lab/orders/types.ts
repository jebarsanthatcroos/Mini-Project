export interface LabTestRequest {
  _id: string;
  patient: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  doctor: {
    _id: string;
    name: string;
    email: string;
  };
  labTechnician?: {
    _id: string;
    name: string;
    employeeId: string;
  };
  test: {
    _id: string;
    name: string;
    category: string;
    duration: number;
    price: number;
  };
  status:
    | 'REQUESTED'
    | 'SAMPLE_COLLECTED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'VERIFIED'
    | 'CANCELLED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'STAT';
  requestedDate: string;
  sampleCollectedDate?: string;
  startedDate?: string;
  completedDate?: string;
  results?: string;
  findings?: string;
  notes?: string;
  isCritical: boolean;
  turnaroundTime?: number;
  isOverdue: boolean;
  employeeId?: string;
}

export interface Filters {
  status: string;
  priority: string;
  search: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface OrdersStatsProps {
  orders: LabTestRequest[];
}

export interface OrdersFiltersProps {
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: any) => void;
  onDateRangeChange: (key: 'start' | 'end', value: string) => void;
}

export interface OrdersTableProps {
  orders: LabTestRequest[];
  onViewDetails: (order: LabTestRequest) => void;
  onStatusUpdate: (
    orderId: string,
    newStatus: LabTestRequest['status']
  ) => void;
  router: any;
}

export interface OrderDetailsModalProps {
  order: LabTestRequest;
  onClose: () => void;
  onStatusUpdate: (
    orderId: string,
    newStatus: LabTestRequest['status']
  ) => void;
  onAssignTechnician: (orderId: string, technicianId: string) => void;
}
