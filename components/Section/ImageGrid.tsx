
import React from 'react';

const images = [
  "https://fastly.picsum.photos/id/841/300/300.jpg?hmac=59ZNBwU1FjRrwpU3J7NDerfr_DHq-JPYXqnyumDt17U",
  "https://fastly.picsum.photos/id/517/300/300.jpg?hmac=xDY76wxtwOZ5mEJYjf_i69VkVQibAYi036aADsWbaLs",
  "https://fastly.picsum.photos/id/204/300/300.jpg?hmac=nMn3k2irZFRlOEdAxFaKapzdO5cuwF8eQv5HbhP9Lyw",
  "https://fastly.picsum.photos/id/906/300/300.jpg?hmac=UJKxYXpNPOY5aqp_mipycmJFPgr8bd3RxcZChdDu0-c",
  "https://fastly.picsum.photos/id/546/300/300.jpg?hmac=f8E2wXr3kthnt3BT6h17Y5Baf_0aJUdPIV7GqBVgxzY"
];

export const ImageGrid: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '1rem',
      width: '100%',
      padding: '2rem 0'
    }}>
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt="Random Asset"
          style={{
            width: '140px',
            height: '140px',
            objectFit: 'cover',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            opacity: 0.9,
            transition: 'opacity 0.2s',
            cursor: 'pointer'
          }}
          onPointerEnter={(e) => e.currentTarget.style.opacity = '1'}
          onPointerLeave={(e) => e.currentTarget.style.opacity = '0.9'}
        />
      ))}
    </div>
  );
};
