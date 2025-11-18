import React, { useState, useEffect } from 'react';
import './PotholesSidebar.css';
import { Pothole } from '../../types/pothole.types';
import { reverseGeocode, getAreaFromAddress, getPriorityFromReports } from '../../utils/mapHelpers';

interface PotholesSidebarProps {
  potholes: Pothole[];
  isOpen: boolean;
  onToggle: () => void;
  onPotholeClick: (pothole: Pothole) => void;
  selectedPotholeId?: string | null;
}

interface PotholeWithAddress extends Pothole {
  cachedAddress?: string;
}

const PotholesSidebar: React.FC<PotholesSidebarProps> = ({
  potholes,
  isOpen,
  onToggle,
  onPotholeClick,
  selectedPotholeId,
}) => {
  const [potholesWithAddresses, setPotholesWithAddresses] = useState<PotholeWithAddress[]>(potholes);

  // Fetch addresses for potholes
  useEffect(() => {
    const fetchAddresses = async () => {
      const updated = await Promise.all(
        potholes.map(async (pothole) => {
          // If address already exists in location, use it
          if (pothole.location.address) {
            return { ...pothole, cachedAddress: pothole.location.address };
          }

          // Otherwise, reverse geocode
          const [lng, lat] = pothole.location.coordinates;
          const address = await reverseGeocode(lng, lat);
          return { ...pothole, cachedAddress: address };
        })
      );
      setPotholesWithAddresses(updated);
    };

    if (potholes.length > 0) {
      fetchAddresses();
    }
  }, [potholes]);

  const getStatusDisplay = (status: string): string => {
    const statusMap: Record<string, string> = {
      new: 'Needs repair',
      planned: 'Planned',
      in_progress: 'In progress',
      resolved: 'Fixed',
      rejected: 'Rejected',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      new: '#EF4444',
      planned: '#F59E0B',
      in_progress: '#3B82F6',
      resolved: '#10B981',
      rejected: '#6B7280',
    };
    return colorMap[status] || '#6B7280';
  };

  const getPriorityColor = (reports: number): string => {
    const priority = getPriorityFromReports(reports);
    if (priority === 'High Priority') return '#EF4444';
    if (priority === 'Medium Priority') return '#FCD34D';
    return '#3B82F6';
  };

  return (
    <div className={`potholes-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <button className="sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
        {isOpen ? '→' : '←'}
      </button>

      {isOpen && (
        <div className="sidebar-content">
          <h3 className="sidebar-title">Potholes in this area</h3>

          <div className="potholes-list">
            {potholesWithAddresses.map((pothole) => (
              <div
                key={pothole._id}
                className={`pothole-item ${selectedPotholeId === pothole._id ? 'selected' : ''}`}
                onClick={() => onPotholeClick(pothole)}
              >
                <div className="pothole-indicator" style={{ backgroundColor: getPriorityColor(pothole.reports) }} />

                <div className="pothole-info">
                  <div className="pothole-address">{pothole.cachedAddress || 'Loading address...'}</div>
                  <div className="pothole-area">Area: {getAreaFromAddress(pothole.cachedAddress || '')}</div>
                  <div className="pothole-status" style={{ color: getStatusColor(pothole.status) }}>
                    Status: {getStatusDisplay(pothole.status)}
                  </div>
                </div>
              </div>
            ))}

            {potholes.length === 0 && (
              <div className="empty-state">No potholes found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PotholesSidebar;
