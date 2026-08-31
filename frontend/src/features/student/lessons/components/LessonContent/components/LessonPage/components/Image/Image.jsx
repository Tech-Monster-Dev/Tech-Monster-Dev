import "./Image.css";

export default function Image({
    src,
    alt = "Lesson image",
    caption = "",
}) {
    if (!src) return null;

    return (
        <figure className="lesson-image">
            <div className="lesson-image__frame">
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                />
            </div>

            {caption ? (
                <figcaption className="lesson-image__caption">
                    {caption}
                </figcaption>
            ) : null}
        </figure>
    );
}
