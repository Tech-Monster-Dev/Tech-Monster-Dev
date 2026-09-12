import "./Rating.css";

import {
  FaStar,
  FaRegStar,
  FaStarHalfAlt
} from "react-icons/fa";

function Rating({ rating = 0, max = 5 }) {

  return (

    <div className="rating">

      {

        [...Array(max)].map((_, index) => {

          const number = index + 1;

          if (rating >= number) {

            return <FaStar key={index} className="star filled" />;

          }

          if (rating >= number - 0.5) {

            return <FaStarHalfAlt key={index} className="star half" />;

          }

          return <FaRegStar key={index} className="star empty" />;

        })

      }

    </div>

  );

}

export default Rating;