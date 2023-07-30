/** @type {HTMLMediaElement[]} */
const medias = [
  document.getElementById("media1"),
  document.getElementById("media2")
]

const stateText = document.getElementById("state")

const infoText = document.getElementById("info")

let currMedia = 0

let currState = 0

let canPressButton = false

const videos = [
  {
    id: "main",
    src: "/videos/1.mp4",
    loop: true
  },
  {
    id: "intro",
    src: "/videos/2.mp4",
  },
  {
    id: "endIntroAndPress",
    src: "/videos/3.mp4",
    loop: true
  },
  {
    id: "hacking",
    src: "/videos/4.mp4",
  },
  {
    id: "endHackAndPress",
    src: "/videos/5.mp4",
    loop: true
  },
  {
    id: "ending",
    src: "/videos/6.mp4",
  },
]

async function start() {
  medias[0].src = videos[0].src
  medias[0].loop = videos[0].loop

  await prepareVideo()

  state.innerHTML = currState

  canPressButton = true

  window.addEventListener("keydown", (event) => {
    // TODO: hacer el reinicio manual

    if (!canPressButton) {
      return
    }

    switch (event.key) {
      case "q":
        if (currState !== 0) {
          return
        }

        nextState()
        break;

      case "w":
        if (currState === 0) {
          return
        }

        nextState()
        break;

      default:
        break;
    }
  })

  for (let media of medias) {
    media.addEventListener("ended", () => {
      nextState()
    })
  }

}

async function nextState() {
  currState = (currState + 1) % videos.length;

  prepareVideo()
}

async function prepareVideo() {

  const media = medias[currMedia]

  const nextMediaIndex = (currMedia + 1) % medias.length

  const nextMedia = medias[nextMediaIndex]

  const nextStateIndex = (currState + 1) % videos.length

  await handleState(videos[currState])

  await media.play()

  nextMedia.muted = true
  media.muted = false

  media.style.opacity = 1

  currMedia = nextMediaIndex

  return new Promise(resolve => {
    setTimeout(() => {
      nextMedia.style.opacity = 0
      nextMedia.src = videos[nextStateIndex].src
      nextMedia.loop = videos[nextStateIndex].loop
      nextMedia.pause()
      nextMedia.currentTime = 0;
      resolve("")
    }, 100)
  })
}

const URL = "http://127.0.0.1:8080"

let sessionId = null

const actions = {
  main: async () => {
    if (sessionId) {
      const data = await fetch(URL + "/update/" + sessionId + "/4", {
        method: "POST"
      }).then()
    }

    sessionId = null

    infoText.innerHTML = "presiona (inicio)"
  },
  intro: async () => {
    const data = await fetch(URL + "/start").then(res => res.json())

    console.log(data)

    sessionId = data.id
  },
  hacking: async () => {
    const data = await fetch(URL + "/update/" + sessionId + "/1", {
      method: "POST"
    }).then()

    console.log(data.ok)
  },
  endHackAndPress: async () => {
    const data = await fetch(URL + "/update/" + sessionId + "/2", {
      method: "POST"
    }).then()

    console.log(data.ok)
  },
  ending: async () => {
    const data = await fetch(URL + "/update/" + sessionId + "/3", {
      method: "POST"
    }).then()

    console.log(data.ok)
  },
}

async function handleState(video) {
  await actions[video.id]?.(video)

  canPressButton = !!video.loop

  state.innerHTML = currState

  infoText.innerHTML = canPressButton ? "presiona" : "espera"
}

start()
