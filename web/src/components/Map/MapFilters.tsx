import React, { useMemo } from 'react';
import './MapFilters.css';
import { Pothole } from '../../types/pothole.types';
import { getAreaFromAddress } from '../../utils/mapHelpers';

interface MapFiltersProps {
  potholes: Pothole[];
  filters: {
    area: string;
    status: string;
    priority: string;
    severity: string;
  };
  onFilterChange: (filterType: 'area' | 'status' | 'priority' | 'severity', value: string) => void;
}

const MapFilters: React.FC<MapFiltersProps> = ({ potholes, filters, onFilterChange }) => {
  // Extract unique areas from potholes using getAreaFromAddress
  const areas = useMemo(() => {
    const areaSet = new Set<string>();
    potholes.forEach((pothole) => {
      const area = getAreaFromAddress(pothole.location.address || '');
      if (area && area !== 'Unknown') {
        areaSet.add(area);
      }
    });
    return ['All', ...Array.from(areaSet).sort()];
  }, [potholes]);

  const statusOptions = ['All', 'Needs repair', 'Planned', 'In progress', 'Fixed'];
  const priorityOptions = ['All', 'High Priority', 'Medium Priority', 'Low Priority'];
  const severityOptions = ['All', 'High (70-100)', 'Medium (40-69)', 'Low (0-39)'];

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

      <div className="filter-group">
        <label className="filter-label">Severity</label>
        <select
          className="filter-select"
          value={filters.severity}
          onChange={(e) => onFilterChange('severity', e.target.value)}
        >
          {severityOptions.map((severity) => (
            <option key={severity} value={severity}>
              {severity}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default MapFilters;
