import React, { useState } from 'react';
import RatingInfoDialog from './RatingInfoDialog';

const RatingLabel = ({ rating }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleLabelClick = () => {
    setIsDialogOpen(true);
  };

  let label = '';
  let color = '';
  let textColor = '';

  if (rating < 2) {
    label = 'Bad';
    color = 'red';
    textColor = 'white';
  } else if (rating < 4.5) {
    label = 'Mid';
    color = 'orange';
    textColor = 'white';
  } else if (rating < 6) {
    label = 'Good';
    color = 'yellow';
    textColor = 'white';
  } else if (rating < 7.5) {
    label = 'Great';
    color = 'lightgreen';
    textColor = 'black';
  } else if (rating < 9.5) {
    label = 'Amazing';
    color = 'green';
    textColor = 'white';
  } else {
    label = 'Perfect';
    color = 'blue';
    textColor = 'white';
  }

  return (
    <>
      <span
        style={{ backgroundColor: color, padding: '0.5rem', borderRadius: '0.25rem', color: textColor , cursor: 'pointer' }}
        onClick={handleLabelClick}
        className="font-semibold text-sm"
      >
        {label}
      </span>
      <RatingInfoDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </>
  );
};

export default RatingLabel;