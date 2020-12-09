import React, { useCallback, useEffect, useRef, useState } from 'react'
import { InlineLoading } from 'carbon-components-react'

import styles from './Home.module.css'

import windowDarkSmall from './window-dark-small.png'
import windowDarkSmall2x from './window-dark-small@2x.png'

import windowDark from './window-dark.png'
import windowDark2x from './window-dark@2x.png'

import windowDarkSmallP from './window-dark-small.webp'
import windowDarkSmallP2x from './window-dark-small@2x.webp'

import windowDarkP from './window-dark.webp'
import windowDarkP2x from './window-dark@2x.webp'

// import video from './trim.webm'
import video2 from './trim.mp4'
import { useGoogleAnalytics } from 'googleAnalyticsHook'

// ffmpeg -i output.webm -c copy -t 00:00:10.5 trim.webm
// ffmpeg -i trim.webm -vf loop=60:1:0,setpts=N/FRAME_RATE/TB -cpu-used 1 pause2.webm
// ffmpeg -i final.mov -c:v libvpx-vp9 -b:v 0 -crf 30 -pass 1 -an -f webm /dev/null && \
// ffmpeg -i final.mov -c:v libvpx-vp9 -b:v 0 -crf 30 -pass 2 -c:a libopus output.webm
const Home = ({ attemptedPage }) => {
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)

  useGoogleAnalytics('home')

  const encodedState = encodeURIComponent(attemptedPage)

  const handleClick1 = useCallback(() => {
    window.location.href = `/auth/login?state=${encodedState}`
    setLoading1(true)
  }, [encodedState])

  const handleClick2 = useCallback(() => {
    window.location.href = `/auth/login?state=${encodedState}`
    setLoading2(true)
  }, [encodedState])

  const videoRef = useRef(null)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play()
    }
  }, [])

  return (
    <div className={styles.wrapper}>
      <header className={styles.titleBar}>
        <a href="/" className={styles.title}>
        <span className={styles.titlePrefix}>Image and Video </span>&nbsp;&nbsp;
            Annotations
        </a>
        <nav className={styles.mainLinks}>
        </nav>

        {loading1 ? (
          <div className={styles.loading}>
            <InlineLoading description="Loading" success={false} />
          </div>
        ) : (
          <div className={styles.button} onClick={handleClick1}>
            Log in
          </div>
        )}
      </header>
      <main className={styles.contentWrapper}>
        <div className={styles.leftWrapper}>
          <div className={styles.bigText}>Image and Video Annotations</div>
          <div className={styles.subText}>
            A fast, easy and collaborative open source image annotation tool for
            teams and individuals.
          </div>
          <div className={styles.buttonsWrapper}>
            {loading2 ? (
              <div className={styles.loading}>
                <InlineLoading description="Loading" success={false} />
              </div>
            ) : (
              <div className={styles.button} onClick={handleClick2}>
                Continue with IBM Cloud
              </div>
            )}
            <a className={styles.buttonSecondary} href="/docs">
              Documentation
            </a>
          </div>
        </div>
        <div className={styles.videoWrapper}>
          <picture>
            <source
              className={styles.image}
              media="(max-width: 700px)"
              type="image/webp"
              srcSet={`${windowDarkSmallP}, ${windowDarkSmallP2x} 2x`}
            />
            <source
              className={styles.image}
              type="image/webp"
              srcSet={`${windowDarkP}, ${windowDarkP2x} 2x`}
            />
            <source
              className={styles.image}
              media="(max-width: 700px)"
              srcSet={`${windowDarkSmall}, ${windowDarkSmall2x} 2x`}
            />
            <img
              className={styles.image}
              src={windowDark}
              alt="Dog on the beach"
              srcSet={`${windowDark2x} 2x`}
            />
          </picture>
          <video
            ref={videoRef}
            className={styles.video}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          >
            {/* <source src={video} type="video/webm" /> */}
            <source src={video2} type="video/mp4" />
          </video>
        </div>
      </main>
    </div>
  )
}

export default Home
