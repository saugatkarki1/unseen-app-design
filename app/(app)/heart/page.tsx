"use client"

export default function HeartPage() {
  return (
    <div className="flex w-full min-h-screen max-w-full flex-col px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
      <main className="flex flex-1 flex-col">
        <div className="sketchfab-embed-wrapper flex-1">
          <iframe
            title="3d Animated Realistic Human Heart - V2.0"
            frameBorder="0"
            allowFullScreen
            mozallowfullscreen="true"
            webkitallowfullscreen="true"
            allow="autoplay; fullscreen; xr-spatial-tracking"
            src="https://sketchfab.com/models/168b474fba564f688048212e99b4159d/embed"
            className="h-full w-full rounded-lg"
          />
          <p style={{ fontSize: 13, fontWeight: "normal", margin: 5, color: "#4A4A4A" }}>
            <a
              href="https://sketchfab.com/3d-models/3d-animated-realistic-human-heart-v20-168b474fba564f688048212e99b4159d?utm_medium=embed&utm_campaign=share-popup&utm_content=168b474fba564f688048212e99b4159d"
              target="_blank"
              rel="nofollow"
              style={{ fontWeight: "bold", color: "#1CAAD9" }}
            >
              3d Animated Realistic Human Heart - V2.0
            </a>{" "}
            by{" "}
            <a
              href="https://sketchfab.com/docjana?utm_medium=embed&utm_campaign=share-popup&utm_content=168b474fba564f688048212e99b4159d"
              target="_blank"
              rel="nofollow"
              style={{ fontWeight: "bold", color: "#1CAAD9" }}
            >
              Anatomy by Doctor Jana
            </a>{" "}
            on{" "}
            <a
              href="https://sketchfab.com?utm_medium=embed&utm_campaign=share-popup&utm_content=168b474fba564f688048212e99b4159d"
              target="_blank"
              rel="nofollow"
              style={{ fontWeight: "bold", color: "#1CAAD9" }}
            >
              Sketchfab
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}



