import React, { useState } from 'react';
import RatingInfoDialog from './RatingInfoDialog';

const RatingLabel = ({ rating }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleLabelClick = () => {
    setIsDialogOpen(true);
  };

  console.log("RatingLabel received averageRating:", rating); // Debug log

  let label = '';
  let color = '';
  let textColor = '';

  if (rating < 3) {
    label = 'Bad';
    color = 'red';
    textColor = 'white';
  } else if (rating < 5) {
    label = 'Mid';
    color = 'orange';
    textColor = 'white';
  } else if (rating < 6.5) {
    label = 'Good';
    color = 'yellow';
    textColor = 'black';
  } else if (rating < 7.5) {
    label = 'Great';
    color = 'green';
    textColor = 'white';
  } else if (rating < 9) {
    label = 'Amazing';
    color = 'limegreen';
    textColor = 'black';
  } else if (rating < 9.6) {
    label = 'Perfect';
    color = 'blue';
    textColor = 'white';
  } else {
    label = 'Legendary';
    color = 'purple';
    textColor = 'white';
  }

  return (
    <>
      <span
        style={{
          backgroundColor: color,
          padding: '0.5rem',
          borderRadius: '0.25rem',
          color: textColor,
          cursor: 'pointer',
        }}
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
