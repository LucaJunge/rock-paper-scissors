import './style.css'
import p5 from "p5"

const agents = []
const agentAmount = 100
const agentSize = 10

const ROCK = "🪨"
const PAPER = "📄"
const SCISSOR = "✂️"

const winsTo = {
  [ROCK]: SCISSOR,
  [SCISSOR]: PAPER,
  [PAPER]: ROCK
}

const looseTo = {
  [ROCK]: PAPER,
  [SCISSOR]: ROCK,
  [PAPER]: SCISSOR
}

let sketch = function (p) {
  p.setup = function setup() {
    p.createCanvas(400, 400)
    for (let i = 0; i < agentAmount; i++) {
      let type = Object.keys(winsTo)[i % 3]
      agents.push(new Agent(p.random(p.width), p.random(p.height), type))
    }
  }

  p.draw = function draw() {
    p.background(255)
    p.stroke(0)
    for (let i = 0; i < agents.length; i++) {
      agents[i].tick()
      agents[i].draw()
    }
  }

  class Agent {
    constructor(x, y, type) {
      this.x = x
      this.y = y
      this.type = type
    }

    tick() {
      const nearestWin = this.nearestOf(winsTo[this.type], true)

      // Attack
      if (nearestWin.a != null) {
        let dx = (nearestWin.a.x - this.x) / nearestWin.d
        let dy = (nearestWin.a.y - this.y) / nearestWin.d

        this.x += dx
        this.y += dy
      }

      // Fear
      const nearestLoss = this.nearestOf(looseTo[this.type])
      if (nearestLoss.a != null) {
        let dx = (nearestLoss.a.x - this.x) / nearestLoss.d
        let dy = (nearestLoss.a.y - this.y) / nearestLoss.d
        this.x -= dx * 0.9
        this.y -= dy * 0.9
      }

      // Try avoid getting too close to friends
      const nearestFriend = this.nearestOf(this.type)
      if (nearestFriend.a != null && nearestFriend.d > agentSize) {
        let dx = (nearestFriend.a.x - this.x) / nearestLoss.d
        let dy = (nearestFriend.a.y - this.y) / nearestLoss.d
        this.x -= dx * 1.1
        this.y -= dy * 1.1
      }

      // Dont go outside view
      if (this.x < agentSize) this.x = agentSize
      if (this.y < agentSize) this.y = agentSize
      if (this.x > p.width - agentSize) this.x = p.width - agentSize
      if (this.y > p.height - agentSize) this.y = p.height - agentSize

      // Jiggle a bit
      this.x += p.random(-0.5, 0.5)
      this.y += p.random(-0.5, 0.5)
    }

    nearestOf(type, win = false) {
      return agents
        .filter(a => a.type == type)
        .map(a => {
          if (!win) {
            return a
          }
          if (p.abs(this.x - a.x) < agentSize && p.abs(this.y - a.y) < agentSize) {
            // new type is this.type
            //this.makeSound(this.type)
            a.type = this.type
          }

          return a
        })
        .reduce((acc, a) => {
          const distance = p.sqrt(p.pow(this.x - a.x, 2) + p.pow(this.y - a.y, 2)) || 1
          if (distance < acc.d) {
            return {
              d: distance,
              a,
            }
          } else {
            return acc
          }
        }, { d: 9999, a: null })
    }

    draw() {
      p.push()
      p.translate(this.x, this.y)
      p.text(this.type, 0, 0)
      p.pop()
    }

    makeSound(newType) {
      let audio
      switch (newType) {
        case "🦆":
          audio = new Audio("sounds/quack.mp3")
          audio.play()
          break;
        case "🐐":
          audio = new Audio("sounds/bleat.mp3")
          audio.play()
          break;
        case "🐢":
          audio = new Audio("sounds/mating.mp3")
          audio.play()
          break;
      }
    }
  }
}

const app = new p5(sketch)
