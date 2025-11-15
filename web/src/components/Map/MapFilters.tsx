import React, { useMemo } from 'react';
import './MapFilters.css';
import { Pothole } from '../../types/pothole.types';

interface MapFiltersProps {
  potholes: Pothole[];
  filters: {
    area: string;
    status: string;
    priority: string;
  };
  onFilterChange: (filterType: 'area' | 'status' | 'priority', value: string) => void;
}

const MapFilters: React.FC<MapFiltersProps> = ({ potholes, filters, onFilterChange }) => {
  // Extract unique areas from potholes
  const areas = useMemo(() => {
    const areaSet = new Set<string>();
    potholes.forEach((pothole) => {
      if (pothole.location.address) {
        const parts = pothole.location.address.split(',');
        const area = parts[parts.length - 2]?.trim() || parts[0]?.trim();
        if (area) areaSet.add(area);
      }
    });
    return ['All', ...Array.from(areaSet).sort()];
  }, [potholes]);

  const statusOptions = ['All', 'Needs repair', 'Planned', 'In progress', 'Fixed'];
  const priorityOptions = ['All', 'High Priority', 'Medium Priority', 'Low Priority'];

  return (
    <div className="map-filters">
      <div className="filter-group">
        <label className="filter-label">Area</label>
        <select
          className="filter-select"
          value={filters.area}
          onChange={(e) => onFilterChange('area', e.target.value)}
        >
          {areas.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Status</label>
        <select
          className="filter-select"
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Priority</label>
        <select
          className="filter-select"
          value={filters.priority}
          onChange={(e) => onFilterChange('priority', e.target.value)}
        >
          {priorityOptions.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default MapFilters;
