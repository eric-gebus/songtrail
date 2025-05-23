import React from "react"
import { Popup } from "react-leaflet"

export function Tag({tag}) {

  const date = new Date(tag.timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return (
      <Popup>
        <div className="songTitle">
          {tag.title}
        </div>
        <div className="artistName">
          {tag.artist}
        </div>
        <div className="date">
          {day}-{month}-{year} {formattedHours}:{formattedMinutes}
        </div>
      </Popup>
  )
}

export default Tag
