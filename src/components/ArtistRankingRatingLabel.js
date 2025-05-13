import React, { useState } from 'react';
import RankingRatingInfoDialog from './RankingRatingInfoDialog';

const ArtistRankingRatingLabel = ({ rating }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleLabelClick = () => {
    setIsDialogOpen(true);
  };

  console.log("ArtistRankingRatingLabel received averageRating:", rating); // Debug log

  let label = '';
  let color = '';
  let textColor = '';

  if (rating < 1.5) {
    label = 'Bad';
    color = 'red';
    textColor = 'white';
  } else if (rating < 2.5) {
    label = 'Mid';
    color = 'orange';
    textColor = 'white';
  } else if (rating < 4.5) {
    label = 'Good';
    color = 'yellow';
    textColor = 'black';
  } else if (rating < 6.5) {
    label = 'Great';
    color = 'green';
    textColor = 'white';
  } else if (rating < 8) {
    label = 'Amazing';
    color = 'limegreen';
    textColor = 'black';
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
      <RankingRatingInfoDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </>
  );
};

export default ArtistRankingRatingLabel;