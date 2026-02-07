// PositionBadge.js
import React from 'react';
import '../App.css';

const PositionBadge = ({ position }) => {
  const getPositionClassName = (position) => {
    switch (position) {
      case 'P1':
        return 'p1';
      case 'P2':
        return 'p2';
      case 'P3':
        return 'p3';
      default:
        return 'default-position'; // A default class for positions beyond P3
    }
  };

  const positionClassName = getPositionClassName(position);
  return <span className={`position-badge ${positionClassName}`}>{position}</span>;
};

export default PositionBadge;
