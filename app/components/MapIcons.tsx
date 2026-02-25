import L from 'leaflet';

export const createEmojiIcon = (emoji: string) => {
  return L.divIcon({
    html: `<div style="font-size: 30px; line-height: 1;">${emoji}</div>`,
    className: 'dummy-class', // Prevents default leaflet styling
    iconSize: [30, 30],
    iconAnchor: [15, 15], // Centers the emoji on the coordinate
  });
};

export const Icons = {
  Pumpkin: createEmojiIcon('🎃'),
  Ghost: createEmojiIcon('👻'),
  Skull: createEmojiIcon('💀'),
  House: createEmojiIcon('🏚️'),
};