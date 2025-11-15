import React, { useState, useEffect } from 'react';
import './PotholeInfoPanel.css';
import { Pothole } from '../../types/pothole.types';
import { reverseGeocode, getAreaFromAddress, getPriorityFromReports } from '../../utils/mapHelpers';

interface PotholeInfoPanelProps {
  pothole: Pothole;
  onClose: () => void;
}

const PotholeInfoPanel: React.FC<PotholeInfoPanelProps> = ({ pothole, onClose }) => {
  const [address, setAddress] = useState<string>(pothole.location.address || 'Loading address...');
  const [status, setStatus] = useState<string>(pothole.status);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchAddress = async () => {
      if (!pothole.location.address) {
        const [lng, lat] = pothole.location.coordinates;
        const addr = await reverseGeocode(lng, lat);
        setAddress(addr);
      }
    };
    fetchAddress();
  }, [pothole]);

  const statusDisplayMap: Record<string, string> = {
    new: 'Needs fixing',
    planned: 'Planned',
    in_progress: 'In progress',
    resolved: 'Fixed',
    rejected: 'Rejected',
  };

  const statusBackendMap: Record<string, string> = {
    'Needs fixing': 'new',
    'Planned': 'planned',
    'In progress': 'in_progress',
    'Fixed': 'resolved',
    'Rejected': 'rejected',
  };

  const getStatusDisplay = (status: string): string => {
    return statusDisplayMap[status] || status;
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/potholes/${pothole._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update pothole');
      }

      const data = await response.json();
      console.log('Pothole updated:', data);
      onClose();
    } catch (error) {
      console.error('Error updating pothole:', error);
      alert('Failed to update pothole. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pothole-info-panel">
      <button className="close-button" onClick={onClose} aria-label="Close">
        ✕
      </button>

      <div className="info-content">
        <div className="info-row">
          <span className="info-label">Address:</span>
          <span className="info-value">{address}</span>
        </div>

        <div className="info-row">
          <span className="info-label">Area:</span>
          <span className="info-value">{getAreaFromAddress(address)}</span>
        </div>

        <div className="info-row">
          <span className="info-label">Priority:</span>
          <span className="info-value">{getPriorityFromReports(pothole.reports)}</span>
        </div>

        <div className="info-row">
          <span className="info-label">Status:</span>
          <select
            className="info-select"
            value={getStatusDisplay(status)}
            style={{ color: getStatusColor(status) }}
            onChange={(e) => setStatus(statusBackendMap[e.target.value])}
          >
            <option>Needs fixing</option>
            <option>Planned</option>
            <option>In progress</option>
            <option>Fixed</option>
          </select>
        </div>

        {pothole.photo && (
          <div className="photo-section">
            <img src={pothole.photo} alt="Pothole" className="pothole-photo" />
          </div>
        )}

        <button className="save-button" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
};

export default PotholeInfoPanel;
