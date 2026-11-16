/** Título para ImageResponse: una palabra por <span> (satori no corta texto dentro de un span con estilos mixtos). */
export function OgTitle({ text, italic }: { text: string; italic?: string }) {
  return (
    <>
      {text.split(" ").map((w, i) => {
        const clean = w.replace(/[.,]/g, "");
        const isItalic = italic && clean === italic;
        return (
          <span
            key={i}
            style={{
              marginRight: "0.24em",
              fontStyle: isItalic ? "italic" : "normal",
              color: isItalic ? "#D9C08A" : "#F2EBDD",
            }}
          >
            {w}
          </span>
        );
      })}
    </>
  );
}
